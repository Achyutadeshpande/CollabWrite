import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import Editor from './components/Editor';
import Chat from './components/Chat';
import Whiteboard from './components/Whiteboard';
import './App.css';

const SOCKET_SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

function App() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const [tempUsername, setTempUsername] = useState('');
  const [tempRoomId, setTempRoomId] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'whiteboard'

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setError('Connection error: ' + error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    
    if (!tempUsername.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!tempRoomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setUsername(tempUsername);
    setRoomId(tempRoomId);
    setError('');
    
    socketRef.current.emit('join-room', {
      roomId: tempRoomId,
      username: tempUsername
    });

    socketRef.current.on('user-joined', (data) => {
      setUserCount(data.userCount);
    });

    socketRef.current.on('user-left', (data) => {
      setUserCount(data.userCount);
    });

    setJoined(true);
  };

  const handleCreateNewRoom = () => {
    const newRoomId = uuidv4().slice(0, 8);
    setTempRoomId(newRoomId);
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopySuccess('Copied');
      setTimeout(() => setCopySuccess(''), 1400);
    } catch (err) {
      setCopySuccess('Unable to copy');
      setTimeout(() => setCopySuccess(''), 1400);
    }
  };

  const handleLeaveRoom = () => {
    setJoined(false);
    setRoomId('');
    setUsername('');
    setUserCount(0);
    setTempUsername('');
    setTempRoomId('');
    setError('');
  };

  if (!joined) {
    return (
      <div className="app-container join-screen">
        <div className="join-card">
          <h1>Collaborative Text Editor</h1>
          <p className="subtitle">Join or create a room to start collaborating</p>
          
          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>
              <div className="room-id-input-group">
                <input
                  type="text"
                  id="roomId"
                  placeholder="Enter room ID"
                  value={tempRoomId}
                  onChange={(e) => setTempRoomId(e.target.value)}
                />
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleCreateNewRoom}
                >
                  Generate
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary">
              Join Room
            </button>
          </form>

          <div className="info-box">
            <p><strong>How to use:</strong></p>
            <ul>
              <li>Enter your username</li>
              <li>Create a new room ID or paste an existing one</li>
              <li>Click "Join Room" to start collaborating</li>
              <li>Share the room ID with others to let them join</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container editor-screen">
      <div className="header">
        <div className="header-content">
          <h1>Collaborative Editor</h1>
          <div className="room-info">
            <span className="room-badge">Room: <strong>{roomId}</strong></span>
            <button className="copy-room-btn" onClick={handleCopyRoomId}>
              {copySuccess || 'Copy'}
            </button>
            <span className="user-badge">👤 {userCount} user{userCount !== 1 ? 's' : ''}</span>
            <span className="username-badge">You: <strong>{username}</strong></span>
          </div>
        </div>
        <button 
          className="btn-leave"
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            📝 Editor & Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'whiteboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('whiteboard')}
          >
            🎨 Whiteboard
          </button>
        </div>
      </div>

      <div className="main-container">
        <div className="content-area">
          {activeTab === 'editor' && (
            <Editor socket={socketRef.current} roomId={roomId} username={username} />
          )}
          {activeTab === 'whiteboard' && (
            <Whiteboard socket={socketRef.current} roomId={roomId} username={username} />
          )}
        </div>
        <Chat socket={socketRef.current} roomId={roomId} username={username} />
      </div>
    </div>
  );
}

export default App;
