"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { RoomsSidebar } from "./_components/rooms-sidebar";
import { ChatRoom } from "./_components/chat-room";
import { OnlineIndicator } from "./_components/online-indicator";
import { NotificationsPanel, NotificationsBell } from "./_components/notifications-panel";

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(50),
    refetchInterval: 10000,
  });

  const unreadCount = notifData?.items.filter((n) => !n.is_read).length ?? 0;

  return (
    <>
      <RoomsSidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
      />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-4 py-1.5">
          <OnlineIndicator />
          <NotificationsBell onClick={() => setNotifOpen(!notifOpen)} count={unreadCount} />
        </div>
        <main className="flex flex-1 flex-col overflow-hidden">
          {selectedRoomId ? (
            <ChatRoom key={selectedRoomId} roomId={selectedRoomId} />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Select a room to start chatting</p>
            </div>
          )}
        </main>
      </div>
      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigateToRoom={(id) => setSelectedRoomId(id)}
      />
    </>
  );
}
