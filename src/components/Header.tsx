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
  voiceEnabled: boolean;
  onToggleMute: () => void;
  onShowRefer?: () => void;
  onShowProfile?: () => void;
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
  onShowRefer,
  onShowProfile,
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
        <div className="user-info" onClick={onShowProfile} style={{ cursor: 'pointer', padding: '2px', border: '2px solid rgba(212, 160, 23, 0.5)', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center' }}>
          <img 
            src="https://images.unsplash.com/photo-1583864697784-a0efc8379f70?w=400&q=80" 
            alt="Profile" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
          />
        </div>
        <button className="mute-btn" onClick={(e) => { e.stopPropagation(); onToggleMute(); }} style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
          {muted ? '🔇' : '🔊'}
        </button>
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
            {onShowProfile && (
              <button className="udp-btn udp-profile" onClick={onShowProfile} style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
                My Profile
              </button>
            )}
            {onShowRefer && (
              <button className="udp-btn udp-refer" onClick={onShowRefer} style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}>
                Refer & Earn
              </button>
            )}
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
