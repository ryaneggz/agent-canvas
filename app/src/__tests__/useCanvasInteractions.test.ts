import { renderHook } from '@testing-library/react';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';

describe('useCanvasInteractions', () => {
  describe('initial state', () => {
    it('initializes panels with length 4', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(result.current.panels).toHaveLength(4);
    });

    it('initializes activeId as null', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(result.current.activeId).toBeNull();
    });

    it('initializes zoom as 1', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(result.current.zoom).toBe(1);
    });

    it('initializes canvasOffset as {x: 0, y: 0}', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(result.current.canvasOffset).toEqual({ x: 0, y: 0 });
    });

    it('initializes showSpawner as false', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(result.current.showSpawner).toBe(false);
    });
  });

  describe('panel positions and dimensions', () => {
    it('panels have cascading x positions (40 + i*60)', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      result.current.panels.forEach((panel, i) => {
        expect(panel.x).toBe(40 + i * 60);
      });
    });

    it('panels have cascading y positions (40 + i*50)', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      result.current.panels.forEach((panel, i) => {
        expect(panel.y).toBe(40 + i * 50);
      });
    });

    it('all panels have width 520', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      result.current.panels.forEach((panel) => {
        expect(panel.w).toBe(520);
      });
    });

    it('all panels have height 380', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      result.current.panels.forEach((panel) => {
        expect(panel.h).toBe(380);
      });
    });

    it('panels have incrementing z-index starting at 1', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      result.current.panels.forEach((panel, i) => {
        expect(panel.z).toBe(i + 1);
      });
    });
  });

  describe('returned action functions', () => {
    it('returns bringToFront function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.bringToFront).toBe('function');
    });

    it('returns closePanel function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.closePanel).toBe('function');
    });

    it('returns tilePanels function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.tilePanels).toBe('function');
    });

    it('returns spawnSession function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.spawnSession).toBe('function');
    });

    it('returns resetView function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.resetView).toBe('function');
    });

    it('returns startDrag function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.startDrag).toBe('function');
    });

    it('returns startResize function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.startResize).toBe('function');
    });

    it('returns startPan function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.startPan).toBe('function');
    });

    it('returns handleWheel function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.handleWheel).toBe('function');
    });

    it('returns setShowSpawner function', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(typeof result.current.setShowSpawner).toBe('function');
    });
  });

  describe('returned state values', () => {
    it('returns panning state', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      expect(result.current.panning).toBeNull();
    });
  });
});
