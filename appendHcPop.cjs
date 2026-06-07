const fs = require('fs');

const css = `
@keyframes hcPop {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/AdminPanel.css', css);
