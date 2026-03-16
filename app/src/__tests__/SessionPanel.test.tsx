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

  describe('Terminal output rendering (US-013)', () => {
    it('renders all session lines', () => {
      renderPanel();
      // Each line is a flex div inside terminal body; mock has 4 lines
      expect(screen.getByText('Session started')).toBeInTheDocument();
      expect(screen.getByText('npm start')).toBeInTheDocument();
      expect(screen.getByText('Server running on port 3000')).toBeInTheDocument();
      expect(screen.getByText('Warning: deprecated API')).toBeInTheDocument();
    });

    it('terminal body renders expected line count', () => {
      const { container } = renderPanel();
      // 4 lines + 1 "Working..." row for active session = 5 child divs in terminal body
      // Terminal body is the second child of the panel (after title bar)
      const panel = container.firstElementChild as HTMLElement;
      const terminalBody = panel.children[1] as HTMLElement;
      // 4 line divs + 1 working indicator div
      expect(terminalBody.children).toHaveLength(5);
    });

    it('each line shows correct icon character', () => {
      renderPanel();
      // system → ·, stdin → $, stdout → │, stderr → !
      expect(screen.getByText('·')).toBeInTheDocument();
      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByText('│')).toBeInTheDocument();
      expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('stdin lines have purple accent color', () => {
      renderPanel();
      // Find the stdin line text "npm start"
      const stdinText = screen.getByText('npm start');
      // jsdom converts #c084fc to rgb(192, 132, 252)
      expect(stdinText.style.color).toContain('rgb(192, 132, 252)');
      expect(stdinText.style.fontWeight).toBe('500');
    });

    it('stderr lines render with red styling', () => {
      renderPanel();
      const stderrText = screen.getByText('Warning: deprecated API');
      // stderr text should be present
      expect(stderrText).toBeInTheDocument();
      // The parent line div should have a red left border
      const lineDiv = stderrText.parentElement as HTMLElement;
      expect(lineDiv.style.borderLeft).toContain('rgb(248, 113, 113)');
    });

    it('active session shows Working... text', () => {
      renderPanel({ panel: { ...mockPanel, session: { ...mockPanel.session, status: 'active' } } });
      expect(screen.getByText('Working...')).toBeInTheDocument();
    });

    it('idle session does not show Working... text', () => {
      renderPanel({ panel: { ...mockPanel, session: { ...mockPanel.session, status: 'idle' } } });
      expect(screen.queryByText('Working...')).not.toBeInTheDocument();
    });
  });

  describe('Resize handle (US-014)', () => {
    it('resize handle element renders', () => {
      const { container } = renderPanel();
      const panel = container.firstElementChild as HTMLElement;
      // Resize handle is an absolute-positioned div with nwse-resize cursor
      const resizeHandle = panel.querySelector('div[style*="nwse-resize"]');
      expect(resizeHandle).toBeInTheDocument();
    });

    it('resize handle contains SVG', () => {
      const { container } = renderPanel();
      const panel = container.firstElementChild as HTMLElement;
      const resizeHandle = panel.querySelector('div[style*="nwse-resize"]');
      const svg = resizeHandle?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('mouseDown on resize handle calls onResizeStart', () => {
      const onResizeStart = vi.fn();
      const { container } = renderPanel({ onResizeStart });
      const panel = container.firstElementChild as HTMLElement;
      const resizeHandle = panel.querySelector('div[style*="nwse-resize"]') as HTMLElement;
      fireEvent.mouseDown(resizeHandle);
      expect(onResizeStart).toHaveBeenCalledWith('test-panel-1', expect.any(Object));
    });
  });
});
