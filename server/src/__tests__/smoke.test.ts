import { createServer, type Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  createSession,
  sendInput,
  closeSession,
  cleanupAll,
} from '../sessions.js';

/**
 * Wait for a WebSocket message matching a predicate.
 * Rejects after `timeout` ms.
 */
function waitForMessage(
  ws: WebSocket,
  predicate: (msg: Record<string, unknown>) => boolean,
  timeout = 5000,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeListener('message', handler);
      reject(new Error('waitForMessage timed out'));
    }, timeout);

    function handler(raw: Buffer | string) {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf-8'));
      } catch {
        return;
      }
      if (predicate(msg)) {
        clearTimeout(timer);
        ws.removeListener('message', handler);
        resolve(msg);
      }
    }

    ws.on('message', handler);
  });
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

describe('server smoke test', () => {
  let server: Server;
  let wss: WebSocketServer;
  let port: number;

  beforeAll(
    () =>
      new Promise<void>((resolve) => {
        server = createServer((_req, res) => {
          res.writeHead(200);
          res.end('ok');
        });
        wss = new WebSocketServer({ server });

        wss.on('connection', (ws) => {
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
                createSession(ws, id, (msg.shell as string) || 'bash', (msg.cwd as string) || '/tmp');
                break;
              case 'session.input':
                sendInput(id, (msg.data as string) || '');
                break;
              case 'session.close':
                closeSession(id);
                break;
            }
          });
        });

        server.listen(0, () => {
          port = (server.address() as { port: number }).port;
          resolve();
        });
      }),
  );

  afterAll(() => {
    cleanupAll();
    wss.close();
    server.close();
  });

  it(
    'creates a session, sends input, receives output, and closes',
    async () => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      await new Promise<void>((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
      });

      const sessionId = 'smoke-test-1';

      // Create session
      ws.send(JSON.stringify({ type: 'session.create', id: sessionId, shell: 'bash', cwd: '/tmp' }));

      // Give shell time to initialize (prompt may not produce a complete line)
      await delay(500);

      // Send `echo hello`
      ws.send(JSON.stringify({ type: 'session.input', id: sessionId, data: 'echo hello\n' }));

      // Wait for output containing "hello" (data is now a batched string[])
      const output = await waitForMessage(
        ws,
        (msg) =>
          msg.type === 'session.output' &&
          msg.id === sessionId &&
          Array.isArray(msg.data) &&
          (msg.data as string[]).some((line: string) => line.includes('hello')),
      );

      expect((output.data as string[]).some((line: string) => line.includes('hello'))).toBe(true);

      // Close session
      ws.send(JSON.stringify({ type: 'session.close', id: sessionId }));

      ws.close();
    },
    10000,
  );
});
