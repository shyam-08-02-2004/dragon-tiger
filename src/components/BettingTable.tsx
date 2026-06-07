import React from 'react';
import type { BetType, GamePhase } from '../types/game';
import './BettingTable.css';

import dragonOutline from '../assets/dragon_outline.png';
import tigerOutline from '../assets/tiger_outline.png';

interface BettingTableProps {
  bets: Partial<Record<BetType, number>>;
  onBet: (type: BetType) => void;
  phase: GamePhase;
  selectedChip: number;
}

const BettingTable: React.FC<BettingTableProps> = ({ bets, onBet, phase }) => {
  const canBet = phase === 'betting';
  const lastBetTime = React.useRef(0);

  const handleBetClick = (type: BetType) => {
    if (!canBet) return;
    const now = Date.now();
    if (now - lastBetTime.current < 200) return; 
    lastBetTime.current = now;
    onBet(type);
  };

  const renderBetBox = (type: BetType, label: string, payout: string, className: string, imgSrc?: string, textOnly?: boolean) => {
    const amount = bets[type] || 0;
    
    return (
      <div 
        className={`premium-bet-box ${className} ${!canBet ? 'disabled' : ''} ${amount > 0 ? 'has-bet' : ''}`}
        onClick={() => handleBetClick(type)}
      >
        {imgSrc && (
          <div className="pbb-img-wrapper">
            <img src={imgSrc} alt={label} className="pbb-img" />
          </div>
        )}
        <div className="pbb-content">
          <div className="pbb-title">{label}</div>
          <div className="pbb-payout">{payout}</div>
        </div>
        {amount > 0 && (
          <div className="pbb-chips">
            <div className="pbb-chips-inner">
              <span className="pbb-chips-val">{amount >= 1000 ? (amount/1000).toFixed(1) + 'K' : amount}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="premium-table-wrapper">
      <div className="premium-table-surface">
        <div className="pt-top-text">
          <span className="pt-text-dragon">DRAGON</span>
          <span className="pt-text-diamond">❖</span>
          <span className="pt-text-tiger">TIGER</span>
        </div>
        
        <div className="pt-betting-layout">
          {renderBetBox('dragon', 'DRAGON', '1:1', 'pt-dragon', dragonOutline)}
          
          <div className="pt-center-column">
            {renderBetBox('tie', 'TIE', '8:1', 'pt-tie', undefined, true)}
          </div>
          
          {renderBetBox('tiger', 'TIGER', '1:1', 'pt-tiger', tigerOutline)}
        </div>
      </div>
    </div>
  );
};

export default BettingTable;
