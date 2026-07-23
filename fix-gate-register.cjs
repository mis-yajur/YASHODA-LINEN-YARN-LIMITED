const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

// 1. Update mapping
code = code.replace(/quantityWeight: row\[5\] \|\| '',\n\s*inTime: row\[6\] \|\| '',\n\s*outTime: row\[7\] \|\| '',\n\s*invoiceNoValue: row\[8\] \|\| '',\n\s*driverLicenceNo: row\[9\] \|\| '',\n\s*contactNoSign: row\[10\] \|\| '',\n\s*securitySign: ''/,
`          quantityWeight: row[5] || '',
          unit: row[6] || '',
          inTime: row[7] || '',
          outTime: row[8] || '',
          invoiceNoValue: row[9] || '',
          driverLicenceNo: row[10] || '',
          contactNoSign: row[11] || '',
          securitySign: row[12] || ''`);

// 2. Form state initialization
code = code.replace(/quantityWeight: '',\n\s*inTime: '',/g, `    quantityWeight: '',\n    unit: 'Kgs',\n    inTime: '',`);

// 3. Export CSV headers & mapping
code = code.replace(/const headers = \['SL\. No', 'Date', 'Vehicle No\.', 'Party Name', 'Material Description', 'Quantity & Weight', 'In Time', 'Out Time', 'Invoice No\.\/Value', 'Driver Licence No\.', 'Contact No\.'\];/, 
  `const headers = ['SL. No', 'Date', 'Vehicle No.', 'Party Name', 'Material Description', 'Quantity & Weight', 'Unit', 'In Time', 'Out Time', 'Invoice No./Value', 'Driver Licence No.', 'Contact No.', 'Security Sign'];`);

code = code.replace(/return \`"\$\{e\.slNo\}","\$\{e\.date\}","\$\{e\.vehicleNo\}","\$\{e\.partyName\}","\$\{e\.materialDescription\}","\$\{e\.quantityWeight\}","\$\{e\.inTime\}","\$\{e\.outTime\}","\$\{e\.invoiceNoValue\}","\$\{e\.driverLicenceNo\}","\$\{e\.contactNoSign\}"\`;/,
  `return \`"\${e.slNo}","\${e.date}","\${e.vehicleNo}","\${e.partyName}","\${e.materialDescription}","\${e.quantityWeight}","\${e.unit}","\${e.inTime}","\${e.outTime}","\${e.invoiceNoValue}","\${e.driverLicenceNo}","\${e.contactNoSign}","\${e.securitySign}"\`;`);

fs.writeFileSync('src/pages/GateRegister.tsx', code);
