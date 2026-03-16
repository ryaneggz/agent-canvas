import { render, screen, fireEvent } from '@testing-library/react';
import SessionPanel from '@/components/SessionPanel';
import type { PanelState } from '@/types';

const mockPanel: PanelState = {
  id: 'test-panel-1',
  session: {
    name: 'api-server',
    status: 'active',
    shell: 'bash',
    cwd: '~/projects/api',
    lines: [
      { t: 'system', v: 'Session started' },
      { t: 'stdin', v: 'npm start' },
      { t: 'stdout', v: 'Server running on port 3000' },
      { t: 'stderr', v: 'Warning: deprecated API' },
    ],
  },
  x: 100,
  y: 200,
  w: 520,
  h: 380,
  z: 1,
};

const defaultProps = {
  panel: mockPanel,
  isActive: false,
  onDragStart: vi.fn(),
  onResizeStart: vi.fn(),
  onClose: vi.fn(),
  onBringToFront: vi.fn(),
};

function renderPanel(overrides: Partial<typeof defaultProps> = {}) {
  const props = {
    ...defaultProps,
    onDragStart: vi.fn(),
    onResizeStart: vi.fn(),
    onClose: vi.fn(),
    onBringToFront: vi.fn(),
    ...overrides,
  };
  return { ...render(<SessionPanel {...props} />), props };
}

describe('SessionPanel', () => {
  describe('Title bar', () => {
    it('renders session name', () => {
      renderPanel();
      expect(screen.getByText('api-server')).toBeInTheDocument();
    });

    it('renders 3 traffic light dots', () => {
      const { container } = renderPanel();
      // Traffic lights are 11x11 circular divs
      const dots = container.querySelectorAll('div[style*="border-radius: 50%"]');
      expect(dots).toHaveLength(3);
    });

    it('red dot click calls onClose', () => {
      const onClose = vi.fn();
      const { container } = renderPanel({ onClose });
      // Red dot is the first traffic light with cursor: pointer
      const dots = container.querySelectorAll('div[style*="border-radius: 50%"]');
      fireEvent.click(dots[0]);
      expect(onClose).toHaveBeenCalledWith('test-panel-1');
    });

    it('renders status dot', () => {
      renderPanel();
      // Status dot is a ● character
      const dots = screen.getAllByText('●');
      // At least one status dot in the title bar
      expect(dots.length).toBeGreaterThanOrEqual(1);
    });

    it('renders shell badge', () => {
      renderPanel();
      expect(screen.getByText('bash')).toBeInTheDocument();
    });

    it('renders CWD path', () => {
      renderPanel();
      expect(screen.getByText('~/projects/api')).toBeInTheDocument();
    });
  });

  describe('Panel interactions', () => {
    it('clicking panel calls onBringToFront', () => {
      const onBringToFront = vi.fn();
      const { container } = renderPanel({ onBringToFront });
      // Click the outermost panel div
      fireEvent.mouseDown(container.firstElementChild!);
      expect(onBringToFront).toHaveBeenCalledWith('test-panel-1');
    });
  });

  describe('Active/inactive state', () => {
    it('active panel has accent border', () => {
      const { container } = renderPanel({ isActive: true });
      const panel = container.firstElementChild as HTMLElement;
      // jsdom converts hex to rgb; #2d3548 → rgb(45, 53, 72)
      expect(panel.style.border).toContain('rgb(45, 53, 72)');
    });

    it('inactive panel has muted border', () => {
      const { container } = renderPanel({ isActive: false });
      const panel = container.firstElementChild as HTMLElement;
      // jsdom converts hex to rgb; #1a1f2e → rgb(26, 31, 46)
      expect(panel.style.border).toContain('rgb(26, 31, 46)');
    });
  });
});
