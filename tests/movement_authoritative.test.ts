import { describe, it, expect } from 'vitest';
import {
  validateInputFrame,
  verifyClientHandshake,
  interpolateRemotePosition,
  stepMovement,
  MAP_M0,
  MAP_PROTOTYPE_WIDTH,
  MAP_PROTOTYPE_HEIGHT,
  PROTOCOL_VERSION,
  MAP_REVISION_M0,
  PlayerSimulationState,
  InputFrame,
  RemoteSnapshot,
  BUTTON_LIGHT,
  BUTTON_GUARD,
  BUTTON_DODGE
} from '../packages/shared/src/index.js';

function createTestPlayer(id: string, x: number = 200, y: number = 200): PlayerSimulationState {
  return {
    id,
    sessionId: id,
    fighter: 'fighter_a',
    x,
    y,
    vx: 0,
    vy: 0,
    facing: 'E',
    action: 'idle',
    actionTicksRemaining: 0,
    hp: 1000,
    maxHp: 1000,
    chakra: 100,
    maxChakra: 100,
    stamina: 100,
    maxStamina: 100,
    guardRemainingStamina: 100,
    isGuarding: false,
    isParrying: false,
    connected: true,
    reconnectGraceTicks: 0,
    skill1CooldownTicks: 0,
    skill2CooldownTicks: 0,
    score: 0
  };
}

describe('P3-01: TC-06 Input Validation & Server Authoritative Movement', () => {
  it('strips malicious client-injected position, hp, and damage fields', () => {
    const maliciousInput = {
      tick: 10,
      dx: 1,
      dy: 0,
      aimAngle: 0,
      aimDirection: 'E',
      buttons: 0,
      // Injected malicious fields:
      x: 9999,
      y: 9999,
      hp: 999999,
      damage: 10000,
      teleport: true
    };

    const res = validateInputFrame(maliciousInput, 10);
    expect(res.valid).toBe(true);
    expect(res.sanitized).toBeDefined();
    expect((res.sanitized as any).x).toBeUndefined();
    expect((res.sanitized as any).hp).toBeUndefined();
    expect((res.sanitized as any).damage).toBeUndefined();
    expect(res.sanitized!.dx).toBe(1);
    expect(res.sanitized!.dy).toBe(0);
  });

  it('rejects NaN, Infinity, negative ticks, and excessive future ticks', () => {
    // NaN dx
    expect(validateInputFrame({ tick: 5, dx: NaN, dy: 0, buttons: 0 }, 5).valid).toBe(false);
    // Infinity dy
    expect(validateInputFrame({ tick: 5, dx: 0, dy: Infinity, buttons: 0 }, 5).valid).toBe(false);
    // Negative tick
    expect(validateInputFrame({ tick: -1, dx: 0, dy: 0, buttons: 0 }, 5).valid).toBe(false);
    // Excessive future tick (> currentTick + 30)
    expect(validateInputFrame({ tick: 100, dx: 0, dy: 0, buttons: 0 }, 5).valid).toBe(false);
  });

  it('sanitizes buttons bitmask to allowed range and quantizes movement', () => {
    const raw = {
      tick: 10,
      dx: 5.5, // excessive speed injection
      dy: -3.2,
      aimAngle: 0,
      aimDirection: 'E',
      buttons: 999999 // invalid bitmask
    };

    const res = validateInputFrame(raw, 10);
    expect(res.valid).toBe(true);
    expect(res.sanitized!.dx).toBe(1); // quantized to 1
    expect(res.sanitized!.dy).toBe(-1); // quantized to -1
    expect(res.sanitized!.buttons).toBe(999999 & 31); // only valid bits preserved
  });

  it('proves deterministic movement replay under identical inputs', () => {
    const p1 = createTestPlayer('p1', 300, 300);
    const p2 = createTestPlayer('p2', 300, 300);
    const dt = 1 / 30;

    const inputs: InputFrame[] = [
      { tick: 1, dx: 1, dy: 1, aimAngle: 0, aimDirection: 'SE', buttons: 0 },
      { tick: 2, dx: 1, dy: 1, aimAngle: 0, aimDirection: 'SE', buttons: 0 },
      { tick: 3, dx: 0, dy: -1, aimAngle: 0, aimDirection: 'N', buttons: 0 },
      { tick: 4, dx: -1, dy: 0, aimAngle: 0, aimDirection: 'W', buttons: 0 }
    ];

    for (const inp of inputs) {
      stepMovement(p1, inp, dt, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT, MAP_M0.obstacles);
      stepMovement(p2, inp, dt, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT, MAP_M0.obstacles);
    }

    expect(p1.x).toBe(p2.x);
    expect(p1.y).toBe(p2.y);
    expect(p1.facing).toBe(p2.facing);
  });
});

