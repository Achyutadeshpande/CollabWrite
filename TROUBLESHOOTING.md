# Troubleshooting Guide

## Common Issues & Solutions

### 1. Port Already in Use

**Problem**: Error like "EADDRINUSE: address already in use :::5000"

**Solutions:**

Option A: Kill the process using the port
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

Option B: Change the port
```bash
# Edit server/.env
PORT=5001

# Edit client/.env
REACT_APP_SERVER_URL=http://localhost:5001
```

### 2. "npm: command not found"

**Problem**: npm is not recognized in terminal

**Solution**: Install Node.js from https://nodejs.org/
- This includes npm automatically
- Restart terminal after installation

### 3. Dependencies Installation Fails

**Problem**: `npm install` fails or has errors

**Solutions:**

Clear npm cache:
```bash
npm cache clean --force
rm -r node_modules
npm install
```

Update npm:
```bash
npm install -g npm@latest
```

### 4. Connection Refused Error

**Problem**: "Error: connect ECONNREFUSED 127.0.0.1:5000"

**Solutions:**

Ensure server is running:
```bash
# Terminal 1 - Check server is running
cd server
npm run dev
# Should show: "Server running on port 5000"

# Terminal 2 - Start client
cd client
npm start
```

Verify the client is configured correctly:
```bash
# Check client/.env has correct server URL
REACT_APP_SERVER_URL=http://localhost:5000
```

### 5. Changes Not Syncing Between Users

**Problem**: Text editor changes not appearing for other users

**Solutions:**

Check Socket.IO connection:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSockets)
4. Should see a Socket.IO connection
5. If not, check server is running

Verify room ID is same:
- Both users should be in the SAME room ID
- Check the room ID badge at top of page
- Copy-paste the exact ID (case-sensitive)

Restart if needed:
- Leave room on both users
- Rejoin with same ID
- Should sync now

### 6. Chat Messages Not Appearing

**Problem**: Messages sent but not visible to others

**Solutions:**

