import React, { useRef, useEffect } from 'react';
import type { PanelState } from '@/types';
import { T } from '@/theme';
import { lineColor, lineIcon, statusColor, shellBadge } from '@/utils/lineFormatting';

interface SessionPanelProps {
  panel: PanelState;
  isActive: boolean;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onResizeStart: (id: string, e: React.MouseEvent) => void;
  onClose: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export default function SessionPanel({
  panel,
  isActive,
  onDragStart,
  onResizeStart,
  onClose,
  onBringToFront,
}: SessionPanelProps) {
  const { id, session, x, y, w, h, z } = panel;
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [session.lines]);

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
        style={{
          flex: 1,
          padding: '8px 0',
          overflowY: 'auto',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12.5px',
          lineHeight: 1.6,
        }}
      >
        {session.lines.map((line, i) => (
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
            <span
              style={{
                color: lineColor(line.t),
                ...(line.t === 'stdin' ? { fontWeight: 500 } : {}),
                ...(line.t === 'system' ? { fontStyle: 'italic' } : {}),
              }}
            >
              {line.v}
            </span>
          </div>
        ))}
        {session.status === 'active' && (
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
      </div>

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
