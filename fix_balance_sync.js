import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix handleDeal to unconditionally update server balance on deal
content = content.replace(/if \(winnings > 0 && currentUser && currentUser\.id !== 'babu'\)/g, "if (currentUser && currentUser.id !== 'babu')");

// Create syncBalanceToServer helper
const syncBalanceToServer = `
  const syncBalanceToServer = (newBal: number) => {
    if (currentUser && currentUser.id !== 'babu') {
      fetch(\`/api/users/\${currentUser.id}/balance\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBal })
      }).catch(e => console.error(e));
    }
  };
`;

// Insert it right before handlePlaceBet
content = content.replace(/const handlePlaceBet = useCallback/g, syncBalanceToServer + '\n  const handlePlaceBet = useCallback');

// Fix handlePlaceBet
content = content.replace(
  /return \{\n\s*\.\.\.prev,\n\s*bets: newBets,\n\s*balance: prev\.balance - cost,\n\s*totalBet,\n\s*\};\n\s*\}\);/,
  `const newState = {
        ...prev,
        bets: newBets,
        balance: prev.balance - cost,
        totalBet,
      };
      syncBalanceToServer(newState.balance);
      return newState;
    });`
);

// Fix handleClearBets
content = content.replace(
  /return \{\n\s*\.\.\.prev,\n\s*balance: prev\.balance \+ prev\.totalBet,\n\s*bets: \{\},\n\s*totalBet: 0,\n\s*\};\n\s*\}\);/,
  `const newState = {
        ...prev,
        balance: prev.balance + prev.totalBet,
        bets: {},
        totalBet: 0,
      };
      syncBalanceToServer(newState.balance);
      return newState;
    });`
);

// Fix handleDoubleBet
content = content.replace(
  /return \{\n\s*\.\.\.prev,\n\s*bets: newBets,\n\s*balance: prev\.balance - cost,\n\s*totalBet: cost \* 2,\n\s*\};\n\s*\}\);/,
  `const newState = {
        ...prev,
        bets: newBets,
        balance: prev.balance - cost,
        totalBet: cost * 2,
      };
      syncBalanceToServer(newState.balance);
      return newState;
    });`
);

// Remove the periodic 10s balance fetch completely, since it conflicts with local betting state
// We find the useEffect that fetches balance every 10s and remove it.
const periodicSyncRegex = /useEffect\(\(\) => \{\n\s*if \(!currentUser \|\| currentUser\.id === 'babu'\) return;[\s\S]*?\}, \[currentUser\?\.id\]\);/;
content = content.replace(periodicSyncRegex, '// Periodic balance sync removed to avoid resetting local betting balance.\n');


fs.writeFileSync('src/App.tsx', content);
