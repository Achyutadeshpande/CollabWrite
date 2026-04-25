# Real-Time Collaborative Text Editor with Chat

A full-stack MERN application that allows multiple users to collaborate on the same document in real-time with an integrated chat feature using Socket.IO.

## Features

### Core Features
- ✅ **Real-Time Collaboration**: Multiple users can edit the same document simultaneously with instant synchronization
- ✅ **Live Chat**: Integrated chat panel for users in the same room to communicate
- ✅ **Room-Based Architecture**: Users join rooms using unique room IDs to collaborate
- ✅ **User Presence**: See active user count in the editor room
- ✅ **Typing Indicators**: See when other users are typing in the chat
- ✅ **System Messages**: Notifications when users join or leave the room

### UI/UX Features
- ✅ **Split-Screen Layout**: Text editor on the left, chat panel on the right
- ✅ **Real-Time Statistics**: Word count, character count, and line count
- ✅ **Message Timestamps**: Each chat message includes a timestamp
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Modern UI**: Clean, modern interface with smooth animations
- ✅ **Document Download**: Download edited documents as text files
- ✅ **Auto-Scrolling Chat**: Chat automatically scrolls to the latest message

## Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **Socket.IO Client** 4.5.4 - Real-time communication
- **CSS3** - Modern styling with flexbox and animations
- **UUID** 9.0.0 - Unique room ID generation

### Backend
- **Node.js** - JavaScript runtime
- **Express** 4.18.2 - Web framework
- **Socket.IO** 4.5.4 - Real-time communication
- **MongoDB** 7.0.0 - Persistent data storage (optional)
- **Mongoose** 7.0.0 - MongoDB ODM (optional)
- **CORS** 2.8.5 - Cross-origin request handling
- **dotenv** 16.0.3 - Environment configuration

## Project Structure

```
fsd project/
├── server/                  # Node.js + Express backend
│   ├── package.json
│   ├── .env                 # Environment variables
│   └── server.js            # Main server file
│
├── client/                  # React frontend
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.js    # Text editor component
│   │   │   ├── Editor.css
│   │   │   ├── Chat.js      # Chat component
│   │   │   └── Chat.css
│   │   ├── App.js           # Main App component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env                 # Environment variables
│
└── .gitignore              # Git ignore file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, for persistence)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (`.env` file already exists):
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URL=mongodb://localhost:27017/collaborative-editor
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (`.env` file already exists):
```
REACT_APP_SERVER_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The client will run on `http://localhost:3000`

## Usage

### Starting a Collaborative Session

1. **Open the application** (http://localhost:3000)
2. **Enter a username** - This will be displayed to other users
3. **Create or join a room:**
   - Click "Generate" to create a new room with a random ID
   - Or paste an existing room ID to join
4. **Share the room ID** with others who want to collaborate
5. **Start collaborating** - Changes appear in real-time for all users

### Sharing with Multiple Users

1. First user creates a room and gets the room ID
2. Share this room ID with other users (via messaging app, email, etc.)
3. Other users paste the same room ID and join
4. All users can now edit the same document together

### Text Editor Features

- **Real-time editing** - Changes sync instantly across all users
- **Document statistics** - View word count, character count, and line count
- **Download** - Save the document as a text file
- **Clear** - Clear the entire document (with confirmation)

### Chat Features

- **Send messages** - Type and send messages to all users in the room
- **Message history** - All messages are displayed with timestamps
- **Typing indicators** - See when others are typing
- **System notifications** - See when users join or leave

## Socket.IO Events

### Client to Server
- `join-room` - Join a collaboration room with username
- `text-change` - Broadcast text editor changes
- `send-message` - Send a chat message
- `user-typing` - Indicate typing status

### Server to Client
- `load-document` - Receive initial document content
- `receive-text-change` - Receive text updates from other users
- `receive-message` - Receive chat messages
- `user-joined` - Notification when a user joins
- `user-left` - Notification when a user leaves
- `user-typing-indicator` - Receive typing indicators

## API Endpoints

### GET `/health`
Health check endpoint to verify server is running

### GET `/api/document/:roomId`
Get the current content of a document by room ID

### POST `/api/document/:roomId`
Save document content (optional, for persistence)

## Features Breakdown

### 1. Real-Time Text Synchronization
- Emits `text-change` events when the editor content changes
- Receives `receive-text-change` events from other users
- Document state is maintained on the server and synced to all clients

### 2. Chat System
- Messages include username, content, and timestamp
- System messages notify about user joins/leaves
- Message count displayed in the chat header
- Auto-scroll to latest message

### 3. User Management
- Track active users in each room
- Display user count in the header
- Show who's currently typing

### 4. Room Management
- Unique room IDs for each collaboration session
- Automatic cleanup of empty rooms
- Multiple concurrent rooms supported

## Environment Variables

### Server (.env)
```
PORT=5000                                              # Server port
NODE_ENV=development                                   # Node environment
CLIENT_URL=http://localhost:3000                      # Frontend URL (for CORS)
MONGO_URL=mongodb://localhost:27017/collaborative-editor  # MongoDB connection
```

### Client (.env)
```
REACT_APP_SERVER_URL=http://localhost:5000            # Backend server URL
```

## Running Both Server and Client

### Option 1: Separate Terminals
Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

### Option 2: Using npm scripts from root (if package.json configured)
```bash
npm run dev  # (requires setup in root package.json)
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- **Debouncing**: Typing events are debounced to reduce network traffic
- **Efficient state management**: Room data stored in memory on server
- **Scalable architecture**: Uses Socket.IO namespaces for room isolation

## Optional Enhancements

The following can be easily added:

1. **Database Persistence**
   - Store messages in MongoDB
   - Store document versions/history
   - User authentication and profiles

2. **Rich Text Editing**
   - Integrate React Quill or Draft.js
   - Support for formatting (bold, italic, links, etc.)

3. **Conflict Resolution**
   - Operational transformation for advanced collaboration
   - Last-write-wins strategy

4. **Notifications**
   - Browser notifications when mentioned
   - Sound notifications for new messages

5. **Additional Features**
   - Document versioning and history
   - Undo/Redo functionality
   - Cursor positions and selections
   - Code syntax highlighting for programming

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the PORT in `.env`:
```
PORT=5001
```

### Connection Refused
Ensure the server is running and the `REACT_APP_SERVER_URL` matches the server URL.

### Changes Not Syncing
- Check browser console for errors
- Verify Socket.IO connection in Network tab
- Ensure all users are in the same room ID

### MongoDB Connection Issues
If you see MongoDB errors and don't need persistence:
- The app works fine without MongoDB (uses in-memory storage)
- To remove MongoDB dependency, set `MONGO_URL` to a local URI or remove the connection code

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available for educational and personal use.

## Support

For issues or questions, please create an issue in the repository.

---

**Happy Collaborating! 🚀**
