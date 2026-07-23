const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace AppContextType to include login, logout, user
code = code.replace(/interface AppContextType extends AppState \{/, 
`import { User } from 'firebase/auth';

interface AppContextType extends AppState {
  login: () => Promise<void>;
  logout: () => Promise<void>;`);

code = code.replace(/setScriptUrl: \(url: string\) => void;\n/, '');
code = code.replace(/const addItem = \(item\) => firestoreAdd\('items', item\);/, `const addItem = async (item: Omit<Item, 'id'>) => firestoreAdd('items', item);`);

fs.writeFileSync('src/context/AppContext.tsx', code);
