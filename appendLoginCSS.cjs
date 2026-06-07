const fs = require('fs');

const css = `
/* ==========================================================================
   VIP LUXURY AUTHENTICATION PAGE OVERRIDES
   ========================================================================== */

.auth-container {
  background: radial-gradient(circle at center, rgba(30, 25, 10, 0.9), rgba(5, 5, 8, 1)), url('data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h40v40H0z" fill="none"/><circle cx="20" cy="20" r="1" fill="rgba(212,175,55,0.05)"/></svg>') repeat !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 100vh !important;
  padding: 20px !important;
}

.auth-card {
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.85), rgba(10, 10, 12, 0.95)) !important;
  backdrop-filter: blur(25px) !important;
  -webkit-backdrop-filter: blur(25px) !important;
  border-radius: 24px !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.8),
    inset 0 1px 3px rgba(255, 255, 255, 0.1),
    inset 0 -2px 15px rgba(212, 175, 55, 0.05),
    0 0 30px rgba(212, 175, 55, 0.15) !important;
  padding: 50px 40px !important;
  width: 100% !important;
  max-width: 440px !important;
  position: relative !important;
  overflow: hidden !important;
}

.auth-card::before {
  content: "" !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 4px !important;
  background: linear-gradient(90deg, transparent, #d4af37, #f1c40f, #d4af37, transparent) !important;
  box-shadow: 0 0 15px rgba(241, 196, 15, 0.8) !important;
}

.auth-title {
  font-family: var(--font-display) !important;
  font-size: 28px !important;
  font-weight: 900 !important;
  color: #fff !important;
  letter-spacing: 2px !important;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
  text-align: center !important;
  margin: 0 !important;
  background: linear-gradient(to bottom, #ffffff, #d4af37) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.input-group label {
  font-family: var(--font-tech) !important;
  font-size: 11px !important;
  color: #d4af37 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  font-weight: 700 !important;
  margin-left: 5px !important;
}

.input-group input {
  background: rgba(0, 0, 0, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-bottom: 2px solid rgba(212, 175, 55, 0.3) !important;
  padding: 16px 20px !important;
  border-radius: 12px !important;
  color: #fff !important;
  font-family: var(--font-ui) !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  letter-spacing: 1px !important;
  transition: all 0.3s ease !important;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5) !important;
}

.input-group input:focus {
  outline: none !important;
  border-bottom-color: #f1c40f !important;
  border-color: rgba(212, 175, 55, 0.5) !important;
  background: rgba(10, 10, 15, 0.8) !important;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2), inset 0 2px 5px rgba(0,0,0,0.5) !important;
  transform: translateY(-2px) !important;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.2) !important;
  font-weight: 400 !important;
}

.auth-submit-btn {
  margin-top: 30px !important;
  background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%) !important;
  border: 1px solid #f1c40f !important;
  color: #000 !important;
  text-transform: uppercase !important;
  font-family: var(--font-tech) !important;
  font-weight: 900 !important;
  font-size: 18px !important;
  letter-spacing: 3px !important;
  padding: 18px !important;
  border-radius: 14px !important;
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.5) !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  text-shadow: 0 1px 2px rgba(255,255,255,0.4) !important;
}

.auth-submit-btn:hover {
  transform: translateY(-4px) scale(1.02) !important;
  box-shadow: 0 15px 35px rgba(212, 175, 55, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.8) !important;
  background: linear-gradient(135deg, #f1c40f 0%, #d4af37 100%) !important;
}

.auth-toggle {
  margin-top: 35px !important;
  color: #888 !important;
  font-weight: 500 !important;
}

.toggle-btn {
  color: #d4af37 !important;
  font-weight: 800 !important;
  text-decoration: none !important;
  border-bottom: 1px dashed #d4af37 !important;
  padding-bottom: 2px !important;
  margin-left: 8px !important;
  transition: all 0.3s ease !important;
}

.toggle-btn:hover {
  color: #f1c40f !important;
  border-bottom-style: solid !important;
  text-shadow: 0 0 10px rgba(241, 196, 15, 0.5) !important;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 15px !important;
  }
  
  .auth-card {
    padding: 35px 25px !important;
    border-radius: 20px !important;
  }

  .auth-title {
    font-size: 24px !important;
  }

  .input-group input {
    padding: 14px 18px !important;
    font-size: 15px !important;
  }

  .auth-submit-btn {
    padding: 16px !important;
    font-size: 16px !important;
  }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/Auth.css', css);
