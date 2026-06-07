const fs = require('fs');

let content = fs.readFileSync('C:/dragonTiger/src/components/WalletModal.tsx', 'utf8');

// I need to find the `useEffect` and insert the correct fetch block back in.
// Let's use regex or exact replacement if it's currently broken.

const newFetchBlock = `  useEffect(() => {
    if (tab === 'withdraw') {
      fetch('/api/transactions/' + username)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const now = new Date().getTime();
            const pendingWithdrawal = data.find((tx: any) => tx.type === 'withdraw' && tx.status === 'pending');
            const recentApproved10m = data.find((tx: any) => 
              tx.type === 'withdraw' && 
              tx.status === 'approved' && 
              (now - new Date(tx.timestamp).getTime() < 10 * 60 * 1000)
            );
            const recentApproved24h = data.find((tx: any) => 
              tx.type === 'withdraw' && 
              tx.status === 'approved' && 
              (now - new Date(tx.timestamp).getTime() >= 10 * 60 * 1000) &&
              (now - new Date(tx.timestamp).getTime() < 24 * 60 * 60 * 1000)
            );

            if (pendingWithdrawal) {
              setPendingMessage('pending');
            } else if (recentApproved10m) {
              setPendingMessage('approved');
            } else if (recentApproved24h) {
              setPendingMessage('approved');
              setTimeout(() => {
                setPendingMessage(null);
              }, 3000);
            } else {
              setPendingMessage(null);
            }
          }
        })
        .catch(console.error);
    }
  }, [tab, username]);`;

// Since it was completely replaced by `  useEffect(() => {\n  }, [tab, username]);`
// I can just replace `  useEffect(() => {\n  }, [tab, username]);`
content = content.replace("  useEffect(() => {\n  }, [tab, username]);", newFetchBlock);

fs.writeFileSync('C:/dragonTiger/src/components/WalletModal.tsx', content);
console.log('Restored useEffect logic');
