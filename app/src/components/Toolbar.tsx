import { T } from '../theme';

interface ToolbarProps {
  panelCount: number;
  zoom: number;
  onNewSession: () => void;
  onTile: () => void;
  onResetView: () => void;
}

export default function Toolbar({ panelCount, zoom, onNewSession, onTile, onResetView }: ToolbarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background:
          'linear-gradient(180deg, rgba(8,9,12,0.95) 0%, rgba(8,9,12,0.8) 80%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Logo block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {'>_'}
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.text,
            letterSpacing: '-0.3px',
          }}
        >
          Agent Canvas
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: T.border, margin: '0 4px' }} />

      {/* + New Session button */}
      <button
        className="toolbar-btn primary"
        onClick={onNewSession}
      >
        + New Session
      </button>

      {/* Tile button */}
      <button className="toolbar-btn" onClick={onTile}>
        ⊞ Tile
      </button>

      {/* Reset View button */}
      <button className="toolbar-btn" onClick={onResetView}>
        ⌂ Reset View
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Status text */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: T.textMuted,
        }}
      >
        {panelCount} session(s) · {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}
