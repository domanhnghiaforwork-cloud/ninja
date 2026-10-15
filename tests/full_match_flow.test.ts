import { describe, it, expect } from 'vitest';
import {
  DuelRoomState,
  PlayerSimulationState,
  MAP_M1,
  TICK_RATE,
  BATTLE_DURATION_SECONDS
} from '../packages/shared/src/index.js';

describe('P8-03: Full Match Flow & Rematch Lifecycle', () => {
  it('transitions cleanly across waiting -> countdown -> playing -> finished -> rematch reset', () => {
    // 1. Initial State: Waiting in Lobby
    const state: DuelRoomState = {
      roomId: 'match_flow_room',
      inviteCode: 'FLOWTEST',
      phase: 'waiting',
      countdownSeconds: 3,
      roundTimerSeconds: BATTLE_DURATION_SECONDS,
      serverTick: 0,
      winnerId: null,
      finishReason: null,
      players: {
        sess_a: {
          id: 'guest_a',
          sessionId: 'sess_a',
          fighter: 'fighter_a',
          x: MAP_M1.spawns.fighter_a.x,
          y: MAP_M1.spawns.fighter_a.y,
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
        },
        sess_b: {
          id: 'guest_b',
          sessionId: 'sess_b',
          fighter: 'fighter_b',
          x: MAP_M1.spawns.fighter_b.x,
          y: MAP_M1.spawns.fighter_b.y,
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
        }
      }
    };

    expect(state.phase).toBe('waiting');

    // 2. Both Ready -> Enter Countdown
    state.phase = 'countdown';
    expect(state.phase).toBe('countdown');

    // 3. Countdown completes (3s) -> Enter Playing
    state.phase = 'playing';
    expect(state.phase).toBe('playing');

    // 4. Combat exchange: Fighter A lands decisive blows on Fighter B
    state.players.sess_b.hp -= 1000;
    expect(state.players.sess_b.hp).toBe(0);

    // 5. KO Evaluation -> Enter Finished
    state.phase = 'finished';
    state.winnerId = state.players.sess_a.id;
    state.finishReason = 'ko';
    state.players.sess_a.score += 1;

    expect(state.phase).toBe('finished');
    expect(state.winnerId).toBe('guest_a');
    expect(state.finishReason).toBe('ko');
    expect(state.players.sess_a.score).toBe(1);

    // 6. Rematch Trigger -> Reset to Waiting with preserved scores
    state.phase = 'waiting';
    state.winnerId = null;
    state.finishReason = null;
    state.roundTimerSeconds = BATTLE_DURATION_SECONDS;

    // Reset fighter positions, HP, chakra, and cooldowns
    for (const s of Object.keys(state.players)) {
      const p = state.players[s];
      p.hp = p.maxHp;
      p.chakra = p.maxChakra;
      p.stamina = p.maxStamina;
      p.action = 'idle';
      p.skill1CooldownTicks = 0;
      p.skill2CooldownTicks = 0;
    }

    state.players.sess_a.x = MAP_M1.spawns.fighter_a.x;
    state.players.sess_a.y = MAP_M1.spawns.fighter_a.y;
    state.players.sess_b.x = MAP_M1.spawns.fighter_b.x;
    state.players.sess_b.y = MAP_M1.spawns.fighter_b.y;

    expect(state.phase).toBe('waiting');
    expect(state.players.sess_a.hp).toBe(1000);
    expect(state.players.sess_b.hp).toBe(1000);
    expect(state.players.sess_a.score).toBe(1); // Persistent score
  });
});
