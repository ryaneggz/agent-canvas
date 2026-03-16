import { useEffect, useCallback, useRef } from 'react';
import type { SessionLine, SessionStatus, ShellType, WsServerMessage } from '@/types';

interface UsePtySessionOptions {
  panelId: string;
  shell: ShellType;
  cwd: string;
  cols?: number;
  rows?: number;
  send: (msg: { type: string; id: string; [key: string]: unknown }) => void;
  subscribe: (sessionId: string, callback: (msg: WsServerMessage) => void) => () => void;
  onOutput: (panelId: string, line: SessionLine) => void;
  onRemoveLines: (panelId: string, count: number) => void;
  onPartial: (panelId: string, text: string) => void;
  onStatusChange: (panelId: string, status: SessionStatus) => void;
}

export function usePtySession({
  panelId,
  shell,
  cwd,
  cols,
  rows,
  send,
  subscribe,
  onOutput,
  onRemoveLines,
  onPartial,
  onStatusChange,
}: UsePtySessionOptions) {
  const sendRef = useRef(send);
  const subscribeRef = useRef(subscribe);
  const onOutputRef = useRef(onOutput);
  const onRemoveLinesRef = useRef(onRemoveLines);
  const onPartialRef = useRef(onPartial);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    sendRef.current = send;
    subscribeRef.current = subscribe;
    onOutputRef.current = onOutput;
    onRemoveLinesRef.current = onRemoveLines;
    onPartialRef.current = onPartial;
    onStatusChangeRef.current = onStatusChange;
  }, [send, subscribe, onOutput, onRemoveLines, onPartial, onStatusChange]);

  useEffect(() => {
    // Create PTY session on mount
    sendRef.current({
      type: 'session.create',
      id: panelId,
      shell,
      cwd,
      ...(cols != null && rows != null ? { cols, rows } : {}),
    });

    // Subscribe to output
    const unsubscribe = subscribeRef.current(panelId, (msg: WsServerMessage) => {
      switch (msg.type) {
        case 'session.output': {
          // Remove previous lines if cursor-up was detected
          if (msg.remove && msg.remove > 0) {
            onRemoveLinesRef.current(panelId, msg.remove);
          }
          // Handle batched output (string[] or single string for backwards compat)
          const lines = Array.isArray(msg.data) ? msg.data : [msg.data];
          for (const line of lines) {
            onOutputRef.current(panelId, { t: 'stdout', v: line });
          }
          break;
        }
        case 'session.partial':
          onPartialRef.current(panelId, msg.data);
          break;
        case 'session.exit':
          onStatusChangeRef.current(panelId, msg.code === 0 ? 'idle' : 'error');
          break;
        case 'session.error':
          onOutputRef.current(panelId, { t: 'stderr', v: msg.error });
          onStatusChangeRef.current(panelId, 'error');
          break;
      }
    });

    return () => {
      unsubscribe();
      sendRef.current({ type: 'session.close', id: panelId });
    };
  }, [panelId, shell, cwd, cols, rows]);

  const sendInput = useCallback(
    (text: string) => {
      // Send to PTY (add newline to execute) — PTY echoes input back through term.onData
      sendRef.current({ type: 'session.input', id: panelId, data: text + '\n' });
    },
    [panelId],
  );

  // Send raw data to PTY without echo (for Ctrl+C, etc.)
  const sendRaw = useCallback(
    (data: string) => {
      sendRef.current({ type: 'session.input', id: panelId, data });
    },
    [panelId],
  );

  return { sendInput, sendRaw };
}
