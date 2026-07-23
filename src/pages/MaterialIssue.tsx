import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRightLeft, Search, Plus, Trash2, FileText, ArrowLeftRight } from 'lucide-react';

export default function MaterialIssue() {
  const { departments, items, stock, issueMaterial } = useApp();
  const [activeTab, setActiveTab] = useState<'issue' | 'requisition' | 'returns'>('issue');

  const [departmentId, setDepartmentId] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  
  const [issueItems, setIssueItems] = useState<{itemId: string, quantity: number}[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddItem = () => {
    if (!selectedItem || quantity <= 0) return;
    setIssueItems([...issueItems, { itemId: selectedItem, quantity }]);
    setSelectedItem('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setIssueItems(issueItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || issueItems.length === 0) return;

    await issueMaterial({
      departmentId,
      date: new Date().toISOString(),
      issuedBy,
      receivedBy,
      status: 'Issued'
    }, issueItems);

    setDepartmentId('');
    setIssueItems([]);
    setIssuedBy('');
    setReceivedBy('');
    alert('Material Issued Successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <ArrowRightLeft className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">Department Material Management</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('issue')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'issue' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Issue Materials
        </button>
        <button
          onClick={() => setActiveTab('requisition')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'requisition' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText className="w-4 h-4" /> Material Requisitions
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'returns' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ArrowLeftRight className="w-4 h-4" /> Material Returns
        </button>
      </div>

      {activeTab === 'issue' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select required value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issued By</label>
                <input required type="text" value={issuedBy} onChange={e => setIssuedBy(e.target.value)} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Received By</label>
                <input required type="text" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-800 pt-6">
              <h3 className="text-lg font-bold mb-4">Items to Issue</h3>
              
              <div className="flex gap-4 items-end mb-6 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Select Item</label>
                  <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 outline-none">
                    <option value="">Search & Select Item...</option>
                    {items.map(item => {
                      const currentStock = stock.filter(s => s.itemId === item.id).reduce((sum, s) => sum + s.quantity, 0);
                      return (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.sku}) - Stock: {currentStock}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 outline-none" />
                </div>
                <button type="button" onClick={handleAddItem} className="bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
                  Add
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3 font-medium">Item Name</th>
                      <th className="p-3 font-medium">SKU</th>
                      <th className="p-3 font-medium">Quantity</th>
                      <th className="p-3 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {issueItems.map((issueItem, idx) => {
                      const item = items.find(i => i.id === issueItem.itemId);
                      return (
                        <tr key={idx}>
                          <td className="p-3">{item?.name}</td>
                          <td className="p-3">{item?.sku}</td>
                          <td className="p-3">{issueItem.quantity} {item?.uom}</td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {issueItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-500">No items added to this issue yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={issueItems.length === 0 || !departmentId}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                Issue Materials
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'requisition' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Material Requisitions</h2>
            <button onClick={() => alert('New Requisition feature coming soon!')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> New Requisition
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Requisition ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No material requisitions found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Material Returns</h2>
            <button onClick={() => alert('Process Return feature coming soon!')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Process Return
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Return ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No material returns found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
