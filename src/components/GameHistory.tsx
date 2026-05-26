import React, { useState, useEffect, useMemo } from 'react';
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

const GameHistory: React.FC<GameHistoryProps> = ({ currentRound, rawRoundId, isOpen, onClose }) => {
  const pastRounds = useMemo(() => {
    const rounds: PastRound[] = [];
    // Generate last 50 completed rounds (exclude current round)
    for (let i = 1; i <= 50; i++) {
      const pastRawId = rawRoundId - i;
      if (pastRawId < 0) break;
      const pastRoundId = (pastRawId % 2000) + 1;
      const { dragonCard, tigerCard } = getDeterministicCards(pastRoundId, pastRawId);
      const winner = determineResult(dragonCard, tigerCard);
      rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner });
    }
    return rounds;
  }, [currentRound, rawRoundId]);

  if (!isOpen) return null;

  return (
    <div className="gh-overlay" onClick={onClose}>
      <div className="gh-panel" onClick={(e) => e.stopPropagation()}>
        <div className="gh-header">
          <span className="gh-title">⏱ GAME HISTORY</span>
          <button className="gh-close" onClick={onClose}>✕</button>
        </div>

        <div className="gh-table-header">
          <span className="gh-col-round">Round</span>
          <span className="gh-col-game">Game</span>
          <span className="gh-col-winner">Winner</span>
        </div>

        <div className="gh-list">
          {pastRounds.length === 0 ? (
            <div className="gh-empty">No history available</div>
          ) : (
            pastRounds.map((r, i) => (
              <div key={`${r.round}-${r.rawRoundId}`} className={`gh-row ${i === 0 ? 'gh-latest' : ''}`}>
                <span className="gh-col-round">#{r.round}</span>
                <span className="gh-col-game">Dragon Tiger</span>
                <span className={`gh-col-winner gh-win-${r.winner}`}>
                  {r.winner === 'dragon' ? '🐉 Dragon' : r.winner === 'tiger' ? '🐯 Tiger' : '🤝 Tie'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="gh-footer">
          Showing last {pastRounds.length} rounds
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
