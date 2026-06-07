const fs = require('fs');
const css = `

/* ==========================================================================
   PREMIUM VIP CASINO ADMIN PANEL - BASE OVERRIDES
   ========================================================================== */

.admin-layout {
  display: flex;
  height: 100vh;
  background: radial-gradient(circle at top, #1a1a24 0%, #050508 100%);
  color: #E0E0E0;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

.admin-layout::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h40v40H0z" fill="none"/><circle cx="20" cy="20" r="1" fill="rgba(212,175,55,0.05)"/></svg>') repeat;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

.admin-sidebar {
  width: 280px;
  background: linear-gradient(180deg, rgba(15, 15, 20, 0.85) 0%, rgba(5, 5, 8, 0.95) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.8);
  overflow-y: auto;
  flex-shrink: 0;
  z-index: 10;
}

.admin-brand .admin-logo {
  font-size: 36px;
  filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.6));
}

.admin-brand h2 {
  font-family: 'Cinzel', serif;
  font-size: 26px;
  font-weight: 800;
  color: #FFD700;
  margin: 0;
  letter-spacing: 2px;
  background: linear-gradient(to bottom, #FFF 0%, #D4AF37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.admin-content {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
  z-index: 5;
  position: relative;
}

.admin-table-v2 tr {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.admin-table-v2 tr:hover {
  background: rgba(212, 175, 55, 0.08) !important;
  transform: scale(1.01);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
    overflow-y: auto;
  }
  .admin-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
    padding: 20px;
    height: auto;
    max-height: none;
    overflow: visible;
  }
  .admin-content {
    padding: 20px 15px;
  }
}
`;
fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