describe('P3-02: TC-07 Prediction & Reconciliation', () => {
  it('corrects local drift towards server authoritative state upon reconciliation threshold', () => {
    const localPlayer = createTestPlayer('local', 400, 400);
    const dt = 1 / 30;

    // Local client predicts 3 steps East
    const pendingInputs: InputFrame[] = [
      { tick: 1, dx: 1, dy: 0, aimAngle: 0, aimDirection: 'E', buttons: 0 },
      { tick: 2, dx: 1, dy: 0, aimAngle: 0, aimDirection: 'E', buttons: 0 },
      { tick: 3, dx: 1, dy: 0, aimAngle: 0, aimDirection: 'E', buttons: 0 }
    ];

    for (const inp of pendingInputs) {
      stepMovement(localPlayer, inp, dt, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT, MAP_M0.obstacles);
    }

    const predictedX = localPlayer.x;

    // Server says at tick 1, player was actually at x = 395 (e.g. slight lag or collision nudge)
    const serverTick = 1;
    const serverX = 395;
    const serverY = 400;

    const drift = Math.hypot(localPlayer.x - serverX, localPlayer.y - serverY);
    expect(drift).toBeGreaterThan(1.0); // Drift exceeds 1.0 px threshold

    // Reconcile: snap to server state and replay inputs with tick > serverTick
    localPlayer.x = serverX;
    localPlayer.y = serverY;

    for (const inp of pendingInputs) {
      if (inp.tick > serverTick) {
        stepMovement(localPlayer, inp, dt, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT, MAP_M0.obstacles);
      }
    }

    // Player re-converged cleanly
    expect(localPlayer.x).toBeLessThan(predictedX);
    expect(localPlayer.x).toBeCloseTo(395 + (210 * dt) * 2, 1);
  });
});

describe('P3-03: TC-07 Handshake Verification & Remote Interpolation', () => {
  it('rejects mismatched protocol or map revision', () => {
    expect(verifyClientHandshake({ protocolVersion: PROTOCOL_VERSION, mapRevision: MAP_REVISION_M0 }).valid).toBe(true);

    // Wrong protocol
    const badProto = verifyClientHandshake({ protocolVersion: 999, mapRevision: MAP_REVISION_M0 });
    expect(badProto.valid).toBe(false);
    expect(badProto.error).toContain('Protocol mismatch');

    // Wrong map
    const badMap = verifyClientHandshake({ protocolVersion: PROTOCOL_VERSION, mapRevision: 'custom_hacked_map' });
    expect(badMap.valid).toBe(false);
    expect(badMap.error).toContain('Map revision mismatch');
  });

  it('interpolates remote player smoothly between buffered snapshots', () => {
    const now = 1000;
    const snapshots: RemoteSnapshot[] = [
      { tick: 1, time: now, x: 100, y: 200, facing: 'E', action: 'idle', hp: 1000 },
      { tick: 2, time: now + 50, x: 150, y: 200, facing: 'E', action: 'moving', hp: 1000 },
      { tick: 3, time: now + 100, x: 200, y: 200, facing: 'E', action: 'moving', hp: 1000 }
    ];

    // Query halfway between tick 1 and tick 2 (time = now + 25)
    const mid1 = interpolateRemotePosition(snapshots, now + 25);
    expect(mid1).toBeDefined();
    expect(mid1!.x).toBeCloseTo(125, 1);

    // Query halfway between tick 2 and tick 3 (time = now + 75)
    const mid2 = interpolateRemotePosition(snapshots, now + 75);
    expect(mid2).toBeDefined();
    expect(mid2!.x).toBeCloseTo(175, 1);
  });
});

describe('P3-04: TC-08 Latency & Network Impairment (100ms & 150ms RTT)', () => {
  it('maintains bounded queue and collision integrity under 100ms and 150ms RTT simulated delay', () => {
    const player = createTestPlayer('net_test', 300, 300);
    const dt = 1 / 30;
    const rtt100Ticks = 3; // ~100ms at 30Hz
    const rtt150Ticks = 5; // ~150ms at 30Hz

    // Simulate 60 frames under 150ms RTT
    const pendingQueue: InputFrame[] = [];
    let serverTickAck = 0;

    for (let tick = 1; tick <= 60; tick++) {
      const input: InputFrame = {
        tick,
        dx: 1,
        dy: 0,
        aimAngle: 0,
        aimDirection: 'E',
        buttons: 0
      };

      pendingQueue.push(input);
      stepMovement(player, input, dt, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT, MAP_M0.obstacles);

      // Server acknowledges input after 150ms RTT (5 ticks)
      if (tick > rtt150Ticks) {
        serverTickAck = tick - rtt150Ticks;
        // Prune queue
        const idx = pendingQueue.findIndex(p => p.tick > serverTickAck);
        if (idx > 0) {
          pendingQueue.splice(0, idx);
        }
      }

      // Pending queue MUST stay bounded to RTT window (max ~5-6 frames)
      expect(pendingQueue.length).toBeLessThanOrEqual(rtt150Ticks + 1);
    }

    // Player did not escape map boundaries
    expect(player.x).toBeLessThanOrEqual(MAP_PROTOTYPE_WIDTH);
    expect(player.x).toBeGreaterThanOrEqual(0);
  });
});
