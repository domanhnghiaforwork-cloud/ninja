/**
 * Ninja Arena — Shared Pure Simulation & Protocol Module
 * Pure TypeScript: No DOM, no Phaser, no Node runtime dependencies.
 */

export const PROTOCOL_VERSION = 1;
export const TICK_RATE = 30; // 30 ticks per second
export const TICK_DELTA_SEC = 1 / TICK_RATE;
export const PATCH_RATE = 20; // 20 state syncs per second
export const REMOTE_INTERPOLATION_MS = 100;
export const RECONNECT_GRACE_SECONDS = 15;
export const BATTLE_DURATION_SECONDS = 180;

export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 8;
export const TICKET_TTL_MS = 30 * 1000; // 30 seconds
export const ROOM_CODE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function generateInviteCode(): string {
  const chars = INVITE_CODE_ALPHABET;
  let result = '';
  const bytes = new Uint8Array(INVITE_CODE_LENGTH);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public allow(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const valid = timestamps.filter(t => now - t < this.windowMs);
    if (valid.length >= this.maxRequests) {
      return false;
    }
    valid.push(now);
    this.requests.set(key, valid);
    return true;
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter(t => now - t < this.windowMs);
      if (valid.length === 0) this.requests.delete(key);
      else this.requests.set(key, valid);
    }
  }
}

export type RoomPhase = 'waiting' | 'countdown' | 'playing' | 'finished';

export interface AdmissionTicket {
  ticket: string;
  roomId: string;
  guestId: string;
  expiresAt: number;
  consumed: boolean;
}

export interface ReconnectSecret {
  secret: string;
  roomId: string;
  guestId: string;
  expiresAt: number;
}

export interface DuelRoomState {
  roomId: string;
  inviteCode: string;
  phase: RoomPhase;
  countdownSeconds: number;
  roundTimerSeconds: number;
  serverTick: number;
  winnerId: string | null;
  finishReason: string | null;
  players: Record<string, PlayerSimulationState>;
}

export const MAP_PROTOTYPE_WIDTH = 1024;
export const MAP_PROTOTYPE_HEIGHT = 1024;
export const TILE_SIZE = 64;

export const PLAYER_RADIUS = 22;
export const BASE_MOVE_SPEED = 210; // units per second

export type Direction8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export const DIRECTIONS_8: readonly Direction8[] = [
  'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
] as const;

export interface Vector2D {
  x: number;
  y: number;
}

export interface RectAABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FighterId = 'fighter_a' | 'fighter_b';

export type ActionState =
  | 'idle'
  | 'moving'
  | 'startup'
  | 'active'
  | 'recovery'
  | 'guard'
  | 'parry'
  | 'dodge'
  | 'hitstun'
  | 'guard_break'
  | 'knockdown'
  | 'ko';

export interface InputFrame {
  tick: number;
  dx: number; // -1, 0, 1
  dy: number; // -1, 0, 1
  aimAngle: number; // radians (quantized to aim8)
  aimDirection: Direction8;
  buttons: number; // bitmask
}

export const BUTTON_LIGHT = 1 << 0;  // J
export const BUTTON_SKILL1 = 1 << 1; // K
export const BUTTON_SKILL2 = 1 << 2; // L
export const BUTTON_DODGE = 1 << 3;  // Space
export const BUTTON_GUARD = 1 << 4;  // Shift

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  chakraCost: number;
  lifetimeTicks: number;
  type: string;
}

export interface PlayerSimulationState {
  id: string;
  sessionId: string;
  fighter: FighterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: Direction8;
  action: ActionState;
  actionTicksRemaining: number;
  hp: number;
  maxHp: number;
  chakra: number;
  maxChakra: number;
  stamina: number;
  maxStamina: number;
  guardRemainingStamina: number;
  isGuarding: boolean;
  isParrying: boolean;
  connected: boolean;
  reconnectGraceTicks: number;
  skill1CooldownTicks: number;
  skill2CooldownTicks: number;
  score: number;
}

export interface MapObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  blocks_movement: boolean;
  blocks_projectile: boolean;
  blocks_los: boolean;
  occludes_visual: boolean;
}

export interface MapManifest {
  id: string;
  name: string;
  width: number;
  height: number;
  revision: string;
  spawns: {
    fighter_a: Vector2D;
    fighter_b: Vector2D;
  };
  obstacles: MapObstacle[];
}

