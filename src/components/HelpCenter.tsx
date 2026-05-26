import React, { useState, useEffect, useRef } from 'react';
import './HelpCenter.css';

interface Message {
  id: string;
  from: string; // username or 'admin'
  to: string;   // opposite party
  content: string;
  timestamp: string;
  read: boolean;
}

interface HelpCenterProps {
  username: string; // current user
  isAdmin?: boolean; // true for admin view
  onClose: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ username, isAdmin = false, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const pollRef = useRef<number | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/help/${username}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
    // poll every 3 seconds
    pollRef.current = window.setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const payload = {
      from: isAdmin ? 'admin' : username,
      to: isAdmin ? username : 'admin',
      content: newMsg.trim()
    };
    try {
      await fetch(`/api/help/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setNewMsg('');
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <button className="help-close" onClick={onClose}>✕</button>
        <h2>{isAdmin ? `Help - ${username}` : 'Help Center'}</h2>
        <div className="help-messages">
          {messages.map(m => (
            <div key={m.id} className={`help-msg ${m.from === (isAdmin ? 'admin' : username) ? 'own' : ''}`}>
              <span className="help-sender">{m.from === 'admin' ? 'Admin' : m.from}</span>
              <p>{m.content}</p>
              <span className="help-time">{new Date(m.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
        <form className="help-input" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Type your message..."
            required
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default HelpCenter;
