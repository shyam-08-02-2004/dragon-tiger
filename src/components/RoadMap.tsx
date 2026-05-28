import React from 'react';
import type { RoundResult } from '../types/game';

interface RoadMapProps {
  history: RoundResult[];
}

const RoadMap: React.FC<RoadMapProps> = ({ history }) => {
  // Show at most last 12 results in the horizontal row
  const visible = history.slice(-12);

  return (
    <div className="roadmap-row">
      {visible.map((round) => (
        <div 
          key={round.id} 
          className={`roadmap-item ${round.result}`} 
          title={`Round #${round.id}`}
        >
          {round.result === 'dragon' ? 'D' : round.result === 'tiger' ? 'T' : 'Tie'}
        </div>
      ))}
      {visible.length === 0 && <div style={{color: '#888', fontSize: '12px'}}>No history yet</div>}
      <button className="roadmap-chart-btn">📈</button>
    </div>
  );
};

export default RoadMap;
