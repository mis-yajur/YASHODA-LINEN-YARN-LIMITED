const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/export interface AppState \{/, 
`import { User } from 'firebase/auth';\n\nexport interface AppState {`);

code = code.replace(/isSyncing: boolean;\n}/, `isSyncing: boolean;\n  user?: User | null;\n}`);

fs.writeFileSync('src/types.ts', code);
