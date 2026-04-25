const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// MongoDB Connection
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/collaborative-editor';
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Room state management
const rooms = new Map();

// Helper function to get or create a room
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      content: '',
      users: new Map(),
      messages: []
    });
  }
  return rooms.get(roomId);
}

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // User joins a room
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    const room = getOrCreateRoom(roomId);
    
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;
    
    // Add user to room
    room.users.set(socket.id, { username, joinedAt: new Date() });
    
    // Send current document content to the joined user
    socket.emit('load-document', { content: room.content });
    
    // Notify all users in the room about new user joining
    io.to(roomId).emit('user-joined', {
      username,
      userCount: room.users.size,
      message: `${username} joined the room`
    });
    
    console.log(`${username} joined room: ${roomId}, Users in room: ${room.users.size}`);
  });

  // Handle text editor changes
  socket.on('text-change', (data) => {
    const { roomId, content } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      room.content = content;
      // Broadcast to all users in the room except sender
      socket.to(roomId).emit('receive-text-change', { content });
    }
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const { roomId, message } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      const messageObj = {
        username: socket.username,
        message,
        timestamp: new Date(),
        id: new Date().getTime()
      };
      
      room.messages.push(messageObj);
      
      // Broadcast message to all users in the room
      io.to(roomId).emit('receive-message', messageObj);
      
      console.log(`Message from ${socket.username} in room ${roomId}: ${message}`);
    }
  });

  // Handle editor typing indicator
  socket.on('editor-typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('editor-typing-indicator', {
      username: socket.username,
      isTyping
    });
  });

  // Handle chat typing indicator
  socket.on('chat-typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('chat-typing-indicator', {
      username: socket.username,
      isTyping
    });
  });

  // Handle whiteboard drawing strokes
  socket.on('draw-stroke', (data) => {
    const { roomId, x0, y0, x1, y1, color, brushSize } = data;
    socket.to(roomId).emit('draw-stroke', {
      x0,
      y0,
      x1,
      y1,
      color,
      brushSize
    });
  });

  // Handle whiteboard clear
  socket.on('clear-whiteboard', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('clear-whiteboard');
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    const username = socket.username;
    const room = rooms.get(roomId);
    
    if (room) {
      room.users.delete(socket.id);
      
      // Notify others about user leaving
      io.to(roomId).emit('user-left', {
        username,
        userCount: room.users.size,
        message: `${username} left the room`
      });
      
      // Remove empty rooms
      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} is now empty and has been removed`);
      }
    }
    
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error: ${error}`);
  });
});

// REST API to get document content (optional)
app.get('/api/document/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({ success: true, content: room.content });
  } else {
    res.json({ success: true, content: '' });
  }
});

// REST API to save document (optional)
app.post('/api/document/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;
  
  const room = getOrCreateRoom(roomId);
  room.content = content;
  
  res.json({ success: true, message: 'Document saved' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
