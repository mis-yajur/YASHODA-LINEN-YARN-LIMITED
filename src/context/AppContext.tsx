import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Item, Department, Warehouse, Stock, MaterialIssue, Supplier, MaterialIssueItem, GateEntry } from '../types';

interface AppContextType extends AppState {
  setScriptUrl: (url: string) => void;
  initApp: () => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => Promise<void>;
  addSupplier: (sup: Omit<Supplier, 'id'>) => Promise<void>;
  addGateEntry: (entry: Omit<GateEntry, 'id'>) => Promise<void>;
  issueMaterial: (issue: Omit<MaterialIssue, 'id'>, items: Omit<MaterialIssueItem, 'id' | 'issueId'>[]) => Promise<void>;
  receiveStock: (itemId: string, warehouseId: string, quantity: number, batchNo?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yashoda_inventory_data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    scriptUrl: localStorage.getItem('yashoda_script_url') || 'https://script.google.com/macros/s/AKfycbxhbZpukrSNyJEvK_fAg1VgjBd6pIS9e3T_AvygI1CZaII27ggbhtry4rI_abUtgN0A/exec',
    departments: [],
    suppliers: [],
    items: [],
    warehouses: [],
    stock: [],
    materialIssues: [],
    materialIssueItems: [],
    gateEntries: [],
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
      gateEntries: state.gateEntries
    }));
  }, [state, initialized]);

  const syncToSheets = async (actionName: string, sheetName: string, payload: any) => {
    if (!state.scriptUrl) return;
    try {
      await fetch(state.scriptUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: actionName,
          sheetName,
          data: payload
        })
      });
    } catch (e) {
      console.error('Offline or sync failed. Data saved locally.', e);
    }
  };

  const setScriptUrl = (url: string) => {
    localStorage.setItem('yashoda_script_url', url);
    setState(s => ({ ...s, scriptUrl: url }));
  };

  const initApp = async () => {
    setState(s => ({ ...s, isSyncing: true }));
    try {
      if (state.scriptUrl) {
        try {
          const res = await fetch(`${state.scriptUrl}?action=getAll`);
          if (res.ok) {
            const data = await res.json();
            setState(s => ({
              ...s,
              departments: data.departments || [],
              suppliers: data.suppliers || [],
              items: data.items || [],
              warehouses: data.warehouses || [],
              stock: data.stock || [],
              materialIssues: data.material_issues || [],
              materialIssueItems: data.material_issue_items || [],
              gateEntries: data.gate_entries || [],
              isSyncing: false
            }));
            setInitialized(true);
            return;
          }
        } catch(e) {
          console.error("Failed to fetch from sheets, falling back to local storage", e);
        }
      }

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

  return (
    <AppContext.Provider value={{ ...state, setScriptUrl, initApp, addItem, addDepartment, addWarehouse, addSupplier, addGateEntry, issueMaterial, receiveStock }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
