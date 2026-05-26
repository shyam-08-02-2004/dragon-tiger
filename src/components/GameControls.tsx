import React from 'react';
import type { GamePhase, GameResult } from '../types/game';
import './GameControls.css';

interface GameControlsProps {
  phase: GamePhase;
  result: GameResult;
  timer: number;
  totalBet: number;
  lastWin: number;
  dealerMessage: string;
  onDeal: () => void;
  onNextRound: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  phase,
  result,
  timer,
  totalBet,
  lastWin,
  dealerMessage,
  onDeal,
  onNextRound,
}) => {
  const timerPercent = (timer / 15) * 100;
  const timerColor = timer <= 5 ? '#e74c3c' : timer <= 10 ? '#f39c12' : '#27ae60';

  const getResultBanner = () => {
    if (phase !== 'result') return null;
    if (result === 'dragon') return { text: '🐉 DRAGON WINS!', cls: 'banner-dragon' };
    if (result === 'tiger') return { text: '🐯 TIGER WINS!', cls: 'banner-tiger' };
    if (result === 'tie') return { text: '🤝 TIE!', cls: 'banner-tie' };
    return null;
  };

  const banner = getResultBanner();

  return (
    <div className="game-controls" id="game-controls">
      {/* Dealer Message */}
      <div className="dealer-message" id="dealer-message">
        <div className="dealer-avatar">🎴</div>
        <div className="dealer-text">{dealerMessage}</div>
      </div>

      {/* Result Banner */}
      {banner && (
        <div className={`result-banner ${banner.cls}`} id="result-banner">
          <span className="banner-text">{banner.text}</span>
          {lastWin > 0 && (
            <span className="win-amount">+₹{lastWin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          )}
        </div>
      )}

      {/* Timer Bar */}
      {phase === 'betting' && (
        <div className="timer-section" id="timer-section">
          <div className="timer-label">
            <span>PLACE YOUR BETS</span>
            <span className="timer-count" style={{ color: timerColor, animation: timer <= 5 ? 'timerPulse 0.5s infinite' : 'none' }}>
              {timer}s
            </span>
          </div>
          <div className="timer-bar-bg">
            <div
              className="timer-bar-fill"
              style={{
                width: `${timerPercent}%`,
                background: `linear-gradient(90deg, ${timerColor}aa, ${timerColor})`,
                boxShadow: `0 0 10px ${timerColor}88`,
              }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="action-section">
        {phase === 'dealing' && (
          <div className="dealing-indicator" id="dealing-indicator">
            <div className="card-spinner">
              {['♠', '♥', '♦', '♣'].map((s, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.15}s` }}>{s}</span>
              ))}
            </div>
            <span>Dealing cards...</span>
          </div>
        )}
        {phase === 'idle' && (
          <div className="idle-indicator">
            <span className="idle-dot" />
            <span>Waiting for new round...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameControls;
