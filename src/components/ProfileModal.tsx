import React from 'react';
import './ProfileModal.css';
import vipAvatar from '../assets/vip-man.png';

interface ProfileModalProps {
  user: any;
  onClose: () => void;
  onPlayGame?: () => void;
  onLogout?: () => void;
  onShowWallet?: () => void;
  onShowRefer?: () => void;
  onShowSupport?: () => void;
  onShowHistory?: () => void;
  onGoHome?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  user, 
  onClose, 
  onPlayGame,
  onLogout,
  onShowWallet,
  onShowRefer,
  onShowSupport,
  onShowHistory,
  onGoHome
}) => {
  if (!user) return null;

  return (
    <div className="ultra-profile-overlay">
      
      {/* Header */}
      <div className="up-header">
        <div className="up-logo">
          DRAGON
          <span>TIGER</span>
        </div>
        <button className="up-wallet-btn" onClick={onShowWallet}>
          ₹ {user.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '12,500.00'}
          <div className="up-wallet-add">+</div>
        </button>
      </div>

      {/* Scroll Area */}
      <div className="up-scroll-area">
        
        {/* Profile Section */}
        <div className="up-profile-section">
          <div className="vip-unified-wrapper size-lg">
            <div className="vip-unified-ring">
              <img 
                src={vipAvatar} 
                alt="VIP Player" 
                className="vip-unified-img"
              />
            </div>
            <div className="up-camera-icon">✏️</div>
          </div>

          <div className="up-user-details">
            <div className="up-username-row">
              <h2 className="up-username">{user.username || 'VIP Player'}</h2>
              <span className="up-verified-badge">✔</span>
            </div>
            <div className="up-uid-row">
              <span className="up-uid">ID: {user.id || '78452196'}</span>
              <span className="pm-copy-icon">📋</span>
            </div>
            <div className="up-status">
              <span className="up-status-dot"></span>
              Account Verified
            </div>
          </div>
        </div>

        {/* Main Cards Grid */}
        <div className="up-cards-grid">
          
          <div className="luxury-tiger-banner" onClick={onPlayGame || onClose} style={{ cursor: 'pointer' }}>
            <img src="./assets/luxury_casino_banner.png" alt="Luxury Casino" className="tiger-banner-img" />
          </div>

          {onLogout && (
            <button className="premium-logout-btn" onClick={() => onLogout()}>
              <div className="logout-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <span className="logout-text">SECURE LOGOUT</span>
              <span className="logout-shield">🛡️</span>
            </button>
          )}

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="up-bottom-nav">
        <button className="up-nav-item" onClick={onGoHome || onClose}>
          <span className="up-nav-icon">🏠</span>
          <span className="up-nav-text">Home</span>
        </button>
        <button className="up-nav-item active">
          <span className="up-nav-icon">👤</span>
          <span className="up-nav-text">Profile</span>
        </button>
      </div>

    </div>
  );
};

export default ProfileModal;
