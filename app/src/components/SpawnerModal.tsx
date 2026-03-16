// Spawner modal component — see specs/09-spawner-modal.md
// Minimal stub accepting props from Canvas; full implementation in US-015

import type { SpawnerTemplate } from '@/types';

interface SpawnerModalProps {
  onSpawn: (template: SpawnerTemplate) => void;
  onClose: () => void;
}

export default function SpawnerModal({ onSpawn, onClose }: SpawnerModalProps) {
  void onSpawn;
  void onClose;
  return <div />;
}
