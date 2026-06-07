import React from 'react';
import './Sidebar.css';
import { FaWallet, FaGift, FaHeadset, FaSignOutAlt } from 'react-icons/fa';
import type { UserAccount } from './Auth';
import vipAvatar from '../assets/vip-girl.png';

interface SidebarProps {
  user: UserAccount | null;
  onClose: () => void;
  onLogout: () => void;
  onOpenWallet: () => void;
  onOpenRefer: () => void;
  onOpenSupport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onClose, onLogout, onOpenWallet, onOpenRefer, onOpenSupport }) => {
  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <aside className="sidebar" onClick={e => e.stopPropagation()}>
        <div className="profile-section">
          <div className="avatar">
            {/* Placeholder avatar, could be replaced with user.avatarUrl */}
            <img src={user?.avatarUrl || vipAvatar} alt="avatar" />
          </div>
          <div className="username">{user?.username || 'Guest'}</div>
        </div>
        <div className="balance-card glass-card">
          <span className="balance-label">Balance</span>
          <span className="balance-amount">₹ {user?.balance?.toLocaleString() ?? 0}</span>
        </div>
        <nav className="menu-list">
          <button className="menu-item" onClick={onOpenWallet}>
            <FaWallet className="menu-icon" />
            <span>Wallet</span>
          </button>
          <button className="menu-item" onClick={onOpenRefer}>
            <FaGift className="menu-icon" />
            <span>Refer & Earn</span>
          </button>
          <button className="menu-item" onClick={onOpenSupport}>
            <FaHeadset className="menu-icon" />
            <span>Support</span>
          </button>
          <button className="menu-item logout" onClick={onLogout}>
            <FaSignOutAlt className="menu-icon" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
