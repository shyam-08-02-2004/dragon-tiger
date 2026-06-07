import React, { useState, useEffect, useRef } from 'react';
import './HelpCenter.css';

interface Message {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  message: string;
  imageUrl?: string;
  mediaType?: 'text' | 'image' | 'video' | 'pdf';
  isDeleted?: boolean;
  isEdited?: boolean;
  replyTo?: string;
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
  const [mediaFile, setMediaFile] = useState<{ url: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatText, setEditingChatText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${userId}`);
        const data = await res.json();
        setMessages(data);
        await fetch(`/api/chat/${userId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user' })
        });
      } catch (e) { console.error(e); }
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
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeleted: true, message: '', imageUrl: undefined } : m));
      setActiveMenuMsgId(null);
    } catch(e) { console.error(e); }
  };

  const handleEditMessage = async (msgId: string, newMsg: string) => {
    if (newMsg && newMsg.trim() !== '') {
      try {
        const res = await fetch(`/api/chat/message/${msgId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMsg })
        });
        if (res.ok) {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, message: newMsg, isEdited: true } : m));
        }
      } catch(e) { console.error(e); }
    }
    setEditingChatId(null);
    setEditingChatText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type = 'image';
    if (file.type.startsWith('video/')) type = 'video';
    if (file.type === 'application/pdf') type = 'pdf';

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaFile({ url: event.target?.result as string, type });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !mediaFile) return;
    try {
      const msg = newMessage;
      const mediaUrl = mediaFile?.url || null;
      const type = mediaFile?.type || 'text';
      setNewMessage('');
      setMediaFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      const res = await fetch(`/api/chat/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', message: msg, imageUrl: mediaUrl, mediaType: type })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <div className="hc-overlay" onClick={onClose}>
      <div className="hc-modal premium-chat" onClick={e => e.stopPropagation()}>
        <div className="hc-header glass-header">
          <div className="hc-header-profile">
            <div className="hc-support-avatar">🤵</div>
            <div className="hc-support-info">
              <h2>Live Support</h2>
              <span className="hc-online-status">🟢 Online</span>
            </div>
          </div>
          <button className="hc-close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="hc-messages-container">
          {messages.length === 0 ? (
            <div className="hc-empty">
              <span className="hc-empty-icon">🎧</span>
              <p>Welcome to Premium VIP Support.</p>
              <p className="hc-empty-sub">Send a message and our dedicated host will reply shortly.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`hc-message-wrapper ${msg.sender === 'user' ? 'hc-user' : 'hc-admin'}`}>
                <div 
                  className={`hc-message ${msg.isDeleted ? 'deleted' : ''}`}
                  onClick={() => msg.sender === 'user' && !msg.isDeleted && setActiveMenuMsgId(curr => curr === msg.id ? null : msg.id)}
                >
                  {msg.isDeleted ? (
                    <span className="deleted-text">🚫 This message was deleted.</span>
                  ) : editingChatId === msg.id ? (
                    <div className="hc-edit-box">
                      <input 
                        type="text" 
                        value={editingChatText} 
                        onChange={e => setEditingChatText(e.target.value)} 
                        autoFocus
                      />
                      <div className="hc-edit-actions">
                        <button onClick={() => setEditingChatId(null)} className="btn-cancel">Cancel</button>
                        <button onClick={() => handleEditMessage(msg.id, editingChatText)} className="btn-save">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.imageUrl && (
                        <div className="hc-media-attachment">
                          {msg.mediaType === 'video' ? (
                            <video src={msg.imageUrl} controls className="hc-video" />
                          ) : msg.mediaType === 'pdf' ? (
                            <embed src={msg.imageUrl} type="application/pdf" className="hc-pdf" />
                          ) : (
                            <img src={msg.imageUrl} alt="attachment" className="hc-image" />
                          )}
                        </div>
                      )}
                      <div className="hc-text-content">
                        {msg.message}
                        {msg.isEdited && <span className="edited-badge">(edited)</span>}
                      </div>
                      <div className="hc-timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {msg.sender === 'user' && activeMenuMsgId === msg.id && (
                        <div className="hc-msg-menu">
                          {Date.now() - new Date(msg.timestamp).getTime() <= 5 * 60 * 1000 && (
                            <button onClick={(e) => { e.stopPropagation(); setEditingChatId(msg.id); setEditingChatText(msg.message); setActiveMenuMsgId(null); }}>✏️ Edit</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}>🗑️ Delete</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="hc-input-area glass-footer">
          {mediaFile && (
            <div className="hc-media-preview">
              <span className="preview-label">{mediaFile.type.toUpperCase()} Attached</span>
              <button onClick={() => { setMediaFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>✕</button>
            </div>
          )}
          <div className="hc-input-row">
            <input type="file" accept="image/*,video/*,application/pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            <button className="hc-attach-btn" onClick={() => fileInputRef.current?.click()}>📎</button>
            <input 
              type="text" 
              placeholder="Message Live Support..." 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="hc-text-input"
            />
            <button className="hc-send-btn" onClick={handleSend} disabled={!newMessage.trim() && !mediaFile}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
