import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';
import { Plus, Search, Edit2, Trash2, X, Package, ArrowRightLeft, Settings2, RefreshCw, Truck, CheckCircle2, IndianRupee } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';

function parseNumeric(val: string | number | undefined): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export default function Inventory() {
  const { 
    items = [], 
    addItem, 
    stock = [], 
    warehouses = [], 
    stockTransfers = [], 
    stockAdjustments = [], 
    addStockTransfer, 
    addStockAdjustment,
    gateEntriesYashoda = [],
    gateEntriesAIPL = [],
    receiveStock
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stock' | 'gateInward' | 'items' | 'transfers' | 'adjustments'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'item' | 'transfer' | 'adjustment'>('item');
  const [isSyncing, setIsSyncing] = useState(false);

  // Combine gate entries
  const allGateEntries = useMemo(() => {
    const yashoda = (gateEntriesYashoda || []).map(e => ({ ...e, companyType: 'Yashoda' as const }));
    const aipl = (gateEntriesAIPL || []).map(e => ({ ...e, companyType: 'AIPL' as const }));
    return [...yashoda, ...aipl];
  }, [gateEntriesYashoda, gateEntriesAIPL]);

  // Aggregate Gate Entries by Material Description for Inward Stock
  const gateInwardStockSummary = useMemo(() => {
    const map: Record<string, {
      materialDescription: string;
      unit: string;
      totalQty: number;
      totalBasePrice: number;
      totalGST: number;
      totalValue: number;
      entryCount: number;
      partyNames: Set<string>;
      lastDate: string;
      companies: Set<string>;
    }> = {};

    allGateEntries.forEach(entry => {
      const matName = (entry.materialDescription || 'Unspecified Material').trim();
      const key = matName.toLowerCase();

      if (!map[key]) {
        map[key] = {
          materialDescription: matName,
          unit: entry.unit || 'Units',
          totalQty: 0,
          totalBasePrice: 0,
          totalGST: 0,
          totalValue: 0,
          entryCount: 0,
          partyNames: new Set(),
          lastDate: entry.date || '',
          companies: new Set()
        };
      }

      const base = parseNumeric(entry.basePrice);
      const gst = parseNumeric(entry.cgst) + parseNumeric(entry.sgst) + parseNumeric(entry.igst);
      const total = parseNumeric(entry.totalPrice);
      const qty = parseNumeric(entry.quantityWeight);

      map[key].totalQty += qty;
      map[key].totalBasePrice += base;
      map[key].totalGST += gst;
      map[key].totalValue += total;
      map[key].entryCount += 1;
      if (entry.partyName) map[key].partyNames.add(entry.partyName);
      if (entry.companyType) map[key].companies.add(entry.companyType);
      if (entry.date) map[key].lastDate = entry.date;
    });

    return Object.values(map);
  }, [allGateEntries]);

  // Sync Gate Entries to Item Master & Current Stock
  const handleSyncGateEntriesToInventory = async () => {
    if (gateInwardStockSummary.length === 0) {
      alert('No Gate Entry records available to sync.');
      return;
    }

    if (!window.confirm(`Sync ${gateInwardStockSummary.length} material categories from Gate Register to Item Master & Current Stock?`)) {
      return;
    }

    setIsSyncing(true);
    try {
      let createdCount = 0;
      let stockCount = 0;

      const targetWarehouseId = warehouses[0]?.id || 'wh-1';

      for (const summary of gateInwardStockSummary) {
        // Find or create item in Item Master
        let existingItem = items.find(i => (i.name || '').toLowerCase() === summary.materialDescription.toLowerCase());
        let itemId = existingItem?.id;

        if (!existingItem) {
          const sku = 'GE-' + Math.floor(1000 + Math.random() * 9000);
          const newItem = {
            name: summary.materialDescription,
            sku,
            uom: summary.unit || 'Kgs',
            categoryId: 'Raw Material',
            reorderLevel: 10,
            type: 'Inward Raw Material'
          };
          await addItem(newItem);
          createdCount++;
        }

        // Add to stock
        if (summary.totalQty > 0) {
          // Re-fetch item ID if newly created
          const matched = items.find(i => (i.name || '').toLowerCase() === summary.materialDescription.toLowerCase());
          const finalItemId = matched?.id || itemId || summary.materialDescription;
          if (receiveStock) {
            await receiveStock(finalItemId, targetWarehouseId, summary.totalQty, 'GATE-SYNC');
            stockCount++;
          }
        }
      }

      alert(`Sync Complete!\n• ${createdCount} new items created in Item Master.\n• ${stockCount} stock entries updated.`);
    } catch (e: any) {
      console.error(e);
      alert('Error during sync: ' + (e.message || 'Failed'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      if (activeTab === 'items') {
        await addItem({ 
          name: row.name || '', 
          sku: row.sku || '', 
          categoryId: row.categoryId || 'Cat-1', 
          uom: row.uom || 'Kgs', 
          reorderLevel: Number(row.reorderLevel) || 10, 
          type: row.type || 'Raw Material' 
        });
      }
    }
    alert('Bulk upload completed');
  };

  const filteredItems = (items || []).filter(item => 
    (item?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item?.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGateSummary = gateInwardStockSummary.filter(summary =>
    summary.materialDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Array.from(summary.partyNames).some(p => String(p).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory & Stock Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage stock levels, Item Masters, and Gate Entry inward receipts</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleSyncGateEntriesToInventory}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
            title="Import/sync all quantities and values from Gate Register into Inventory Stock and Item Master"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Gate Entries to Stock
          </button>

          {activeTab === 'items' && (
            <div className="flex gap-2">
              <CSVUploader onUpload={handleBulkUpload} />
              <button 
                onClick={() => { setModalType('item'); setIsModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'stock' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Current Stock
        </button>
        <button
          onClick={() => setActiveTab('gateInward')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'gateInward' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Truck className="w-4 h-4 text-emerald-500" /> Gate Entry Inward Stock ({gateInwardStockSummary.length})
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'items' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Item Master ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'transfers' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Stock Transfers
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'adjustments' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Settings2 className="w-4 h-4" /> Adjustments
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by name or SKU..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Reorder Lvl</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.uom}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.categoryId || 'Raw Material'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.type || 'Raw Material'}</td>
                    <td className="px-6 py-4 text-right text-gray-500 font-mono">{item.reorderLevel}</td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No items found in Item Master.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gate Entry Inward Stock Tab */}
      {activeTab === 'gateInward' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-500" />
                Inward Received Quantities & Values (From Gate Register)
              </h2>
              <p className="text-xs text-gray-500">
                Automatically calculated from Yashoda & Contractor AIPL Gate Entries
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search material description..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg border-gray-200 dark:border-zinc-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3">Material Description</th>
                  <th className="px-4 py-3">Company Source</th>
                  <th className="px-4 py-3 text-right">Total Inward Qty</th>
                  <th className="px-4 py-3 text-right">Total Base Price</th>
                  <th className="px-4 py-3 text-right">Total GST</th>
                  <th className="px-4 py-3 text-right">Grand Total Value</th>
                  <th className="px-4 py-3 text-center">Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filteredGateSummary.map((sum, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {sum.materialDescription}
                      <div className="text-xs text-gray-400 font-normal">
                        Parties: {Array.from(sum.partyNames).join(', ') || 'Various'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {Array.from(sum.companies).map(c => (
                          <span key={c} className={`text-[10px] font-bold px-2 py-0.5 rounded ${c === 'Yashoda' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {sum.totalQty.toLocaleString()} {sum.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(sum.totalBasePrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-600 dark:text-amber-400">
                      {formatCurrency(sum.totalGST)}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold font-mono text-gray-900 dark:text-white">
                      {formatCurrency(sum.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs font-semibold">
                        {sum.entryCount}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredGateSummary.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No Gate Register inward stock entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Current Stock Levels</h2>
            <span className="text-xs text-gray-500 font-medium">
              Total Stock Records: {stock.length}
            </span>
          </div>

          <div className="overflow-x-auto border rounded-lg border-gray-200 dark:border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {(stock || []).map(s => {
                  const item = (items || []).find(i => i.id === s.itemId);
                  const warehouse = (warehouses || []).find(w => w.id === s.warehouseId);
                  const isLow = item && s.quantity <= (item.reorderLevel || 0);
                  
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3 font-medium">
                        {item?.name || s.itemId || 'Unknown Item'} 
                        <span className="text-xs text-gray-500 font-normal ml-2">{item?.sku}</span>
                      </td>
                      <td className="px-4 py-3">{warehouse?.name || 'Main Warehouse'}</td>
                      <td className="px-4 py-3 text-right font-bold">{s.quantity} {item?.uom || 'units'}</td>
                      <td className="px-4 py-3 text-right">
                        {isLow ? (
                          <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Low Stock</span>
                        ) : (
                          <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Healthy</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {(!stock || stock.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No stock records found. Click <strong>"Sync Gate Entries to Stock"</strong> above to populate stock from Gate Register entries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Stock Transfers</h2>
            <button 
              onClick={() => { setModalType('transfer'); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> New Transfer
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Transfer ID</th>
                <th className="p-4">From Warehouse</th>
                <th className="p-4">To Warehouse</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockTransfers?.map(transfer => (
                <tr key={transfer.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{transfer.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4">{warehouses.find(w => w.id === transfer.fromWarehouseId)?.name || transfer.fromWarehouseId}</td>
                  <td className="p-4">{warehouses.find(w => w.id === transfer.toWarehouseId)?.name || transfer.toWarehouseId}</td>
                  <td className="p-4">{new Date(transfer.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transfer.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      transfer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {transfer.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stockTransfers || stockTransfers.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No stock transfers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'adjustments' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Stock Adjustments</h2>
            <button 
              onClick={() => { setModalType('adjustment'); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> New Adjustment
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Adjustment ID</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockAdjustments?.map(adj => (
                <tr key={adj.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{adj.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4">{warehouses.find(w => w.id === adj.warehouseId)?.name || adj.warehouseId}</td>
                  <td className="p-4">{adj.reason}</td>
                  <td className="p-4">{new Date(adj.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      adj.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      adj.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {adj.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stockAdjustments || stockAdjustments.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No stock adjustments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ItemModal 
          type={modalType}
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => {
            if (modalType === 'item') {
              addItem(data);
            } else if (modalType === 'transfer') {
              addStockTransfer({
                fromWarehouseId: data.fromWarehouse,
                toWarehouseId: data.toWarehouse,
                itemId: data.itemId,
                quantity: data.quantity,
                date: new Date().toISOString(),
                status: 'Pending'
              });
            } else if (modalType === 'adjustment') {
              addStockAdjustment({
                warehouseId: data.warehouseId,
                itemId: data.itemId,
                quantity: data.quantity,
                reason: data.reason,
                date: new Date().toISOString(),
                status: 'Pending'
              });
            }
            setIsModalOpen(false);
          }} 
        />
      )}
    </div>
  );
}

function ItemModal({ type, onClose, onSave }: { type: 'item' | 'transfer' | 'adjustment', onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(
    type === 'item' ? { name: '', sku: '', categoryId: 'Raw Material', uom: 'kg', type: 'Raw Material', reorderLevel: 0 } :
    type === 'transfer' ? { fromWarehouse: '', toWarehouse: '', itemId: '', quantity: 0, reason: '' } :
    { warehouseId: '', itemId: '', quantity: 0, reason: '' }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold">
            {type === 'item' ? 'New Item' : 
             type === 'transfer' ? 'New Stock Transfer' : 'New Stock Adjustment'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {type === 'item' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Item Name</label>
                <input type="text" value={(formData as any).name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input type="text" value={(formData as any).sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">UOM</label>
                  <input type="text" value={(formData as any).uom} onChange={e => setFormData({...formData, uom: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input type="text" value={(formData as any).categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <input type="text" value={(formData as any).type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reorder Level</label>
                <input type="number" value={(formData as any).reorderLevel} onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
            </>
          )}
          {type === 'transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Item ID</label>
                <input type="text" value={(formData as any).itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" value={(formData as any).quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
            </>
          )}
          {type === 'adjustment' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Item ID</label>
                <input type="text" value={(formData as any).itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Adjustment</label>
                <input type="number" value={(formData as any).quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
            </>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