export const MAP_M0: MapManifest = {
  id: 'map_m0',
  name: 'Training Grounds (M0)',
  width: MAP_PROTOTYPE_WIDTH,
  height: MAP_PROTOTYPE_HEIGHT,
  revision: 'm0-v1.0.0',
  spawns: {
    fighter_a: { x: 220, y: 512 },
    fighter_b: { x: 804, y: 512 }
  },
  obstacles: [
    {
      id: 'obs_tl_rock',
      x: 220,
      y: 180,
      width: 140,
      height: 100,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_tr_ruin',
      x: 664,
      y: 180,
      width: 140,
      height: 100,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_bl_pillar',
      x: 220,
      y: 744,
      width: 140,
      height: 100,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_br_shrine',
      x: 664,
      y: 744,
      width: 140,
      height: 100,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    }
  ]
};

export const MAP_VERTICAL_SLICE_WIDTH = 2048;
export const MAP_VERTICAL_SLICE_HEIGHT = 2048;
export const MAP_REVISION_M1 = 'm1-v1.0.0';

export const MAP_M1: MapManifest = {
  id: 'map_m1',
  name: 'Valley Arena (M1)',
  width: MAP_VERTICAL_SLICE_WIDTH,
  height: MAP_VERTICAL_SLICE_HEIGHT,
  revision: MAP_REVISION_M1,
  spawns: {
    fighter_a: { x: 320, y: 1024 },
    fighter_b: { x: 1728, y: 1024 }
  },
  obstacles: [
    {
      id: 'obs_center_shrine',
      x: 924,
      y: 874,
      width: 200,
      height: 300,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_north_pavilion',
      x: 924,
      y: 320,
      width: 200,
      height: 180,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_south_monument',
      x: 924,
      y: 1548,
      width: 200,
      height: 180,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_west_ruin_top',
      x: 520,
      y: 620,
      width: 160,
      height: 140,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_west_ruin_bot',
      x: 520,
      y: 1288,
      width: 160,
      height: 140,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_east_ruin_top',
      x: 1368,
      y: 620,
      width: 160,
      height: 140,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    },
    {
      id: 'obs_east_ruin_bot',
      x: 1368,
      y: 1288,
      width: 160,
      height: 140,
      blocks_movement: true,
      blocks_projectile: true,
      blocks_los: true,
      occludes_visual: true
    }
  ]
};

export function lineSegmentIntersectsAABB(
  x1: number, y1: number, x2: number, y2: number,
  box: RectAABB
): boolean {
  // Liang-Barsky line clipping algorithm
  let t0 = 0.0;
  let t1 = 1.0;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const p = [-dx, dx, -dy, dy];
  const q = [
    x1 - box.x,
    box.x + box.width - x1,
    y1 - box.y,
    box.y + box.height - y1
  ];

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false; // Parallel and outside
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }

  return t0 <= t1 && t0 < 1.0 && t1 > 0.0;
}

export function hasLineOfSight(
  fromX: number, fromY: number,
  toX: number, toY: number,
  obstacles: MapObstacle[]
): boolean {
  for (const obs of obstacles) {
    if (obs.blocks_los && lineSegmentIntersectsAABB(fromX, fromY, toX, toY, obs)) {
      return false;
    }
  }
  return true;
}

export function quantizeAimTo8(angleRad: number): Direction8 {
  // Normalize angle between 0 and 2PI
  let a = angleRad % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  // 8 sectors, each PI/4 (45 degrees) wide.
  // 0 is East, PI/2 is South (canvas Y down), PI is West, 3PI/2 is North
  const sector = Math.floor((a + Math.PI / 8) / (Math.PI / 4)) % 8;
  switch (sector) {
    case 0: return 'E';
    case 1: return 'SE';
    case 2: return 'S';
    case 3: return 'SW';
    case 4: return 'W';
    case 5: return 'NW';
    case 6: return 'N';
    case 7: return 'NE';
    default: return 'E';
  }
}

export function directionToVector(dir: Direction8): Vector2D {
  const INV_SQRT2 = 0.70710678;
  switch (dir) {
    case 'N':  return { x: 0, y: -1 };
    case 'NE': return { x: INV_SQRT2, y: -INV_SQRT2 };
    case 'E':  return { x: 1, y: 0 };
    case 'SE': return { x: INV_SQRT2, y: INV_SQRT2 };
    case 'S':  return { x: 0, y: 1 };
    case 'SW': return { x: -INV_SQRT2, y: INV_SQRT2 };
    case 'W':  return { x: -1, y: 0 };
    case 'NW': return { x: -INV_SQRT2, y: -INV_SQRT2 };
  }
}

export function checkCircleRectCollision(cx: number, cy: number, cr: number, rect: RectAABB): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (cr * cr);
}

