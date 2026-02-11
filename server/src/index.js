/**
 * SafeChat Server - Zero-Knowledge Relay
 * 
 * This server:
 * - Relays encrypted messages (never decrypts)
 * - Manages WebRTC signaling
 * - Handles room membership
 * - Stores NOTHING permanently
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';

const PORT = process.env.PORT || 3002;

// In-memory room storage (ephemeral)
const rooms = new Map();

// Room structure:
// {
//   id: string,
//   users: Map<socketId, {id, publicKey, userName?>>,
//   createdAt: Date
// }

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  maxHttpBufferSize: 5e6 // 5MB for file sharing
});

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);
  
  let currentRoomId = null;

  // Join or create room
  socket.on('join-room', ({ roomId, publicKey, userName }) => {
    if (!roomId || !publicKey) {
      socket.emit('error', { message: 'Missing roomId or publicKey' });
      return;
    }

    // Leave previous room if any
    if (currentRoomId) {
      leaveRoom(socket, currentRoomId);
    }

    // Create room if doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        createdAt: new Date()
      });
      console.log(`[${new Date().toISOString()}] Room created: ${roomId}`);
    }

    const room = rooms.get(roomId);
    const userId = nanoid(8);

    // Add user to room
    room.users.set(socket.id, {
      id: userId,
      publicKey,
      userName: userName || `User${room.users.size + 1}`
    });

    socket.join(roomId);
    currentRoomId = roomId;

    // Send current users to the new joiner
    const existingUsers = Array.from(room.users.values()).map(u => ({
      id: u.id,
      publicKey: u.publicKey,
      userName: u.userName
    }));

    socket.emit('room-joined', {
      roomId,
      userId,
      users: existingUsers
    });

    // Notify others
    socket.to(roomId).emit('user-joined', {
      id: userId,
      publicKey,
      userName: userName || `User${room.users.size}`
    });

    console.log(`[${new Date().toISOString()}] ${userName || userId} joined room ${roomId} (${room.users.size} users)`);
  });

  // Relay encrypted message
  socket.on('send-message', ({ encrypted, nonce, messageId, recipientId }) => {
    if (!currentRoomId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    const room = rooms.get(currentRoomId);
    if (!room) return;

    const sender = room.users.get(socket.id);
    if (!sender) return;

    // Relay encrypted message (server can't read it!)
    const messageData = {
      from: sender.id,
      fromName: sender.userName,
      encrypted,
      nonce,
      messageId,
      timestamp: Date.now()
    };

    if (recipientId) {
      // Direct message to specific user
      const recipientSocket = Array.from(room.users.entries())
        .find(([_, user]) => user.id === recipientId)?.[0];
      
      if (recipientSocket) {
        io.to(recipientSocket).emit('message', messageData);
      }
    } else {
      // Broadcast to room (except sender)
      socket.to(currentRoomId).emit('message', messageData);
    }
  });

  // Typing indicator
  socket.on('typing', ({ isTyping }) => {
    if (!currentRoomId) return;
    
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (!user) return;

    socket.to(currentRoomId).emit('typing', {
      userId: user.id,
      userName: user.userName,
      isTyping
    });
  });

  // WebRTC signaling
  socket.on('call-start', ({ type }) => {
    if (!currentRoomId) return;
    
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const caller = room.users.get(socket.id);
    if (!caller) return;

    socket.to(currentRoomId).emit('call-incoming', {
      from: caller.id,
      fromName: caller.userName,
      type
    });
  });

  socket.on('call-signal', ({ to, signal }) => {
    if (!currentRoomId) return;
    
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const caller = room.users.get(socket.id);
    if (!caller) return;

    // Find recipient socket
    const recipientSocket = Array.from(room.users.entries())
      .find(([_, user]) => user.id === to)?.[0];
    
    if (recipientSocket) {
      io.to(recipientSocket).emit('call-signal', {
        from: caller.id,
        signal
      });
    }
  });

  socket.on('call-end', () => {
    if (!currentRoomId) return;
    
    socket.to(currentRoomId).emit('call-ended');
  });

  // Leave room
  socket.on('leave-room', () => {
    if (currentRoomId) {
      leaveRoom(socket, currentRoomId);
      currentRoomId = null;
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] User disconnected: ${socket.id}`);
    
    if (currentRoomId) {
      leaveRoom(socket, currentRoomId);
    }
  });
});

function leaveRoom(socket, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const user = room.users.get(socket.id);
  if (!user) return;

  // Remove user
  room.users.delete(socket.id);
  socket.leave(roomId);

  // Notify others
  socket.to(roomId).emit('user-left', {
    userId: user.id,
    userName: user.userName
  });

  console.log(`[${new Date().toISOString()}] ${user.userName} left room ${roomId} (${room.users.size} users remaining)`);

  // Clean up empty rooms
  if (room.users.size === 0) {
    rooms.delete(roomId);
    console.log(`[${new Date().toISOString()}] Room ${roomId} destroyed (empty)`);
  }
}

// Clean up old rooms (run every hour)
setInterval(() => {
  const now = Date.now();
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [roomId, room] of rooms.entries()) {
    if (now - room.createdAt.getTime() > MAX_AGE && room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`[${new Date().toISOString()}] Cleaned up old room: ${roomId}`);
    }
  }
}, 60 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🔒 SafeChat Server - Zero Knowledge  ║
╚════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🔐 Zero knowledge: Server cannot decrypt messages
🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}

Listening for connections...
  `);
});
