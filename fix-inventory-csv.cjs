const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

code = code.replace(/import \{ Plus, Search, Edit2, Trash2, X, Package, ArrowRightLeft, Settings2 \} from 'lucide-react';/,
`import { Plus, Search, Edit2, Trash2, X, Package, ArrowRightLeft, Settings2 } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';`);

const csvHandler = `  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      if (activeTab === 'items') {
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

code = code.replace(/const \[modalType, setModalType\] = useState\<'item' \| 'transfer' \| 'adjustment'\>\('item'\);/,
`const [modalType, setModalType] = useState<'item' | 'transfer' | 'adjustment'>('item');\n${csvHandler}`);

code = code.replace(/\{activeTab === 'items' && \(\n\s*<button/,
`{activeTab === 'items' && (
          <div className="flex gap-2">
            <CSVUploader onUpload={handleBulkUpload} />
            <button`);

code = code.replace(/<Plus className="w-5 h-5" \/> Add Item\n\s*<\/button>\n\s*\)/,
`<Plus className="w-5 h-5" /> Add Item
            </button>
          </div>
        )`);

fs.writeFileSync('src/pages/Inventory.tsx', code);
