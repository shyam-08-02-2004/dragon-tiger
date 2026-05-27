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
  const [activeTab, setActiveTab] = useState<'game' | 'bets'>(() => (sessionStorage.getItem('dt_historyTab') as 'game' | 'bets') || 'game');
  const [betHistory, setBetHistory] = useState<any[]>([]);

  const handleTabChange = (tab: 'game' | 'bets') => {
    setActiveTab(tab);
    sessionStorage.setItem('dt_historyTab', tab);
  };

  useEffect(() => {
    if (isOpen) {
      fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setServerHistory(data);
        })
        .catch(() => {});
        
      if (username) {
        fetch('/api/users/bet-history/' + username)
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
    // Generate last 100 completed rounds (exclude current round)
    for (let i = 1; i <= 100; i++) {
      const pastRawId = rawRoundId - i;
      if (pastRawId < 0) break;
      const pastRoundId = (pastRawId % 2000) + 1;
      
      const forced = serverHistory.find(h => h.roundId === pastRawId);
      
      if (forced) {
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: forced.result as GameResult });
      } else {
        const { dragonCard, tigerCard } = getDeterministicCards(pastRoundId, pastRawId);
        const winner = determineResult(dragonCard, tigerCard);
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner });
      }
    }
    return rounds;
  }, [currentRound, rawRoundId, serverHistory]);

  // Stats
  const dragonCount = pastRounds.filter(r => r.winner === 'dragon').length;
  const tigerCount = pastRounds.filter(r => r.winner === 'tiger').length;
  const tieCount = pastRounds.filter(r => r.winner === 'tie').length;

  if (!isOpen) return null;

  return (
    <div className="gh-overlay" onClick={onClose}>
      <div className="gh-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="gh-header">
          <div className="gh-header-left">
            <span className="gh-icon">⏱</span>
            <span className="gh-title">HISTORY</span>
          </div>
          <button className="gh-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        {username && (
          <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
            <button 
              onClick={() => handleTabChange('game')}
              style={{ flex: 1, padding: '12px', background: activeTab === 'game' ? '#2c3e50' : 'transparent', color: activeTab === 'game' ? '#f1c40f' : '#aaa', border: 'none', borderBottom: activeTab === 'game' ? '2px solid #f1c40f' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Game History
            </button>
            <button 
              onClick={() => handleTabChange('bets')}
              style={{ flex: 1, padding: '12px', background: activeTab === 'bets' ? '#2c3e50' : 'transparent', color: activeTab === 'bets' ? '#f1c40f' : '#aaa', border: 'none', borderBottom: activeTab === 'bets' ? '2px solid #f1c40f' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              My Bets
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
            <div className="gh-table-header">
              <span className="gh-col-round" style={{ flex: '0 0 60px' }}>Time</span>
              <span className="gh-col-game">Round</span>
              <span className="gh-col-winner" style={{ flex: '0 0 70px', textAlign: 'center' }}>Bet/Win</span>
              <span className="gh-col-winner" style={{ flex: '0 0 60px' }}>Result</span>
            </div>
            <div className="gh-list">
              {betHistory.length === 0 ? (
                <div className="gh-empty">Aaj koi bet nahi lagayi hai.</div>
              ) : (
                betHistory.map(b => (
                  <div key={b._id || Math.random()} className="gh-row" style={{ borderLeftColor: b.winAmount > 0 ? '#2ecc71' : '#e74c3c' }}>
                    <span className="gh-col-round" style={{ flex: '0 0 60px', fontSize: '10px' }}>
                      {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                    <span className="gh-col-game" style={{ fontSize: '12px', color: '#fff' }}>
                      #{b.roundNumber}
                    </span>
                    <span className="gh-col-winner" style={{ flex: '0 0 70px', textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
                      ₹{b.betAmount} / <span style={{ color: '#f1c40f' }}>₹{b.winAmount}</span>
                    </span>
                    <span className="gh-col-winner" style={{ flex: '0 0 60px', color: b.winAmount > 0 ? '#2ecc71' : '#e74c3c' }}>
                      {b.winAmount > 0 ? 'WIN' : 'LOST'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        {activeTab === 'game' && (
          <div className="gh-footer">
            📊 Showing last {pastRounds.length} of 100 rounds
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
