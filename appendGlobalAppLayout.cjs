const fs = require('fs');

const css = `
/* ==========================================================================
   GLOBAL FULL PAGE APP LAYOUT (ALL DEVICES)
   ========================================================================== */

/* When a tab is open, completely hide the sidebar */
.admin-layout.nav-closed .admin-sidebar {
  display: none !important;
}

/* When the menu is open, completely hide the content */
.admin-layout.nav-open .admin-main,
.admin-layout.nav-open .admin-content {
  display: none !important;
}

/* Make the sidebar full width and full height when it's the only thing visible */
.admin-layout.nav-open .admin-sidebar {
  width: 100% !important;
  max-width: 100% !important;
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  border-right: none !important;
}

/* Fix the navigation grid to be centered and large on desktop as well */
.admin-layout.nav-open .admin-nav {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  gap: 20px !important;
  padding: 40px !important;
  align-content: center !important;
  height: 100% !important;
}

.admin-layout.nav-open .admin-nav-btn {
  height: 120px !important;
  flex-direction: column !important;
  justify-content: center !important;
  font-size: 18px !important;
}

/* Ensure the back button is visible on ALL devices */
.mobile-nav-toggle {
  display: flex !important;
  align-items: center;
  gap: 10px;
  background: rgba(212, 175, 55, 0.1) !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  color: var(--gold) !important;
  font-size: 16px !important;
  padding: 12px 20px !important;
  border-radius: 12px !important;
  width: max-content;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.mobile-nav-toggle:hover {
  background: rgba(212, 175, 55, 0.2) !important;
  transform: translateX(-5px);
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
