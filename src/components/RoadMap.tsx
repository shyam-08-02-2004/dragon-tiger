import React from 'react';
import type { RoundResult } from '../types/game';
import './RoadMap.css';

interface RoadMapProps {
  history: RoundResult[];
}

const RoadMap: React.FC<RoadMapProps> = ({ history }) => {
  // We'll show the last 48 results to fill the grid (e.g. 6 rows x 8 cols)
  const visible = history.slice(-48);
  
  // Calculate statistics from the visible history (or full history if desired)
  const stats = history.reduce((acc, curr) => {
    if (curr.result === 'dragon') acc.dragon++;
    else if (curr.result === 'tiger') acc.tiger++;
    else if (curr.result === 'tie') acc.tie++;
    return acc;
  }, { dragon: 0, tiger: 0, tie: 0 });

  const total = stats.dragon + stats.tiger + stats.tie;

  // Pad the array with empty slots if less than 48 to keep the grid shape
  const gridCells = [...visible];
  while (gridCells.length < 48) {
    gridCells.push({ id: `empty-${gridCells.length}`, result: 'empty' as any, timestamp: 0 });
  }

  return (
    <div className="premium-roadmap-container">
      <div className="pr-grid">
        {gridCells.map((round) => {
          if (round.result === 'empty') {
            return <div key={round.id} className="pr-cell empty" />;
          }
          
          const isDragon = round.result === 'dragon';
          const isTiger = round.result === 'tiger';
          const isTie = round.result === 'tie';
          
          return (
            <div key={round.id} className="pr-cell">
              <div className={`pr-bead ${isDragon ? 'dragon' : isTiger ? 'tiger' : 'tie'}`}>
                {isDragon ? 'D' : isTiger ? 'T' : 'T'}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pr-stats">
        <div className="pr-stat-row">
          <span className="pr-stat-label" style={{ color: '#E53935' }}>DRAGON</span>
          <span className="pr-stat-val">{stats.dragon}</span>
        </div>
        <div className="pr-stat-row">
          <span className="pr-stat-label" style={{ color: '#2962FF' }}>TIGER</span>
          <span className="pr-stat-val">{stats.tiger}</span>
        </div>
        <div className="pr-stat-row">
          <span className="pr-stat-label" style={{ color: '#00C853' }}>TIE</span>
          <span className="pr-stat-val">{stats.tie}</span>
        </div>
        <div className="pr-stat-divider"></div>
        <div className="pr-stat-row">
          <span className="pr-stat-label" style={{ color: '#FFF' }}>Total</span>
          <span className="pr-stat-val">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default RoadMap;
