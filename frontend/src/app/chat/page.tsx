"use client";

import { useState } from "react";
import { RoomsSidebar } from "./_components/rooms-sidebar";
import { ChatRoom } from "./_components/chat-room";

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  return (
    <>
      <RoomsSidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
      />
      <main className="flex flex-1 flex-col">
        {selectedRoomId ? (
          <ChatRoom key={selectedRoomId} roomId={selectedRoomId} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Select a room to start chatting</p>
          </div>
        )}
      </main>
    </>
  );
}
