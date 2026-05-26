import React, { useState, useEffect, useRef } from 'react';
import './HelpCenter.css';

interface Message {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
}

interface HelpCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ userId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [holdTimeout, setHoldTimeout] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${userId}`);
        const data = await res.json();
        setMessages(data);
        
        // Mark as read
        await fetch(`/api/chat/${userId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user' })
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await fetch(`/api/chat/message/${msgId}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch(e) { console.error(e); }
  };

  const startHold = (msg: Message) => {
    if (msg.sender !== 'user') return;
    const timer = setTimeout(() => {
      if (window.confirm('Do you want to delete this message?')) {
        handleDeleteMessage(msg.id);
      }
    }, 600);
    setHoldTimeout(timer);
  };

  const endHold = () => {
    if (holdTimeout) clearTimeout(holdTimeout);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const msg = newMessage;
      setNewMessage('');
      
      const res = await fetch(`/api/chat/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', message: msg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (e) {
      console.error(e);
    }
  };

  const isWaitingForReply = messages.length > 0 && messages[messages.length - 1].sender === 'user';

  if (!isOpen) return null;

  return (
    <div className="hc-overlay" onClick={onClose}>
      <div className="hc-modal" onClick={e => e.stopPropagation()}>
        <div className="hc-header">
          <h2>💬 Help Center</h2>
          <button className="hc-close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="hc-messages-container">
          {messages.length === 0 ? (
            <div className="hc-empty">
              <span className="hc-empty-icon">🎧</span>
              <p>Hi {userId}! How can we help you today?</p>
              <p className="hc-empty-sub">Send a message and our support team will reply soon.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`hc-message-wrapper ${msg.sender === 'user' ? 'hc-user' : 'hc-admin'}`}>
                <div 
                  className="hc-message"
                  onTouchStart={() => startHold(msg)}
                  onTouchEnd={endHold}
                  onMouseDown={() => startHold(msg)}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  style={{ cursor: msg.sender === 'user' ? 'pointer' : 'default' }}
                  title={msg.sender === 'user' ? 'Hold to delete' : ''}
                >
                  {msg.message}
                  <div className="hc-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="hc-input-area">
          {isWaitingForReply ? (
            <div style={{ flex: 1, textAlign: 'center', color: '#f39c12', fontSize: '13px', padding: '10px' }}>
              Please wait for admin reply before sending another message.
            </div>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="hc-send-btn" onClick={handleSend} disabled={!newMessage.trim()}>
                Send
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
