import fs from 'fs';

let content = fs.readFileSync('src/components/WalletModal.tsx', 'utf8');

// Import QRCode
content = content.replace(/import React, \{ useState \} from 'react';/, "import React, { useState } from 'react';\nimport { QRCodeSVG } from 'qrcode.react';");

// Change localStorage saving to fetch api
const txLogic = `
    const txData = {
      id: Date.now().toString(),
      username,
      type: tab,
      amount: val,
      utr: tab === 'deposit' ? utr.trim() : null,
      upiId: tab === 'withdraw' ? upiId.trim() : null,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
    } catch(e) {
      console.error(e);
    }
`;

content = content.replace(/const txsStr = localStorage\.getItem\('dragonTigerTransactions'\) \|\| '\[\]';[\s\S]*?localStorage\.setItem\('dragonTigerTransactions', JSON\.stringify\(txs\)\);/, txLogic);

content = content.replace(/const handleSubmit = \(e: React\.FormEvent\) => \{/, 'const handleSubmit = async (e: React.FormEvent) => {');

// Inject QR Code in deposit tab
const qrHTML = `
              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '15px', background: 'var(--dark-bg)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Scan to pay ₹{amount || '0'}</p>
                <div style={{ background: '#fff', padding: '10px', display: 'inline-block', borderRadius: '8px' }}>
                  <QRCodeSVG 
                    value={\`upi://pay?pa=demo@ybl&pn=DragonTiger&am=\${amount || 0}&cu=INR\`} 
                    size={150} 
                  />
                </div>
              </div>
`;

content = content.replace(/<input\s*type="text"\s*placeholder="Enter UTR \/ Transaction ID"/, qrHTML + '\n              <input type="text" placeholder="Enter UTR / Transaction ID"');

fs.writeFileSync('src/components/WalletModal.tsx', content);

console.log("Refactored WalletModal for QR Code and API integration.");
