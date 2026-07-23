import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Item, Department, Warehouse, Stock, MaterialIssue, Supplier, MaterialIssueItem, GateEntry, PurchaseRequisition, PurchaseOrder, GRN, StockTransfer, StockAdjustment } from '../types';

interface AppContextType extends AppState {
  setScriptUrl: (url: string) => void;
  initApp: () => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => Promise<void>;
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
      const savedUrl = state.scriptUrl || localStorage.getItem('yashoda_inventory_script_url');
      if (savedUrl) {
        // Use Google Apps Script Web App
        const res = await fetch(savedUrl, {
          method: 'POST',
          headers: {
            // Using text/plain avoids CORS preflight OPTIONS request
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: actionName,
            sheetName: sheetName,
            data: payload,
            spreadsheetId: localStorage.getItem('yashoda_inventory_spreadsheet_id')
          })
        });
        const result = await res.json();
        if (!result.success) {
          console.error("Apps Script Error:", result.error, result.trace);
        }
      } else {
        // Fallback to Google Sheets API (OAuth) if Apps Script isn't configured
        const { appendRow } = await import('../lib/sheets');
        const spreadsheetId = localStorage.getItem('yashoda_inventory_spreadsheet_id');
        if (!spreadsheetId) {
          // App is not connected to sheets yet, just save locally.
          return;
        }
        
        // Map payload object to a flat array of string values
        const values = Object.values(payload).map(val => 
          typeof val === 'string' ? val : JSON.stringify(val)
        );

        // Map snake_case to PascalCase for the tab titles created in sheets.ts
        const sheetNameMapping: Record<string, string> = {
          'items': 'Items',
          'departments': 'Departments',
          'warehouses': 'Warehouses',
          'suppliers': 'Suppliers',
          'gate_entries': 'GateEntries',
          'material_issues': 'MaterialIssues',
          'material_issue_items': 'MaterialIssues', // Just putting items in MaterialIssues tab for now
          'prs': 'PRs',
          'pos': 'POs',
          'grns': 'GRNs',
          'stock_transfers': 'StockTransfers',
          'stock_adjustments': 'StockAdjustments'
        };

        const mappedSheetName = sheetNameMapping[sheetName] || sheetName;
        await appendRow(spreadsheetId, mappedSheetName, values);
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
         const defaultWh: Warehouse = { id: crypto.randomUUID(), name: 'Main Store', type: 'Warehouse' };
         setState(s => ({ ...s, warehouses: [defaultWh], isSyncing: false }));
      }
    } catch (error) {
      console.error('Failed to init app:', error);
      setState(s => ({ ...s, isSyncing: false }));
    } finally {
      setInitialized(true);
    }
  };

  const addItem = async (itemData: Omit<Item, 'id'>) => {
    const item: Item = { ...itemData, id: crypto.randomUUID() };
    setState(s => ({ ...s, items: [...s.items, item] }));
    await syncToSheets('append', 'items', item);
  };

  const addDepartment = async (deptData: Omit<Department, 'id'>) => {
    const dept: Department = { ...deptData, id: crypto.randomUUID() };
    setState(s => ({ ...s, departments: [...s.departments, dept] }));
    await syncToSheets('append', 'departments', dept);
  };

  const addWarehouse = async (whData: Omit<Warehouse, 'id'>) => {
    const wh: Warehouse = { ...whData, id: crypto.randomUUID() };
    setState(s => ({ ...s, warehouses: [...s.warehouses, wh] }));
    await syncToSheets('append', 'warehouses', wh);
  };

  const addSupplier = async (supData: Omit<Supplier, 'id'>) => {
    const sup: Supplier = { ...supData, id: crypto.randomUUID() };
    setState(s => ({ ...s, suppliers: [...s.suppliers, sup] }));
    await syncToSheets('append', 'suppliers', sup);
  };

  const addGateEntry = async (entryData: Omit<GateEntry, 'id'>) => {
    const entry: GateEntry = { ...entryData, id: crypto.randomUUID() };
    setState(s => ({ ...s, gateEntries: [...s.gateEntries, entry] }));
    await syncToSheets('append', 'gate_entries', entry);
  };

  const issueMaterial = async (issueData: Omit<MaterialIssue, 'id'>, itemsData: Omit<MaterialIssueItem, 'id' | 'issueId'>[]) => {
    const issue: MaterialIssue = { ...issueData, id: crypto.randomUUID() };
    const items = itemsData.map(i => ({ ...i, id: crypto.randomUUID(), issueId: issue.id }));
    
    setState(s => {
      // Deduct from stock logic here (simplified for demo)
      let stockUpdates = [...s.stock];
      items.forEach(reqItem => {
         const existingStock = stockUpdates.find(st => st.itemId === reqItem.itemId);
         if (existingStock) {
           existingStock.quantity -= reqItem.quantity;
         }
      });
      return { 
        ...s, 
        materialIssues: [...s.materialIssues, issue],
        materialIssueItems: [...s.materialIssueItems, ...items],
        stock: stockUpdates
      };
    });

    await syncToSheets('append', 'material_issues', issue);
    for (const item of items) {
      await syncToSheets('append', 'material_issue_items', item);
    }
    // Note: Stock update sync logic would ideally happen on the backend or via an 'update' call.
  };

  const receiveStock = async (itemId: string, warehouseId: string, quantity: number, batchNo?: string) => {
    setState(s => {
      let stockUpdates = [...s.stock];
      const existing = stockUpdates.find(st => st.itemId === itemId && st.warehouseId === warehouseId && st.batchNo === batchNo);
      if (existing) {
        existing.quantity += quantity;
      } else {
        stockUpdates.push({ id: crypto.randomUUID(), itemId, warehouseId, quantity, batchNo });
      }
      return { ...s, stock: stockUpdates };
    });
    // Complex stock updates need custom endpoints in Code.gs
  };

  const addPR = async (prData: Omit<PurchaseRequisition, 'id'>) => {
    const pr: PurchaseRequisition = { ...prData, id: crypto.randomUUID() };
    setState(s => ({ ...s, prs: [...(s.prs || []), pr] }));
    await syncToSheets('append', 'prs', pr);
  };

  const addPO = async (poData: Omit<PurchaseOrder, 'id'>) => {
    const po: PurchaseOrder = { ...poData, id: crypto.randomUUID() };
    setState(s => ({ ...s, pos: [...(s.pos || []), po] }));
    await syncToSheets('append', 'pos', po);
  };

  const addGRN = async (grnData: Omit<GRN, 'id'>) => {
    const grn: GRN = { ...grnData, id: crypto.randomUUID() };
    setState(s => ({ ...s, grns: [...(s.grns || []), grn] }));
    await syncToSheets('append', 'grns', grn);
  };

  const addStockTransfer = async (transferData: Omit<StockTransfer, 'id'>) => {
    const transfer: StockTransfer = { ...transferData, id: crypto.randomUUID() };
    setState(s => ({ ...s, stockTransfers: [...(s.stockTransfers || []), transfer] }));
    await syncToSheets('append', 'stock_transfers', transfer);
  };

  const addStockAdjustment = async (adjustmentData: Omit<StockAdjustment, 'id'>) => {
    const adjustment: StockAdjustment = { ...adjustmentData, id: crypto.randomUUID() };
    setState(s => ({ ...s, stockAdjustments: [...(s.stockAdjustments || []), adjustment] }));
    await syncToSheets('append', 'stock_adjustments', adjustment);
  };

  return (
    <AppContext.Provider value={{ ...state, setScriptUrl, initApp, addItem, addDepartment, addWarehouse, addSupplier, addGateEntry, addPR, addPO, addGRN, addStockTransfer, addStockAdjustment, issueMaterial, receiveStock }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
