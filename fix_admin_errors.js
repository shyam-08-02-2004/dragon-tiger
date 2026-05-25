import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(/import CardDisplay from '\.\/CardDisplay';\r?\nimport \{ determineResult \} from '\.\.\/types\/game';\r?\nimport \{ getGlobalGameState, getDeterministicCards \} from '\.\.\/syncEngine';\r?\nimport type \{ Card, GameResult \} from '\.\.\/types\/game';\r?\n/, '');

const queueCode = `
  const addToQueue = (outcome: string) => {
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

  `;

content = content.replace(/useEffect\(\(\) => \{\r?\n    if \(activeTab !== 'game'\)/, queueCode + "useEffect(() => {\n    if (activeTab !== 'game')");

fs.writeFileSync('src/components/AdminPanel.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/const handleDeal = \(roundId: number\) => \{/, "const handleDeal = (roundId?: number) => { if (!roundId) return;");
fs.writeFileSync('src/App.tsx', appContent);

console.log("Fixed errors");
