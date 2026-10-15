import { describe, it, expect } from 'vitest';
import { SlidingWindowRateLimiter, generateInviteCode, INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from '@ninja/shared';
import { AdmissionManager } from '../apps/server/src/admission/AdmissionManager';

describe('Network & Admission Protocol Tests (TC-04)', () => {
  it('generates 8-character CSPRNG invite codes from unambiguous alphabet', () => {
    const code = generateInviteCode();
    expect(code.length).toBe(INVITE_CODE_LENGTH);
    for (const char of code) {
      expect(INVITE_CODE_ALPHABET.includes(char)).toBe(true);
    }
  });

  it('rejects direct join without admission ticket', () => {
    const admission = AdmissionManager.getInstance();
    const result = admission.validateAndConsumeTicket('room_123', '');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Admission ticket required');
  });

  it('consumes admission ticket strictly once (single-use token)', () => {
    const admission = AdmissionManager.getInstance();
    const roomId = 'room_abc';
    const guestId = 'guest_1';

    const ticket = admission.issueAdmissionTicket(roomId, guestId);
    expect(ticket).toBeTruthy();

    // First use: must succeed
    const firstUse = admission.validateAndConsumeTicket(roomId, ticket);
    expect(firstUse.valid).toBe(true);
    expect(firstUse.guestId).toBe(guestId);

    // Second use: must fail!
    const secondUse = admission.validateAndConsumeTicket(roomId, ticket);
    expect(secondUse.valid).toBe(false);
  });

  it('rejects tickets presented for a different room', () => {
    const admission = AdmissionManager.getInstance();
    const ticket = admission.issueAdmissionTicket('room_alpha', 'guest_2');

    const result = admission.validateAndConsumeTicket('room_beta', ticket);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('bound to another room');
  });

  it('enforces sliding-window rate limit on room creation (max 5/min)', () => {
    const limiter = new SlidingWindowRateLimiter(5, 60 * 1000);
    const testIp = '192.168.1.100';

    for (let i = 0; i < 5; i++) {
      expect(limiter.allow(testIp)).toBe(true);
    }
    // 6th request within window must be rejected
    expect(limiter.allow(testIp)).toBe(false);
  });

  it('validates ephemeral reconnect secrets distinct from invite codes', () => {
    const admission = AdmissionManager.getInstance();
    const roomId = 'room_xyz';
    const guestId = 'guest_reconnect';

    const secret = admission.issueReconnectSecret(roomId, guestId);
    expect(secret).toBeTruthy();
    expect(secret.length).toBeGreaterThan(16);

    // Correct secret succeeds
    expect(admission.validateReconnectSecret(roomId, guestId, secret)).toBe(true);

    // Wrong secret fails
    expect(admission.validateReconnectSecret(roomId, guestId, 'fake_secret')).toBe(false);
  });
});
