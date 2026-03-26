"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWsUrl, type Message } from "./api";

export interface WsMessage {
  type: string;
  room_id?: number;
  user_id?: number;
  username?: string;
  content?: string;
  created_at?: string;
}

export function useWebSocket(roomId: number, token: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const typingTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!token) return;

    const url = getWsUrl(token, roomId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const data: WsMessage = JSON.parse(event.data);

      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      if (data.type === "message:new") {
        const msg: Message = {
          id: Date.now(),
          room_id: data.room_id!,
          user_id: data.user_id!,
          username: data.username!,
          content: data.content!,
          created_at: data.created_at!,
        };
        setMessages((prev) => [...prev, msg]);
        return;
      }

      if (data.type === "typing:start" && data.user_id && data.username) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.set(data.user_id!, data.username!);
          return next;
        });
        const existing = typingTimers.current.get(data.user_id);
        if (existing) clearTimeout(existing);
        typingTimers.current.set(
          data.user_id,
          setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              next.delete(data.user_id!);
              return next;
            });
          }, 3000)
        );
        return;
      }

      if (data.type === "typing:stop" && data.user_id) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.user_id!);
          return next;
        });
        return;
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
      setMessages([]);
      setTypingUsers(new Map());
      typingTimers.current.forEach(clearTimeout);
      typingTimers.current.clear();
    };
  }, [roomId, token]);

  const sendMessage = useCallback((content: string) => {
    wsRef.current?.send(JSON.stringify({ type: "message", content }));
  }, []);

  const sendTypingStart = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "typing:start" }));
  }, []);

  const sendTypingStop = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "typing:stop" }));
  }, []);

  return {
    connected,
    messages,
    typingUsers,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
  };
}
