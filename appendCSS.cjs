const fs = require('fs');
const css = `
/* ==========================================================================
   PREMIUM LUXURY TRANSACTIONS UI
   ========================================================================== */

/* Full screen mobile override for transactions */
@media (max-width: 768px) {
  .admin-tx-layout.active {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    z-index: 9999 !important;
    background: radial-gradient(circle at center, #1e190a, #050508) !important;
    border-radius: 0 !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
  }
}

.admin-tx-card {
  background: rgba(15, 15, 20, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.admin-tx-card.deposit {
  border-left: 4px solid #2ecc71;
}

.admin-tx-card.withdraw {
  border-left: 4px solid #f1c40f;
}

.tx-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tx-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.tx-username {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.tx-time {
  font-size: 11px;
  color: #888;
}

.tx-badge {
  font-size: 10px;
  font-weight: 900;
  padding: 6px 12px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.tx-badge.pending {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.tx-badge.approved {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.tx-badge.rejected {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.tx-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tx-amount-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.3);
  padding: 15px;
  border-radius: 12px;
}

.tx-type-label {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
}

.tx-amount {
  font-size: 28px;
  font-weight: 900;
  font-family: var(--font-tech);
  color: #fff;
}

.tx-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tx-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #aaa;
  background: rgba(255,255,255,0.02);
  padding: 10px;
  border-radius: 8px;
}

.tx-card-actions {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background: rgba(0,0,0,0.2);
}

.tx-action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.tx-action-btn.approve {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.3);
}

.tx-action-btn.reject {
  background: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
  border-color: rgba(241, 196, 15, 0.3);
}

.tx-action-btn.delete {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

.tx-action-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.2);
}
`;

fs.appendFileSync('src/components/AdminPanel.css', css, 'utf8');
