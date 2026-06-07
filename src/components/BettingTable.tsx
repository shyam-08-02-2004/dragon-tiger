import React from 'react';
import type { BetType, GamePhase } from '../types/game';
import './BettingTable.css';

interface BettingTableProps {
  bets: Partial<Record<BetType, number>>;
  onBet: (type: BetType) => void;
  phase: GamePhase;
  selectedChip: number;
}

const BettingTable: React.FC<BettingTableProps> = ({ bets, onBet, phase }) => {
  const canBet = phase === 'betting';

  // Prevent double-taps on mobile
  const lastBetTime = React.useRef(0);

  const handleBetClick = (type: BetType) => {
    if (!canBet) return;
    const now = Date.now();
    if (now - lastBetTime.current < 200) return; // 200ms debounce
    lastBetTime.current = now;
    onBet(type);
  };

  const renderBetBox = (type: BetType, label: string, payout: string, className: string, icon: string) => {
    const amount = bets[type] || 0;
    
    return (
      <div 
        className={`premium-bet-box ${className} ${!canBet ? 'disabled' : ''} ${amount > 0 ? 'has-bet' : ''}`}
        onClick={() => handleBetClick(type)}
      >
        <div className="pbb-icon">{icon}</div>
        <div className="pbb-title">{label}</div>
        <div className="pbb-payout">{payout}</div>
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
        <div className="pt-top-tie">TIE</div>
        
        <div className="pt-betting-areas">
          {renderBetBox('dragon', 'DRAGON', '1:1', 'pt-dragon', '🐉')}
          {renderBetBox('tie', 'TIE', '8:1', 'pt-tie', '⚔️')}
          {renderBetBox('tiger', 'TIGER', '1:1', 'pt-tiger', '🐯')}
        </div>
      </div>
    </div>
  );
};

export default BettingTable;
