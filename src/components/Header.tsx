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
        {isGameView ? (
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              color: '#D4AF37', 
              fontSize: '18px', 
              cursor: 'pointer', 
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
          >
            ↻ <span style={{ fontSize: '10px', fontWeight: 'bold' }}>RELOAD</span>
          </button>
        ) : (
          <div className="ph-animated-username" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
            {username || 'Guest'}
          </div>
        )}
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
