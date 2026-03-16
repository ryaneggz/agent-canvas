import { useEffect, useRef } from 'react';
import type { PanelState, SessionLine, SessionStatus, WsServerMessage } from '@/types';
import { usePtySession } from '@/hooks/usePtySession';

// JetBrains Mono 12.5px metrics
const CHAR_WIDTH = 7.5;
const LINE_HEIGHT = 20;
const TITLE_BAR_HEIGHT = 36; // 8px padding top + 11px dot + 8px padding bottom + 1px border
const BODY_PADDING_V = 16; // 8px top + 8px bottom
const BODY_PADDING_H = 24; // 12px left + 12px right

function calcTermSize(w: number, h: number): { cols: number; rows: number } {
  const cols = Math.max(1, Math.floor((w - BODY_PADDING_H) / CHAR_WIDTH));
  const rows = Math.max(1, Math.floor((h - TITLE_BAR_HEIGHT - BODY_PADDING_V) / LINE_HEIGHT));
  return { cols, rows };
}

interface PtyControllerProps {
  panel: PanelState;
  send: (msg: { type: string; id: string; [key: string]: unknown }) => void;
  subscribe: (sessionId: string, callback: (msg: WsServerMessage) => void) => () => void;
  onOutput: (panelId: string, line: SessionLine) => void;
  onRemoveLines: (panelId: string, count: number) => void;
  onPartial: (panelId: string, text: string) => void;
  onStatusChange: (panelId: string, status: SessionStatus) => void;
  onSendInputReady: (panelId: string, fns: { sendInput: (text: string) => void; sendRaw: (data: string) => void }) => void;
}

export default function PtyController({
  panel,
  send,
  subscribe,
  onOutput,
  onRemoveLines,
  onPartial,
  onStatusChange,
  onSendInputReady,
}: PtyControllerProps) {
  const initialSize = calcTermSize(panel.w, panel.h);

  const { sendInput, sendRaw } = usePtySession({
    panelId: panel.id,
    shell: panel.session.shell,
    cwd: panel.session.cwd,
    cols: initialSize.cols,
    rows: initialSize.rows,
    send,
    subscribe,
    onOutput,
    onRemoveLines,
    onPartial,
    onStatusChange,
  });

  // Expose sendInput/sendRaw to parent via callback — must be in an effect, not during render
  useEffect(() => {
    onSendInputReady(panel.id, { sendInput, sendRaw });
  }, [panel.id, sendInput, sendRaw, onSendInputReady]);

  // Send resize when panel dimensions change (debounced)
  const prevSizeRef = useRef({ cols: initialSize.cols, rows: initialSize.rows });
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const { cols, rows } = calcTermSize(panel.w, panel.h);
    if (cols === prevSizeRef.current.cols && rows === prevSizeRef.current.rows) return;

    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(() => {
      prevSizeRef.current = { cols, rows };
      send({ type: 'session.resize', id: panel.id, cols, rows });
    }, 100);

    return () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, [panel.w, panel.h, panel.id, send]);

  return null;
}
