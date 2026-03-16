import { useState, useRef, useCallback, useEffect } from 'react';
import type { PanelState, DragState, ResizeState, PanState, SpawnerTemplate } from '../types';
import { MOCK_SESSIONS } from '../data/mockSessions';
import { clamp, uid } from '../utils/helpers';

function initPanels(): PanelState[] {
  return MOCK_SESSIONS.map((session, i) => ({
    id: uid(),
    session,
    x: 40 + i * 60,
    y: 40 + i * 50,
    w: 520,
    h: 380,
    z: i + 1,
  }));
}

export function useCanvasInteractions() {
  const [panels, setPanels] = useState<PanelState[]>(initPanels);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [panning, setPanning] = useState<PanState | null>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showSpawner, setShowSpawner] = useState(false);
  const maxZ = useRef(MOCK_SESSIONS.length + 1);

  const bringToFront = useCallback((id: string) => {
    maxZ.current += 1;
    const z = maxZ.current;
    setPanels(prev => prev.map(p => (p.id === id ? { ...p, z } : p)));
    setActiveId(id);
  }, []);

  const closePanel = useCallback((id: string) => {
    setPanels(prev => prev.filter(p => p.id !== id));
    setActiveId(prev => (prev === id ? null : prev));
  }, []);

  const tilePanels = useCallback(() => {
    setPanels(prev => {
      const cols = Math.ceil(Math.sqrt(prev.length));
      const tileW = 500;
      const tileH = 360;
      const gap = 20;
      return prev.map((p, i) => ({
        ...p,
        x: (i % cols) * (tileW + gap) + 30 - canvasOffset.x,
        y: Math.floor(i / cols) * (tileH + gap) + 30 - canvasOffset.y,
        w: tileW,
        h: tileH,
      }));
    });
  }, [canvasOffset]);

  const spawnSession = useCallback((template: SpawnerTemplate) => {
    maxZ.current += 1;
    const newPanel: PanelState = {
      id: uid(),
      session: {
        name: template.name,
        status: 'active',
        shell: template.shell,
        cwd: template.cwd,
        lines: [
          { t: 'system', v: `Session started (${template.shell})` },
          { t: 'stdin', v: `$ cd ${template.cwd}` },
        ],
      },
      x: 100 + Math.random() * 200 - canvasOffset.x,
      y: 100 + Math.random() * 150 - canvasOffset.y,
      w: 520,
      h: 380,
      z: maxZ.current,
    };
    setPanels(prev => [...prev, newPanel]);
    setActiveId(newPanel.id);
    setShowSpawner(false);
  }, [canvasOffset]);

  const resetView = useCallback(() => {
    setCanvasOffset({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const startDrag = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront(id);
    setPanels(prev => {
      const p = prev.find(p => p.id === id);
      if (!p) return prev;
      setDragging({
        id,
        offX: e.clientX - (p.x + canvasOffset.x) * zoom,
        offY: e.clientY - (p.y + canvasOffset.y) * zoom,
      });
      return prev;
    });
  }, [bringToFront, canvasOffset, zoom]);

  const startResize = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront(id);
    setPanels(prev => {
      const p = prev.find(p => p.id === id);
      if (!p) return prev;
      setResizing({
        id,
        startX: e.clientX,
        startY: e.clientY,
        startW: p.w,
        startH: p.h,
      });
      return prev;
    });
  }, [bringToFront]);

  const startPan = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target !== e.currentTarget && !target.dataset.canvas) return;
    setActiveId(null);
    setPanning({
      startX: e.clientX,
      startY: e.clientY,
      startOx: canvasOffset.x,
      startOy: canvasOffset.y,
    });
  }, [canvasOffset]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(prev => clamp(prev + (e.deltaY > 0 ? -0.05 : 0.05), 0.3, 2.0));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const newX = (e.clientX - dragging.offX) / zoom - canvasOffset.x;
        const newY = (e.clientY - dragging.offY) / zoom - canvasOffset.y;
        setPanels(prev =>
          prev.map(p => (p.id === dragging.id ? { ...p, x: newX, y: newY } : p))
        );
      }
      if (resizing) {
        const newW = clamp(resizing.startW + (e.clientX - resizing.startX) / zoom, 320, 1200);
        const newH = clamp(resizing.startH + (e.clientY - resizing.startY) / zoom, 200, 900);
        setPanels(prev =>
          prev.map(p => (p.id === resizing.id ? { ...p, w: newW, h: newH } : p))
        );
      }
      if (panning) {
        setCanvasOffset({
          x: panning.startOx + (e.clientX - panning.startX) / zoom,
          y: panning.startOy + (e.clientY - panning.startY) / zoom,
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
      setPanning(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, panning, zoom, canvasOffset]);

  return {
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
  };
}
