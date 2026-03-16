import { render, screen, fireEvent } from '@testing-library/react';
import SpawnerModal from '@/components/SpawnerModal';
import { SPAWNER_TEMPLATES } from '@/data/mockSessions';
const renderModal = (overrides = {}) => {
  const defaultProps = {
    onSpawn: vi.fn(),
    onClose: vi.fn(),
  };
  const props = { ...defaultProps, ...overrides };
  const result = render(<SpawnerModal {...props} />);
  return { ...result, ...props };
};

describe('SpawnerModal', () => {
  it('renders "New Terminal Session" heading', () => {
    renderModal();
    expect(screen.getByText('New Terminal Session')).toBeInTheDocument();
  });

  it('renders subtext "Choose a template or start blank"', () => {
    renderModal();
    expect(screen.getByText('Choose a template or start blank')).toBeInTheDocument();
  });

  it('renders 4 template cards', () => {
    const { container } = renderModal();
    const cards = container.querySelectorAll('.spawner-option');
    expect(cards).toHaveLength(4);
  });

  it('each card shows template label', () => {
    renderModal();
    for (const template of SPAWNER_TEMPLATES) {
      expect(screen.getByText(template.label)).toBeInTheDocument();
    }
  });

  it('each card shows shell badge with correct label', () => {
    renderModal();
    // All 4 templates have shell badges — bash appears 3 times, zsh once
    const bashBadges = screen.getAllByText('bash');
    const zshBadges = screen.getAllByText('zsh');
    expect(bashBadges.length).toBe(3);
    expect(zshBadges.length).toBe(1);
  });

  it('each card shows template description', () => {
    renderModal();
    for (const template of SPAWNER_TEMPLATES) {
      expect(screen.getByText(template.desc)).toBeInTheDocument();
    }
  });

  it('clicking a template card calls onSpawn with the correct template', () => {
    const { container, onSpawn } = renderModal();
    const cards = container.querySelectorAll('.spawner-option');
    fireEvent.click(cards[0]);
    expect(onSpawn).toHaveBeenCalledTimes(1);
    expect(onSpawn).toHaveBeenCalledWith(SPAWNER_TEMPLATES[0]);
  });

  it('clicking a different template card calls onSpawn with that template', () => {
    const { container, onSpawn } = renderModal();
    const cards = container.querySelectorAll('.spawner-option');
    fireEvent.click(cards[2]);
    expect(onSpawn).toHaveBeenCalledWith(SPAWNER_TEMPLATES[2]);
  });

  it('clicking the backdrop calls onClose', () => {
    const { container, onClose } = renderModal();
    // Backdrop is the outermost div
    const backdrop = container.firstElementChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clicking inside the modal card does not call onClose', () => {
    const { onClose } = renderModal();
    const heading = screen.getByText('New Terminal Session');
    fireEvent.click(heading);
    expect(onClose).not.toHaveBeenCalled();
  });
});
