import React, { useState, useEffect, useRef } from 'react';
import './Editor.css';

function Editor({ socket, roomId, username }) {
  const [content, setContent] = useState('');
  const [stats, setStats] = useState({ words: 0, characters: 0, lines: 0 });
  const [editingUsers, setEditingUsers] = useState(new Set());
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Receive the document content when joining
    socket.on('load-document', (data) => {
      setContent(data.content);
      updateStats(data.content);
    });

    // Receive text changes from other users
    socket.on('receive-text-change', (data) => {
      setContent(data.content);
      updateStats(data.content);
    });

    // Receive editor typing indicators
    socket.on('editor-typing-indicator', (data) => {
      setEditingUsers(prev => {
        const updated = new Set(prev);
        if (data.isTyping && data.username !== username) {
          updated.add(data.username);
        } else {
          updated.delete(data.username);
        }
        return updated;
      });
    });

    return () => {
      socket.off('load-document');
      socket.off('receive-text-change');
      socket.off('editor-typing-indicator');
    };
  }, [socket, username]);

  const updateStats = (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = text.length;
    const lines = text.split('\n').length;
    
    setStats({ words, characters, lines });
  };

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateStats(newContent);

    // Emit text change to other users
    if (socket) {
      socket.emit('text-change', {
        roomId,
        content: newContent
      });

      // Emit editor typing indicator
      socket.emit('editor-typing', {
        roomId,
        isTyping: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to turn off typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('editor-typing', {
          roomId,
          isTyping: false
        });
      }, 1000);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the document? This action cannot be undone.')) {
      setContent('');
      updateStats('');
      if (socket) {
        socket.emit('text-change', {
          roomId,
          content: ''
        });
      }
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `document-${roomId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>Document Editor</h2>
        <div className="editor-stats">
          <span>📝 Words: <strong>{stats.words}</strong></span>
          <span>🔤 Characters: <strong>{stats.characters}</strong></span>
          <span>📄 Lines: <strong>{stats.lines}</strong></span>
        </div>
        {editingUsers.size > 0 && (
          <div className="editor-typing-indicator">
            {Array.from(editingUsers).join(', ')} {editingUsers.size === 1 ? 'is' : 'are'} editing...
          </div>
        )}
      </div>

      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={handleChange}
        placeholder="Start typing here... Changes will be synchronized in real-time with all users in the room."
        spellCheck="true"
      />

      <div className="editor-footer">
        <button className="btn-action" onClick={handleDownload}>
          📥 Download
        </button>
        <button className="btn-action btn-danger" onClick={handleClear}>
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}

export default Editor;
