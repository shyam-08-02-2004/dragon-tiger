import React from 'react';
import type { RoundResult } from '../types/game';
import './RoadMap.css';

interface RoadMapProps {
  history: RoundResult[];
}

// Display full history without limit
const RoadMap: React.FC<RoadMapProps> = ({ history }) => {
  const visible = history;

  return (
    <div className="roadmap" id="roadmap">
      <div className="roadmap-header">
        <h3 className="roadmap-title">📊 RECENT HISTORY</h3>
      </div>

      {history.length === 0 ? (
        <div className="roadmap-empty">
          <span className="empty-icon">🃏</span>
          <span>No rounds played yet</span>
        </div>
      ) : (
        <div className="simple-history">
          {visible.map((round, i) => (
            <div key={round.id} className={`history-badge ${round.result}`} title={`Round #${round.id}`}>
              {round.result === 'dragon' ? 'D' : round.result === 'tiger' ? 'T' : 'Tie'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadMap;
