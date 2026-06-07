const fs = require('fs');

const css = `
/* ==========================================================================
   MOBILE RESPONSIVENESS (FULL PAGE & BACK TOGGLES)
   ========================================================================== */

.mobile-nav-toggle {
  display: none;
  background: rgba(212, 175, 55, 0.15);
  color: var(--gold);
  border: 1px solid rgba(212, 175, 55, 0.4);
  padding: 10px 15px;
  border-radius: 8px;
  font-family: var(--font-tech);
  font-weight: 700;
  margin-bottom: 15px;
  cursor: pointer;
  width: max-content;
}

@media (max-width: 768px) {
  .admin-layout.nav-closed .admin-sidebar {
    display: none !important;
  }
  
  .admin-layout.nav-open .admin-main {
    display: none !important;
  }
  
  .mobile-nav-toggle {
    display: inline-block;
  }

  /* Admin Chat Mobile Full Screen Logic */
  .admin-chat-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .admin-chat-layout.chat-active .admin-chat-sidebar {
    display: none !important;
  }

  .admin-chat-layout:not(.chat-active) .admin-chat-main {
    display: none !important;
  }
  
  .admin-chat-sidebar {
    width: 100% !important;
    border-right: none !important;
  }
  
  .admin-chat-main {
    width: 100% !important;
  }
  
  .admin-main {
    padding: 15px !important;
  }

  .admin-card {
    padding: 15px !important;
  }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
