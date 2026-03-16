import React, { useRef, useEffect, useState } from 'react';
import type { PanelState } from '@/types';
import { T } from '@/theme';
import { lineColor, lineIcon, statusColor, shellBadge } from '@/utils/lineFormatting';
import AnsiLine from '@/components/AnsiLine';

interface SessionPanelProps {
  panel: PanelState;
  isActive: boolean;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onResizeStart: (id: string, e: React.MouseEvent) => void;
  onClose: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendInput?: (id: string, input: string) => void;
  onSendRaw?: (id: string, data: string) => void;
  onClearLines?: (id: string) => void;
}

// Map key events to raw terminal sequences
// Returns the raw string to send, or 'clear' for Ctrl+L (needs special handling),
// or 'paste' for Ctrl+V, or null to ignore.
type KeyAction = { type: 'raw'; data: string } | { type: 'clear' } | { type: 'paste' } | null;

function keyToAction(e: React.KeyboardEvent): KeyAction {
  if (e.ctrlKey || e.metaKey) {
    const lower = e.key.toLowerCase();
    if (lower === 'c' && e.ctrlKey) return { type: 'raw', data: '\x03' };
    if (lower === 'd' && e.ctrlKey) return { type: 'raw', data: '\x04' };
    if (lower === 'l' && e.ctrlKey) return { type: 'clear' };
    if (lower === 'z' && e.ctrlKey) return { type: 'raw', data: '\x1a' };
    if (lower === 'v') return { type: 'paste' };
    return null;
  }
  if (e.key === 'Enter') return { type: 'raw', data: '\r' };
  if (e.key === 'Backspace') return { type: 'raw', data: '\x7f' };
  if (e.key === 'Tab') return { type: 'raw', data: '\t' };
  if (e.key === 'ArrowUp') return { type: 'raw', data: '\x1b[A' };
  if (e.key === 'ArrowDown') return { type: 'raw', data: '\x1b[B' };
  if (e.key === 'ArrowRight') return { type: 'raw', data: '\x1b[C' };
  if (e.key === 'ArrowLeft') return { type: 'raw', data: '\x1b[D' };
  if (e.key === 'Home') return { type: 'raw', data: '\x1b[H' };
  if (e.key === 'End') return { type: 'raw', data: '\x1b[F' };
  if (e.key === 'Delete') return { type: 'raw', data: '\x1b[3~' };
  if (e.key === 'Escape') return { type: 'raw', data: '\x1b' };
  // Printable character (single char)
  if (e.key.length === 1) return { type: 'raw', data: e.key };
  return null;
}

