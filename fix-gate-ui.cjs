const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/<th className="px-4 py-3">Quantity \& Weight<\/th>\n\s*<th className="px-4 py-3">In Time<\/th>/g, 
  `<th className="px-4 py-3">Quantity & Weight</th>\n                <th className="px-4 py-3">Unit</th>\n                <th className="px-4 py-3">In Time</th>`);

code = code.replace(/<td className="px-4 py-3">\{entry\.quantityWeight\}<\/td>\n\s*<td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">\{entry\.inTime\}<\/td>/g,
  `<td className="px-4 py-3">{entry.quantityWeight}</td>\n                  <td className="px-4 py-3">{entry.unit}</td>\n                  <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">{entry.inTime}</td>`);

code = code.replace(/<div>\n\s*<label className="block text-sm font-medium mb-1">Quantity \& Weight<\/label>\n\s*<input required type="text" value=\{formData\.quantityWeight\} onChange=\{e => setFormData\(\{\.\.\.formData, quantityWeight: e\.target\.value\}\)\} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" \/>\n\s*<\/div>/g,
  `<div>
                  <label className="block text-sm font-medium mb-1">Quantity & Weight</label>
                  <div className="flex gap-2">
                    <input required type="text" value={formData.quantityWeight} onChange={e => setFormData({...formData, quantityWeight: e.target.value})} className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-24 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
                      <option value="Kgs">Kgs</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Box">Box</option>
                      <option value="Ltr">Ltr</option>
                      <option value="Ton">Ton</option>
                      <option value="Bale">Bale</option>
                    </select>
                  </div>
                </div>`);

// Import CSV Function
const importCsvFunc = `
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') return;
      
      const rows = text.split('\\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));
      // Assuming headers are on the first row
      if (rows.length > 1) {
        setIsSyncing(true);
        try {
          let currentSlNo = allEntries.length;
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 5) continue; // Skip empty rows
            
            currentSlNo++;
            const entry: any = {
              slNo: currentSlNo.toString(),
              date: row[1] || '',
              vehicleNo: row[2] || '',
              partyName: row[3] || '',
              materialDescription: row[4] || '',
              quantityWeight: row[5] || '',
              unit: row[6] || 'Kgs',
              inTime: row[7] || '',
              outTime: row[8] || '',
              invoiceNoValue: row[9] || '',
              driverLicenceNo: row[10] || '',
              contactNoSign: row[11] || '',
              securitySign: row[12] || '',
              companyType
            };
            
            await addGateEntry(entry);
          }
        } catch (e) {
          console.error("Failed to import", e);
          alert("Import failed partially or completely.");
        } finally {
          setIsSyncing(false);
          // Reset file input
          e.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
`;

code = code.replace(/const handleExport = \(\) => \{/g, `${importCsvFunc}\n  const handleExport = () => {`);

// Add CSV Import Button
code = code.replace(/<button onClick=\{handleExport\} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">\n\s*<Download className="w-4 h-4" \/> Export CSV\n\s*<\/button>/,
  `<div className="relative overflow-hidden inline-block">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImport} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              title="Import CSV"
            />
            <button className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
              <Download className="w-4 h-4 rotate-180" /> Import CSV
            </button>
          </div>
          <button onClick={handleExport} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>`);

fs.writeFileSync('src/pages/GateRegister.tsx', code);
