const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Fix issue.fromWarehouseId which doesn't exist -> we need to just update stock generally, or maybe we just don't have warehouse info on MaterialIssue?
// I will just use 'main-warehouse' or something for now, or just remove the warehouse filter for stock.
code = code.replace(/issue\.fromWarehouseId/g, "warehouseId");
code = code.replace(/const existingStock = stockSnapshot\.docs\.map\(d => \(\{id: d\.id, \.\.\.d\.data\(\)\}\)\)\n\s*\.find\(\(st: any\) => st\.itemId === item\.itemId && st\.warehouseId === warehouseId\);/g,
`const existingStock = stockSnapshot.docs.map(d => ({id: d.id, ...d.data()}))
          .find((st: any) => st.itemId === item.itemId);`);

code = code.replace(/batch\.set\(stockRef, \{ itemId: item\.itemId, warehouseId: warehouseId, quantity: -item\.quantity \}\);/g,
`batch.set(stockRef, { itemId: item.itemId, warehouseId: 'default', quantity: -item.quantity });`);

code = code.replace(/setScriptUrl,/g, "");

fs.writeFileSync('src/context/AppContext.tsx', code);
