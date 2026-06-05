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
    const maxHistory = 100;
    const firstVisibleRawId = Math.max(rawRoundId - maxHistory, 0);

    // Build lookup maps for O(1) access
    const serverMap = new Map<number, string>();
    for (const h of serverHistory) {
      serverMap.set(Number(h.roundId), h.result);
    }
    const adminMap = new Map<number, string>();
    for (const a of adminOutcomes) {
      adminMap.set(Number(a.roundId), a.outcome);
    }
    
    for (let pastRawId = rawRoundId - 1; pastRawId >= firstVisibleRawId; pastRawId--) {
      if (pastRawId < 0) break;
      const pastRoundId = (pastRawId % 2000) + 1;
      
      // 1. Server history is the source of truth (has actual played result)
      const serverResult = serverMap.get(pastRawId);
      if (serverResult) {
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: serverResult as GameResult });
        continue;
      }

      // 2. Check admin-set outcome (matched by cycle-local round number)
      const adminOutcome = adminMap.get(pastRoundId);
      if (adminOutcome && adminOutcome !== 'none') {
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: adminOutcome as GameResult });
        continue;
      }

      // 3. Fallback: deterministic cards
      const { dragonCard, tigerCard } = getDeterministicCards(pastRoundId, pastRawId);
      const winner = determineResult(dragonCard, tigerCard);
      rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner });
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
          <div className="gh-tabs">
            <button
              className={`gh-tab-btn ${activeTab === 'game' ? 'active' : ''}`}
              onClick={() => handleTabChange('game')}
            >
              📜 Game History
            </button>
            <button
              className={`gh-tab-btn ${activeTab === 'bets' ? 'active' : ''}`}
              onClick={() => handleTabChange('bets')}
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
            <div className="gh-table-header" style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2 }}>
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
                    <div key={`${r.round}-${r.rawRoundId}`} className={`gh-row ${bar} ${i === 0 ? 'gh-latest' : ''}`} style={{ animation: 'ghRowFadeIn 0.3s ease forwards', animationDelay: `${i * 0.05}s` }}>
                      <span className="gh-col-round">#{String(r.round).padStart(3, '0')}</span>
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

            <div className="gh-table-header gh-bets-header">
              <span className="gh-bet-col-time">Time</span>
              <span className="gh-bet-col-round">Round</span>
              <span className="gh-bet-col-side">Bet On</span>
              <span className="gh-bet-col-amount">Bet / Win</span>
              <span className="gh-bet-col-status">Status</span>
            </div>
            <div className="gh-list">
              {betHistory.length === 0 ? (
                <div className="gh-empty">No bets in the last 24 hours.</div>
              ) : (
                betHistory.map(b => {
                  const isWin = b.winAmount > 0;
                  return (
                    <div key={b._id || Math.random()} className={`gh-row gh-bet-row ${isWin ? 'gh-bar-tie' : 'gh-bar-dragon'}`}>
                      <span className="gh-bet-col-time">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      <span className="gh-bet-col-round">
                        #{b.roundNumber}
                      </span>
                      <span className="gh-bet-col-side">
                        {b.betSide || '-'}
                      </span>
                      <span className="gh-bet-col-amount">
                        <span style={{ color: '#aaa' }}>₹{b.betAmount}</span>
                        <span style={{ color: '#555', margin: '0 2px' }}>/</span>
                        <span style={{ color: isWin ? '#2ecc71' : '#e74c3c', fontWeight: 700 }}>₹{b.winAmount}</span>
                      </span>
                      <span className={`gh-bet-col-status ${isWin ? 'gh-status-win' : 'gh-status-lost'}`}>
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
