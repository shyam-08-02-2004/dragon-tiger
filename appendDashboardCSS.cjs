const fs = require('fs');
const css = `
/* ==========================================================================
   DASHBOARD UI OVERHAUL
   ========================================================================== */
.admin-dashboard-container {
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 15px;
}

.admin-dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.dashboard-card {
  background: rgba(15, 15, 20, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
  border-color: rgba(212, 175, 55, 0.3);
}

.dashboard-card:hover::before {
  opacity: 1;
}

.dashboard-card.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 15px;
  gap: 15px;
}

.nav-icon {
  font-size: 42px;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));
}

.nav-title {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Hide top nav on mobile globally since we now use the Dashboard */
@media (max-width: 768px) {
  .admin-nav {
    display: none !important;
  }
  
  /* Make all main layouts full screen overlays on mobile */
  .admin-user-layout.active,
  .admin-game-layout.active {
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
`;

fs.appendFileSync('src/components/AdminPanel.css', css, 'utf8');
