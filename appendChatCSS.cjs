const fs = require('fs');

const css = `
/* ==========================================================================
   VIP LUXURY CASINO ADMIN CHAT OVERRIDES
   ========================================================================== */

.admin-chat-layout {
  background: rgba(10, 10, 15, 0.9) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(212, 175, 55, 0.05) !important;
  backdrop-filter: blur(20px) !important;
  overflow: hidden !important;
}

.admin-chat-sidebar {
  background: linear-gradient(180deg, rgba(15, 15, 20, 0.95), rgba(5, 5, 8, 0.95)) !important;
  border-right: 1px solid rgba(212, 175, 55, 0.2) !important;
}

.admin-chat-user {
  padding: 15px 20px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  display: flex !important;
  align-items: center !important;
  gap: 15px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.admin-chat-user:hover {
  background: rgba(212, 175, 55, 0.1) !important;
}

.admin-chat-user.active {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.2), transparent) !important;
  border-left: 4px solid var(--gold) !important;
}

.admin-chat-user .user-avatar {
  background: linear-gradient(135deg, #d4af37, #aa7c11) !important;
  color: #000 !important;
  width: 45px !important;
  height: 45px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 900 !important;
  font-size: 20px !important;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4) !important;
  border: 2px solid #fff !important;
}

.admin-chat-user .user-info {
  flex: 1 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.admin-chat-user .user-name {
  color: #FFF !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  letter-spacing: 0.5px !important;
}

.admin-chat-user .unread-badge {
  background: #E74C3C !important;
  color: #FFF !important;
  padding: 4px 10px !important;
  border-radius: 20px !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.5) !important;
}

.admin-chat-header {
  background: rgba(0, 0, 0, 0.6) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
  padding: 20px 25px !important;
  backdrop-filter: blur(10px) !important;
}

.admin-chat-header h3 {
  color: var(--gold) !important;
  font-family: var(--font-display) !important;
  font-size: 20px !important;
  letter-spacing: 1px !important;
}

.admin-chat-main {
  background: url('data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h40v40H0z" fill="none"/><circle cx="20" cy="20" r="1" fill="rgba(212,175,55,0.03)"/></svg>') repeat, radial-gradient(circle at center, rgba(15,15,20,0.9), rgba(5,5,8,0.95)) !important;
}

.admin-msg-row {
  display: flex !important;
  width: 100% !important;
  margin-bottom: 20px !important;
}

.admin-msg-row.admin {
  justify-content: flex-end !important;
}

.admin-msg-row.user {
  justify-content: flex-start !important;
}

.admin-msg-bubble {
  max-width: 70% !important;
  padding: 15px 20px !important;
  border-radius: 18px !important;
  font-size: 15px !important;
  line-height: 1.5 !important;
  position: relative !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
  animation: slideUpFade 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
}

@keyframes slideUpFade {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.admin-msg-bubble.admin {
  background: linear-gradient(135deg, #d4af37, #aa7c11) !important;
  color: #000 !important;
  border-bottom-right-radius: 4px !important;
  font-weight: 600 !important;
}

.admin-msg-bubble.user {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #FFF !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  border-bottom-left-radius: 4px !important;
  backdrop-filter: blur(10px) !important;
}

.admin-msg-time {
  font-size: 11px !important;
  margin-top: 8px !important;
  display: flex !important;
  align-items: center !important;
  opacity: 0.8 !important;
}

.admin-msg-bubble.admin .admin-msg-time {
  color: rgba(0, 0, 0, 0.7) !important;
}

.admin-msg-bubble.user .admin-msg-time {
  color: rgba(255, 255, 255, 0.5) !important;
}

.hc-premium-actions {
  display: flex !important;
  gap: 10px !important;
  margin-top: 10px !important;
}

.premium-btn-edit, .premium-btn-delete {
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: inherit !important;
  border-radius: 6px !important;
  padding: 5px 10px !important;
  font-size: 11px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  transition: all 0.2s !important;
}

.premium-btn-edit:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.premium-btn-delete:hover {
  background: rgba(231, 76, 60, 0.8) !important;
  border-color: #E74C3C !important;
  color: #FFF !important;
}

.admin-chat-input {
  background: rgba(0, 0, 0, 0.6) !important;
  border-top: 1px solid rgba(212, 175, 55, 0.2) !important;
  padding: 20px 25px !important;
  backdrop-filter: blur(10px) !important;
}

.admin-chat-input input {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: #FFF !important;
  font-size: 16px !important;
  padding: 15px 25px !important;
  border-radius: 30px !important;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5) !important;
}

.admin-chat-input input:focus {
  border-color: var(--gold) !important;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.3), inset 0 2px 5px rgba(0,0,0,0.5) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.admin-chat-input button {
  background: linear-gradient(135deg, #d4af37, #aa7c11) !important;
  color: #000 !important;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4) !important;
  border-radius: 30px !important;
  padding: 0 35px !important;
  font-size: 16px !important;
  font-weight: 900 !important;
}

.admin-chat-input button:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.6) !important;
}

.admin-chat-back {
  background: rgba(212, 175, 55, 0.1) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: var(--gold) !important;
  font-weight: 700 !important;
}

.admin-chat-delete {
  background: rgba(231, 76, 60, 0.1) !important;
  border: 1px solid rgba(231, 76, 60, 0.3) !important;
  color: #E74C3C !important;
  font-weight: 700 !important;
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
