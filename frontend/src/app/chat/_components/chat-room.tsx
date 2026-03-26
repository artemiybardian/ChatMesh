"use client";

import { useAuth } from "@/lib/auth-context";
import { useWebSocket } from "@/lib/use-websocket";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

interface ChatRoomProps {
  roomId: number;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const { token } = useAuth();
  const {
    connected,
    messages: realtimeMessages,
    typingUsers,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
  } = useWebSocket(roomId, token);

  const typingNames = Array.from(typingUsers.values());

  return (
    <div className="flex flex-1 flex-col">
      <MessageList roomId={roomId} realtimeMessages={realtimeMessages} />
      {typingNames.length > 0 && (
        <div className="px-4 pb-1 text-xs text-muted-foreground animate-pulse">
          {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing...
        </div>
      )}
      <MessageInput
        onSend={sendMessage}
        onTypingStart={sendTypingStart}
        onTypingStop={sendTypingStop}
        disabled={!connected}
      />
    </div>
  );
}
