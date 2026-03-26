"use client";

import { useState } from "react";
import { RoomsSidebar } from "./_components/rooms-sidebar";

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  return (
    <>
      <RoomsSidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
      />
      <main className="flex flex-1 items-center justify-center">
        {selectedRoomId ? (
          <p className="text-muted-foreground">Room #{selectedRoomId} — messages coming soon</p>
        ) : (
          <p className="text-muted-foreground">Select a room to start chatting</p>
        )}
      </main>
    </>
  );
}
