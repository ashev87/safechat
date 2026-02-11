"use client";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  timestamp: number;
  fromName?: string;
}

export default function MessageBubble({ content, isOwn, timestamp, fromName }: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={cn("flex flex-col mb-4", isOwn ? "items-end" : "items-start")}>
      {!isOwn && fromName && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
          {fromName}
        </span>
      )}
      <div
        className={cn(
          "max-w-[70%] px-4 py-2 rounded-2xl",
          isOwn
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
        )}
      >
        <p className="break-words">{content}</p>
      </div>
      <span className="text-xs text-gray-400 mt-1 px-2">{time}</span>
    </div>
  );
}
