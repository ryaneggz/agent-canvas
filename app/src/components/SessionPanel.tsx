import React from 'react';
import type { PanelState } from '../types';
import { T } from '../theme';

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

        {/* Session name */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: T.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {session.name}
        </span>
      </div>

      {/* Terminal body placeholder */}
      <div style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        <span style={{ fontSize: 12, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
          {session.name} — {session.shell}
        </span>
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
