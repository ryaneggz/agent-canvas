import { useRef, useState, useEffect, useCallback } from 'react';
import type { WsClientMessage, WsServerMessage } from '@/types';

type SubscriptionCallback = (msg: WsServerMessage) => void;

export function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const subsRef = useRef<Map<string, Set<SubscriptionCallback>>>(new Map());
  const retryRef = useRef(0);
  const queueRef = useRef<WsClientMessage[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlRef = useRef(url);

  // Store connect in a ref so onclose can call it without circular dependency
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  useEffect(() => {
    connectRef.current = () => {
      if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = urlRef.current.startsWith('ws')
        ? urlRef.current
        : `${protocol}//${window.location.host}${urlRef.current}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
        // Flush queued messages
        const pending = queueRef.current;
        queueRef.current = [];
        for (const msg of pending) {
          ws.send(JSON.stringify(msg));
        }
      };

      ws.onmessage = (event) => {
        let msg: WsServerMessage;
        try {
          msg = JSON.parse(event.data as string);
        } catch {
          return;
        }

        const id = (msg as { id?: string }).id;
        if (!id) return;

        const callbacks = subsRef.current.get(id);
        if (callbacks) {
          callbacks.forEach((cb) => cb(msg));
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        // Exponential backoff: 1s, 2s, 4s, max 10s
        const delay = Math.min(1000 * Math.pow(2, retryRef.current), 10000);
        retryRef.current += 1;
        timerRef.current = setTimeout(() => connectRef.current(), delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectRef.current();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, []);

  const send = useCallback((msg: WsClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      queueRef.current.push(msg);
    }
  }, []);

  const subscribe = useCallback(
    (sessionId: string, callback: SubscriptionCallback) => {
      if (!subsRef.current.has(sessionId)) {
        subsRef.current.set(sessionId, new Set());
      }
      subsRef.current.get(sessionId)!.add(callback);

      return () => {
        const callbacks = subsRef.current.get(sessionId);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            subsRef.current.delete(sessionId);
          }
        }
      };
    },
    [],
  );

  return { connected, send, subscribe };
}
