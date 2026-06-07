import React from 'react';
import type { GamePhase } from '../types/game';
import './GameControls.css';

interface GameControlsProps {
  phase: GamePhase;
  timer: number;
  onUndo?: () => void;
  onRepeat?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  phase,
  timer,
  onUndo,
  onRepeat,
}) => {
  const canBet = phase === 'betting';

  return (
    <div className="premium-controls-wrapper">
      <button className="pc-side-btn" onClick={onUndo} disabled={!canBet}>
        <span className="pc-side-icon">↩</span>
        <span>UNDO</span>
      </button>

      <div className="pc-center-btn">
        <div className={`pc-center-inner ${!canBet ? 'disabled' : ''}`}>
          {phase === 'betting' ? (
              <span>PLACE YOUR BET</span>
          ) : phase === 'dealing' ? (
            <span>DEALING...</span>
          ) : (
            <span>ROUND ENDED</span>
          )}
        </div>
      </div>

      <button className="pc-side-btn" onClick={onRepeat} disabled={!canBet}>
        <span className="pc-side-icon">↻</span>
        <span>REPEAT</span>
      </button>
    </div>
  );
};

export default GameControls;
