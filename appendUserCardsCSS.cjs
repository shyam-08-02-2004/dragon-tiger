const fs = require('fs');

const css = `
/* ==========================================================================
   VIP LUXURY USER MANAGEMENT CARDS
   ========================================================================== */

.admin-user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.admin-user-card {
  background: rgba(15, 15, 20, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  backdrop-filter: blur(15px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.admin-user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
}

.admin-user-card.vip-user {
  background: linear-gradient(135deg, rgba(20, 15, 5, 0.9), rgba(15, 15, 20, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.4);
}

.admin-user-card.vip-user::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #d4af37, #f1c40f, #d4af37);
  box-shadow: 0 0 10px #f1c40f;
}

.user-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.user-card-avatar {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.vip-user .user-card-avatar {
  background: linear-gradient(135deg, #d4af37, #aa7c11);
  border: 2px solid #fff;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
}

.user-card-info {
  flex: 1;
  margin-left: 15px;
}

.user-card-phone {
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-tech);
  letter-spacing: 1px;
}

.user-card-username {
  color: #888;
  font-size: 13px;
  margin-top: 2px;
  font-weight: 500;
}

.user-card-badge {
  font-size: 10px;
  font-weight: 900;
  padding: 6px 12px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.user-card-badge.active {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.user-card-badge.inactive {
  background: rgba(241, 196, 15, 0.15);
  color: #f1c40f;
  border: 1px solid rgba(241, 196, 15, 0.3);
}

.user-card-middle {
  padding: 25px 20px;
}

.user-balance-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  border: 1px dashed rgba(212, 175, 55, 0.2);
  box-shadow: inset 0 5px 15px rgba(0,0,0,0.5);
}

.balance-label {
  font-size: 11px;
  color: #aaa;
  letter-spacing: 2px;
  font-weight: 700;
  margin-bottom: 8px;
}

.balance-amount {
  font-family: var(--font-tech);
  font-size: 32px;
  font-weight: 900;
  color: var(--gold);
  text-shadow: 0 2px 15px rgba(212, 175, 55, 0.3);
}

.user-password-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 15px;
  border-radius: 10px;
}

.password-label {
  font-size: 12px;
  color: #777;
  font-weight: 700;
}

.password-mask {
  font-family: monospace;
  color: #ccc;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 2px;
}

.user-card-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr 45px;
  gap: 10px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto;
}

.user-action-btn {
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-family: var(--font-ui);
}

.user-action-btn.edit {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
  color: var(--gold);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.user-action-btn.edit:hover {
  background: rgba(212, 175, 55, 0.3);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
}

.user-action-btn.history {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.user-action-btn.history:hover {
  background: rgba(52, 152, 219, 0.3);
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.2);
}

.user-action-btn.delete {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.user-action-btn.delete:hover {
  background: #e74c3c;
  color: #fff;
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.4);
}

/* Edit Balance Inline styling */
.vip-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 5px;
  border-radius: 12px;
  border: 1px solid var(--gold);
}

.vip-edit .balance-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  font-weight: 900;
  width: 120px;
  font-family: var(--font-tech);
  outline: none;
}

.vip-edit .save-btn {
  background: #2ecc71;
  color: #000;
  border: none;
  border-radius: 8px;
  width: 32px; height: 32px;
  font-weight: 900;
  cursor: pointer;
}

.vip-edit .cancel-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  width: 32px; height: 32px;
  font-weight: 900;
  cursor: pointer;
}

@media (max-width: 768px) {
  .admin-user-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
