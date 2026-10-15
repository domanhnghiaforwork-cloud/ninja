/**
 * Ninja Arena — Combat FSM, Skills, and Earliest-TOI Swept Collision
 * Pure TypeScript: Deterministic, fixed-tick, server-authoritative simulation.
 */

import {
  Direction8,
  Vector2D,
  RectAABB,
  MapObstacle,
  FighterId,
  ActionState,
  PlayerSimulationState,
  InputFrame,
  BUTTON_LIGHT,
  BUTTON_SKILL1,
  BUTTON_SKILL2,
  BUTTON_DODGE,
  BUTTON_GUARD,
  PLAYER_RADIUS,
  BASE_MOVE_SPEED,
  directionToVector,
  hasLineOfSight,
  resolveCircleObstacles
} from './index.js';

export interface SkillSpec {
  id: string;
  name: string;
  ownerId: FighterId;
  chakraCost: number;
  staminaCost: number;
  cooldownTicks: number;
  damage: number;
  type: 'decoy' | 'projectile' | 'projectile_aoe' | 'counter';
  speed: number;
  radius: number;
  maxDistance: number;
  lifetimeTicks: number;
  impactRadius?: number;
  frontArcDegrees?: number;
  counterRange?: number;
  timelineTicks: {
    startup: number;
    active: number;
    recovery: number;
  };
}

export const SKILL_ROSTER: Record<string, SkillSpec> = {
  fighter_a_clone_feint: {
    id: 'fighter_a_clone_feint',
    name: 'Clone Feint',
    ownerId: 'fighter_a',
    chakraCost: 25,
    staminaCost: 0,
    cooldownTicks: 300,
    damage: 0,
    type: 'decoy',
    speed: 0,
    radius: 22,
    maxDistance: 64,
    lifetimeTicks: 90, // 3s
    timelineTicks: { startup: 9, active: 1, recovery: 8 }
  },
  fighter_a_wind_shuriken: {
    id: 'fighter_a_wind_shuriken',
    name: 'Wind Shuriken',
    ownerId: 'fighter_a',
    chakraCost: 25,
    staminaCost: 0,
    cooldownTicks: 150,
    damage: 95,
    type: 'projectile',
    speed: 620,
    radius: 22,
    maxDistance: 540,
    lifetimeTicks: 30,
    timelineTicks: { startup: 10, active: 1, recovery: 12 }
  },
  fighter_b_fireball: {
    id: 'fighter_b_fireball',
    name: 'Fireball Jutsu',
    ownerId: 'fighter_b',
    chakraCost: 30,
    staminaCost: 0,
    cooldownTicks: 210,
    damage: 105,
    type: 'projectile_aoe',
    speed: 500,
    radius: 26,
    maxDistance: 600,
    lifetimeTicks: 40,
    impactRadius: 80,
    timelineTicks: { startup: 15, active: 1, recovery: 12 }
  },
  fighter_b_lightning_counter: {
    id: 'fighter_b_lightning_counter',
    name: 'Lightning Counter',
    ownerId: 'fighter_b',
    chakraCost: 25,
    staminaCost: 0,
    cooldownTicks: 240,
    damage: 125,
    type: 'counter',
    speed: 0,
    radius: 0,
    maxDistance: 180,
    lifetimeTicks: 25,
    frontArcDegrees: 120,
    counterRange: 180,
    timelineTicks: { startup: 4, active: 5, recovery: 16 }
  }
};

export const UNIVERSAL_COMBAT = {
  regen: {
    chakraPerTick: 5 / 30, // 5/s
    staminaPerTick: 10 / 30 // 10/s
  },
  guard: {
    frontArcDegrees: 120,
    damageFractionReceived: 0.25,
    staminaCostPerHit: 18,
    breakHitstunTicks: 20
  },
  parry: {
    windowTicks: 4,
    reentryCooldownTicks: 18,
    missRecoveryTicks: 8
  },
  dodge: {
    staminaCost: 25,
    moveTicks: 10,
    iframeEndOffset: 4,
    recoveryTicks: 8,
    speed: 650
  },
  light: {
    damage: 40,
    range: 70,
    frontArcDegrees: 90,
    startupTicks: 5,
    activeTicks: 2,
    recoveryTicks: 10,
    hitstunTicks: 8
  }
};

export interface ActiveProjectile {
  id: string;
  skillId: string;
  ownerId: string;
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  type: 'projectile' | 'projectile_aoe';
  impactRadius?: number;
  lifetimeTicks: number;
  hitTargetIds: string[];
}

export interface ActiveClone {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  facing: Direction8;
  hp: number; // Destroyed on 1 hit
  lifetimeTicks: number; // 90 ticks (3s)
}

