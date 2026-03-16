import { T } from '@/theme';

export default function KeyboardHints() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        color: T.textMuted,
        display: 'flex',
        gap: 8,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <span>Drag background to pan</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>Cmd/Ctrl + scroll to zoom</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>Drag title bar to move</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>Corner handle to resize</span>
    </div>
  );
}
