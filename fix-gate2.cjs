const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/const allEntries = \[\.\.\.sheetEntries, \.\.\.gateEntries\.filter\(g => \(g\.companyType === companyType \|\| \(!g\.companyType && companyType === 'Yashoda'\)\) && !sheetEntries\.some\(s => s\.slNo === g\.slNo\)\)\]\.reverse\(\);/,
`const allEntries = gateEntries.filter(g => (g.companyType === companyType || (!g.companyType && companyType === 'Yashoda'))).reverse();`);

code = code.replace(/\{isSyncing \? 'Syncing to Sheets\.\.\.' : 'Save Entry'\}/g,
`{isSyncing ? 'Saving...' : 'Save Entry'}`);

fs.writeFileSync('src/pages/GateRegister.tsx', code);
