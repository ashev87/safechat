"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { ChatMessage } from "@/stores/roomStore";

interface ChatFeedProps {
  messages: ChatMessage[];
}

export default function ChatFeed({ messages }: ChatFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <p>No messages yet. Start the conversation! 🔒</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              isOwn={msg.isOwn}
              timestamp={msg.timestamp}
            />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
