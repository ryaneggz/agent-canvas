import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock node-pty before importing sessions
const mockPty = {
  write: vi.fn(),
  resize: vi.fn(),
  kill: vi.fn(),
  onData: vi.fn(),
  onExit: vi.fn(),
};

vi.mock('node-pty', () => ({
  spawn: vi.fn(() => mockPty),
}));

import {
  createSession,
  sendInput,
  resizeSession,
  closeSession,
  getSessionCount,
  cleanupAll,
} from '../sessions.js';
import * as pty from 'node-pty';

function makeMockWs() {
  return {
    OPEN: 1,
    readyState: 1,
    send: vi.fn(),
  } as unknown as import('ws').WebSocket;
}

describe('sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanupAll();
    // Reset onData/onExit mocks to capture new callbacks
    mockPty.onData.mockReset();
    mockPty.onExit.mockReset();
  });

  describe('createSession', () => {
    it('spawns a PTY with the given shell and cwd', () => {
      const ws = makeMockWs();
      createSession(ws, 'test-1', 'bash', '/tmp');
      expect(pty.spawn).toHaveBeenCalledWith(
        'bash',
        [],
        expect.objectContaining({
          cwd: '/tmp',
          cols: 80,
          rows: 24,
        }),
      );
    });

    it('increments session count', () => {
      const ws = makeMockWs();
      expect(getSessionCount()).toBe(0);
      createSession(ws, 'test-2', 'bash', '/tmp');
      expect(getSessionCount()).toBe(1);
    });

    it('sends error if session id already exists', () => {
      const ws = makeMockWs();
      createSession(ws, 'dup', 'bash', '/tmp');
      createSession(ws, 'dup', 'bash', '/tmp');
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('Session already exists'),
      );
    });

    it('resolves ~ in cwd to HOME', () => {
      const ws = makeMockWs();
      const origHome = process.env.HOME;
      process.env.HOME = '/home/testuser';
      createSession(ws, 'tilde-test', 'bash', '~/projects');
      expect(pty.spawn).toHaveBeenCalledWith(
        'bash',
        [],
        expect.objectContaining({
          cwd: '/home/testuser/projects',
        }),
      );
      process.env.HOME = origHome;
    });

    it('registers onData and onExit handlers', () => {
      const ws = makeMockWs();
      createSession(ws, 'handler-test', 'bash', '/tmp');
      expect(mockPty.onData).toHaveBeenCalledOnce();
      expect(mockPty.onExit).toHaveBeenCalledOnce();
    });
  });

  describe('sendInput', () => {
    it('writes data to the PTY', () => {
      const ws = makeMockWs();
      createSession(ws, 'input-test', 'bash', '/tmp');
      sendInput('input-test', 'ls\n');
      expect(mockPty.write).toHaveBeenCalledWith('ls\n');
    });

    it('is a no-op for non-existent sessions', () => {
      sendInput('nonexistent', 'ls\n');
      expect(mockPty.write).not.toHaveBeenCalled();
    });
  });

  describe('resizeSession', () => {
    it('resizes the PTY', () => {
      const ws = makeMockWs();
      createSession(ws, 'resize-test', 'bash', '/tmp');
      resizeSession('resize-test', 120, 40);
      expect(mockPty.resize).toHaveBeenCalledWith(120, 40);
    });

    it('is a no-op for non-existent sessions', () => {
      resizeSession('nonexistent', 120, 40);
      expect(mockPty.resize).not.toHaveBeenCalled();
    });
  });

  describe('closeSession', () => {
    it('kills the PTY and removes the session', () => {
      const ws = makeMockWs();
      createSession(ws, 'close-test', 'bash', '/tmp');
      expect(getSessionCount()).toBe(1);
      closeSession('close-test');
      expect(mockPty.kill).toHaveBeenCalled();
      expect(getSessionCount()).toBe(0);
    });

    it('is a no-op for non-existent sessions', () => {
      closeSession('nonexistent');
      expect(mockPty.kill).not.toHaveBeenCalled();
    });
  });

  describe('onData handler', () => {
    it('sends batched output messages for complete lines', () => {
      vi.useFakeTimers();
      const ws = makeMockWs();
      createSession(ws, 'data-test', 'bash', '/tmp');
      const onDataCb = mockPty.onData.mock.calls[0][0] as (data: string) => void;
      onDataCb('hello world\n');
      // Output is batched — need to flush the 16ms timer
      vi.advanceTimersByTime(20);
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'session.output', id: 'data-test', data: ['hello world'] }),
      );
      vi.useRealTimers();
    });

    it('strips ANSI escape codes from output', () => {
      vi.useFakeTimers();
      const ws = makeMockWs();
      createSession(ws, 'ansi-test', 'bash', '/tmp');
      const onDataCb = mockPty.onData.mock.calls[0][0] as (data: string) => void;
      onDataCb('\x1b[32mgreen text\x1b[0m\n');
      vi.advanceTimersByTime(20);
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'session.output', id: 'ansi-test', data: ['green text'] }),
      );
      vi.useRealTimers();
    });

    it('strips cursor movement and OSC codes', () => {
      vi.useFakeTimers();
      const ws = makeMockWs();
      createSession(ws, 'csi-test', 'bash', '/tmp');
      const onDataCb = mockPty.onData.mock.calls[0][0] as (data: string) => void;
      // Cursor up, cursor save, OSC title, charset designator
      onDataCb('\x1b[Ahello\x1b7\x1b]0;title\x07\x1b(B world\n');
      vi.advanceTimersByTime(20);
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'session.output', id: 'csi-test', data: ['hello world'] }),
      );
      vi.useRealTimers();
    });

    it('handles carriage returns by overwriting', () => {
      vi.useFakeTimers();
      const ws = makeMockWs();
      createSession(ws, 'cr-test', 'bash', '/tmp');
      const onDataCb = mockPty.onData.mock.calls[0][0] as (data: string) => void;
      onDataCb('progress 10%\rprogress 50%\n');
      vi.advanceTimersByTime(20);
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'session.output', id: 'cr-test', data: ['progress 50%'] }),
      );
      vi.useRealTimers();
    });
  });

  describe('onExit handler', () => {
    it('sends exit message and removes session', () => {
      vi.useFakeTimers();
      const ws = makeMockWs();
      createSession(ws, 'exit-test', 'bash', '/tmp');
      const onExitCb = mockPty.onExit.mock.calls[0][0] as (e: { exitCode: number }) => void;
      onExitCb({ exitCode: 0 });
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'session.exit', id: 'exit-test', code: 0 }),
      );
      vi.useRealTimers();
    });
  });

  describe('cleanupAll', () => {
    it('kills all sessions', () => {
      const ws = makeMockWs();
      createSession(ws, 'a', 'bash', '/tmp');
      createSession(ws, 'b', 'bash', '/tmp');
      expect(getSessionCount()).toBe(2);
      cleanupAll();
      expect(getSessionCount()).toBe(0);
    });
  });
});
