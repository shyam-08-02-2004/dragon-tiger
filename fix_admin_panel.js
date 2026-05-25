import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Fix 1: State initialization
content = content.replace(
  /const \[users, setUsers\] = useState<Record<string, any>>\(\{\}\);/,
  `const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);
      
    const freshTxsStr = localStorage.getItem('dragonTigerTransactions') || '[]';
    setTransactions(JSON.parse(freshTxsStr));
  }, []);`
);

// Fix 2: handleUpdateBalance
const oldUpdateBalance = `  const handleUpdateBalance = (username: string) => {
    const amount = parseFloat(newBalance);
    if (isNaN(amount) || amount < 0) {
      alert("Invalid balance amount");
      return;
    }
    
    const freshUsersStr = localStorage.getItem('dragonTigerUsers') || '{}';
    const freshUsers = JSON.parse(freshUsersStr);
    
    if (freshUsers[username]) {
      freshUsers[username].balance = amount;
      setUsers(freshUsers);
      localStorage.setItem('dragonTigerUsers', JSON.stringify(freshUsers));
      setEditBalanceUser(null);
      setNewBalance('');
    }
  };`;

const newUpdateBalance = `  const handleUpdateBalance = async (id: string) => {
    const amount = parseFloat(newBalance);
    if (isNaN(amount) || amount < 0) {
      alert("Invalid balance amount");
      return;
    }
    
    try {
      const res = await fetch(\`/api/users/\${id}/balance\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: amount })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, balance: amount } : u));
        setEditBalanceUser(null);
        setNewBalance('');
      }
    } catch (err) {
      console.error(err);
    }
  };`;

content = content.replace(oldUpdateBalance, newUpdateBalance);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
