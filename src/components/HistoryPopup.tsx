import React from 'react';
import type { RoundResult } from '../types/game';
import './HistoryPopup.css';

interface HistoryPopupProps {
  history: RoundResult[];
}

const getLabel = (result: string | null) => {
  if (result === 'dragon') return { icon: '🐉', label: 'Dragon', cls: 'hp-dragon' };
  if (result === 'tiger') return { icon: '🐯', label: 'Tiger', cls: 'hp-tiger' };
  if (result === 'tie') return { icon: '🤝', label: 'Tie', cls: 'hp-tie' };
  return { icon: '🤝', label: 'Tie', cls: 'hp-tie' };
};

const HistoryPopup: React.FC<HistoryPopupProps> = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-popup" id="history-popup">
      <div className="hp-header">
        <span className="hp-title">📋 All {history.length} Rounds</span>
      </div>
      <div className="hp-list">
        {history.map((r, i) => {
          const { icon, label, cls } = getLabel(r.result);
          const isLatest = i === history.length - 1;
          return (
            <div key={r.id} className={`hp-row ${cls} ${isLatest ? 'hp-latest' : ''}`}> 
              <span className="hp-round">Round #{r.id}</span>
              <span className="hp-result">{icon} {label}</span>
              <span className="hp-cards">
                D: {r.dragonCard.rank}{r.dragonCard.suit} vs T: {r.tigerCard.rank}{r.tigerCard.suit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPopup;
