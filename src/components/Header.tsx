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
  onShowHistory?: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, lastWin, roundNumber, username, hasDeposited, onLogout, onShowHistory }) => {
  const [showWallet, setShowWallet] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);


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
        {onShowHistory && (
          <button className="history-btn" onClick={onShowHistory} title="Game History">
            📋 History
          </button>
        )}
      </div>

      <div className="header-right">

        <div className="user-info dropdown-container" onClick={() => setShowDropdown(!showDropdown)}>
          <span className="username-badge">👤 {username} ▾</span>
          {showDropdown && (
            <div className="user-dropdown">
              <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="logout-action-btn">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
        <div className="stat-block premium-wallet" id="balance-display" onClick={() => setShowWallet(true)} title="Add/Withdraw Funds">
          <span className="stat-label">WALLET ➕</span>
          <span className="stat-value gold">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      {showWallet && <WalletModal username={username} hasDeposited={hasDeposited} balance={balance} onClose={() => setShowWallet(false)} />}
    </header>
  );
};

export default Header;
