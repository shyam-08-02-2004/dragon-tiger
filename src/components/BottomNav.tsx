import React from 'react';
import './BottomNav.css';

interface BottomNavProps {
  username: string;
  onOpenWallet: () => void;
  onOpenHistory: () => void;
  onOpenSupport: () => void;
  onGoHome: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ username, onOpenWallet, onOpenHistory, onOpenSupport, onGoHome }) => {
  return (
    <div className="bottom-nav">
      <div className="nav-item" onClick={onGoHome}>
        <span className="nav-icon">👤</span>
        <span className="nav-label">{username}</span>
      </div>
      <div className="nav-item" onClick={onOpenWallet}>
        <span className="nav-icon">💳</span>
        <span className="nav-label">Wallet</span>
      </div>
      <div className="nav-item" onClick={onOpenHistory}>
        <span className="nav-icon">📋</span>
        <span className="nav-label">History</span>
      </div>
      <div className="nav-item" onClick={onOpenSupport}>
        <span className="nav-icon">💬</span>
        <span className="nav-label">Support</span>
      </div>
    </div>
  );
};

export default BottomNav;
