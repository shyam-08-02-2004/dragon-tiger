import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldTxLogic = `  const handleTransactionAction = (txId: string, action: 'approve' | 'reject') => {
    const txs = [...transactions];
    const txIndex = txs.findIndex(t => t.id === txId);
    if (txIndex === -1) return;

    const tx = txs[txIndex];
    if (tx.status !== 'pending') return;

    if (action === 'approve') {
      const freshUsersStr = localStorage.getItem('dragonTigerUsers') || '{}';
      const freshUsers = JSON.parse(freshUsersStr);

      // Fetching the user to update their balance in DB
      const userToUpdate = users.find(u => u.username === tx.username || u.id === tx.username);
      if (userToUpdate) {
        let newBalance = userToUpdate.balance;
        if (tx.type === 'deposit') {
          newBalance += tx.amount;
        } else if (tx.type === 'withdraw') {
          if (newBalance < tx.amount) {
            alert(\`User balance ₹\${newBalance} is less than withdraw amount ₹\${tx.amount}!\`);
            return;
          }
          newBalance -= tx.amount;
        }
        
        fetch(\`/api/users/\${userToUpdate.id}/balance\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newBalance })
        }).then(res => {
          if (res.ok) {
            setUsers(users.map(u => u.id === userToUpdate.id ? { ...u, balance: newBalance } : u));
          }
        }).catch(console.error);
      }
    }

    const freshTxsStr = localStorage.getItem('dragonTigerTransactions') || '[]';
    const freshTxs = JSON.parse(freshTxsStr);
    const latestTxIndex = freshTxs.findIndex((t: any) => t.id === txId);
    
    if (latestTxIndex !== -1) {
      freshTxs[latestTxIndex].status = action;
      setTransactions(freshTxs);
      localStorage.setItem('dragonTigerTransactions', JSON.stringify(freshTxs));
    }
  };`;

const newTxLogic = `  const handleTransactionAction = async (txId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(\`/api/admin/transactions/\${txId}/action\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Refetch users and transactions
        fetch('/api/admin/users').then(r => r.json()).then(data => {
          if (Array.isArray(data)) setUsers(data);
        });
        fetch('/api/admin/transactions').then(r => r.json()).then(data => {
          if (Array.isArray(data)) setTransactions(data);
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process transaction");
      }
    } catch(e) { console.error(e); }
  };`;

content = content.replace(oldTxLogic, newTxLogic);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
