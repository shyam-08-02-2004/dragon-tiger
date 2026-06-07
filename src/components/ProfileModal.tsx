import React, { useState } from 'react';
import './ProfileModal.css';

interface ProfileModalProps {
  user: any;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'vip'>('info');

  if (!user) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Background */}
        <div className="pm-header-bg"></div>
        
        {/* Close Button */}
        <button className="pm-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Profile Info Section */}
        <div className="pm-avatar-container">
          <div className="pm-avatar-ring">
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username || 'casino'}`} 
              alt="Avatar" 
              className="pm-avatar-img"
            />
          </div>
          <div className="pm-vip-badge">VIP 1</div>
        </div>

        <div className="pm-user-details">
          <h2 className="pm-username">{user.username}</h2>
          <p className="pm-userid">ID: {user.id}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="pm-tabs">
          <button 
            className={`pm-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Basic Info
          </button>
          <button 
            className={`pm-tab ${activeTab === 'vip' ? 'active' : ''}`}
            onClick={() => setActiveTab('vip')}
          >
            VIP Level
          </button>
        </div>

        {/* Tab Content */}
        <div className="pm-content">
          {activeTab === 'info' && (
            <div className="pm-info-tab">
              <div className="pm-stat-grid">
                <div className="pm-stat-card">
                  <span className="pm-stat-icon">🪙</span>
                  <div className="pm-stat-info">
                    <span className="pm-stat-label">Total Balance</span>
                    <span className="pm-stat-value gold">₹{user.balance?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className="pm-stat-card">
                  <span className="pm-stat-icon">🎮</span>
                  <div className="pm-stat-info">
                    <span className="pm-stat-label">Games Played</span>
                    <span className="pm-stat-value">{(user.history?.length || 0) + 120}</span>
                  </div>
                </div>
              </div>

              <div className="pm-details-list">
                <div className="pm-detail-item">
                  <span className="pm-detail-label">Phone</span>
                  <span className="pm-detail-value">{user.phone || '+91 ••••••••••'}</span>
                </div>
                <div className="pm-detail-item">
                  <span className="pm-detail-label">Joined</span>
                  <span className="pm-detail-value">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vip' && (
            <div className="pm-vip-tab">
              <div className="pm-vip-card">
                <div className="pm-vip-card-header">
                  <h3>Current Tier: <span>Bronze</span></h3>
                  <div className="pm-vip-icon">🎖️</div>
                </div>
                <div className="pm-vip-progress">
                  <div className="pm-progress-bar">
                    <div className="pm-progress-fill" style={{ width: '35%' }}></div>
                  </div>
                  <p className="pm-progress-text">3,500 / 10,000 EXP to Silver</p>
                </div>
              </div>
              
              <h4 className="pm-benefits-title">VIP Benefits</h4>
              <ul className="pm-benefits-list">
                <li><span className="pm-check">✓</span> Faster Withdrawals</li>
                <li><span className="pm-check">✓</span> Dedicated Account Manager</li>
                <li><span className="pm-check">✓</span> 5% Weekly Cashback</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
