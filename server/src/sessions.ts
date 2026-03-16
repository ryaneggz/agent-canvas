import type { WebSocket } from 'ws';
import * as pty from 'node-pty';

// Find the safe flush boundary in a partial line — don't split incomplete ANSI escapes.
// Returns the number of chars safe to flush (0 to str.length).
function safeFlushLen(str: string): number {
  const lastEsc = str.lastIndexOf('\x1b');
  if (lastEsc === -1) return str.length;

  const tail = str.slice(lastEsc);
  // Complete CSI: \x1b[ <params> <letter>
  if (/^\x1b\[[\x20-\x3f]*[0-9;]*[\x20-\x3f]*[A-Za-z@`]/.test(tail)) return str.length;
  // Complete OSC: \x1b] ... (BEL or ST)
  if (/^\x1b\].*?(\x07|\x1b\\)/.test(tail)) return str.length;
  // Simple two-char escapes: \x1b followed by (, ), 7, 8, >, =, space
  if (/^\x1b[()78>= ]/.test(tail) && tail.length >= 2) return str.length;

  // Incomplete escape — flush only up to it
  return lastEsc;
}

// Strip ANSI escape sequences (for CR visual-width calculations only)
const ANSI_STRIP_RE =
  /\x1b(?:\[[\x20-\x3f]*[0-9;]*[\x20-\x3f]*[A-Za-z@`]|\].*?(?:\x07|\x1b\\)|\([0-9A-Za-z]|[78>= ])/g;

// CSI sequence regex for parsing (matches \x1b[ ... <letter>)
const CSI_RE = /^\x1b\[([?\x20-\x2f]*[0-9;]*[A-Za-z@`])/;

// Process terminal control characters: CR, BS, and CSI erase/cursor sequences.
// Handles ANSI in a single pass: color SGR codes are stripped, but erase/cursor
// commands (K, P, C, D) are interpreted for correct buffer state.
// Lines without control chars or escapes that need processing pass through unchanged.
function processLine(str: string): string {
  // Strip trailing \r from standard \r\n line endings — NOT a content-overwriting CR.
  if (str.endsWith('\r')) str = str.slice(0, -1);

  // Only process through cursor simulation when there are actual editing control chars
  // in the middle of the line. Lines with only ANSI color codes pass through unchanged.
  if (!str.includes('\r') && !str.includes('\x08')) return str;

  const buf: string[] = [];
  let cursor = 0;
  let i = 0;

  while (i < str.length) {
    const ch = str[i];

    if (ch === '\x1b' && str[i + 1] === '[') {
      // Parse CSI sequence
      const tail = str.slice(i);
      const m = CSI_RE.exec(tail);
      if (m) {
        const seq = m[1];
        const cmd = seq[seq.length - 1];
        // Extract numeric param (default 1 for most, 0 for K)
        const paramStr = seq.slice(0, -1).replace(/[?\x20-\x2f]/g, '');
        const param = paramStr ? parseInt(paramStr, 10) : undefined;

        if (cmd === 'K') {
          // Erase in line: 0 (default) = cursor to end, 1 = start to cursor, 2 = whole line
          const mode = param ?? 0;
          if (mode === 0) {
            buf.length = cursor; // truncate from cursor
          } else if (mode === 1) {
            for (let j = 0; j < cursor; j++) buf[j] = ' ';
          } else if (mode === 2) {
            buf.length = 0;
            cursor = 0;
          }
        } else if (cmd === 'P') {
          // Delete characters at cursor
          const n = param ?? 1;
          buf.splice(cursor, n);
        } else if (cmd === 'C') {
          // Cursor forward
          cursor = Math.min(cursor + (param ?? 1), buf.length);
        } else if (cmd === 'D') {
          // Cursor backward
          cursor = Math.max(0, cursor - (param ?? 1));
        }
        // All other CSI (colors, etc.) — skip/strip

        i += m[0].length;
        continue;
      }
      // Non-CSI escape (OSC, etc.) — skip
      i++;
      continue;
    }

    if (ch === '\x1b') {
      // OSC sequence: \x1b] ... \x07 or \x1b\\
      if (str[i + 1] === ']') {
        let j = i + 2;
        while (j < str.length) {
          if (str[j] === '\x07') { j++; break; }
          if (str[j] === '\x1b' && str[j + 1] === '\\') { j += 2; break; }
          j++;
        }
        i = j;
        continue;
      }
      // Other escape sequences (charset, save/restore) — skip ESC + next char
      i += 2;
      continue;
    }

    if (ch === '\r') {
      cursor = 0;
      i++;
      continue;
    }

    if (ch === '\x08') {
      if (cursor > 0) cursor--;
      i++;
      continue;
    }

    // Skip other control chars (< 0x20) except printable
    if (ch.charCodeAt(0) < 0x20) {
      i++;
      continue;
    }

    // Printable character
    if (cursor < buf.length) {
      buf[cursor] = ch;
    } else {
      buf.push(ch);
    }
    cursor++;
    i++;
  }

  // Trim trailing spaces
  let end = buf.length;
  while (end > 0 && buf[end - 1] === ' ') end--;
  return buf.slice(0, end).join('');
}

interface PtySession {
  pty: pty.IPty;
  ws: WebSocket;
  id: string;
  lines: string[];
  partial: string;
  partialSent: boolean;
  outputBuffer: string[];
  removeCount: number; // Lines to remove from client before appending
  flushTimer: ReturnType<typeof setTimeout> | null;
  partialTimer: ReturnType<typeof setTimeout> | null;
}

const sessions = new Map<string, PtySession>();

const MAX_LINES = 1000;
const FLUSH_MS = 16;
const FLUSH_MAX = 50;
const PARTIAL_FLUSH_MS = 50; // Flush partial lines (e.g. shell prompts) after 50ms of silence

function flushOutput(session: PtySession): void {
  if (session.flushTimer) {
    clearTimeout(session.flushTimer);
    session.flushTimer = null;
  }
  if (session.outputBuffer.length === 0 && session.removeCount === 0) return;
  const lines = session.outputBuffer;
  const remove = session.removeCount;
  session.outputBuffer = [];
  session.removeCount = 0;
  const msg: Record<string, unknown> = { type: 'session.output', id: session.id, data: lines };
  if (remove > 0) msg.remove = remove;
  sendMessage(session.ws, msg);
  // Complete lines replace the partial display — clear it
  if (session.partialSent) {
    session.partialSent = false;
    // Send empty partial to clear the client's partial display
    sendMessage(session.ws, { type: 'session.partial', id: session.id, data: '' });
  }
}

export function createSession(
  ws: WebSocket,
  id: string,
  shell: string,
  cwd: string,
  cols?: number,
  rows?: number,
): void {
  if (sessions.has(id)) {
    sendMessage(ws, { type: 'session.error', id, error: 'Session already exists' });
    return;
  }

  const resolvedCwd = cwd.startsWith('~')
    ? cwd.replace('~', process.env.HOME || '/root')
    : cwd;

  let term: pty.IPty;
  try {
    term = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: cols || 80,
      rows: rows || 24,
      cwd: resolvedCwd,
      env: { ...process.env, COLORTERM: 'truecolor', FORCE_COLOR: '3' } as Record<string, string>,
    });
  } catch (err) {
    sendMessage(ws, {
      type: 'session.error',
      id,
      error: `Failed to spawn ${shell}: ${(err as Error).message}`,
    });
    return;
  }

  const session: PtySession = {
    pty: term,
    ws,
    id,
    lines: [],
    partial: '',
    partialSent: false,
    outputBuffer: [],
    removeCount: 0,
    flushTimer: null,
    partialTimer: null,
  };

  sessions.set(id, session);

  term.onData((data: string) => {
    // Cancel any pending partial-line flush since new data arrived
    if (session.partialTimer) {
      clearTimeout(session.partialTimer);
      session.partialTimer = null;
    }

    // Buffer partial lines (ANSI codes pass through for client-side rendering)
    const combined = session.partial + data;
    const parts = combined.split('\n');
    session.partial = parts.pop() || '';

    for (const line of parts) {
      const processed = processLine(line);
      if (processed.length === 0) continue;

      // Detect cursor-up at start of line: \x1b[nA means "go up n lines"
      // This indicates the TUI is overwriting previous lines (e.g. spinner updates)
      const cursorUpMatch = line.match(/^\x1b\[(\d*)A/);
      if (cursorUpMatch) {
        const n = parseInt(cursorUpMatch[1] || '1', 10);
        for (let j = 0; j < n; j++) {
          if (session.lines.length > 0) session.lines.pop();
          if (session.outputBuffer.length > 0) {
            session.outputBuffer.pop();
          } else {
            // Line was already flushed to client — track for removal
            session.removeCount++;
          }
        }
      }

      session.lines.push(processed);
      // Cap lines
      if (session.lines.length > MAX_LINES) {
        session.lines.shift();
      }
      session.outputBuffer.push(processed);
    }

    // Batched flush: 16ms (60fps) or FLUSH_MAX lines, whichever comes first
    if (session.outputBuffer.length >= FLUSH_MAX) {
      flushOutput(session);
    } else if (session.outputBuffer.length > 0 && !session.flushTimer) {
      session.flushTimer = setTimeout(() => flushOutput(session), FLUSH_MS);
    }

    // Send partial line (e.g. shell prompt without trailing newline) after brief silence.
    // Sent as session.partial — client renders it as the "current line" without
    // adding it to the permanent lines array. session.partial is NOT cleared so
    // future data combines correctly with it.
    if (session.partial.length > 0) {
      session.partialTimer = setTimeout(() => {
        if (session.partial.length > 0) {
          const safe = safeFlushLen(session.partial);
          if (safe > 0) {
            const toShow = session.partial.slice(0, safe);
            const processed = processLine(toShow);
            if (processed.length > 0) {
              sendMessage(session.ws, { type: 'session.partial', id: session.id, data: processed });
              session.partialSent = true;
            }
          }
        }
        session.partialTimer = null;
      }, PARTIAL_FLUSH_MS);
    }
  });

  term.onExit(({ exitCode }: { exitCode: number }) => {
    // Guard: only act if this session is still the active one for this id.
    // A rapid close+recreate (e.g. React StrictMode) may have already
    // replaced the entry; deleting here would kill the replacement.
    if (sessions.get(id) !== session) return;

    // Cancel partial timer
    if (session.partialTimer) {
      clearTimeout(session.partialTimer);
      session.partialTimer = null;
    }
    // Flush any buffered output
    flushOutput(session);
    // Flush any remaining partial as a final complete line
    if (session.partial.length > 0) {
      const processed = processLine(session.partial);
      session.partial = '';
      if (processed.length > 0) {
        sendMessage(ws, { type: 'session.output', id, data: [processed] });
      }
    }
    sendMessage(ws, { type: 'session.exit', id, code: exitCode });
    sessions.delete(id);
  });
}

export function sendInput(id: string, data: string): void {
  const session = sessions.get(id);
  if (!session) return;
  session.pty.write(data);
}

export function clearSession(id: string): void {
  const session = sessions.get(id);
  if (!session) return;
  // Clear server-side buffers so partial prompt doesn't duplicate after Ctrl+L
  session.partial = '';
  session.partialSent = false;
  session.lines = [];
  session.outputBuffer = [];
  if (session.partialTimer) {
    clearTimeout(session.partialTimer);
    session.partialTimer = null;
  }
}

export function resizeSession(id: string, cols: number, rows: number): void {
  const session = sessions.get(id);
  if (!session) return;
  session.pty.resize(cols, rows);
}

export function closeSession(id: string): void {
  const session = sessions.get(id);
  if (!session) return;
  if (session.flushTimer) clearTimeout(session.flushTimer);
  if (session.partialTimer) clearTimeout(session.partialTimer);
  session.pty.kill();
  sessions.delete(id);
}

export function cleanupAll(): void {
  for (const [id] of sessions) {
    closeSession(id);
  }
}

export function getSessionCount(): number {
  return sessions.size;
}

function sendMessage(ws: WebSocket, msg: Record<string, unknown>): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
