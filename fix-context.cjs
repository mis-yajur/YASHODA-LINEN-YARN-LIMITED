const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// The problematic part starts at `      if (saved) {`
const replacement = `      if (saved) {
        const parsed = JSON.parse(saved);
        setState(s => ({
          ...s,
          ...parsed,
          isSyncing: false
        }));
      } else {
        setState(s => ({ ...s, isSyncing: false }));
      }
    } catch (e) {
      console.error(e);
      setState(s => ({ ...s, isSyncing: false }));
    }
  };

  const addItem = async (item) => {
    const newItem = { ...item, id: Date.now().toString() };
    setState(s => ({ ...s, items: [...s.items, newItem] }));
    await syncToSheets('append', 'items', newItem);
  };

  const addDepartment = async (dept) => {
    const newDept = { ...dept, id: Date.now().toString() };
    setState(s => ({ ...s, departments: [...s.departments, newDept] }));
    await syncToSheets('append', 'departments', newDept);
  };

  const updateDepartment = async (id, data) => {
    setState(s => ({
      ...s,
      departments: s.departments.map(d => d.id === id ? { ...d, ...data } : d)
    }));
  };

  const deleteDepartment = async (id) => {
    setState(s => ({
      ...s,
      departments: s.departments.filter(d => d.id !== id)
    }));
  };

  const addWarehouse = async (wh) => {
    const newWh = { ...wh, id: Date.now().toString() };
    setState(s => ({ ...s, warehouses: [...s.warehouses, newWh] }));
    await syncToSheets('append', 'warehouses', newWh);
  };

  const updateWarehouse = async (id, data) => {
    setState(s => ({
      ...s,
      warehouses: s.warehouses.map(w => w.id === id ? { ...w, ...data } : w)
    }));
  };

  const deleteWarehouse = async (id) => {
    setState(s => ({
      ...s,
      warehouses: s.warehouses.filter(w => w.id !== id)
    }));
  };

  const addSupplier = async (sup) => {
    const newSup = { ...sup, id: Date.now().toString() };
    setState(s => ({ ...s, suppliers: [...s.suppliers, newSup] }));
    await syncToSheets('append', 'suppliers', newSup);
  };

  const addGateEntry = async (entry) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    setState(s => ({ ...s, gateEntries: [...s.gateEntries, newEntry] }));
    
    // We map snake_case 'gate_entries_aipl' and 'gate_entries_yashoda' 
    const typeKey = entry.companyType === 'AIPL' ? 'gate_entries_aipl' : 'gate_entries_yashoda';
    await syncToSheets('append', typeKey, newEntry);
  };

  const addPR = async (pr) => {
    const newPR = { ...pr, id: Date.now().toString() };
    setState(s => ({ ...s, prs: [...s.prs, newPR] }));
    await syncToSheets('append', 'prs', newPR);
  };

  const addPO = async (po) => {
    const newPO = { ...po, id: Date.now().toString() };
    setState(s => ({ ...s, pos: [...s.pos, newPO] }));
    await syncToSheets('append', 'pos', newPO);
  };

  const addGRN = async (grn) => {
    const newGRN = { ...grn, id: Date.now().toString() };
    setState(s => ({ ...s, grns: [...s.grns, newGRN] }));
    await syncToSheets('append', 'grns', newGRN);
  };

  const addStockTransfer = async (transfer) => {
    const newTransfer = { ...transfer, id: Date.now().toString() };
    setState(s => ({ ...s, stockTransfers: [...s.stockTransfers, newTransfer] }));
    await syncToSheets('append', 'stock_transfers', newTransfer);
  };

  const addStockAdjustment = async (adjustment) => {
    const newAdjustment = { ...adjustment, id: Date.now().toString() };
    setState(s => ({ ...s, stockAdjustments: [...s.stockAdjustments, newAdjustment] }));
    await syncToSheets('append', 'stock_adjustments', newAdjustment);
  };

  const issueMaterial = async (issue, itemsData) => {
    const newIssue = { ...issue, id: Date.now().toString() };
    const newItems = itemsData.map((item, index) => ({
      ...item,
      id: Date.now().toString() + '-' + index,
      issueId: newIssue.id
    }));

    setState(s => {
      let stockUpdates = [...s.stock];
      for (const item of newItems) {
        const existing = stockUpdates.find(st => st.itemId === item.itemId && st.warehouseId === issue.fromWarehouseId);
        if (existing) {
          existing.quantity -= item.quantity;
        } else {
          stockUpdates.push({
            id: Date.now().toString() + Math.random(),
            itemId: item.itemId,
            warehouseId: issue.fromWarehouseId,
            quantity: -item.quantity,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      return { 
        ...s, 
        materialIssues: [...s.materialIssues, newIssue],
        materialIssueItems: [...s.materialIssueItems, ...newItems],
        stock: stockUpdates
      };
    });

    await syncToSheets('append', 'material_issues', newIssue);
    for (const item of newItems) {
      await syncToSheets('append', 'material_issue_items', item);
    }
  };
`;

const regex = /      if \(saved\) \{[\s\S]*?\/\/ Note: Stock update sync logic would ideally happen on the backend or via an 'update' call\.\n  \};/m;
code = code.replace(regex, replacement);

fs.writeFileSync('src/context/AppContext.tsx', code);
