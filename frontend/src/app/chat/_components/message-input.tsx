"use client";

import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTypingStart, onTypingStop, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const typingRef = useRef(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback(() => {
    if (!typingRef.current) {
      typingRef.current = true;
      onTypingStart?.();
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
      onTypingStop?.();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content) return;
    onSend(content);
    setValue("");
    if (typingRef.current) {
      typingRef.current = false;
      onTypingStop?.();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleTyping();
        }}
        placeholder={disabled ? "Connecting..." : "Type a message..."}
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
