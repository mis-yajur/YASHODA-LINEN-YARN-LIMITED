const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/securitySign: '',\n\s*securitySign: ''/g, "securitySign: ''");

fs.writeFileSync('src/pages/GateRegister.tsx', code);
