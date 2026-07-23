const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

// Add items tab state
code = code.replace(/const \[activeTab, setActiveTab\] = useState\<'departments' \| 'warehouses' \| 'companies' \| 'users'\>\('departments'\);/,
`  const [activeTab, setActiveTab] = useState<'departments' | 'warehouses' | 'companies' | 'users' | 'items'>('departments');`);

code = code.replace(/const \[modalType, setModalType\] = useState\<'warehouse' \| 'department' \| 'company' \| 'user'\>\('warehouse'\);/,
`  const [modalType, setModalType] = useState<'warehouse' | 'department' | 'company' | 'user' | 'item'>('warehouse');`);

// Add items context
code = code.replace(/const \{ warehouses, departments, addWarehouse, updateWarehouse, deleteWarehouse, addDepartment, updateDepartment, deleteDepartment, stock \} = useApp\(\);/,
`  const { items, addItem, warehouses, departments, addWarehouse, updateWarehouse, deleteWarehouse, addDepartment, updateDepartment, deleteDepartment, stock } = useApp();`);

// Header button
code = code.replace(/\{\(activeTab === 'warehouses' \|\| activeTab === 'departments' \|\| activeTab === 'companies' \|\| activeTab === 'users'\) && \(/,
`        {(activeTab === 'warehouses' || activeTab === 'departments' || activeTab === 'companies' || activeTab === 'users' || activeTab === 'items') && (`);

code = code.replace(/else if \(activeTab === 'users'\) setModalType\('user'\);/,
`              else if (activeTab === 'users') setModalType('user');
              else if (activeTab === 'items') setModalType('item');`);

code = code.replace(/Add \{activeTab === 'warehouses' \? 'Warehouse' : activeTab === 'departments' \? 'Department' : activeTab === 'companies' \? 'Company' : 'User'\}/,
`Add {activeTab === 'warehouses' ? 'Warehouse' : activeTab === 'departments' ? 'Department' : activeTab === 'companies' ? 'Company' : activeTab === 'items' ? 'Item' : 'User'}`);

// Add icons to import
code = code.replace(/import \{ Plus, MapPin, Building, Store, X, FolderTree, Users, Factory, Pencil, Trash2 \} from 'lucide-react';/,
`import { Plus, MapPin, Building, Store, X, FolderTree, Users, Factory, Pencil, Trash2, Package } from 'lucide-react';`);

// Tabs
const itemsTabButton = `        <button
          onClick={() => setActiveTab('items')}
          className={\`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 \${activeTab === 'items' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}\`}
        >
          <Package className="w-4 h-4" /> Items
        </button>`;

code = code.replace(/<\/div>\n\s*\{activeTab === 'warehouses' && \(/, `${itemsTabButton}\n      </div>\n      {activeTab === 'warehouses' && (`);

// Items Table
const itemsTable = `      {activeTab === 'items' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Type</th>
                <th className="p-4">UoM</th>
                <th className="p-4">Reorder Lvl</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
              <tr key={item.id}>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-gray-500">{item.sku}</td>
                <td className="p-4">{item.type}</td>
                <td className="p-4">{item.uom}</td>
                <td className="p-4">{item.reorderLevel}</td>
              </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No items found</td></tr>}
            </tbody>
          </table>
        </div>
      )}`;

code = code.replace(/\{isModalOpen && \(/, `${itemsTable}\n      {isModalOpen && (`);

// Modal Saving
code = code.replace(/if \(editItem\) updateDepartment\(editItem\.id, data\);\n\s*else addDepartment\(data\);\n\s*\}/,
`              if (editItem) updateDepartment(editItem.id, data);
              else addDepartment(data);
            }
            else if (modalType === 'item') {
               addItem(data);
            }`);

// Modal Component
code = code.replace(/function LocationModal\(\{\s*type,\s*onClose,\s*onSave,\s*initialData\s*\}\s*:\s*\{\s*type:\s*'warehouse'\s*\|\s*'department'\s*\|\s*'company'\s*\|\s*'user',\s*onClose:\s*\(\)\s*=>\s*void,\s*onSave:\s*\(data:\s*any\)\s*=>\s*void,\s*initialData\?:\s*any\s*\}\)/,
`function LocationModal({ type, onClose, onSave, initialData }: { type: 'warehouse' | 'department' | 'company' | 'user' | 'item', onClose: () => void, onSave: (data: any) => void, initialData?: any })`);

code = code.replace(/type === 'user' \? \{ name: '', email: '', role: 'User', status: 'Active' \} :/,
`type === 'user' ? { name: '', email: '', role: 'User', status: 'Active' } :
    type === 'item' ? { name: '', sku: '', categoryId: 'Cat-1', uom: 'Kgs', reorderLevel: 10, type: 'Raw Material' } :`);

code = code.replace(/type === 'company' \? 'New Company\/Plant' : 'New User'\}/,
`type === 'company' ? 'New Company/Plant' : type === 'item' ? 'New Item' : 'New User'}`);

const itemForm = `          {type === 'item' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input type="text" value={(formData as any).sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit of Measure (UoM)</label>
                <input type="text" value={(formData as any).uom} onChange={e => setFormData({...formData, uom: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={(formData as any).type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
                  <option value="Raw Material">Raw Material</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Spare Part">Spare Part</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reorder Level</label>
                <input type="number" value={(formData as any).reorderLevel} onChange={e => setFormData({...formData, reorderLevel: Number(e.target.value)})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
            </>
          )}`;

code = code.replace(/\{type === 'user' && \(/, `${itemForm}\n          {type === 'user' && (`);

fs.writeFileSync('src/pages/Masters.tsx', code);
