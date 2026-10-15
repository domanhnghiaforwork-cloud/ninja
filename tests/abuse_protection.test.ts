import { describe, it, expect } from 'vitest';
import {
  validateInputFrame,
  verifyClientHandshake,
  PROTOCOL_VERSION,
  MAP_REVISION_M0,
  MAP_REVISION_M1
} from '../packages/shared/src/index.js';
import { AdmissionManager } from '../apps/server/src/admission/AdmissionManager.js';

describe('P8-02: Input & Admission Abuse Protection', () => {
  const admission = AdmissionManager.getInstance();

  it('rejects input with negative or excessive future tick', () => {
    const currentTick = 100;

    // Negative tick
    const resNegative = validateInputFrame({ tick: -5, dx: 0, dy: 0, buttons: 0 }, currentTick);
    expect(resNegative.valid).toBe(false);

    // Excessive future tick (> currentTick + 15)
    const resFuture = validateInputFrame({ tick: 150, dx: 0, dy: 0, buttons: 0 }, currentTick);
    expect(resFuture.valid).toBe(false);
  });

  it('sanitizes input and completely strips client-injected position, hp, and damage', () => {
    const maliciousInput = {
      tick: 50,
      dx: 1,
      dy: 0,
      aimAngle: 1.57,
      aimDirection: 'S',
      buttons: 1,
      // Client-injected exploit attempts
      x: 9999,
      y: 9999,
      hp: 1000000,
      damage: 99999,
      speed: 10000
    };

    const res = validateInputFrame(maliciousInput, 50);
    expect(res.valid).toBe(true);
    expect(res.sanitized).toBeDefined();

    const sanitized = res.sanitized!;
    expect((sanitized as any).x).toBeUndefined();
    expect((sanitized as any).y).toBeUndefined();
    expect((sanitized as any).hp).toBeUndefined();
    expect((sanitized as any).damage).toBeUndefined();
    expect((sanitized as any).speed).toBeUndefined();
  });

  it('masks illegal button bits exceeding button mask', () => {
    const res = validateInputFrame({ tick: 10, dx: 0, dy: 0, buttons: 0xffff }, 10);
    expect(res.valid).toBe(true);
    // Button mask should be clamped to 31 (0b11111)
    expect(res.sanitized?.buttons).toBe(31);
  });

  it('rejects handshake with incompatible protocol or unknown map revision', () => {
    // Protocol mismatch
    const badProto = verifyClientHandshake({ protocolVersion: 999, mapRevision: MAP_REVISION_M1 });
    expect(badProto.valid).toBe(false);

    // Map revision mismatch
    const badMap = verifyClientHandshake({ protocolVersion: PROTOCOL_VERSION, mapRevision: 'unknown_map' });
    expect(badMap.valid).toBe(false);

    // Valid handshake
    const goodM1 = verifyClientHandshake({ protocolVersion: PROTOCOL_VERSION, mapRevision: MAP_REVISION_M1 });
    expect(goodM1.valid).toBe(true);
  });

  it('enforces single-use admission tickets and prevents replay attacks', () => {
    const roomId = 'room_abuse_test';
    const code = 'ABUSETEST';
    admission.registerRoom(roomId, code);

    // Resolve room and issue ticket
    const resolveResult = admission.resolveInviteCode('127.0.0.1', code);
    expect('ticket' in resolveResult).toBe(true);
    const ticket = (resolveResult as any).ticket;

    // First use: Valid
    const firstUse = admission.validateAndConsumeTicket(roomId, ticket);
    expect(firstUse.valid).toBe(true);

    // Replay attack: Rejected!
    const replayUse = admission.validateAndConsumeTicket(roomId, ticket);
    expect(replayUse.valid).toBe(false);
  });
});
