"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RoomsSidebarProps {
  selectedRoomId: number | null;
  onSelectRoom: (id: number) => void;
}

export function RoomsSidebar({ selectedRoomId, onSelectRoom }: RoomsSidebarProps) {
  const queryClient = useQueryClient();
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: chatApi.getRooms,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => chatApi.createRoom(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setNewRoomName("");
      setShowCreate(false);
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newRoomName.trim();
    if (!name) return;
    createMutation.mutate(name);
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-medium">Rooms</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "✕" : "+"}
        </Button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="flex gap-2 p-3 border-b">
          <Input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            className="h-7 text-sm"
            autoFocus
          />
          <Button size="sm" disabled={createMutation.isPending}>
            Add
          </Button>
        </form>
      )}

      <ScrollArea className="flex-1">
        {isLoading ? (
          <p className="p-3 text-sm text-muted-foreground">Loading...</p>
        ) : rooms.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No rooms yet</p>
        ) : (
          <div className="flex flex-col gap-0.5 p-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
                  selectedRoomId === room.id && "bg-muted font-medium"
                )}
              >
                <span className="text-muted-foreground">#</span>
                <span className="truncate">{room.name}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
