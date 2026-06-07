const fs = require('fs');

const css = `
/* ==========================================================================
   GAME CONTROL PREMIUM UI
   ========================================================================== */

.admin-game-control-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.game-control-header h2 {
  margin: 0;
  font-family: var(--font-display, sans-serif);
  font-size: 28px;
  color: #fff;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.game-history-btn {
  background: linear-gradient(135deg, #2980b9, #3498db);
  color: #fff;
  border: 1px solid #3498db;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  font-family: var(--font-tech, sans-serif);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  transition: all 0.3s ease;
}

.game-history-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.6);
}

.game-control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.game-control-card {
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.8), rgba(10, 10, 15, 0.9));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(212, 175, 55, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.game-control-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 10px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(212, 175, 55, 0.1);
}

.game-control-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.8), transparent);
  opacity: 0.5;
}

/* Live Round Card */
.live-round-card {
  display: flex;
  align-items: center;
  gap: 24px;
  grid-column: 1 / -1;
}

.live-round-badge {
  text-align: center;
  min-width: 120px;
}

.live-round-label {
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.live-round-number {
  font-family: var(--font-tech, monospace);
  font-size: 64px;
  font-weight: 900;
  color: #f1c40f;
  line-height: 1;
  text-shadow: 0 0 20px rgba(241, 196, 15, 0.4);
}

.live-round-total {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.live-round-status {
  flex: 1;
}

.phase-indicator {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 18px;
  text-align: center;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.phase-indicator.betting {
  background: rgba(243, 156, 18, 0.15);
  border: 1px solid #f39c12;
  color: #f39c12;
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.2);
}

.phase-indicator.dealing {
  background: rgba(52, 152, 219, 0.15);
  border: 1px solid #3498db;
  color: #3498db;
  box-shadow: 0 0 20px rgba(52, 152, 219, 0.2);
}

.phase-indicator.result {
  background: rgba(46, 204, 113, 0.15);
  border: 1px solid #2ecc71;
  color: #2ecc71;
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.2);
}

.timer-bar-bg {
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
}

.timer-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #2ecc71, #f1c40f, #e74c3c);
  transition: width 0.2s linear;
  box-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
}

/* Result Setter Card */
.card-header h3 {
  margin: 0 0 5px 0;
  color: #fff;
  font-size: 20px;
}

.card-header p {
  color: #888;
  font-size: 13px;
  margin: 0 0 20px 0;
}

.result-setter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.round-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  padding: 10px 16px;
  flex: 0 0 auto;
}

.round-input-group span {
  color: #f1c40f;
  font-weight: 800;
  font-size: 18px;
}

.round-input-group input {
  width: 100px;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: var(--font-tech, monospace);
  font-size: 20px;
  font-weight: bold;
}

.outcome-btn {
  flex: 1;
  min-width: 100px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.outcome-btn.dragon {
  border: 1px solid #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}
.outcome-btn.dragon:hover {
  background: rgba(231, 76, 60, 0.3);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
}

.outcome-btn.tiger {
  border: 1px solid #3498db;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}
.outcome-btn.tiger:hover {
  background: rgba(52, 152, 219, 0.3);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.outcome-btn.tie {
  border: 1px solid #2ecc71;
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}
.outcome-btn.tie:hover {
  background: rgba(46, 204, 113, 0.3);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
}

.set-rounds-list {
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  padding: 16px;
}

.list-title {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.round-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.round-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
}

.round-tag.dragon { background: rgba(231, 76, 60, 0.15); border: 1px solid #e74c3c; }
.round-tag.tiger { background: rgba(52, 152, 219, 0.15); border: 1px solid #3498db; }
.round-tag.tie { background: rgba(46, 204, 113, 0.15); border: 1px solid #2ecc71; }

.round-tag .round-id { color: #f1c40f; }
.round-tag .round-outcome { color: #fff; text-transform: uppercase; }
.remove-tag-btn {
  background: rgba(255, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: transform 0.2s ease;
}
.remove-tag-btn:hover {
  transform: scale(1.1);
  background: #ff4757;
}

.empty-rounds-msg {
  color: #666;
  font-size: 14px;
  text-align: center;
  margin: 0;
  font-style: italic;
}

/* Live Bets Card */
.live-bets-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.live-bets-header h3 {
  margin: 0 0 4px 0;
  color: #fff;
  font-size: 20px;
}

.live-bets-header p {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.live-bets-total-badge {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(0,0,0,0.5));
  border: 1px solid rgba(212, 175, 55, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  color: #f1c40f;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.live-bets-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-box {
  background: rgba(0,0,0,0.4);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 3px solid;
}

.stat-box.dragon { border-color: #e74c3c; box-shadow: 0 -5px 15px rgba(231, 76, 60, 0.1); }
.stat-box.tiger { border-color: #3498db; box-shadow: 0 -5px 15px rgba(52, 152, 219, 0.1); }
.stat-box.tie { border-color: #2ecc71; box-shadow: 0 -5px 15px rgba(46, 204, 113, 0.1); }

.stat-title {
  color: #aaa;
  font-size: 14px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-amount {
  color: #fff;
  font-size: 24px;
  font-family: var(--font-tech, monospace);
  margin-bottom: 4px;
}

.stat-pct {
  color: #888;
  font-size: 14px;
  font-weight: bold;
}

.live-bets-progress-bar {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
}

.progress-segment { height: 100%; transition: width 0.3s ease; }
.progress-segment.dragon { background: linear-gradient(90deg, #c0392b, #e74c3c); }
.progress-segment.tiger { background: linear-gradient(90deg, #2980b9, #3498db); }
.progress-segment.tie { background: linear-gradient(90deg, #219a52, #2ecc71); }

.live-bets-empty-state {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 20px;
  padding: 10px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
}

/* Live Preview Card */
.live-preview-card h3 {
  margin: 0 0 16px 0;
  color: #fff;
  font-size: 20px;
}

.preview-scaler {
  background: rgba(0,0,0,0.3);
  border-radius: 16px;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.05);
}

.preview-result-msg {
  text-align: center;
  margin-top: 20px;
  font-size: 28px;
  font-weight: 900;
  color: #f1c40f;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 5px 15px rgba(241, 196, 15, 0.4);
  animation: hcPop 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .live-round-card {
    flex-direction: column;
    text-align: center;
  }
  .live-bets-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .live-bets-stats-grid {
    grid-template-columns: 1fr;
  }
  .stat-box {
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: none;
    border-left: 3px solid;
  }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
