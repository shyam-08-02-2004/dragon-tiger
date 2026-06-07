import React from 'react';
import type { ChipValue } from '../types/game';
import './ChipSelector.css';

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
  onClearBets: () => void;
  onDoubleBet: () => void;
  totalBet: number;
  phase: string;
}

const CHIP_LIST = [
  { value: 10, label: '10', color: '#1B5E20' },    // Green
  { value: 50, label: '50', color: '#0D47A1' },    // Blue
  { value: 100, label: '100', color: '#4A148C' },  // Purple
  { value: 500, label: '500', color: '#E65100' },  // Orange/Gold
  { value: 1000, label: '1000', color: '#B71C1C' },// Red
  { value: 5000, label: '5000', color: '#212121' },// Black
];

const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedChip,
  onSelectChip,
  phase,
}) => {
  const canBet = phase === 'betting';

  return (
    <div className="premium-chips-wrapper">
      <div className="premium-chips-container">
        {CHIP_LIST.map(chip => (
          <div
            key={chip.value}
            className={`premium-chip ${selectedChip === chip.value ? 'selected' : ''} ${!canBet ? 'disabled' : ''}`}
            style={{ '--chip-color': chip.color } as React.CSSProperties}
            onClick={() => canBet && onSelectChip(chip.value)}
          >
            <div className="pc-inner">
              <div className="pc-center">
                <span className="pc-label">{chip.label}</span>
              </div>
              <div className="pc-dashes"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChipSelector;
