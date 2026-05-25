import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Fix the CardDisplay usage in AdminPanel.tsx
content = content.replace(
    /<CardDisplay \s*phase=\{simPhase\}[\s\S]*?dealerMessage=\{.*?\}\s*\/>/g,
    `
    <div className="table-area" style={{ pointerEvents: 'none' }}>
      <div className="cards-arena" id="cards-arena">
        <CardDisplay
          card={simDragonCard}
          side="dragon"
          isRevealing={simPhase === 'dealing'}
          isWinner={simResult === 'dragon'}
        />

        <div className="vs-divider" id="vs-divider">
          <div className="vs-line" />
          <div className="vs-badge">VS</div>
          <div className="vs-line" />
          {(simResult === 'tie' || simResult === 'suited-tie') && simPhase === 'result' && (
            <div className="tie-indicator">TIE</div>
          )}
        </div>

        <CardDisplay
          card={simTigerCard}
          side="tiger"
          isRevealing={simPhase === 'dealing'}
          isWinner={simResult === 'tiger'}
        />
      </div>
      <div style={{textAlign: 'center', marginTop: '20px', fontSize: '20px', color: 'gold'}}>
        {simPhase === 'betting' ? \`Place your bets! (\${simTimer}s)\` : simPhase === 'dealing' ? 'No more bets!' : 'Round Over'}
      </div>
    </div>
    `
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
