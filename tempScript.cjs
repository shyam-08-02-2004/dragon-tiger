const fs = require('fs');
let content = fs.readFileSync('C:/dragonTiger/src/components/WalletModal.tsx', 'utf8');

// Add import
content = content.replace("import './WalletModal.css';", "import './WalletModal.css';\nimport { showCasinoAlert } from '../utils/casinoAlert';");

// Replace showMsg implementation to use casinoAlert
content = content.replace(
  "const showMsg = (text: string, type: 'success' | 'error' | 'pending') => {\n    setMessage(text);\n    setMsgType(type);\n    if (msgTimeoutRef.current) window.clearTimeout(msgTimeoutRef.current);\n    msgTimeoutRef.current = window.setTimeout(() => {\n      setMessage('');\n    }, 3000);\n  };",
  "const showMsg = (text: string, type: 'success' | 'error' | 'pending') => {\n    showCasinoAlert('Wallet Notice', text, type === 'pending' ? 'info' : type);\n  };"
);

// We should also remove the inline `<div className=\"toast-message\">` block since it's redundant now.
content = content.replace(
  "{message && (\n            <div className={`toast-message ${msgType}`}>\n              {message.split('\\n').map((line, i) => (\n                <span key={i}>{line}<br /></span>\n              ))}\n            </div>\n          )}",
  ""
);

// We need to fix the condition for showing the form fields
content = content.replace(
  "{(!message || msgType !== 'pending') && (",
  "{"
);
// Also need to remove the closing bracket of that condition. It's just a `)}` at the end of the form. But wait, replacing that is tricky with a simple script. Let me use multi_replace instead of a script to be safe.
