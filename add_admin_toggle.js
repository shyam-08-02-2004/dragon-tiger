import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace state block to include isAdminView
const stateLogic = `  const [isAdminView, setIsAdminView] = useState(true);
  const [state, setState] = useState<GameState>(() => {
    const global = getGlobalGameState();`;

content = content.replace(/  const \[state, setState\] = useState<GameState>\(\(\) => \{[\s\S]*?const global = getGlobalGameState\(\);/, stateLogic);

// Replace render logic at the bottom
const renderLogic = `  if (!isAuthenticated || !currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (currentUser.username === 'babu' && isAdminView) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <AdminPanel onLogout={handleLogout} />
        <button 
          onClick={() => setIsAdminView(false)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--gold)',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '24px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            zIndex: 9999
          }}
        >
          🎮 Play Game
        </button>
      </div>
    );
  }

  return (
    <div className="app" id="app-root">
      {currentUser.username === 'babu' && !isAdminView && (
        <button 
          onClick={() => setIsAdminView(true)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'var(--gold)',
            border: '1px solid var(--gold)',
            padding: '10px 20px',
            borderRadius: '20px',
            fontWeight: 'bold',
            zIndex: 9999,
            cursor: 'pointer'
          }}
        >
          🛡️ Admin Panel
        </button>
      )}
      {/* Background ambiance */}
`;

content = content.replace(/  if \(!isAuthenticated \|\| !currentUser\) \{[\s\S]*?\<\!-- Background ambiance --\>/, renderLogic.replace('<!-- Background ambiance -->', '{/* Background ambiance */}'));

fs.writeFileSync('src/App.tsx', content);
