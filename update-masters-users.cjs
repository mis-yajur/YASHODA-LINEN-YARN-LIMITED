const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

// Import users and addUser
code = code.replace(/const \{ departments, warehouses, suppliers, stock, addDepartment, updateDepartment, addWarehouse, updateWarehouse, addItem, items \} = useApp\(\);/,
"const { users, departments, warehouses, suppliers, stock, addDepartment, updateDepartment, addWarehouse, updateWarehouse, addItem, items, addUser, updateUser } = useApp();");

// Fix the users rendering logic
const oldUsersRender = /<table className="w-full text-left">[\s\S]*?<tbody>[\s\S]*?<tr>[\s\S]*?<\/tr>[\s\S]*?<\/tbody>[\s\S]*?<\/table>/;
const newUsersRender = `<table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(users && users.length > 0 ? users : [{ id: '1', name: 'Admin User', email: 'admin@yashoda.com', role: 'Administrator', status: 'Active' }]).map(u => (
                <tr key={u.id}>
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    {u.name}
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <span className={\`\${u.status === 'Active' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded-full text-xs font-medium\`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>`;

code = code.replace(oldUsersRender, newUsersRender);

// Fix LocationModal logic
code = code.replace(/else if \(modalType === 'item'\) \{\s*addItem\(data\);\s*\}/,
`else if (modalType === 'item') { 
              addItem(data);
            }
            else if (modalType === 'user') {
              if (editItem) updateUser(editItem.id, data);
              else addUser(data);
            }`);

fs.writeFileSync('src/pages/Masters.tsx', code);
