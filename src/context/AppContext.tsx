import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Item, Department, Warehouse, Stock, MaterialIssue, Supplier, MaterialIssueItem, GateEntry, PurchaseRequisition, PurchaseOrder, GRN, StockTransfer, StockAdjustment } from '../types';

interface AppContextType extends AppState {
  setScriptUrl: (url: string) => void;
  initApp: () => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  addSupplier: (sup: Omit<Supplier, 'id'>) => Promise<void>;
  addGateEntry: (entry: Omit<GateEntry, 'id'>) => Promise<void>;
  addPR: (pr: Omit<PurchaseRequisition, 'id'>) => Promise<void>;
  addPO: (po: Omit<PurchaseOrder, 'id'>) => Promise<void>;
  addGRN: (grn: Omit<GRN, 'id'>) => Promise<void>;
  addStockTransfer: (transfer: Omit<StockTransfer, 'id'>) => Promise<void>;
  addStockAdjustment: (adjustment: Omit<StockAdjustment, 'id'>) => Promise<void>;
  issueMaterial: (issue: Omit<MaterialIssue, 'id'>, items: Omit<MaterialIssueItem, 'id' | 'issueId'>[]) => Promise<void>;
  receiveStock: (itemId: string, warehouseId: string, quantity: number, batchNo?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yashoda_inventory_data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    departments: [],
    suppliers: [],
    items: [],
    warehouses: [],
    stock: [],
    materialIssues: [],
    materialIssueItems: [],
    gateEntries: [],
    prs: [],
    pos: [],
    grns: [],
    stockTransfers: [],
    stockAdjustments: [],
    isSyncing: false
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      departments: state.departments,
      suppliers: state.suppliers,
      items: state.items,
      warehouses: state.warehouses,
      stock: state.stock,
      materialIssues: state.materialIssues,
      materialIssueItems: state.materialIssueItems,
      gateEntries: state.gateEntries,
      prs: state.prs,
      pos: state.pos,
      grns: state.grns,
      stockTransfers: state.stockTransfers,
      stockAdjustments: state.stockAdjustments
    }));
  }, [state, initialized]);

  const syncToSheets = async (actionName: string, sheetName: string, payload: any) => {
    try {
      // Basic schema validation to ensure headers match expected types
      const validatedPayload: Record<string, string> = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value === null || value === undefined) {
          validatedPayload[key] = '';
        } else if (typeof value === 'object') {
          validatedPayload[key] = JSON.stringify(value);
        } else {
          validatedPayload[key] = String(value);
        }
      }

      const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhbZpukrSNyJEvK_fAg1VgjBd6pIS9e3T_AvygI1CZaII27ggbhtry4rI_abUtgN0A/exec";
      const savedUrl = state.scriptUrl || localStorage.getItem('yashoda_inventory_script_url') || APP_SCRIPT_URL;
      if (savedUrl) {
        // Use Google Apps Script Web App
        const res = await fetch(savedUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            // Using text/plain avoids CORS preflight OPTIONS request
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: actionName,
            sheetName: sheetName,
            data: validatedPayload,
            spreadsheetId: localStorage.getItem('yashoda_inventory_spreadsheet_id')
          })
        });
        // We cannot read res.json() when mode is no-cors. We assume it successfully triggered if fetch didn't throw.
        
      }
    } catch (e) {
      console.error('Offline or sync failed. Data saved locally.', e);
    }
  };

  const setScriptUrl = (url: string) => {
    setState(s => ({ ...s, scriptUrl: url }));
    localStorage.setItem('yashoda_inventory_script_url', url);
  };

  const initApp = async () => {
    setState(s => ({ ...s, isSyncing: true }));
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
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


  const receiveStock = async (itemId: string, warehouseId: string, quantity: number, batchNo?: string) => {
    setState(s => {
      let stockUpdates = [...s.stock];
      const existing = stockUpdates.find(st => st.itemId === itemId && st.warehouseId === warehouseId && st.batchNo === batchNo);
      if (existing) {
        existing.quantity += quantity;
      } else {
        stockUpdates.push({
          id: Date.now().toString(),
          itemId,
          warehouseId,
          quantity,
          batchNo,
          lastUpdated: new Date().toISOString()
        });
      }
      return { ...s, stock: stockUpdates };
    });
  };

  const value = {
    ...state,
    setScriptUrl,
    initApp,
    addItem,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addSupplier,
    addGateEntry,
    addPR,
    addPO,
    addGRN,
    addStockTransfer,
    addStockAdjustment,
    issueMaterial,
    receiveStock,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
