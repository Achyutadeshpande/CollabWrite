# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)

## Quick Setup (5 minutes)

### Step 1: Install Server Dependencies
```bash
cd server
npm install
```

### Step 2: Install Client Dependencies
```bash
cd ../client
npm install
```

### Step 3: Start the Server
From the `server` directory:
```bash
npm run dev
```
You should see: `Server running on port 5000`

### Step 4: Start the Client (NEW TERMINAL)
From the `client` directory:
```bash
npm start
```
A browser window should open with `http://localhost:3000`

## Using the Application

1. **First User:** 
   - Enter username: "Alice"
   - Click "Generate" for a room ID
   - Click "Join Room"

2. **Second User (Different Browser/Tab):**
   - Go to `http://localhost:3000`
   - Enter username: "Bob"
   - Copy the room ID from Alice's screen
   - Paste it and click "Join Room"

3. **Start Collaborating:**
   - Both can edit the document in real-time
   - Both can chat instantly
   - See each other's activity

## Stop the Application

- Server: Press `Ctrl+C` in the server terminal
- Client: Press `Ctrl+C` in the client terminal

## Common Issues

### "Cannot find module" error
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### Port 5000 already in use
Edit `server/.env`:
```
PORT=5001
```

Then update `client/.env`:
```
REACT_APP_SERVER_URL=http://localhost:5001
```

### Changes not appearing
- Check both terminals show no errors
- Verify you're in the same room ID
- Try refreshing the page

## Next Steps

- Read the full README.md for detailed documentation
- Try multiple browser tabs to simulate different users
- Explore the code structure in `/client/src` and `/server`

## Project Structure Quick Reference

```
fsd project/
├── server/          # Backend (Node.js + Express + Socket.IO)
├── client/          # Frontend (React)
├── README.md        # Full documentation
└── .gitignore       # Git ignore rules
```

## File Locations

**Frontend Files:**
- Main app: `client/src/App.js`
- Text Editor: `client/src/components/Editor.js`
- Chat: `client/src/components/Chat.js`

**Backend Files:**
- Main server: `server/server.js`
- Port & config: `server/.env`

---

**Everything is ready to go! Happy collaborating! 🎉**
