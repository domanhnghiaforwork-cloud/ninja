import { describe, it, expect } from 'vitest';
import {
  quantizeAimTo8,
  directionToVector,
  checkCircleRectCollision,
  resolveCircleObstacles,
  stepMovement,
  PlayerSimulationState,
  InputFrame,
  MAP_PROTOTYPE_WIDTH,
  MAP_PROTOTYPE_HEIGHT,
  PLAYER_RADIUS
} from '@ninja/shared';

describe('Shared Pure Simulation Contracts', () => {
  it('quantizes aim angles accurately to 8 sectors', () => {
    // 0 rad -> East
    expect(quantizeAimTo8(0)).toBe('E');
    // PI/2 rad -> South (canvas Y down)
    expect(quantizeAimTo8(Math.PI / 2)).toBe('S');
    // PI rad -> West
    expect(quantizeAimTo8(Math.PI)).toBe('W');
    // 3PI/2 rad -> North
    expect(quantizeAimTo8((3 * Math.PI) / 2)).toBe('N');
    // PI/4 -> SE
    expect(quantizeAimTo8(Math.PI / 4)).toBe('SE');
  });

  it('provides normalized vectors for all 8 directions', () => {
    const cardinal = directionToVector('N');
    expect(cardinal.x).toBe(0);
    expect(cardinal.y).toBe(-1);

    const diagonal = directionToVector('NE');
    const length = Math.hypot(diagonal.x, diagonal.y);
    expect(Math.abs(length - 1.0)).toBeLessThan(0.001);
  });

  it('detects circle and AABB intersection', () => {
    const obstacle = { x: 100, y: 100, width: 64, height: 64 };
    // Inside obstacle
    expect(checkCircleRectCollision(120, 120, 20, obstacle)).toBe(true);
    // Touching obstacle edge
    expect(checkCircleRectCollision(100 - 10, 120, 15, obstacle)).toBe(true);
    // Far away
    expect(checkCircleRectCollision(300, 300, 20, obstacle)).toBe(false);
  });

  it('resolves circle position out of colliding obstacle', () => {
    const obstacle = { x: 100, y: 100, width: 64, height: 64 };
    const radius = 20;
    // Position overlapping left edge: x = 95, so overlap by 15px
    const resolved = resolveCircleObstacles(95, 120, radius, [obstacle]);
    expect(resolved.x).toBeLessThanOrEqual(100 - radius + 0.01);
  });

  it('clamps player within map boundaries during movement', () => {
    const player: PlayerSimulationState = {
      id: 'p1',
      sessionId: 's1',
      fighter: 'fighter_a',
      x: 30,
      y: 30,
      vx: 0,
      vy: 0,
      facing: 'W',
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

    const input: InputFrame = {
      tick: 1,
      dx: -1,
      dy: -1,
      aimAngle: 0,
      aimDirection: 'NW',
      buttons: 0
    };

    // Move left and up for 1 second (well past 0,0)
    stepMovement(player, input, 1.0, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT);

    // Player x and y must be clamped to at least PLAYER_RADIUS
    expect(player.x).toBeGreaterThanOrEqual(PLAYER_RADIUS);
    expect(player.y).toBeGreaterThanOrEqual(PLAYER_RADIUS);
  });

  it('normalizes diagonal speed so diagonal movement is not faster', () => {
    const makePlayer = (): PlayerSimulationState => ({
      id: 'p1', sessionId: 's1', fighter: 'fighter_a',
      x: 500, y: 500, vx: 0, vy: 0, facing: 'E', action: 'idle',
      actionTicksRemaining: 0, hp: 1000, maxHp: 1000, chakra: 100, maxChakra: 100,
      stamina: 100, maxStamina: 100, guardRemainingStamina: 100, isGuarding: false,
      isParrying: false, connected: true, reconnectGraceTicks: 0,
      skill1CooldownTicks: 0, skill2CooldownTicks: 0, score: 0
    });

    const cardinalPlayer = makePlayer();
    stepMovement(cardinalPlayer, { tick: 1, dx: 1, dy: 0, aimAngle: 0, aimDirection: 'E', buttons: 0 }, 1.0, 1024, 1024);
    const cardinalDist = cardinalPlayer.x - 500;

    const diagonalPlayer = makePlayer();
    stepMovement(diagonalPlayer, { tick: 1, dx: 1, dy: 1, aimAngle: 0, aimDirection: 'SE', buttons: 0 }, 1.0, 1024, 1024);
    const diagonalDist = Math.hypot(diagonalPlayer.x - 500, diagonalPlayer.y - 500);

    // Diagonal distance moved in 1 second must equal cardinal distance moved in 1 second
    expect(Math.abs(diagonalDist - cardinalDist)).toBeLessThan(1.0);
  });

  it('blocks line of sight through hard cover obstacles in M0', () => {
    const { MAP_M0, hasLineOfSight } = require('@ninja/shared');
    // Top-left obstacle is at x: 220, y: 180, w: 140, h: 100 (x: 220..360, y: 180..280)
    // Point A on left of obstacle: (150, 230), Point B on right of obstacle: (420, 230)
    expect(hasLineOfSight(150, 230, 420, 230, MAP_M0.obstacles)).toBe(false);

    // Clear line of sight between spawns (220, 512) and (804, 512)
    expect(hasLineOfSight(220, 512, 804, 512, MAP_M0.obstacles)).toBe(true);
  });

  it('guarantees deterministic replay for 30 ticks', () => {
    const makePlayer = (): PlayerSimulationState => ({
      id: 'p1', sessionId: 's1', fighter: 'fighter_a',
      x: 220, y: 512, vx: 0, vy: 0, facing: 'E', action: 'idle',
      actionTicksRemaining: 0, hp: 1000, maxHp: 1000, chakra: 100, maxChakra: 100,
      stamina: 100, maxStamina: 100, guardRemainingStamina: 100, isGuarding: false,
      isParrying: false, connected: true, reconnectGraceTicks: 0,
      skill1CooldownTicks: 0, skill2CooldownTicks: 0, score: 0
    });

    const inputs: InputFrame[] = Array.from({ length: 30 }, (_, i) => ({
      tick: i,
      dx: i < 15 ? 1 : 0,
      dy: i >= 10 ? 1 : 0,
      aimAngle: 0.5,
      aimDirection: 'SE',
      buttons: 0
    }));

    const run1 = makePlayer();
    for (const inp of inputs) stepMovement(run1, inp, 1 / 30, 1024, 1024);

    const run2 = makePlayer();
    for (const inp of inputs) stepMovement(run2, inp, 1 / 30, 1024, 1024);

    expect(run1.x).toBe(run2.x);
    expect(run1.y).toBe(run2.y);
    expect(run1.facing).toBe(run2.facing);
  });
});
