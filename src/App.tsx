import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Auth from './components/Auth';
import type { UserAccount } from './components/Auth';
import AdminPanel from './components/AdminPanel';
import CardDisplay from './components/CardDisplay';
import BettingTable from './components/BettingTable';
import ChipSelector from './components/ChipSelector';
import GameControls from './components/GameControls';
import RoadMap from './components/RoadMap';
import WalletModal from './components/WalletModal';
import type { GameState, BetType, GameResult } from './types/game';
import { getGlobalGameState, getDeterministicCards } from './syncEngine';
import {
  drawCard, determineResult, calculateWinnings,
} from './types/game';
import './App.css';

const BETTING_TIMER = 15;
const INITIAL_BALANCE = 50;

const DEALER_MESSAGES = {
  betting: [
    "Place your bets, ladies and gentlemen!",
    "Dragon or Tiger? The choice is yours!",
    "Fortune favors the bold — place your bet!",
    "The cards are ready. Will you bet on Dragon or Tiger?",
    "Which side do you feel lucky about today?",
  ],
  dealing: "Dealing the cards now...",
  dragon: "The Dragon roars! Dragon wins this round!",
  tiger: "The Tiger pounces! Tiger takes the win!",
  tie: "It's a Tie! Incredible!",
  'suited-tie': "🌟 Magnificent! A Suited Tie — the rarest outcome!",
  nextRound: "New round starting. Place your bets!",
};

