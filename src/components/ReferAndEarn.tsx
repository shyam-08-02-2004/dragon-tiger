import React, { useState, useEffect } from 'react';
import './ReferAndEarn.css';

interface ReferAndEarnProps {
  userId: string;
  onClose: () => void;
}

const dummyHistory = [
  { name: 'Rahul Kumar', date: '12 Jun 2026', status: 'Verified', reward: 50 },
  { name: 'Amit Singh', date: '10 Jun 2026', status: 'Pending', reward: 0 },
  { name: 'Priya Patel', date: '08 Jun 2026', status: 'Verified', reward: 50 }
];

const ReferAndEarn: React.FC<ReferAndEarnProps> = ({ userId, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const [history, setHistory] = useState<{name: string, date: string, status: string, reward: number}[]>([]);

  const [stats, setStats] = useState({
    referralCode: `VIP${Math.floor(100000 + Math.random() * 900000)}`,
    totalReferrals: 0,
    referralEarnings: 0
  });

  useEffect(() => {
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

    fetch(`/api/users/${userId}/referrals`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch(console.error);
  }, [userId]);

  const referralLink = `${window.location.origin}/?ref=${stats.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stats.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Dragon Tiger Casino',
          text: `Join me on Dragon Tiger and get a ₹50 bonus! Use my code: ${stats.referralCode}`,
          url: referralLink
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="re-premium-overlay" onClick={onClose}>
      <div className="re-premium-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="re-header">
          <div className="re-header-title">
            <h2>🎁 Refer & Earn</h2>
            <p>Invite friends and earn rewards together.</p>
          </div>
          <button className="re-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="re-scroll-content">
          
          {/* Bonus Card */}
          <div className="re-card bonus-card">
            <div className="bonus-glow"></div>
            <div className="bonus-content">
              <div className="bonus-step">
                <span className="icon">👤</span>
                <span className="text">Friend Joins</span>
              </div>
              <div className="bonus-plus">+</div>
              <div className="bonus-step">
                <span className="icon">🎁</span>
                <span className="text">Valid Referral</span>
              </div>
            </div>
            <div className="bonus-rewards">
              <div className="reward-item">💰 You Earn ₹50</div>
              <div className="reward-item">💰 Friend Earns ₹100</div>
            </div>
          </div>

          {/* Referral Code Card */}
          <div className="re-card code-card">
            <h3>Your Referral Code</h3>
            <div className="code-container">
              <span className="the-code">{stats.referralCode}</span>
              <button className="copy-btn" onClick={handleCopyCode}>
                {copiedCode ? '✅ Copied' : '📋 Copy Code'}
              </button>
            </div>
            {copiedCode && <div className="copy-success-anim">✅ Code Copied Successfully</div>}
          </div>

          {/* Referral Link Card */}
          <div className="re-card link-card">
            <h3>Your Referral Link</h3>
            <div className="link-container">
              <span className="the-link">{referralLink}</span>
              <button className="copy-link-btn" onClick={handleCopyLink}>
                {copiedLink ? '✅ Copied' : '📋 Copy Link'}
              </button>
            </div>
            {copiedLink && <div className="copy-success-anim">✅ Link Copied Successfully</div>}
          </div>

          {/* Quick Share */}
          <div className="re-card share-card">
            <h3>Share Your Referral Link</h3>
            <div className="share-buttons">
              <a href={`https://wa.me/?text=Join%20me%20on%20Dragon%20Tiger%20Casino!%20Get%20%E2%82%B950%20bonus%20using%20my%20link:%20${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="share-btn whatsapp">
                💬 WhatsApp
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join%20me%20on%20Dragon%20Tiger!%20Get%20%E2%82%B950%20bonus!`} target="_blank" rel="noreferrer" className="share-btn telegram">
                ✈️ Telegram
              </a>
              <button className="share-btn native" onClick={handleNativeShare}>
                🔗 Share
              </button>
            </div>
          </div>

          {/* History & Statistics */}
          <div className="re-card history-card premium-history">
            <h3>Referral History & Stats</h3>
            
            {/* Inline Stats */}
            <div className="re-stats-grid-inline">
              <div className="re-stat-card-inline">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon pulse-icon">👥</div>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalReferrals}</div>
                  <div className="stat-label">Total Referrals</div>
                </div>
              </div>
              <div className="re-stat-card-inline">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon pulse-icon">💰</div>
                </div>
                <div className="stat-info">
                  <div className="stat-value text-gold">₹{stats.referralEarnings}</div>
                  <div className="stat-label">Total Earnings</div>
                </div>
              </div>
            </div>

            <div className="history-list">
              {history.length > 0 ? history.map((item, idx) => (
                <div key={idx} className="history-row animated-row" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="history-left">
                    <div className="h-name">{item.name}</div>
                    <div className="h-date">Joined: {item.date}</div>
                  </div>
                  <div className="history-right">
                    <div className="h-reward text-gold">₹{item.reward}</div>
                    <div className={`h-status ${item.status === 'Verified' ? 'text-green' : 'text-pending'}`}>
                      {item.status === 'Verified' ? '🟢 Verified' : '🟡 Pending'}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '14px' }}>
                  No referrals yet. Share your link to start earning!
                </div>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="re-card rules-card">
            <h3>Referral Rules</h3>
            <ul className="rules-list">
              <li><span className="check">✔</span> Share karne par aapko ₹50 bonus aur friend ko ₹100 milega.</li>
              <li><span className="check">✔</span> Referral tabhi valid hoga jab account verified ho.</li>
              <li><span className="check">✔</span> Self-referrals strictly allowed nahi hain.</li>
              <li><span className="check">✔</span> Ek verified device par ek hi baar bonus milega.</li>
              <li><span className="check">✔</span> Bonus automatically aapke wallet me add ho jayega.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
