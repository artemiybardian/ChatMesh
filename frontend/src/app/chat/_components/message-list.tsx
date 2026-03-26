"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatApi, type Message } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageListProps {
  roomId: number;
  realtimeMessages: Message[];
}

export function MessageList({ roomId, realtimeMessages }: MessageListProps) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => chatApi.getMessages(roomId, 100),
  });

  const historyMessages = data?.items ?? [];
  const allMessages = [...historyMessages, ...realtimeMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">No messages yet. Say something!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 gap-3">
      {allMessages.map((msg, i) => {
        const isOwn = msg.user_id === user?.id;
        const showAvatar =
          i === 0 || allMessages[i - 1].user_id !== msg.user_id;

        return (
          <div
            key={msg.id ?? `rt-${i}`}
            className={cn("flex gap-2", isOwn && "flex-row-reverse")}
          >
            {showAvatar ? (
              <Avatar size="sm">
                <AvatarFallback>
                  {msg.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-6 shrink-0" />
            )}
            <div className={cn("flex flex-col max-w-md", isOwn && "items-end")}>
              {showAvatar && (
                <span className="text-xs text-muted-foreground mb-0.5">
                  {msg.username}
                  <span className="ml-2 opacity-50">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              )}
              <div
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm break-words",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
