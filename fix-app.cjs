const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const \{ initApp, isSyncing \} = useApp\(\);/,
`const { initApp, isSyncing, user, login, logout } = useApp();`);

const loginButton = `{user ? (
                <button onClick={logout} className="p-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Logout
                </button>
              ) : (
                <button onClick={login} className="p-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
                  Login
                </button>
              )}`;

code = code.replace(/<button \n                onClick=\{\(\) => setDarkMode\(\!darkMode\)\}/, `${loginButton}\n              <button \n                onClick={() => setDarkMode(!darkMode)}`);

code = code.replace(/<button\n                    onClick=\{\(\) => setDarkMode\(\!darkMode\)\}/, `${loginButton}\n              <button\n                    onClick={() => setDarkMode(!darkMode)}`);

fs.writeFileSync('src/App.tsx', code);
