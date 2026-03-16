import { renderHook, act } from '@testing-library/react';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import type { SpawnerTemplate } from '@/types';

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

  describe('bringToFront — panel z-index and activeId', () => {
    it('updates the panel z-index to be the highest', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[0].id;
      const maxZBefore = Math.max(...result.current.panels.map(p => p.z));
      act(() => {
        result.current.bringToFront(panelId);
      });
      const panel = result.current.panels.find(p => p.id === panelId);
      expect(panel!.z).toBeGreaterThan(maxZBefore);
    });

    it('sets activeId to the brought-to-front panel', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[2].id;
      act(() => {
        result.current.bringToFront(panelId);
      });
      expect(result.current.activeId).toBe(panelId);
    });

    it('updates activeId when a different panel is brought to front', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const firstId = result.current.panels[0].id;
      const secondId = result.current.panels[1].id;
      act(() => {
        result.current.bringToFront(firstId);
      });
      expect(result.current.activeId).toBe(firstId);
      act(() => {
        result.current.bringToFront(secondId);
      });
      expect(result.current.activeId).toBe(secondId);
    });
  });

  describe('closePanel — panel removal', () => {
    it('removes the panel from the panels array', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[0].id;
      act(() => {
        result.current.closePanel(panelId);
      });
      expect(result.current.panels).toHaveLength(3);
      expect(result.current.panels.find(p => p.id === panelId)).toBeUndefined();
    });

    it('clears activeId if the closed panel was active', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const panelId = result.current.panels[0].id;
      act(() => {
        result.current.bringToFront(panelId);
      });
      expect(result.current.activeId).toBe(panelId);
      act(() => {
        result.current.closePanel(panelId);
      });
      expect(result.current.activeId).toBeNull();
    });

    it('does not clear activeId if a different panel was closed', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const activePanel = result.current.panels[0].id;
      const otherPanel = result.current.panels[1].id;
      act(() => {
        result.current.bringToFront(activePanel);
      });
      act(() => {
        result.current.closePanel(otherPanel);
      });
      expect(result.current.activeId).toBe(activePanel);
    });

    it('is idempotent — closing a non-existent panel does nothing', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const lengthBefore = result.current.panels.length;
      act(() => {
        result.current.closePanel('non-existent-id');
      });
      expect(result.current.panels).toHaveLength(lengthBefore);
    });
  });

  describe('tilePanels — grid arrangement', () => {
    it('arranges panels in a grid layout', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      act(() => {
        result.current.tilePanels();
      });
      // 4 panels → cols = ceil(sqrt(4)) = 2
      const cols = 2;
      const tileW = 500;
      const tileH = 360;
      const gap = 20;
      result.current.panels.forEach((panel, i) => {
        expect(panel.x).toBe((i % cols) * (tileW + gap) + 30);
        expect(panel.y).toBe(Math.floor(i / cols) * (tileH + gap) + 30);
        expect(panel.w).toBe(tileW);
        expect(panel.h).toBe(tileH);
      });
    });

    it('uses correct column count for different panel counts', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      // Close 2 panels to have 2 remaining → cols = ceil(sqrt(2)) = 2
      const id0 = result.current.panels[0].id;
      const id1 = result.current.panels[1].id;
      act(() => {
        result.current.closePanel(id0);
        result.current.closePanel(id1);
      });
      expect(result.current.panels).toHaveLength(2);
      act(() => {
        result.current.tilePanels();
      });
      // With 2 panels and 2 cols, both should be in row 0
      expect(result.current.panels[0].y).toBe(30);
      expect(result.current.panels[1].y).toBe(30);
    });
  });

  describe('spawnSession — new session creation', () => {
    it('adds a new panel to the panels array', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const template: SpawnerTemplate = {
        name: 'blank-bash',
        shell: 'bash',
        cwd: '~',
        label: 'Blank (bash)',
        desc: 'Empty bash shell session',
      };
      act(() => {
        result.current.spawnSession(template);
      });
      expect(result.current.panels).toHaveLength(5);
    });

    it('creates a panel with 2 initial lines', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const template: SpawnerTemplate = {
        name: 'blank-bash',
        shell: 'bash',
        cwd: '~',
        label: 'Blank (bash)',
        desc: 'Empty bash shell session',
      };
      act(() => {
        result.current.spawnSession(template);
      });
      const newPanel = result.current.panels[result.current.panels.length - 1];
      expect(newPanel.session.lines).toHaveLength(2);
      expect(newPanel.session.lines[0].t).toBe('system');
      expect(newPanel.session.lines[1].t).toBe('stdin');
    });

    it('closes the spawner modal after spawning', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      act(() => {
        result.current.setShowSpawner(true);
      });
      expect(result.current.showSpawner).toBe(true);
      const template: SpawnerTemplate = {
        name: 'blank-bash',
        shell: 'bash',
        cwd: '~',
        label: 'Blank (bash)',
        desc: 'Empty bash shell session',
      };
      act(() => {
        result.current.spawnSession(template);
      });
      expect(result.current.showSpawner).toBe(false);
    });

    it('sets the new panel as active', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const template: SpawnerTemplate = {
        name: 'blank-zsh',
        shell: 'zsh',
        cwd: '~',
        label: 'Blank (zsh)',
        desc: 'Empty zsh shell session',
      };
      act(() => {
        result.current.spawnSession(template);
      });
      const newPanel = result.current.panels[result.current.panels.length - 1];
      expect(result.current.activeId).toBe(newPanel.id);
    });

    it('assigns the correct shell from the template', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const template: SpawnerTemplate = {
        name: 'blank-zsh',
        shell: 'zsh',
        cwd: '~/projects',
        label: 'Blank (zsh)',
        desc: 'Empty zsh shell session',
      };
      act(() => {
        result.current.spawnSession(template);
      });
      const newPanel = result.current.panels[result.current.panels.length - 1];
      expect(newPanel.session.shell).toBe('zsh');
      expect(newPanel.session.cwd).toBe('~/projects');
    });
  });

  describe('resetView — viewport reset', () => {
    it('resets canvasOffset to {x: 0, y: 0}', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      // Change zoom first to move offset indirectly
      const makeWheelEvent = (overrides: Partial<React.WheelEvent> = {}) =>
        ({
          ctrlKey: true,
          metaKey: false,
          deltaY: -100,
          preventDefault: vi.fn(),
          ...overrides,
        }) as unknown as React.WheelEvent;
      act(() => {
        result.current.handleWheel(makeWheelEvent());
      });
      expect(result.current.zoom).not.toBe(1);
      act(() => {
        result.current.resetView();
      });
      expect(result.current.canvasOffset).toEqual({ x: 0, y: 0 });
    });

    it('resets zoom to 1', () => {
      const { result } = renderHook(() => useCanvasInteractions());
      const makeWheelEvent = () =>
        ({
          ctrlKey: true,
          metaKey: false,
          deltaY: -100,
          preventDefault: vi.fn(),
        }) as unknown as React.WheelEvent;
      act(() => {
        result.current.handleWheel(makeWheelEvent());
        result.current.handleWheel(makeWheelEvent());
      });
      expect(result.current.zoom).not.toBe(1);
      act(() => {
        result.current.resetView();
      });
      expect(result.current.zoom).toBe(1);
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
