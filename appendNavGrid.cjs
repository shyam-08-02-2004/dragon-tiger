const fs = require('fs');

const css = `
/* ==========================================================================
   MOBILE NAV GRID FIX (2 ITEMS PER ROW)
   ========================================================================== */

@media (max-width: 768px) {
  .admin-layout.nav-open .admin-nav {
    grid-template-columns: 1fr 1fr !important;
    gap: 15px !important;
    padding: 20px 15px !important;
    align-content: flex-start !important;
    margin-top: 20px !important;
  }
  
  .admin-layout.nav-open .admin-nav-btn {
    height: 100px !important;
    font-size: 14px !important;
    padding: 10px !important;
  }
  
  .admin-layout.nav-open .admin-nav-btn span {
    font-size: 24px !important;
    margin-bottom: 5px !important;
  }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
