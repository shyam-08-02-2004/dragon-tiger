import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Imports
content = content.replace(
    "import './AdminPanel.css';",
    "import './AdminPanel.css';\nimport CardDisplay from './CardDisplay';\nimport { drawCard, determineResult } from '../types/game';\nimport type { Card, GameResult } from '../types/game';"
);

// 2. State
content = content.replace(
    "const [forcedOutcome, setForcedOutcome] = useState<string>('none');",
    `const [forcedOutcomes, setForcedOutcomes] = useState<string[]>([]);
  const [simPhase, setSimPhase] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [simTimer, setSimTimer] = useState<number>(15);
  const [simDragonCard, setSimDragonCard] = useState<Card | null>(null);
  const [simTigerCard, setSimTigerCard] = useState<Card | null>(null);
  const [simResult, setSimResult] = useState<GameResult | null>(null);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState<string | null>(null);`
);

// Make sure useRef is imported
content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
);

// 3. loadData
content = content.replace(
    /const settingsStr = localStorage\.getItem\('dragonTigerAdminSettings'\) \|\| '\{"forcedOutcome":"none"\}';[\s\S]*?\} catch \(e\) \{[\s\S]*?setForcedOutcome\('none'\);\s*\}/,
    `const settingsStr = localStorage.getItem('dragonTigerAdminSettings') || '{}';
    try {
      const settings = JSON.parse(settingsStr);
      setForcedOutcomes(settings.forcedOutcomes || []);
    } catch (e) {
      setForcedOutcomes([]);
    }`
);

// 4. saveForcedOutcome -> addToQueue / removeFromQueue / Simulation loop
content = content.replace(
    /const saveForcedOutcome = \(outcome: string\) => \{[\s\S]*?localStorage\.setItem\('dragonTigerAdminSettings', JSON\.stringify\(settings\)\);\s*\};/,
    `const addToQueue = (outcome: string) => {
    setForcedOutcomes(prev => {
      const newQueue = [...prev, outcome].slice(0, 5); // Max 5
      const settingsStr = localStorage.getItem('dragonTigerAdminSettings') || '{}';
      const settings = JSON.parse(settingsStr);
      settings.forcedOutcomes = newQueue;
      localStorage.setItem('dragonTigerAdminSettings', JSON.stringify(settings));
      return newQueue;
    });
  };

  const removeFromQueue = (index: number) => {
    setForcedOutcomes(prev => {
      const newQueue = prev.filter((_, i) => i !== index);
      const settingsStr = localStorage.getItem('dragonTigerAdminSettings') || '{}';
      const settings = JSON.parse(settingsStr);
      settings.forcedOutcomes = newQueue;
      localStorage.setItem('dragonTigerAdminSettings', JSON.stringify(settings));
      return newQueue;
    });
  };

  useEffect(() => {
    if (activeTab !== 'game') {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      return;
    }
    const runSimulation = () => {
      setSimPhase('betting');
      setSimTimer(15);
      setSimDragonCard(null);
      setSimTigerCard(null);
      setSimResult(null);

      simTimerRef.current = setInterval(() => {
        setSimTimer(prev => {
          if (prev <= 1) {
            if (simTimerRef.current) clearInterval(simTimerRef.current);
            handleSimDeal();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleSimDeal = () => {
      setSimPhase('dealing');
      setTimeout(() => {
        const dCard = drawCard();
        let tCard = drawCard();
        while (tCard.rank === dCard.rank && tCard.suit === dCard.suit) tCard = drawCard();
        setSimDragonCard(dCard);
        setSimTigerCard(tCard);
        
        setTimeout(() => {
          setSimResult(determineResult(dCard, tCard));
          setSimPhase('result');
          setTimeout(() => { runSimulation(); }, 4000);
        }, 1000);
      }, 500);
    };

    runSimulation();
    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); };
  }, [activeTab]);`
);

// 5. UI replacements (Game Control)
content = content.replace(
    /<h3>Force Next Round Result<\/h3>[\s\S]*?<\/div>/,
    `<h3>Next 5 Rounds Control</h3>
                <p className="text-muted">Pre-set outcomes for the next 5 rounds globally.</p>
                
                <div className="outcome-selector">
                  <button className="outcome-btn dragon" onClick={() => addToQueue('dragon')} disabled={forcedOutcomes.length >= 5}>+ Dragon</button>
                  <button className="outcome-btn tiger" onClick={() => addToQueue('tiger')} disabled={forcedOutcomes.length >= 5}>+ Tiger</button>
                  <button className="outcome-btn tie" onClick={() => addToQueue('tie')} disabled={forcedOutcomes.length >= 5}>+ Tie</button>
                  <button className="outcome-btn none" onClick={() => addToQueue('none')} disabled={forcedOutcomes.length >= 5}>+ Random</button>
                </div>
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {forcedOutcomes.map((outcome, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{textTransform: 'capitalize'}}>{outcome}</span>
                      <button onClick={() => removeFromQueue(idx)} style={{background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</button>
                    </div>
                  ))}
                  {forcedOutcomes.length === 0 && <span className="text-muted">Queue is empty. Next round will be random.</span>}
                </div>

                <div className="alert-box warning" style={{marginTop: '20px'}}>
                  <strong>Live Game Simulation:</strong>
                  <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', marginTop: '20px', minHeight: '300px' }}>
                    <CardDisplay 
                      phase={simPhase}
                      dragonCard={simDragonCard}
                      tigerCard={simTigerCard}
                      result={simResult}
                      dealerMessage={simPhase === 'betting' ? \`Place your bets! (\${simTimer}s)\` : simPhase === 'dealing' ? 'No more bets!' : 'Round Over'}
                    />
                  </div>
                </div>`
);

// 6. User History Modal
content = content.replace(
    "</main>",
    `</main>

      {/* User History Modal */}
      {selectedUserHistory && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <div className="wallet-header">
              <h2>History: {selectedUserHistory}</h2>
              <button className="close-btn" onClick={() => setSelectedUserHistory(null)}>✕</button>
            </div>
            <div className="wallet-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Time</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {transactions.filter(t => t.username === selectedUserHistory).slice().reverse().map(tx => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className={tx.type === 'deposit' ? 'green' : 'gold'}>{tx.type.toUpperCase()}</td>
                      <td>₹{tx.amount}</td>
                      <td><span className={\`status-badge \${tx.status}\`}>{tx.status}</span></td>
                    </tr>
                  ))}
                  {transactions.filter(t => t.username === selectedUserHistory).length === 0 && (
                    <tr><td colSpan={4} className="text-center">No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}`
);

// 7. Add History button next to user
content = content.replace(
    /(<button \s*className="action-btn edit" \s*onClick=\{\(\) => \{\s*setEditBalanceUser\(username\);\s*setNewBalance\(data\.balance\.toString\(\)\);\s*\}\}\s*title="Edit Balance"\s*>\s*💰\s*<\/button>)/g,
    `$1
                              <button 
                                className="action-btn" 
                                onClick={() => setSelectedUserHistory(username)}
                                title="View History"
                                style={{ background: '#3498db' }}
                              >
                                📜
                              </button>`
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
