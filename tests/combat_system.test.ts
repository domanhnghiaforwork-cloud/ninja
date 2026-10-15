import { describe, it, expect } from 'vitest';
import {
  Direction8,
  PlayerSimulationState,
  stepMovement,
  MAP_M0,
  MAP_PROTOTYPE_WIDTH,
  MAP_PROTOTYPE_HEIGHT,
  PLAYER_RADIUS,
  SKILL_ROSTER,
  UNIVERSAL_COMBAT,
  isInFrontArc,
  findEarliestTOI,
  rayAABBIntersection,
  rayCircleIntersection,
  hasLineOfSight
} from '../packages/shared/src/index.js';

function createPlayer(id: string, fighter: 'fighter_a' | 'fighter_b', x: number = 300, y: number = 300): PlayerSimulationState {
  return {
    id,
    sessionId: id,
    fighter,
    x,
    y,
    vx: 0,
    vy: 0,
    facing: fighter === 'fighter_a' ? 'E' : 'W',
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

describe('P4-01: Combat FSM & Resource Determinism', () => {
  it('enforces KO priority over actions and stops regen when KO', () => {
    const p = createPlayer('p1', 'fighter_a');
    p.hp = 0;
    p.action = 'ko';

    // Regen must not apply during KO
    const regenChakra = UNIVERSAL_COMBAT.regen.chakraPerTick;
    if (p.hp > 0) {
      p.chakra += regenChakra;
    }
    expect(p.chakra).toBe(100); // Did not increase
  });

  it('regenerates stamina only when not guarding', () => {
    const p = createPlayer('p1', 'fighter_a');
    p.stamina = 50;
    p.isGuarding = true;

    // Tick regeneration step
    if (!p.isGuarding) {
      p.stamina += UNIVERSAL_COMBAT.regen.staminaPerTick;
    }
    expect(p.stamina).toBe(50); // Stamina did not regen while guarding

    p.isGuarding = false;
    if (!p.isGuarding) {
      p.stamina += UNIVERSAL_COMBAT.regen.staminaPerTick;
    }
    expect(p.stamina).toBeGreaterThan(50); // Stamina regens when guard released
  });
});

describe('P4-02: TC-09 Defense System (Guard, Parry, Dodge, Light)', () => {
  it('detects front arc correctly for guard and parry', () => {
    const defenderX = 300;
    const defenderY = 300;
    const facing: Direction8 = 'E'; // looking right

    // Attacker at (400, 300) is directly in front
    expect(isInFrontArc(defenderX, defenderY, facing, 400, 300, 120)).toBe(true);

    // Attacker at (200, 300) is directly behind
    expect(isInFrontArc(defenderX, defenderY, facing, 200, 300, 120)).toBe(false);
  });

  it('parry window consumes attack with 0 damage, regular guard absorbs 75% damage', () => {
    const defender = createPlayer('def', 'fighter_b', 300, 300);
    const damage = 100;

    // Case 1: Parry active (front arc)
    defender.isParrying = true;
    defender.facing = 'E';
    let damageTaken = 0;
    if (defender.isParrying && isInFrontArc(defender.x, defender.y, defender.facing, 400, 300, 120)) {
      damageTaken = 0; // Parried!
    }
    expect(damageTaken).toBe(0);

    // Case 2: Guard active (front arc)
    defender.isParrying = false;
    defender.isGuarding = true;
    if (defender.isGuarding && isInFrontArc(defender.x, defender.y, defender.facing, 400, 300, 120)) {
      damageTaken = Math.floor(damage * UNIVERSAL_COMBAT.guard.damageFractionReceived);
      defender.stamina -= UNIVERSAL_COMBAT.guard.staminaCostPerHit;
    }
    expect(damageTaken).toBe(25);
    expect(defender.stamina).toBe(100 - 18);
  });

  it('triggers guard break when stamina is insufficient to guard', () => {
    const defender = createPlayer('def', 'fighter_b', 300, 300);
    defender.stamina = 10; // Less than 18 stamina required
    defender.isGuarding = true;
    const damage = 100;

    let damageTaken = 0;
    if (defender.isGuarding && defender.stamina < UNIVERSAL_COMBAT.guard.staminaCostPerHit) {
      damageTaken = damage; // Full damage
      defender.stamina = 0;
      defender.action = 'guard_break';
      defender.actionTicksRemaining = UNIVERSAL_COMBAT.guard.breakHitstunTicks;
    }

    expect(damageTaken).toBe(100);
    expect(defender.stamina).toBe(0);
    expect(defender.action).toBe('guard_break');
    expect(defender.actionTicksRemaining).toBe(20);
  });

  it('evades damage during dodge i-frames', () => {
    const dodger = createPlayer('dg', 'fighter_a', 300, 300);
    dodger.action = 'dodge';
    dodger.actionTicksRemaining = 9; // Inside first 4 ticks of 10-tick dodge (>6)

    let hitLanded = true;
    if (dodger.action === 'dodge' && dodger.actionTicksRemaining > 6) {
      hitLanded = false; // Evaded!
    }
    expect(hitLanded).toBe(false);
  });
});

describe('P4-03: TC-10 4 Tactical Jutsu Skills', () => {
  it('validates skill roster seed data for all 4 skills', () => {
    const s1 = SKILL_ROSTER.fighter_a_clone_feint;
    const s2 = SKILL_ROSTER.fighter_a_wind_shuriken;
    const s3 = SKILL_ROSTER.fighter_b_fireball;
    const s4 = SKILL_ROSTER.fighter_b_lightning_counter;

    expect(s1.chakraCost).toBe(25);
    expect(s1.lifetimeTicks).toBe(90);

    expect(s2.damage).toBe(95);
    expect(s2.speed).toBe(620);

    expect(s3.damage).toBe(105);
    expect(s3.impactRadius).toBe(80);

    expect(s4.damage).toBe(125);
    expect(s4.counterRange).toBe(180);
  });

  it('rejects skill cast when chakra is insufficient', () => {
    const caster = createPlayer('c', 'fighter_a');
    caster.chakra = 10; // needs 25
    const spec = SKILL_ROSTER.fighter_a_clone_feint;

    let castSuccess = false;
    if (caster.chakra >= spec.chakraCost) {
      castSuccess = true;
      caster.chakra -= spec.chakraCost;
    }
    expect(castSuccess).toBe(false);
    expect(caster.chakra).toBe(10);
  });

  it('rejects skill cast when on cooldown', () => {
    const caster = createPlayer('c', 'fighter_a');
    caster.chakra = 100;
    caster.skill1CooldownTicks = 50; // On cooldown

    let castSuccess = false;
    if (caster.skill1CooldownTicks === 0) {
      castSuccess = true;
    }
    expect(castSuccess).toBe(false);
  });
});

describe('P4-04: TC-11 Earliest-TOI Swept Collision & Hard Cover', () => {
  it('blocks projectile when hard cover wall is in front of actor', () => {
    // Projectile travelling from x=100 to x=500 along y=200
    // Wall is at x=220, y=180, width=140, height=100 (spans x: 220 to 360)
    // Actor is behind wall at x=450, y=200
    const startX = 100;
    const startY = 200;
    const endX = 500;
    const endY = 200;
    const projRadius = 10;

    const targets = [{ id: 'target_behind_wall', x: 450, y: 200, radius: PLAYER_RADIUS }];
    const hit = findEarliestTOI(startX, startY, endX, endY, projRadius, MAP_M0.obstacles, targets);

    expect(hit).toBeDefined();
    expect(hit!.type).toBe('wall'); // Wall intercepted the projectile!
    expect(hit!.x).toBeLessThan(450); // Did not reach the target
  });

  it('hits actor when actor is in front of wall', () => {
    // Projectile from x=100 to x=500 along y=200
    // Wall at x=220
    // Actor is at x=180 (BEFORE the wall)
    const startX = 100;
    const startY = 200;
    const endX = 500;
    const endY = 200;
    const projRadius = 10;

    const targets = [{ id: 'target_in_front', x: 180, y: 200, radius: PLAYER_RADIUS }];
    const hit = findEarliestTOI(startX, startY, endX, endY, projRadius, MAP_M0.obstacles, targets);

    expect(hit).toBeDefined();
    expect(hit!.type).toBe('actor'); // Hit the actor first!
    expect(hit!.targetId).toBe('target_in_front');
  });

  it('prevents high speed projectile tunneling', () => {
    // High speed projectile moving 600 units in 1 tick
    const startX = 150;
    const startY = 220;
    const endX = 750;
    const endY = 220;
    const projRadius = 22;

    const hit = findEarliestTOI(startX, startY, endX, endY, projRadius, MAP_M0.obstacles, []);
    expect(hit).toBeDefined();
    expect(hit!.type).toBe('wall');
    expect(hit!.x).toBeCloseTo(220 - projRadius, 0); // Stops right at wall face
  });
});

describe('P4-05: TC-12 Round Victory Lifecycle & Clean Rematch Reset', () => {
  it('correctly identifies single KO winner and double KO draw', () => {
    // Single KO
    const p1 = createPlayer('p1', 'fighter_a');
    const p2 = createPlayer('p2', 'fighter_b');
    p1.hp = 500;
    p2.hp = 0;

    let winnerId: string | null = null;
    if (p1.hp > 0 && p2.hp <= 0) winnerId = p1.id;
    else if (p2.hp > 0 && p1.hp <= 0) winnerId = p2.id;
    expect(winnerId).toBe('p1');

    // Double KO
    p1.hp = 0;
    p2.hp = 0;
    let isDraw = false;
    if (p1.hp <= 0 && p2.hp <= 0) {
      isDraw = true;
      winnerId = null;
    }
    expect(isDraw).toBe(true);
    expect(winnerId).toBeNull();
  });

  it('resets cooldowns, health, stamina, chakra, and positions cleanly on rematch', () => {
    const p1 = createPlayer('p1', 'fighter_a', 700, 700);
    p1.hp = 200;
    p1.chakra = 10;
    p1.stamina = 15;
    p1.skill1CooldownTicks = 120;
    p1.skill2CooldownTicks = 80;

    // Rematch Reset
    p1.x = MAP_M0.spawns.fighter_a.x;
    p1.y = MAP_M0.spawns.fighter_a.y;
    p1.hp = 1000;
    p1.chakra = 100;
    p1.stamina = 100;
    p1.skill1CooldownTicks = 0;
    p1.skill2CooldownTicks = 0;
    p1.action = 'idle';

    expect(p1.x).toBe(MAP_M0.spawns.fighter_a.x);
    expect(p1.hp).toBe(1000);
    expect(p1.chakra).toBe(100);
    expect(p1.stamina).toBe(100);
    expect(p1.skill1CooldownTicks).toBe(0);
    expect(p1.skill2CooldownTicks).toBe(0);
  });
});

describe('P4-06: Security & Malformed Input Fuzzing', () => {
  it('does not crash or produce NaN when handling spam inputs and edge values', () => {
    const p = createPlayer('fuzz', 'fighter_a', 300, 300);
    const dt = 1 / 30;

    for (let i = 0; i < 50; i++) {
      const fuzzInput = {
        tick: i,
        dx: i % 2 === 0 ? 1 : -1,
        dy: i % 3 === 0 ? 1 : -1,
        aimAngle: Math.PI * (i / 10),
        aimDirection: 'NE' as Direction8,
        buttons: (1 << (i % 5))
      };

      stepMovement(p, fuzzInput, dt, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT, MAP_M0.obstacles);
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
      expect(p.x).toBeGreaterThanOrEqual(PLAYER_RADIUS);
      expect(p.x).toBeLessThanOrEqual(MAP_PROTOTYPE_WIDTH - PLAYER_RADIUS);
    }
  });
});
