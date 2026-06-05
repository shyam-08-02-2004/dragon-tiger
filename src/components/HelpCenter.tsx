import React, { useState, useEffect, useRef } from 'react';
import './HelpCenter.css';

interface Message {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  message: string;
  imageUrl?: string;
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
  const [imageFile, setImageFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const holdTimeoutRef = useRef<any>(null);
  const hideTimeoutRef = useRef<any>(null);

  const startHold = (msgId: string) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    holdTimeoutRef.current = setTimeout(() => {
      setActiveMenuMsgId(msgId);
    }, 600);
  };

  const endHold = (msgId: string) => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setActiveMenuMsgId((curr) => (curr === msgId ? null : curr));
    }, 2000);
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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatText, setEditingChatText] = useState('');

  const handleEditMessage = async (msgId: string, newMsg: string) => {
    if (newMsg && newMsg.trim() !== '') {
      try {
        const res = await fetch(`/api/chat/message/${msgId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMsg })
        });
        if (res.ok) {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, message: newMsg } : m));
        }
      } catch(e) { console.error(e); }
    }
    setEditingChatId(null);
    setEditingChatText('');
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !imageFile) return;
    
    try {
      const msg = newMessage;
      const img = imageFile;
      setNewMessage('');
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      const res = await fetch(`/api/chat/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', message: msg, imageUrl: img })
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
                  onTouchEnd={() => endHold(msg.id)}
                  onMouseDown={() => msg.sender === 'user' && startHold(msg.id)}
                  onMouseUp={() => endHold(msg.id)}
                  onMouseLeave={() => endHold(msg.id)}
                >
                  {editingChatId === msg.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <input 
                        type="text" 
                        value={editingChatText} 
                        onChange={e => setEditingChatText(e.target.value)} 
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: 'none', color: '#000' }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingChatId(null)} style={{ background: '#ccc', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                        <button onClick={() => handleEditMessage(msg.id, editingChatText)} style={{ background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.imageUrl && (
                        <div style={{ marginBottom: msg.message ? '8px' : '0' }}>
                          <img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'contain' }} />
                        </div>
                      )}
                      {msg.message}
                      <div className="hc-timestamp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {new Date(msg.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        {msg.sender === 'user' && activeMenuMsgId === msg.id && (
                          <div style={{ display: 'flex', gap: '8px', animation: 'hcFadeIn 0.3s ease' }}>
                            {Date.now() - new Date(msg.timestamp).getTime() <= 10 * 60 * 1000 && (
                              <button 
                                onClick={() => { setEditingChatId(msg.id); setEditingChatText(msg.message); setActiveMenuMsgId(null); }}
                                style={{ background: 'none', border: 'none', color: '#f1c40f', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                title="Edit message"
                              >
                                ✏️ Edit
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                              title="Delete message"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
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
              {imageFile && (
                <div style={{ position: 'absolute', bottom: '100%', left: '10px', background: '#333', padding: '5px', borderRadius: '8px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                  <img src={imageFile} alt="preview" style={{ height: '40px', borderRadius: '4px' }} />
                  <button onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                </div>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '0 8px', color: '#aaa' }}
                title="Attach Photo"
              >
                📸
              </button>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="hc-send-btn" onClick={handleSend} disabled={!newMessage.trim() && !imageFile}>
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
