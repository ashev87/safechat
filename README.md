# 🔒 SafeChat

**Truly secure, anonymous chat with real end-to-end encryption.**

Unlike other "secure" chat apps that claim E2E but use shared keys or send data to external services, SafeChat implements cryptographically sound encryption where the server has **zero knowledge** of your messages.

![SafeChat](https://img.shields.io/badge/E2E-X25519%20%2B%20XSalsa20-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🔐 **Real E2E Encryption** - X25519 key exchange + XSalsa20-Poly1305
- 👤 **Anonymous** - No accounts, no registration
- 🚫 **Zero Knowledge** - Server only relays encrypted blobs it cannot read
- 📞 **Voice & Video Calls** - WebRTC peer-to-peer (encrypted by default)
- 📱 **Mobile Friendly** - Responsive design, PWA installable
- 🔢 **Safety Numbers** - Verify encryption with your contacts
- ⏱️ **Ephemeral** - Messages disappear when room closes

## 🔒 Security Model

```
User A                     Server                    User B
   │                          │                         │
   │──Generate X25519 keys────│                         │
   │                          │────Generate X25519 keys─│
   │                          │                         │
   │◄───Exchange public keys──│─────────────────────────│
   │                          │                         │
   │  Derive shared secret    │                         │
   │  (Diffie-Hellman)        │     Derive shared secret│
   │                          │                         │
   │──Encrypt with XSalsa20───│───Relay encrypted blob──│
   │    (Server cannot read!) │                         │
```

**Key differences from fake "E2E" apps:**
- Keys generated per-user (not shared via `NEXT_PUBLIC_` env vars)
- Server never has access to encryption keys
- No AI features that send plaintext to external services
- Encryption failure = message blocked (never falls back to plaintext)

## 🚀 Quick Start

### Development

```bash
# Clone
git clone https://github.com/ashev87/safechat.git
cd safechat

# Start server
cd server
npm install
npm run dev

# Start client (new terminal)
cd client
npm install
npm run dev

# Open http://localhost:3000
```

### Production Deployment

**Client (Vercel):**
```bash
cd client
vercel deploy --prod
```

**Server (Railway/Fly.io):**
```bash
cd server
# Deploy via Railway CLI or Dockerfile
```

**Environment Variables:**
```env
# Client (.env.local)
NEXT_PUBLIC_SERVER_URL=https://your-server.railway.app

# Server (.env)
CORS_ORIGIN=https://your-client.vercel.app
PORT=5000
```

## 📁 Project Structure

```
safechat/
├── client/              # Next.js 15 frontend
│   ├── src/
│   │   ├── app/         # Pages (home, room)
│   │   ├── lib/         # Crypto, Socket.IO
│   │   ├── stores/      # Zustand state
│   │   └── components/  # UI components
│   └── package.json
│
├── server/              # Bun/Node.js backend
│   └── src/
│       └── index.ts     # Socket.IO relay
│
└── ARCHITECTURE.md      # Full technical design
```

## 🛡️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, React 19, TailwindCSS |
| State | Zustand |
| Encryption | tweetnacl (libsodium port) |
| Real-time | Socket.IO |
| Calls | WebRTC (simple-peer) |
| Server | Bun/Node.js |

## 📜 License

MIT - See [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [TweetNaCl.js](https://tweetnacl.js.org/) - Cryptographic library
- [Socket.IO](https://socket.io/) - Real-time engine
- [simple-peer](https://github.com/feross/simple-peer) - WebRTC wrapper

---

**Built with security as the foundation, not an afterthought.**
