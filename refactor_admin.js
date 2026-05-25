import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Replace data loading effect
const fetchLogic = `
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch('/api/admin/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }

        const txRes = await fetch('/api/admin/transactions');
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }

        const settingsRes = await fetch('/api/admin/settings');
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setForcedOutcomes(settings.forcedOutcomes || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };
    fetchData();
    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);
`;

content = content.replace(/useEffect\(\(\) => \{\s*const usersStr = localStorage\.getItem\('dragonTigerUsers'\) \|\| '\{\}';[\s\S]*?\}, \[\]\);/m, fetchLogic);

// Replace User Deletion
const deleteLogic = `
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(\`/api/admin/users/\${id}\`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };
`;
content = content.replace(/const handleDeleteUser = \([\s\S]*?localStorage\.setItem\('dragonTigerUsers'[\s\S]*?\};/m, deleteLogic);

// Replace Transaction action
const actionLogic = `
  const handleAction = async (txId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(\`/api/admin/transactions/\${txId}/action\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Refresh data
        const usersRes = await fetch('/api/admin/users');
        setUsers(await usersRes.json());
        const txRes = await fetch('/api/admin/transactions');
        setTransactions(await txRes.json());
      } else {
        const error = await res.json();
        alert(error.error || 'Action failed');
      }
    } catch(e) {
      console.error(e);
    }
  };
`;
content = content.replace(/const handleAction = \([\s\S]*?setTransactions\(txList\);\r?\n\s*\};/m, actionLogic);

// Replace addToQueue
const queueLogic = `
  const addToQueue = async (outcome: string) => {
    try {
      const res = await fetch('/api/admin/settings/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome })
      });
      if (res.ok) {
        const settings = await res.json();
        setForcedOutcomes(settings.forcedOutcomes);
      }
    } catch(e) { console.error(e); }
  };

  const removeFromQueue = async (index: number) => {
    try {
      const res = await fetch(\`/api/admin/settings/queue/\${index}\`, { method: 'DELETE' });
      if (res.ok) {
        const settings = await res.json();
        setForcedOutcomes(settings.forcedOutcomes);
      }
    } catch(e) { console.error(e); }
  };
`;
content = content.replace(/const addToQueue = \([\s\S]*?const removeFromQueue = \([\s\S]*?return newQueue;\r?\n\s*\}\);\r?\n\s*\};/m, queueLogic);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log("Refactored AdminPanel.tsx for API integration.");
