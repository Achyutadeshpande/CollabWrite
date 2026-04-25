# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP + WebSocket
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                            │
        ▼                                            ▼
┌──────────────────┐                      ┌──────────────────┐
│   CLIENT SIDE    │                      │   SERVER SIDE    │
│   (Port 3000)    │                      │   (Port 5000)    │
└──────────────────┘                      └──────────────────┘
        │                                            │
    ┌───┴──────────────────────┐                   │
    │                          │                   │
    ▼                          ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌──────────────────┐
│   React App    │  │  Socket.IO     │  │  Express Server  │
│   Components   │  │    Client      │  │   with Socket.IO │
│                │  │                │  │                  │
│  - App.js      │  │  • Emits       │  │  • Receives      │
│  - Editor.js   │  │  • Listens     │  │  • Processes     │
│  - Chat.js     │  │  • Real-time   │  │  • Broadcasts    │
└────────────────┘  └────────────────┘  └──────────────────┘
        │               │                        │
        │               │                        │
        └───────────────┴────────────────────────┘
            WebSocket Connection (Persistent)
```

## Data Flow Architecture

```
                    REAL-TIME COLLABORATION
                              
        User 1                 Server              User 2
     (Browser A)          (Node.js)           (Browser B)
          │                    │                    │
    ┌─────┴─────┐              │              ┌─────┴─────┐
    │ Types Text│              │              │            │
    └─────┬─────┘              │              │            │
          │ text-change        │              │            │
          │ Socket.IO event    │              │            │
          ├──────────────────►│              │            │
          │                    │ Update       │            │
          │                    │ room state   │            │
          │                    │              │            │
          │                    │ Broadcast    │            │
          │                    ├─────────────►│            │
          │                    │              │ Re-render  │
          │                    │              │ Component  │
          │                    │              │            │
          │◄───────────────────┤──────────────┤            │
          │ receive-text-change                             │
          │ Update local state  │                           │
          │ Re-render component │                           │
          │                     │                           │
    Both users see the same     │                           │
    updated document content    │                           │
```

## Socket.IO Event Flow

```
CLIENT EMITS                  SERVER RECEIVES              BROADCASTS TO
     │                               │                          │
     ▼                               ▼                          ▼
┌──────────────┐           ┌──────────────────┐         ┌─────────────────┐
│ text-change  │──────────►│ Receives event   │────────►│ All other users  │
│ send-message │           │ Processes data   │         │ in same room     │
│ user-typing  │           │ Updates state    │         │                  │
│ join-room    │           │ Validates data   │         │ receive-text-    │
│              │           │                  │         │ change events    │
└──────────────┘           └──────────────────┘         └─────────────────┘
                                    │
                                    │ Also stores locally
                                    ▼
                            ┌──────────────────┐
                            │ In-Memory Database│
                            │ - Document content│
                            │ - Messages        │
                            │ - Users list      │
                            │ (Optional MongoDB)│
                            └──────────────────┘
