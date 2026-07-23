import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRightLeft, Search, Plus, Trash2, FileText, ArrowLeftRight, History, Printer, Eye, Building2, User, Calendar, CheckCircle2, Package, X, Scale } from 'lucide-react';
import { convertUnitQuantity } from '../lib/utils';

export default function MaterialIssue() {
  const { departments = [], items = [], stock = [], materialIssues = [], materialIssueItems = [], issueMaterial } = useApp();
  const [activeTab, setActiveTab] = useState<'issue' | 'history' | 'requisition' | 'returns'>('issue');

  const [departmentId, setDepartmentId] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  
  const [issueItems, setIssueItems] = useState<{itemId: string, quantity: number, unit?: string}[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [issueUnit, setIssueUnit] = useState('Kgs');

  // History & Filter state
  const [historySearch, setHistorySearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<any>(null);

  const handleSelectItemChange = (itemId: string) => {
    setSelectedItem(itemId);
    const matched = items.find(i => i.id === itemId);
    if (matched?.uom) {
      setIssueUnit(matched.uom);
    } else {
      setIssueUnit('Kgs');
    }
  };

  const selectedItemObj = useMemo(() => {
    return items.find(i => i.id === selectedItem);
  }, [items, selectedItem]);

  const convertedQuantityPreview = useMemo(() => {
    if (!selectedItemObj) return null;
    const targetUom = selectedItemObj.uom || 'Kgs';
    const converted = convertUnitQuantity(quantity, issueUnit, targetUom);
    return {
      converted,
      targetUom,
      isDifferent: issueUnit.trim().toUpperCase() !== targetUom.trim().toUpperCase()
    };
  }, [selectedItemObj, quantity, issueUnit]);

  const handleAddItem = () => {
    if (!selectedItem || quantity <= 0) return;
    setIssueItems([...issueItems, { itemId: selectedItem, quantity, unit: issueUnit }]);
    setSelectedItem('');
    setQuantity(1);
    setIssueUnit('Kgs');
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
    alert('Material Issued Successfully! Redirecting to Issue History.');
    setActiveTab('history');
  };

  // Filtered Material Issue History
  const filteredHistory = useMemo(() => {
    let list = (materialIssues || []).map(issue => {
      const itemsForIssue = (materialIssueItems || []).filter(mi => mi.issueId === issue.id);
      return { ...issue, items: itemsForIssue };
    }).reverse();

    if (selectedDeptFilter !== 'ALL') {
      list = list.filter(i => i.departmentId === selectedDeptFilter);
    }

    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      list = list.filter(i => {
        const deptMatch = (i.departmentId || '').toLowerCase().includes(q);
        const issuedMatch = (i.issuedBy || '').toLowerCase().includes(q);
        const receivedMatch = (i.receivedBy || '').toLowerCase().includes(q);
        const itemsMatch = i.items.some((item: any) => {
          const matchedItem = items.find(it => it.id === item.itemId);
          return (matchedItem?.name || item.itemId || '').toLowerCase().includes(q);
        });
        return deptMatch || issuedMatch || receivedMatch || itemsMatch;
      });
    }

    return list;
  }, [materialIssues, materialIssueItems, selectedDeptFilter, historySearch, items]);

  // Aggregate stats for History
  const totalQuantityIssued = useMemo(() => {
    return (materialIssueItems || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [materialIssueItems]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Department Material Management</h1>
            <p className="text-xs text-gray-500">Issue store materials to mill departments, view history logs & track stock consumption</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('issue')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Issue New Material
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('issue')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap ${activeTab === 'issue' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Issue Materials
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <History className="w-4 h-4 text-emerald-500" /> Issue History & Log ({materialIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('requisition')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap ${activeTab === 'requisition' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText className="w-4 h-4" /> Material Requisitions
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap ${activeTab === 'returns' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ArrowLeftRight className="w-4 h-4" /> Material Returns
        </button>
      </div>

      {activeTab === 'issue' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Target Department</label>
                <select required value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none">
                  <option value="">Select Department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Issued By (Store Officer)</label>
                <input required type="text" placeholder="e.g. Ramesh Kumar" value={issuedBy} onChange={e => setIssuedBy(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Received By (Dept Representative)</label>
                <input required type="text" placeholder="e.g. Suresh Patil" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none" />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
              <h3 className="text-base font-bold mb-4 text-gray-900 dark:text-white">Items to Issue from Store</h3>
              
              <div className="space-y-3 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Select Material / Item</label>
                    <select value={selectedItem} onChange={e => handleSelectItemChange(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-xs outline-none font-medium">
                      <option value="">Search & Select Item...</option>
                      {(items || []).map(item => {
                        const currentStock = (stock || []).filter(s => s.itemId === item.id).reduce((sum, s) => sum + (s.quantity || 0), 0);
                        return (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.sku}) - Base UOM: {item.uom || 'Kgs'}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Quantity</label>
                    <input type="number" step="any" min="0.001" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-xs outline-none font-bold" />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Issue Unit</label>
                    <select value={issueUnit} onChange={e => setIssueUnit(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-xs outline-none font-bold text-indigo-600 dark:text-indigo-400">
                      <option value="Kgs">Kgs</option>
                      <option value="TON">TON</option>
                      <option value="MT">MT</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Grams">Grams</option>
                      <option value="Mtrs">Mtrs</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Bags">Bags</option>
                      <option value="Nos">Nos</option>
                    </select>
                  </div>
                  <button type="button" onClick={handleAddItem} className="w-full sm:w-auto bg-gray-900 hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all">
                    + Add Item
                  </button>
                </div>

                {convertedQuantityPreview && (
                  <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <Scale className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Unit Calculation:</strong> Issuing <strong>{quantity} {issueUnit}</strong>
                      {convertedQuantityPreview.isDifferent ? (
                        <span> ➔ Automatically converts to <strong className="underline text-indigo-700 dark:text-indigo-300">{convertedQuantityPreview.converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {convertedQuantityPreview.targetUom}</strong> deducted from inventory stock.</span>
                      ) : (
                        <span> ➔ Deducts <strong>{convertedQuantityPreview.converted.toLocaleString('en-IN')} {convertedQuantityPreview.targetUom}</strong> directly from inventory stock.</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold">
                    <tr>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Quantity Issued</th>
                      <th className="p-3">Inventory Stock Deduction</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {issueItems.map((issueItem, idx) => {
                      const item = items.find(i => i.id === issueItem.itemId);
                      const unit = issueItem.unit || item?.uom || 'Kgs';
                      const targetUom = item?.uom || 'Kgs';
                      const converted = convertUnitQuantity(issueItem.quantity, unit, targetUom);
                      return (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                          <td className="p-3 font-semibold text-gray-900 dark:text-white">{item?.name || issueItem.itemId}</td>
                          <td className="p-3 font-mono text-gray-500">{item?.sku || '-'}</td>
                          <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{issueItem.quantity} {unit}</td>
                          <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                            -{converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {targetUom}
                          </td>
                          <td className="p-3 text-right">
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {issueItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No items added to this issue voucher yet. Select an item above and click "+ Add Item".</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button 
                type="submit" 
                disabled={issueItems.length === 0 || !departmentId}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Issue Materials & Deduct Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MATERIAL ISSUE HISTORY DASHBOARD TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* History KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Issue Vouchers</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{materialIssues.length}</div>
                <div className="text-[10px] text-gray-400 mt-1">Logged material issue receipts</div>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Quantity Issued</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {totalQuantityIssued.toLocaleString('en-IN')} Units
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Deducted from warehouse stock</div>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Active Departments</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {departments.length}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Receiving mill departments</div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* History Search & Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Material Issue Audit Log & History</h2>
                <p className="text-xs text-gray-500">Full historical records of materials issued to departments</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                  className="p-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search department, item, officer..."
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Ref ID / Date</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Issued By</th>
                    <th className="p-3">Received By</th>
                    <th className="p-3">Issued Materials Breakdown</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredHistory.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-gray-900 dark:text-white">#{issue.id.substring(0, 8)}</div>
                        <div className="text-[10px] text-gray-400">
                          {issue.date ? new Date(issue.date).toLocaleDateString() + ' ' + new Date(issue.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{issue.departmentId}</td>
                      <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{issue.issuedBy || '-'}</td>
                      <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{issue.receivedBy || '-'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {issue.items && issue.items.length > 0 ? (
                            issue.items.map((item: any, idx: number) => {
                              const matchedItem = items.find(it => it.id === item.itemId);
                              const name = matchedItem ? matchedItem.name : item.itemId;
                              const unit = item.unit || matchedItem?.uom || 'Kgs';
                              const targetUom = matchedItem?.uom || 'Kgs';
                              const converted = convertUnitQuantity(item.quantity, unit, targetUom);
                              const isDiff = unit.trim().toUpperCase() !== targetUom.trim().toUpperCase();
                              return (
                                <span key={idx} className="bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {name}: {item.quantity} {unit}
                                  {isDiff && ` (${converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${targetUom} deducted)`}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-gray-400">No items</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Issued & Stock Deducted
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedIssueDetail(issue)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No material issue records found in history matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requisition' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Material Requisitions</h2>
            <button onClick={() => alert('New Requisition feature coming soon!')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-xs font-bold">
              <Plus className="w-4 h-4" /> New Requisition
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold">
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
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Material Returns</h2>
            <button onClick={() => alert('Process Return feature coming soon!')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-xs font-bold">
              <Plus className="w-4 h-4" /> Process Return
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold">
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

      {/* MATERIAL ISSUE VOUCHER DETAIL MODAL */}
      {selectedIssueDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Yashoda Linen Yarn Ltd</div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Store Material Issue Voucher</h3>
                <p className="text-xs text-gray-500">Voucher Ref: #{selectedIssueDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
              <div>
                <span className="text-gray-500 block">Department:</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedIssueDetail.departmentId}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Issue Date & Time:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedIssueDetail.date ? new Date(selectedIssueDetail.date).toLocaleString() : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Issued By (Store Officer):</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedIssueDetail.issuedBy || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Received By (Dept Representative):</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedIssueDetail.receivedBy || '-'}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Issued Item List</h4>
              <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 dark:bg-zinc-800 font-semibold">
                    <tr>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Quantity Issued</th>
                      <th className="p-3 text-right">Inventory Stock Deduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {selectedIssueDetail.items && selectedIssueDetail.items.map((it: any, i: number) => {
                      const matchedItem = items.find(m => m.id === it.itemId);
                      const unit = it.unit || matchedItem?.uom || 'Kgs';
                      const targetUom = matchedItem?.uom || 'Kgs';
                      const converted = convertUnitQuantity(it.quantity, unit, targetUom);
                      return (
                        <tr key={i}>
                          <td className="p-3 font-semibold">{matchedItem?.name || it.itemId}</td>
                          <td className="p-3 font-mono text-gray-500">{matchedItem?.sku || '-'}</td>
                          <td className="p-3 font-bold text-amber-600">{it.quantity} {unit}</td>
                          <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                            -{converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {targetUom}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => window.print()}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Issue Slip
              </button>

              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

