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

const livePanel: PanelState = {
  id: 'live-panel-1',
  session: {
    name: 'live-bash',
    status: 'active',
    shell: 'bash',
    cwd: '~/projects',
    lines: [
      { t: 'stdout', v: 'user@host:~$ ls' },
      { t: 'stdout', v: '\x1b[34mfolder\x1b[0m  file.txt' },
    ],
  },
  x: 100,
  y: 200,
  w: 520,
  h: 380,
  z: 1,
  live: true,
};

const defaultProps = {
  panel: mockPanel,
  isActive: false,
  onDragStart: vi.fn(),
  onResizeStart: vi.fn(),
  onClose: vi.fn(),
  onBringToFront: vi.fn(),
};

interface RenderOverrides {
  panel?: PanelState;
  isActive?: boolean;
  onDragStart?: typeof vi.fn;
  onResizeStart?: typeof vi.fn;
  onClose?: typeof vi.fn;
  onBringToFront?: typeof vi.fn;
  onSendInput?: (id: string, input: string) => void;
  onSendRaw?: (id: string, data: string) => void;
  onClearLines?: (id: string) => void;
}

function renderPanel(overrides: RenderOverrides = {}) {
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
      const dots = container.querySelectorAll('div[style*="border-radius: 50%"]');
      expect(dots).toHaveLength(3);
    });

    it('red dot click calls onClose', () => {
      const onClose = vi.fn();
      const { container } = renderPanel({ onClose });
      const dots = container.querySelectorAll('div[style*="border-radius: 50%"]');
      fireEvent.click(dots[0]);
      expect(onClose).toHaveBeenCalledWith('test-panel-1');
    });

    it('renders status dot', () => {
      renderPanel();
      const dots = screen.getAllByText('●');
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
      fireEvent.mouseDown(container.firstElementChild!);
      expect(onBringToFront).toHaveBeenCalledWith('test-panel-1');
    });
  });

  describe('Active/inactive state', () => {
    it('active panel has accent border', () => {
      const { container } = renderPanel({ isActive: true });
      const panel = container.firstElementChild as HTMLElement;
      expect(panel.style.border).toContain('rgb(45, 53, 72)');
    });

    it('inactive panel has muted border', () => {
      const { container } = renderPanel({ isActive: false });
      const panel = container.firstElementChild as HTMLElement;
      expect(panel.style.border).toContain('rgb(26, 31, 46)');
    });
  });

  describe('Mock session rendering (icons, colors, decorations)', () => {
    it('renders all session lines', () => {
      renderPanel();
      expect(screen.getByText('Session started')).toBeInTheDocument();
      expect(screen.getByText('npm start')).toBeInTheDocument();
      expect(screen.getByText('Server running on port 3000')).toBeInTheDocument();
      expect(screen.getByText('Warning: deprecated API')).toBeInTheDocument();
    });

    it('terminal body renders expected line count', () => {
      const { container } = renderPanel();
      const panel = container.firstElementChild as HTMLElement;
      const terminalBody = panel.children[1] as HTMLElement;
      // 4 line divs + 1 working indicator div (mock active session)
      expect(terminalBody.children).toHaveLength(5);
    });

    it('each line shows correct icon character', () => {
      renderPanel();
      expect(screen.getByText('·')).toBeInTheDocument();
      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByText('│')).toBeInTheDocument();
      expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('stdin lines have purple accent color', () => {
      renderPanel();
      const stdinText = screen.getByText('npm start');
      expect(stdinText.style.color).toContain('rgb(192, 132, 252)');
      expect(stdinText.style.fontWeight).toBe('500');
    });

    it('stderr lines render with red styling', () => {
      renderPanel();
      const stderrText = screen.getByText('Warning: deprecated API');
      expect(stderrText).toBeInTheDocument();
      const lineDiv = stderrText.parentElement as HTMLElement;
      expect(lineDiv.style.borderLeft).toContain('rgb(248, 113, 113)');
    });

    it('active mock session shows Working... text', () => {
      renderPanel({ panel: { ...mockPanel, session: { ...mockPanel.session, status: 'active' } } });
      expect(screen.getByText('Working...')).toBeInTheDocument();
    });

    it('idle session does not show Working... text', () => {
      renderPanel({ panel: { ...mockPanel, session: { ...mockPanel.session, status: 'idle' } } });
      expect(screen.queryByText('Working...')).not.toBeInTheDocument();
    });
  });

  describe('Live session rendering (no icons, ANSI colors, no Working...)', () => {
    it('does not render line-type icons for live panels', () => {
      renderPanel({ panel: livePanel });
      // Live panels should not have the icon characters
      expect(screen.queryByText('│')).not.toBeInTheDocument();
      expect(screen.queryByText('·')).not.toBeInTheDocument();
    });

    it('renders ANSI colored output via AnsiLine', () => {
      const { container } = renderPanel({ panel: livePanel });
      // The blue folder name should be rendered as a span with color style
      const spans = container.querySelectorAll('span[style*="color"]');
      // Should find at least one colored span from ANSI parsing
      const blueSpan = Array.from(spans).find(
        (s) => s.textContent === 'folder',
      );
      expect(blueSpan).toBeDefined();
    });

    it('does not show Working... indicator for live active session', () => {
      renderPanel({ panel: { ...livePanel, session: { ...livePanel.session, status: 'active' } } });
      expect(screen.queryByText('Working...')).not.toBeInTheDocument();
    });

    it('does not show separate input bar for live panels', () => {
      renderPanel({
        panel: livePanel,
        onSendInput: vi.fn(),
        onSendRaw: vi.fn(),
      });
      // No "Command input" aria-label input
      expect(screen.queryByLabelText('Command input')).not.toBeInTheDocument();
    });

    it('terminal body is focusable for live panels', () => {
      renderPanel({ panel: livePanel, onSendRaw: vi.fn() });
      const termBody = screen.getByTestId('live-terminal-body');
      expect(termBody.getAttribute('tabindex')).toBe('0');
    });

    it('keyDown on terminal body sends raw data for printable chars', () => {
      const onSendRaw = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.keyDown(termBody, { key: 'a' });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', 'a');
    });

    it('keyDown Enter sends \\r', () => {
      const onSendRaw = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.keyDown(termBody, { key: 'Enter' });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', '\r');
    });

    it('keyDown Ctrl+C sends \\x03', () => {
      const onSendRaw = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.keyDown(termBody, { key: 'c', ctrlKey: true });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', '\x03');
    });

    it('keyDown ArrowUp sends \\x1b[A', () => {
      const onSendRaw = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.keyDown(termBody, { key: 'ArrowUp' });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', '\x1b[A');
    });

    it('keyDown Backspace sends \\x7f', () => {
      const onSendRaw = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.keyDown(termBody, { key: 'Backspace' });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', '\x7f');
    });

    it('keyDown Tab sends \\t', () => {
      const onSendRaw = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.keyDown(termBody, { key: 'Tab' });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', '\t');
    });

    it('keyDown Ctrl+L sends \\x0c and calls onClearLines', () => {
      const onSendRaw = vi.fn();
      const onClearLines = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw, onClearLines });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.keyDown(termBody, { key: 'l', ctrlKey: true });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', '\x0c');
      expect(onClearLines).toHaveBeenCalledWith('live-panel-1');
    });

    it('onPaste sends clipboard text as raw input', () => {
      const onSendRaw = vi.fn();
      renderPanel({ panel: livePanel, onSendRaw });
      const termBody = screen.getByTestId('live-terminal-body');
      fireEvent.paste(termBody, {
        clipboardData: { getData: () => 'pasted text' },
      });
      expect(onSendRaw).toHaveBeenCalledWith('live-panel-1', 'pasted text');
    });
  });

  describe('Resize handle (US-014)', () => {
    it('resize handle element renders', () => {
      const { container } = renderPanel();
      const panel = container.firstElementChild as HTMLElement;
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
