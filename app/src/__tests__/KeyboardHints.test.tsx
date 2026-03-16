import { render, screen } from '@testing-library/react';
import KeyboardHints from '@/components/KeyboardHints';

describe('KeyboardHints', () => {
  it('renders Drag background to pan text', () => {
    render(<KeyboardHints />);
    expect(screen.getByText(/Drag background to pan/)).toBeInTheDocument();
  });

  it('renders scroll to zoom text', () => {
    render(<KeyboardHints />);
    expect(screen.getByText(/scroll to zoom/)).toBeInTheDocument();
  });

  it('renders Drag title bar to move text', () => {
    render(<KeyboardHints />);
    expect(screen.getByText(/Drag title bar to move/)).toBeInTheDocument();
  });

  it('renders Corner handle to resize text', () => {
    render(<KeyboardHints />);
    expect(screen.getByText(/Corner handle to resize/)).toBeInTheDocument();
  });
});
