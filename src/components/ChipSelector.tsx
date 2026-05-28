import React from 'react';
import type { ChipValue } from '../types/game';

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
  onClearBets: () => void;
  onDoubleBet: () => void;
  totalBet: number;
  phase: string;
}

const CHIP_LIST = [
  { value: 10, label: '10', classStr: 'chip-10' },
  { value: 50, label: '50', classStr: 'chip-50' },
  { value: 100, label: '100', classStr: 'chip-100' },
  { value: 500, label: '500', classStr: 'chip-500' },
  { value: 1000, label: '1000', classStr: 'chip-1000' },
  { value: 2000, label: '2K', classStr: 'chip-2k' },
];

const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedChip,
  onSelectChip,
  onClearBets,
  totalBet,
  phase,
}) => {
  const canBet = phase === 'betting';

  return (
    <>
      <div className="chips-container">
        {CHIP_LIST.map(chip => (
          <div
            key={chip.value}
            className={`chip-item ${chip.classStr} ${selectedChip === chip.value ? 'selected' : ''} ${!canBet ? 'disabled' : ''}`}
            onClick={() => canBet && onSelectChip(chip.value)}
          >
            {chip.label}
          </div>
        ))}
      </div>

      <div className="bottom-actions">
        <button 
          className={`action-btn btn-clear ${(!canBet || totalBet === 0) ? 'btn-disabled' : ''}`}
          onClick={onClearBets}
          disabled={!canBet || totalBet === 0}
        >
          Clear
        </button>
        
        <div className="total-bet-display">
          <span className="tb-label">Total Bet</span>
          <span className="tb-amount">₹ {totalBet}</span>
        </div>

        <button 
          className={`action-btn btn-confirm ${(!canBet || totalBet === 0) ? 'btn-disabled' : ''}`}
          disabled={!canBet || totalBet === 0}
        >
          Confirm Bet
        </button>
      </div>
    </>
  );
};

export default ChipSelector;
