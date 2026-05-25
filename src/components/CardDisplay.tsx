import React from 'react';
import type { Card } from '../types/game';
import { isRed } from '../types/game';
import './CardDisplay.css';

interface CardDisplayProps {
  card: Card | null;
  side: 'dragon' | 'tiger';
  isRevealing?: boolean;
  isWinner?: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, side, isRevealing, isWinner }) => {
  const red = card ? isRed(card.suit) : false;

  return (
    <div className={`card-slot ${side} ${isWinner ? 'winner' : ''}`} id={`${side}-card-slot`}>
      <div className={`card-label ${side}`}>
        {side === 'dragon' ? '🐉 DRAGON' : '🐯 TIGER'}
      </div>
      <div className={`playing-card ${card ? 'revealed' : 'hidden-back'} ${isRevealing ? 'flipping' : ''} ${isWinner ? 'winner-card' : ''} ${red ? 'red-card' : 'black-card'}`}>
        {card ? (
          <>
            <div className="card-corner top-left">
              <span className="card-rank">{card.rank}</span>
              <span className="card-suit">{card.suit}</span>
            </div>
            <div className="card-center-suit">{card.suit}</div>
            <div className="card-corner bottom-right">
              <span className="card-rank">{card.rank}</span>
              <span className="card-suit">{card.suit}</span>
            </div>
            {isWinner && <div className="winner-shine"></div>}
          </>
        ) : (
          <div className="card-back-design">
            <div className="card-back-pattern">
              {[...Array(9)].map((_, i) => (
                <span key={i} className="back-symbol">♦</span>
              ))}
            </div>
            <div className="card-back-center">🂠</div>
          </div>
        )}
      </div>
      {card && (
        <div className="card-value-label">
          Value: <strong>{card.value}</strong>
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
