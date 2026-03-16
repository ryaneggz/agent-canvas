import { T } from '@/theme';
import { shellBadge } from '@/utils/lineFormatting';
import { SPAWNER_TEMPLATES } from '@/data/mockSessions';
import type { SpawnerTemplate } from '@/types';

interface SpawnerModalProps {
  onSpawn: (template: SpawnerTemplate) => void;
  onClose: () => void;
}

export default function SpawnerModal({ onSpawn, onClose }: SpawnerModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10000,
        background: T.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 24,
          width: 420,
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>
          New Terminal Session
        </div>
        <div style={{ fontSize: 12, color: T.textDim, marginBottom: 16 }}>
          Choose a template or start blank
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SPAWNER_TEMPLATES.map((template, i) => {
            const badge = shellBadge(template.shell);
            return (
              <div
                key={template.name}
                className="spawner-option"
                style={{ animation: `slideUp 0.2s ease-out ${i * 0.04}s both` }}
                onClick={() => onSpawn(template)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                    {template.label}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: badge.bg,
                      color: badge.fg,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                  {template.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
