'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Shield, Lock, Video, MessageSquare, Users } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  const createRoom = () => {
    const roomId = nanoid(10);
    router.push(`/room/${roomId}`);
  };

  const joinRoom = () => {
    if (joinCode.trim()) {
      // Extract room ID from URL or use directly
      const id = joinCode.includes('/room/') 
        ? joinCode.split('/room/')[1] 
        : joinCode.trim();
      router.push(`/room/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-green-400" />
            <h1 className="text-5xl font-bold">SafeChat</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Truly secure, anonymous chat with real end-to-end encryption. 
            No accounts. No traces. Zero-knowledge server.
          </p>
        </div>

        {/* Action Cards */}
        <div className="max-w-xl mx-auto space-y-6">
          {/* Create Room */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Start a New Chat</h2>
            <p className="text-gray-400 mb-6">
              Create a secure room and share the link with others
            </p>
            <button
              onClick={createRoom}
              className="w-full py-4 px-6 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-lg transition-colors"
            >
              Create Secure Room
            </button>
          </div>

          {/* Join Room */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Join Existing Room</h2>
            <p className="text-gray-400 mb-6">
              Enter a room code or paste the invite link
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                placeholder="Room code or link..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:outline-none focus:border-green-500"
              />
              <button
                onClick={joinRoom}
                disabled={!joinCode.trim()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Feature icon={<Lock />} title="Real E2E" desc="X25519 + XSalsa20-Poly1305" />
          <Feature icon={<Users />} title="Anonymous" desc="No accounts required" />
          <Feature icon={<Video />} title="Video Calls" desc="WebRTC P2P encrypted" />
          <Feature icon={<MessageSquare />} title="Zero Knowledge" desc="Server can't read messages" />
        </div>

        {/* Security Note */}
        <div className="mt-16 text-center text-gray-500 text-sm max-w-2xl mx-auto">
          <p>
            <strong className="text-gray-400">How it works:</strong> Keys are generated in your browser. 
            Messages are encrypted before leaving your device. The server only relays encrypted blobs 
            it cannot read. When the room closes, all messages are gone forever.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center p-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-900/30 text-green-400 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
