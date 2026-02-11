# 🔒 SafeChat - True End-to-End Encrypted Chat

A truly secure, anonymous chat application with real E2E encryption and WebRTC voice/video calls. Unlike competitors, the server has **ZERO** knowledge of message contents.

## 🌟 Features

- ✅ **True E2E Encryption** - X25519 + XChaCha20-Poly1305
- ✅ **Zero Knowledge Server** - Server only relays encrypted blobs
- ✅ **No Registration** - Anonymous access, no accounts needed
- ✅ **Real-time Chat** - Socket.IO powered messaging
- ✅ **WebRTC Calls** - Voice and video calls (coming soon)
- ✅ **Dark Mode** - Beautiful UI with Tailwind CSS
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **No Storage** - Messages exist only in browser memory

## 🛡️ Security Model

### Encryption Flow
1. Each user generates an X25519 keypair on room join
2. Public keys are exchanged via the server
3. Shared secrets are derived using Diffie-Hellman
4. Messages are encrypted with XChaCha20-Poly1305
5. Server receives only encrypted blobs - cannot decrypt

### Key Principles
- **Zero Knowledge Server**: Server only relays encrypted data
- **Perfect Forward Secrecy**: Keys exist only in memory
- **Fail Secure**: Encryption errors block messages (never plaintext)
- **No Tracking**: No analytics, cookies, or surveillance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ashev87/safechat.git
cd safechat
```

2. **Start the server**
```bash
cd server
npm install
npm run dev
```
Server runs on `http://localhost:3001`

3. **Start the client** (in another terminal)
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:3000`

4. **Open browser**
Visit `http://localhost:3000` and create a room!

## 📁 Project Structure

```
safechat/
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/         # Pages (home, room)
│   │   ├── components/  # UI components
│   │   ├── lib/         # Crypto, socket utilities
│   │   ├── stores/      # Zustand state management
│   │   └── hooks/       # React hooks
│   └── package.json
│
├── server/              # Node.js backend
│   ├── src/
│   │   └── index.js     # Socket.IO relay server
│   └── package.json
│
└── README.md
```

## 🔐 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: TailwindCSS 4 + shadcn/ui
- **State**: Zustand
- **Crypto**: tweetnacl (libsodium port)
- **WebRTC**: simple-peer
- **Real-time**: Socket.IO client

### Backend
- **Runtime**: Node.js (Bun compatible)
- **WebSocket**: Socket.IO
- **Storage**: In-memory only (ephemeral)

## 🌐 Deployment

### Vercel (Frontend)
```bash
cd client
vercel deploy --prod
```

### Railway/Fly.io (Backend)
```bash
cd server
# Follow Railway or Fly.io deployment guide
```

Set environment variable:
- `CLIENT_URL`: Your frontend URL (e.g., `https://safechat.vercel.app`)

## 🔧 Environment Variables

### Client (.env.local)
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

### Server (.env)
```env
PORT=3001
CLIENT_URL=http://localhost:3000
```

## 📝 Usage

1. **Create Room**: Click "Create New Room" on home page
2. **Share Link**: Copy the room URL and share with others
3. **Chat Securely**: Messages are automatically encrypted
4. **Verify Security**: Check safety numbers with your peer

## 🛠️ Development

### Run tests
```bash
cd client
npm test
```

### Build for production
```bash
cd client
npm run build

cd ../server
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: https://github.com/ashev87/safechat
- **Issues**: https://github.com/ashev87/safechat/issues
- **Author**: Andriy Shevchenko

## ⚠️ Security Notice

While SafeChat implements strong encryption, it's designed for educational purposes. For production use:
- Conduct a security audit
- Implement rate limiting
- Add HTTPS/WSS in production
- Consider adding authentication for private rooms
- Implement perfect forward secrecy with session key rotation

## 🙏 Acknowledgments

- [TweetNaCl.js](https://github.com/dchest/tweetnacl-js) - Cryptography library
- [Socket.IO](https://socket.io/) - Real-time communication
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**Built with security as the foundation, not an afterthought.**

*SafeChat - Where privacy isn't just a feature, it's the architecture.*
