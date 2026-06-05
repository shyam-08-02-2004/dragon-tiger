import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import UploadArea from './UploadArea';
import StatusBadge from './StatusBadge';
import NotificationToast from './NotificationToast';
import './chat.css';

interface ChatDrawerProps {
  onClose: () => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ onClose }) => {
  const {
    ticketId,
    messages,
    sendMessage,
    sendFile,
    status,
    updateStatus,
    online,
    setStatus,
    newMessageCount,
    clearNewMessageCount,
  } = useChat();

  // Mark messages as read when drawer opens
  useEffect(() => {
    clearNewMessageCount();
  }, []);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.message as HTMLInputElement;
    if (input.value.trim()) {
      sendMessage(input.value.trim());
      input.value = '';
    }
  };

  return (
    <div className="chat-drawer">
      <div className="chat-header">
        <h3>Live Support {online && <span className="online-dot" />}</h3>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <div className="chat-body">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <div className="chat-footer">
        <form onSubmit={handleSend} className="msg-form">
          <input name="message" placeholder="Type your message..." autoComplete="off" />
          <button type="submit">Send</button>
        </form>
        <UploadArea onUpload={sendFile} />
        <StatusBadge status={status} onChange={updateStatus} />
        {newMessageCount > 0 && <NotificationToast count={newMessageCount} />}
      </div>
    </div>
  );
};

export default ChatDrawer;
