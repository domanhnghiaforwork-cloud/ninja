import { Client, Room } from 'colyseus.js';
import { DuelRoomState } from '@ninja/shared';

export class NetworkClient {
  private static instance: NetworkClient;
  private client: Client;
  public room: Room<DuelRoomState> | null = null;
  public guestId = '';
  public reconnectSecret = '';
  public assignedFighter: 'fighter_a' | 'fighter_b' = 'fighter_a';

  private constructor() {
    const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'ws://localhost:2567'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    this.client = new Client(serverUrl);
  }

  public static getInstance(): NetworkClient {
    if (!NetworkClient.instance) {
      NetworkClient.instance = new NetworkClient();
    }
    return NetworkClient.instance;
  }

  public async createRoom(): Promise<{ roomId: string; inviteCode: string; ticket: string; guestId: string }> {
    const res = await fetch('http://localhost:2567/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create room');
    }
    return res.json();
  }

  public async resolveCode(code: string): Promise<{ roomId: string; ticket: string; guestId: string }> {
    const res = await fetch('http://localhost:2567/api/rooms/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to resolve code');
    }
    return res.json();
  }

  public async joinRoom(roomId: string, ticket: string, guestId: string): Promise<Room<DuelRoomState>> {
    this.guestId = guestId;
    this.room = await this.client.joinById<DuelRoomState>(roomId, {
      ticket,
      guestId
    });

    this.room.onMessage('admission_confirmed', (msg: { guestId: string; reconnectSecret: string; assignedFighter: 'fighter_a' | 'fighter_b' }) => {
      this.reconnectSecret = msg.reconnectSecret;
      this.assignedFighter = msg.assignedFighter;
    });

    return this.room;
  }

  public leaveRoom(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }
}
