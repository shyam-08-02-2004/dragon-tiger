const old = fetch; const newFetch = (...args) => { return old(...args); }; newFetch('https://google.com').then(console.log).catch(console.log);
