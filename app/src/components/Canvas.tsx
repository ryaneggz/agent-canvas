import { useRef, useCallback } from 'react';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import { useWebSocket } from '@/hooks/useWebSocket';
import { T } from '@/theme';
import SessionPanel from '@/components/SessionPanel';
import PtyController from '@/components/PtyController';
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
    appendLine,
    removeLastLines,
    setPartialLine,
    updatePanelStatus,
    clearLines,
    startDrag,
    startResize,
    startPan,
    handleWheel,
    setShowSpawner,
  } = useCanvasInteractions();

  const { connected, send, subscribe } = useWebSocket('/ws');

  interface PtyFns {
    sendInput: (text: string) => void;
    sendRaw: (data: string) => void;
  }
  const ptyFnsRef = useRef<Map<string, PtyFns>>(new Map());

  const handleSendInputReady = useCallback(
    (panelId: string, fns: PtyFns) => {
      ptyFnsRef.current.set(panelId, fns);
    },
    [],
  );

  const handleSendInput = useCallback(
    (panelId: string, input: string) => {
      const fns = ptyFnsRef.current.get(panelId);
      if (fns) {
        fns.sendInput(input);
      }
    },
    [],
  );

  const handleSendRaw = useCallback(
    (panelId: string, data: string) => {
      const fns = ptyFnsRef.current.get(panelId);
      if (fns) {
        fns.sendRaw(data);
      }
    },
    [],
  );

  const handleClearLines = useCallback(
    (id: string) => {
      const panel = panels.find((p) => p.id === id);
      if (panel?.live) {
        send({ type: 'session.clear', id });
      }
      clearLines(id);
    },
    [panels, clearLines, send],
  );

  const handleClosePanel = useCallback(
    (id: string) => {
      const panel = panels.find((p) => p.id === id);
      if (panel?.live) {
        send({ type: 'session.close', id });
        ptyFnsRef.current.delete(id);
      }
      closePanel(id);
    },
    [panels, closePanel, send],
  );

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
                onClose={handleClosePanel}
                onBringToFront={bringToFront}
                onSendInput={panel.live ? handleSendInput : undefined}
                onSendRaw={panel.live ? handleSendRaw : undefined}
                onClearLines={handleClearLines}
              />
            ))}
          </div>
        </div>
      </div>

      {/* PtyControllers for live panels (headless) */}
      {panels
        .filter((p) => p.live)
        .map((panel) => (
          <PtyController
            key={`pty-${panel.id}`}
            panel={panel}
            send={send}
            subscribe={subscribe}
            onOutput={appendLine}
            onRemoveLines={removeLastLines}
            onPartial={setPartialLine}
            onStatusChange={updatePanelStatus}
            onSendInputReady={handleSendInputReady}
          />
        ))}

      {/* Disconnection banner (T9) */}
      {connected === false && (
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(248,113,113,0.15)',
            border: `1px solid ${T.red}`,
            borderRadius: 8,
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: 8, color: T.red }}>●</span>
          <span
            style={{
              fontSize: 12,
              color: T.text,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Disconnected — reconnecting...
          </span>
        </div>
      )}

      <Toolbar
        panelCount={panels.length}
        zoom={zoom}
        onNewSession={() => setShowSpawner(true)}
        onTile={tilePanels}
        onResetView={resetView}
        wsConnected={connected}
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
