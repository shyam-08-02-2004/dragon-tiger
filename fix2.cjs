const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const replacements = [
  ['ðŸƒ ', '🃏'],
  ['ðŸ †', '🏆'],
  ['ðŸ›¡ï¸ ', '🛡️'],
  ['ðŸ—‘ï¸ ', '🗑️'],
  ['ðŸ ‰', '🐲'],
  ['ðŸ ¯', '🐯'],
  ['ðŸ¤ ', '🤝']
];

for (const [bad, good] of replacements) {
  content = content.split(bad).join(good);
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
