import React from 'react';
import type { ChipValue } from '../types/game';
import { CHIP_VALUES } from '../types/game';
import './ChipSelector.css';

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
  onClearBets: () => void;
  onDoubleBet: () => void;
  totalBet: number;
  phase: string;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedChip,
  onSelectChip,
  onClearBets,
  onDoubleBet,
  totalBet,
  phase,
}) => {
  const canBet = phase === 'betting';

  return (
    <div className="chip-selector" id="chip-selector">
      <div className="chip-row">
        {CHIP_VALUES.map((chip: ChipValue) => (
          <button
            key={chip.value}
            id={`chip-${chip.value}`}
            className={`chip ${selectedChip === chip.value ? 'selected' : ''} ${!canBet ? 'chip-disabled' : ''}`}
            onClick={() => canBet && onSelectChip(chip.value)}
            disabled={!canBet}
            style={{
              '--chip-color': chip.color,
              '--chip-border': chip.borderColor,
              '--chip-text': chip.textColor,
            } as React.CSSProperties}
          >
            <span className="chip-value">{chip.label}</span>
            <div className="chip-lines">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="chip-line" style={{ transform: `rotate(${i * 45}deg)` }} />
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="bet-actions">
        <div className="total-bet-display">
          <span className="total-bet-label">TOTAL BET</span>
          <span className="total-bet-amount">₹{totalBet.toLocaleString('en-IN')}</span>
        </div>
        <div className="action-buttons">
          <button
            id="double-bet-btn"
            className={`action-btn double-btn ${!canBet ? 'btn-disabled' : ''}`}
            onClick={() => {
              if (totalBet === 0) {
                // No bets yet: double the selected chip value
                const newChip = selectedChip * 2;
                onSelectChip(newChip);
              } else {
                onDoubleBet();
              }
            }}
            disabled={!canBet}
          >
            <span className="btn-icon">2×</span>
            <span className="btn-text">DOUBLE</span>
          </button>
          <button
            id="clear-bets-btn"
            className={`action-btn clear-btn ${!canBet || totalBet === 0 ? 'btn-disabled' : ''}`}
            onClick={onClearBets}
            disabled={!canBet || totalBet === 0}
          >
            <span className="btn-icon">✕</span>
            <span className="btn-text">CLEAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChipSelector;
