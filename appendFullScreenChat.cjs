const fs = require('fs');

const css = `
/* ==========================================================================
   FULL PAGE CHAT FIX FOR ALL DEVICES
   ========================================================================== */

.admin-chat-layout.chat-active {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  z-index: 99999 !important;
  border-radius: 0 !important;
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.admin-chat-layout.chat-active .admin-chat-sidebar {
  display: none !important;
}

.admin-chat-layout.chat-active .admin-chat-main {
  display: flex !important;
  width: 100% !important;
  height: 100% !important;
}

.admin-chat-layout.chat-active .admin-chat-back {
  display: flex !important;
  align-items: center !important;
  margin-right: 15px !important;
}

.admin-chat-layout.chat-active .admin-chat-header {
  border-radius: 0 !important;
}

.admin-chat-layout.chat-active .admin-chat-input {
  border-radius: 0 !important;
  padding-bottom: 30px !important; /* Safe area for some mobile devices */
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
