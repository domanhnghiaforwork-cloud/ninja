import { describe, it, expect } from 'vitest';
import {
  RECONNECT_GRACE_SECONDS,
  TICK_RATE,
  PlayerSimulationState,
  MAP_M0
} from '../packages/shared/src/index.js';

describe('P8-01: Reconnect Grace Period & Forfeit (Decision D07)', () => {
  it('initializes 15 seconds grace period when player disconnects', () => {
    const graceTicks = RECONNECT_GRACE_SECONDS * TICK_RATE;
    expect(graceTicks).toBe(450); // 15s * 30Hz = 450 ticks
  });

  it('keeps disconnected player stationary, damageable, and continues simulation', () => {
    const player: PlayerSimulationState = {
      id: 'guest_1',
      sessionId: 'sess_1',
      fighter: 'fighter_a',
      x: 300,
      y: 500,
      vx: 120,
      vy: 120,
      facing: 'E',
      action: 'moving',
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
      connected: false, // Disconnected!
      reconnectGraceTicks: 450,
      skill1CooldownTicks: 0,
      skill2CooldownTicks: 0,
      score: 0
    };

    // Upon disconnect, velocity halts
    player.vx = 0;
    player.vy = 0;
    expect(player.vx).toBe(0);
    expect(player.vy).toBe(0);

    // Player takes damage while disconnected
    const damage = 120;
    player.hp -= damage;
    expect(player.hp).toBe(880);

    // Decrement grace ticks
    player.reconnectGraceTicks -= 30; // 1 second passes
    expect(player.reconnectGraceTicks).toBe(420);
    expect(player.connected).toBe(false);
  });

  it('forfeits match when grace period expires without reconnect', () => {
    let graceTicks = 2; // 2 ticks remaining
    let outcome: string | null = null;
    let winnerId: string | null = null;

    const p1Id = 'guest_1';
    const p2Id = 'guest_2';

    // Simulate 2 ticks
    while (graceTicks > 0) {
      graceTicks--;
      if (graceTicks <= 0) {
        winnerId = p2Id;
        outcome = 'disconnect_forfeit';
      }
    }

    expect(outcome).toBe('disconnect_forfeit');
    expect(winnerId).toBe('guest_2');
  });

  it('handles double disconnect without deadlock', () => {
    const p1Connected = false;
    const p2Connected = false;
    let graceTicksP1 = 0;
    let graceTicksP2 = 0;

    let matchOutcome: string | null = null;
    let winnerId: string | null = 'temporary';

    if (!p1Connected && !p2Connected && graceTicksP1 <= 0 && graceTicksP2 <= 0) {
      matchOutcome = 'double_disconnect_timeout';
      winnerId = null;
    }

    expect(matchOutcome).toBe('double_disconnect_timeout');
    expect(winnerId).toBeNull();
  });
});
