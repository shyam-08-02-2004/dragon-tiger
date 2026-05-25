import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldTxLogic = `      if (freshUsers[tx.username]) {
        if (tx.type === 'deposit') {
          freshUsers[tx.username].balance += tx.amount;
          freshUsers[tx.username].hasDeposited = true;
        } else if (tx.type === 'withdraw') {
          if (freshUsers[tx.username].balance < tx.amount) {
            alert(\`User ka balance ₹\${freshUsers[tx.username].balance} hai, withdraw amount ₹\${tx.amount} se kam hai!\`);
            return;
          }
          freshUsers[tx.username].balance -= tx.amount;
        }
        setUsers(freshUsers);
        localStorage.setItem('dragonTigerUsers', JSON.stringify(freshUsers));
      }`;

const newTxLogic = `      // Fetching the user to update their balance in DB
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
      }`;

content = content.replace(oldTxLogic, newTxLogic);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
