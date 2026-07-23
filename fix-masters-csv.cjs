const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/import \{ Plus, MapPin, Building, Store, X, FolderTree, Users, Factory, Pencil, Trash2, Package \} from 'lucide-react';/,
`import { Plus, MapPin, Building, Store, X, FolderTree, Users, Factory, Pencil, Trash2, Package } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';`);

const csvHandler = `  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      if (activeTab === 'departments') {
        await addDepartment({ name: row.name || '', head: row.head || '', plantId: row.plantId || 'Plant-1' });
      } else if (activeTab === 'warehouses') {
        await addWarehouse({ name: row.name || '', type: row.type || 'Warehouse' });
      } else if (activeTab === 'items') {
        await addItem({ 
          name: row.name || '', 
          sku: row.sku || '', 
          categoryId: row.categoryId || 'Cat-1', 
          uom: row.uom || 'Kgs', 
          reorderLevel: Number(row.reorderLevel) || 10, 
          type: row.type || 'Raw Material' 
        });
      }
    }
    alert('Bulk upload completed');
  };`;

code = code.replace(/const \[editItem, setEditItem\] = useState<any>\(null\);/,
`const [editItem, setEditItem] = useState<any>(null);\n${csvHandler}`);

code = code.replace(/\{\(activeTab === 'warehouses' \|\| activeTab === 'departments' \|\| activeTab === 'companies' \|\| activeTab === 'users' \|\| activeTab === 'items'\) && \(/,
`{(activeTab === 'warehouses' || activeTab === 'departments' || activeTab === 'companies' || activeTab === 'users' || activeTab === 'items') && (
          <div className="flex gap-2">
            <CSVUploader onUpload={handleBulkUpload} />`);

code = code.replace(/Add \{activeTab === 'warehouses' \? 'Warehouse' : activeTab === 'departments' \? 'Department' : activeTab === 'companies' \? 'Company' : activeTab === 'items' \? 'Item' : 'User'\}\n\s*<\/button>\n\s*\)/,
`Add {activeTab === 'warehouses' ? 'Warehouse' : activeTab === 'departments' ? 'Department' : activeTab === 'companies' ? 'Company' : activeTab === 'items' ? 'Item' : 'User'}
          </button>
          </div>
        )`);

fs.writeFileSync('src/pages/Masters.tsx', code);
