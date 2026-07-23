const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('AppUser')) {
  code = code.replace(/export interface AppState \{/, 
`export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface AppState {
  users: AppUser[];`);
  fs.writeFileSync('src/types.ts', code);
}
