import { render } from '@testing-library/react';
import AnsiLine from '@/components/AnsiLine';

describe('AnsiLine', () => {
  it('renders plain text without spans styling', () => {
    const { container } = render(<AnsiLine text="hello world" />);
    expect(container.textContent).toBe('hello world');
  });

  it('renders colored text with inline styles', () => {
    const { container } = render(<AnsiLine text={'\x1b[31mERROR\x1b[0m ok'} />);
    const spans = container.querySelectorAll('span');
    // Two spans: red "ERROR" and plain " ok"
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('ERROR');
    expect(spans[0].style.color).toContain('rgb(248, 113, 113)');
    expect(spans[1].textContent).toBe(' ok');
  });

  it('renders bold text', () => {
    const { container } = render(<AnsiLine text={'\x1b[1mBOLD\x1b[0m'} />);
    const span = container.querySelector('span');
    expect(span?.style.fontWeight).toBe('bold');
  });

  it('renders multiple colors', () => {
    const { container } = render(
      <AnsiLine text={'\x1b[32mgreen\x1b[0m \x1b[34mblue\x1b[0m'} />,
    );
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(3); // green, " ", blue
    expect(spans[0].textContent).toBe('green');
    expect(spans[2].textContent).toBe('blue');
  });
});
