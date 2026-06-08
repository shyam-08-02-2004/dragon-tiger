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
  timer?: number;
  phase?: string;
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
  timer,
  phase,
}) => {
  return (
    <header className="premium-header">
      {/* Left: Refresh (Game View) or Animated Username */}
      <div className="ph-left">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="ph-animated-username" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
            {username || 'Guest'}
          </div>
          {isGameView && timer !== undefined && phase && (
            <div style={{
              marginTop: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              color: phase === 'betting' ? (timer <= 5 ? '#e74c3c' : '#2ecc71') : '#f1c40f',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${phase === 'betting' ? (timer <= 5 ? '#e74c3c' : '#2ecc71') : '#f1c40f'}`
            }}>
              {phase === 'betting' ? `⏳ BET: ${timer}s` : (phase === 'dealing' ? '⚡ DEALING' : '✨ RESULT')}
            </div>
          )}
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
