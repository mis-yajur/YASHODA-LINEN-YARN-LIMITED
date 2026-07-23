import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, signInWithGoogle, logout, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error, operationType, path);
}
import { AppState, Item, Department, Warehouse, Stock, MaterialIssue, Supplier, MaterialIssueItem, GateEntry, PurchaseRequisition, PurchaseOrder, GRN, StockTransfer, StockAdjustment } from '../types';

import { User } from 'firebase/auth';

interface AppContextType extends AppState {
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
    initApp: () => Promise<void>;
  addUser: (user: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
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
    users: [], departments: [],
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
    isSyncing: true,
    user: null
  });

  const [initialized, setInitialized] = useState(false);

  

  
  
  
  const initApp = async () => {
    const storedUser = localStorage.getItem('yashodaUser');
    if (storedUser) {
      setState(s => ({ ...s, user: JSON.parse(storedUser), isSyncing: false }));
      setupListeners();
    } else {
      setState(s => ({ ...s, isSyncing: false }));
    }
  };

  const setupListeners = () => {
    const collections = [
      'users',
      'departments', 'suppliers', 'items', 'warehouses', 'stock',
      'materialIssues', 'materialIssueItems', 'gateEntries', 'prs',
      'pos', 'grns', 'stockTransfers', 'stockAdjustments'
    ];
    
    collections.forEach(coll => {
      onSnapshot(collection(db, coll), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState(s => ({ ...s, [coll]: data as any }));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, coll);
      });
    });
  };

  
  const login = async () => {
    try {
      await signInWithGoogle();
    } catch(e) {
      console.error(e);
    }
  }

  const loginWithEmail = async (email: string, pass: string) => {
    const mockUser = { displayName: email.split('@')[0], email, uid: 'mock-' + Date.now() };
    localStorage.setItem('yashodaUser', JSON.stringify(mockUser));
    setState(s => ({ ...s, user: mockUser as any }));
    setupListeners();
  }


  const logoutUser = async () => {
    localStorage.removeItem('yashodaUser');
    setState(s => ({
      ...s,
      user: null,
      users: [], departments: [], suppliers: [], items: [], warehouses: [], stock: [],
      materialIssues: [], materialIssueItems: [], gateEntries: [], prs: [],
      pos: [], grns: [], stockTransfers: [], stockAdjustments: []
    }));
  }


  
  const firestoreAdd = async (coll: string, data: any) => {
    const newId = Date.now().toString() + Math.random().toString(36).substring(7);
    const itemData = { ...data, id: newId };
    try {
      await setDoc(doc(db, coll, newId), itemData);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, coll);
    }
  };

  const firestoreUpdate = async (coll: string, id: string, data: any) => {
    try {
      await updateDoc(doc(db, coll, id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, coll);
    }
  };

  const firestoreDelete = async (coll: string, id: string) => {
    try {
      await deleteDoc(doc(db, coll, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, coll);
    }
  };

  const addUser = async (userData: any) => {
    if (userData.password) {
      // create user in Firebase Auth using a secondary app instance to avoid auto-login disrupting admin
      const { initializeApp } = await import('firebase/app');
      const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
      const { firebaseConfig } = await import('../lib/firebase');
      
      const secondaryApp = initializeApp(firebaseConfig, 'Secondary' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      try {
        await createUserWithEmailAndPassword(secondaryAuth, userData.email, userData.password);
      } catch (e: any) {
        console.error("Auth creation failed", e);
        throw new Error(e.message || "Failed to create authentication user");
      } finally {
        await secondaryApp.delete();
      }
    }
    const { password, ...rest } = userData;
    return firestoreAdd('users', rest);
  };
  const updateUser = async (id: string, data: any) => firestoreUpdate('users', id, data);
  const addItem = async (item: Omit<Item, 'id'>) => firestoreAdd('items', item);
  const addDepartment = async (dept: Omit<Department, 'id'>) => firestoreAdd('departments', dept);
  const updateDepartment = async (id: string, data: Partial<Department>) => firestoreUpdate('departments', id, data);
  const deleteDepartment = async (id: string) => firestoreDelete('departments', id);
  const addWarehouse = async (wh: Omit<Warehouse, 'id'>) => firestoreAdd('warehouses', wh);
  const updateWarehouse = async (id: string, data: Partial<Warehouse>) => firestoreUpdate('warehouses', id, data);
  const deleteWarehouse = async (id: string) => firestoreDelete('warehouses', id);
  const addSupplier = async (sup: Omit<Supplier, 'id'>) => firestoreAdd('suppliers', sup);
  const addGateEntry = async (entry: Omit<GateEntry, 'id'>) => firestoreAdd('gateEntries', entry);
  const addPR = async (pr: Omit<PurchaseRequisition, 'id'>) => firestoreAdd('prs', pr);
  const addPO = async (po: Omit<PurchaseOrder, 'id'>) => firestoreAdd('pos', po);
  const addGRN = async (grn: Omit<GRN, 'id'>) => firestoreAdd('grns', grn);
  const addStockTransfer = async (transfer: Omit<StockTransfer, 'id'>) => firestoreAdd('stockTransfers', transfer);
  const addStockAdjustment = async (adjustment: Omit<StockAdjustment, 'id'>) => firestoreAdd('stockAdjustments', adjustment);

  const issueMaterial = async (issue: Omit<MaterialIssue, 'id'>, itemsData: Omit<MaterialIssueItem, 'id' | 'issueId'>[]) => {
    try {
      const batch = writeBatch(db);
      
      const newIssueId = Date.now().toString();
      const issueRef = doc(db, 'materialIssues', newIssueId);
      batch.set(issueRef, { ...issue, id: newIssueId });

      for (const item of itemsData) {
        const newItemId = Date.now().toString() + Math.random();
        const itemRef = doc(db, 'materialIssueItems', newItemId);
        batch.set(itemRef, { ...item, id: newItemId, issueId: newIssueId });
        
        const stockSnapshot = await getDocs(collection(db, 'stock'));
        const existingStock = stockSnapshot.docs.map(d => ({id: d.id, ...(d.data() as Omit<Stock, 'id'>)}))
          .find((st: any) => st.itemId === item.itemId);
        
        if (existingStock) {
           const stockRef = doc(db, 'stock', existingStock.id);
           batch.update(stockRef, { quantity: (existingStock.quantity as number) - item.quantity });
        } else {
           const newStockId = Date.now().toString() + Math.random();
           const stockRef = doc(db, 'stock', newStockId);
           batch.set(stockRef, { itemId: item.itemId, warehouseId: 'default', quantity: -item.quantity });
        }
      }
      
      await batch.commit();
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, 'materialIssues');
    }
  };

  const receiveStock = async (itemId: string, warehouseId: string, quantity: number, batchNo?: string) => {
    try {
      const stockSnapshot = await getDocs(collection(db, 'stock'));
      const existingStock = stockSnapshot.docs.map(d => ({id: d.id, ...(d.data() as Omit<Stock, 'id'>)}))
        .find((st: any) => st.itemId === itemId && st.warehouseId === warehouseId && st.batchNo === batchNo);
        
      if (existingStock) {
        await updateDoc(doc(db, 'stock', existingStock.id), { quantity: (existingStock.quantity as number) + quantity });
      } else {
        const newStockId = Date.now().toString() + Math.random();
        await setDoc(doc(db, 'stock', newStockId), { itemId, warehouseId, quantity, batchNo, lastUpdated: new Date().toISOString() });
      }
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, 'stock');
    }
  };


  const value = { login, loginWithEmail, addUser, updateUser, logout: logoutUser,
    ...state,
    
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
