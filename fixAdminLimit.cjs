const fs = require('fs');
let content = fs.readFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', 'utf8');

const targetStr = `{Date.now() - new Date(msg.timestamp).getTime() <= 10 * 60 * 1000 && (
                                      <button 
                                        className="premium-btn-edit"
                                        onClick={() => { setEditingChatId(msg.id); setEditingChatText(msg.message); setActiveAdminMenuMsgId(null); }}
                                      >
                                        <span>✏️</span> Edit
                                      </button>
                                    )}`;

const newStr = `<button 
                                        className="premium-btn-edit"
                                        onClick={() => { setEditingChatId(msg.id); setEditingChatText(msg.message); setActiveAdminMenuMsgId(null); }}
                                      >
                                        <span>✏️</span> Edit
                                      </button>`;

if (content.includes('10 * 60 * 1000')) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', content);
  console.log('AdminPanel updated.');
} else {
  console.log('Could not find target.');
}
