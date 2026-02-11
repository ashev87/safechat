"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomStore } from "@/stores/roomStore";
import { getCrypto, resetCrypto } from "@/lib/crypto";
import {
  getSocket,
  connectSocket,
  joinRoom,
  sendMessage,
  onMessage,
  onUserJoined,
  onUserLeft,
  disconnectSocket,
} from "@/lib/socket";
import ChatFeed from "@/components/chat/ChatFeed";
import ChatInput from "@/components/chat/ChatInput";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Copy, Users, ArrowLeft } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { 
    userId, 
    users, 
    messages, 
    isConnected,
    setRoom, 
    setUsers, 
    addUser, 
    removeUser, 
    addMessage,
    setConnected,
    reset 
  } = useRoomStore();

  useEffect(() => {
    let mounted = true;

    const initRoom = async () => {
      try {
        // Initialize crypto
        const crypto = getCrypto();
        
        // Connect to socket server
        await connectSocket();
        
        if (!mounted) return;

        // Join room with our public key
        const { userId: newUserId, users: roomUsers } = await joinRoom(
          roomId,
          crypto.publicKey,
          `User${Math.floor(Math.random() * 1000)}`
        );

        if (!mounted) return;

        setRoom(roomId, newUserId);
        setUsers(roomUsers.filter(u => u.id !== newUserId)); // Don't include ourselves
        setConnected(true);
        setIsConnecting(false);

        // Set up message listener
        const unsubMessage = onMessage((msg) => {
          try {
            // Find sender's public key
            const sender = roomUsers.find(u => u.id === msg.from);
            if (!sender) {
              console.error("Unknown sender:", msg.from);
              return;
            }

            // Decrypt message
            const decrypted = crypto.decrypt(
              msg.encrypted,
              msg.nonce,
              sender.publicKey
            );

            addMessage({
              id: msg.messageId,
              from: msg.from,
              content: decrypted,
              timestamp: msg.timestamp,
              isOwn: false,
            });
          } catch (err) {
            console.error("Failed to decrypt message:", err);
            addMessage({
              id: msg.messageId,
              from: msg.from,
              content: "[Failed to decrypt message]",
              timestamp: msg.timestamp,
              isOwn: false,
            });
          }
        });

        // User joined
        const unsubUserJoined = onUserJoined((user) => {
          addUser(user);
          addMessage({
            id: nanoid(),
            from: "system",
            content: `${user.id} joined the room`,
            timestamp: Date.now(),
            isOwn: false,
          });
        });

        // User left
        const unsubUserLeft = onUserLeft((data) => {
          removeUser(data.userId);
          addMessage({
            id: nanoid(),
            from: "system",
            content: `${data.userId} left the room`,
            timestamp: Date.now(),
            isOwn: false,
          });
        });

        return () => {
          unsubMessage();
          unsubUserJoined();
          unsubUserLeft();
        };
      } catch (err) {
        console.error("Failed to initialize room:", err);
        if (mounted) {
          setError("Failed to connect to room. Please try again.");
          setIsConnecting(false);
        }
      }
    };

    initRoom();

    return () => {
      mounted = false;
      disconnectSocket();
      resetCrypto();
      reset();
    };
  }, [roomId]);

  const handleSendMessage = (content: string) => {
    if (!userId || users.length === 0) return;

    const crypto = getCrypto();
    const messageId = nanoid();

    // Encrypt for each user in the room
    users.forEach((user) => {
      try {
        const { encrypted, nonce } = crypto.encrypt(content, user.publicKey);
        sendMessage(encrypted, nonce, messageId);
      } catch (err) {
        console.error("Failed to encrypt for user:", user.id, err);
      }
    });

    // Add to own messages
    addMessage({
      id: messageId,
      from: userId,
      content,
      timestamp: Date.now(),
      isOwn: true,
    });
  };

  const copyRoomLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = () => {
    router.push('/');
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={leaveRoom}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🔒 SafeChat
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Room: {roomId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="h-5 w-5" />
              <span>{users.length + 1}</span>
            </div>
            <Button variant="outline" size="sm" onClick={copyRoomLink}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto">
        <ChatFeed messages={messages} />
        <ChatInput onSend={handleSendMessage} disabled={!isConnected} />
      </div>
    </div>
  );
}
