import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import { T } from '@/theme';
import SessionPanel from '@/components/SessionPanel';
import Toolbar from '@/components/Toolbar';
import KeyboardHints from '@/components/KeyboardHints';
import SpawnerModal from '@/components/SpawnerModal';

export default function Canvas() {
  const {
    panels,
    activeId,
    zoom,
    canvasOffset,
    showSpawner,
    panning,
    bringToFront,
    closePanel,
    tilePanels,
    spawnSession,
    resetView,
    startDrag,
    startResize,
    startPan,
    handleWheel,
    setShowSpawner,
  } = useCanvasInteractions();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: T.bg,
        position: 'relative',
        cursor: panning ? 'grabbing' : 'default',
      }}
    >
      {/* Canvas area with dot grid — receives pan + zoom events */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `radial-gradient(circle, ${T.gridDot} 1px, transparent 1px)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${canvasOffset.x * zoom}px ${canvasOffset.y * zoom}px`,
        }}
        onMouseDown={startPan}
        onWheel={handleWheel}
      >
        {/* Zoom layer */}
        <div
          data-canvas="true"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Pan layer */}
          <div
            data-canvas="true"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
              width: '100%',
              height: '100%',
            }}
          >
            {panels.map(panel => (
              <SessionPanel
                key={panel.id}
                panel={panel}
                isActive={panel.id === activeId}
                onDragStart={startDrag}
                onResizeStart={startResize}
                onClose={closePanel}
                onBringToFront={bringToFront}
              />
            ))}
          </div>
        </div>
      </div>

      <Toolbar
        panelCount={panels.length}
        zoom={zoom}
        onNewSession={() => setShowSpawner(true)}
        onTile={tilePanels}
        onResetView={resetView}
      />
      <KeyboardHints />
      {showSpawner && (
        <SpawnerModal
          onSpawn={spawnSession}
          onClose={() => setShowSpawner(false)}
        />
      )}
    </div>
  );
}
