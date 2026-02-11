/**
 * Socket.IO Client for SafeChat
 * Handles real-time communication with the relay server
 */

import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002';

let socket: Socket | null = null;

export interface User {
  id: string;
  publicKey: string;
}

export interface Message {
  from: string;
  encrypted: string;
  nonce: string;
  messageId: string;
  timestamp: number;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    
    if (s.connected) {
      resolve();
      return;
    }

    s.connect();

    s.once('connect', () => {
      console.log('[Socket] Connected');
      resolve();
    });

    s.once('connect_error', (err) => {
      console.error('[Socket] Connection error:', err);
      reject(err);
    });
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(
  roomId: string, 
  publicKey: string, 
  userName?: string
): Promise<{ userId: string; users: User[] }> {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    
    s.emit('join-room', { roomId, publicKey, userName });

    s.once('room-joined', (data: { userId: string; users: User[]; roomId: string }) => {
      console.log('[Socket] Joined room:', data.roomId);
      resolve({ userId: data.userId, users: data.users });
    });

    // Timeout after 10s
    setTimeout(() => reject(new Error('Join timeout')), 10000);
  });
}

export function sendMessage(encrypted: string, nonce: string, messageId: string): void {
  getSocket().emit('send-message', { encrypted, nonce, messageId });
}

export function sendTyping(isTyping: boolean): void {
  getSocket().emit('typing', { isTyping });
}

// WebRTC signaling
export function sendCallSignal(to: string, signal: unknown): void {
  getSocket().emit('call-signal', { to, signal });
}

export function startCall(type: 'audio' | 'video'): void {
  getSocket().emit('call-start', { type });
}

export function endCall(): void {
  getSocket().emit('call-end');
}

// Event listeners
export function onMessage(callback: (msg: Message) => void): () => void {
  const s = getSocket();
  s.on('message', callback);
  return () => s.off('message', callback);
}

export function onUserJoined(callback: (user: User) => void): () => void {
  const s = getSocket();
  s.on('user-joined', callback);
  return () => s.off('user-joined', callback);
}

export function onUserLeft(callback: (data: { userId: string }) => void): () => void {
  const s = getSocket();
  s.on('user-left', callback);
  return () => s.off('user-left', callback);
}

export function onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): () => void {
  const s = getSocket();
  s.on('typing', callback);
  return () => s.off('typing', callback);
}

export function onCallSignal(callback: (data: { from: string; signal: unknown }) => void): () => void {
  const s = getSocket();
  s.on('call-signal', callback);
  return () => s.off('call-signal', callback);
}

export function onCallIncoming(callback: (data: { from: string; type: 'audio' | 'video' }) => void): () => void {
  const s = getSocket();
  s.on('call-incoming', callback);
  return () => s.off('call-incoming', callback);
}

export function onCallEnded(callback: (data: { from: string }) => void): () => void {
  const s = getSocket();
  s.on('call-ended', callback);
  return () => s.off('call-ended', callback);
}