export default function SessionPanel({
  panel,
  isActive,
  onDragStart,
  onResizeStart,
  onClose,
  onBringToFront,
  onSendInput,
  onSendRaw,
  onClearLines,
}: SessionPanelProps) {
  const { id, session, x, y, w, h, z } = panel;
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [termFocused, setTermFocused] = useState(false);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [session.lines]);

  // Auto-focus: for live sessions focus the terminal body, for mock sessions focus the input
  useEffect(() => {
    if (panel.live && termRef.current) {
      termRef.current.focus();
    } else if (panel.live && inputRef.current) {
      inputRef.current.focus();
    }
  }, [panel.live]);

  // Auto-focus terminal body when panel is brought to front
  useEffect(() => {
    if (panel.live && isActive && termRef.current) {
      termRef.current.focus();
    }
  }, [panel.live, isActive]);

  const isLive = panel.live === true;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: z,
        borderRadius: 10,
        border: `1px solid ${isActive ? T.borderActive : T.border}`,
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        background: T.surface,
        boxShadow: isActive
          ? `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${T.borderActive}, 0 0 30px ${T.accentGlow}`
          : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.2s',
      }}
      onMouseDown={() => onBringToFront(id)}
    >
      {/* Title bar */}
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'grab',
          flexShrink: 0,
          background: isActive ? 'rgba(255,255,255,0.02)' : 'transparent',
          borderBottom: `1px solid ${T.border}`,
        }}
        onMouseDown={(e) => onDragStart(id, e)}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: T.red,
              opacity: 0.8,
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: T.amber,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: T.green,
              opacity: 0.5,
            }}
          />
        </div>

        {/* Session info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Status dot */}
          <span
            style={{
              fontSize: 8,
              color: statusColor(session.status),
              flexShrink: 0,
            }}
          >
            ●
          </span>

          {/* Session name */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {session.name}
          </span>

          {/* Shell badge */}
          {(() => {
            const badge = shellBadge(session.shell);
            return (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: badge.bg,
                  color: badge.fg,
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {badge.label}
              </span>
            );
          })()}
        </div>

        {/* T10: Clear button */}
        {onClearLines && (
          <span
            role="button"
            title="Clear terminal"
            style={{
              fontSize: 11,
              color: T.textMuted,
              cursor: 'pointer',
              padding: '0 4px',
              opacity: 0.6,
              fontFamily: "'JetBrains Mono', monospace",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClearLines(id);
            }}
          >
            CLR
          </span>
        )}

        {/* CWD label */}
        <span
          style={{
            fontSize: 10,
            color: T.textMuted,
            flexShrink: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {session.cwd}
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={termRef}
        tabIndex={isLive ? 0 : undefined}
        data-testid={isLive ? 'live-terminal-body' : undefined}
        style={{
          flex: 1,
          padding: '8px 0',
          overflowY: 'auto',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12.5px',
          lineHeight: 1.6,
          outline: 'none',
        }}
        onFocus={isLive ? () => setTermFocused(true) : undefined}
        onBlur={isLive ? () => setTermFocused(false) : undefined}
        onClick={isLive ? () => termRef.current?.focus() : undefined}
        onKeyDown={
          isLive && onSendRaw
            ? (e: React.KeyboardEvent<HTMLDivElement>) => {
                const action = keyToAction(e);
                if (action === null) return;
                e.preventDefault();
                e.stopPropagation();
                if (action.type === 'raw') {
                  onSendRaw(id, action.data);
                } else if (action.type === 'clear') {
                  // Send Ctrl+L to PTY and clear client-side buffer
                  onSendRaw(id, '\x0c');
                  if (onClearLines) onClearLines(id);
                } else if (action.type === 'paste') {
                  navigator.clipboard.readText().then((text) => {
                    if (text && onSendRaw) onSendRaw(id, text);
                  }).catch(() => {/* clipboard denied */});
                }
              }
            : undefined
        }
        onPaste={
          isLive && onSendRaw
            ? (e: React.ClipboardEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                const text = e.clipboardData.getData('text/plain');
                if (text) onSendRaw(id, text);
              }
            : undefined
        }
      >
        {isLive
          ? /* Live session: no icons, no line-type colors, ANSI rendering */
            (() => {
              const hasPartial = !!session.partialLine;
              const cursorActive = termFocused && session.status === 'active';
              return (
                <>
                  {session.lines.map((line, i) => {
                    const isLastLine = i === session.lines.length - 1;
                    const showCursor = isLastLine && !hasPartial && cursorActive;
                    return (
                      <div key={i} style={{ padding: '0 12px' }}>
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: T.text,
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            lineHeight: 'inherit',
                          }}
                        >
                          <AnsiLine text={line.v} />
                          {showCursor && (
                            <span
                              data-testid="terminal-cursor"
                              style={{ color: T.text, animation: 'pulse 1s step-end infinite' }}
                            >█</span>
                          )}
                        </pre>
                      </div>
                    );
                  })}
                  {hasPartial && (
                    <div style={{ padding: '0 12px' }}>
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: T.text,
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          lineHeight: 'inherit',
                        }}
                      >
                        <AnsiLine text={session.partialLine!} />
                        {cursorActive && (
                          <span
                            data-testid="terminal-cursor"
                            style={{ color: T.text, animation: 'pulse 1s step-end infinite' }}
                          >█</span>
                        )}
                      </pre>
                    </div>
                  )}
                </>
              );
            })()
          : /* Mock session: icons, line-type colors, stderr borders */
            session.lines.map((line, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  padding: '1px 12px',
                  ...(line.t === 'stderr'
                    ? {
                        borderLeft: `2px solid ${T.red}`,
                        background: 'rgba(248,113,113,0.06)',
                      }
                    : {}),
                }}
              >
                <span
                  style={{
                    width: 18,
                    flexShrink: 0,
                    color: lineColor(line.t),
                    opacity: 0.5,
                  }}
                >
                  {lineIcon(line.t)}
                </span>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: lineColor(line.t),
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    ...(line.t === 'stdin' ? { fontWeight: 500 } : {}),
                    ...(line.t === 'system' ? { fontStyle: 'italic' } : {}),
                  }}
                >
                  {line.v}
                </pre>
              </div>
            ))}
        {/* Working indicator: only for mock sessions */}
        {!isLive && session.status === 'active' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
            }}
          >
            <span
              style={{
                fontSize: 8,
                color: T.accent,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              ●
            </span>
            <span style={{ fontSize: 11, color: T.textDim }}>Working...</span>
          </div>
        )}
        {/* Cursor when no lines yet (empty terminal, focused) */}
        {isLive && session.lines.length === 0 && termFocused && session.status === 'active' && (
          <span
            data-testid="terminal-cursor"
            style={{
              display: 'inline-block',
              marginLeft: 12,
              color: T.text,
              animation: 'pulse 1s step-end infinite',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12.5px',
            }}
          >
            █
          </span>
        )}
      </div>

      {/* Command input bar — only for mock sessions that have onSendInput */}
      {!isLive && panel.live && onSendInput && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderTop: `1px solid ${T.border}`,
            flexShrink: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12.5px',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span style={{ color: T.accent, fontWeight: 600 }}>$</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            aria-label="Command input"
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: T.text,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12.5px',
              padding: 0,
            }}
            onKeyDown={(e) => {
              if (e.key === 'c' && e.ctrlKey && onSendRaw) {
                e.preventDefault();
                onSendRaw(id, '\x03');
                e.currentTarget.value = '';
                setHistoryIndex(-1);
                return;
              }
              if (e.key === 'Enter') {
                const input = e.currentTarget;
                const value = input.value.trim();
                if (value) {
                  historyRef.current.push(value);
                  setHistoryIndex(-1);
                  onSendInput(id, value);
                  input.value = '';
                }
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const history = historyRef.current;
                if (history.length === 0) return;
                const newIndex = historyIndex === -1
                  ? history.length - 1
                  : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                e.currentTarget.value = history[newIndex];
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const history = historyRef.current;
                if (historyIndex === -1) return;
                const newIndex = historyIndex + 1;
                if (newIndex >= history.length) {
                  setHistoryIndex(-1);
                  e.currentTarget.value = '';
                } else {
                  setHistoryIndex(newIndex);
                  e.currentTarget.value = history[newIndex];
                }
              }
            }}
          />
        </div>
      )}

      {/* Resize handle */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 18,
          height: 18,
          cursor: 'nwse-resize',
        }}
        onMouseDown={(e) => onResizeStart(id, e)}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          style={{ opacity: 0.25, position: 'absolute', right: 3, bottom: 3 }}
        >
          <path
            d="M9 1L1 9M9 5L5 9M9 9L9 9"
            stroke={T.text}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
