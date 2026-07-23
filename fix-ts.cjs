const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/stockSnapshot\.docs\.map\(d => \(\{id: d\.id, \.\.\.d\.data\(\)\}\)\)/g, 
"stockSnapshot.docs.map(d => ({id: d.id, ...(d.data() as Omit<Stock, 'id'>)}))");

fs.writeFileSync('src/context/AppContext.tsx', code);

let gate = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

// There must be a stray try/catch block from loadSheetData
gate = gate.replace(/try\s*\{\s*setSheetUrl\(\`https:\/\/docs\.google\.com\/spreadsheets\/d\/\$\{spreadsheetId\}\/edit\`\);\s*if\s*\(!rows\s*\|\|\s*rows\.length\s*===\s*0\)\s*\{\s*setSheetEntries\(\[\]\);\s*return;\s*\}[\s\S]*?finally\s*\{\s*setIsLoadingSheet\(false\);\s*\}/g, "");

fs.writeFileSync('src/pages/GateRegister.tsx', gate);
