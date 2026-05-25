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
  const [forcedOutcomes, setForcedOutcomes] = useState<string[]>([]);
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
  const [liveBets, setLiveBets] = useState<{ dragon: number; tiger: number; tie: number }>({ dragon: 0, tiger: 0, tie: 0 });
  const [currentRoundOutcome, setCurrentRoundOutcome] = useState<string>('');
  const [outcomeSetMsg, setOutcomeSetMsg] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setUsers(data); })
      .catch(console.error);
      
    fetch('/api/admin/transactions')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTransactions(data); })
      .catch(console.error);

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => { if (data.forcedOutcomes) setForcedOutcomes(data.forcedOutcomes); })
      .catch(console.error);
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
          setCurrentRoundOutcome('');
          return 'betting';
        }
        if (global.phase === 'betting') {
          setSimTimer(global.timer);
          return 'betting';
        }
        if (global.phase === 'dealing' && prevPhase === 'betting') {
          setTimeout(() => {
            const { dragonCard, tigerCard } = getDeterministicCards(global.roundId, global.rawRoundId);
            setSimDragonCard(dragonCard);
            setSimTigerCard(tigerCard);
            setTimeout(() => {
              setSimResult(determineResult(dragonCard, tigerCard));
              setSimPhase('result');
            }, 1000);
          }, 500);
          setSimTimer(0);
          return 'dealing';
        }
        return prevPhase;
      });
    }, 200);

    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); };
  }, []);

  const addToQueue = async (outcome: string) => {
    try {
      const res = await fetch('/api/admin/settings/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome })
      });
      if (res.ok) {
        const settings = await res.json();
        setForcedOutcomes(settings.forcedOutcomes);
      }
    } catch(e) { console.error(e); }
  };

  const removeFromQueue = async (index: number) => {
    try {
      const res = await fetch(`/api/admin/settings/queue/${index}`, { method: 'DELETE' });
      if (res.ok) {
        const settings = await res.json();
        setForcedOutcomes(settings.forcedOutcomes);
      }
    } catch(e) { console.error(e); }
  };

  // ── Set outcome for CURRENT round immediately ──
  const setCurrentRoundWinner = async (outcome: string) => {
    try {
      // Clear existing queue and set only current round
      const res = await fetch('/api/admin/settings/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, immediate: true })
      });
      if (res.ok) {
        const settings = await res.json();
        setForcedOutcomes(settings.forcedOutcomes);
        setCurrentRoundOutcome(outcome);
        setOutcomeSetMsg(`✅ Current round will result in: ${outcome.toUpperCase()}`);
        setTimeout(() => setOutcomeSetMsg(''), 4000);
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
                  border: '1px solid rgba(241,196,15,0.4)', borderRadius: '12px', marginBottom: '24px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>Current Round</div>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: '#f1c40f', lineHeight: 1 }}>#{simRoundId}</div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>of 2000</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      padding: '10px 16px', borderRadius: '8px',
                      background: simPhase === 'betting' ? 'rgba(243,156,18,0.2)' : simPhase === 'dealing' ? 'rgba(52,152,219,0.2)' : 'rgba(46,204,113,0.2)',
                      border: `1px solid ${phaseColor}`, color: phaseColor, fontWeight: 'bold', fontSize: '16px'
                    }}>
                      {phaseLabel}
                    </div>
                    {simPhase === 'betting' && (
                      <div style={{ marginTop: '8px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
                          width: `${(simTimer / 15) * 100}%`,
                          transition: 'width 0.2s ease'
                        }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── CURRENT ROUND OUTCOME CONTROL ── */}
                <div style={{
                  padding: '20px', background: 'rgba(231,76,60,0.08)', border: '2px solid rgba(231,76,60,0.4)',
                  borderRadius: '12px', marginBottom: '24px'
                }}>
                  <h3 style={{ color: '#e74c3c', margin: '0 0 8px 0' }}>⚡ Current Round Control</h3>
                  <p className="text-muted" style={{ margin: '0 0 16px 0' }}>
                    Abhi chal rahe Round #{simRoundId} ka result set karein. Betting band hone se pehle set karein.
                  </p>
                  
                  {outcomeSetMsg && (
                    <div style={{ padding: '10px 16px', background: 'rgba(46,204,113,0.2)', border: '1px solid #2ecc71', borderRadius: '8px', color: '#2ecc71', marginBottom: '12px', fontWeight: 'bold' }}>
                      {outcomeSetMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setCurrentRoundWinner('dragon')}
                      style={{
                        flex: 1, minWidth: '100px', padding: '14px 20px', border: '2px solid #e74c3c',
                        background: currentRoundOutcome === 'dragon' ? '#e74c3c' : 'rgba(231,76,60,0.15)',
                        color: '#fff', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px',
                        cursor: simPhase !== 'betting' ? 'not-allowed' : 'pointer', opacity: simPhase !== 'betting' ? 0.5 : 1
                      }}
                      disabled={simPhase !== 'betting'}
                    >
                      🐉 Dragon Win
                    </button>
                    <button
                      onClick={() => setCurrentRoundWinner('tiger')}
                      style={{
                        flex: 1, minWidth: '100px', padding: '14px 20px', border: '2px solid #3498db',
                        background: currentRoundOutcome === 'tiger' ? '#3498db' : 'rgba(52,152,219,0.15)',
                        color: '#fff', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px',
                        cursor: simPhase !== 'betting' ? 'not-allowed' : 'pointer', opacity: simPhase !== 'betting' ? 0.5 : 1
                      }}
                      disabled={simPhase !== 'betting'}
                    >
                      🐯 Tiger Win
                    </button>
                    <button
                      onClick={() => setCurrentRoundWinner('tie')}
                      style={{
                        flex: 1, minWidth: '100px', padding: '14px 20px', border: '2px solid #27ae60',
                        background: currentRoundOutcome === 'tie' ? '#27ae60' : 'rgba(39,174,96,0.15)',
                        color: '#fff', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px',
                        cursor: simPhase !== 'betting' ? 'not-allowed' : 'pointer', opacity: simPhase !== 'betting' ? 0.5 : 1
                      }}
                      disabled={simPhase !== 'betting'}
                    >
                      🤝 Tie
                    </button>
                  </div>
                  {simPhase !== 'betting' && (
                    <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                      ⚠️ Betting band ho gayi hai. Agla round aane par control milega.
                    </p>
                  )}
                </div>

                {/* ── Live Sim Cards ── */}
                <h3 style={{ marginBottom: '8px' }}>Live Game Preview</h3>
                <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', minHeight: '200px' }}>
                  <div className="table-area" style={{ pointerEvents: 'none' }}>
                    <div className="cards-arena" id="cards-arena">
                      <CardDisplay card={simDragonCard} side="dragon" isRevealing={simPhase === 'dealing'} isWinner={simResult === 'dragon'} />
                      <div className="vs-divider" id="vs-divider">
                        <div className="vs-line" />
                        <div className="vs-badge">VS</div>
                        <div className="vs-line" />
                        {(simResult === 'tie' || simResult === 'suited-tie') && simPhase === 'result' && (
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

                {/* ── Live Betting Stats ── */}
                <h3 style={{ marginTop: '24px' }}>📊 Live Bets This Round</h3>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>🐉 Dragon</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>₹{liveBets.dragon}</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(52,152,219,0.1)', border: '1px solid #3498db', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#3498db', fontWeight: 'bold' }}>🐯 Tiger</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>₹{liveBets.tiger}</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(39,174,96,0.1)', border: '1px solid #27ae60', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#27ae60', fontWeight: 'bold' }}>🤝 Tie</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>₹{liveBets.tie}</div>
                  </div>
                </div>

                {/* ── Next Rounds Queue ── */}
                <h3>📋 Next Rounds Queue</h3>
                <p className="text-muted">Agle rounds ke liye outcome pehle se set karein (max 5).</p>
                <div className="outcome-selector" style={{ marginTop: '12px' }}>
                  <button className="outcome-btn dragon" onClick={() => addToQueue('dragon')} disabled={forcedOutcomes.length >= 5}>+ Dragon</button>
                  <button className="outcome-btn tiger" onClick={() => addToQueue('tiger')} disabled={forcedOutcomes.length >= 5}>+ Tiger</button>
                  <button className="outcome-btn tie" onClick={() => addToQueue('tie')} disabled={forcedOutcomes.length >= 5}>+ Tie</button>
                  <button className="outcome-btn none" onClick={() => addToQueue('none')} disabled={forcedOutcomes.length >= 5}>+ Random</button>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {forcedOutcomes.map((outcome, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>#{idx + 1}</span>
                      <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{outcome}</span>
                      <button onClick={() => removeFromQueue(idx)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                    </div>
                  ))}
                  {forcedOutcomes.length === 0 && <span className="text-muted">Queue khali hai. Agle rounds random honge.</span>}
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
                            </div>
                          ) : '-'}
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
