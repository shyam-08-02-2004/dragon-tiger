import fs from 'fs';

// 1. Update api/index.js
let apiContent = fs.readFileSync('api/index.js', 'utf8');
if (!apiContent.includes('/api/time')) {
  apiContent = apiContent.replace(
    /\/\/ USER ROUTES/,
    `app.get('/api/time', (req, res) => { res.json({ serverTime: Date.now() }); });\n\n// USER ROUTES`
  );
  fs.writeFileSync('api/index.js', apiContent);
}

// 2. Update src/syncEngine.ts
let syncContent = fs.readFileSync('src/syncEngine.ts', 'utf8');
if (!syncContent.includes('setTimeOffset')) {
  syncContent = syncContent.replace(
    /export function getGlobalGameState/,
    `let timeOffset = 0;\n\nexport function setTimeOffset(offset: number) {\n  timeOffset = offset;\n}\n\nexport function getGlobalGameState`
  );
  syncContent = syncContent.replace(
    /const now = Date\.now\(\);/,
    `const now = Date.now() + timeOffset;`
  );
  fs.writeFileSync('src/syncEngine.ts', syncContent);
}

// 3. Update src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('isTimeSynced')) {
  // Add import for setTimeOffset
  appContent = appContent.replace(
    /import \{ getGlobalGameState, getDeterministicCards \} from '\.\/syncEngine';/,
    `import { getGlobalGameState, getDeterministicCards, setTimeOffset } from './syncEngine';`
  );
  
  // Add isTimeSynced state
  appContent = appContent.replace(
    /const \[isAdminView, setIsAdminView\] = useState\(true\);/,
    `const [isAdminView, setIsAdminView] = useState(true);\n  const [isTimeSynced, setIsTimeSynced] = useState(false);`
  );
  
  // Add useEffect to sync time
  appContent = appContent.replace(
    /const timerRef = useRef<ReturnType<typeof setInterval> \| null>\(null\);/,
    `const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);\n\n  useEffect(() => {\n    fetch('/api/time')\n      .then(res => res.json())\n      .then(data => {\n        const offset = data.serverTime - Date.now();\n        setTimeOffset(offset);\n        setIsTimeSynced(true);\n      })\n      .catch(e => {\n        console.error('Time sync failed', e);\n        setIsTimeSynced(true);\n      });\n  }, []);`
  );
  
  // Return loading screen if not synced
  appContent = appContent.replace(
    /if \(!isAuthenticated \|\| !currentUser\) \{/,
    `if (!isTimeSynced) {\n    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: 'gold' }}><h2>Syncing with Server...</h2></div>;\n  }\n\n  if (!isAuthenticated || !currentUser) {`
  );
  
  // We must re-init the state AFTER sync because the useState for \`state\` ran BEFORE the fetch!
  // To fix this, we can just update the state in the \`.then\` of the fetch.
  const syncFetchStr = `        const offset = data.serverTime - Date.now();\n        setTimeOffset(offset);\n        setIsTimeSynced(true);`;
  const fixedSyncFetch = `        const offset = data.serverTime - Date.now();\n        setTimeOffset(offset);\n        \n        const globalState = getGlobalGameState();\n        let initialPhase = globalState.phase as GameState['phase'];\n        let initialDragon = null;\n        let initialTiger = null;\n        let initialResult = null;\n        if (globalState.phase !== 'betting') {\n          const cards = getDeterministicCards(globalState.roundId, globalState.rawRoundId);\n          initialDragon = cards.dragonCard;\n          initialTiger = cards.tigerCard;\n          initialResult = determineResult(cards.dragonCard, cards.tigerCard);\n        }\n        \n        setState(prev => ({\n          ...prev,\n          roundNumber: globalState.roundId,\n          phase: initialPhase,\n          timer: globalState.timer,\n          dragonCard: initialDragon,\n          tigerCard: initialTiger,\n          result: initialResult\n        }));\n        setIsTimeSynced(true);`;
  
  appContent = appContent.replace(syncFetchStr, fixedSyncFetch);
  
  fs.writeFileSync('src/App.tsx', appContent);
}

// 4. Update AdminPanel.tsx to only show when synced? Actually, AdminPanel just imports getGlobalGameState inside useEffect, so it will automatically use the offset once setTimeOffset is called.
