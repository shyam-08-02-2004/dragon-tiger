import React from 'react';
import './chat.css';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  type: 'text' | 'file';
  content: string; // text or file URL
  fileName?: string;
  timestamp: string;
}

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.sender === 'user';
  const bubbleClass = isUser ? 'bubble user' : 'bubble agent';
  return (
    <div className={bubbleClass}>
      {message.type === 'text' ? (
        <p>{message.content}</p>
      ) : (
        <a href={message.content} target="_blank" rel="noopener noreferrer" className="file-link">
          📎 {message.fileName || 'Attachment'}
        </a>
      )}
      <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
    </div>
  );
};

export default MessageBubble;
