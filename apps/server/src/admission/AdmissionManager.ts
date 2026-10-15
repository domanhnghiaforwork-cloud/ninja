import crypto from 'crypto';
import {
  generateInviteCode,
  SlidingWindowRateLimiter,
  AdmissionTicket,
  ReconnectSecret,
  TICKET_TTL_MS,
  ROOM_CODE_TTL_MS
} from '@ninja/shared';

export interface RoomRegistryEntry {
  roomId: string;
  inviteCode: string;
  createdAt: number;
  expiresAt: number;
  playerCount: number;
}

export class AdmissionManager {
  private static instance: AdmissionManager;

  // Rate limiters
  public createRateLimiter = new SlidingWindowRateLimiter(5, 60 * 1000);   // 5 creates/min
  public resolveRateLimiter = new SlidingWindowRateLimiter(20, 60 * 1000); // 20 resolves/min

  // Registries
  private codeToRoom: Map<string, RoomRegistryEntry> = new Map();
  private roomToEntry: Map<string, RoomRegistryEntry> = new Map();
  private tickets: Map<string, AdmissionTicket> = new Map();
  private reconnectSecrets: Map<string, ReconnectSecret> = new Map();

  private constructor() {
    // Periodic cleanup of expired entries
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  public static getInstance(): AdmissionManager {
    if (!AdmissionManager.instance) {
      AdmissionManager.instance = new AdmissionManager();
    }
    return AdmissionManager.instance;
  }

  public registerRoom(roomId: string, inviteCode: string): void {
    const now = Date.now();
    const entry: RoomRegistryEntry = {
      roomId,
      inviteCode,
      createdAt: now,
      expiresAt: now + ROOM_CODE_TTL_MS,
      playerCount: 0
    };
    this.codeToRoom.set(inviteCode.toUpperCase(), entry);
    this.roomToEntry.set(roomId, entry);
  }

  public unregisterRoom(roomId: string): void {
    const entry = this.roomToEntry.get(roomId);
    if (entry) {
      this.codeToRoom.delete(entry.inviteCode);
      this.roomToEntry.delete(roomId);
    }
    // Clean up tickets and secrets for this room
    for (const [token, ticket] of this.tickets.entries()) {
      if (ticket.roomId === roomId) this.tickets.delete(token);
    }
    for (const [key, secret] of this.reconnectSecrets.entries()) {
      if (secret.roomId === roomId) this.reconnectSecrets.delete(key);
    }
  }

  public issueAdmissionTicket(roomId: string, guestId: string): string {
    const token = crypto.randomBytes(24).toString('hex');
    const ticket: AdmissionTicket = {
      ticket: token,
      roomId,
      guestId,
      expiresAt: Date.now() + TICKET_TTL_MS,
      consumed: false
    };
    this.tickets.set(token, ticket);
    return token;
  }

  public validateAndConsumeTicket(roomId: string, token: string): { valid: boolean; guestId?: string; error?: string } {
    if (!token) {
      return { valid: false, error: 'Admission ticket required' };
    }

    const ticket = this.tickets.get(token);
    if (!ticket) {
      return { valid: false, error: 'Invalid admission ticket' };
    }

    if (ticket.roomId !== roomId) {
      return { valid: false, error: 'Ticket is bound to another room' };
    }

    if (ticket.consumed) {
      return { valid: false, error: 'Ticket has already been consumed' };
    }

    if (Date.now() > ticket.expiresAt) {
      this.tickets.delete(token);
      return { valid: false, error: 'Admission ticket expired' };
    }

    // Single use: consume immediately!
    ticket.consumed = true;
    this.tickets.delete(token);

    return { valid: true, guestId: ticket.guestId };
  }

  public resolveInviteCode(clientIp: string, rawCode: string): { roomId: string; ticket: string; guestId: string } | { error: string } {
    if (!this.resolveRateLimiter.allow(clientIp)) {
      return { error: 'Rate limit exceeded: too many resolve requests' };
    }

    const code = rawCode.trim().toUpperCase();
    const entry = this.codeToRoom.get(code);

    if (!entry) {
      return { error: 'Room invite code not found' };
    }

    if (Date.now() > entry.expiresAt) {
      this.unregisterRoom(entry.roomId);
      return { error: 'Room invite code expired' };
    }

    const guestId = `guest_${crypto.randomBytes(6).toString('hex')}`;
    const ticket = this.issueAdmissionTicket(entry.roomId, guestId);

    return {
      roomId: entry.roomId,
      ticket,
      guestId
    };
  }

  public issueReconnectSecret(roomId: string, guestId: string): string {
    const secret = crypto.randomBytes(32).toString('hex');
    const key = `${roomId}:${guestId}`;
    this.reconnectSecrets.set(key, {
      secret,
      roomId,
      guestId,
      expiresAt: Date.now() + 60 * 60 * 1000
    });
    return secret;
  }

  public validateReconnectSecret(roomId: string, guestId: string, secret: string): boolean {
    const key = `${roomId}:${guestId}`;
    const entry = this.reconnectSecrets.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.reconnectSecrets.delete(key);
      return false;
    }
    return entry.secret === secret;
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [code, entry] of this.codeToRoom.entries()) {
      if (now > entry.expiresAt) {
        this.codeToRoom.delete(code);
        this.roomToEntry.delete(entry.roomId);
      }
    }
    for (const [token, ticket] of this.tickets.entries()) {
      if (now > ticket.expiresAt || ticket.consumed) {
        this.tickets.delete(token);
      }
    }
    this.createRateLimiter.cleanup();
    this.resolveRateLimiter.cleanup();
  }
}
