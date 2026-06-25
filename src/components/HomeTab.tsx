import React from 'react';
import './HomeTab.css';
import cushionImage from '../assets/vip_purple_chair.png';
import vipAvatar from '../assets/vip-man.png';

interface HomeTabProps {
  username: string;
  onPlayGame: () => void;
  onShowProfile: () => void;
  onShowWallet: () => void;
  onShowRefer: () => void;
  onShowSupport: () => void;
  onLogout: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ username, onPlayGame, onShowProfile, onShowWallet, onShowRefer, onShowSupport, onLogout }) => {
  return (
    <div className="home-main-container">
      {/* Scrollable Content */}
      <div className="home-scroll-content">
        
        {/* 1. WELCOME BANNER */}
        <div className="home-welcome-banner" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
          <div className="hwb-left">
            <span className="hwb-subtitle">WELCOME BACK</span>
            <h2 className="hwb-title">{username || 'Guest'}</h2>
            <div className="hwb-badge">
              <span className="hwb-crown">👑</span> VIP Elite Member
            </div>
          </div>
          <div className="hwb-right">
            <img src={vipAvatar} alt="Profile Avatar" className="hwb-profile-img" />
          </div>
        </div>

        {/* 2. QUICK ACTIONS (Grid) */}
        <div className="home-quick-actions">
          <div className="hqa-btn" onClick={onShowWallet}>
            <div className="hqa-icon-wrapper">
              <span className="hqa-icon">💳</span>
            </div>
            <span className="hqa-label">WALLET</span>
            <span className="hqa-subtext">ADD FUNDS</span>
          </div>

          <div className="hqa-btn" onClick={onShowRefer}>
            <div className="hqa-icon-wrapper">
              <span className="hqa-icon">🎁</span>
            </div>
            <span className="hqa-label">BONUS</span>
            <span className="hqa-subtext">CLAIM NOW</span>
          </div>

          <div className="hqa-btn" onClick={onShowSupport}>
            <div className="hqa-icon-wrapper">
              <span className="hqa-icon">🎧</span>
            </div>
            <span className="hqa-label">SUPPORT</span>
            <span className="hqa-subtext">24/7 HELP</span>
          </div>

          <div className="hqa-btn" onClick={onLogout}>
            <div className="hqa-icon-wrapper">
              <span className="hqa-icon">🚪</span>
            </div>
            <span className="hqa-label" style={{ color: '#EF4444' }}>LOGOUT</span>
            <span className="hqa-subtext">SIGN OUT</span>
          </div>
        </div>

        {/* 3. VIP LOUNGE CARD */}
        <div className="home-vip-lounge" onClick={onPlayGame}>
          <div className="hvl-bg-overlay"></div>
          <div className="hvl-content-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
            <div className="hvl-left" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <h2 className="hvl-title" style={{ textAlign: 'left', margin: 0 }}>VIP LOUNGE</h2>
              <button className="hvl-btn" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-start' }}>PLAY GAMES ➔</button>
            </div>
            <div className="hvl-right" style={{ flexShrink: 0 }}>
              <img src={cushionImage} alt="VIP Lounge Chair" className="hvl-chair-img" style={{ width: '100px', height: 'auto', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))', transform: 'scale(1.2)' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeTab;
