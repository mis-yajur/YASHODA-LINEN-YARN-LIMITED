const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/setIsSyncing\(true\);/g, "");
code = code.replace(/setIsSyncing\(false\);/g, "");
code = code.replace(/isSyncing \? 'Saving\.\.\.' : 'Save Entry'/g, "'Save Entry'");
code = code.replace(/disabled=\{isSyncing\}/g, "");
code = code.replace(/loadSheetData\('Yashoda'\);/g, "");
code = code.replace(/loadSheetData\('AIPL'\);/g, "");

fs.writeFileSync('src/pages/GateRegister.tsx', code);
