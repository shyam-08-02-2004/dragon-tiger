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
  muted: boolean;
  onToggleMute: () => void;
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
  muted,
  onToggleMute,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="user-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1c40f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
            {username?.charAt(0).toUpperCase()}
          </div>
          <button className="mute-btn" onClick={(e) => { e.stopPropagation(); onToggleMute(); }} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
        {showDropdown && (
          <div className="user-dropdown-profile">
            <div className="udp-header">
              <div className="udp-avatar">{username?.charAt(0).toUpperCase()}</div>
              <div className="udp-details">

                <div className="udp-reg">Reg No: {userId}</div>
              </div>
            </div>
            <div className="udp-body">
              <div className="udp-row udp-password-row">
                <span className="udp-label">Password</span>
                <div className="udp-password-display">
                  <span>{showPassword ? password : '••••••••'}</span>
                  <button
                    type="button"
                    className="udp-password-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword(prev => !prev);
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
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
