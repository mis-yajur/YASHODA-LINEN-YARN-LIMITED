const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/import \{ Search, Filter, Download, Plus, MapPin, X, ExternalLink, LogIn \} from 'lucide-react';/,
`import { Search, Filter, Download, Plus, MapPin, X, ExternalLink, LogIn } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';`);

const csvHandler = `  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      const entry: Omit<GateEntry, 'id'> = {
        companyType: row.companyType || companyType,
        slNo: row.slNo || String(Date.now()),
        date: row.date || new Date().toISOString().split('T')[0],
        vehicleNo: row.vehicleNo || '',
        partyName: row.partyName || '',
        materialDescription: row.materialDescription || '',
        quantityWeight: row.quantityWeight || '',
        unit: row.unit || 'Kgs',
        invoiceNoValue: row.invoiceNoValue || '',
        inTime: row.inTime || '',
        outTime: row.outTime || '',
        driverLicenceNo: row.driverLicenceNo || '',
        contactNoSign: row.contactNoSign || ''
      };
      await addGateEntry(entry);
    }
    alert('Bulk upload completed');
  };`;

code = code.replace(/const \[isModalOpen, setIsModalOpen\] = useState\(false\);/,
`const [isModalOpen, setIsModalOpen] = useState(false);\n${csvHandler}`);

code = code.replace(/<button\s*className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"\s*onClick=\{\(\) => setIsModalOpen\(true\)\}\s*>\s*<Plus className="w-4 h-4" \/> New Entry\s*<\/button>/,
`<CSVUploader onUpload={handleBulkUpload} />
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>`);

fs.writeFileSync('src/pages/GateRegister.tsx', code);
