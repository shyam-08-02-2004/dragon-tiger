import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Simple casino‑styled chat page
const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState({}); // {userId: true}
  const socketRef = useRef(null);

  // Retrieve current user info from session storage (set during login)
  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('dragonTigerCurrentUser')) || null;
    } catch {
      return null;
    }
  }, []);

  const token = currentUser?.token || '';

  useEffect(() => {
    if (!token) return;
    const socket = io('http://localhost:5000', { auth: { token } });
    socketRef.current = socket;

    // Incoming messages from admin or other participants
    socket.on('message:new', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Typing indicators
    socket.on('typing', ({ from }) => {
      setTyping((prev) => ({ ...prev, [from]: true }));
      // Auto‑clear after a short interval
      setTimeout(() => {
        setTyping((prev) => ({ ...prev, [from]: false }));
      }, 2000);
    });

    // Presence updates (online/offline) – can be used to show status
    socket.on('presence', ({ userId, status }) => {
      // For simplicity we ignore detailed UI handling here
      console.log('Presence', userId, status);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    // Assuming admin userId is known (e.g., "admin") – adjust as needed
    socketRef.current.emit('message:new', {
      to: 'admin',
      content: input,
      type: 'text',
    });
    setInput('');
  };

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { to: 'admin' });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💬 Support Chat</h2>
      <div style={styles.messageList}>
        {messages.map((msg) => (
          <div
            key={msg._id || msg.id}
            style={
              msg.senderId === currentUser?.id ? styles.sentBubble : styles.receivedBubble
            }
          >
            {msg.content}
          </div>
        ))}
        {/* Typing indicators */}
        {Object.entries(typing).map(
          ([uid, isTyping]) =>
            isTyping && uid !== currentUser?.id && (
              <div key={uid} style={styles.typing}>
                {uid} is typing...
              </div>
            )
        )}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          onInput={handleTyping}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    background: 'radial-gradient(circle at 20% 20%, #1a001a, #0b0014)',
    color: '#ffd700',
    padding: '1rem',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
    textShadow: '0 0 10px #ff0, 0 0 20px #ff0',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto' as const,
    marginBottom: '0.5rem',
  },
  sentBubble: {
    alignSelf: 'flex-end' as const,
    background: '#330033',
    color: '#fff',
    padding: '0.5rem 0.8rem',
    borderRadius: '15px',
    margin: '0.2rem',
    maxWidth: '70%',
    boxShadow: '0 0 8px #ff00ff',
  },
  receivedBubble: {
    alignSelf: 'flex-start' as const,
    background: '#222',
    color: '#ffd700',
    padding: '0.5rem 0.8rem',
    borderRadius: '15px',
    margin: '0.2rem',
    maxWidth: '70%',
    boxShadow: '0 0 8px #ff0',
  },
  inputArea: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #555',
    background: '#111',
    color: '#fff',
  },
  sendBtn: {
    padding: '0.5rem 1rem',
    background: '#8800ff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 8px #8800ff',
  },
  typing: {
    fontStyle: 'italic' as const,
    color: '#aaa',
    marginLeft: '0.5rem',
  },
};

export default ChatPage;
