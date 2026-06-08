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
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  user, 
  onClose, 
  onPlayGame,
  onLogout,
  onShowWallet,
  onShowRefer,
  onShowSupport,
  onShowHistory
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
          
          {/* Wallet Card */}
          <div className="up-card wallet" onClick={onShowWallet}>
            <div className="up-card-icon">💰</div>
            <div className="up-card-content">
              <h3 className="up-card-title">Wallet & Banking</h3>
              <p className="up-card-subtitle">Manage balance & transactions</p>
            </div>
            <div className="up-card-arrow">›</div>
          </div>

          {/* Refer & Earn Card */}
          <div className="up-card refer" onClick={onShowRefer}>
            <div className="up-card-icon">🎁</div>
            <div className="up-card-content">
              <h3 className="up-card-title">Refer & Earn</h3>
              <p className="up-card-subtitle">Invite friends, earn rewards</p>
            </div>
            <div className="up-card-arrow">›</div>
          </div>

          {/* Support Card */}
          <div className="up-card support" onClick={onShowSupport}>
            <div className="up-card-icon">🎧</div>
            <div className="up-card-content">
              <h3 className="up-card-title">Live Support</h3>
              <p className="up-card-subtitle">24/7 VIP assistance</p>
            </div>
            <div className="up-card-arrow">›</div>
          </div>

          {onLogout && (
            <div className="up-card logout" onClick={() => onLogout()}>
              <div className="up-card-icon">🚪</div>
              <div className="up-card-content">
                <h3 className="up-card-title" style={{color: '#EF4444'}}>Secure Logout</h3>
                <p className="up-card-subtitle">Sign out of your account</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="up-bottom-nav">
        <button className="up-nav-item" onClick={onClose}>
          <span className="up-nav-icon">🏠</span>
          <span className="up-nav-text">Home</span>
        </button>
        <button className="up-nav-item" onClick={onPlayGame || onClose}>
          <span className="up-nav-icon">🎮</span>
          <span className="up-nav-text">Games</span>
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
