import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.css', 'utf8');

const regex = /@media\s*\(\s*max-width:\s*768px\s*\)\s*\{[\s\S]*/;

const cleanMedia = `@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
    min-height: 100vh;
    height: auto;
    overflow-x: hidden;
  }
  
  .admin-sidebar {
    width: 100%;
    padding: 15px;
    flex-direction: column;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    align-items: stretch;
    box-sizing: border-box;
  }
  
  .admin-brand { 
    margin-bottom: 15px; 
    width: 100%;
    justify-content: center;
  }
  
  .admin-nav {
    flex-direction: row;
    overflow-x: auto;
    width: 100%;
    gap: 10px;
    padding-bottom: 10px;
  }

  .nav-btn {
    white-space: nowrap;
    padding: 10px 15px;
    flex: 1;
    justify-content: center;
    font-size: 14px;
  }

  .admin-logout-btn {
    margin-top: 10px;
    padding: 10px;
    width: 100%;
  }
  
  .admin-header {
    height: auto;
    padding: 15px;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    text-align: center;
  }
  
  .admin-header h1 {
    font-size: 20px;
  }

  .admin-content { 
    padding: 10px; 
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  .admin-card {
    padding: 15px;
    width: 100%;
    box-sizing: border-box;
  }

  .table-responsive {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }
  
  .admin-table {
    min-width: 800px;
  }

  .outcome-selector { 
    grid-template-columns: 1fr; 
    gap: 10px;
  }
  
  .edit-balance-group { 
    flex-wrap: wrap; 
    margin-top: 8px;
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
    flex-direction: column;
  }
}
`;

content = content.replace(regex, cleanMedia);
fs.writeFileSync('src/components/AdminPanel.css', content);
