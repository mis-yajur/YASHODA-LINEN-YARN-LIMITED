const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(/import \{ getAuth, signInWithPopup, GoogleAuthProvider, signOut \} from 'firebase\/auth';/, 
"import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';");

code += "\nexport { signInWithEmailAndPassword, createUserWithEmailAndPassword };\n"

fs.writeFileSync('src/lib/firebase.ts', code);
