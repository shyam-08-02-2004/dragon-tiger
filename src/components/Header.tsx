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
  isGameView?: boolean;
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
  isGameView = false,
}) => {
  return (
    <header className="premium-header">
      {/* Left: Animated Username (Hidden on Game View) */}
      <div className="ph-left" onClick={!isGameView ? onShowProfile : undefined} style={{ cursor: isGameView ? 'default' : 'pointer', visibility: isGameView ? 'hidden' : 'visible' }}>
        <div className="ph-animated-username">
          {username || 'Guest'}
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
        {isGameView && (
          <div className="ph-game-balance" onClick={onShowWallet}>
            <span className="pgb-currency">₹</span>
            <span className="pgb-amount">{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <button className="pgb-add">+</button>
          </div>
        )}
      </div>

      {/* Round Number Floating below header */}
      {isGameView && (
        <div className="ph-round-floating">
          <span className="ph-round-icon">🔄</span>
          <div className="ph-round-details">
            <div className="ph-round-label">ROUND</div>
            <div className="ph-round-val"># {roundNumber}</div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
