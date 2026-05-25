import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const handleDeal = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/, `const handleDeal = (roundId?: number) => {
    if (!roundId) return;
    setState(prev => {
      if (prev.phase !== 'betting' && prev.phase !== 'dealing') return prev;
      return { ...prev, phase: 'dealing', dealerMessage: DEALER_MESSAGES.dealing };
    });

    setTimeout(() => {
      const { dragonCard, tigerCard } = getDeterministicCards(roundId);
      const result = determineResult(dragonCard, tigerCard);

      setState(prev => {
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
  };`);

// Auto-Login: Restore current user from localStorage
content = content.replace(/const \[isAuthenticated, setIsAuthenticated\] = useState\(false\);\r?\n  const \[currentUser, setCurrentUser\] = useState<UserAccount \| null>\(null\);/, `const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('dragonTigerCurrentUser');
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('dragonTigerCurrentUser');
    return saved ? JSON.parse(saved) : null;
  });`);

// Update handleLogin to save to localStorage
content = content.replace(/const handleLogin = \(user: UserAccount\) => \{/, `const handleLogin = (user: UserAccount) => {\n    localStorage.setItem('dragonTigerCurrentUser', JSON.stringify(user));`);

// Update handleLogout to clear from localStorage
content = content.replace(/const handleLogout = \(\) => \{/, `const handleLogout = () => {\n    localStorage.removeItem('dragonTigerCurrentUser');`);

fs.writeFileSync('src/App.tsx', content);

console.log("App.tsx errors fixed and auto-login restored.");
