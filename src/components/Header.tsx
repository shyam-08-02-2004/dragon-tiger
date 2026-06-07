import React from 'react';
import './Header.css';
import vipAvatar from '../assets/vip-avatar.png';

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
  onShowHistory,
  onShowWallet,
  muted,
  onToggleMute,
  onShowProfile,
}) => {
  return (
    <header className="premium-header">
      {/* Left: Profile & Wallet */}
      <div className="ph-left" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
        <div className="ph-avatar-wrapper">
          <img src={vipAvatar} alt="Profile" className="ph-avatar" />
        </div>
        <div className="ph-user-info">
          <div className="ph-name-row">
            <span className="ph-username">{username || 'Guest'}</span>
            <span className="ph-vip-badge">VIP 8</span>
          </div>
          <div className="ph-balance-row" onClick={(e) => { e.stopPropagation(); onShowWallet(); }}>
            <span className="ph-balance">
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button className="ph-add-btn">+</button>
          </div>
        </div>
      </div>

      {/* Center: Royal Casino Logo */}
      <div className="ph-center">
        <div className="ph-logo">
          <span className="ph-crown">👑</span>
          <div className="ph-logo-text">ROYAL</div>
          <div className="ph-logo-sub">— CASINO —</div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="ph-right">
        <button className="ph-action-btn" onClick={onToggleMute}>
          <div className="ph-icon">{muted ? '🔇' : '🔊'}</div>
          <span className="ph-label">{muted ? 'Sound Off' : 'Sound On'}</span>
        </button>
        {onShowHistory && (
          <button className="ph-action-btn" onClick={onShowHistory}>
            <div className="ph-icon">🕒</div>
            <span className="ph-label">History</span>
          </button>
        )}
      </div>

      {/* Round Number Floating below header */}
      <div className="ph-round-floating">
        <div className="ph-round-label">Round No.</div>
        <div className="ph-round-val"># {roundNumber}</div>
      </div>
    </header>
  );
};

export default Header;
