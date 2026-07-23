const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

// Remove sheet state
code = code.replace(/const \[sheetEntries, setSheetEntries\] = useState<Omit<GateEntry, 'id'>\[\]>\(\[\]\);\n\s*const \[isLoadingSheet, setIsLoadingSheet\] = useState\(false\);\n\s*\/\/ Auth State\n\s*const \[needsAuth, setNeedsAuth\] = useState\(true\);\n\s*const \[isLoggingIn, setIsLoggingIn\] = useState\(false\);\n\s*const \[user, setUser\] = useState<User \| null>\(null\);\n\s*const \[sheetUrl, setSheetUrl\] = useState<string \| null>\(null\);/, '');

// Remove loadSheetData
code = code.replace(/const loadSheetData = async \([\s\S]*?\}\n  \};\n/, '');

// Remove useEffects related to sheets/auth
code = code.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, ''); // There might be a couple, let's just do it manually.
