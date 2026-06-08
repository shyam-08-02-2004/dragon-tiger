import React from 'react';
import './HomeTab.css';
import bgImage from '../assets/luxury_lobby_bg.png';
import walletIcon from '../assets/luxury_3d_wallet.png';
import chairImage from '../assets/vip_purple_chair.png';

import vipAvatar from '../assets/vip-man.png';

interface HomeTabProps {
  username: string;
  onPlayGame: () => void;
  onShowProfile: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ username, onPlayGame, onShowProfile }) => {
  return (
    <div className="home-tab-container">
      {/* Background Image */}
      <div 
        className="home-tab-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="home-tab-overlay" />

      {/* Main Content Area */}
      <div className="home-tab-content">
        
        {/* Profile Section */}
        <div className="home-profile-card" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
          <div className="hpc-left">
            <h3 className="hpc-title">ROYAL MEMBER</h3>
            <div className="hpc-name-row">
              <span className="hpc-username">{username || 'Guest'}</span>
            </div>
            <div className="hpc-badges">
              <span className="hpc-vip-badge">👑 VIP 8</span>
              <span className="hpc-view-profile">View Profile ➔</span>
            </div>
          </div>
          <div className="hpc-right">
            <div className="hpc-avatar-wrapper">
              <img src={vipAvatar} alt="Profile" className="hpc-avatar-img" />
            </div>
          </div>
        </div>

        {/* VIP Lounge Section */}
        <div className="home-vip-card" onClick={onPlayGame} style={{ cursor: 'pointer' }}>
          <div className="hvc-left">
            <h2 className="hvc-title">VIP LOUNGE</h2>
            <p className="hvc-subtitle">Step into Royalty</p>
            <div className="hvc-games-text">► PLAY GAMES</div>
            <div className="hvc-ornament">
              <span className="hvc-diamond">♦</span>
            </div>
          </div>
          <div className="hvc-right">
            <img src={chairImage} alt="VIP Lounge" className="hvc-chair-img" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeTab;
