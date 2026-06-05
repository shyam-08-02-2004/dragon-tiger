import React, { useEffect, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatDrawer from './ChatDrawer';
import './chat.css';

const LiveChatButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { online } = useChat(); // returns true if an agent is online

  // Close drawer on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        className="live-chat-button"
        onClick={() => setOpen(true)}
        title="Live Support"
      >
        <span className="chat-icon">💬</span>
        {online && <span className="online-dot" />}
      </button>
      {/* Drawer */}
      {open && <ChatDrawer onClose={() => setOpen(false)} />}
    </>
  );
};

export default LiveChatButton;
