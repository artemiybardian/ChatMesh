"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, type Notification } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigateToRoom?: (roomId: number) => void;
}

export function NotificationsPanel({ open, onClose, onNavigateToRoom }: NotificationsPanelProps) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(50),
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.items ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!open) return null;

  function handleClick(n: Notification) {
    if (!n.is_read) markReadMutation.mutate(n.id);
    if (n.room_id && onNavigateToRoom) onNavigateToRoom(n.room_id);
    onClose();
  }

  return (
    <div className="absolute right-4 top-12 z-50 w-80 rounded-lg border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b p-3">
        <span className="text-sm font-medium">Notifications</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => markAllMutation.mutate()}
            >
              Mark all read
            </Button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">
            ✕
          </button>
        </div>
      </div>
      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "flex flex-col gap-0.5 p-3 text-left text-sm border-b last:border-b-0 hover:bg-muted transition-colors",
                  !n.is_read && "bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{n.title}</span>
                  {!n.is_read && (
                    <span className="size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate">{n.body}</span>
                <span className="text-xs text-muted-foreground/60">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export function NotificationsBell({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button onClick={onClick} className="relative text-muted-foreground hover:text-foreground transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