Check Socket.IO connection (see #5 above)

Verify room ID:
- Both users must be in same room
- Check room display at top of header

Check browser console:
- Press F12 to open DevTools
- Look for any red error messages
- Fix issues shown in console

### 7. Styling Looks Broken

**Problem**: UI colors/layout not displaying correctly

**Solutions:**

Clear browser cache:
```
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)
```

Refresh the page:
```
Ctrl+F5 (Windows/Linux)
Cmd+Shift+R (Mac)
```

Verify CSS files exist:
- App.css
- Editor.css
- Chat.css
- index.css

All should be in client/src/ directory

### 8. "Module not found" Error

**Problem**: "Cannot find module 'socket.io-client'" or similar

**Solutions:**

Reinstall dependencies:
```bash
# Go to the directory with error
cd client  # or cd server

# Clear and reinstall
rm -r node_modules
npm install
```

Ensure you're in correct directory:
- For React errors: run `npm install` in `/client`
- For Node errors: run `npm install` in `/server`

### 9. React App Won't Start

**Problem**: `npm start` fails or blank page

**Solutions:**

Check for errors in terminal:
- Look for red error messages
- Note the line number and file

Check browser console (F12):
- Look for red error messages
- JavaScript errors prevent app from loading

Clear React cache:
```bash
cd client
rm -r node_modules
rm package-lock.json
npm install
npm start
```

### 10. MongoDB Connection Error

**Problem**: "MongoDB connection error" in server logs

**Solutions:**

Option A: Run without MongoDB (in-memory mode)
- MongoDB is optional
- App works fine without it
- Can manually enable later

Option B: Install MongoDB locally
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Update MONGO_URL in server/.env

Option C: Use MongoDB Atlas (cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update MONGO_URL in server/.env:
```
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/collaborative-editor
```

### 11. CORS Errors in Browser Console

**Problem**: "Cross-Origin Request Blocked" error

**Solutions:**

Verify client URL in server/.env:
```
CLIENT_URL=http://localhost:3000
```

If frontend is on different port:
```
CLIENT_URL=http://localhost:3001
```

For production, update to your domain:
```
CLIENT_URL=https://your-domain.com
```

### 12. Room ID Not Generating

**Problem**: "Generate" button doesn't create room ID

**Solutions:**

Check browser console (F12):
- Look for JavaScript errors
- UUID package might be missing

Reinstall packages:
```bash
cd client
npm install uuid
npm install
npm start
```

### 13. Typing Indicator Not Working

**Problem**: "User is typing" message doesn't appear

**Solutions:**

This is a non-critical feature. Check:
1. Socket.IO connection is active
2. Try sending a chat message anyway
3. Feature will work once connection is stable

### 14. Document Download Not Working

**Problem**: Download button doesn't save file

**Solutions:**

Check browser settings:
- Allow downloads from localhost
- Not blocked by security software

Try different browser:
- Chrome, Firefox, Edge all supported
- If one doesn't work, try another

Check browser console for errors (F12)

### 15. Mobile App Not Responsive

**Problem**: App doesn't look right on phone

**Solutions:**

Check viewport meta tag exists in index.html:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Clear phone cache:
- Open in incognito/private mode to force refresh

Check screen rotation:
- Try rotating phone 90 degrees
- Layout should adjust

Test on desktop first:
- Make sure app works on desktop
- Then test mobile

### 16. Too Many Console Warnings

**Problem**: Many warning messages in console

**Solutions:**

Most warnings are non-critical. However:

For React StrictMode warnings:
- This is for development only
- Won't appear in production
- Can remove if desired by removing `<React.StrictMode>` wrapper

### 17. Server Keeps Crashing

**Problem**: Server starts then immediately exits

**Solutions:**

Check for errors in terminal output:
- Read the error message carefully
- Note line numbers and file names

Check Node.js version:
```bash
node --version
# Should be v14 or higher
```

Check for syntax errors:
- Open server.js in editor
- Look for obvious syntax errors
- Red squiggly lines indicate problems

### 18. App Works Locally But Not on Network

**Problem**: Other computers can't connect to your server

**Solutions:**

Get your computer's IP address:
```bash
# Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.x.x)

# Mac/Linux
ifconfig
# Look for inet (e.g., 192.168.x.x)
```

Update client .env:
```
REACT_APP_SERVER_URL=http://192.168.x.x:5000
```

Ensure server is accessible:
```bash
# On server computer
netstat -ano | grep 5000
# Should show PORT is LISTENING
```

Check firewall:
- Windows: Firewall may block port 5000
- Add Node.js to firewall exceptions
- Or disable firewall temporarily for testing

### 19. High CPU/Memory Usage

**Problem**: Computer gets slow when app runs

**Solutions:**

Check for message spam:
- Messages continuously sending?
- Typing indicators looping?

Restart both server and client

Close other apps to free resources

Limit concurrent users:
- Too many users in one room?
- Try smaller groups

### 20. General Debugging Tips

1. **Check Terminal Output**: Read errors carefully
2. **Open Browser Console**: F12 → Console tab
3. **Check Network Tab**: F12 → Network (look for failed requests)
4. **Restart Everything**: Close and restart server/client
5. **Read Error Messages**: They usually explain the issue
6. **Google the Error**: Copy error message into search
7. **Check File Paths**: Ensure all files exist in correct locations
8. **Verify Configurations**: Check .env files have correct values

---

## Still Having Issues?

### Step-by-Step Debugging

1. **Terminal 1 - Start Server**
   ```bash
   cd server
   npm run dev
   ```
   Expected output: "Server running on port 5000"

2. **Terminal 2 - Start Client**
   ```bash
   cd client
   npm start
   ```
   Expected: Browser opens to http://localhost:3000

3. **Test Connection**
   ```bash
   # In Terminal 1, you should see:
   # New user connected: <socket-id>
   # User joined room: <room-id>
   ```

4. **Check Browser**
   - Should show join screen
   - All text and buttons visible
   - No red errors in console (F12)

5. **Test Two Users**
   - User 1: Generate room ID
   - User 2: Paste same room ID and join
   - Both should see room info update

### Getting Help

1. **Check all documentation**:
   - README.md - Full features
   - SETUP.md - Quick start
   - FEATURES.md - Feature details

2. **Check file structure**:
   - Ensure all files are present
   - Correct file names and locations

3. **Check configurations**:
   - .env files have correct values
   - No typos in configuration

4. **Try the sample workflow**:
   - Start fresh installation
   - Follow SETUP.md exactly
   - Don't skip any steps

---

## Last Resort

Complete reset:

```bash
# Windows
cd "c:\Users\achyu\OneDrive\Desktop\fsd project"
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules
npm cache clean --force

# Mac/Linux
cd ~/Desktop/fsd\ project
rm -rf server/node_modules
rm -rf client/node_modules
npm cache clean --force

# Reinstall from scratch
npm run install-all
npm start
```

---

Most issues are resolved by:
1. Restarting the server and client
2. Clearing npm cache and reinstalling
3. Verifying .env configurations
4. Checking both users are in same room

Good luck! 🚀
