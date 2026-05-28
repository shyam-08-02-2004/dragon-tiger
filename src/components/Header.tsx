import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  balance: number;
  lastWin: number;
  roundNumber: number;
  username: string;
  userId: string;
  password?: string;
  hasDeposited: boolean;
  onLogout: () => void;
  onShowHistory?: () => void;
  onShowWallet: () => void;
  onShowSupport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, onShowWallet, username, userId, password, onLogout, onShowSupport }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="top-bar">
      <div className="hamburger" onClick={() => setShowDropdown(!showDropdown)}>
        <span /><span /><span />
      </div>
      
      {showDropdown && (
        <div style={{ position: 'absolute', top: '50px', left: '15px', background: '#111', padding: '15px', borderRadius: '8px', zIndex: 100, border: '1px solid #444', minWidth: '200px' }}>
          <div style={{ color: '#fff', marginBottom: '10px', fontWeight: 'bold' }}>👤 {username}</div>
          <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '15px' }}>ID: {userId}</div>
          <button style={{ background: 'transparent', color: '#fff', border: 'none', padding: '8px 0', width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={onShowWallet}>💰 Wallet</button>
          {onShowSupport && <button style={{ background: 'transparent', color: '#fff', border: 'none', padding: '8px 0', width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={onShowSupport}>💬 Support</button>}
          <button style={{ background: 'transparent', color: '#e74c3c', border: 'none', padding: '8px 0', width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      <div className="logo-center">
        <span className="dragon" style={{color: '#27ae60'}}>🐉</span>
        <div className="logo-text">
          <span className="dragon">DRAGON</span>
          <span className="vs">VS</span>
          <span className="tiger">TIGER</span>
        </div>
        <span className="tiger" style={{color: '#e67e22'}}>🐯</span>
      </div>

      <div className="balance-pill" onClick={onShowWallet}>
        <span style={{color: '#f1c40f'}}>🪙</span>
        <span className="balance-val">₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <div className="balance-add">+</div>
      </div>
    </div>
  );
};

export default Header;
