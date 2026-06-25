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
      {/* Left: Avatar/Name (Home) or Balance (Game) */}
      <div className="ph-left" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {!isGameView ? null : (
          <div className="ph-premium-balance" onClick={onShowWallet}>
            <div className="ppb-glow"></div>
            <span className="ppb-currency">₹</span>
            <span className="ppb-amount">{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <button className="ppb-add">+</button>
          </div>
        )}
      </div>

      {/* Center: Royal Casino Logo */}
      <div className="ph-center">
        <div className="ph-logo">
          <span className="ph-crown">👑</span>
          <div className="ph-logo-text">ROYAL</div>
          <div className="ph-logo-sub">— VIP —</div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="ph-right" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Sound Toggle */}
        <div className="ph-sound-toggle" onClick={onToggleMute}>
          {muted ? '🔇' : '🔊'}
        </div>
      </div>


    </header>
  );
};

export default Header;
