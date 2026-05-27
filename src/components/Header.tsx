import React, { useState } from 'react';
import './Header.css';
import WalletModal from './WalletModal';

interface HeaderProps {
  balance: number;
  lastWin: number;
  roundNumber: number;
  username: string;
  userId: string;
  password?: string;
  hasDeposited: boolean;
  onLogout: () => void;
  onShowHistory?: () => void;
  onShowWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, lastWin, roundNumber, username, userId, password, hasDeposited, onLogout, onShowHistory, onShowWallet }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


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
            <div className="user-dropdown-profile">
              <div className="udp-header">
                <div className="udp-avatar">👤</div>
                <div className="udp-details">
                  <div className="udp-username">{username}</div>
                  <div className="udp-reg">Reg. No: #{userId || 'N/A'}</div>
                </div>
              </div>
              <div className="udp-body">
                <div className="udp-row">
                  <span className="udp-label">Password:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="udp-value">{showPassword ? (password || '••••••••') : '••••••••'}</span>
                    {password && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px', color: '#888' }}
                        title="Show/Hide Password"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="udp-footer">
                <button className="udp-btn udp-wallet" onClick={(e) => { e.stopPropagation(); setShowDropdown(false); onShowWallet(); }}>
                  💰 Wallet
                </button>
                <button className="udp-btn udp-logout" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
        <div 
          className="premium-wallet-btn" 
          id="balance-display" 
          onClick={onShowWallet} 
          title="Add/Withdraw Funds"
        >
          <div className="wallet-icon-container">
            <span className="wallet-coin">🪙</span>
          </div>
          <span className="wallet-balance">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="wallet-add-btn">+</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
