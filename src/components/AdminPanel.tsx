import React, { useState, useEffect, useRef } from 'react';
import './AdminPanel.css';
import CardDisplay from './CardDisplay';
import { determineResult } from '../types/game';
import { getGlobalGameState, getDeterministicCards } from '../syncEngine';
import type { Card, GameResult } from '../types/game';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'game' | 'transactions'>('users');
  const [simPhase, setSimPhase] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [simTimer, setSimTimer] = useState<number>(15);
  const [simRoundId, setSimRoundId] = useState<number>(0);
  const [simDragonCard, setSimDragonCard] = useState<Card | null>(null);
  const [simTigerCard, setSimTigerCard] = useState<Card | null>(null);
  const [simResult, setSimResult] = useState<GameResult | null>(null);
  const simTimerRef = useRef<any | null>(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState<string | null>(null);
  const [editBalanceUser, setEditBalanceUser] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<string>('');
  const [liveBets, setLiveBets] = useState<{ dragon: number; tiger: number; tie: number; total: number; betCount: number }>({ dragon: 0, tiger: 0, tie: 0, total: 0, betCount: 0 });

  // Round outcome control
  const [roundOutcomes, setRoundOutcomes] = useState<{ roundId: number; outcome: string }[]>([]);
  const [targetRoundId, setTargetRoundId] = useState<string>('');
  const [saveMsg, setSaveMsg] = useState<string>('');
  const liveBetsRoundRef = useRef<number>(0);

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setUsers(data); })
        .catch(console.error);
        
      fetch('/api/admin/transactions')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setTransactions(data); })
        .catch(console.error);

      fetch('/api/admin/round-outcomes')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setRoundOutcomes(data); })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Live bet polling every 2 seconds ──
  useEffect(() => {
    const pollBets = () => {
      const global = getGlobalGameState();
      const roundId = global.roundId;
      if (liveBetsRoundRef.current !== roundId) {
        liveBetsRoundRef.current = roundId;
        setLiveBets({ dragon: 0, tiger: 0, tie: 0, total: 0, betCount: 0 });
      }
      fetch(`/api/bets/round/${roundId}`)
        .then(r => r.json())
        .then(data => { if (data && data.totals) setLiveBets({ ...data.totals, betCount: data.betCount || 0 }); })
        .catch(() => {});
    };
    pollBets();
    const betPollId = setInterval(pollBets, 2000);
    return () => clearInterval(betPollId);
  }, []);

  // ── Continuous game loop for admin (always running) ──
  useEffect(() => {
    simTimerRef.current = setInterval(() => {
      const global = getGlobalGameState();
      setSimRoundId(global.roundId);

      setSimPhase(prevPhase => {
        if (global.phase === 'betting' && prevPhase !== 'betting') {
          setSimTimer(global.timer);
          setSimDragonCard(null);
          setSimTigerCard(null);
          setSimResult(null);
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
              let { dragonCard, tigerCard } = getDeterministicCards(global.roundId, global.rawRoundId);

              // Apply same override logic as App.tsx
              if (forcedOutcome === 'dragon') {
                dragonCard = { suit: '♠', rank: 'K', value: 13 };
                tigerCard  = { suit: '♥', rank: '2', value: 2  };
              } else if (forcedOutcome === 'tiger') {
                dragonCard = { suit: '♥', rank: '2', value: 2  };
                tigerCard  = { suit: '♠', rank: 'K', value: 13 };
              } else if (forcedOutcome === 'tie') {
                dragonCard = { suit: '♠', rank: '8', value: 8 };
                tigerCard  = { suit: '♥', rank: '8', value: 8 };
              }

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

  // ── Set outcome for ANY round ──
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
      }
    } catch(e) { console.error(e); }
  };

  // ── Remove outcome for a round ──
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
        setUsers(users.map(u => u.id === id ? { ...u, balance: amount } : u));
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

        {/* ── Live Round Badge in sidebar ── */}
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
          <button className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            👥 User Management
          </button>
          <button className={`nav-btn ${activeTab === 'game' ? 'active' : ''}`} onClick={() => setActiveTab('game')}>
            🎮 Game Control
          </button>
          <button className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            💸 Transactions
          </button>
        </nav>

        <button className="admin-logout-btn" onClick={onLogout}>🚪 Logout</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'users' ? 'User Management' : activeTab === 'game' ? 'Game Control Room' : 'Transactions'}</h1>
          <div className="admin-badge">Admin Privileges Active</div>
        </header>

        <div className="admin-content">
          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div className="admin-card">
              <h3>Registered Players</h3>
              <div className="table-responsive">
                <table className="admin-table">
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
                          <td className="fw-bold">{user.id}</td>
                          <td>{user.username}</td>
                          <td><span className="password-mask">{user.password}</span></td>
                          <td>
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
                          <td>
                            <span style={{ color: user.hasDeposited ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                              {user.hasDeposited ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="action-btn edit" onClick={() => { setEditBalanceUser(user.id); setNewBalance(user.balance.toString()); }} title="Edit Balance">💰</button>
                              <button className="action-btn" onClick={() => setSelectedUserHistory(user.id)} title="View History" style={{ background: '#3498db' }}>📜</button>
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

          {/* ── GAME TAB ── */}
          {activeTab === 'game' && (
            <div className="admin-grid">
              <div className="admin-card">

                {/* ── Current Round Info ── */}
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

                {/* ── ANY ROUND WIN CONTROL ── */}
                <div style={{
                  padding: '20px', background: 'rgba(155,89,182,0.08)', border: '2px solid rgba(155,89,182,0.5)',
                  borderRadius: '14px', marginBottom: '24px'
                }}>
                  <h3 style={{ color: '#9b59b6', margin: '0 0 6px 0' }}>🎯 Kisi Bhi Round Ka Result Set Karein</h3>
                  <p className="text-muted" style={{ margin: '0 0 16px 0', fontSize: '13px' }}>
                    Round number daalo (1–2000) aur choose karo Dragon / Tiger / Tie — agle us round mein wahi result aayega.
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
                      🐉 Dragon
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
                              {ro.outcome === 'dragon' ? '🐉' : ro.outcome === 'tiger' ? '🐯' : '🤝'} {ro.outcome}
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

                {/* ── Live Bet Totals ── */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0 }}>📊 Live Bets — Round #{simRoundId}</h3>
                    <span style={{ fontSize: '12px', color: '#aaa', background: 'rgba(255,255,255,0.07)', padding: '4px 10px', borderRadius: '20px' }}>
                      {liveBets.betCount} players · ₹{liveBets.total} total
                    </span>
                  </div>
                  {(() => {
                    const total = liveBets.total || 1;
                    const dragonPct = Math.round((liveBets.dragon / total) * 100);
                    const tigerPct  = Math.round((liveBets.tiger  / total) * 100);
                    const tiePct    = Math.round((liveBets.tie    / total) * 100);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Dragon */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>🐉 Dragon</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>₹{liveBets.dragon} <span style={{ color: '#aaa', fontSize: '12px' }}>({dragonPct}%)</span></span>
                          </div>
                          <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${dragonPct}%`, background: 'linear-gradient(90deg, #c0392b, #e74c3c)', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                        {/* Tiger */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#3498db', fontWeight: 'bold' }}>🐯 Tiger</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>₹{liveBets.tiger} <span style={{ color: '#aaa', fontSize: '12px' }}>({tigerPct}%)</span></span>
                          </div>
                          <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${tigerPct}%`, background: 'linear-gradient(90deg, #2980b9, #3498db)', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                        {/* Tie */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#27ae60', fontWeight: 'bold' }}>🤝 Tie</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>₹{liveBets.tie} <span style={{ color: '#aaa', fontSize: '12px' }}>({tiePct}%)</span></span>
                          </div>
                          <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${tiePct}%`, background: 'linear-gradient(90deg, #219a52, #27ae60)', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                        {liveBets.total === 0 && (
                          <p style={{ color: '#555', textAlign: 'center', margin: '8px 0', fontSize: '13px' }}>Abhi kisi ne bet nahi lagayi is round mein.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* ── Live Game Preview ── */}
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
                        🏆 {simResult === 'dragon' ? '🐉 Dragon Wins!' : simResult === 'tiger' ? '🐯 Tiger Wins!' : '🤝 Tie!'}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
            <div className="admin-card">
              <h3>Pending Transactions</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>UTR / UPI</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice().reverse().map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="fw-bold">{tx.username}</td>
                        <td className={tx.type === 'deposit' ? 'green' : 'gold'}>{tx.type.toUpperCase()}</td>
                        <td className="gold">₹{tx.amount}</td>
                        <td style={{ fontSize: '12px', maxWidth: '120px', wordBreak: 'break-all' }}>
                          {tx.utr && <span style={{ color: '#aaa' }}>UTR: {tx.utr}</span>}
                          {tx.upiId && <span style={{ color: '#7ec8e3' }}>UPI: {tx.upiId}</span>}
                          {!tx.utr && !tx.upiId && '-'}
                        </td>
                        <td><span className={`status-badge ${tx.status}`}>{tx.status.toUpperCase()}</span></td>
                        <td>
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
        </div>
      </main>

      {/* User History Modal */}
      {selectedUserHistory && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <div className="wallet-header">
              <h2>History: {selectedUserHistory}</h2>
              <button className="close-btn" onClick={() => setSelectedUserHistory(null)}>✕</button>
            </div>
            <div className="wallet-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Time</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {transactions.filter(t => t.username === selectedUserHistory).slice().reverse().map(tx => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className={tx.type === 'deposit' ? 'green' : 'gold'}>{tx.type.toUpperCase()}</td>
                      <td>₹{tx.amount}</td>
                      <td><span className={`status-badge ${tx.status}`}>{tx.status}</span></td>
                    </tr>
                  ))}
                  {transactions.filter(t => t.username === selectedUserHistory).length === 0 && (
                    <tr><td colSpan={4} className="text-center">No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
