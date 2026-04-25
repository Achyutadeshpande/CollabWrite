# Developer Cheatsheet

## Quick Commands

### Initial Setup
```bash
# Install all dependencies
npm run install-all

# Or manual installation
cd server && npm install && cd ../client && npm install
```

### Running the App
```bash
# From root (if concurrently installed)
npm start

# OR in separate terminals

# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

### Stopping
```
Ctrl+C (in each terminal)
```

## Key Files & What They Do

### Server Files
| File | Purpose |
|------|---------|
| `server/server.js` | Main server file, all logic here |
| `server/package.json` | Node dependencies |
| `server/.env` | Server configuration |

### Client Files
| File | Purpose |
|------|---------|
| `client/src/App.js` | Main React app, room join logic |
| `client/src/components/Editor.js` | Text editor component |
| `client/src/components/Chat.js` | Chat component |
| `client/src/App.css` | Main app styling |
| `client/public/index.html` | HTML template |

## Global Variables

### Server (server.js)
```javascript
rooms  // Map<roomId, {content, users, messages}>
io     // Socket.IO instance
socket // Individual user socket
```

### Client (App.js)
```javascript
roomId           // Current room ID
username         // Current username
joined           // Boolean: in room or not
socketRef.current // Socket connection
```

## Socket Events

### Emitted by Client
```javascript
socket.emit('join-room', { roomId, username })
socket.emit('text-change', { roomId, content })
socket.emit('send-message', { roomId, message })
socket.emit('user-typing', { roomId, isTyping })
```

### Received by Client
```javascript
socket.on('load-document', { content })
socket.on('receive-text-change', { content })
socket.on('receive-message', messageObj)
socket.on('user-joined', { username, userCount })
socket.on('user-left', { username, userCount })
socket.on('user-typing-indicator', { username, isTyping })
```

## API Endpoints

```
GET  /health                    // Server health check
GET  /api/document/:roomId      // Get document content
POST /api/document/:roomId      // Save document content
```

## Common Code Modifications

### Change Port
```javascript
// server/.env
PORT=5001

// client/.env
REACT_APP_SERVER_URL=http://localhost:5001
```

### Change Colors
```css
/* client/src/App.css */
/* Change #667eea to desired color */
```

### Add Console Logging
```javascript
// In server.js
console.log('Debug message:', variable);

// In client Components
console.log('Debug message:', variable);

// View in browser DevTools (F12 → Console)
```

### Extend Room State
```javascript
// In server.js - getOrCreateRoom function
room.newField = initialValue;

// Then access with:
const room = rooms.get(roomId);
room.newField = newValue;
```

## State Management Reference

### Server State (In Memory)
```javascript
rooms = {
  'room-123': {
    content: 'Document text here',
    users: Map {
      'socket-id': { username: 'Alice', joinedAt: Date }
    },
    messages: [
      { username, message, timestamp, id }
    ]
  }
}
```

### Client State (React)
```javascript
// App.js
roomId          // String
username        // String
joined          // Boolean
userCount       // Number
tempUsername    // String (form input)
tempRoomId      // String (form input)

// Editor.js
content         // String (document)
stats           // { words, characters, lines }

// Chat.js
messages        // Array<Message>
messageText     // String (form input)
typingUsers     // Set<username>
```

## Props Drilling

```
App.js
├── Editor (receives: socket, roomId)
└── Chat (receives: socket, roomId, username)
```

## Testing Checklist

- [ ] Two users in same room - text syncs
- [ ] Two users in same room - chat syncs
- [ ] Join notification appears
- [ ] Leave notification appears
- [ ] User count updates
- [ ] Typing indicator shows
- [ ] Download works
- [ ] Clear document works
- [ ] Stats update in real-time
- [ ] Mobile layout works

## Environment Variables Reference

```bash
# server/.env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URL=mongodb://localhost:27017/collaborative-editor

# client/.env
REACT_APP_SERVER_URL=http://localhost:5000
```

## Debugging Shortcuts

| Action | Result |
|--------|--------|
| F12 | Open DevTools |
| F12 → Console | View console logs |
| F12 → Network | View network requests |
| F12 → Storage | View cookies/storage |
| Ctrl+Shift+J | Open console directly |
| Ctrl+F5 | Hard refresh browser |

## Git Commands (if using Git)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <repo-url>
git push -u origin main
```

## Npm Commands

```bash
npm install          # Install dependencies
npm start            # Start app (client)
npm run dev          # Start with watch (server)
npm run build        # Build for production
npm cache clean --force  # Clear npm cache
npm list             # Show installed packages
```

## Useful Resources

- [React Documentation](https://react.dev/)
- [Socket.IO Documentation](https://socket.io/)
- [Express Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## Code Style

### Naming Conventions
```javascript
// Components
function ComponentName() {}

// Variables
const variableName = value;
const userName = 'Alice';

// Functions
function handleAction() {}
const onClickHandler = () => {};

// CSS Classes
.class-name { }
.component-section { }
```

### Comment Style
```javascript
// Single line comment
/* Multi-line
   comment
   here */
```

## Performance Tips

- Debounce frequent events (typing)
- Avoid rendering large lists without keys
- Use React.memo for expensive components
- Limit Socket.IO message frequency
- Clean up event listeners in useEffect cleanup

## Security Reminders

- Validate all user input
- Sanitize before displaying
- Use HTTPS in production
- Implement rate limiting
- Add user authentication (future)
- Keep dependencies updated

## Common Patterns Used

### Emitting Events
```javascript
socket.emit('event-name', data);

// Listen for response
socket.on('event-name', (data) => {
  // Handle response
});
```

### React Hooks
```javascript
const [state, setState] = useState(initialValue);
const ref = useRef(null);

useEffect(() => {
  // Setup
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### Event Handling
```javascript
const handleChange = (e) => {
  const value = e.target.value;
  // Do something with value
};

const handleSubmit = (e) => {
  e.preventDefault();
  // Prevent form reload
};
```

## File Size Guidelines

- Keep components under 300 lines
- Keep CSS files organized by component
- Server file is currently ~200 lines
- Easy to refactor if needed

## Deployment Checklist

- [ ] Update .env for production
- [ ] Set NODE_ENV=production
- [ ] Build React: `npm run build`
- [ ] Test production build locally
- [ ] Update CLIENT_URL
- [ ] Set up MongoDB (if using)
- [ ] Configure SSL/HTTPS
- [ ] Set correct domain in CORS
- [ ] Test from different network

---

**Pro Tips:**
1. Always check console (F12) first when debugging
2. Check if server is running before blaming client
3. Verify room IDs match exactly (case-sensitive)
4. Restart both server and client for major changes
5. Read error messages carefully - they usually explain the issue

Happy Coding! 🚀
