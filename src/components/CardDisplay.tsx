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
              <div className="card-rank">{card.rank}</div>
              <div className="card-small-suit">{card.suit}</div>
            </div>
            <div className="card-center-suit">{card.suit}</div>
            <div className="card-corner bottom-right">
              <div className="card-rank">{card.rank}</div>
              <div className="card-small-suit">{card.suit}</div>
            </div>
          </>
        ) : (
          <div className="card-back-design" style={{backgroundImage: 'url("./assets/luxury_card_back.png")'}}>
          </div>
        )}
      </div>
      {card && (
        <div className={`card-value-label ${side}`}>
          Value: {card.value}
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
