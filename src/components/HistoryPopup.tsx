import React, { useEffect, useState } from 'react';
import type { RoundResult } from '../types/game';
import './HistoryPopup.css';

interface HistoryPopupProps {
  history: RoundResult[];
}

const HistoryPopup: React.FC<HistoryPopupProps> = ({ history }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [history.length]);

  if (!visible || history.length === 0) return null;

  const last5 = history.slice(-5).reverse();

  const getLabel = (result: string | null) => {
    if (result === 'dragon') return { icon: '🐉', label: 'Dragon', cls: 'hp-dragon' };
    if (result === 'tiger') return { icon: '🐯', label: 'Tiger', cls: 'hp-tiger' };
    if (result === 'suited-tie') return { icon: '✨', label: 'Suited Tie', cls: 'hp-stie' };
    return { icon: '🤝', label: 'Tie', cls: 'hp-tie' };
  };

  return (
    <div className="history-popup" id="history-popup">
      <div className="hp-header">
        <span className="hp-title">📋 Last {last5.length} Rounds</span>
        <button className="hp-close" onClick={() => setVisible(false)}>✕</button>
      </div>
      <div className="hp-list">
        {last5.map((r, i) => {
          const { icon, label, cls } = getLabel(r.result);
          return (
            <div key={r.id} className={`hp-row ${cls} ${i === 0 ? 'hp-latest' : ''}`}>
              <span className="hp-round">Round #{r.id}</span>
              <span className="hp-result">{icon} {label}</span>
              <span className="hp-cards">
                D: {r.dragonCard.rank}{r.dragonCard.suit} vs T: {r.tigerCard.rank}{r.tigerCard.suit}
              </span>
            </div>
          );
        })}
      </div>
      <div className="hp-footer">Auto-closes in 5s</div>
    </div>
  );
};

export default HistoryPopup;
