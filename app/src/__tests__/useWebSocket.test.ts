import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '@/hooks/useWebSocket';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  // Simulate open
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  // Simulate message
  simulateMessage(data: string) {
    this.onmessage?.({ data });
  }

  // Simulate close
  simulateClose() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  static instances: MockWebSocket[] = [];
  static reset() {
    MockWebSocket.instances = [];
  }
}

describe('useWebSocket', () => {
  beforeEach(() => {
    MockWebSocket.reset();
    vi.useFakeTimers();
    (globalThis as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts disconnected', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    expect(result.current.connected).toBe(false);
  });

  it('connects and sets connected to true on open', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });
    expect(result.current.connected).toBe(true);
  });

  it('sets connected to false on close', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });
    expect(result.current.connected).toBe(true);
    act(() => {
      ws.simulateClose();
    });
    expect(result.current.connected).toBe(false);
  });

  it('sends messages when connected', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });
    act(() => {
      result.current.send({ type: 'session.input', id: 'test', data: 'hello' });
    });
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'session.input', id: 'test', data: 'hello' }),
    );
  });

  it('queues messages sent while disconnected and flushes on connect', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];

    // Send while still CONNECTING — should be queued
    act(() => {
      result.current.send({ type: 'session.create', id: 's1', shell: 'bash', cwd: '~' });
      result.current.send({ type: 'session.input', id: 's1', data: 'pwd\n' });
    });
    expect(ws.send).not.toHaveBeenCalled();

    // Now open — queued messages should flush
    act(() => {
      ws.simulateOpen();
    });
    expect(ws.send).toHaveBeenCalledTimes(2);
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'session.create', id: 's1', shell: 'bash', cwd: '~' }),
    );
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'session.input', id: 's1', data: 'pwd\n' }),
    );
  });

  it('dispatches messages to subscribers by session id', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    const callback = vi.fn();
    act(() => {
      result.current.subscribe('session-1', callback);
    });

    act(() => {
      ws.simulateMessage(JSON.stringify({ type: 'session.output', id: 'session-1', data: 'hello' }));
    });

    expect(callback).toHaveBeenCalledWith({
      type: 'session.output',
      id: 'session-1',
      data: 'hello',
    });
  });

  it('does not dispatch to unrelated subscribers', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    const callback = vi.fn();
    act(() => {
      result.current.subscribe('session-1', callback);
    });

    act(() => {
      ws.simulateMessage(JSON.stringify({ type: 'session.output', id: 'session-2', data: 'hello' }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('unsubscribe removes the callback', () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    const callback = vi.fn();
    let unsub: () => void;
    act(() => {
      unsub = result.current.subscribe('session-1', callback);
    });

    act(() => {
      unsub();
    });

    act(() => {
      ws.simulateMessage(JSON.stringify({ type: 'session.output', id: 'session-1', data: 'hello' }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('attempts reconnect with backoff on close', () => {
    renderHook(() => useWebSocket('/ws'));
    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });
    act(() => {
      ws.simulateClose();
    });
    // After 1s, should attempt reconnect
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // A new WebSocket instance should have been created
    expect(MockWebSocket.instances.length).toBe(2);
  });
});
