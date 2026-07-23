const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/securitySign: ''/, `securitySign: ''`);
code = code.replace(/contactNoSign: row.contactNoSign \|\| ''/, `contactNoSign: row.contactNoSign || '',\n        securitySign: ''`);
code = code.replace(/contactNoSign: ''/, `contactNoSign: '',\n        securitySign: ''`);

// Remove any remaining fetchRows / spreadsheetId
code = code.replace(/const rows = await fetchRows\(spreadsheetId, 'GateEntries_' \+ type\);/g, "");
code = code.replace(/const spreadsheetId = await getOrCreateSpreadsheet\(\);/g, "");

// remove User reference
code = code.replace(/const \[user, setUser\] = useState<User \| null>\(null\);/g, "");

fs.writeFileSync('src/pages/GateRegister.tsx', code);