const initialState: GameState = {
  phase: 'betting',
  dragonCard: null,
  tigerCard: null,
  result: null,
  bets: {},
  balance: INITIAL_BALANCE,
  selectedChip: 10,
  lastWin: 0,
  totalBet: 0,
  history: [],
  timer: BETTING_TIMER,
  roundNumber: 1,
  dealerMessage: DEALER_MESSAGES.betting[0],
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('dragonTigerCurrentUser');
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = sessionStorage.getItem('dragonTigerCurrentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [showWallet, setShowWallet] = useState(false);
  const [isAdminView, setIsAdminView] = useState(true);
  const [state, setState] = useState<GameState>(() => {
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
  });
  const stateRef = useRef<GameState>(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgIdx = useRef(0);

  const handleLogin = (user: UserAccount) => {
    sessionStorage.setItem('dragonTigerCurrentUser', JSON.stringify(user));
    setCurrentUser(user);
    setState(prev => ({ ...prev, balance: user.balance, history: [], roundNumber: getGlobalGameState().roundId, bets: {}, totalBet: 0 }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dragonTigerCurrentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Fetch real balance from DB once on load
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.id !== 'babu') {
      fetch(`/api/users/${currentUser.id}`)
        .then(res => res.json())
        .then(user => {
          if (user.balance !== undefined) {
            setCurrentUser(prev => prev ? { ...prev, balance: user.balance } : null);
            setState(prev => ({ ...prev, balance: user.balance }));
            sessionStorage.setItem('dragonTigerCurrentUser', JSON.stringify(user));
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated, currentUser?.id]);

  // Sync balance to localStorage
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const usersStr = localStorage.getItem('dragonTigerUsers') || '{}';
      const users = JSON.parse(usersStr);
      const userId = currentUser.id || currentUser.username;
      if (users[userId]) {
        users[userId].balance = state.balance;
        localStorage.setItem('dragonTigerUsers', JSON.stringify(users));
      }
    }
  }, [state.balance, isAuthenticated, currentUser]);

  // Sync live bets for Admin
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.username !== 'babu') {
      const betsStr = localStorage.getItem('dragonTigerLiveBets') || '{}';
      let liveBets: Record<string, any> = {};
      try { liveBets = JSON.parse(betsStr); } catch (e) {}
      liveBets[currentUser.id || currentUser.username] = state.bets;
      localStorage.setItem('dragonTigerLiveBets', JSON.stringify(liveBets));
    }
  }, [state.bets, isAuthenticated, currentUser]);

  // Listen for admin balance updates from another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dragonTigerUsers' && isAuthenticated && currentUser) {
        const users = JSON.parse(e.newValue || '{}');
        const userId = currentUser.id || currentUser.username;
        if (!users[userId] && userId !== 'babu' && userId !== 'admin') {
          // User was deleted by admin
          handleLogout();
        } else if (users[userId]) {
          const newBalance = users[userId].balance;
          const newHasDeposited = users[userId].hasDeposited;
          
          if (newBalance !== undefined && newBalance !== stateRef.current.balance) {
            setState(prev => ({ ...prev, balance: newBalance }));
          }
          if (newHasDeposited !== undefined && newHasDeposited !== currentUser.hasDeposited) {
            setCurrentUser(prev => prev ? { ...prev, hasDeposited: newHasDeposited } : null);
          }
        }
      }
      
      
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isAuthenticated, currentUser]);

  // Rotate dealer messages during betting
  useEffect(() => {
    if (state.phase !== 'betting') return;
    const interval = setInterval(() => {
      msgIdx.current = (msgIdx.current + 1) % DEALER_MESSAGES.betting.length;
      setState(prev => ({ ...prev, dealerMessage: DEALER_MESSAGES.betting[msgIdx.current] }));
    }, 4000);
    return () => clearInterval(interval);
  }, [state.phase]);

  // Auto-show wallet if balance is 0
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.username !== 'babu') {
      if (state.phase === 'betting' && state.balance === 0 && state.totalBet === 0) {
        setShowWallet(true);
      }
    }
  }, [isAuthenticated, currentUser, state.phase, state.balance, state.totalBet]);

  // Countdown timer during betting
  useEffect(() => {
    if (state.phase !== 'betting') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
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
          setTimeout(() => handleDeal(global.roundId, global.rawRoundId), 0);
          return { ...prev, phase: 'dealing', timer: 0 };
        }
        
        return prev;
      });
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  
  const syncBalanceToServer = (newBal: number) => {
    if (currentUser && currentUser.id !== 'babu') {
      fetch(`/api/users/${currentUser.id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBal })
      }).catch(e => console.error(e));
    }
  };

  const handlePlaceBet = useCallback((type: BetType) => {
    setState(prev => {
      if (prev.phase !== 'betting') return prev;
      const cost = prev.selectedChip;
      if (prev.balance < cost) return prev;
      const current = prev.bets[type] || 0;
      const newBets = { ...prev.bets, [type]: current + cost };
      const totalBet = Object.values(newBets).reduce((a, b) => a + (b || 0), 0);
      const newState = {
        ...prev,
        bets: newBets,
        balance: prev.balance - cost,
        totalBet,
      };
      syncBalanceToServer(newState.balance);
      return newState;
    });
  }, []);

  const handleSelectChip = useCallback((value: number) => {
    setState(prev => ({ ...prev, selectedChip: value }));
  }, []);

  const handleClearBets = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'betting') return prev;
      const newState = {
        ...prev,
        balance: prev.balance + prev.totalBet,
        bets: {},
        totalBet: 0,
      };
      syncBalanceToServer(newState.balance);
      return newState;
    });
  }, []);

  const handleDoubleBet = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'betting') return prev;
      const cost = prev.totalBet;
      if (prev.balance < cost || cost === 0) return prev;
      const newBets: Partial<Record<BetType, number>> = {};
      for (const [k, v] of Object.entries(prev.bets)) {
        newBets[k as BetType] = (v || 0) * 2;
      }
      const newState = {
        ...prev,
        bets: newBets,
        balance: prev.balance - cost,
        totalBet: cost * 2,
      };
      syncBalanceToServer(newState.balance);
      return newState;
    });
  }, []);

  
  const handleDeal = async (roundId?: number, seed?: number) => {
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
      let { dragonCard, tigerCard } = getDeterministicCards(roundId, seed);
      let result = determineResult(dragonCard, tigerCard);
      
      // Override if forced
      if (forcedOutcome !== 'none') {
        if (forcedOutcome === 'dragon' && result !== 'dragon') {
          dragonCard = { suit: '♠', rank: 'K', value: 13 };
          tigerCard = { suit: '♥', rank: '2', value: 2 };
        } else if (forcedOutcome === 'tiger' && result !== 'tiger') {
          tigerCard = { suit: '♠', rank: 'K', value: 13 };
          dragonCard = { suit: '♥', rank: '2', value: 2 };
        } else if (forcedOutcome === 'tie' && result !== 'tie' && result !== 'suited-tie') {
          dragonCard = { suit: '♠', rank: '8', value: 8 };
          tigerCard = { suit: '♥', rank: '8', value: 8 };
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
        if (currentUser && currentUser.id !== 'babu') {
           fetch(`/api/users/${currentUser.id}/balance`, {
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
            ? 'It\'s a Tie!' 
            : `${result ? result.toUpperCase() : ''} WINS!`
        };
      });
    }, 1000);
  };


  

  const { phase, dragonCard, tigerCard, result, bets, balance, selectedChip, lastWin, totalBet, history, timer, roundNumber, dealerMessage } = state;

  const dragonWins = phase === 'result' && (result === 'dragon');
  const tigerWins = phase === 'result' && (result === 'tiger');

  if (!isAuthenticated || !currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (currentUser.username === 'babu' && isAdminView) {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
        <AdminPanel onLogout={handleLogout} />
        <button 
          onClick={() => setIsAdminView(false)}
          style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--gold)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 9999 }}
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
          style={{ position: 'fixed', top: '80px', right: '20px', background: 'rgba(0,0,0,0.8)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', zIndex: 9999, cursor: 'pointer' }}
        >
          🛡️ Admin Panel
        </button>
      )}
      {/* Background ambiance */}
      <div className="bg-decoration">
        <div className="bg-dragon">🐉</div>
        <div className="bg-tiger">🐯</div>
        <div className="bg-pattern" />
      </div>

      <Header 
        balance={balance} 
        lastWin={lastWin} 
        roundNumber={roundNumber} 
        username={currentUser?.username || ''} 
        hasDeposited={currentUser?.hasDeposited || false}
        onLogout={handleLogout} 
      />

      <main className="game-main" id="game-main">
        {/* Card Table Area */}
        <div className="table-area">
          <div className="cards-arena" id="cards-arena">
            <CardDisplay
              card={dragonCard}
              side="dragon"
              isRevealing={phase === 'dealing'}
              isWinner={dragonWins}
            />

            <div className="vs-divider" id="vs-divider">
              <div className="vs-line" />
              <div className="vs-badge">VS</div>
              <div className="vs-line" />
              {(result === 'tie' || result === 'suited-tie') && phase === 'result' && (
                <div className="tie-indicator">TIE</div>
              )}
            </div>

            <CardDisplay
              card={tigerCard}
              side="tiger"
              isRevealing={phase === 'dealing'}
              isWinner={tigerWins}
            />
          </div>

          <GameControls
            phase={phase}
            result={result}
            timer={timer}
            totalBet={totalBet}
            lastWin={lastWin}
            dealerMessage={dealerMessage}
            onDeal={handleDeal}
            onNextRound={() => {}}
          />
        </div>

        {/* Betting Panel */}
        <div className="betting-panel" id="betting-panel">
          <BettingTable
            bets={bets}
            onBet={handlePlaceBet}
            phase={phase}
            selectedChip={selectedChip}
          />

          <ChipSelector
            selectedChip={selectedChip}
            onSelectChip={handleSelectChip}
            onClearBets={handleClearBets}
            onDoubleBet={handleDoubleBet}
            totalBet={totalBet}
            phase={phase}
          />

          <RoadMap history={history} />
        </div>
      </main>

      {showWallet && <WalletModal username={currentUser.id || currentUser.username} hasDeposited={currentUser.hasDeposited || false} balance={balance} onClose={() => setShowWallet(false)} />}

      {/* Footer */}
      <footer className="game-footer" id="game-footer">
        <div className="footer-content">
          <span className="footer-logo">🐉 Dragon Tiger 🐯</span>
          <span className="footer-sep">|</span>
          <span className="footer-info">18+ | Play Responsibly | For Entertainment Only</span>
          <span className="footer-sep">|</span>
          <span className="footer-version">v2.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
