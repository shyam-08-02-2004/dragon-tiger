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

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Expected array of users, got:", data);
        }
      })
      .catch(console.error);
      
    fetch('/api/admin/transactions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        }
      })
      .catch(e => {
        console.error(e);
        const freshTxsStr = localStorage.getItem('dragonTigerTransactions') || '[]';
        setTransactions(JSON.parse(freshTxsStr));
      });
  }, []);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'game' | 'transactions'>('users');
  const [forcedOutcomes, setForcedOutcomes] = useState<string[]>([]);
  const [simPhase, setSimPhase] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [simTimer, setSimTimer] = useState<number>(15);
  const [simDragonCard, setSimDragonCard] = useState<Card | null>(null);
  const [simTigerCard, setSimTigerCard] = useState<Card | null>(null);
  const [simResult, setSimResult] = useState<GameResult | null>(null);
  const simTimerRef = useRef<any | null>(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState<string | null>(null);
  const [editBalanceUser, setEditBalanceUser] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<string>('');
  const [liveBets, setLiveBets] = useState<{ dragon: number; tiger: number; tie: number }>({ dragon: 0, tiger: 0, tie: 0 });

  
  
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


  useEffect(() => {
    if (activeTab !== 'game') {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      return;
    }

    simTimerRef.current = setInterval(() => {
      const global = getGlobalGameState();
      
      setSimPhase(prevPhase => {
        // Start of new round
        if (global.phase === 'betting' && prevPhase !== 'betting') {
          setSimTimer(global.timer);
          setSimDragonCard(null);
          setSimTigerCard(null);
          setSimResult(null);
          return 'betting';
        }
        
        // Update timer
        if (global.phase === 'betting') {
          setSimTimer(global.timer);
          return 'betting';
        }
        
        // Transition to dealing
        if (global.phase === 'dealing' && prevPhase === 'betting') {
          setTimeout(() => {
             const { dragonCard, tigerCard } = getDeterministicCards(global.roundId);
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
  }, [activeTab]);

  const handleUpdateBalance = async (id: string) => {
    const amount = parseFloat(newBalance);
    if (isNaN(amount) || amount < 0) {
      alert("Invalid balance amount");
      return;
    }
    
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
    } catch (err) {
      console.error(err);
    }
  };

  
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter((u: any) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };


  const handleTransactionAction = async (txId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Refetch users and transactions
        fetch('/api/admin/users').then(r => r.json()).then(data => {
          if (Array.isArray(data)) setUsers(data);
        });
        fetch('/api/admin/transactions').then(r => r.json()).then(data => {
          if (Array.isArray(data)) setTransactions(data);
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process transaction");
      }
    } catch(e) { console.error(e); }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-logo">🛡️</span>
          <h2>CASINO ADMIN</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button 
            className={`nav-btn ${activeTab === 'game' ? 'active' : ''}`}
            onClick={() => setActiveTab('game')}
          >
            🎮 Game Control
          </button>
          <button 
            className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            💸 Transactions
          </button>
        </nav>

        <button className="admin-logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'users' ? 'User Management' : activeTab === 'game' ? 'Game Control Room' : 'Transactions'}</h1>
          <div className="admin-badge">Admin Privileges Active</div>
        </header>

        <div className="admin-content">
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
                      if (user.id === 'babu') return null; // Hide admin account
                      return (
                        <tr key={user.id}>
                          <td className="fw-bold">{user.id}</td>
                          <td>{user.username}</td>
                          <td>
                            <span className="password-mask">{user.password}</span>
                          </td>
                          <td>
                            {editBalanceUser === user.id ? (
                              <div className="edit-balance-group">
                                <span className="currency-symbol">₹</span>
                                <input 
                                  type="number" 
                                  value={newBalance} 
                                  onChange={(e) => setNewBalance(e.target.value)}
                                  className="balance-input"
                                  autoFocus
                                />
                                <button className="save-btn" onClick={() => handleUpdateBalance(user.id)}>✓</button>
                                <button className="cancel-btn" onClick={() => setEditBalanceUser(null)}>✕</button>
                              </div>
                            ) : (
                              <span className="balance-display gold">
                                ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ color: user.hasDeposited ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                              {user.hasDeposited ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn edit" 
                                onClick={() => {
                                  setEditBalanceUser(user.id);
                                  setNewBalance(user.balance.toString());
                                }}
                                title="Edit Balance"
                              >
                                💰
                              </button>
                              <button 
                                className="action-btn" 
                                onClick={() => setSelectedUserHistory(user.id)}
                                title="View History"
                                style={{ background: '#3498db' }}
                              >
                                📜
                              </button>
                              <button 
                                className="action-btn delete" 
                                onClick={() => handleDeleteUser(user.id)}
                                title="Delete User"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {users.filter((u: any) => u.id !== 'babu').length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">No registered players yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

              </div>
            </div>
          )}

          {activeTab === 'game' && (
            <div className="admin-grid">
              <div className="admin-card">
                <h3>Live Betting Stats</h3>
                <p className="text-muted">Real-time total bets placed by all users for the current round.</p>
                
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '30px' }}>
                  <div style={{ flex: 1, background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ color: '#e74c3c', margin: '0 0 10px 0' }}>DRAGON</h4>
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{liveBets.dragon}</span>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(52, 152, 219, 0.1)', border: '1px solid #3498db', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ color: '#3498db', margin: '0 0 10px 0' }}>TIGER</h4>
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{liveBets.tiger}</span>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(39, 174, 96, 0.1)', border: '1px solid #27ae60', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ color: '#27ae60', margin: '0 0 10px 0' }}>TIE</h4>
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{liveBets.tie}</span>
                  </div>
                </div>

                <h3>Next 5 Rounds Control</h3>
                <p className="text-muted">Pre-set outcomes for the next 5 rounds globally.</p>
                
                <div className="outcome-selector">
                  <button className="outcome-btn dragon" onClick={() => addToQueue('dragon')} disabled={forcedOutcomes.length >= 5}>+ Dragon</button>
                  <button className="outcome-btn tiger" onClick={() => addToQueue('tiger')} disabled={forcedOutcomes.length >= 5}>+ Tiger</button>
                  <button className="outcome-btn tie" onClick={() => addToQueue('tie')} disabled={forcedOutcomes.length >= 5}>+ Tie</button>
                  <button className="outcome-btn none" onClick={() => addToQueue('none')} disabled={forcedOutcomes.length >= 5}>+ Random</button>
                </div>
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {forcedOutcomes.map((outcome, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{textTransform: 'capitalize'}}>{outcome}</span>
                      <button onClick={() => removeFromQueue(idx)} style={{background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</button>
                    </div>
                  ))}
                  {forcedOutcomes.length === 0 && <span className="text-muted">Queue is empty. Next round will be random.</span>}
                </div>

                <div className="alert-box warning" style={{marginTop: '20px'}}>
                  <strong>Live Game Simulation:</strong>
                  <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', marginTop: '20px', minHeight: '300px' }}>
                    
    <div className="table-area" style={{ pointerEvents: 'none' }}>
      <div className="cards-arena" id="cards-arena">
        <CardDisplay
          card={simDragonCard}
          side="dragon"
          isRevealing={simPhase === 'dealing'}
          isWinner={simResult === 'dragon'}
        />

        <div className="vs-divider" id="vs-divider">
          <div className="vs-line" />
          <div className="vs-badge">VS</div>
          <div className="vs-line" />
          {(simResult === 'tie' || simResult === 'suited-tie') && simPhase === 'result' && (
            <div className="tie-indicator">TIE</div>
          )}
        </div>

        <CardDisplay
          card={simTigerCard}
          side="tiger"
          isRevealing={simPhase === 'dealing'}
          isWinner={simResult === 'tiger'}
        />
      </div>
      <div style={{textAlign: 'center', marginTop: '20px', fontSize: '20px', color: 'gold'}}>
        {simPhase === 'betting' ? `Place your bets! (${simTimer}s)` : simPhase === 'dealing' ? 'No more bets!' : 'Round Over'}
      </div>
    </div>
    
                  </div>
                </div>

                <div className="alert-box warning">
                  <strong>Warning:</strong> Forcing an outcome overrides standard probability and guarantees a win for the selected side.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="admin-card">
              <h3>Pending Transactions</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>UTR / UPI</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice().reverse().map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="fw-bold">{tx.username}</td>
                        <td className={tx.type === 'deposit' ? 'green' : 'gold'}>
                          {tx.type.toUpperCase()}
                        </td>
                        <td className="gold">₹{tx.amount}</td>
                        <td style={{fontSize:'12px',maxWidth:'120px',wordBreak:'break-all'}}>
                          {tx.utr && <span style={{color:'#aaa'}}>UTR: {tx.utr}</span>}
                          {tx.upiId && <span style={{color:'#7ec8e3'}}>UPI: {tx.upiId}</span>}
                          {!tx.utr && !tx.upiId && '-'}
                        </td>
                        <td>
                          <span className={`status-badge ${tx.status}`}>
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {tx.status === 'pending' ? (
                            <div className="action-buttons">
                              <button className="action-btn edit" title="Approve" onClick={() => handleTransactionAction(tx.id, 'approve')}>✅</button>
                              <button className="action-btn delete" title="Reject" onClick={() => handleTransactionAction(tx.id, 'reject')}>❌</button>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted">No transactions found.</td>
                      </tr>
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
