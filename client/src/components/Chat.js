import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

function Chat({ socket, roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatTypingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!socket) return;

    // Receive chat messages
    socket.on('receive-message', (messageObj) => {
      setMessages(prev => [...prev, messageObj]);
    });

    // Receive chat typing indicators
    socket.on('chat-typing-indicator', (data) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        if (data.isTyping && data.username !== username) {
          updated.add(data.username);
        } else {
          updated.delete(data.username);
        }
        return updated;
      });
    });

    // Handle user join/leave messages
    socket.on('user-joined', (data) => {
      setMessages(prev => [...prev, {
        id: new Date().getTime(),
        username: 'System',
        message: data.message,
        timestamp: new Date(),
        isSystemMessage: true
      }]);
    });

    socket.on('user-left', (data) => {
      setMessages(prev => [...prev, {
        id: new Date().getTime(),
        username: 'System',
        message: data.message,
        timestamp: new Date(),
        isSystemMessage: true
      }]);
    });

    return () => {
      socket.off('receive-message');
      socket.off('chat-typing-indicator');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket, username]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    if (socket) {
      socket.emit('send-message', {
        roomId,
        message: messageText
      });

      setMessageText('');
      inputRef.current?.focus();

      // Emit typing off for chat
      socket.emit('chat-typing', {
        roomId,
        isTyping: false
      });

      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(username);
        return updated;
      });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat</h2>
        <span className="message-count">{messages.length}</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.isSystemMessage ? 'system-message' : 'user-message'} ${msg.username === username ? 'own-message' : ''}`}
            >
              {!msg.isSystemMessage && (
                <>
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-text">{msg.message}</div>
                </>
              )}
              {msg.isSystemMessage && (
                <div className="system-message-text">{msg.message}</div>
              )}
            </div>
          ))
        )}

        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <span className="typing-text">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing
            </span>
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => {
            const value = e.target.value;
            setMessageText(value);
            if (socket) {
              socket.emit('chat-typing', {
                roomId,
                isTyping: value.trim().length > 0
              });
            }
            if (chatTypingTimeoutRef.current) {
              clearTimeout(chatTypingTimeoutRef.current);
            }
            chatTypingTimeoutRef.current = setTimeout(() => {
              if (socket) {
                socket.emit('chat-typing', {
                  roomId,
                  isTyping: false
                });
              }
            }, 800);
          }}
          maxLength={500}
        />
        <button type="submit" className="btn-send">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
