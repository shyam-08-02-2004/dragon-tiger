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
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const holdTimeoutRef = useRef<any>(null);

  const startHold = (msgId: string) => {
    holdTimeoutRef.current = setTimeout(() => {
      setActiveMenuMsgId(msgId);
    }, 600);
  };

  const endHold = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  };

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
      setActiveMenuMsgId(null);
    } catch(e) { console.error(e); }
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
          <button className="hc-close-btn" onClick={onClose}>← Back</button>
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
              <div key={msg.id} className={`hc-message-wrapper ${msg.sender === 'user' ? 'hc-user' : 'hc-admin'}`}>
                <div 
                  className="hc-message"
                  onTouchStart={() => msg.sender === 'user' && startHold(msg.id)}
                  onTouchEnd={endHold}
                  onMouseDown={() => msg.sender === 'user' && startHold(msg.id)}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                >
                  {msg.message}
                  <div className="hc-timestamp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.sender === 'user' && activeMenuMsgId === msg.id && (
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        style={{
                          background: 'none', border: 'none', color: '#e74c3c', 
                          fontSize: '12px', cursor: 'pointer', padding: '0 4px',
                          marginLeft: '8px'
                        }}
                        title="Delete message"
                      >
                        🗑️ Delete
                      </button>
                    )}
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
