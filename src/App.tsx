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
import GameHistory from './components/GameHistory';
import HelpCenter from './components/HelpCenter';
import type { GameState, BetType, GameResult } from './types/game';
import { getGlobalGameState, getDeterministicCards, setTimeOffset } from './syncEngine';
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
    return !!localStorage.getItem('dragonTigerCurrentUser');
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('dragonTigerCurrentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [showWallet, setShowWallet] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [isAdminView, setIsAdminView] = useState(true);
  const [isTimeSynced, setIsTimeSynced] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('dragonTigerCurrentUser');
    let startingBalance = initialState.balance;
    if (saved) {
      try { startingBalance = JSON.parse(saved).balance; } catch(e){}
    }
    
    const globalState = getGlobalGameState();
    let initialPhase = globalState.phase as GameState['phase'];
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
  // duplicate msgIdx removed
  const stateRef = useRef<GameState>(state);
  const msgIdx = useRef<number>(0);
  const lastLocalBalanceUpdate = useRef<number>(0);

  useEffect(() => { stateRef.current = state; }, [state]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleOpenHelp = () => setShowHelpCenter(true);
    document.addEventListener('openHelpCenter', handleOpenHelp);
    return () => document.removeEventListener('openHelpCenter', handleOpenHelp);
  }, []);

  useEffect(() => {
    fetch('/api/time')
      .then(res => res.json())
      .then(data => {
        const offset = data.serverTime - Date.now();
        setTimeOffset(offset);
        
        const globalState = getGlobalGameState();
        let initialPhase = globalState.phase as GameState['phase'];
        let initialDragon = null;
        let initialTiger = null;
        let initialResult = null;
        if (globalState.phase !== 'betting') {
          const cards = getDeterministicCards(globalState.roundId, globalState.rawRoundId);
          initialDragon = cards.dragonCard;
          initialTiger = cards.tigerCard;
          initialResult = determineResult(cards.dragonCard, cards.tigerCard);
        }
        
        setState(prev => ({
          ...prev,
          roundNumber: globalState.roundId,
          phase: initialPhase,
          timer: globalState.timer,
          dragonCard: initialDragon,
          tigerCard: initialTiger,
          result: initialResult
        }));
        setIsTimeSynced(true);
      })
      .catch(e => {
        console.error('Time sync failed', e);
        setIsTimeSynced(true);
      });
  }, []);


  const handleLogin = (user: UserAccount) => {
    localStorage.setItem('dragonTigerCurrentUser', JSON.stringify(user));
    setCurrentUser(user);
    setState(prev => ({ ...prev, balance: user.balance, history: [], roundNumber: getGlobalGameState().roundId, bets: {}, totalBet: 0 }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('dragonTigerCurrentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Fetch real balance from DB once on load and poll every 5s
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.id !== 'babu') {
      const fetchBalance = () => {
        fetch(`/api/users/${currentUser.id}`)
          .then(res => res.json())
          .then(user => {
            if (user.balance !== undefined) {
              // Skip updating from poll if we just updated locally within the last 4 seconds
              if (Date.now() - lastLocalBalanceUpdate.current < 4000) return;

              setCurrentUser(prev => prev ? { ...prev, balance: user.balance, hasDeposited: user.hasDeposited } : null);
              setState(prev => prev.balance !== user.balance ? { ...prev, balance: user.balance } : prev);
              
              const savedStr = localStorage.getItem('dragonTigerCurrentUser');
              if (savedStr) {
                 const saved = JSON.parse(savedStr);
                 if (saved.balance !== user.balance || saved.hasDeposited !== user.hasDeposited) {
                    localStorage.setItem('dragonTigerCurrentUser', JSON.stringify({ ...saved, balance: user.balance, hasDeposited: user.hasDeposited }));
                 }
              }
            }
          })
          .catch(console.error);
      };
      
      fetchBalance();
      const interval = setInterval(fetchBalance, 5000);
      return () => clearInterval(interval);
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

  // Poll for notifications
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const pollNotifs = () => {
      fetch(`/api/notifications/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(() => {});
    };
    pollNotifs(); // initial fetch
    const interval = setInterval(pollNotifs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [isAuthenticated, currentUser]);

  const handleDismissNotification = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'PUT' });
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch(e) { console.error(e); }
  };

  // Global continuous game loop timer
  useEffect(() => {
    const timer = setInterval(() => {
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
      clearInterval(timer);
    };
  }, []);

  
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
      lastLocalBalanceUpdate.current = Date.now();
      syncBalanceToServer(newState.balance);

      // Sync bets to server for admin live view
      if (currentUser && currentUser.id !== 'babu') {
        const global = getGlobalGameState();
        fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId: global.roundId, username: currentUser.id, bets: newBets })
        }).catch(() => {});
      }

      return newState;
    });
  }, [currentUser]);

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
      lastLocalBalanceUpdate.current = Date.now();
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
      lastLocalBalanceUpdate.current = Date.now();
      syncBalanceToServer(newState.balance);
      return newState;
    });
  }, []);

  
  const handleDeal = async (roundId?: number, seed?: number) => {
    if (!roundId) return;
    
    // Fetch forced outcome from server (READ only - not deleted, so all users get same)
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
      
      // Override cards to match forced outcome
      if (forcedOutcome === 'dragon') {
        // Dragon MUST win — give Dragon K♠ and Tiger 2♥
        dragonCard = { suit: '♠', rank: 'K', value: 13 };
        tigerCard  = { suit: '♥', rank: '2', value: 2  };
        result = determineResult(dragonCard, tigerCard);
      } else if (forcedOutcome === 'tiger') {
        // Tiger MUST win — give Tiger K♠ and Dragon 2♥
        dragonCard = { suit: '♥', rank: '2', value: 2  };
        tigerCard  = { suit: '♠', rank: 'K', value: 13 };
        result = determineResult(dragonCard, tigerCard);
      } else if (forcedOutcome === 'tie') {
        // Tie — both get 8
        dragonCard = { suit: '♠', rank: '8', value: 8 };
        tigerCard  = { suit: '♥', rank: '8', value: 8 };
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
        
        if (newHistory.length > 100) newHistory.shift();
        
        const newBalance = prev.balance + winnings;
        lastLocalBalanceUpdate.current = Date.now();
        if (currentUser && currentUser.id !== 'babu') {
           fetch(`/api/users/${currentUser.id}/balance`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ balance: newBalance })
           });
        }

        // Cleanup old forced outcomes after result
        fetch('/api/admin/settings/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId })
        }).catch(() => {});

        return {
          ...prev,
          phase: 'result',
          dragonCard,
          tigerCard,
          result,
          balance: newBalance,
          lastWin,
          history: newHistory,
          dealerMessage: result === 'tie'
            ? 'It\'s a Tie!'
            : `${result ? result.toUpperCase() : ''} WINS!`
        };
      });
    }, 1000);
  };



  

  const { phase, dragonCard, tigerCard, result, bets, balance, selectedChip, lastWin, totalBet, history, timer, roundNumber, dealerMessage } = state;

  const dragonWins = phase === 'result' && (result === 'dragon');
  const tigerWins = phase === 'result' && (result === 'tiger');

  if (!isTimeSynced) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: 'gold' }}><h2>Syncing with Server...</h2></div>;
  }

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
        onShowHistory={() => setShowHistory(true)}
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
              {result === 'tie' && phase === 'result' && (
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

      {showWallet && <WalletModal 
        username={currentUser.id || currentUser.username} 
        hasDeposited={currentUser.hasDeposited || false} 
        balance={balance} 
        onClose={() => setShowWallet(false)} 
        onWithdrawSuccess={(amount) => {
          setState(prev => ({ ...prev, balance: prev.balance - amount }));
          setCurrentUser(prev => {
            if (prev) {
              const updated = { ...prev, balance: prev.balance - amount };
              localStorage.setItem('dragonTigerCurrentUser', JSON.stringify(updated));
              return updated;
            }
            return null;
          });
        }}
      />}

      {showHistory && (
        <GameHistory
          currentRound={roundNumber}
          rawRoundId={getGlobalGameState().rawRoundId}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showHelpCenter && (
        <HelpCenter 
          userId={currentUser.id || currentUser.username}
          isOpen={showHelpCenter}
          onClose={() => setShowHelpCenter(false)}
        />
      )}

      {/* Footer */}
      <footer className="game-footer" id="game-footer">
        <div className="footer-content">
          <span className="footer-logo">🐉 Dragon Tiger 🐯</span>
          <span className="footer-sep">|</span>
          <span className="footer-info">18+ | Play Responsibly | For Entertainment Only</span>
          <span className="footer-sep">|</span>
          <span className="footer-version">v2.0</span>
          <span className="footer-sep">|</span>
          <button 
            onClick={() => setShowHelpCenter(true)}
            style={{ background: 'transparent', border: 'none', color: '#3498db', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
          >
            💬 Support
          </button>
        </div>
      </footer>

      {/* Notifications overlay */}
      {notifications.length > 0 && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '10px', width: '90%', maxWidth: '400px' }}>
          {notifications.map(notif => (
            <div key={notif.id} style={{
                background: 'rgba(20,20,20,0.95)',
                border: `2px solid ${notif.type === 'warning' ? '#f39c12' : notif.type === 'success' ? '#2ecc71' : notif.type === 'info' ? '#f1c40f' : '#3498db'}`,
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: notif.type === 'warning' ? '#f39c12' : notif.type === 'success' ? '#2ecc71' : notif.type === 'info' ? '#f1c40f' : '#3498db', fontSize: '16px' }}>
                  {notif.type === 'warning' ? '⚠️ Important Notice' : notif.type === 'success' ? '✅ Success' : 'ℹ️ Information'}
                </strong>
                <button onClick={() => handleDismissNotification(notif.id)} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{notif.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
