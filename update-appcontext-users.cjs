const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!code.includes('users: []')) {
  // Update initial state
  code = code.replace(/departments: \[\],/, "users: [], departments: [],");
  
  // Update setupListeners collections
  code = code.replace(/const collections = \[/, "const collections = [\n      'users',");
  
  // Update clear data on logout
  code = code.replace(/departments: \[\], suppliers:/, "users: [], departments: [], suppliers:");
  
  // Add addUser and updateUser functions
  code = code.replace(/const addItem = /, "const addUser = async (user: any) => firestoreAdd('users', user);\n  const updateUser = async (id: string, data: any) => firestoreUpdate('users', id, data);\n  const addItem = ");
  
  // Add them to value object
  code = code.replace(/loginWithEmail,/, "loginWithEmail, addUser, updateUser,");
  
  fs.writeFileSync('src/context/AppContext.tsx', code);
}
