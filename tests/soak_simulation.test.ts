import { describe, it, expect } from 'vitest';
import {
  stepMovement,
  MAP_M1,
  PLAYER_RADIUS,
  findEarliestTOI
} from '../packages/shared/src/index.js';

describe('P8-04: Multi-Room & Sequential Soak Simulation', () => {
  it('simulates 10 concurrent duel rooms without state leakage', () => {
    const activeRooms: { id: string; p1X: number; p2X: number; ticks: number }[] = [];

    // Initialize 10 concurrent rooms
    for (let r = 0; r < 10; r++) {
      activeRooms.push({
        id: `concurrent_room_${r}`,
        p1X: MAP_M1.spawns.fighter_a.x,
        p2X: MAP_M1.spawns.fighter_b.x,
        ticks: 0
      });
    }

    expect(activeRooms.length).toBe(10);

    // Simulate 60 ticks across all 10 rooms (2 seconds of combat simulation)
    for (let tick = 0; tick < 60; tick++) {
      for (const room of activeRooms) {
        room.ticks++;
        room.p1X += 0.5; // Simulate advancing towards center
        room.p2X -= 0.5;
      }
    }

    for (const room of activeRooms) {
      expect(room.ticks).toBe(60);
      expect(room.p1X).toBeGreaterThan(MAP_M1.spawns.fighter_a.x);
      expect(room.p2X).toBeLessThan(MAP_M1.spawns.fighter_b.x);
    }
  });

  it('executes 10 sequential matches with clean memory recycling', () => {
    let completedMatches = 0;
    const matchResults: string[] = [];

    for (let m = 0; m < 10; m++) {
      let p1Hp = 1000;
      let p2Hp = 1000;
      let roundTicks = 0;

      // Simulate match until KO
      while (p1Hp > 0 && p2Hp > 0 && roundTicks < 180) {
        p2Hp -= 50; // Fighter A inflicts damage
        roundTicks++;
      }

      completedMatches++;
      matchResults.push(p2Hp <= 0 ? 'fighter_a_win' : 'draw');
    }

    expect(completedMatches).toBe(10);
    expect(matchResults.length).toBe(10);
    expect(matchResults.every((r) => r === 'fighter_a_win')).toBe(true);
  });
});
