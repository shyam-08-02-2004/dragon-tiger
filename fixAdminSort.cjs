const { execSync } = require('child_process');
const fs = require('fs');

try {
  // 1. Restore the file to discard the broken replacement
  execSync('git checkout src/components/AdminPanel.tsx', { cwd: 'C:/dragonTiger' });
  console.log('Restored AdminPanel.tsx from git');

  // 2. Read the restored file
  let content = fs.readFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', 'utf8');

  // 3. Apply the .reverse() safely
  content = content.replace(
    `if (Array.isArray(data)) setUsers(data);`,
    `if (Array.isArray(data)) setUsers(data.reverse());`
  );

  content = content.replace(
    `if (Array.isArray(data)) setTransactions(data);`,
    `if (Array.isArray(data)) setTransactions(data.reverse());`
  );

  // 4. Also need to ensure the admin edit fix (that we applied earlier but might have lost during checkout) is applied
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
  }

  // 5. Write it back
  fs.writeFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', content);
  console.log('Applied .reverse() to users and transactions and restored admin chat edit fix.');

} catch (e) {
  console.error(e);
}
