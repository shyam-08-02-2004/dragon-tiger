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
      {/* Left: Refresh (Game View) or Animated Username */}
      <div className="ph-left">
        <div className="ph-animated-username" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
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


    </header>
  );
};

export default Header;
