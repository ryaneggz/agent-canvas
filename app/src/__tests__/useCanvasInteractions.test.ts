import { renderHook, act } from '@testing-library/react';
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

  describe('handleWheel — zoom interactions', () => {
    const makeWheelEvent = (overrides: Partial<React.WheelEvent> = {}) =>
      ({
        ctrlKey: false,
        metaKey: false,
        deltaY: 0,
        preventDefault: vi.fn(),
        ...overrides,
      }) as unknown as React.WheelEvent;

    it('increases zoom by 0.05 when ctrlKey + scroll up (deltaY < 0)', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      act(() => {
        result.current.handleWheel(makeWheelEvent({ ctrlKey: true, deltaY: -100 }));
      });
      expect(result.current.zoom).toBeCloseTo(1.05, 2);
    });

    it('decreases zoom by 0.05 when ctrlKey + scroll down (deltaY > 0)', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      act(() => {
        result.current.handleWheel(makeWheelEvent({ ctrlKey: true, deltaY: 100 }));
      });
      expect(result.current.zoom).toBeCloseTo(0.95, 2);
    });

    it('increases zoom by 0.05 when metaKey + scroll up', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      act(() => {
        result.current.handleWheel(makeWheelEvent({ metaKey: true, deltaY: -100 }));
      });
      expect(result.current.zoom).toBeCloseTo(1.05, 2);
    });

    it('clamps zoom to minimum 0.3', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      // Scroll down many times to go below 0.3
      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.handleWheel(makeWheelEvent({ ctrlKey: true, deltaY: 100 }));
        }
      });
      expect(result.current.zoom).toBeCloseTo(0.3, 2);
    });

    it('clamps zoom to maximum 2.0', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      // Scroll up many times to go above 2.0
      act(() => {
        for (let i = 0; i < 25; i++) {
          result.current.handleWheel(makeWheelEvent({ ctrlKey: true, deltaY: -100 }));
        }
      });
      expect(result.current.zoom).toBeCloseTo(2.0, 2);
    });

    it('does not change zoom when neither ctrlKey nor metaKey is pressed', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      act(() => {
        result.current.handleWheel(makeWheelEvent({ deltaY: -100 }));
      });
      expect(result.current.zoom).toBe(1);
    });

    it('calls preventDefault when ctrlKey is pressed', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const event = makeWheelEvent({ ctrlKey: true, deltaY: -100 });
      act(() => {
        result.current.handleWheel(event);
      });
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('startDrag — drag initiation', () => {
    const makeMouseEvent = (overrides: Partial<React.MouseEvent> = {}) =>
      ({
        clientX: 200,
        clientY: 150,
        stopPropagation: vi.fn(),
        ...overrides,
      }) as unknown as React.MouseEvent;

    it('calls stopPropagation on the event', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[0].id;
      const event = makeMouseEvent();
      act(() => {
        result.current.startDrag(panelId, event);
      });
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('sets activeId to the dragged panel', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[0].id;
      act(() => {
        result.current.startDrag(panelId, makeMouseEvent());
      });
      expect(result.current.activeId).toBe(panelId);
    });

    it('brings the dragged panel to front (updates z-index)', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[0].id;
      const initialMaxZ = Math.max(...result.current.panels.map(p => p.z));
      act(() => {
        result.current.startDrag(panelId, makeMouseEvent());
      });
      const panel = result.current.panels.find(p => p.id === panelId);
      expect(panel!.z).toBeGreaterThan(initialMaxZ);
    });
  });

  describe('startResize — resize initiation', () => {
    const makeMouseEvent = (overrides: Partial<React.MouseEvent> = {}) =>
      ({
        clientX: 300,
        clientY: 400,
        stopPropagation: vi.fn(),
        ...overrides,
      }) as unknown as React.MouseEvent;

    it('calls stopPropagation on the event', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[0].id;
      const event = makeMouseEvent();
      act(() => {
        result.current.startResize(panelId, event);
      });
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('sets activeId to the resized panel', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[1].id;
      act(() => {
        result.current.startResize(panelId, makeMouseEvent());
      });
      expect(result.current.activeId).toBe(panelId);
    });

    it('brings the resized panel to front', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[1].id;
      const initialMaxZ = Math.max(...result.current.panels.map(p => p.z));
      act(() => {
        result.current.startResize(panelId, makeMouseEvent());
      });
      const panel = result.current.panels.find(p => p.id === panelId);
      expect(panel!.z).toBeGreaterThan(initialMaxZ);
    });
  });

  describe('startPan — pan initiation', () => {
    it('sets activeId to null when panning starts', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      // First set an active panel
      act(() => {
        result.current.bringToFront(result.current.panels[0].id);
      });
      expect(result.current.activeId).not.toBeNull();
      // Start pan on canvas background
      const canvasEl = document.createElement('div');
      canvasEl.dataset.canvas = 'true';
      act(() => {
        result.current.startPan({
          clientX: 100,
          clientY: 100,
          target: canvasEl,
          currentTarget: document.createElement('div'),
        } as unknown as React.MouseEvent);
      });
      expect(result.current.activeId).toBeNull();
    });

    it('does not initiate pan when target has no data-canvas and is not currentTarget', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      // First set an active panel
      act(() => {
        result.current.bringToFront(result.current.panels[0].id);
      });
      const activeIdBefore = result.current.activeId;
      // Click on a non-canvas element
      const nonCanvasEl = document.createElement('div');
      const containerEl = document.createElement('div');
      act(() => {
        result.current.startPan({
          clientX: 100,
          clientY: 100,
          target: nonCanvasEl,
          currentTarget: containerEl,
        } as unknown as React.MouseEvent);
      });
      // activeId should remain unchanged (pan guard prevented it)
      expect(result.current.activeId).toBe(activeIdBefore);
    });
  });
});
