import { renderHook, act } from '@testing-library/react';
import { usePtySession } from '@/hooks/usePtySession';
import type { WsServerMessage } from '@/types';

describe('usePtySession', () => {
  const makeMocks = () => {
    const send = vi.fn();
    const onOutput = vi.fn();
    const onRemoveLines = vi.fn();
    const onPartial = vi.fn();
    const onStatusChange = vi.fn();
    let capturedCallback: ((msg: WsServerMessage) => void) | null = null;
    const unsubscribe = vi.fn();
    const subscribe = vi.fn((sessionId: string, cb: (msg: WsServerMessage) => void) => {
      void sessionId;
      capturedCallback = cb;
      return unsubscribe;
    });

    return {
      send,
      subscribe,
      onOutput,
      onRemoveLines,
      onPartial,
      onStatusChange,
      unsubscribe,
      getCb: () => capturedCallback!,
    };
  };

  it('sends session.create on mount', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    expect(mocks.send).toHaveBeenCalledWith({
      type: 'session.create',
      id: 'p1',
      shell: 'bash',
      cwd: '/tmp',
    });
  });

  it('sends session.create with cols/rows when provided', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        cols: 100,
        rows: 30,
        ...mocks,
      }),
    );
    expect(mocks.send).toHaveBeenCalledWith({
      type: 'session.create',
      id: 'p1',
      shell: 'bash',
      cwd: '/tmp',
      cols: 100,
      rows: 30,
    });
  });

  it('subscribes for the session id', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    expect(mocks.subscribe).toHaveBeenCalledWith('p1', expect.any(Function));
  });

  it('sends session.close on unmount', () => {
    const mocks = makeMocks();
    const { unmount } = renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    unmount();
    expect(mocks.send).toHaveBeenCalledWith({
      type: 'session.close',
      id: 'p1',
    });
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });

  it('calls onOutput for session.output messages', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    act(() => {
      mocks.getCb()({ type: 'session.output', id: 'p1', data: 'hello world' });
    });
    expect(mocks.onOutput).toHaveBeenCalledWith('p1', { t: 'stdout', v: 'hello world' });
  });

  it('calls onOutput for each line in batched session.output', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    act(() => {
      mocks.getCb()({ type: 'session.output', id: 'p1', data: ['line1', 'line2', 'line3'] });
    });
    expect(mocks.onOutput).toHaveBeenCalledTimes(3);
    expect(mocks.onOutput).toHaveBeenCalledWith('p1', { t: 'stdout', v: 'line1' });
    expect(mocks.onOutput).toHaveBeenCalledWith('p1', { t: 'stdout', v: 'line2' });
    expect(mocks.onOutput).toHaveBeenCalledWith('p1', { t: 'stdout', v: 'line3' });
  });

  it('sendRaw sends data to PTY without echo', () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    act(() => {
      result.current.sendRaw('\x03');
    });
    expect(mocks.send).toHaveBeenCalledWith({
      type: 'session.input',
      id: 'p1',
      data: '\x03',
    });
    // sendRaw should NOT echo as stdin
    expect(mocks.onOutput).not.toHaveBeenCalled();
  });

  it('calls onStatusChange with idle for exit code 0', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    act(() => {
      mocks.getCb()({ type: 'session.exit', id: 'p1', code: 0 });
    });
    expect(mocks.onStatusChange).toHaveBeenCalledWith('p1', 'idle');
  });

  it('calls onStatusChange with error for non-zero exit code', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    act(() => {
      mocks.getCb()({ type: 'session.exit', id: 'p1', code: 1 });
    });
    expect(mocks.onStatusChange).toHaveBeenCalledWith('p1', 'error');
  });

  it('calls onOutput with stderr for session.error messages', () => {
    const mocks = makeMocks();
    renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    act(() => {
      mocks.getCb()({ type: 'session.error', id: 'p1', error: 'spawn failed' });
    });
    expect(mocks.onOutput).toHaveBeenCalledWith('p1', { t: 'stderr', v: 'spawn failed' });
    expect(mocks.onStatusChange).toHaveBeenCalledWith('p1', 'error');
  });

  it('sendInput sends to PTY without local echo', () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      usePtySession({
        panelId: 'p1',
        shell: 'bash',
        cwd: '/tmp',
        ...mocks,
      }),
    );
    act(() => {
      result.current.sendInput('ls -la');
    });
    // No local stdin echo — PTY handles echo
    expect(mocks.onOutput).not.toHaveBeenCalled();
    expect(mocks.send).toHaveBeenCalledWith({
      type: 'session.input',
      id: 'p1',
      data: 'ls -la\n',
    });
  });
});
