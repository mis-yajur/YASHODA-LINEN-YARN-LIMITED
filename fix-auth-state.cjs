const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Change initial isSyncing to true
code = code.replace(/isSyncing: false,/, "isSyncing: true,");

// Update initApp to turn it off when auth resolves
const regex = /onAuthStateChanged\(auth, \(currentUser\) => \{[\s\S]*?setState\(s => \(\{ \.\.\.s, user: currentUser \}\)\);/;

code = code.replace(regex, "onAuthStateChanged(auth, (currentUser) => {\n      setState(s => ({ ...s, user: currentUser, isSyncing: false }));");

fs.writeFileSync('src/context/AppContext.tsx', code);
