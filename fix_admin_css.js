import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.css', 'utf8');

const newMobileCSS = `
/* ======================================
   MOBILE RESPONSIVENESS (Admin)
   ====================================== */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  
  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid var(--dark-border);
    padding: 10px;
    align-items: center;
    justify-content: space-between;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  
  .admin-brand {
    margin-bottom: 0;
    margin-right: 15px;
  }
  
  .admin-brand h2 {
    display: none; /* Hide text, keep emoji on mobile */
  }
  
  .admin-nav {
    flex-direction: row;
    gap: 10px;
    flex: 1;
    margin-right: 15px;
  }

  .nav-btn {
    padding: 8px 12px;
    font-size: 12px;
    justify-content: center;
  }
  
  .admin-logout-btn {
    margin-top: 0;
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .admin-main {
    flex: 1;
    overflow-y: auto;
  }

  .admin-header {
    height: auto;
    padding: 15px;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .admin-header h1 {
    font-size: 20px;
  }

  .admin-content {
    padding: 10px;
  }

  .table-responsive {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid var(--dark-border);
  }
  
  .admin-table {
    min-width: 800px; /* Ensure table doesn't squish too much */
  }

  .live-game-section {
    padding: 15px;
  }

  .sim-arena {
    flex-direction: column;
    gap: 15px;
  }
  
  .sim-card-spot {
    min-height: 120px;
  }
  
  .queue-section {
    margin-top: 20px;
  }

  .queue-list {
    flex-wrap: wrap;
  }
}
`;

content = content.replace(/\/\* ======================================\r?\n\s*MOBILE RESPONSIVENESS \(Admin\)\r?\n\s*====================================== \*\/[\s\S]*?\@media \(max-width: 768px\) \{[\s\S]*?\}\r?\n\}/m, newMobileCSS);

fs.writeFileSync('src/components/AdminPanel.css', content);
