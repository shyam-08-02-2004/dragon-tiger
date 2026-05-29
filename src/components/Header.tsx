import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  balance: number;
  roundNumber: number;
  username: string;
  userId: string;
  password?: string;
  onLogout: () => void;
  onShowHistory?: () => void;
  onShowWallet: () => void;
  onShowSupport?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  balance,
  roundNumber,
  username,
  userId,
  password,
  onLogout,
  onShowHistory,
  onShowWallet,
  onShowSupport,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      {/* Left side: logo and live badge */}
      <div className="header-left">
        <div className="logo-group">
          <div className="logo-dragon">🐉</div>
          <div className="logo-text">
            <span className="logo-main">DRAGON</span>
            <span className="logo-separator">·</span>
            <span className="logo-tiger">TIGER</span>
          </div>
          <div className="logo-tiger-icon">🐯</div>
        </div>
        <div className="live-badge">
          <span className="live-dot" />LIVE
        </div>
      </div>

      {/* Center: round info and optional history button */}
      <div className="header-center">
        <div className="round-info">
          <div className="round-label">ROUND</div>
          <div className="round-number">{roundNumber}</div>
        </div>
        {onShowHistory && (
          <button className="history-btn" onClick={onShowHistory}>
            History
          </button>
        )}
      </div>

      {/* Right side: balance, user info and dropdown */}
      <div className="header-right">
        <div className="balance-pill" onClick={onShowWallet}>
          <span className="wallet-coin">🪙</span>
          <span className="wallet-balance">
            ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="wallet-add-btn">+</div>
        </div>
        <div className="user-info" onClick={() => setShowDropdown(!showDropdown)}>
          <span className="username-badge">{username}</span>
          <div className="logout-btn" onClick={onLogout}>⎋</div>
        </div>
        {showDropdown && (
          <div className="user-dropdown-profile">
            <div className="udp-header">
              <div className="udp-avatar">{username?.charAt(0).toUpperCase()}</div>
              <div className="udp-details">
                <div className="udp-username">Name: {username}</div>
                <div className="udp-reg">Reg No: {userId}</div>
                <div className="udp-reg" style={{ marginTop: '2px', color: '#ffcc00' }}>Pass: {password || '******'}</div>
              </div>
            </div>
            <button className="udp-btn udp-wallet" onClick={onShowWallet} style={{ background: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' }}>
              Wallet
            </button>
            {onShowSupport && (
              <button className="udp-btn udp-support" onClick={onShowSupport}>
                Support
              </button>
            )}
            <button className="udp-btn udp-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
