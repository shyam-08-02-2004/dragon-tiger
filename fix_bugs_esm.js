import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix balance save (Line 80 area)
appContent = appContent.replace(
    /if \(users\[currentUser\.username\]\) \{\s*users\[currentUser\.username\]\.balance = state\.balance;/,
    `const userId = currentUser.id || currentUser.username;
      if (users[userId]) {
        users[userId].balance = state.balance;`
);

// 2. Fix live bets sync (Line 93 area)
appContent = appContent.replace(
    /liveBets\[currentUser\.username\] = state\.bets;/,
    `liveBets[currentUser.id || currentUser.username] = state.bets;`
);

// 3. Fix storage event balance update and FORCE LOGOUT if deleted (Line 103 area)
appContent = appContent.replace(
    /if \(users\[currentUser\.username\]\) \{\s*const newBalance = users\[currentUser\.username\]\.balance;\s*const newHasDeposited = users\[currentUser\.username\]\.hasDeposited;/,
    `const userId = currentUser.id || currentUser.username;
        if (!users[userId] && userId !== 'babu' && userId !== 'admin') {
          // User was deleted by admin
          handleLogout();
        } else if (users[userId]) {
          const newBalance = users[userId].balance;
          const newHasDeposited = users[userId].hasDeposited;`
);

// 4. Fix WalletModal username prop (Line 423 area)
appContent = appContent.replace(
    /<WalletModal username=\{currentUser\.username\}/,
    `<WalletModal username={currentUser.id || currentUser.username}`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("App.tsx bugs fixed.");
