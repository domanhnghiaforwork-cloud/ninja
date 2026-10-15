import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { PROTOCOL_VERSION, TICK_RATE, BATTLE_DURATION_SECONDS, generateInviteCode } from '@ninja/shared';
import { AdmissionManager } from './admission/AdmissionManager.js';
import { DuelRoom } from './rooms/DuelRoom.js';

const app = express();
app.use(cors());
app.use(express.json());

const admission = AdmissionManager.getInstance();

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    game: 'Ninja Arena',
    protocolVersion: PROTOCOL_VERSION,
    tickRate: TICK_RATE,
    battleDuration: BATTLE_DURATION_SECONDS
  });
});

// Endpoint: Create Private Room with 8-character CSPRNG code
app.post('/api/rooms/create', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  if (!admission.createRateLimiter.allow(clientIp)) {
    res.status(429).json({ error: 'Rate limit exceeded: too many room creation requests' });
    return;
  }

  try {
    const inviteCode = generateInviteCode();
    // Create room via matchMaker
    const room = await matchMaker.createRoom('duel_room', { inviteCode });
    const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
    const ticket = admission.issueAdmissionTicket(room.roomId, guestId);

    res.json({
      roomId: room.roomId,
      inviteCode,
      ticket,
      guestId
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create room' });
  }
});

// Endpoint: Resolve invite code to get roomId and short-lived admission ticket
app.post('/api/rooms/resolve', (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { code } = req.body || {};

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Invite code required' });
    return;
  }

  const result = admission.resolveInviteCode(clientIp, code);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json(result);
});

const port = Number(process.env.PORT || 2567);
const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  })
});

// Define private duel room
gameServer.define('duel_room', DuelRoom).filterBy(['inviteCode']);

server.listen(port, () => {
  console.log(`[Ninja Arena Server] Listening on http://localhost:${port}`);
  console.log(`[Ninja Arena Server] Protocol v${PROTOCOL_VERSION}, TickRate: ${TICK_RATE}Hz`);
});

export { gameServer, app, server, admission };
