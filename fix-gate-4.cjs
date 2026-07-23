const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

const regex = /const loadSheetData = async [\s\S]*?finally \{\s*setIsLoadingSheet\(false\);\s*\}\n\s*\};/g;
code = code.replace(regex, "");

// also remove sheetUrl, isSyncing, needsAuth, isLoggingIn states if they are unused
code = code.replace(/const \[sheetUrl, setSheetUrl\] = useState<string \| null>\(null\);/, "");
code = code.replace(/const \[isSyncing, setIsSyncing\] = useState\(false\);/, "");
code = code.replace(/const \[needsAuth, setNeedsAuth\] = useState\(true\);/, "");
code = code.replace(/const \[isLoggingIn, setIsLoggingIn\] = useState\(false\);/, "");
code = code.replace(/const \[isLoadingSheet, setIsLoadingSheet\] = useState\(false\);/, "");

fs.writeFileSync('src/pages/GateRegister.tsx', code);
