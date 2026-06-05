import React, { useState } from 'react';
import './ReferAndEarn.css';

interface ReferAndEarnProps {
  userId: string;
  onClose: () => void;
}

const ReferAndEarn: React.FC<ReferAndEarnProps> = ({ userId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    referralCode: `DT-${userId.substring(0, 6).toUpperCase()}`,
    totalReferrals: 0,
    referralEarnings: 0
  });

  React.useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.referralCode) {
          setStats({
            referralCode: data.referralCode,
            totalReferrals: data.totalReferrals || 0,
            referralEarnings: data.referralEarnings || 0
          });
        }
      })
      .catch(console.error);
  }, [userId]);

  const referralLink = `${window.location.origin}/?ref=${stats.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="refer-modal-overlay" onClick={onClose}>
      <div className="refer-modal-content" onClick={e => e.stopPropagation()}>
        <button className="refer-close-btn" onClick={onClose}>&times;</button>
        <h2 className="refer-title">Refer & Earn</h2>
        <p className="refer-subtitle">Invite your friends to play Dragon Tiger and earn exciting rewards for every successful signup!</p>
        
        <div className="refer-box">
          <div className="refer-label">Your Referral Link</div>
          <div className="refer-link-container">
            <input type="text" readOnly value={referralLink} className="refer-input" />
            <button className="refer-copy-btn" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="refer-stats">
          <div className="refer-stat-item">
            <div className="refer-stat-value">{stats.totalReferrals}</div>
            <div className="refer-stat-label">Total Referrals</div>
          </div>
          <div className="refer-stat-item">
            <div className="refer-stat-value">₹ {stats.referralEarnings}</div>
            <div className="refer-stat-label">Total Earned</div>
          </div>
        </div>
        
        <div className="refer-footer">
          <p>Share on:</p>
          <div className="refer-socials">
            <a href={`https://wa.me/?text=Join%20me%20on%20Dragon%20Tiger!%20${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="refer-social-btn whatsapp">WhatsApp</a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join%20me%20on%20Dragon%20Tiger!`} target="_blank" rel="noreferrer" className="refer-social-btn telegram">Telegram</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
