const fs = require('fs');

const filesToUpdate = [
  'C:/dragonTiger/src/components/Header.tsx',
  'C:/dragonTiger/src/components/ProfileModal.tsx',
  'C:/dragonTiger/src/components/Sidebar.tsx'
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('vip-avatar.png')) {
    content = content.replace(/vip-avatar\.png/g, 'vip-girl.png');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});

// Let's also check if there's any avatar cache we can bust.