export function resolveCircleObstacles(x: number, y: number, radius: number, obstacles: RectAABB[]): Vector2D {
  let resolvedX = x;
  let resolvedY = y;

  for (const obs of obstacles) {
    if (checkCircleRectCollision(resolvedX, resolvedY, radius, obs)) {
      const closestX = Math.max(obs.x, Math.min(resolvedX, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(resolvedY, obs.y + obs.height));
      const dx = resolvedX - closestX;
      const dy = resolvedY - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        // Center is inside obstacle - push out towards closest edge
        const leftDist = Math.abs(resolvedX - obs.x);
        const rightDist = Math.abs(resolvedX - (obs.x + obs.width));
        const topDist = Math.abs(resolvedY - obs.y);
        const bottomDist = Math.abs(resolvedY - (obs.y + obs.height));
        const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

        if (minDist === leftDist) resolvedX = obs.x - radius;
        else if (minDist === rightDist) resolvedX = obs.x + obs.width + radius;
        else if (minDist === topDist) resolvedY = obs.y - radius;
        else resolvedY = obs.y + obs.height + radius;
      } else {
        const overlap = radius - dist;
        resolvedX += (dx / dist) * overlap;
        resolvedY += (dy / dist) * overlap;
      }
    }
  }

  return { x: resolvedX, y: resolvedY };
}

export function stepMovement(
  player: PlayerSimulationState,
  input: InputFrame,
  dt: number,
  mapWidth: number,
  mapHeight: number,
  obstacles: RectAABB[] = []
): void {
  // If player is in hitstun, knockdown, ko, or parrying/startup, movement might be locked
  if (['hitstun', 'knockdown', 'ko', 'startup'].includes(player.action)) {
    player.vx = 0;
    player.vy = 0;
    return;
  }

  let dx = input.dx;
  let dy = input.dy;

  // Clamp input values
  if (dx !== 0 && dy !== 0) {
    const inv = 0.70710678;
    dx *= inv;
    dy *= inv;
  }

  let speedMultiplier = 1.0;
  if (player.action === 'guard') speedMultiplier = 0.4;
  if (player.action === 'dodge') speedMultiplier = 1.8;

  const speed = BASE_MOVE_SPEED * speedMultiplier;
  player.vx = dx * speed;
  player.vy = dy * speed;

  let nextX = player.x + player.vx * dt;
  let nextY = player.y + player.vy * dt;

  // Clamp to map boundaries
  nextX = Math.max(PLAYER_RADIUS, Math.min(mapWidth - PLAYER_RADIUS, nextX));
  nextY = Math.max(PLAYER_RADIUS, Math.min(mapHeight - PLAYER_RADIUS, nextY));

  // Resolve against obstacle collisions
  if (obstacles.length > 0) {
    const resolved = resolveCircleObstacles(nextX, nextY, PLAYER_RADIUS, obstacles);
    nextX = resolved.x;
    nextY = resolved.y;
  }

  player.x = Math.round(nextX * 100) / 100; // 2 decimal precision
  player.y = Math.round(nextY * 100) / 100;

  // Update facing
  if (input.aimDirection) {
    player.facing = input.aimDirection;
  } else if (input.dx !== 0 || input.dy !== 0) {
    if (input.dx > 0 && input.dy === 0) player.facing = 'E';
    else if (input.dx > 0 && input.dy > 0) player.facing = 'SE';
    else if (input.dx === 0 && input.dy > 0) player.facing = 'S';
    else if (input.dx < 0 && input.dy > 0) player.facing = 'SW';
    else if (input.dx < 0 && input.dy === 0) player.facing = 'W';
    else if (input.dx < 0 && input.dy < 0) player.facing = 'NW';
    else if (input.dx === 0 && input.dy < 0) player.facing = 'N';
    else if (input.dx > 0 && input.dy < 0) player.facing = 'NE';
  }
}

export const MAX_BUTTON_MASK = (1 << 5) - 1; // 31 (bits 0 to 4: LIGHT, SKILL1, SKILL2, DODGE, GUARD)

export interface ValidatedInputResult {
  valid: boolean;
  sanitized?: InputFrame;
  reason?: string;
}

/**
 * TC-06: Authoritative Input Validator
 * - Strips any client-injected position (x, y), hp, or damage fields.
 * - Rejects NaN, Infinity, non-integers in tick, invalid bitmasks, or excessive future ticks.
 * - Quantizes dx/dy to -1, 0, 1.
 */
