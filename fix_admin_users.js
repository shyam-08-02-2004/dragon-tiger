import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Replace handleUpdateBalance
const newHandleUpdateBalance = `
  const handleUpdateBalance = async (id: string) => {
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
        const updatedUser = await res.json();
        setUsers(users.map((u: any) => u.id === id ? updatedUser : u));
        setEditBalanceUser(null);
        setNewBalance('');
      } else {
        alert("Failed to update balance");
      }
    } catch (err) {
      console.error(err);
    }
  };
`;
content = content.replace(/const handleUpdateBalance = \([\s\S]*?setNewBalance\(''\);\r?\n\s*\};\r?\n/m, newHandleUpdateBalance + '\n');

// Replace handleTransactionAction
const newHandleTransactionAction = `
  const handleTransactionAction = async (txId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(\`/api/admin/transactions/\${txId}/action\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Refresh users and txs
        const usersRes = await fetch('/api/admin/users');
        setUsers(await usersRes.json());
        const txRes = await fetch('/api/admin/transactions');
        setTransactions(await txRes.json());
      } else {
        const err = await res.json();
        alert(err.error || 'Transaction action failed');
      }
    } catch (err) {
      console.error(err);
    }
  };
`;
content = content.replace(/const handleTransactionAction = \([\s\S]*?localStorage\.setItem\('dragonTigerTransactions', JSON\.stringify\(freshTxs\)\);\r?\n\s*\}\;\r?\n/m, newHandleTransactionAction + '\n');

// Replace Users Table (from <table className="admin-table"> to </table>)
const newUsersTable = `
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mobile Number</th>
                      <th>Username</th>
                      <th>Password</th>
                      <th>Balance</th>
                      <th>Deposited</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => {
                      if (user.id === 'babu') return null; // Hide admin account
                      return (
                        <tr key={user.id}>
                          <td className="fw-bold">{user.id}</td>
                          <td>{user.username}</td>
                          <td>
                            <span className="password-mask">{user.password}</span>
                          </td>
                          <td>
                            {editBalanceUser === user.id ? (
                              <div className="edit-balance-group">
                                <span className="currency-symbol">₹</span>
                                <input 
                                  type="number" 
                                  value={newBalance} 
                                  onChange={(e) => setNewBalance(e.target.value)}
                                  className="balance-input"
                                  autoFocus
                                />
                                <button className="save-btn" onClick={() => handleUpdateBalance(user.id)}>✓</button>
                                <button className="cancel-btn" onClick={() => setEditBalanceUser(null)}>✕</button>
                              </div>
                            ) : (
                              <span className="balance-display gold">
                                ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ color: user.hasDeposited ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                              {user.hasDeposited ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn edit" 
                                onClick={() => {
                                  setEditBalanceUser(user.id);
                                  setNewBalance(user.balance.toString());
                                }}
                                title="Edit Balance"
                              >
                                💰
                              </button>
                              <button 
                                className="action-btn" 
                                onClick={() => setSelectedUserHistory(user.id)}
                                title="View History"
                                style={{ background: '#3498db' }}
                              >
                                📜
                              </button>
                              <button 
                                className="action-btn delete" 
                                onClick={() => handleDeleteUser(user.id)}
                                title="Delete User"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {users.filter((u: any) => u.id !== 'babu').length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">No registered players yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
`;
content = content.replace(/<table className="admin-table">[\s\S]*?<\/table>/m, newUsersTable);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
