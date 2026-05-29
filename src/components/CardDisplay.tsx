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
            {/* Rank in top-left corner */}
            <div
              className="card-rank"
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                zIndex: 4,
              }}
            >
              {card.rank}
            </div>
            {/* Central suit */}
            <div className="card-center-suit">{card.suit}</div>
          </>
        ) : (
          <div className="card-back-design">
            <div className="card-back-center">🂠</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDisplay;
