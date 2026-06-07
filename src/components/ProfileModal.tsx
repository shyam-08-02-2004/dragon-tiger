import React from 'react';
import './ProfileModal.css';

interface ProfileModalProps {
  user: any;
  onClose: () => void;
  onLogout?: () => void;
  onShowWallet?: () => void;
  onShowRefer?: () => void;
  onShowSupport?: () => void;
  onShowHistory?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  user, 
  onClose, 
  onLogout,
  onShowWallet,
  onShowRefer,
  onShowSupport,
  onShowHistory
}) => {
  if (!user) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="pm-header">
          <h2>My Profile</h2>
          <button className="pm-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="pm-content">
          
          {/* Profile Header */}
          <div className="pm-profile-header">
            <div className="pm-avatar-wrap">
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username || 'casino'}`} 
                alt="Avatar" 
                className="pm-avatar"
              />
              <div className="pm-verified">✓</div>
            </div>
            
            <div className="pm-user-info">
              <h3 className="pm-username">{user.username}</h3>
              <div className="pm-uid-wrap">
                <span className="pm-uid">UID: {user.id || '78452196'}</span>
                <span className="pm-copy-icon">📋</span>
              </div>
              <div className="pm-vip-badge">💎 VIP 1 Member</div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="pm-wallet-card">
            <div className="pm-wallet-label">Available Balance</div>
            <div className="pm-wallet-balance">
              ₹ {user.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '12,500.00'}
            </div>
            <div className="pm-wallet-actions">
              <button className="pm-btn pm-btn-primary" onClick={onShowWallet}>
                💳 Deposit
              </button>
              <button className="pm-btn pm-btn-secondary" onClick={onShowWallet}>
                💸 Withdraw
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pm-section-title">Quick Actions</div>
          <div className="pm-quick-actions">
            <div className="pm-action-card" onClick={onShowRefer}>
              <div className="pm-action-icon">🎁</div>
              <div className="pm-action-title">Refer & Earn</div>
            </div>
            <div className="pm-action-card" onClick={onShowHistory}>
              <div className="pm-action-icon">📊</div>
              <div className="pm-action-title">Transaction History</div>
            </div>
            <div className="pm-action-card" onClick={onShowSupport}>
              <div className="pm-action-icon">📞</div>
              <div className="pm-action-title">Live Support</div>
            </div>
            <div className="pm-action-card">
              <div className="pm-action-icon">🏆</div>
              <div className="pm-action-title">VIP Rewards</div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="pm-section-title">Statistics</div>
          <div className="pm-stats-card">
            <div className="pm-stats-grid">
              <div className="pm-stat-item">
                <span className="pm-stat-label">Total Deposits</span>
                <span className="pm-stat-value green">₹25,000</span>
              </div>
              <div className="pm-stat-item">
                <span className="pm-stat-label">Total Withdrawals</span>
                <span className="pm-stat-value">₹10,000</span>
              </div>
              <div className="pm-stat-item">
                <span className="pm-stat-label">Referral Earnings</span>
                <span className="pm-stat-value">₹2,500</span>
              </div>
            </div>
          </div>

          {/* Refer & Earn Banner */}
          <div className="pm-banner-card">
            <div className="pm-banner-info">
              <h3>Refer & Earn</h3>
              <p>Referral Code: VIP{user.id?.substring(0, 5) || '78452'}</p>
            </div>
            <button className="pm-banner-btn green" onClick={onShowRefer}>Share Link</button>
          </div>

          {/* Support Banner */}
          <div className="pm-banner-card support">
            <div className="pm-banner-info">
              <h3>24×7 Live Support</h3>
              <p>Need help with your account?</p>
            </div>
            <button className="pm-banner-btn blue" onClick={onShowSupport}>Live Chat</button>
          </div>

          {/* Account Section */}
          <div className="pm-section-title">Account Settings</div>
          <div className="pm-menu-list">
            <div className="pm-menu-item">
              <div className="pm-menu-left">
                <span className="pm-menu-icon">👤</span>
                <span className="pm-menu-text">Edit Profile</span>
              </div>
              <span className="pm-menu-arrow">›</span>
            </div>
            <div className="pm-menu-item">
              <div className="pm-menu-left">
                <span className="pm-menu-icon">🔐</span>
                <span className="pm-menu-text">Security Settings</span>
              </div>
              <span className="pm-menu-arrow">›</span>
            </div>
            <div className="pm-menu-item">
              <div className="pm-menu-left">
                <span className="pm-menu-icon">💳</span>
                <span className="pm-menu-text">Manage UPI</span>
              </div>
              <span className="pm-menu-arrow">›</span>
            </div>
            <div className="pm-menu-item">
              <div className="pm-menu-left">
                <span className="pm-menu-icon">📄</span>
                <span className="pm-menu-text">KYC Verification</span>
              </div>
              <span className="pm-menu-arrow">›</span>
            </div>
            <div className="pm-menu-item">
              <div className="pm-menu-left">
                <span className="pm-menu-icon">🔔</span>
                <span className="pm-menu-text">Notifications</span>
              </div>
              <span className="pm-menu-arrow">›</span>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button className="pm-logout-btn" onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                onLogout();
              }
            }}>
              🚪 Secure Logout
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
