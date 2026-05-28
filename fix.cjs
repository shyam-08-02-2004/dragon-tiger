const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
const map = {
  'ðŸŽ¯': '🎯',
  'ðŸƒ ': '🃏',
  'ðŸ †': '🏆',
  'ðŸ›¡ï¸ ': '🛡️',
  'ðŸ‘¥': '👥',
  'ðŸŽ²': '🎲',
  'ðŸ’³': '💳',
  'ðŸ’¬': '💬',
  'ðŸšª': '🚪',
  'ðŸ’°': '💰',
  'ðŸ—‘ï¸ ': '🗑️',
  'ðŸ“œ': '📜',
  'ðŸŽ®': '🎮',
  'ðŸ ‰': '🐲',
  'ðŸ ¯': '🐯',
  'ðŸ¤ ': '🤝',
  'ðŸ“‹': '📋',
  'ðŸ“Š': '📊',
  'ðŸ‘¤': '👤',
  'âœ…': '✅',
  'â Œ': '❌',
  'âœ“': '✓',
  'âœ•': '✕',
  'â‚¹': '₹',
  'â†’': '→',
  'â† ': '←'
};
for (const [bad, good] of Object.entries(map)) {
  content = content.split(bad).join(good);
}
fs.writeFileSync('src/components/AdminPanel.tsx', content);
