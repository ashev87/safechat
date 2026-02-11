# Quick Deploy Guide

## Option 1: Vercel (Client) + Railway (Server)

### Deploy Server to Railway:
1. Go to https://railway.app/new/github
2. Connect ashev87/safechat repo
3. Set root directory: `server`
4. Deploy!
5. Copy the URL (e.g., safechat-server.up.railway.app)

### Deploy Client to Vercel:
1. Go to https://vercel.com/new
2. Import ashev87/safechat
3. Set root directory: `client`
4. Add env: NEXT_PUBLIC_SERVER_URL=<railway-url>
5. Deploy!

## Option 2: Local Testing
```bash
# Terminal 1 - Server
cd server && PORT=5000 npm start

# Terminal 2 - Client  
cd client && npm run dev
```
Open http://localhost:3000
