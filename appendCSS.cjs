const fs = require('fs');
const css = `
/* VIP TRANSACTIONS GRID */
.admin-tx-container {
  padding: 10px;
}

.admin-tx-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.4);
  padding: 15px 20px;
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.admin-tx-header h3 {
  margin: 0;
  color: var(--gold);
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: 1px;
}

.admin-tx-badge {
  background: rgba(212, 175, 55, 0.15);
  color: var(--gold);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.admin-tx-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.admin-tx-card {
  background: rgba(15, 15, 15, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.admin-tx-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.admin-tx-card.deposit {
  border-top: 3px solid #4CAF50;
}

.admin-tx-card.withdrawal {
  border-top: 3px solid #F44336;
}

.admin-tx-card.deposit:hover {
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.2);
}

.admin-tx-card.withdrawal:hover {
  box-shadow: 0 10px 25px rgba(244, 67, 54, 0.2);
}

.tx-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tx-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-avatar {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.tx-username {
  color: #FFF;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.tx-time {
  color: #888;
  font-size: 11px;
  margin-top: 2px;
}

.tx-status-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 20px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tx-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.tx-status-pill.pending { background: rgba(241, 196, 15, 0.1); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.2); }
.tx-status-dot.pending { background: #f1c40f; box-shadow: 0 0 5px #f1c40f; animation: pulsePending 1.5s infinite; }

.tx-status-pill.approved { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); }
.tx-status-dot.approved { background: #2ecc71; box-shadow: 0 0 5px #2ecc71; }

.tx-status-pill.rejected { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.2); }
.tx-status-dot.rejected { background: #e74c3c; box-shadow: 0 0 5px #e74c3c; }

@keyframes pulsePending {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.tx-card-middle {
  padding: 20px;
}

.tx-amount-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.tx-type-label {
  font-size: 11px;
  color: #aaa;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 5px;
}

.tx-amount {
  font-family: var(--font-tech);
  font-size: 28px;
  font-weight: 900;
}

.tx-amount.deposit { color: #4CAF50; text-shadow: 0 2px 10px rgba(76, 175, 80, 0.3); }
.tx-amount.withdrawal { color: #F44336; text-shadow: 0 2px 10px rgba(244, 67, 54, 0.3); }

.tx-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  border-radius: 8px;
}

.tx-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.tx-info-label {
  color: #888;
}

.tx-info-val {
  color: #ddd;
  font-family: monospace;
  font-size: 13px;
  letter-spacing: 0.5px;
  word-break: break-all;
  max-width: 180px;
  text-align: right;
}

.tx-card-bottom {
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto;
}

.tx-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 45px;
  gap: 10px;
}

.tx-actions.single-action {
  grid-template-columns: 1fr;
}

.tx-btn {
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.tx-btn.approve {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.tx-btn.approve:hover {
  background: rgba(46, 204, 113, 0.3);
}

.tx-btn.reject {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.tx-btn.reject:hover {
  background: rgba(231, 76, 60, 0.3);
}

.tx-btn.delete {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aaa;
}

.tx-btn.delete:hover {
  background: rgba(231, 76, 60, 0.8);
  color: #fff;
  border-color: #e74c3c;
}

.tx-btn.delete-only {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
}

.tx-btn.delete-only:hover {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.4);
}

@media (max-width: 768px) {
  .admin-tx-grid {
    grid-template-columns: 1fr;
  }
}
`;
fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
console.log("Appended");
