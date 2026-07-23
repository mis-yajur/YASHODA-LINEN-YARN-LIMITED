export type Role = 'Admin' | 'Manager' | 'Staff' | 'Department Head';

export interface Department {
  id: string;
  name: string;
  head: string;
  plantId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Item {
  id: string;
  categoryId: string;
  name: string;
  sku: string;
  uom: string; // Unit of Measure
  reorderLevel: number;
  type: string; // Raw Material, Consumable, Spare Part, etc.
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
}

export interface Stock {
  id: string;
  itemId: string;
  warehouseId: string;
  quantity: number;
  batchNo?: string;
}

export interface MaterialIssue {
  id: string;
  departmentId: string;
  date: string;
  issuedBy: string;
  receivedBy: string;
  status: 'Pending' | 'Approved' | 'Issued';
}

export interface MaterialIssueItem {
  id: string;
  issueId: string;
  itemId: string;
  quantity: number;
}

export interface AppState {
  scriptUrl: string | null;
  departments: Department[];
  suppliers: Supplier[];
  items: Item[];
  warehouses: Warehouse[];
  stock: Stock[];
  materialIssues: MaterialIssue[];
  materialIssueItems: MaterialIssueItem[];
  isSyncing: boolean;
}
