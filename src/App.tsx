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
import ProfileModal from './components/ProfileModal';
import WinPopup from './components/WinPopup';
import ReferAndEarn from './components/ReferAndEarn';
import type { GameState, BetType, GameResult } from './types/game';
import { getGlobalGameState, getDeterministicCards, getForcedDeterministicCards, setTimeOffset } from './syncEngine';
import {
  drawCard, determineResult, calculateWinnings,
} from './types/game';
import './App.css';
import { speak, playSound, startAmbient, stopAmbient, setAmbientVolume } from './utils/voice';
import dealerBgImage from './assets/dealer_girl_bg.png';

const BETTING_TIMER = 15;
const INITIAL_BALANCE = 80;

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

import HomeTab from './components/HomeTab';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'games'>(() => {
    return (sessionStorage.getItem('dt_currentTab') as 'home' | 'games') || 'home';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('dragonTigerCurrentUser');
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = sessionStorage.getItem('dragonTigerCurrentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const getMuteStorageKey = (user: UserAccount | null) => {
    if (!user) return 'dt_muted_guest';
    const id = user.id || user.username || 'guest';
    return `dt_muted_${id}`;
  };

  const [muted, setMuted] = useState<boolean>(() => {
    const key = getMuteStorageKey(currentUser);
    return localStorage.getItem(key) === 'true';
  });
  const [showWallet, setShowWallet] = useState(() => sessionStorage.getItem('dt_showWallet') === 'true');
  const [showHistory, setShowHistory] = useState(() => sessionStorage.getItem('dt_showHistory') === 'true');
  const [showHelpCenter, setShowHelpCenter] = useState(() => sessionStorage.getItem('dt_showHelp') === 'true');
  const [showRefer, setShowRefer] = useState(() => sessionStorage.getItem('dt_showRefer') === 'true');
  const [showProfile, setShowProfile] = useState(() => sessionStorage.getItem('dt_showProfile') === 'true');

  const setWalletOpen = (val: boolean) => { setShowWallet(val); sessionStorage.setItem('dt_showWallet', String(val)); };
  const setHistoryOpen = (val: boolean) => { setShowHistory(val); sessionStorage.setItem('dt_showHistory', String(val)); };
  const setHelpOpen = (val: boolean) => { setShowHelpCenter(val); sessionStorage.setItem('dt_showHelp', String(val)); };
  const setReferOpen = (val: boolean) => { setShowRefer(val); sessionStorage.setItem('dt_showRefer', String(val)); };
  const setProfileOpen = (val: boolean) => { setShowProfile(val); sessionStorage.setItem('dt_showProfile', String(val)); };
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const toggleMute = () => setMuted(prev => !prev);
  // Unlock speech synthesis and trigger Fullscreen on first user interaction
  useEffect(() => {
    const unlock = () => {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utter);
        setVoiceEnabled(true);
      }
      
      // Fullscreen mode removed as per request

      // start ambient sound if not muted
      if (!muted) startAmbient(false, 0.035);
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const key = getMuteStorageKey(currentUser);
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      setMuted(stored === 'true');
    }
  }, [currentUser?.id, currentUser?.username]);

  // Control ambient sound when muted state changes
  useEffect(() => {
    if (muted) {
      stopAmbient();
    } else {
      // start or increase ambient
      startAmbient(false, 0.03);
    }
  }, [muted]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getMuteStorageKey(currentUser), String(muted));
  }, [currentUser, muted]);

  // `enableVoice` removed — voice is unlocked on first user interaction
  const [isTimeSynced, setIsTimeSynced] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [state, setState] = useState<GameState>(() => {
    const saved = sessionStorage.getItem('dragonTigerCurrentUser');
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
  const currentUserRef = useRef<UserAccount | null>(currentUser);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  const balanceSyncRef = useRef<number>(0);
  

  useEffect(() => {
    const handleOpenHelp = () => setHelpOpen(true);
    document.addEventListener('openHelpCenter', handleOpenHelp);
    return () => document.removeEventListener('openHelpCenter', handleOpenHelp);
  }, []);

  useEffect(() => {
    // Fetch server history to populate RoadMap correctly on load
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const loadedHistory = data.slice(-100).map((h: any) => ({
            id: h.roundNumber,
            result: h.result as GameResult,
            dragonCard: { suit: '♠' as any, rank: 'A' as any, value: 0 },
            tigerCard: { suit: '♠' as any, rank: 'A' as any, value: 0 },
            win: 0
          }));
          setState(prev => ({ ...prev, history: loadedHistory }));
        }
      })
      .catch(() => {});

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
    sessionStorage.setItem('dragonTigerCurrentUser', JSON.stringify(user));
    setCurrentUser(user);
    // Voice welcome
    voiceEnabled && speak(`Welcome ${user.username}`, muted);
    setState(prev => ({ ...prev, balance: Number(user.balance) || 0, history: [], roundNumber: getGlobalGameState().roundId, bets: {}, totalBet: 0 }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dragonTigerCurrentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Fetch real balance from DB once on load and poll every 5s
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.id !== 'babu') {
      const fetchBalance = () => {
                // Skip fetch if a recent local update has occurred (15s debounce)
                if (Date.now() - balanceSyncRef.current < 15000) return;
        fetch(`/api/users/${currentUser.id}`)
          .then(res => res.json())
          .then(user => {
            if (user.balance !== undefined) {
                      // Also respect recent UI updates (15s debounce)
                      if (Date.now() - lastLocalBalanceUpdate.current < 15000) return;

              setCurrentUser(prev => prev ? { ...prev, balance: Number(user.balance), hasDeposited: user.hasDeposited } : null);
              setState(prev => prev.balance !== Number(user.balance) ? { ...prev, balance: Number(user.balance) } : prev);

              const savedStr = sessionStorage.getItem('dragonTigerCurrentUser');
              if (savedStr) {
                try {
                  const saved = JSON.parse(savedStr);
                  if (saved.balance !== Number(user.balance) || saved.hasDeposited !== user.hasDeposited) {
                    sessionStorage.setItem('dragonTigerCurrentUser', JSON.stringify({ ...saved, balance: Number(user.balance), hasDeposited: user.hasDeposited }));
                  }
                } catch (e) {}
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
          const newBalance = Number(users[userId].balance);
          const newHasDeposited = users[userId].hasDeposited;
          
          if (!isNaN(newBalance) && newBalance !== stateRef.current.balance) {
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
      if (state.phase !== 'betting') return;
      msgIdx.current = (msgIdx.current + 1) % DEALER_MESSAGES.betting.length;
      const newMsg = DEALER_MESSAGES.betting[msgIdx.current];
      setState(prev => ({ ...prev, dealerMessage: newMsg }));
      // Voice announcement for dealer message
      voiceEnabled && speak(newMsg, muted);
    }, 4000);
    return () => clearInterval(interval);
  }, [state.phase]);

  // Auto-show wallet if balance is 0
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.username !== 'babu') {
      if (state.phase === 'betting' && state.balance === 0 && state.totalBet === 0) {
        setWalletOpen(true);
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

// Fullscreen request removed per user request

  // Global continuous game loop timer
  useEffect(() => {
    const timer = setInterval(() => {
      const global = getGlobalGameState();
      
      setState(prev => {
        // Start of new round, even if phase remains betting
        if (global.phase === 'betting' && global.roundId !== prev.roundNumber) {
          return {
            ...prev,
            selectedChip: prev.selectedChip,
            phase: 'betting',
            timer: global.timer,
            roundNumber: global.roundId,
            dragonCard: null,
            tigerCard: null,
            result: null,
            bets: {},
            totalBet: 0,
            lastWin: 0,
            dealerMessage: DEALER_MESSAGES.nextRound,
          };
        }

        // Start of new betting period after dealing/result
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
            lastWin: 0,
            dealerMessage: DEALER_MESSAGES.nextRound,
          };
        }
        
        // Update timer while betting
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

const syncBalanceToServer = async (newBalance: number, previousBalance?: number) => {
  if (currentUser && currentUser.id !== 'babu') {
    const userId = currentUser.id || currentUser.username;
    try {
      await fetch(`/api/users/${userId}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance, prevBalance: previousBalance })
      });
      // Record timestamp of successful sync to debounce future polls
      balanceSyncRef.current = Date.now();
    } catch (e) {
      console.error('Failed to sync balance to server', e);
    }
    setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : prev);
    // Update sessionStorage immediately so refresh doesn't show stale balance
    const savedStr = sessionStorage.getItem('dragonTigerCurrentUser');
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        sessionStorage.setItem('dragonTigerCurrentUser', JSON.stringify({ ...saved, balance: newBalance }));
      } catch (e) {}
    }
    const usersStr = localStorage.getItem('dragonTigerUsers') || '{}';
    try {
      const users = JSON.parse(usersStr);
      if (users[userId]) {
        users[userId].balance = newBalance;
        localStorage.setItem('dragonTigerUsers', JSON.stringify(users));
      }
    } catch (e) {
      console.error('Failed to sync local user balance', e);
    }
  }
};


  const handlePlaceBet = useCallback((type: BetType) => {
    setState(prev => {
      if (prev.phase !== 'betting') return prev;
      const cost = prev.selectedChip;
      if (Number(prev.balance) < cost) return prev;
      const current = prev.bets[type] || 0;
      const newBets = { ...prev.bets, [type]: current + cost };
      const totalBet = Object.values(newBets).reduce((a, b) => a + (b || 0), 0);
      const newState = {
        ...prev,
        bets: newBets,
        balance: Number(prev.balance) - cost,
        totalBet,
      };
      lastLocalBalanceUpdate.current = Date.now();
      syncBalanceToServer(newState.balance, prev.balance);

      playSound(type, muted);
      voiceEnabled && speak(`Nice! Your ${type} bet has been placed.`, muted);

      // Sync bets to server for admin live view
      if (currentUser && currentUser.id !== 'babu') {
        const global = getGlobalGameState();
        fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId: global.rawRoundId, username: currentUser.id, bets: newBets })
        }).catch(() => {});
      }

      return newState;
    });
  }, [currentUser, muted]);

  const handleSelectChip = useCallback((value: number) => {
    setState(prev => ({ ...prev, selectedChip: value }));
  }, []);

  const handleClearBets = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'betting') return prev;
      const newState = {
        ...prev,
        balance: Number(prev.balance) + prev.totalBet,
        bets: {},
        totalBet: 0,
      };
      lastLocalBalanceUpdate.current = Date.now();
      syncBalanceToServer(newState.balance, prev.balance);

      playSound('clear', muted);
      voiceEnabled && speak('Your bets have been cleared.', muted);

      // Sync cleared bets to server for admin live view
      if (currentUser && currentUser.id !== 'babu') {
        const global = getGlobalGameState();
        fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId: global.rawRoundId, username: currentUser.id, bets: {} })
        }).catch(() => {});
      }

      return newState;
    });
  }, [currentUser, muted]);

  const handleDoubleBet = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'betting') return prev;
      const cost = prev.totalBet;
      if (Number(prev.balance) < cost || cost === 0) return prev;
      const newBets: Partial<Record<BetType, number>> = {};
      for (const [k, v] of Object.entries(prev.bets)) {
        newBets[k as BetType] = (v || 0) * 2;
      }
      const newState = {
        ...prev,
        bets: newBets,
        balance: Number(prev.balance) - cost,
        totalBet: cost * 2,
      };
      lastLocalBalanceUpdate.current = Date.now();
      syncBalanceToServer(newState.balance, prev.balance);

      playSound('double', muted);
      voiceEnabled && speak('Your bet amount has been doubled.', muted);

      // Sync doubled bets to server for admin live view
      if (currentUser && currentUser.id !== 'babu') {
        const global = getGlobalGameState();
        fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId: global.rawRoundId, username: currentUser.id, bets: newBets })
        }).catch(() => {});
      }

      return newState;
    });
  }, [currentUser, muted]);

  const handleDeal = async (roundId?: number, seed?: number) => {
    if (!roundId) return;

    let forcedOutcome = 'none';
    try {
      const res = await fetch('/api/admin/settings/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.outcome) forcedOutcome = data.outcome;
      }
    } catch(e) {}

    setTimeout(() => {
      let { dragonCard, tigerCard } = forcedOutcome !== 'none' 
        ? getForcedDeterministicCards(roundId, seed, forcedOutcome)
        : getDeterministicCards(roundId, seed);
      let result = determineResult(dragonCard, tigerCard);

      // Voice announcement for result
      if (voiceEnabled) {
        speak(`Result is ${result}`, muted);
      }
      playSound(result, muted);

      // Check if already processed
      if (stateRef.current.history.some(h => h.id === roundId)) return;
      const currentPrev = stateRef.current;
      const winnings = calculateWinnings(currentPrev.bets, result, dragonCard, tigerCard);
      const newBalance = Number(currentPrev.balance) + winnings;

      if (winnings > 0) {
        if (!muted) {
          const congratsAudio = new Audio('/assets/congratulations.mp3');
          congratsAudio.play().catch(() => {});
        }
        if (voiceEnabled) {
          setTimeout(() => speak(`You won ${winnings}`, muted), 1500);
        }
        playSound('congrats', muted);
      } else if (currentPrev.totalBet > 0) {
        playSound('lose', muted);
      }
      // ---- SIDE EFFECTS (Out of setState to avoid double execution in StrictMode) ----
      if (currentUserRef.current && currentUserRef.current.id !== 'babu') {
         if (currentPrev.totalBet > 0) {
           lastLocalBalanceUpdate.current = Date.now();
           syncBalanceToServer(newBalance, currentPrev.balance);
           
           const betSideStr = Object.entries(currentPrev.bets)
             .filter(([k, v]) => v && v > 0)
             .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}`)
             .join(', ');

           fetch('/api/users/bet-history', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
              username: currentUserRef.current.id || currentUserRef.current.username,
              roundId: seed,
              roundNumber: roundId,
              betSide: betSideStr,
              betAmount: currentPrev.totalBet,
              winAmount: winnings
             })
           }).catch(() => {});
         }
      }

      fetch('/api/history/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId: seed, result })
      }).catch(() => {});

      fetch('/api/admin/settings/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId })
      }).catch(() => {});
      // ---------------------------------------------------------------------------------

      setState(prev => {
        if (prev.history.some(h => h.id === roundId)) return prev;
        
        let newHistory = prev.history;
        if (roundId === 1) {
          newHistory = []; // Reset history at the start of a new cycle
        }
        
        newHistory = [
          ...newHistory,
          { id: roundId, dragonCard, tigerCard, result, win: winnings },
        ];
        
        if (newHistory.length > 2000) newHistory.shift();

        return {
          ...prev,
          phase: 'result',
          dragonCard,
          tigerCard,
          result,
          balance: newBalance,
          lastWin: winnings,
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

  const renderContent = () => {
    if (!isAuthenticated || !currentUser) {
      return <Auth onLogin={handleLogin} />;
    }

    // At this point, currentUser is guaranteed to be defined
    const user = currentUser as NonNullable<typeof currentUser>;
    if (user.username === 'babu') {
      return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
          <AdminPanel onLogout={handleLogout} />
        </div>
      );
    }

    return (
      <>
        <Header 
          balance={balance}
          roundNumber={roundNumber}
          username={currentUser.username}
          userId={currentUser.id || ''}
          password={currentUser.password}
          onLogout={handleLogout}
          onShowWallet={() => setWalletOpen(true)}
          onShowSupport={currentUser.id !== 'babu' ? () => setHelpOpen(true) : undefined}
          onShowProfile={currentUser.id !== 'babu' ? () => setProfileOpen(true) : undefined}
          muted={muted} voiceEnabled={voiceEnabled}
          onToggleMute={toggleMute}
          isGameView={currentTab === 'games'}
        />

        {currentTab === 'home' && (
          <HomeTab 
            username={currentUser.username}
            onShowProfile={currentUser.id !== 'babu' ? () => setProfileOpen(true) : () => {}}
            onPlayGame={() => {
              setCurrentTab('games');
              sessionStorage.setItem('dt_currentTab', 'games');
            }} 
          />
        )}

        {currentTab === 'games' && (
          <div className="game-main-content" style={{ overflowY: 'auto', paddingTop: '90px' }}>
            <div className="cards-reveal-area">
              <CardDisplay
                card={dragonCard}
                side="dragon"
                isRevealing={phase === 'dealing'}
                isWinner={dragonWins}
              />

              {/* Center Timer Between Cards */}
              <div className={`center-timer-wrapper ${phase}`}>
                <div className="center-timer-ring">
                  <svg className="center-timer-svg" viewBox="0 0 80 80">
                    <circle className="center-timer-bg-circle" cx="40" cy="40" r="34" />
                    <circle 
                      className="center-timer-progress" 
                      cx="40" cy="40" r="34"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 34}`,
                        strokeDashoffset: phase === 'betting' 
                          ? `${2 * Math.PI * 34 * (1 - timer / 15)}` 
                          : '0'
                      }}
                    />
                  </svg>
                  <div className="center-timer-content">
                    {phase === 'betting' ? (
                      <>
                        <span className={`center-timer-number ${timer <= 5 ? 'urgent' : ''}`}>{timer}</span>
                        <span className="center-timer-label">SEC</span>
                      </>
                    ) : phase === 'dealing' ? (
                      <span className="center-timer-status dealing">⚡</span>
                    ) : (
                      <span className="center-timer-status result">✨</span>
                    )}
                  </div>
                </div>
                <div className="center-vs-text">VS</div>
              </div>

              <CardDisplay
                card={tigerCard}
                side="tiger"
                isRevealing={phase === 'dealing'}
                isWinner={tigerWins}
              />
            </div>

            <BettingTable
              bets={bets}
              onBet={handlePlaceBet}
              phase={phase}
              selectedChip={selectedChip}
            />

            <GameControls
              phase={phase}
              timer={timer}
              onUndo={handleClearBets}
              onRepeat={handleDoubleBet}
            />

            <RoadMap history={history} />

            <div style={{ marginTop: 'auto', marginBottom: '5px' }}>
              <ChipSelector
                selectedChip={selectedChip}
                onSelectChip={handleSelectChip}
                onClearBets={() => {}}
                onDoubleBet={() => {}}
                totalBet={totalBet}
                phase={phase}
              />
            </div>
          </div>
        )}

        {/* Premium Bottom Navigation */}
        {currentTab === 'games' && (
          <div className="premium-bottom-nav">
            <div 
              className="pbn-item" 
              onClick={() => { setCurrentTab('home'); sessionStorage.setItem('dt_currentTab', 'home'); }}
            >
              <span className="pbn-icon">🏠</span>
              <span className="pbn-label">Home</span>
            </div>
            <div 
              className="pbn-item" 
              onClick={currentUser.id !== 'babu' ? () => setReferOpen(true) : undefined}
            >
              <span className="pbn-icon">🎁</span>
              <span className="pbn-label">Promotions</span>
            </div>
            <div 
              className="pbn-item active" 
              onClick={() => { setCurrentTab('games'); sessionStorage.setItem('dt_currentTab', 'games'); }}
            >
              <span className="pbn-icon">🎰</span>
              <span className="pbn-label">Games</span>
            </div>
            <div 
              className="pbn-item" 
              onClick={currentUser.id !== 'babu' ? () => setHistoryOpen(true) : undefined}
            >
              <span className="pbn-icon">📜</span>
              <span className="pbn-label">History</span>
            </div>
            <div 
              className="pbn-item" 
              onClick={() => setProfileOpen(true)}
            >
              <span className="pbn-icon">👤</span>
              <span className="pbn-label">Profile</span>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="app-header">
      {/* Bulletproof fixed background for mobile */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${dealerBgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center top', 
          backgroundColor: '#000',
          zIndex: 0
        }}
      />

      <div className="app-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        {renderContent()}
      </div>


      <WinPopup winAmount={lastWin} />

      {showWallet && <WalletModal 
        username={currentUser?.id ?? currentUser?.username ?? ''} 
        hasDeposited={currentUser?.hasDeposited ?? false} 
        balance={balance} 
        onClose={() => setWalletOpen(false)} 
        onWithdrawSuccess={(amount) => {
          const newBalance = balance - amount;
          setState(prev => ({ ...prev, balance: newBalance }));
          // We don't need to call syncBalanceToServer or setCurrentUser here because 
          // WalletModal already calls the syncBalance prop with the correct newBalance.
          lastLocalBalanceUpdate.current = Date.now();
        }}
        onDepositSuccess={(amount) => {
          setCurrentUser(prev => prev ? { ...prev, hasDeposited: true } : prev);
        }}
        syncBalance={syncBalanceToServer}
        setLastUpdate={() => { lastLocalBalanceUpdate.current = Date.now(); }}
      />}

      {showHistory && (
        <GameHistory
          currentRound={roundNumber}
          rawRoundId={getGlobalGameState().rawRoundId}
          isOpen={showHistory}
          onClose={() => setHistoryOpen(false)}
          username={currentUser?.id ?? currentUser?.username ?? ''}
        />
      )}

      {showHelpCenter && (
        <HelpCenter 
          userId={currentUser?.id ?? currentUser?.username ?? ''}
          isOpen={showHelpCenter}
          onClose={() => setHelpOpen(false)}
        />
      )}

      {showProfile && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setProfileOpen(false)} 
          onPlayGame={() => {
            setCurrentTab('games');
            sessionStorage.setItem('dt_currentTab', 'games');
            setProfileOpen(false);
          }}
          onLogout={() => { setProfileOpen(false); handleLogout(); }}
          onShowWallet={() => { setProfileOpen(false); setWalletOpen(true); }}
          onShowRefer={currentUser?.id !== 'babu' ? () => { setProfileOpen(false); setReferOpen(true); } : undefined}
          onShowSupport={currentUser?.id !== 'babu' ? () => { setProfileOpen(false); setHelpOpen(true); } : undefined}
          onShowHistory={() => { setProfileOpen(false); setHistoryOpen(true); }}
        />
      )}

      {showRefer && (
        <ReferAndEarn
          userId={currentUser?.id ?? currentUser?.username ?? ''}
          onClose={() => setReferOpen(false)}
        />
      )}

      {/* Notifications overlay */}
      {notifications.length > 0 && (
        <div className="global-notification-container">
          {notifications.map(notif => (
            <div key={notif.id} className={`premium-global-toast ${notif.type}`}>
              <div className="toast-icon-bar">
                {notif.type === 'warning' ? '⚠️' : notif.type === 'success' ? '✅' : 'ℹ️'}
              </div>
              <div className="toast-content">
                <strong>{notif.type === 'warning' ? 'Important Notice' : notif.type === 'success' ? 'Success' : 'Information'}</strong>
                <p>{notif.message}</p>
              </div>
              <button className="toast-close" onClick={() => handleDismissNotification(notif.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default App;
