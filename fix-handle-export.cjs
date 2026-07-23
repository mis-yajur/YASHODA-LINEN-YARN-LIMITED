const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

const exportFuncRegex = /const handleExport = \(\) => \{[\s\S]*?link\.click\(\);\s*document\.body\.removeChild\(link\);\s*\};/;

const newExportFunc = `const handleExport = () => {
    const headers = ['SL', 'Date', 'Vehicle No.', 'Party Name', 'GST No.', 'Material Description', 'Quantity', 'UOM', 'RATE/UOM', 'Base Price', 'SGST', 'CGST', 'IGST', 'Total Price', 'e-Way Bill', 'Invoice No./Value', 'In Time', 'Out Time', 'Driver Licence No.', 'Contact No./Sign.', 'Security Sign.'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\\n' + filteredEntries.map(e => 
      \`"\${e.slNo}","\${e.date}","\${e.vehicleNo}","\${e.partyName}","\${e.gstNo}","\${e.materialDescription}","\${e.quantityWeight}","\${e.unit}","\${e.rateUom}","\${e.basePrice}","\${e.sgst}","\${e.cgst}","\${e.igst}","\${e.totalPrice}","\${e.ewayBill}","\${e.invoiceNoValue}","\${e.inTime}","\${e.outTime}","\${e.driverLicenceNo}","\${e.contactNoSign}","\${e.securitySign}"\`
    ).join('\\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`gate_register_\${companyType}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

code = code.replace(exportFuncRegex, newExportFunc);

fs.writeFileSync('src/pages/GateRegister.tsx', code);
