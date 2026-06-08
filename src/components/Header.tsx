import React from 'react';
import './Header.css';
import vipAvatar from '../assets/vip-man.png';

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
      {/* Left: Profile & VIP */}
      <div className="ph-left" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
        <div className="vip-unified-wrapper size-md">
          <div className="vip-unified-ring">
            <img src={vipAvatar} alt="Profile" className="vip-unified-img" />
          </div>
        </div>
        <div className="ph-user-info">
          <div className="ph-name-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <span className="ph-username">{username || 'Guest'}</span>
            <span className="ph-vip-badge">👑 VIP 8</span>
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

      {/* Right: Wallet Balance */}
      <div className="ph-right">
        <div className="ph-wallet-card" onClick={onShowWallet}>
          <div className="ph-wallet-icon">💳</div>
          <div className="ph-wallet-details">
            <span className="ph-wallet-label">WALLET BALANCE</span>
            <span className="ph-wallet-amount">₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="ph-wallet-arrow">›</div>
        </div>
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
