"use client";

import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_CHAT_API_URL?.replace("ws://", "http://").replace("wss://", "https://") || "http://localhost/api";

async function fetchOnlineUsers(): Promise<number[]> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/online`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.online_users ?? [];
}

export function OnlineIndicator() {
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ["online-users"],
    queryFn: fetchOnlineUsers,
    refetchInterval: 15000,
  });

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-2 rounded-full bg-green-500" />
      <span>{onlineUsers.length} online</span>
    </div>
  );
}
