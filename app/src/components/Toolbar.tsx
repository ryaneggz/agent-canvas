// Toolbar component — see specs/07-toolbar.md
// Minimal stub accepting props from Canvas; full implementation in US-011

interface ToolbarProps {
  panelCount: number;
  zoom: number;
  onNewSession: () => void;
  onTile: () => void;
  onResetView: () => void;
}

export default function Toolbar({ panelCount, zoom, onNewSession, onTile, onResetView }: ToolbarProps) {
  void panelCount;
  void zoom;
  void onNewSession;
  void onTile;
  void onResetView;
  return <div />;
}
