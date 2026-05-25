import fs from 'fs';

let content = fs.readFileSync('src/components/WalletModal.tsx', 'utf8');

content = content.replace(/value=\{\\\`upi:\/\/pay\?pa=prashantdangi0077@okaxis&pn=DragonTiger&am=\\\$\{amount \|\| 0\}&cu=INR\\\`\}/g, "value={`upi://pay?pa=prashantdangi0077@okaxis&pn=DragonTiger&am=${amount || 0}&cu=INR`}");

fs.writeFileSync('src/components/WalletModal.tsx', content);