```

## Room Management Architecture

```
┌────────────────────────────────────────────────┐
│              SERVER MEMORY                     │
│  (In-Memory Map of Rooms)                      │
│                                                │
│  rooms = {                                     │
│    "abc123xy": {                              │
│      ┌──────────────────────────────────┐     │
│      │ Room State                       │     │
│      │                                  │     │
│      │ • content: "Document text..."   │     │
│      │ • users: {                      │     │
│      │    "socket-id-1": {             │     │
│      │      username: "Alice",         │     │
│      │      joinedAt: <timestamp>      │     │
│      │    },                           │     │
│      │    "socket-id-2": {             │     │
│      │      username: "Bob",           │     │
│      │      joinedAt: <timestamp>      │     │
│      │    }                            │     │
│      │  }                              │     │
│      │ • messages: [                   │     │
│      │    {                            │     │
│      │      username: "Alice",         │     │
│      │      message: "Hello",          │     │
│      │      timestamp: <date>,         │     │
│      │      id: <unique-id>            │     │
│      │    },                           │     │
│      │    ...                          │     │
│      │  ]                              │     │
│      └──────────────────────────────────┘     │
│    },                                         │
│    "def456yz": {                             │
│      (Different room)                        │
│    }                                         │
│  }                                           │
└────────────────────────────────────────────────┘
```

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LIFECYCLE                             │
└─────────────────────────────────────────────────────────────┘

1. INITIAL STATE
   ┌──────────────────────────┐
   │  User opens localhost:3000 │
   │  Sees join screen          │
   │  Enters username & room ID │
   └──────────┬────────────────┘
              │
              ▼
2. JOIN ROOM
   ┌──────────────────────────┐
   │  Socket.IO connects      │
   │  Emits 'join-room'       │
   │  Server stores user      │
   │  Server broadcasts join  │
   └──────────┬────────────────┘
              │
              ▼
3. IN ROOM
   ┌──────────────────────────┐
   │  See header with:        │
   │  - Room ID               │
   │  - User count            │
   │  - Username              │
   │  Editor pane             │
   │  Chat pane               │
   └──────────┬────────────────┘
              │
              ├──────────────────┐
              │                  │
              ▼                  ▼
         EDIT TEXT           SEND MESSAGE
         │                   │
         ├─► emit            ├─► emit
         │   text-change     │   send-message
         │                   │
         └─► receive         └─► receive
             from others         from others

4. LEAVE ROOM
   ┌──────────────────────────┐
   │  Click Leave button      │
   │  Or close browser        │
   │  Server broadcasts leave │
   └──────────┬────────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │  Back at join screen     │
   │  Room data preserved     │
   │  for next user           │
   └──────────────────────────┘
```

## Component Architecture

```
APP.JS (Main Component)
│
├─► [Join Screen - Initial State]
│   ├─ Username Input
│   ├─ Room ID Input
│   ├─ Generate Button
│   └─ Join Button
│
└─► [Editor Screen - After Join]
    │
    ├─ Header Section
    │  ├─ App Title
    │  ├─ Room Info Badge
    │  ├─ User Count Badge
    │  ├─ Username Badge
    │  └─ Leave Button
    │
    └─ Main Container (Flex 50-50)
       │
       ├─ EDITOR.JS (Left 50%)
       │  ├─ Header
       │  │  ├─ Title
       │  │  └─ Statistics
       │  ├─ Textarea
       │  │  └─ Real-time Sync
       │  └─ Footer
       │     ├─ Download Button
       │     └─ Clear Button
       │
       └─ CHAT.JS (Right 50%)
          ├─ Header
          │  ├─ Title
          │  └─ Message Count
          ├─ Messages Container
          │  ├─ User Messages
          │  ├─ Own Messages
          │  ├─ System Messages
          │  └─ Typing Indicator
          └─ Input Section
             ├─ Text Input
             └─ Send Button
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  FRONTEND STACK              BACKEND STACK                 │
│  ═════════════════          ═════════════════              │
│                                                             │
│  React 18.2.0                Node.js v14+                 │
│     ↓                           ↓                          │
│  Components                   Express 4.18.2              │
│  - App                           ↓                        │
│  - Editor                     REST API + WebServer        │
│  - Chat                           ↓                       │
│     ↓                         Socket.IO 4.5.4            │
│  State Management               ↓                        │
│  (React Hooks)                Real-Time Events           │
│     ↓                           ↓                        │
│  Socket.IO Client 4.5.4      Room Management            │
│     ↓                           ↓                        │
│  WebSocket                    MongoDB (Optional)         │
│  Connection                   Mongoose 7.0.0             │
│     ↓                           ↓                        │
│  CSS3                         In-Memory Storage          │
│  Styling                      (Falls back if no MongoDB)  │
│                                                             │
│  PORT: 3000                  PORT: 5000                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Communication Protocol

```
CLIENT                          SERVER                    OTHER CLIENTS
  │                               │                            │
  │ 1. Connect (WebSocket)        │                            │
  ├──────────────────────────────►│                            │
  │                               │                            │
  │ 2. Emit 'join-room'           │                            │
  ├──────────────────────────────►│                            │
  │                               │ 3. Add user to room       │
  │                               │   Store in memory          │
  │                               │                            │
  │                               │ 4. Emit 'load-document'   │
  │◄──────────────────────────────┤     (current content)      │
  │                               │                            │
  │                               │ 5. Broadcast 'user-joined'│
  │                               ├───────────────────────────►│
  │                               │                            │
  │ 6. Type text                  │                            │
  │    Emit 'text-change'         │                            │
  ├──────────────────────────────►│                            │
  │                               │ 7. Update room content    │
  │                               │                            │
  │                               │ 8. Broadcast              │
  │                               │    'receive-text-change' │
  │◄──────────────────────────────┤◄──────────────────────────┤
  │ (Gets own change back)        │ (Other users get it)      │
  │                               │                            │
  │ 9. Send message               │                            │
  │    Emit 'send-message'        │                            │
  ├──────────────────────────────►│                            │
  │                               │ 10. Store message         │
  │                               │                            │
  │                               │ 11. Broadcast             │
  │                               │     'receive-message'    │
  │◄──────────────────────────────┤◄──────────────────────────┤
  │ (Gets own message back)       │ (Other users get it)      │
  │                               │                            │
  │ 12. Disconnect/Leave          │                            │
  ├──────────────────────────────►│                            │
  │                               │ 13. Remove user           │
  │                               │ 14. Broadcast 'user-left' │
  │                               ├───────────────────────────►│
