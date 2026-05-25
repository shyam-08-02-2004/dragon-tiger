import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
appContent = appContent.replace(
    "import {",
    "import { getGlobalGameState, getDeterministicCards } from './syncEngine';\nimport {"
);

// 2. Remove the old handleDeal and handleNextRound completely (we'll inject our own)
appContent = appContent.replace(
    /const handleDeal = \(\) => \{[\s\S]*?const handleNextRound = useCallback\(\(\) => \{[\s\S]*?\}\, \[\]\);/m,
    `const handleDeal = (roundId: number) => {
    setState(prev => {
      if (prev.phase !== 'betting' && prev.phase !== 'dealing') return prev; // Avoid duplicate dealing
      return { ...prev, phase: 'dealing', dealerMessage: DEALER_MESSAGES.dealing };
    });

    setTimeout(() => {
      const { dragonCard, tigerCard } = getDeterministicCards(roundId);
      const result = determineResult(dragonCard, tigerCard);

      setState(prev => {
        // Prevent double processing if already processed this round
        if (prev.history.some(h => h.id === roundId)) return prev;
        
        const winnings = calculateWinnings(prev.bets, result, dragonCard, tigerCard);
        const lastWin = winnings;
        const newHistory = [
          ...prev.history,
          { id: roundId, dragonCard, tigerCard, result, win: winnings },
        ];
        
        if (newHistory.length > 50) newHistory.shift();

        return {
          ...prev,
          phase: 'result',
          dragonCard,
          tigerCard,
          result,
          balance: prev.balance + winnings,
          lastWin,
          history: newHistory,
          dealerMessage: result === 'tie' || result === 'suited-tie' 
            ? 'It\\'s a Tie!' 
            : \`\${result.toUpperCase()} WINS!\`
        };
      });
    }, 1000);
  };

  const handleNextRound = useCallback(() => {
    // Legacy function, replaced by global sync loop
  }, []);`
);

// 3. Replace the timer useEffect
appContent = appContent.replace(
    /timerRef\.current = setInterval\(\(\) => \{[\s\S]*?\}\, 1000\);/,
    `timerRef.current = setInterval(() => {
      const global = getGlobalGameState();
      
      setState(prev => {
        // Start of new round
        if (global.phase === 'betting' && prev.phase !== 'betting') {
          return {
            ...prev,
            phase: 'betting',
            timer: global.timer,
            roundNumber: global.roundId,
            dragonCard: null,
            tigerCard: null,
            result: null,
            bets: {},
            totalBet: 0,
            dealerMessage: DEALER_MESSAGES.nextRound
          };
        }
        
        // Update timer
        if (global.phase === 'betting' && prev.timer !== global.timer) {
          return { ...prev, timer: global.timer };
        }
        
        // Time to deal
        if (global.phase === 'dealing' && prev.phase === 'betting') {
          setTimeout(() => handleDeal(global.roundId), 0);
          return { ...prev, phase: 'dealing', timer: 0 };
        }
        
        return prev;
      });
    }, 200);`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("App.tsx refactored for global sync.");
