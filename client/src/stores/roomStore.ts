/**
 * Room State Store (Zustand)
 */

import { create } from 'zustand';

export interface User {
  id: string;
  publicKey: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  content: string;
  timestamp: number;
  isOwn: boolean;
}

interface RoomState {
  roomId: string | null;
  userId: string | null;
  users: User[];
  messages: ChatMessage[];
  typingUsers: Set<string>;
  isConnected: boolean;
  
  // Actions
  setRoom: (roomId: string, userId: string) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  userId: null,
  users: [],
  messages: [],
  typingUsers: new Set(),
  isConnected: false,

  setRoom: (roomId, userId) => set({ roomId, userId }),
  
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({ 
    users: [...state.users, user] 
  })),
  
  removeUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId)
  })),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setTyping: (userId, isTyping) => set((state) => {
    const newTyping = new Set(state.typingUsers);
    if (isTyping) {
      newTyping.add(userId);
    } else {
      newTyping.delete(userId);
    }
    return { typingUsers: newTyping };
  }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  reset: () => set({
    roomId: null,
    userId: null,
    users: [],
    messages: [],
    typingUsers: new Set(),
    isConnected: false,
  }),
}));
