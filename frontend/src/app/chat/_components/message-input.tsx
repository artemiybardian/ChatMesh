"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content) return;
    onSend(content);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        autoFocus
        className="flex-1"
      />
      <Button size="lg" disabled={disabled || !value.trim()}>
        Send
      </Button>
    </form>
  );
}
