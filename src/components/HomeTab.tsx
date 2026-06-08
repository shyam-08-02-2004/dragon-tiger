import React from 'react';
import './HomeTab.css';
import bgImage from '../assets/luxury_lobby_bg.png';
import walletIcon from '../assets/luxury_3d_wallet.png';
import chairImage from '../assets/vip_purple_chair.png';

interface HomeTabProps {
  balance: number;
  onPlayGame: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ balance, onPlayGame }) => {
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
        
        {/* Wallet Balance Section */}
        <div className="home-wallet-card">
          <div className="hwc-left">
            <h3 className="hwc-title">WALLET BALANCE</h3>
            <div className="hwc-amount">
              <span className="hwc-currency">₹</span>
              {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="hwc-crown-divider">
              <div className="hwc-line" />
              <span className="hwc-crown-icon">👑</span>
              <div className="hwc-line" />
            </div>
          </div>
          <div className="hwc-right">
            <img src={walletIcon} alt="Wallet" className="hwc-wallet-img" />
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
