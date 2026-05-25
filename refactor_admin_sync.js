import fs from 'fs';

let adminContent = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Import from syncEngine
adminContent = adminContent.replace(
    "import { drawCard, determineResult } from '../types/game';",
    "import { determineResult } from '../types/game';\nimport { getGlobalGameState, getDeterministicCards } from '../syncEngine';"
);

// 2. Replace Simulation Loop
adminContent = adminContent.replace(
    /useEffect\(\(\) => \{[\s\S]*?if \(simTimerRef\.current\) clearInterval\(simTimerRef\.current\);\s*\}\;\s*\}\, \[activeTab\]\);/,
    `useEffect(() => {
    if (activeTab !== 'game') {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      return;
    }

    simTimerRef.current = setInterval(() => {
      const global = getGlobalGameState();
      
      setSimPhase(prevPhase => {
        // Start of new round
        if (global.phase === 'betting' && prevPhase !== 'betting') {
          setSimTimer(global.timer);
          setSimDragonCard(null);
          setSimTigerCard(null);
          setSimResult(null);
          return 'betting';
        }
        
        // Update timer
        if (global.phase === 'betting') {
          setSimTimer(global.timer);
          return 'betting';
        }
        
        // Transition to dealing
        if (global.phase === 'dealing' && prevPhase === 'betting') {
          // Immediately show the deterministic cards since Admin Panel doesn't consume the queue (App.tsx consumes it)
          // Wait, if no App.tsx is open, AdminPanel MUST consume the queue!
          // We will let getDeterministicCards() consume the queue.
          setTimeout(() => {
             const { dragonCard, tigerCard } = getDeterministicCards(global.roundId);
             setSimDragonCard(dragonCard);
             setSimTigerCard(tigerCard);
             
             setTimeout(() => {
               setSimResult(determineResult(dragonCard, tigerCard));
               setSimPhase('result');
             }, 1000);
          }, 500);
          
          setSimTimer(0);
          return 'dealing';
        }
        
        return prevPhase;
      });
    }, 200);

    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); };
  }, [activeTab]);`
);

fs.writeFileSync('src/components/AdminPanel.tsx', adminContent);
console.log("AdminPanel.tsx refactored for global sync.");
