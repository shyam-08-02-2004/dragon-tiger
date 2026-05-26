import React, { useMemo } from 'react';
import { getDeterministicCards } from '../syncEngine';
import { determineResult } from '../types/game';
import type { GameResult } from '../types/game';
import './GameHistory.css';

interface GameHistoryProps {
  currentRound: number;
  rawRoundId: number;
  isOpen: boolean;
  onClose: () => void;
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

const GameHistory: React.FC<GameHistoryProps> = ({ currentRound, rawRoundId, isOpen, onClose }) => {
  const pastRounds = useMemo(() => {
    const rounds: PastRound[] = [];
    // Generate last 100 completed rounds (exclude current round)
    for (let i = 1; i <= 100; i++) {
      const pastRawId = rawRoundId - i;
      if (pastRawId < 0) break;
      const pastRoundId = (pastRawId % 2000) + 1;
      const { dragonCard, tigerCard } = getDeterministicCards(pastRoundId, pastRawId);
      const winner = determineResult(dragonCard, tigerCard);
      rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner });
    }
    return rounds;
  }, [currentRound, rawRoundId]);

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
            <span className="gh-title">GAME HISTORY</span>
          </div>
          <button className="gh-close" onClick={onClose}>✕</button>
        </div>

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
          <span className="gh-col-game">Game</span>
          <span className="gh-col-winner">Winner</span>
        </div>

        {/* List */}
        <div className="gh-list">
          {pastRounds.length === 0 ? (
            <div className="gh-empty">No history available</div>
          ) : (
            pastRounds.map((r, i) => {
              const { label, cls, bar } = winnerInfo(r.winner);
              return (
                <div key={`${r.round}-${r.rawRoundId}`} className={`gh-row ${bar} ${i === 0 ? 'gh-latest' : ''}`}>
                  <span className="gh-col-round">#{r.round}</span>
                  <span className="gh-col-game">Dragon Tiger</span>
                  <span className={`gh-col-winner ${cls}`}>{label}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="gh-footer">
          📊 Showing last {pastRounds.length} of 100 rounds
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
