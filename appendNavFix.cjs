const fs = require('fs');

const css = `
/* ==========================================================================
   VIP ADMIN NAV MOBILE LAYOUT (LUXURY OVERRIDE)
   ========================================================================== */

.admin-nav-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 1px solid transparent;
  color: #aaa;
  padding: 16px 20px;
  border-radius: 12px;
  font-family: var(--font-tech);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
}

.admin-nav-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  color: #fff;
  border: 1px solid rgba(212, 175, 55, 0.3);
  transform: translateX(5px);
}

.admin-nav-btn.active {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(212, 175, 55, 0.05));
  color: var(--gold);
  border: 1px solid rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
}

.admin-nav-btn.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: var(--gold);
  box-shadow: 0 0 10px var(--gold);
}

@media (max-width: 768px) {
  .admin-sidebar {
    padding: 15px !important;
  }
  
  .admin-nav {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    justify-content: space-between !important;
    gap: 10px !important;
    padding-bottom: 20px !important;
    overflow: visible !important;
  }

  .admin-nav-btn {
    flex: 1 1 calc(50% - 5px) !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 15px 10px !important;
    gap: 8px !important;
    text-align: center !important;
    height: auto !important;
    min-height: 80px !important;
    background: rgba(10, 15, 10, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
  }

  .admin-nav-btn.active {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05)) !important;
    border: 1px solid var(--gold) !important;
  }
  
  .admin-nav-btn.active::before {
    display: none !important;
  }

  /* Make Live Round Badge full width */
  .admin-nav > div[style*="linear-gradient"] {
    width: 100% !important;
    margin: 0 0 15px 0 !important;
  }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
console.log('Appended VIP Nav overrides');