export function validateInputFrame(
  raw: any,
  currentTick: number,
  maxFutureTicks: number = 30
): ValidatedInputResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, reason: 'Input must be a non-null object' };
  }

  const tick = Number(raw.tick);
  if (!Number.isInteger(tick) || tick < 0) {
    return { valid: false, reason: 'Invalid or negative tick' };
  }

  // Reject excessive future tick
  if (tick > currentTick + maxFutureTicks) {
    return { valid: false, reason: 'Tick too far in the future' };
  }

  // Validate dx and dy
  const dxRaw = Number(raw.dx);
  const dyRaw = Number(raw.dy);
  if (!Number.isFinite(dxRaw) || !Number.isFinite(dyRaw)) {
    return { valid: false, reason: 'dx and dy must be finite numbers' };
  }

  // Quantize dx and dy to -1, 0, 1
  const dx = dxRaw > 0.1 ? 1 : dxRaw < -0.1 ? -1 : 0;
  const dy = dyRaw > 0.1 ? 1 : dyRaw < -0.1 ? -1 : 0;

  // Validate aimAngle
  const aimAngleRaw = Number(raw.aimAngle);
  const aimAngle = Number.isFinite(aimAngleRaw) ? aimAngleRaw : 0;

  // Validate aimDirection
  let aimDirection: Direction8 = 'E';
  if (typeof raw.aimDirection === 'string' && (DIRECTIONS_8 as readonly string[]).includes(raw.aimDirection)) {
    aimDirection = raw.aimDirection as Direction8;
  } else {
    aimDirection = quantizeAimTo8(aimAngle);
  }

  // Validate buttons bitmask
  const buttonsRaw = Number(raw.buttons);
  if (!Number.isInteger(buttonsRaw) || buttonsRaw < 0 || !Number.isFinite(buttonsRaw)) {
    return { valid: false, reason: 'Invalid buttons bitmask' };
  }
  const buttons = buttonsRaw & MAX_BUTTON_MASK;

  return {
    valid: true,
    sanitized: {
      tick,
      dx,
      dy,
      aimAngle,
      aimDirection,
      buttons
    }
  };
}

export const PROTOCOL_HASH = 'proto-v1.0.0-sha256';
export const MAP_REVISION_M0 = 'm0-v1.0.0';
export const GAMEPLAY_CONFIG_HASH = 'cfg-v0.1.0-combat30hz';

export function verifyClientHandshake(clientHash: {
  protocolVersion: number;
  mapRevision: string;
}): { valid: boolean; error?: string } {
  if (clientHash.protocolVersion !== PROTOCOL_VERSION) {
    return {
      valid: false,
      error: `Protocol mismatch: client ${clientHash.protocolVersion} vs server ${PROTOCOL_VERSION}`
    };
  }
  if (clientHash.mapRevision !== MAP_REVISION_M0 && clientHash.mapRevision !== MAP_REVISION_M1) {
    return {
      valid: false,
      error: `Map revision mismatch: client ${clientHash.mapRevision} vs server [${MAP_REVISION_M0}, ${MAP_REVISION_M1}]`
    };
  }
  return { valid: true };
}

export interface RemoteSnapshot {
  tick: number;
  time: number;
  x: number;
  y: number;
  facing: Direction8;
  action: ActionState;
  hp: number;
}

export function interpolateRemotePosition(
  snapshots: RemoteSnapshot[],
  renderTime: number
): { x: number; y: number; facing: Direction8; action: ActionState; hp: number } | null {
  if (snapshots.length === 0) return null;
  if (snapshots.length === 1 || renderTime <= snapshots[0].time) {
    const s = snapshots[0];
    return { x: s.x, y: s.y, facing: s.facing, action: s.action, hp: s.hp };
  }

  const latest = snapshots[snapshots.length - 1];
  if (renderTime >= latest.time) {
    return { x: latest.x, y: latest.y, facing: latest.facing, action: latest.action, hp: latest.hp };
  }

  // Find two surrounding snapshots
  for (let i = 0; i < snapshots.length - 1; i++) {
    const s0 = snapshots[i];
    const s1 = snapshots[i + 1];
    if (renderTime >= s0.time && renderTime <= s1.time) {
      const span = s1.time - s0.time;
      const t = span > 0 ? (renderTime - s0.time) / span : 0;
      return {
        x: s0.x + (s1.x - s0.x) * t,
        y: s0.y + (s1.y - s0.y) * t,
        facing: s1.facing,
        action: s1.action,
        hp: s1.hp
      };
    }
  }

  return { x: latest.x, y: latest.y, facing: latest.facing, action: latest.action, hp: latest.hp };
}

export * from './combat.js';
