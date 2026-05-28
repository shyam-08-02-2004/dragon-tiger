import React from 'react';
import type { GamePhase, GameResult } from '../types/game';

interface GameControlsProps {
  phase: GamePhase;
  result: GameResult | null;
  timer: number;
  totalBet: number;
  lastWin: number;
  dealerMessage: string;
  onDeal: () => void;
  onNextRound: () => void;
  roundNumber?: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  phase,
  timer,
  roundNumber,
}) => {
  return (
    <div className="game-info-row">
      <div className="round-id-text">Round ID: <span>#{roundNumber || '000000'}</span></div>
      <div className="start-betting-text">
        {phase === 'betting' ? 'Start Betting' : phase === 'dealing' ? 'Dealing Cards...' : 'Round Ended'}
      </div>
      
      <div className="top-right-icons">
        <span style={{cursor: 'pointer'}}>?</span>
        <span style={{cursor: 'pointer'}}>🔊</span>
        <span style={{cursor: 'pointer'}}>⚙️</span>
      </div>

      <div className="timer-container">
        <div className={`timer-circle ${phase === 'betting' && timer <= 5 ? 'active' : ''}`} style={{ borderColor: phase === 'betting' && timer <= 5 ? '#e74c3c' : '' }}>
          <span style={{ color: phase === 'betting' && timer <= 5 ? '#e74c3c' : '#fff' }}>
             {phase === 'betting' ? timer : 0}
          </span>
        </div>
      </div>

      <div className="game-history-btn-small">
        <button>Game History 📈</button>
      </div>
    </div>
  );
};

export default GameControls;
