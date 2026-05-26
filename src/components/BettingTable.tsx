import React from 'react';
import type { BetType, GamePhase } from '../types/game';
import { BET_PAYOUTS } from '../types/game';
import './BettingTable.css';

interface BettingTableProps {
  bets: Partial<Record<BetType, number>>;
  onBet: (type: BetType) => void;
  phase: GamePhase;
  selectedChip: number;
}

const BettingTable: React.FC<BettingTableProps> = ({ bets, onBet, phase, selectedChip }) => {
  const canBet = phase === 'betting';

  const renderBetZone = (type: BetType, label: string, sublabel?: string, className?: string) => {
    const amount = bets[type] || 0;
    const payout = BET_PAYOUTS[type];
    const payoutStr = payout >= 1 ? `${payout}:1` : `${payout * 2}:2`;

    return (
      <button
        id={`bet-${type}`}
        className={`bet-zone ${className || ''} ${amount > 0 ? 'has-bet' : ''} ${!canBet ? 'disabled' : ''}`}
        onClick={() => canBet && onBet(type)}
        disabled={!canBet}
      >
        <span className="bet-label">{label}</span>
        {sublabel && <span className="bet-sublabel">{sublabel}</span>}
        <span className="bet-payout">{payoutStr}</span>
        {amount > 0 && (
          <div className="bet-chip-stack">
            <div className="bet-amount-badge">₹{amount}</div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="betting-table" id="betting-table">
      <div className="table-felt">
        {/* Main bets row */}
        <div className="main-bets-row">
          {renderBetZone('dragon', '🐉 DRAGON', undefined, 'dragon-zone')}
          <div className="center-bets">
            {renderBetZone('tie', 'TIE', undefined, 'tie-zone')}

          </div>
          {renderBetZone('tiger', '🐯 TIGER', undefined, 'tiger-zone')}
        </div>



        {!canBet && (
          <div className="betting-overlay">
            <span>{phase === 'dealing' ? '🃏 Dealing Cards...' : phase === 'result' ? '⏳ Round Ended' : '🎰 Get Ready!'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingTable;
