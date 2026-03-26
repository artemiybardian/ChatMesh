"use client";

import { useState } from "react";
import { type Message } from "@/lib/api";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

interface ChatRoomProps {
  roomId: number;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);

  function handleSend(_content: string) {
    // WebSocket integration in next commit
  }

  return (
    <div className="flex flex-1 flex-col">
      <MessageList roomId={roomId} realtimeMessages={realtimeMessages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
