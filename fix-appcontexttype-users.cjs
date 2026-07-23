const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!code.includes('addUser: (user:')) {
  code = code.replace(/initApp: \(\) => Promise<void>;/, 
`initApp: () => Promise<void>;
  addUser: (user: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;`);
  fs.writeFileSync('src/context/AppContext.tsx', code);
}
