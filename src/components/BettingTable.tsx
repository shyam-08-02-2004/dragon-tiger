import React from 'react';
import type { BetType, GamePhase } from '../types/game';

interface BettingTableProps {
  bets: Partial<Record<BetType, number>>;
  onBet: (type: BetType) => void;
  phase: GamePhase;
  selectedChip: number;
}

const BettingTable: React.FC<BettingTableProps> = ({ bets, onBet, phase }) => {
  const canBet = phase === 'betting';

  const renderBetBox = (type: BetType, label: string, payout: string, className: string) => {
    const amount = bets[type] || 0;
    
    return (
      <div 
        className={`bet-box ${className} ${!canBet ? 'disabled' : ''} ${amount > 0 ? 'has-bet' : ''}`}
        onClick={() => canBet && onBet(type)}
      >
        <div className="bet-title">{label}</div>
        <div className="bet-payout">{payout}</div>
        {amount > 0 && (
          <div className="placed-chips">
            <span className="placed-chips-val">₹{amount}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="betting-areas">
      {renderBetBox('dragon', 'DRAGON', '1:1', 'dragon')}
      {renderBetBox('tie', 'TIE', '1:8', 'tie')}
      {renderBetBox('tiger', 'TIGER', '1:1', 'tiger')}
    </div>
  );
};

export default BettingTable;
