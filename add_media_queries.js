import fs from 'fs';

const indexMediaQueries = `
/* ======================================
   MOBILE RESPONSIVENESS (Game)
   ====================================== */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    padding: 10px;
    gap: 10px;
    height: auto;
  }
  
  .user-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .game-arena {
    flex-direction: column;
    padding: 10px;
    gap: 15px;
  }
  
  .game-controls {
    min-width: 100%;
    padding: 15px;
    margin: 10px 0;
  }

  .dealer-message {
    font-size: 14px;
    flex-direction: column;
    text-align: center;
    gap: 5px;
  }

  .card-display {
    width: 100px;
    height: 140px;
  }
  
  .card-value {
    font-size: 32px;
  }
  
  .betting-panel {
    padding: 10px;
  }
  
  .betting-table {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 10px;
    height: auto;
  }
  
  .bet-zone {
    height: 100px;
  }

  .bet-zone.dragon, .bet-zone.tiger {
    height: 120px;
  }
  
  .side-bets {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .chip-selector {
    padding: 10px;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .chip {
    width: 50px;
    height: 50px;
    font-size: 14px;
  }

  .action-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .road-map {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px;
  }

  .auth-container {
    padding: 15px;
  }

  .auth-box {
    padding: 20px;
  }
}
`;

const adminMediaQueries = `
/* ======================================
   MOBILE RESPONSIVENESS (Admin)
   ====================================== */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
  }
  
  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid var(--dark-border);
    padding: 10px;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .sidebar-header {
    display: none;
  }
  
  .sidebar-nav {
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  .nav-item {
    flex: 1;
    justify-content: center;
    padding: 10px;
  }
  
  .admin-main {
    height: auto;
    overflow-y: visible;
  }

  .admin-content {
    padding: 15px;
  }

  .data-table-container {
    overflow-x: auto;
    margin-bottom: 20px;
  }
  
  .data-table {
    min-width: 600px;
  }

  .live-game-section {
    padding: 15px;
  }

  .sim-arena {
    flex-direction: column;
    gap: 15px;
  }
  
  .sim-card-spot {
    min-height: 140px;
  }
  
  .queue-section {
    margin-top: 20px;
  }

  .queue-list {
    flex-wrap: wrap;
  }
}
`;

fs.appendFileSync('src/index.css', indexMediaQueries);
fs.appendFileSync('src/components/AdminPanel.css', adminMediaQueries);

console.log("Media queries added successfully!");
