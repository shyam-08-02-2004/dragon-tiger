import fs from 'fs';

// 1. Update syncEngine.ts
let syncContent = fs.readFileSync('src/syncEngine.ts', 'utf8');
syncContent = syncContent.replace(
  /const roundId = Math.floor\(now \/ ROUND_DURATION_MS\);/,
  `const rawRoundId = Math.floor(now / ROUND_DURATION_MS);\n  const roundId = (rawRoundId % 2000) + 1;`
);

// We need to change seededRandom to use rawRoundId to avoid cards repeating every 2000 rounds.
// Wait, getDeterministicCards receives roundId. 
syncContent = syncContent.replace(
  /export function getDeterministicCards\(roundId: number\): \{ dragonCard: Card, tigerCard: Card \} \{/,
  `export function getDeterministicCards(roundId: number, seed?: number): { dragonCard: Card, tigerCard: Card } {`
);
syncContent = syncContent.replace(
  /const rng = seededRandom\(roundId\);/,
  `const rng = seededRandom(seed || roundId);`
);
// Make getGlobalGameState return rawRoundId for the seed
syncContent = syncContent.replace(
  /return \{\n    roundId,\n    timer,\n    phase\n  \};/,
  `return {\n    roundId,\n    rawRoundId,\n    timer,\n    phase\n  };`
);
fs.writeFileSync('src/syncEngine.ts', syncContent);

// 2. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Replace local storage round init with syncEngine
appContent = appContent.replace(
  /const globalRound = parseInt\(localStorage.getItem\('dragonTigerGlobalRound'\) \|\| '1'\);\n    setState\(prev => \(\{ \.\.\.prev, balance: user.balance, history: \[\], roundNumber: globalRound, bets: \{\}, totalBet: 0 \}\)\);/,
  `setState(prev => ({ ...prev, balance: user.balance, history: [], roundNumber: getGlobalGameState().roundId, bets: {}, totalBet: 0 }));`
);

// Remove local storage listener for globalRound
appContent = appContent.replace(
  /if \(e\.key === 'dragonTigerGlobalRound'\) \{\n        const globalRound = parseInt\(e\.newValue \|\| '1'\);\n        setState\(prev => \(\{ \.\.\.prev, roundNumber: globalRound \}\)\);\n      \}/,
  ``
);

// Remove handleNextRound definition and the useEffect that calls it
const handleNextRoundRegex = /const handleNextRound = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);\n\n  useEffect\(\(\) => \{\n    if \(state\.phase === 'result'\) \{\n      const t = setTimeout\(\(\) => handleNextRound\(\), 5000\);\n      return \(\) => clearTimeout\(t\);\n    \}\n  \}, \[state\.phase, handleNextRound\]\);/;
appContent = appContent.replace(handleNextRoundRegex, '');

// Remove handleNextRound from dependency arrays or callbacks in JSX if it exists
// e.g. onNextRound={handleNextRound} -> we can just pass an empty function or remove it.
appContent = appContent.replace(/onNextRound=\{handleNextRound\}/g, `onNextRound={() => {}}`);

// Fix handleDeal call to pass rawRoundId
appContent = appContent.replace(
  /setTimeout\(\(\) => handleDeal\(global\.roundId\), 0\);/,
  `setTimeout(() => handleDeal(global.roundId, global.rawRoundId), 0);`
);

appContent = appContent.replace(
  /const handleDeal = async \(roundId\?: number\) => \{/,
  `const handleDeal = async (roundId?: number, seed?: number) => {`
);

appContent = appContent.replace(
  /let \{ dragonCard, tigerCard \} = getDeterministicCards\(roundId\);/,
  `let { dragonCard, tigerCard } = getDeterministicCards(roundId, seed);`
);

fs.writeFileSync('src/App.tsx', appContent);

// 3. Update AdminPanel.tsx to pass rawRoundId
let adminContent = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminContent = adminContent.replace(
  /const \{ dragonCard, tigerCard \} = getDeterministicCards\(global\.roundId\);/,
  `const { dragonCard, tigerCard } = getDeterministicCards(global.roundId, global.rawRoundId);`
);
fs.writeFileSync('src/components/AdminPanel.tsx', adminContent);
