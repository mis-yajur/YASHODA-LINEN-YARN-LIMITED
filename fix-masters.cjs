const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/const \{ items, addItem, warehouses, departments, addWarehouse, updateWarehouse, deleteWarehouse, addDepartment, updateDepartment, deleteDepartment, stock \} = useApp\(\);/,
"const { users, addUser, updateUser, items, addItem, warehouses, departments, addWarehouse, updateWarehouse, deleteWarehouse, addDepartment, updateDepartment, deleteDepartment, stock } = useApp();");

fs.writeFileSync('src/pages/Masters.tsx', code);
