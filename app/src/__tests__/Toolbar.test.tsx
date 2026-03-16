import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from '@/components/Toolbar';

const defaultProps = {
  panelCount: 4,
  zoom: 1,
  onNewSession: vi.fn(),
  onTile: vi.fn(),
  onResetView: vi.fn(),
};

function renderToolbar(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  // Reset mocks for each render
  (props.onNewSession as ReturnType<typeof vi.fn>).mockClear();
  (props.onTile as ReturnType<typeof vi.fn>).mockClear();
  (props.onResetView as ReturnType<typeof vi.fn>).mockClear();
  return render(<Toolbar {...props} />);
}

describe('Toolbar', () => {
  it('renders Agent Canvas logo text', () => {
    renderToolbar();
    expect(screen.getByText('Agent Canvas')).toBeInTheDocument();
  });

  it('renders >_ logo icon', () => {
    renderToolbar();
    expect(screen.getByText('>_')).toBeInTheDocument();
  });

  it('renders + New Session button', () => {
    renderToolbar();
    expect(screen.getByText('+ New Session')).toBeInTheDocument();
  });

  it('renders Tile button', () => {
    renderToolbar();
    expect(screen.getByText(/Tile/)).toBeInTheDocument();
  });

  it('renders Reset View button', () => {
    renderToolbar();
    expect(screen.getByText(/Reset View/)).toBeInTheDocument();
  });

  it('displays status text with session count and zoom percentage', () => {
    renderToolbar({ panelCount: 4, zoom: 1 });
    expect(screen.getByText('4 session(s) · 100%')).toBeInTheDocument();
  });

  it('displays updated session count', () => {
    renderToolbar({ panelCount: 2, zoom: 0.75 });
    expect(screen.getByText('2 session(s) · 75%')).toBeInTheDocument();
  });

  it('clicking + New Session calls onNewSession', () => {
    const onNewSession = vi.fn();
    renderToolbar({ onNewSession });
    fireEvent.click(screen.getByText('+ New Session'));
    expect(onNewSession).toHaveBeenCalledTimes(1);
  });

  it('clicking Tile calls onTile', () => {
    const onTile = vi.fn();
    renderToolbar({ onTile });
    fireEvent.click(screen.getByText(/Tile/));
    expect(onTile).toHaveBeenCalledTimes(1);
  });

  it('clicking Reset View calls onResetView', () => {
    const onResetView = vi.fn();
    renderToolbar({ onResetView });
    fireEvent.click(screen.getByText(/Reset View/));
    expect(onResetView).toHaveBeenCalledTimes(1);
  });
});
