import React, { useState } from 'react';
import './Header.css';
import WalletModal from './WalletModal';

interface HeaderProps {
  balance: number;
  lastWin: number;
  roundNumber: number;
  username: string;
  hasDeposited: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, lastWin, roundNumber, username, hasDeposited, onLogout }) => {
  const [showWallet, setShowWallet] = useState(false);

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <div className="logo-group">
          <span className="logo-dragon">🐉</span>
          <div className="logo-text">
            <span className="logo-main">Dragon</span>
            <span className="logo-separator">vs</span>
            <span className="logo-tiger">Tiger</span>
          </div>
          <span className="logo-tiger-icon">🐯</span>
        </div>
        <span className="live-badge">
          <span className="live-dot"></span>
          LIVE
        </span>
      </div>

      <div className="header-center">
        <div className="round-info">
          <span className="round-label">ROUND</span>
          <span className="round-number">#{roundNumber}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="user-info">
          <span className="username-badge">👤 {username}</span>
          <button className="logout-btn" onClick={onLogout} title="Logout">🚪</button>
        </div>
        <div className="stat-block" id="balance-display" onClick={() => setShowWallet(true)} style={{ cursor: 'pointer', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }} title="Add/Withdraw Funds">
          <span className="stat-label">WALLET ➕</span>
          <span className="stat-value gold">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      {showWallet && <WalletModal username={username} hasDeposited={hasDeposited} balance={balance} onClose={() => setShowWallet(false)} />}
    </header>
  );
};

export default Header;
