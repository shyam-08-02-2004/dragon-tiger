import React, { useMemo, useState, useEffect } from 'react';
import { getDeterministicCards } from '../syncEngine';
import { determineResult } from '../types/game';
import type { GameResult } from '../types/game';
import './GameHistory.css';

interface GameHistoryProps {
  currentRound: number;
  rawRoundId: number;
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

interface PastRound {
  round: number;
  rawRoundId: number;
  winner: GameResult;
}

const winnerInfo = (winner: GameResult) => {
  if (winner === 'dragon') return { label: '🐉 Dragon', cls: 'gh-win-dragon', bar: 'gh-bar-dragon' };
  if (winner === 'tiger') return { label: '🐯 Tiger', cls: 'gh-win-tiger', bar: 'gh-bar-tiger' };
  return { label: '🤝 Tie', cls: 'gh-win-tie', bar: 'gh-bar-tie' };
};

const GameHistory: React.FC<GameHistoryProps> = ({ currentRound, rawRoundId, isOpen, onClose, username }) => {
  const [serverHistory, setServerHistory] = useState<any[]>([]);
  const [adminOutcomes, setAdminOutcomes] = useState<{ roundId: number; outcome: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'game' | 'bets'>('game');
  const [betHistory, setBetHistory] = useState<any[]>([]);

  // Re-read tab from sessionStorage every time the modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = sessionStorage.getItem('dt_historyTab') as 'game' | 'bets';
      if (stored) setActiveTab(stored);
    }
  }, [isOpen]);

  const handleTabChange = (tab: 'game' | 'bets') => {
    setActiveTab(tab);
    sessionStorage.setItem('dt_historyTab', tab);
  };

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/history?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setServerHistory(data);
        })
        .catch(() => {});
      // Also fetch admin-set round outcomes so forced results appear in history
      fetch(`/api/admin/round-outcomes?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setAdminOutcomes(data); })
        .catch(() => {});
      if (username) {
        fetch(`/api/users/bet-history/${username}?t=${Date.now()}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setBetHistory(data);
          })
          .catch(() => {});
      }
    }
  }, [isOpen, username]);
  const pastRounds = useMemo(() => {
    const rounds: PastRound[] = [];
    const currentCycleStartRawId = rawRoundId - (currentRound - 1);
    const maxHistory = 100;
    const firstVisibleRawId = Math.max(rawRoundId - maxHistory, currentCycleStartRawId);
    
    for (let pastRawId = rawRoundId - 1; pastRawId >= firstVisibleRawId; pastRawId--) {
      if (pastRawId < 0) break;
      const pastRoundId = (pastRawId % 2000) + 1;
      
      const forced = serverHistory.find(h => h.roundId === pastRawId);

      // If no server-recorded history, fall back to admin-set outcomes (matched by cycle-local round number)
      const adminForced = !forced ? adminOutcomes.find(a => Number(a.roundId) === pastRoundId) : undefined;

      if (forced) {
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: forced.result as GameResult });
      } else if (adminForced) {
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: adminForced.outcome as GameResult });
      } else {
        const { dragonCard, tigerCard } = getDeterministicCards(pastRoundId, pastRawId);
        const winner = determineResult(dragonCard, tigerCard);
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner });
      }
    }
    return rounds;
  }, [currentRound, rawRoundId, serverHistory, adminOutcomes]);

  // Stats
  const dragonCount = pastRounds.filter(r => r.winner === 'dragon').length;
  const tigerCount = pastRounds.filter(r => r.winner === 'tiger').length;
  const tieCount = pastRounds.filter(r => r.winner === 'tie').length;

  if (!isOpen) return null;

  return (
    <div className="gh-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="gh-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="gh-header">
          <div className="gh-header-left">
            <span className="gh-icon">⏱</span>
            <div>
              <span className="gh-title">HISTORY</span>
              <span className="gh-subtitle">Recent 100 rounds</span>
            </div>
          </div>
          <button className="gh-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        {username && (
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(212,160,23,0.2)', background: 'linear-gradient(180deg, rgba(25,25,30,0.95), rgba(15,15,20,0.95))' }}>
            <button 
              onClick={() => handleTabChange('game')}
              style={{ flex: 1, padding: '14px', background: activeTab === 'game' ? 'rgba(212,160,23,0.12)' : 'transparent', color: activeTab === 'game' ? '#ffd700' : '#666', border: 'none', borderBottom: activeTab === 'game' ? '3px solid #ffd700' : '3px solid transparent', fontWeight: '800', cursor: 'pointer', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' as const, transition: 'all 0.25s ease', textShadow: activeTab === 'game' ? '0 0 12px rgba(212,160,23,0.5)' : 'none' }}
            >
              📜 Game History
            </button>
            <button 
              onClick={() => handleTabChange('bets')}
              style={{ flex: 1, padding: '14px', background: activeTab === 'bets' ? 'rgba(212,160,23,0.12)' : 'transparent', color: activeTab === 'bets' ? '#ffd700' : '#666', border: 'none', borderBottom: activeTab === 'bets' ? '3px solid #ffd700' : '3px solid transparent', fontWeight: '800', cursor: 'pointer', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' as const, transition: 'all 0.25s ease', textShadow: activeTab === 'bets' ? '0 0 12px rgba(212,160,23,0.5)' : 'none' }}
            >
              💰 My Bets
            </button>
          </div>
        )}

        {activeTab === 'game' ? (
          <>
            {/* Stats Bar */}
            <div className="gh-stats">
              <div className="gh-stat gh-stat-dragon">
                <span className="gh-stat-icon">🐉</span>
                <span className="gh-stat-num">{dragonCount}</span>
                <span className="gh-stat-lbl">Dragon</span>
              </div>
              <div className="gh-stat gh-stat-tie">
                <span className="gh-stat-icon">🤝</span>
                <span className="gh-stat-num">{tieCount}</span>
                <span className="gh-stat-lbl">Tie</span>
              </div>
              <div className="gh-stat gh-stat-tiger">
                <span className="gh-stat-icon">🐯</span>
                <span className="gh-stat-num">{tigerCount}</span>
                <span className="gh-stat-lbl">Tiger</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="gh-table-header">
              <span className="gh-col-round">Round</span>
              <span className="gh-col-game" style={{ textAlign: 'center' }}>Time</span>
              <span className="gh-col-winner">Winner</span>
            </div>

            {/* List */}
            <div className="gh-list">
              {pastRounds.length === 0 ? (
                <div className="gh-empty">No history available</div>
              ) : (
                pastRounds.map((r, i) => {
                  const { label, cls, bar } = winnerInfo(r.winner);
                  const roundTime = new Date(r.rawRoundId * 20000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                  return (
                    <div key={`${r.round}-${r.rawRoundId}`} className={`gh-row ${bar} ${i === 0 ? 'gh-latest' : ''}`}>
                      <span className="gh-col-round">#{r.round}</span>
                      <span className="gh-col-game" style={{ textAlign: 'center', fontSize: '11px', color: '#999' }}>{roundTime}</span>
                      <span className={`gh-col-winner ${cls}`}>{label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            {/* My Bets Summary */}
            {betHistory.length > 0 && (
              <div className="gh-stats">
                <div className="gh-stat" style={{ borderColor: 'rgba(46,204,113,0.4)', background: 'linear-gradient(180deg, rgba(46,204,113,0.12), rgba(46,204,113,0.02))' }}>
                  <span className="gh-stat-icon">🏆</span>
                  <span className="gh-stat-num" style={{ color: '#2ecc71' }}>{betHistory.filter(b => b.winAmount > 0).length}</span>
                  <span className="gh-stat-lbl">Wins</span>
                </div>
                <div className="gh-stat" style={{ borderColor: 'rgba(231,76,60,0.4)', background: 'linear-gradient(180deg, rgba(231,76,60,0.12), rgba(231,76,60,0.02))' }}>
                  <span className="gh-stat-icon">💔</span>
                  <span className="gh-stat-num" style={{ color: '#e74c3c' }}>{betHistory.filter(b => b.winAmount <= 0).length}</span>
                  <span className="gh-stat-lbl">Losses</span>
                </div>
                <div className="gh-stat" style={{ borderColor: 'rgba(241,196,15,0.4)', background: 'linear-gradient(180deg, rgba(241,196,15,0.12), rgba(241,196,15,0.02))' }}>
                  <span className="gh-stat-icon">💰</span>
                  <span className="gh-stat-num" style={{ color: '#f1c40f' }}>₹{betHistory.reduce((sum, b) => sum + (b.winAmount || 0), 0)}</span>
                  <span className="gh-stat-lbl">Total Won</span>
                </div>
              </div>
            )}

            <div className="gh-table-header">
              <span style={{ flex: '0 0 60px' }}>Time</span>
              <span style={{ flex: 1 }}>Round</span>
              <span style={{ flex: '0 0 70px', textAlign: 'center' }}>Bet On</span>
              <span style={{ flex: '0 0 80px', textAlign: 'center' }}>Bet / Win</span>
              <span style={{ flex: '0 0 55px', textAlign: 'right' }}>Status</span>
            </div>
            <div className="gh-list">
              {betHistory.length === 0 ? (
                <div className="gh-empty">No bets in the last 24 hours.</div>
              ) : (
                betHistory.map(b => {
                  const isWin = b.winAmount > 0;
                  return (
                    <div key={b._id || Math.random()} className={`gh-row ${isWin ? 'gh-bar-tie' : 'gh-bar-dragon'}`}>
                      <span style={{ flex: '0 0 60px', fontFamily: 'var(--font-tech)', fontSize: '11px', color: '#aaa' }}>
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      <span style={{ flex: 1, fontFamily: 'var(--font-tech)', fontSize: '13px', color: '#fff', fontWeight: 700 }}>
                        #{b.roundNumber}
                      </span>
                      <span style={{ flex: '0 0 70px', textAlign: 'center', fontSize: '12px', color: '#7ec8e3', fontWeight: 600 }}>
                        {b.betSide || '-'}
                      </span>
                      <span style={{ flex: '0 0 80px', textAlign: 'center', fontSize: '11px' }}>
                        <span style={{ color: '#aaa' }}>₹{b.betAmount}</span>
                        <span style={{ color: '#555', margin: '0 2px' }}>/</span>
                        <span style={{ color: isWin ? '#2ecc71' : '#e74c3c', fontWeight: 700 }}>₹{b.winAmount}</span>
                      </span>
                      <span style={{ flex: '0 0 55px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: isWin ? '#2ecc71' : '#e74c3c', textShadow: isWin ? '0 0 8px rgba(46,204,113,0.5)' : '0 0 8px rgba(231,76,60,0.5)' }}>
                        {isWin ? '✅ WIN' : '❌ LOST'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer */}
        {activeTab === 'game' && (
          <div className="gh-footer">
            📊 Showing last {pastRounds.length} {pastRounds.length === 1 ? 'round' : 'rounds'} of the most recent 100
          </div>
        )}
        {activeTab === 'bets' && betHistory.length > 0 && (
          <div className="gh-footer">
            💰 Showing {betHistory.length} bet{betHistory.length !== 1 ? 's' : ''} from the last 24 hours
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
