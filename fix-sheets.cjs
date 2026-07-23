const fs = require('fs');
let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

const regexSheets = /sheets: \[\n        \{ properties: \{ title: 'GateEntries' \} \}/;
code = code.replace(regexSheets, `sheets: [
        { properties: { title: 'GateEntries_Yashoda' } },
        { properties: { title: 'GateEntries_AIPL' } }`);

const regexHeaders = /\/\/ Initialize headers for Gate Entries\n  await appendRow\(spreadsheetId, 'GateEntries', \[\n    'SL\. No',\n    'Date',\n    'Vehicle No\.',\n    'Party Name',\n    'Material Description',\n    'Quantity & Weight',\n    'In Time',\n    'Out Time',\n    'Invoice No\. \/ Value',\n    'Driver Licence No\.',\n    'Contact No\.'\n  \]\);/;

code = code.replace(regexHeaders, `// Initialize headers for Gate Entries
  const gateHeaders = [
    'SL. No',
    'Date',
    'Vehicle No.',
    'Party Name',
    'Material Description',
    'Quantity & Weight',
    'Unit',
    'In Time',
    'Out Time',
    'Invoice No. / Value',
    'Driver Licence No.',
    'Contact No.',
    'Security Sign'
  ];
  await appendRow(spreadsheetId, 'GateEntries_Yashoda', gateHeaders);
  await appendRow(spreadsheetId, 'GateEntries_AIPL', gateHeaders);`);

fs.writeFileSync('src/lib/sheets.ts', code);
