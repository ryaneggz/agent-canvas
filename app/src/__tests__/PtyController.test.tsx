import { render, act } from '@testing-library/react';
import PtyController from '@/components/PtyController';
import type { PanelState } from '@/types';

// Mock usePtySession
vi.mock('@/hooks/usePtySession', () => ({
  usePtySession: vi.fn(() => ({ sendInput: vi.fn(), sendRaw: vi.fn() })),
}));

import { usePtySession } from '@/hooks/usePtySession';

describe('PtyController', () => {
  const makePanel = (): PanelState => ({
    id: 'pty-1',
    session: {
      name: 'test',
      status: 'active',
      shell: 'bash',
      cwd: '/tmp',
      lines: [],
    },
    x: 0,
    y: 0,
    w: 520,
    h: 380,
    z: 1,
    live: true,
  });

  const makeProps = () => ({
    panel: makePanel(),
    send: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe: vi.fn(() => vi.fn()) as any,
    onOutput: vi.fn(),
    onStatusChange: vi.fn(),
    onSendInputReady: vi.fn(),
  });

  it('renders null (headless)', async () => {
    const props = makeProps();
    let container: HTMLElement;
    await act(async () => {
      const result = render(<PtyController {...props} />);
      container = result.container;
    });
    expect(container!.innerHTML).toBe('');
  });

  it('calls usePtySession with correct params', async () => {
    const props = makeProps();
    await act(async () => {
      render(<PtyController {...props} />);
    });
    expect(usePtySession).toHaveBeenCalledWith(
      expect.objectContaining({
        panelId: 'pty-1',
        shell: 'bash',
        cwd: '/tmp',
      }),
    );
  });

  it('calls onSendInputReady with panel id and sendInput function', async () => {
    const props = makeProps();
    await act(async () => {
      render(<PtyController {...props} />);
    });
    expect(props.onSendInputReady).toHaveBeenCalledWith('pty-1', expect.objectContaining({
      sendInput: expect.any(Function),
      sendRaw: expect.any(Function),
    }));
  });
});
