const fs = require('fs');
let code = fs.readFileSync('src/pages/GateRegister.tsx', 'utf8');

// In import/export:
code = code.replace(/if \(companyType === 'AIPL'\) \{[\s\S]*?\} else \{[\s\S]*?headers = \['SL', 'Date', 'Vehicle No\.', 'Party Name', 'Material Description'/g, "if (companyType === 'AIPL' || true) {\n      headers = ['SL', 'Date', 'Vehicle No.', 'Party Name', 'GST No.', 'Material Description',");

// table headers
code = code.replace(/\{companyType === 'AIPL' && <th className="px-4 py-3">GST No\.<\/th>\}/g, '<th className="px-4 py-3">GST No.</th>');
code = code.replace(/\{companyType === 'AIPL' && \(\s*<>\s*<th className="px-4 py-3">RATE\/UOM<\/th>[\s\S]*?<th className="px-4 py-3">e-Way Bill<\/th>\s*<\/>\s*\)\}/g, `<th className="px-4 py-3">RATE/UOM</th>
                    <th className="px-4 py-3">Base Price</th>
                    <th className="px-4 py-3">SGST</th>
                    <th className="px-4 py-3">CGST</th>
                    <th className="px-4 py-3">IGST</th>
                    <th className="px-4 py-3">Total Price</th>
                    <th className="px-4 py-3">e-Way Bill</th>`);

// table cells
code = code.replace(/\{companyType === 'AIPL' && <td className="px-4 py-3">\{entry\.gstNo \|\| '-'\}<\/td>\}/g, `<td className="px-4 py-3">{entry.gstNo || '-'}</td>`);
code = code.replace(/\{companyType === 'AIPL' && \(\s*<>\s*<td className="px-4 py-3">\{entry\.rateUom \|\| '-'\}<\/td>[\s\S]*?<td className="px-4 py-3">\{entry\.ewayBill \|\| '-'\}<\/td>\s*<\/>\s*\)\}/g, `<td className="px-4 py-3">{entry.rateUom || '-'}</td>
                      <td className="px-4 py-3">{entry.basePrice || '-'}</td>
                      <td className="px-4 py-3">{entry.sgst || '-'}</td>
                      <td className="px-4 py-3">{entry.cgst || '-'}</td>
                      <td className="px-4 py-3">{entry.igst || '-'}</td>
                      <td className="px-4 py-3">{entry.totalPrice || '-'}</td>
                      <td className="px-4 py-3">{entry.ewayBill || '-'}</td>`);

// form fields
code = code.replace(/\{companyType === 'AIPL' && \(\s*<div>\s*<label className="block text-sm font-medium mb-1">GST No\.<\/label>[\s\S]*?<\/div>\s*\)\}/g, `<div>
                    <label className="block text-sm font-medium mb-1">GST No.</label>
                    <input type="text" value={formData.gstNo} onChange={e => setFormData({...formData, gstNo: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                  </div>`);
                  
code = code.replace(/\{companyType === 'AIPL' && \(\s*<>\s*<div>\s*<label className="block text-sm font-medium mb-1">RATE\/UOM<\/label>[\s\S]*?<\/div>\s*<\/>\s*\)\}/g, `<div>
                      <label className="block text-sm font-medium mb-1">RATE/UOM</label>
                      <input type="text" value={formData.rateUom} onChange={e => setFormData({...formData, rateUom: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Base Price</label>
                      <input type="text" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SGST</label>
                      <input type="text" value={formData.sgst} onChange={e => setFormData({...formData, sgst: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CGST</label>
                      <input type="text" value={formData.cgst} onChange={e => setFormData({...formData, cgst: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">IGST</label>
                      <input type="text" value={formData.igst} onChange={e => setFormData({...formData, igst: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Price</label>
                      <input type="text" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">e-Way Bill</label>
                      <input type="text" value={formData.ewayBill} onChange={e => setFormData({...formData, ewayBill: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>`);
                    
code = code.replace(/colSpan=\{companyType === 'AIPL' \? 20 : 12\}/g, "colSpan={21}");

fs.writeFileSync('src/pages/GateRegister.tsx', code);
