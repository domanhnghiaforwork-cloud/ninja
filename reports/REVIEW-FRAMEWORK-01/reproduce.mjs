// Read-only diagnostic harness. Calls the actual room handlers/simulation, no network host.
// Run after npm ci and an attempted shared build has emitted JS:
// node --import tsx reports/REVIEW-FRAMEWORK-01/reproduce.mjs
import { DuelRoom } from '../../apps/server/src/rooms/DuelRoom.ts';
import { AdmissionManager } from '../../apps/server/src/admission/AdmissionManager.ts';
import { BUTTON_LIGHT, BUTTON_SKILL2, PROTOCOL_VERSION, MAP_REVISION_M1, verifyClientHandshake } from '../../packages/shared/src/index.ts';

let sequence = 0;
let failures = 0;
function expectContract(name, expected, actual) {
  const pass = JSON.stringify(expected) === JSON.stringify(actual);
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}\n  expected=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`);
}

function fixture() {
  const room = new DuelRoom();
  room.roomId = `review_${++sequence}`;
  room.__init();
  const handlers = new Map();
  room.onMessage = (name, handler) => handlers.set(name, handler);
  room.broadcast = () => {};
  room.setSimulationInterval = () => {};
  room.setPatchRate = () => {};
  room.onCreate({ inviteCode: `REVIEW${sequence}` });
  const client = (sessionId) => ({ sessionId, send() {}, leave() {} });
  const a = client(`a_${sequence}`);
  const b = client(`b_${sequence}`);
  room.onJoin(a, { guestId: `guest_a_${sequence}` });
  room.onJoin(b, { guestId: `guest_b_${sequence}` });
  room.state.phase = 'playing';
  const p = room.state.players[a.sessionId];
  const q = room.state.players[b.sessionId];
  p.x = 300; p.y = 512; p.facing = 'E';
  q.x = 350; q.y = 512; q.facing = 'W';
  return { room, handlers, a, b, p, q, client };
}

try {
  {
    const { room } = fixture();
    expectContract('Room state has an active state serializer', true, room._serializer.id !== 'none');
    console.log(`  serializer.id=${room._serializer.id}; fullState=${room._serializer.getFullState()}`);
  }
  {
    const { room, handlers, a, q } = fixture();
    for (let tick = 1; tick <= 3; tick++) {
      handlers.get('input')(a, { tick, dx: 0, dy: 0, aimAngle: 0, aimDirection: 'E', buttons: BUTTON_LIGHT });
      room.simulationStep(1 / 30);
    }
    expectContract('Light has 5 startup ticks before any damage', 1000, q.hp);
  }
  {
    const { room, handlers, a, q } = fixture();
    q.x = 800; // Keep target away so an immediate projectile cannot disappear on impact.
    handlers.get('input')(a, { tick: 1, dx: 0, dy: 0, aimAngle: 0, aimDirection: 'E', buttons: BUTTON_SKILL2 });
    room.simulationStep(1 / 30);
    expectContract('Wind projectile waits 10 startup ticks', 0, room.projectiles.length);
  }
  {
    const { room, p, q } = fixture();
    p.x = 365; p.y = 512;
    q.x = 300; q.y = 512; q.facing = 'E';
    room.castFighterBFireball(q);
    room.stepServerProjectiles(1 / 30);
    expectContract('One fireball direct impact produces one 105-damage packet per target', 105, 1000 - p.hp);
  }
  {
    const { room, a, p, q } = fixture();
    p.isParrying = true; p.action = 'parry';
    room.parryWindowTicks.set(a.sessionId, 4);
    room.onLeave(a, 1006);
    for (let i = 0; i < 30; i++) room.simulationStep(1 / 30);
    room.applyDamageToTarget(p, q, 95, true, q.x, q.y);
    expectContract('Disconnected fighter cannot freeze a 4-tick parry for 30 ticks', 905, p.hp);
  }
  {
    const { room, b, q, client } = fixture();
    q.hp = 123;
    room.onLeave(b, 1006);
    const reconnecting = client('replacement_session');
    const manager = AdmissionManager.getInstance();
    const secret = manager.issueReconnectSecret(room.roomId, q.id);
    const options = { isReconnect: true, guestId: q.id, secret };
    room.onAuth(reconnecting, options);
    room.onJoin(reconnecting, options);
    expectContract('Reconnect preserves exactly two fighter entities', 2, Object.keys(room.state.players).length);
    expectContract('Reconnect preserves existing 123 HP', 123, room.state.players[reconnecting.sessionId].hp);
  }
  {
    const { room, a, client } = fixture();
    const manager = AdmissionManager.getInstance();
    const ticket = manager.issueAdmissionTicket(room.roomId, 'server_bound_guest');
    const options = { ticket, guestId: 'client_chosen_identity' };
    const joining = client('identity_probe');
    room.onAuth(joining, options);
    room.onJoin(joining, options);
    expectContract('Guest identity comes from validated ticket rather than client options', 'server_bound_guest', room.state.players[joining.sessionId].id);
  }
  {
    const { room, handlers } = fixture();
    room.state.phase = 'finished';
    handlers.get('rematch')({ sessionId: 'one_player_only' });
    expectContract('One rematch request cannot reset the finished round', 'finished', room.state.phase);
  }
  {
    const result = verifyClientHandshake({ protocolVersion: PROTOCOL_VERSION, mapRevision: MAP_REVISION_M1 });
    expectContract('Server running M0 rejects M1 client map revision', false, result.valid);
  }
  console.log(`\nContract violations reproduced: ${failures}`);
  process.exit(failures ? 1 : 0);
} catch (error) {
  console.error(error);
  process.exit(2);
}