export interface CombatEvent {
  type: 'hit' | 'parry' | 'guard' | 'guard_break' | 'dodge_evade' | 'counter_strike' | 'wall_impact' | 'clone_spawn' | 'clone_destroyed';
  tick: number;
  sourceId: string;
  targetId?: string;
  damage?: number;
  x: number;
  y: number;
}

/**
 * Check if attacker position (ax, ay) is in front of defender (dx, dy) with given facing and arcDegrees.
 */
export function isInFrontArc(
  dx: number, dy: number, facing: Direction8,
  ax: number, ay: number, arcDegrees: number
): boolean {
  const fVec = directionToVector(facing);
  const toAttackerX = ax - dx;
  const toAttackerY = ay - dy;
  const dist = Math.hypot(toAttackerX, toAttackerY);
  if (dist === 0) return true;

  const dot = (fVec.x * toAttackerX + fVec.y * toAttackerY) / dist;
  const minDot = Math.cos((arcDegrees / 2) * (Math.PI / 180));
  return dot >= minDot;
}

export interface TOIIntersection {
  t: number; // [0, 1]
  type: 'wall' | 'actor' | 'clone';
  targetId?: string;
  x: number;
  y: number;
}

/**
 * Ray-circle intersection helper. Returns earliest t in [0, 1] if any.
 */
export function rayCircleIntersection(
  x0: number, y0: number, x1: number, y1: number,
  cx: number, cy: number, cr: number
): number | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const fx = x0 - cx;
  const fy = y0 - cy;

  const a = dx * dx + dy * dy;
  if (a === 0) {
    return (fx * fx + fy * fy <= cr * cr) ? 0 : null;
  }

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - cr * cr;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) return null;

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  if (t1 >= 0 && t1 <= 1) return t1;
  if (t2 >= 0 && t2 <= 1) return t2;
  if (t1 < 0 && t2 > 0) return 0; // Already inside circle

  return null;
}

/**
 * Ray-AABB intersection helper. Returns earliest t in [0, 1] if any.
 */
export function rayAABBIntersection(
  x0: number, y0: number, x1: number, y1: number,
  box: RectAABB, expandRadius: number = 0
): number | null {
  let tMin = 0.0;
  let tMax = 1.0;

  const minX = box.x - expandRadius;
  const maxX = box.x + box.width + expandRadius;
  const minY = box.y - expandRadius;
  const maxY = box.y + box.height + expandRadius;

  const dx = x1 - x0;
  const dy = y1 - y0;

  // X axis
  if (Math.abs(dx) < 1e-8) {
    if (x0 < minX || x0 > maxX) return null;
  } else {
    let t1 = (minX - x0) / dx;
    let t2 = (maxX - x0) / dx;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }

  // Y axis
  if (Math.abs(dy) < 1e-8) {
    if (y0 < minY || y0 > maxY) return null;
  } else {
    let t1 = (minY - y0) / dy;
    let t2 = (maxY - y0) / dy;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }

  return tMin <= 1.0 && tMax >= 0.0 ? Math.max(0, tMin) : null;
}

/**
 * TC-11: Earliest-TOI Swept Intersection Resolver
 * Sweeps from (oldX, oldY) to (newX, newY).
 * Finds earliest collision against obstacles, players, or clones.
 */
export function findEarliestTOI(
  oldX: number, oldY: number, newX: number, newY: number,
  projRadius: number,
  obstacles: MapObstacle[],
  targets: { id: string; x: number; y: number; radius: number; isClone?: boolean }[]
): TOIIntersection | null {
  const intersections: TOIIntersection[] = [];

  // Check obstacles
  for (const obs of obstacles) {
    if (!obs.blocks_projectile) continue;
    const t = rayAABBIntersection(oldX, oldY, newX, newY, obs, projRadius);
    if (t !== null) {
      intersections.push({
        t,
        type: 'wall',
        x: oldX + (newX - oldX) * t,
        y: oldY + (newY - oldY) * t
      });
    }
  }

  // Check targets
  for (const tgt of targets) {
    const t = rayCircleIntersection(oldX, oldY, newX, newY, tgt.x, tgt.y, projRadius + tgt.radius);
    if (t !== null) {
      intersections.push({
        t,
        type: tgt.isClone ? 'clone' : 'actor',
        targetId: tgt.id,
        x: oldX + (newX - oldX) * t,
        y: oldY + (newY - oldY) * t
      });
    }
  }

  if (intersections.length === 0) return null;

  // Sort by earliest TOI (t ascending); on equal TOI, wall takes priority over actors
  intersections.sort((a, b) => {
    if (Math.abs(a.t - b.t) < 1e-4) {
      if (a.type === 'wall' && b.type !== 'wall') return -1;
      if (b.type === 'wall' && a.type !== 'wall') return 1;
    }
    return a.t - b.t;
  });

  return intersections[0];
}
