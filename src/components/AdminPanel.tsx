import React, { useState, useEffect, useRef } from 'react';
import { speak, playSound } from '../utils/voice';
import './AdminPanel.css';
import './WalletModal.css';
import CardDisplay from './CardDisplay';
import { determineResult } from '../types/game';
import { getGlobalGameState, getDeterministicCards, getForcedDeterministicCards } from '../syncEngine';
import type { Card, GameResult } from '../types/game';
import GameHistory from './GameHistory';

interface AdminPanelProps {
  onLogout: () => void;
}

type LiveBets = {
  dragon: number;
  tiger: number;
  tie: number;
  total: number;
  betCount: number;
};

const defaultLiveBets: LiveBets = {
  dragon: 0,
  tiger: 0,
  tie: 0,
  total: 0,
  betCount: 0
};

const normalizeLiveBets = (data: any): LiveBets => {
  if (!data || typeof data !== 'object' || typeof data.totals !== 'object') return defaultLiveBets;

  const totals = data.totals || {};
  const dragon = Number(totals.dragon) || 0;
  const tiger = Number(totals.tiger) || 0;
  const tie = Number(totals.tie) || 0;
  const total = Number(totals.total) || dragon + tiger + tie;
  const betCount = Number(data.betCount) || 0;

  return { dragon, tiger, tie, total, betCount };
};

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'game' | 'transactions' | 'support'>(() => (sessionStorage.getItem('dt_adminTab') as any) || 'users');
  const [simPhase, setSimPhase] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [simTimer, setSimTimer] = useState<number>(15);
  const [muted, setMuted] = useState<boolean>(() => localStorage.getItem('dt_admin_muted') === 'true');
  const [simRoundId, setSimRoundId] = useState<number>(0);
  const [simDragonCard, setSimDragonCard] = useState<Card | null>(null);
  const [simTigerCard, setSimTigerCard] = useState<Card | null>(null);
  const [simResult, setSimResult] = useState<GameResult | null>(null);
  const simTimerRef = useRef<any | null>(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState<string | null>(() => sessionStorage.getItem('dt_adminUserHist') || null);
  const [userHistoryTab, setUserHistoryTab] = useState<'transactions' | 'bets'>(() => (sessionStorage.getItem('dt_adminUserHistTab') as any) || 'transactions');
  const [adminBetHistory, setAdminBetHistory] = useState<any[]>([]);
  const [editBalanceUser, setEditBalanceUser] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<string>('');
  const [liveBets, setLiveBets] = useState<LiveBets>(defaultLiveBets);
  const [showGameHistory, setShowGameHistory] = useState(() => sessionStorage.getItem('dt_adminShowGameHist') === 'true');

  useEffect(() => {
    localStorage.setItem('dt_admin_muted', String(muted));
  }, [muted]);

  // Round outcome control
  const [roundOutcomes, setRoundOutcomes] = useState<{ roundId: number; outcome: string }[]>([]);
  const [targetRoundId, setTargetRoundId] = useState<string>('');
  const [saveMsg, setSaveMsg] = useState<string>('');
  const liveBetsRoundRef = useRef<number>(0);

  const [supportUsers, setSupportUsers] = useState<any[]>([]);
  const [selectedSupportUser, setSelectedSupportUser] = useState<string | null>(() => sessionStorage.getItem('dt_adminSupportUser') || null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);

  // State Setters with sessionStorage wrappers
  const handleTabChange = (tab: 'users' | 'game' | 'transactions' | 'support') => {
    setActiveTab(tab); sessionStorage.setItem('dt_adminTab', tab);
  };
  const handleUserHistory = (val: string | null) => {
    setSelectedUserHistory(val);
    if (val) sessionStorage.setItem('dt_adminUserHist', val);
    else sessionStorage.removeItem('dt_adminUserHist');
  };
  const handleUserHistoryTab = (tab: 'transactions' | 'bets') => {
    setUserHistoryTab(tab); sessionStorage.setItem('dt_adminUserHistTab', tab);
  };
  const handleShowGameHist = (val: boolean) => {
    setShowGameHistory(val); sessionStorage.setItem('dt_adminShowGameHist', String(val));
  };
  const handleSupportUser = (val: string | null) => {
    setSelectedSupportUser(val);
    if (val) sessionStorage.setItem('dt_adminSupportUser', val);
    else sessionStorage.removeItem('dt_adminSupportUser');
  };
  const [newSupportMsg, setNewSupportMsg] = useState('');
  const supportEndRef = useRef<HTMLDivElement>(null);

  // Utility to fetch latest users
  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(console.error);
  };

  // Initial data load and periodic refresh
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/admin/transactions?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setTransactions(data); })
        .catch(console.error);

      fetch(`/api/admin/round-outcomes?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setRoundOutcomes(data); })
        .catch(console.error);

      fetch(`/api/admin/chat/users?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setSupportUsers(data); })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserHistory && userHistoryTab === 'bets') {
      fetch(`/api/users/bet-history/${selectedUserHistory}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setAdminBetHistory(data); })
        .catch(console.error);
    }
  }, [selectedUserHistory, userHistoryTab]);

  // â”€â”€ Live bet polling every second â”€â”€
  useEffect(() => {
    const pollBets = () => {
      const global = getGlobalGameState();
      const roundId = global.rawRoundId;
      const isBetting = global.phase === 'betting';

      if (liveBetsRoundRef.current !== roundId) {
        liveBetsRoundRef.current = roundId;
        setLiveBets(defaultLiveBets);
      }

      if (!isBetting) {
        setLiveBets(defaultLiveBets);
        return;
      }

      fetch(`/api/bets/round/${roundId}?t=${Date.now()}`)
        .then(r => r.json())
        .then(data => {
          const normalized = normalizeLiveBets(data);
          setLiveBets(normalized);
        })
        .catch(() => {
          setLiveBets(defaultLiveBets);
        });
    };
    pollBets();
    const betPollId = setInterval(pollBets, 1000);
    return () => clearInterval(betPollId);
  }, []);

  // â”€â”€ Support Chat Polling â”€â”€
  useEffect(() => {
    if (activeTab !== 'support' || !selectedSupportUser) return;
    
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chat/${selectedSupportUser}?t=${Date.now()}`);
        const data = await res.json();
        setSupportMessages(data);
        
        await fetch(`/api/chat/${selectedSupportUser}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin' })
        });
      } catch (e) {}
    };
    
    fetchChat();
    const intv = setInterval(fetchChat, 3000);
    return () => clearInterval(intv);
  }, [activeTab, selectedSupportUser]);

  useEffect(() => {
    supportEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages]);

  const handleSendSupportMsg = async () => {
    if (!newSupportMsg.trim() || !selectedSupportUser) return;
    try {
      const msg = newSupportMsg;
      setNewSupportMsg('');
      const res = await fetch(`/api/chat/${selectedSupportUser}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin', message: msg })
      });
      const data = await res.json();
      setSupportMessages(prev => [...prev, data]);
    } catch(e) {}
  };

  const handleDeleteChat = async () => {
    if (!selectedSupportUser) return;
    if (!window.confirm(`Are you sure you want to delete the chat history for ${selectedSupportUser}?`)) return;
    
    try {
      await fetch(`/api/chat/${selectedSupportUser}`, { method: 'DELETE' });
      setSupportMessages([]);
      setSelectedSupportUser(null);
      // Refresh user list
      fetch('/api/admin/chat/users')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setSupportUsers(data); })
        .catch(console.error);
    } catch (e) {
      console.error(e);
    }
  };
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatText, setEditingChatText] = useState('');
  
  const [activeAdminMenuMsgId, setActiveAdminMenuMsgId] = useState<string | null>(null);
  const adminHoldTimeoutRef = useRef<any>(null);
  const adminHideTimeoutRef = useRef<any>(null);

  const startAdminHold = (msgId: string) => {
    if (adminHideTimeoutRef.current) clearTimeout(adminHideTimeoutRef.current);
    adminHoldTimeoutRef.current = setTimeout(() => {
      setActiveAdminMenuMsgId(msgId);
    }, 600);
  };

  const endAdminHold = (msgId: string) => {
    if (adminHoldTimeoutRef.current) clearTimeout(adminHoldTimeoutRef.current);
    adminHideTimeoutRef.current = setTimeout(() => {
      setActiveAdminMenuMsgId(curr => curr === msgId ? null : curr);
    }, 2000);
  };

  const handleAdminDeleteMessage = async (msgId: string) => {
    try {
      await fetch(`/api/chat/message/${msgId}`, { method: 'DELETE' });
      setSupportMessages(prev => prev.filter(m => m.id !== msgId));
      setActiveAdminMenuMsgId(null);
    } catch(e) { console.error(e); }
  };

  const handleAdminEditMessage = async (msgId: string, newMsg: string) => {
    if (newMsg && newMsg.trim() !== '') {
      try {
        const res = await fetch(`/api/chat/message/${msgId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMsg })
        });
        if (res.ok) {
          setSupportMessages(prev => prev.map(m => m.id === msgId ? { ...m, message: newMsg } : m));
        }
      } catch(e) { console.error(e); }
    }
    setEditingChatId(null);
    setEditingChatText('');
  };

  // â”€â”€ Continuous game loop for admin (always running) â”€â”€
  useEffect(() => {
    simTimerRef.current = setInterval(() => {
      const global = getGlobalGameState();
      setSimRoundId(global.roundId);

      setSimPhase(prevPhase => {
        if (global.phase === 'betting' && prevPhase !== 'betting') {
          setSimTimer(global.timer);
          // Preserve last round cards until next deal so admin sees the last card fronts
          return 'betting';
        }
        if (global.phase === 'betting') {
          setSimTimer(global.timer);
          return 'betting';
        }
        if (global.phase === 'dealing' && prevPhase === 'betting') {
          setSimTimer(0);
          
          // Fetch forced outcome and apply same card override as users
          fetch('/api/admin/settings/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roundId: global.roundId })
          })
            .then(r => r.json())
            .then(data => {
              const forcedOutcome = data.outcome || 'none';
              let { dragonCard, tigerCard } = forcedOutcome !== 'none'
                ? getForcedDeterministicCards(global.roundId, global.rawRoundId, forcedOutcome)
                : getDeterministicCards(global.roundId, global.rawRoundId);

              setSimDragonCard(dragonCard);
              setSimTigerCard(tigerCard);

              setTimeout(() => {
                setSimResult(determineResult(dragonCard, tigerCard));
                setSimPhase('result');
              }, 1000);
            })
            .catch(() => {
              // Fallback: use deterministic cards
              const { dragonCard, tigerCard } = getDeterministicCards(global.roundId, global.rawRoundId);
              setSimDragonCard(dragonCard);
              setSimTigerCard(tigerCard);
              setTimeout(() => {
                setSimResult(determineResult(dragonCard, tigerCard));
                setSimPhase('result');
              }, 1000);
            });

          return 'dealing';
        }
        return prevPhase;
      });
    }, 200);

    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); };
  }, []);

  // â”€â”€ Set outcome for ANY round â”€â”€
  const setRoundOutcome = async (roundId: number, outcome: string) => {
    try {
      const res = await fetch('/api/admin/round-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId, outcome })
      });
      if (res.ok) {
        const data = await res.json();
        setRoundOutcomes(data.roundOutcomes || []);
        setSaveMsg(`✅ Round #${roundId} → ${outcome.toUpperCase()} set ho gaya!`);
        setTargetRoundId('');
        setTimeout(() => setSaveMsg(''), 4000);
        if (!muted) {
          speak(`Round ${roundId} result set to ${outcome}`, muted);
          playSound('notify', muted);
        }
      }
    } catch(e) { console.error(e); }
  };

  // â”€â”€ Remove outcome for a round â”€â”€
  const removeRoundOutcome = async (roundId: number) => {
    try {
      const res = await fetch(`/api/admin/round-outcomes/${roundId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setRoundOutcomes(data.roundOutcomes || []);
      }
    } catch(e) { console.error(e); }
  };

  const handleUpdateBalance = async (id: string) => {
  const amount = parseFloat(newBalance);
  if (isNaN(amount) || amount < 0) { alert("Invalid balance amount"); return; }
  try {
    const res = await fetch(`/api/users/${id}/balance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: amount })
    });
    if (res.ok) {
      // Update local users state using functional updater to avoid stale closure
      setUsers(prev => prev.map(u => u.id === id ? { ...u, balance: amount } : u));
      // Refresh from server to ensure consistency
      fetchUsers();
      // Update session storage for this user if present
      const savedStr = sessionStorage.getItem('dragonTigerCurrentUser');
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        if (saved.id === id) {
          sessionStorage.setItem('dragonTigerCurrentUser', JSON.stringify({ ...saved, balance: amount }));
        }
      }
      // Update localStorage cache for the user
      const usersStr = localStorage.getItem('dragonTigerUsers') || '{}';
      try {
        const users = JSON.parse(usersStr);
        if (users[id]) {
          users[id].balance = amount;
          localStorage.setItem('dragonTigerUsers', JSON.stringify(users));
        }
      } catch (e) { console.error('Failed to sync local user balance', e); }
      setEditBalanceUser(null);
      setNewBalance('');
    }
  } catch (err) { console.error(err); }
};

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter((u: any) => u.id !== id));
      if (!muted) {
        speak('User deleted', muted);
        playSound('lose', muted);
      }
    } catch (err) { console.error(err); }
  };

  const handleTransactionAction = async (txId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetch('/api/admin/users').then(r => r.json()).then(data => { if (Array.isArray(data)) setUsers(data); });
        fetch('/api/admin/transactions').then(r => r.json()).then(data => { if (Array.isArray(data)) setTransactions(data); });
        if (!muted) {
          speak(`Transaction ${action === 'approve' ? 'approved' : 'rejected'}`, muted);
          playSound(action === 'approve' ? 'win' : 'lose', muted);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process transaction");
      }
    } catch(e) { console.error(e); }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction record completely?')) return;
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(prev => prev.filter((t: any) => t.id !== txId));
        if (!muted) {
          speak('Transaction deleted', muted);
          playSound('lose', muted);
        }
      } else {
        alert("Failed to delete transaction");
      }
    } catch(e) { console.error(e); }
  };

  const phaseColor = simPhase === 'betting' ? '#f39c12' : simPhase === 'dealing' ? '#3498db' : '#2ecc71';
  const phaseLabel = simPhase === 'betting' ? `🎯 Betting Open (${simTimer}s)` : simPhase === 'dealing' ? '🃏 Dealing Cards...' : '🏆 Round Over';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-logo">🛡️</span>
          <h2>CASINO ADMIN</h2>
        </div>

        {/* â”€â”€ Live Round Badge in sidebar â”€â”€ */}
        <div style={{
          margin: '10px 16px',
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.05))',
          border: '1px solid rgba(212,160,23,0.5)',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Round</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f1c40f', lineHeight: 1.2 }}>#{simRoundId}</div>
          <div style={{ fontSize: '12px', color: phaseColor, fontWeight: 'bold' }}>{phaseLabel}</div>
        </div>
        
        <nav className="admin-nav">
          <button className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleTabChange('users')}>👥 Users</button>
          <button className={`admin-nav-btn ${activeTab === 'game' ? 'active' : ''}`} onClick={() => handleTabChange('game')}>🎲 Game Control</button>
          <button className={`admin-nav-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => handleTabChange('transactions')}>💳 Transactions</button>
          <button className={`admin-nav-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => handleTabChange('support')}>💬 Support</button>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
          <button className="admin-logout-btn" onClick={onLogout} style={{ marginTop: 0 }}>🚪 Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'users' ? 'User Management' : activeTab === 'game' ? 'Game Control Room' : activeTab === 'transactions' ? 'Transactions' : 'Support Center'}</h1>
          <div className="admin-badge">Admin Privileges Active (v1.1)</div>
          <button onClick={() => setMuted(!muted)} className="mute-btn" style={{ marginLeft: '12px', background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>{muted ? '🔇' : '🔊'}</button>
        </header>

        <div className="admin-content">
          {/* â”€â”€ USERS TAB â”€â”€ */}
          {activeTab === 'users' && (
            <div className="admin-card">
              <h3>Registered Players</h3>
              <div className="table-responsive">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>Mobile Number</th>
                      <th>Username</th>
                      <th>Password</th>
                      <th>Balance</th>
                      <th>Deposited</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => {
                      if (user.id === 'babu') return null;
                      return (
                        <tr key={user.id}>
                          <td data-label="Mobile" className="fw-bold">{user.id}</td>
                          <td data-label="Username">{user.username}</td>
                          <td data-label="Password"><span className="password-mask">{user.password}</span></td>
                          <td data-label="Balance">
                            {editBalanceUser === user.id ? (
                              <div className="edit-balance-group">
                                <span className="currency-symbol">₹</span>
                                <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="balance-input" autoFocus />
                                <button className="save-btn" onClick={() => handleUpdateBalance(user.id)}>✓</button>
                                <button className="cancel-btn" onClick={() => setEditBalanceUser(null)}>✕</button>
                              </div>
                            ) : (
                              <span className="balance-display gold">₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            )}
                          </td>
                          <td data-label="Deposited">
                            <span style={{ color: user.hasDeposited ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                              {user.hasDeposited ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td data-label="Actions">
                            <div className="action-buttons">
                              <button className="action-btn edit" onClick={() => { setEditBalanceUser(user.id); setNewBalance(user.balance.toString()); }} title="Edit Balance">💰</button>
                              <button className="btn-secondary" onClick={() => handleUserHistory(user.id)}>View History</button>
                              <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)} title="Delete User">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {users.filter((u: any) => u.id !== 'babu').length === 0 && (
                      <tr><td colSpan={6} className="text-center text-muted">No registered players yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* â”€â”€ GAME TAB â”€â”€ */}
          {activeTab === 'game' && (
            <div className="admin-grid">
              <div className="admin-card">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h2 style={{ margin: 0 }}>🎮 Game Control</h2>
                  <button 
                    onClick={() => handleShowGameHist(true)}
                    style={{ background: '#3498db', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    📜 <span className="hide-mobile">Game History</span>
                  </button>
                </div>

                {/* â”€â”€ Current Round Info â”€â”€ */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '20px', padding: '20px',
                  background: 'linear-gradient(135deg, rgba(241,196,15,0.15), rgba(0,0,0,0))',
                  border: '2px solid rgba(241,196,15,0.5)', borderRadius: '14px', marginBottom: '24px'
                }}>
                  <div style={{ textAlign: 'center', minWidth: '100px' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Round</div>
                    <div style={{ fontSize: '54px', fontWeight: '900', color: '#f1c40f', lineHeight: 1 }}>#{simRoundId}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>of 2000</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      padding: '10px 16px', borderRadius: '8px', marginBottom: '8px',
                      background: simPhase === 'betting' ? 'rgba(243,156,18,0.2)' : simPhase === 'dealing' ? 'rgba(52,152,219,0.2)' : 'rgba(46,204,113,0.2)',
                      border: `1px solid ${phaseColor}`, color: phaseColor, fontWeight: 'bold', fontSize: '15px'
                    }}>
                      {phaseLabel}
                    </div>
                    {simPhase === 'betting' && (
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          background: 'linear-gradient(90deg, #27ae60, #f39c12, #e74c3c)',
                          width: `${(simTimer / 15) * 100}%`, transition: 'width 0.2s ease'
                        }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* â”€â”€ ANY ROUND WIN CONTROL â”€â”€ */}
                <div style={{
                  padding: '20px', background: 'rgba(155,89,182,0.08)', border: '2px solid rgba(155,89,182,0.5)',
                  borderRadius: '14px', marginBottom: '24px'
                }}>
                  <h3 style={{ color: '#9b59b6', margin: '0 0 6px 0' }}>🎯 Kisi Bhi Round Ka Result Set Karein</h3>
                  <p className="text-muted" style={{ margin: '0 0 16px 0', fontSize: '13px' }}>
                    Round number daalo (1â€“2000) aur choose karo Dragon / Tiger / Tie â€” agle us round mein wahi result aayega.
                  </p>

                  {saveMsg && (
                    <div style={{ padding: '10px 16px', background: 'rgba(46,204,113,0.2)', border: '1px solid #2ecc71', borderRadius: '8px', color: '#2ecc71', marginBottom: '14px', fontWeight: 'bold', fontSize: '14px' }}>
                      {saveMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 14px' }}>
                      <span style={{ color: '#f1c40f', fontWeight: 'bold', fontSize: '16px' }}>#</span>
                      <input
                        type="number"
                        min={1}
                        max={2000}
                        value={targetRoundId}
                        onChange={e => setTargetRoundId(e.target.value)}
                        placeholder={`Current: ${simRoundId}`}
                        style={{
                          width: '100px', background: 'transparent', border: 'none', outline: 'none',
                          color: '#fff', fontWeight: 'bold', fontSize: '18px'
                        }}
                      />
                    </div>
                    <button onClick={() => { const r = parseInt(targetRoundId) || simRoundId; setRoundOutcome(r, 'dragon'); }}
                      style={{ flex: 1, minWidth: '90px', padding: '12px 16px', border: '2px solid #e74c3c', background: 'rgba(231,76,60,0.2)', color: '#e74c3c', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                      🐲 Dragon
                    </button>
                    <button onClick={() => { const r = parseInt(targetRoundId) || simRoundId; setRoundOutcome(r, 'tiger'); }}
                      style={{ flex: 1, minWidth: '90px', padding: '12px 16px', border: '2px solid #3498db', background: 'rgba(52,152,219,0.2)', color: '#3498db', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                      🐯 Tiger
                    </button>
                    <button onClick={() => { const r = parseInt(targetRoundId) || simRoundId; setRoundOutcome(r, 'tie'); }}
                      style={{ flex: 1, minWidth: '90px', padding: '12px 16px', border: '2px solid #27ae60', background: 'rgba(39,174,96,0.2)', color: '#27ae60', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                      🤝 Tie
                    </button>
                  </div>

                  {/* Set Rounds Table */}
                  {roundOutcomes.length > 0 && (
                    <div>
                      <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>📋 Set kiye gaye rounds:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {roundOutcomes.sort((a,b) => a.roundId - b.roundId).map(ro => (
                          <div key={ro.roundId} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                            background: ro.outcome === 'dragon' ? 'rgba(231,76,60,0.2)' : ro.outcome === 'tiger' ? 'rgba(52,152,219,0.2)' : 'rgba(39,174,96,0.2)',
                            border: `1px solid ${ro.outcome === 'dragon' ? '#e74c3c' : ro.outcome === 'tiger' ? '#3498db' : '#27ae60'}`,
                            borderRadius: '8px'
                          }}>
                            <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>#{ro.roundId}</span>
                            <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: '#fff' }}>
                              {ro.outcome === 'dragon' ? '🐲' : ro.outcome === 'tiger' ? '🐯' : '🤝'} {ro.outcome}
                            </span>
                            <button onClick={() => removeRoundOutcome(ro.roundId)}
                              style={{ background: 'rgba(255,0,0,0.3)', color: 'white', border: '1px solid #e74c3c', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {roundOutcomes.length === 0 && (
                    <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', margin: 0 }}>
                      Abhi kisi round ke liye koi outcome set nahi hai.
                    </p>
                  )}
                </div>

                {/* â”€â”€ Live Bet Totals â”€â”€ */}
                <div className="admin-live-bets">
                  <div className="admin-live-bets-header">
                    <div>
                      <h3 className="admin-live-bets-title">📊 Live Bets — Round #{simRoundId}</h3>
                      <div className="admin-live-bets-subtitle">
                        {simPhase === 'betting' ? 'Betting open now' : 'Betting closed for this round'}
                      </div>
                    </div>
                    <span className="admin-live-bets-badge">
                      {liveBets.betCount} players · ₹{liveBets.total} total
                    </span>
                  </div>

                  {(() => {
                    const total = liveBets.total;
                    const divisor = total > 0 ? total : 1;
                    const dragonPct = Math.round((liveBets.dragon / divisor) * 100);
                    const tigerPct  = Math.round((liveBets.tiger  / divisor) * 100);
                    const tiePct    = Math.round((liveBets.tie    / divisor) * 100);
                    return (
                      <div className="admin-live-bets-columns">
                        <div className="admin-live-bets-row">
                          <div className="admin-live-bets-stat">
                            <span>🐲 Dragon</span>
                            <strong>₹{liveBets.dragon}</strong>
                            <span>{dragonPct}%</span>
                          </div>
                          <div className="admin-live-bets-stat">
                            <span>🐯 Tiger</span>
                            <strong>₹{liveBets.tiger}</strong>
                            <span>{tigerPct}%</span>
                          </div>
                          <div className="admin-live-bets-stat">
                            <span>🤝 Tie</span>
                            <strong>₹{liveBets.tie}</strong>
                            <span>{tiePct}%</span>
                          </div>
                        </div>
                        <div className="admin-live-bets-graph">
                          <div className="admin-live-bets-bar" style={{ width: `${dragonPct}%`, background: 'linear-gradient(90deg, #c0392b, #e74c3c)' }} />
                          <div className="admin-live-bets-bar" style={{ width: `${tigerPct}%`, background: 'linear-gradient(90deg, #2980b9, #3498db)' }} />
                          <div className="admin-live-bets-bar" style={{ width: `${tiePct}%`, background: 'linear-gradient(90deg, #219a52, #27ae60)' }} />
                        </div>
                        {liveBets.total === 0 && (
                          <div className="admin-live-bets-note">
                            {simPhase === 'betting'
                              ? 'Abhi kisi ne bet nahi lagayi is round mein.'
                              : 'Round ke baad betting band ho gayi hai. Agle round tak wait karein.'}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* â”€â”€ Live Game Preview â”€â”€ */}
                <h3 style={{ marginBottom: '8px' }}>🃏 Live Game Preview</h3>
                <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', minHeight: '200px' }}>
                  <div className="table-area" style={{ pointerEvents: 'none' }}>
                    <div className="cards-arena" id="cards-arena">
                      <CardDisplay card={simDragonCard} side="dragon" isRevealing={simPhase === 'dealing'} isWinner={simResult === 'dragon'} />
                      <div className="vs-divider" id="vs-divider">
                        <div className="vs-line" />
                        <div className="vs-badge">VS</div>
                        <div className="vs-line" />
                        {simResult === 'tie' && simPhase === 'result' && (
                          <div className="tie-indicator">TIE</div>
                        )}
                      </div>
                      <CardDisplay card={simTigerCard} side="tiger" isRevealing={simPhase === 'dealing'} isWinner={simResult === 'tiger'} />
                    </div>
                    {simResult && simPhase === 'result' && (
                      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '22px', fontWeight: 'bold', color: '#f1c40f' }}>
                        🏆 {simResult === 'dragon' ? '🐲 Dragon Wins!' : simResult === 'tiger' ? '🐯 Tiger Wins!' : '🤝 Tie!'}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* â”€â”€ TRANSACTIONS TAB â”€â”€ */}
          {activeTab === 'transactions' && (
            <div className="admin-card">
              <h3>Pending Transactions</h3>
              <div className="table-responsive">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>UTR / UPI</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice().reverse().map((tx) => (
                      <tr key={tx.id}>
                        <td data-label="Time">{new Date(tx.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                        <td data-label="User" className="fw-bold">{tx.username}</td>
                        <td data-label="Type" className={tx.type === 'deposit' ? 'green' : 'gold'}>{tx.type.toUpperCase()}</td>
                        <td data-label="Amount" className="gold">₹{tx.amount}</td>
                        <td data-label="UTR/UPI" style={{ fontSize: '12px', maxWidth: '120px', wordBreak: 'break-all' }}>
                          {tx.utr && <span style={{ color: '#aaa' }}>UTR: {tx.utr}</span>}
                          {tx.upiId && <span style={{ color: '#7ec8e3' }}>UPI: {tx.upiId}</span>}
                          {!tx.utr && !tx.upiId && '-'}
                        </td>
                        <td data-label="Status"><span className={`status-badge ${tx.status}`}>{tx.status.toUpperCase()}</span></td>
                        <td data-label="Actions">
                          {tx.status === 'pending' ? (
                            <div className="action-buttons">
                              <button className="action-btn edit" title="Approve" onClick={() => handleTransactionAction(tx.id, 'approve')}>✅</button>
                              <button className="action-btn delete" title="Reject" onClick={() => handleTransactionAction(tx.id, 'reject')}>❌</button>
                              <button className="action-btn delete" title="Delete" onClick={() => handleDeleteTransaction(tx.id)} style={{ background: '#e74c3c', color: 'white' }}>🗑️</button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button className="action-btn delete" title="Delete" onClick={() => handleDeleteTransaction(tx.id)} style={{ background: '#e74c3c', color: 'white' }}>🗑️</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={7} className="text-center text-muted">No transactions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* â”€â”€ SUPPORT TAB â”€â”€ */}
          {activeTab === 'support' && (
            <div className={`admin-card admin-chat-layout ${selectedSupportUser ? 'chat-active' : ''}`}>
              <div className="admin-chat-sidebar">
                <h3 style={{ padding: '20px', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Chats</h3>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {supportUsers.map(u => (
                    <div 
                      key={u.userId}
                      onClick={() => handleSupportUser(u.userId)}
                      style={{ 
                        padding: '15px 20px', 
                        cursor: 'pointer', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: selectedSupportUser === u.userId ? 'rgba(52, 152, 219, 0.2)' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>👤 {u.userId}</span>
                      {u.unreadCount > 0 && (
                        <span style={{ background: '#e74c3c', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>
                          {u.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                  {supportUsers.length === 0 && <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>No active chats</div>}
                </div>
              </div>
              
              <div className="admin-chat-main">
                {selectedSupportUser ? (
                  <>
                    <div className="admin-chat-header">
                      <button className="admin-chat-back" onClick={() => handleSupportUser(null)}>
                        ← Back
                      </button>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selectedSupportUser}</span>
                      <button className="admin-chat-delete" onClick={handleDeleteChat} title="Delete Chat">
                        🗑️
                      </button>
                    </div>
                    <div className="admin-chat-messages">
                      {supportMessages.map((msg, i) => (
                        <div key={msg.id || i} style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                          <div 
                            style={{ 
                              maxWidth: '75%', padding: '10px 15px', borderRadius: '15px',
                              background: msg.sender === 'admin' ? '#3498db' : 'rgba(255,255,255,0.1)',
                              borderBottomRightRadius: msg.sender === 'admin' ? '4px' : '15px',
                              borderBottomLeftRadius: msg.sender === 'user' ? '4px' : '15px',
                              color: 'white',
                              wordBreak: 'break-word',
                              cursor: 'pointer'
                            }}
                          >
                            {editingChatId === msg.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input 
                                  type="text" 
                                  value={editingChatText} 
                                  onChange={e => setEditingChatText(e.target.value)} 
                                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: 'none', color: '#000' }}
                                  autoFocus
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => setEditingChatId(null)} style={{ background: '#ccc', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                                  <button onClick={() => handleAdminEditMessage(msg.id, editingChatText)} style={{ background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onTouchStart={() => startAdminHold(msg.id)}
                                onTouchEnd={() => endAdminHold(msg.id)}
                                onMouseDown={() => startAdminHold(msg.id)}
                                onMouseUp={() => endAdminHold(msg.id)}
                                onMouseLeave={() => endAdminHold(msg.id)}
                              >
                                {msg.message}
                                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start', gap: '4px' }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                  {new Date(msg.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} â€¢ {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                                {activeAdminMenuMsgId === msg.id && (
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start', animation: 'hcFadeIn 0.3s ease' }}>
                                    {Date.now() - new Date(msg.timestamp).getTime() <= 10 * 60 * 1000 && (
                                      <button 
                                        onClick={() => { setEditingChatId(msg.id); setEditingChatText(msg.message); setActiveAdminMenuMsgId(null); }}
                                        style={{ background: 'none', border: 'none', color: '#f1c40f', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                      >
                                        ✏️ Edit
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleAdminDeleteMessage(msg.id)}
                                      style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={supportEndRef} />
                    </div>
                    <div className="admin-chat-input">
                      <input 
                        type="text" 
                        value={newSupportMsg}
                        onChange={e => setNewSupportMsg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendSupportMsg()}
                        placeholder="Type reply..."
                      />
                      <button onClick={handleSendSupportMsg}>
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="admin-chat-empty">
                    Select a user to start chatting
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User History Modal */}
      {selectedUserHistory && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <div className="wallet-header">
              <h2>History: {selectedUserHistory}</h2>
              <button className="close-btn" onClick={() => handleUserHistory(null)}>✕</button>
            </div>
            
            <div className="wallet-tabs" style={{ marginBottom: '15px' }}>
              <button
                className={`wallet-tab ${userHistoryTab === 'transactions' ? 'active' : ''}`}
                onClick={() => handleUserHistoryTab('transactions')}
              >
                Transactions
              </button>
              <button
                className={`wallet-tab ${userHistoryTab === 'bets' ? 'active' : ''}`}
                onClick={() => handleUserHistoryTab('bets')}
              >
                Bet History
              </button>
            </div>

            <div className="wallet-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {userHistoryTab === 'transactions' ? (
                <table className="admin-table-v2">
                  <thead><tr><th>Time</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {transactions.filter(t => t.username === selectedUserHistory).slice().reverse().map(tx => (
                      <tr key={tx.id}>
                        <td data-label="Time">{new Date(tx.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                        <td data-label="Type" className={tx.type === 'deposit' ? 'green' : 'gold'}>{tx.type.toUpperCase()}</td>
                        <td data-label="Amount">₹{tx.amount}</td>
                        <td data-label="Status"><span className={`status-badge ${tx.status}`}>{tx.status}</span></td>
                      </tr>
                    ))}
                    {transactions.filter(t => t.username === selectedUserHistory).length === 0 && (
                      <tr><td colSpan={4} className="text-center">No transactions found.</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="admin-table-v2">
                  <thead><tr><th>Time</th><th>Round</th><th>Bet On</th><th>Bet</th><th>Win</th><th>Result</th></tr></thead>
                  <tbody>
                    {adminBetHistory.map((b, i) => (
                      <tr key={b.timestamp + i}>
                        <td data-label="Time">{new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                        <td data-label="Round">#{b.roundNumber}</td>
                        <td data-label="Bet On" style={{ color: '#7ec8e3' }}>{b.betSide || '-'}</td>
                        <td data-label="Bet">₹{b.betAmount}</td>
                        <td data-label="Win">₹{b.winAmount}</td>
                        <td data-label="Result" style={{ color: b.winAmount > 0 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                          {b.winAmount > 0 ? 'WIN' : 'LOST'}
                        </td>
                      </tr>
                    ))}
                    {adminBetHistory.length === 0 && (
                      <tr><td colSpan={6} className="text-center">Aaj koi bet nahi lagayi hai.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game History Modal */}
      {showGameHistory && (
        <GameHistory
          currentRound={simRoundId}
          rawRoundId={getGlobalGameState().rawRoundId}
          isOpen={showGameHistory}
          onClose={() => handleShowGameHist(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;