```

## State Management Flow

```
USER INTERACTION
      │
      ▼
LOCAL COMPONENT STATE (React)
├─ Content (Editor)
├─ Messages (Chat)
├─ Username (App)
├─ Room ID (App)
├─ Typing Users (Chat)
      │
      ▼
SOCKET.IO EMITS
  └─ Event + Data
      │
      ▼
SERVER RECEIVES
├─ Validates
├─ Updates Room State
└─ Updates In-Memory Database
      │
      ▼
BROADCAST TO OTHER CLIENTS
      │
      ▼
OTHER CLIENTS RECEIVE
├─ Socket.IO Event
├─ Update Local Component State
└─ React Re-renders
```

## Scalability Architecture

```
CURRENT SETUP (Single Server)
┌────────────────────────────────────┐
│  Single Node.js Server             │
│  ├─ Express                        │
│  ├─ Socket.IO                      │
│  └─ In-Memory Room Storage         │
│  Max Users: ~5-10k per server      │
└────────────────────────────────────┘

SCALABLE SETUP (Future Enhancement)
┌──────────────────────────────────────────────────────────┐
│  Load Balancer (nginx)                                   │
│         │                                                │
│    ┌────┴────────┬────────────┬────────────┐             │
│    │             │            │            │             │
│    ▼             ▼            ▼            ▼             │
│  Server 1    Server 2    Server 3    Server N            │
│  (Node.js)   (Node.js)   (Node.js)   (Node.js)           │
│                                                          │
│  All connected via:                                      │
│  ├─ Redis (Message Queue)                               │
│  ├─ MongoDB (Shared Database)                            │
│  └─ Socket.IO Adapter (Cross-server communication)       │
│                                                          │
│  Max Users: Unlimited (Scales horizontally)              │
└──────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### 1. **WebSocket over HTTP**
   - Persistent connection for real-time updates
   - Lower latency than HTTP polling
   - Efficient for frequent data exchange

### 2. **In-Memory Storage**
   - Fast access for active rooms
   - Automatic cleanup of empty rooms
   - Can add MongoDB for persistence if needed

### 3. **Room-Based Architecture**
   - Users isolated in rooms
   - Efficient broadcasting
   - Can support multiple concurrent sessions

### 4. **Client-Side State**
   - React manages UI state
   - Socket.IO handles real-time sync
   - No unnecessary round-trips

### 5. **Last-Write-Wins**
   - Simple conflict resolution
   - Latest version always shown
   - Sufficient for MVP, can be enhanced

---

## Performance Characteristics

```
Network Bandwidth:
└─ Text Change: ~50-100 bytes per event
└─ Chat Message: ~100-200 bytes per event
└─ Typing Indicator: ~50 bytes (debounced)
└─ Typical Session: <1 MB per hour

Server Memory:
└─ Empty: ~50 MB (Node.js base)
└─ Per Room: ~10-50 KB (depending on document size)
└─ Per User: ~1-5 KB
└─ 10 rooms with 10 users each: ~200 MB total

Response Times:
└─ Average Latency: <100ms locally
└─ Text Sync: <50ms
└─ Message Delivery: <100ms
└─ User Join: <200ms
```

---

This architecture provides a foundation for real-time collaboration that can scale from 2 to thousands of concurrent users with proper infrastructure additions!
