const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

code = code.replace(/if \(companyType === 'AIPL'\) \{[\s\S]*?\} else \{[\s\S]*?\}[\s\S]*?await addGateEntry/m, `if (true) {
              entry = {
                companyType,
                slNo: currentSlNo.toString(),
                date: row[1] || '',
                vehicleNo: row[2] || '',
                partyName: row[3] || '',
                gstNo: row[4] || '',
                materialDescription: row[5] || '',
                quantityWeight: row[6] || '',
                unit: row[7] || 'Kgs',
                rateUom: row[8] || '',
                basePrice: row[9] || '',
                sgst: row[10] || '',
                cgst: row[11] || '',
                igst: row[12] || '',
                totalPrice: row[13] || '',
                ewayBill: row[14] || '',
                invoiceNoValue: row[15] || '',
                inTime: row[16] || '',
                outTime: row[17] || '',
                driverLicenceNo: row[18] || '',
                contactNoSign: row[19] || '',
                securitySign: row[20] || ''
              };
            }
            await addGateEntry`);

code = code.replace(/if \(companyType === 'AIPL' \|\| true\) \{[\s\S]*?\} else \{[\s\S]*?\}/m, `if (true) {
      headers = ['SL', 'Date', 'Vehicle No.', 'Party Name', 'GST No.', 'Material Description', 'Quantity', 'UOM', 'RATE/UOM', 'Base Price', 'SGST', 'CGST', 'IGST', 'Total Price', 'e-Way Bill', 'Invoice No./Value', 'In Time', 'Out Time', 'Driver Licence No.', 'Contact No./Sign.', 'Security Sign.'];
      csvContent += headers.join(',') + '\\n' + filteredEntries.map(e => 
        \`"\${e.slNo}","\${e.date}","\${e.vehicleNo}","\${e.partyName}","\${e.gstNo}","\${e.materialDescription}","\${e.quantityWeight}","\${e.unit}","\${e.rateUom}","\${e.basePrice}","\${e.sgst}","\${e.cgst}","\${e.igst}","\${e.totalPrice}","\${e.ewayBill}","\${e.invoiceNoValue}","\${e.inTime}","\${e.outTime}","\${e.driverLicenceNo}","\${e.contactNoSign}","\${e.securitySign}"\`
      ).join('\\n');
    }`);

fs.writeFileSync('src/pages/GateRegister.tsx', code);
