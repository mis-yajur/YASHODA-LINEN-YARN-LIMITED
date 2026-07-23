import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';
import { Plus, Search, Edit2, Trash2, X, Package, ArrowRightLeft, Settings2 } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';

export default function Inventory() {
  const { items = [], addItem, stock = [], warehouses = [], stockTransfers = [], stockAdjustments = [], addStockTransfer, addStockAdjustment } = useApp();
  const [activeTab, setActiveTab] = useState<'items' | 'stock' | 'transfers' | 'adjustments'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'item' | 'transfer' | 'adjustment'>('item');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        {activeTab === 'items' && (
          <div className="flex gap-2">
            <CSVUploader onUpload={handleBulkUpload} />
            <button 
            onClick={() => { setModalType('item'); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Item
            </button>
          </div>
        )}
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'stock' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Current Stock
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'items' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Item Master
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'transfers' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Stock Transfers
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'adjustments' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Settings2 className="w-4 h-4" /> Adjustments
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
            <div className="relative max-w-md">
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
                    <td className="px-6 py-4">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.categoryId}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{item.reorderLevel}</td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No items found matching your search.
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
          <h2 className="text-lg font-bold mb-4">Current Stock Levels</h2>
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
                      <td className="px-4 py-3 font-medium">{item?.name || 'Unknown Item'} <span className="text-xs text-gray-500 font-normal ml-2">{item?.sku}</span></td>
                      <td className="px-4 py-3">{warehouse?.name || 'Unknown Location'}</td>
                      <td className="px-4 py-3 text-right">{s.quantity} {item?.uom}</td>
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
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No stock records found.</td>
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
