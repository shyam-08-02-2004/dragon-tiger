import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Sync user balance periodically
const balanceSyncLogic = `
  useEffect(() => {
    if (!currentUser || currentUser.id === 'babu') return;
    const fetchBalance = async () => {
      try {
        const res = await fetch(\`/api/users/\${currentUser.id}\`);
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(prev => prev ? { ...prev, balance: user.balance } : null);
          setState(prev => ({ ...prev, balance: user.balance }));
        }
      } catch(e) {}
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Sync balance every 10s
    return () => clearInterval(interval);
  }, [currentUser?.id]);
`;
content = content.replace(/useEffect\(\(\) => \{\r?\n\s*const global = getGlobalGameState\(\);/, balanceSyncLogic + '\n\n  useEffect(() => {\n    const global = getGlobalGameState();');

// Modify handleDeal to consume forced outcome
const handleDealLogic = `
  const handleDeal = async (roundId?: number) => {
    if (!roundId) return;
    
    // Attempt to consume forced outcome from server
    let forcedOutcome = 'none';
    try {
      const res = await fetch('/api/admin/settings/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId })
      });
      if (res.ok) {
        const data = await res.json();
        forcedOutcome = data.outcome;
      }
    } catch(e) {}

    setState(prev => {
      if (prev.phase !== 'betting' && prev.phase !== 'dealing') return prev;
      return { ...prev, phase: 'dealing', dealerMessage: DEALER_MESSAGES.dealing };
    });

    setTimeout(() => {
      let { dragonCard, tigerCard } = getDeterministicCards(roundId);
      let result = determineResult(dragonCard, tigerCard);
      
      // Override if forced
      if (forcedOutcome !== 'none') {
        if (forcedOutcome === 'dragon' && result !== 'dragon') {
          dragonCard = { suit: '♠', value: 'K', numericValue: 13 };
          tigerCard = { suit: '♥', value: '2', numericValue: 2 };
        } else if (forcedOutcome === 'tiger' && result !== 'tiger') {
          tigerCard = { suit: '♠', value: 'K', numericValue: 13 };
          dragonCard = { suit: '♥', value: '2', numericValue: 2 };
        } else if (forcedOutcome === 'tie' && result !== 'tie' && result !== 'suited-tie') {
          dragonCard = { suit: '♠', value: '8', numericValue: 8 };
          tigerCard = { suit: '♥', value: '8', numericValue: 8 };
        }
        result = determineResult(dragonCard, tigerCard);
      }

      setState(prev => {
        if (prev.history.some(h => h.id === roundId)) return prev;
        
        const winnings = calculateWinnings(prev.bets, result, dragonCard, tigerCard);
        const lastWin = winnings;
        const newHistory = [
          ...prev.history,
          { id: roundId, dragonCard, tigerCard, result, win: winnings },
        ];
        
        if (newHistory.length > 50) newHistory.shift();
        
        const newBalance = prev.balance + winnings;
        // Update balance on server if won
        if (winnings > 0 && currentUser && currentUser.id !== 'babu') {
           fetch(\`/api/users/\${currentUser.id}/balance\`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ balance: newBalance })
           });
        }

        return {
          ...prev,
          phase: 'result',
          dragonCard,
          tigerCard,
          result,
          balance: newBalance,
          lastWin,
          history: newHistory,
          dealerMessage: result === 'tie' || result === 'suited-tie' 
            ? 'It\\'s a Tie!' 
            : \`\${result ? result.toUpperCase() : ''} WINS!\`
        };
      });
    }, 1000);
  };
`;

content = content.replace(/const handleDeal = \(roundId\?\: number\) => \{[\s\S]*?\}, 1000\);\r?\n\s*\};/m, handleDealLogic);

// Remove localstorage balance syncing since we do it via api
content = content.replace(/if \(currentUser && currentUser\.id !== 'babu'\) \{\r?\n\s*const usersStr = localStorage\.getItem\('dragonTigerUsers'\) \|\| '\{\}';[\s\S]*?localStorage\.setItem\('dragonTigerUsers', JSON\.stringify\(users\)\);\r?\n\s*\}/m, "");

fs.writeFileSync('src/App.tsx', content);
console.log("Refactored App.tsx for API integration.");
