import { createServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  createSession,
  sendInput,
  clearSession,
  resizeSession,
  closeSession,
  cleanupAll,
} from './sessions.js';

const PORT = Number(process.env.PORT) || 3001;

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('[ws] client connected');

  ws.on('message', (raw: Buffer | string) => {
    let msg: { type: string; id?: string; [key: string]: unknown };
    try {
      msg = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf-8'));
    } catch {
      return;
    }

    const id = msg.id as string | undefined;
    if (!id) return;

    switch (msg.type) {
      case 'session.create':
        createSession(
          ws,
          id,
          (msg.shell as string) || 'bash',
          (msg.cwd as string) || process.env.HOME || '/',
          msg.cols as number | undefined,
          msg.rows as number | undefined,
        );
        break;
      case 'session.input':
        sendInput(id, (msg.data as string) || '');
        break;
      case 'session.clear':
        clearSession(id);
        break;
      case 'session.resize':
        resizeSession(
          id,
          (msg.cols as number) || 80,
          (msg.rows as number) || 24,
        );
        break;
      case 'session.close':
        closeSession(id);
        break;
    }
  });

  ws.on('close', () => {
    console.log('[ws] client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
});

process.on('SIGINT', () => {
  cleanupAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupAll();
  process.exit(0);
});
