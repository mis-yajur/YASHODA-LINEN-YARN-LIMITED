const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/import \{ db, auth, signInWithGoogle, logout \} from '\.\.\/lib\/firebase';/, 
"import { db, auth, signInWithGoogle, logout, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';");

const newLoginFunc = `
  const login = async () => {
    try {
      await signInWithGoogle();
    } catch(e) {
      console.error(e);
    }
  }

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch(e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        // If not found, try to create it (useful for default admin)
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        throw e;
      }
    }
  }
`;

code = code.replace(/const login = async \(\) => \{[\s\S]*?catch\(e\) \{[\s\S]*?\}\n  \}/, newLoginFunc);

code = code.replace(/login: \(\) => Promise<void>;/, "login: () => Promise<void>;\n  loginWithEmail: (email: string, pass: string) => Promise<void>;");
code = code.replace(/const value = \{ login,/, "const value = { login, loginWithEmail,");

fs.writeFileSync('src/context/AppContext.tsx', code);
