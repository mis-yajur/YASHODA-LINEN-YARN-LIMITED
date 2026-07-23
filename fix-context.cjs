const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/import React, \{ createContext, useContext, useState, useEffect, ReactNode \} from 'react';/, 
`import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, signInWithGoogle, logout } from '../lib/firebase';
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
}`);

code = code.replace(/isSyncing: false/, `isSyncing: false,\n    user: null`);

const initAppFunc = `
  const initApp = async () => {
    onAuthStateChanged(auth, (currentUser) => {
      setState(s => ({ ...s, user: currentUser }));
      
      if (currentUser) {
        setupListeners();
      } else {
        // Clear data on logout
        setState(s => ({
          ...s,
          departments: [], suppliers: [], items: [], warehouses: [], stock: [],
          materialIssues: [], materialIssueItems: [], gateEntries: [], prs: [],
          pos: [], grns: [], stockTransfers: [], stockAdjustments: []
        }));
      }
    });
  };

  const setupListeners = () => {
    const collections = [
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

  const logoutUser = async () => {
    await logout();
  }
`;

code = code.replace(/const initApp = async \(\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?\}\n  \};/, initAppFunc);

code = code.replace(/useEffect\(\(\) => \{\n\s*if \(\!initialized\) return;\n\s*localStorage\.setItem\(LOCAL_STORAGE_KEY, JSON\.stringify\(\{[\s\S]*?\}\)\);\n\s*\}, \[state, initialized\]\);/, '');

code = code.replace(/const syncToSheets = async \([\s\S]*?\}\n  \};\n/g, '');
code = code.replace(/const setScriptUrl = \(url: string\) => \{[\s\S]*?\};\n/g, '');

const actionFuncs = `
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
        const existingStock = stockSnapshot.docs.map(d => ({id: d.id, ...d.data()}))
          .find((st: any) => st.itemId === item.itemId && st.warehouseId === issue.fromWarehouseId);
        
        if (existingStock) {
           const stockRef = doc(db, 'stock', existingStock.id);
           batch.update(stockRef, { quantity: (existingStock.quantity as number) - item.quantity });
        } else {
           const newStockId = Date.now().toString() + Math.random();
           const stockRef = doc(db, 'stock', newStockId);
           batch.set(stockRef, { itemId: item.itemId, warehouseId: issue.fromWarehouseId, quantity: -item.quantity });
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
      const existingStock = stockSnapshot.docs.map(d => ({id: d.id, ...d.data()}))
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
`;

code = code.replace(/const addItem = async \([\s\S]*?receiveStock = async \([\s\S]*?\}\);\n  \};/g, actionFuncs);

code = code.replace(/const value = \{/, `const value = { login, logout: logoutUser,`);

fs.writeFileSync('src/context/AppContext.tsx', code);
