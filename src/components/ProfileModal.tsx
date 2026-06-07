import React from 'react';
import './ProfileModal.css';

interface ProfileModalProps {
  user: any;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
        <button className="profile-close-btn" onClick={onClose}>&times;</button>
        <h2 className="profile-title">Player Profile</h2>
        
        <div className="profile-header">
          <div className="profile-avatar">{user.username?.charAt(0).toUpperCase()}</div>
          <div className="profile-name">{user.username}</div>
          <div className="profile-id">ID: {user.id}</div>
        </div>

        <div className="profile-details">
          <div className="profile-row">
            <span className="profile-label">Wallet Balance</span>
            <span className="profile-value gold">₹ {Number(user.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Total Referrals</span>
            <span className="profile-value">{user.totalReferrals || 0}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Referral Earnings</span>
            <span className="profile-value green">₹ {user.referralEarnings || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
