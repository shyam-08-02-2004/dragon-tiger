import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStateInit = `  const [state, setState] = useState<GameState>(() => {
    const saved = sessionStorage.getItem('dragonTigerCurrentUser');
    let startingBalance = initialState.balance;
    if (saved) {
      try { startingBalance = JSON.parse(saved).balance; } catch(e){}
    }
    return { ...initialState, balance: startingBalance };
  });`;

const newStateInit = `  const [state, setState] = useState<GameState>(() => {
    const saved = sessionStorage.getItem('dragonTigerCurrentUser');
    let startingBalance = initialState.balance;
    if (saved) {
      try { startingBalance = JSON.parse(saved).balance; } catch(e){}
    }
    
    const globalState = getGlobalGameState();
    let initialPhase = globalState.phase;
    let initialDragon = null;
    let initialTiger = null;
    let initialResult = null;
    
    if (globalState.phase !== 'betting') {
      const cards = getDeterministicCards(globalState.roundId, globalState.rawRoundId);
      initialDragon = cards.dragonCard;
      initialTiger = cards.tigerCard;
      initialResult = determineResult(cards.dragonCard, cards.tigerCard);
    }
    
    return { 
      ...initialState, 
      balance: startingBalance,
      roundNumber: globalState.roundId,
      phase: initialPhase,
      timer: globalState.timer,
      dragonCard: initialDragon,
      tigerCard: initialTiger,
      result: initialResult
    };
  });`;

content = content.replace(oldStateInit, newStateInit);
fs.writeFileSync('src/App.tsx', content);
