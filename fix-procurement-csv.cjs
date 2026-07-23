const fs = require('fs');
let code = fs.readFileSync('src/pages/Procurement.tsx', 'utf8');

code = code.replace(/import \{ Plus, Search, Filter, ShoppingCart, FileText, CheckCircle, Clock \} from 'lucide-react';/,
`import { Plus, Search, Filter, ShoppingCart, FileText, CheckCircle, Clock } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';`);

const csvHandler = `  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      if (activeTab === 'pr') {
        await addPR({
          prNo: row.prNo || 'PR-' + Date.now(),
          date: row.date || new Date().toISOString().split('T')[0],
          department: row.department || '',
          requestedBy: row.requestedBy || '',
          items: [],
          status: row.status || 'Pending',
          remarks: row.remarks || ''
        });
      } else if (activeTab === 'po') {
        await addPO({
          poNo: row.poNo || 'PO-' + Date.now(),
          date: row.date || new Date().toISOString().split('T')[0],
          supplierId: row.supplierId || '',
          prId: row.prId || '',
          items: [],
          status: row.status || 'Draft',
          totalAmount: Number(row.totalAmount) || 0
        });
      } else if (activeTab === 'grn') {
        await addGRN({
          grnNo: row.grnNo || 'GRN-' + Date.now(),
          date: row.date || new Date().toISOString().split('T')[0],
          poId: row.poId || '',
          supplierId: row.supplierId || '',
          invoiceNo: row.invoiceNo || '',
          vehicleNo: row.vehicleNo || '',
          items: [],
          status: row.status || 'Draft'
        });
      }
    }
    alert('Bulk upload completed');
  };`;

code = code.replace(/const \[activeTab, setActiveTab\] = useState\<'pr' \| 'po' \| 'grn'\>\('pr'\);/,
`const [activeTab, setActiveTab] = useState<'pr' | 'po' | 'grn'>('pr');\n${csvHandler}`);

code = code.replace(/<div className="flex gap-4">/,
`<div className="flex gap-4">
          <CSVUploader onUpload={handleBulkUpload} />`);

fs.writeFileSync('src/pages/Procurement.tsx', code);
