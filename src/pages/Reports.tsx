import React, { useState, useMemo } from 'react';
import { FileText, Download, Filter, BarChart2, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Reports() {
  const { gateEntries } = useApp();
  const [activeCategory, setActiveCategory] = useState<'inventory' | 'procurement' | 'consumption' | 'gate'>('gate');

  const allGateEntries = useMemo(() => gateEntries, [gateEntries]);

  // Generate data for Gate Entries by Date chart
  const gateEntriesByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    allGateEntries.forEach(entry => {
      // Parse dates safely
      const datePart = entry.date.split(' ')[0] || entry.date;
      counts[datePart] = (counts[datePart] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15); // Show last 15 days
  }, [allGateEntries]);

  // Generate data for Top Parties chart
  const gateEntriesByParty = useMemo(() => {
    const counts: Record<string, number> = {};
    allGateEntries.forEach(entry => {
      if (!entry.partyName) return;
      counts[entry.partyName] = (counts[entry.partyName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.substring(0, 15) + (name.length > 15 ? '...' : ''), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 parties
  }, [allGateEntries]);

  const handleExport = () => {
    if (activeCategory === 'gate') {
      const headers = ['Date', 'Entries Count'];
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(',') + '\n'
        + gateEntriesByDate.map(e => `${e.date},${e.count}`).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "gate_entries_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Export feature coming soon for this category!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('gate')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeCategory === 'gate' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Truck className="w-4 h-4" /> Gate Entry Reports
        </button>
        <button
          onClick={() => setActiveCategory('inventory')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeCategory === 'inventory' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <BarChart2 className="w-4 h-4" /> Inventory Reports
        </button>
        <button
          onClick={() => setActiveCategory('procurement')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeCategory === 'procurement' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText className="w-4 h-4" /> Procurement Reports
        </button>
        <button
          onClick={() => setActiveCategory('consumption')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeCategory === 'consumption' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText className="w-4 h-4" /> Consumption Reports
        </button>
      </div>

      {activeCategory === 'gate' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-lg mb-6">Gate Entries by Date</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gateEntriesByDate}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                      itemStyle={{ color: '#818CF8' }}
                    />
                    <Bar dataKey="count" name="Entries" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-lg mb-6">Top Parties by Entries</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gateEntriesByParty} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                    <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 12 }} width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                      itemStyle={{ color: '#10B981' }}
                    />
                    <Bar dataKey="count" name="Entries" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="font-bold text-lg mb-4">Gate Entry Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Total Entries</div>
                <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{allGateEntries.length}</div>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Unique Parties</div>
                <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{Object.keys(gateEntriesByParty).length}</div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-amber-600 dark:text-amber-400 text-sm font-medium">Avg Entries/Day</div>
                <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {gateEntriesByDate.length > 0 ? (allGateEntries.length / gateEntriesByDate.length).toFixed(1) : 0}
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Recent (7 Days)</div>
                <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {gateEntriesByDate.slice(-7).reduce((acc, curr) => acc + curr.count, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeCategory === 'inventory' ? (
        <InventoryReportView />
      ) : activeCategory === 'consumption' ? (
        <ConsumptionReportView />
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">Available Reports</h2>
            <button onClick={() => alert('Filter options coming soon!')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg">
              <Filter className="w-4 h-4" /> Filter Options
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCategory === 'procurement' && (
              <>
                <ReportCard title="Purchase Register" description="Summary of all POs generated in a period." />
                <ReportCard title="Supplier Analysis" description="Supplier performance and purchase history." />
                <ReportCard title="Pending GRNs" description="Purchase orders pending goods receipt." />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConsumptionReportView() {
  const { materialIssueItems, items, departments, materialIssues } = useApp();

  const consumptionByDepartment = useMemo(() => {
    const data: Record<string, number> = {};
    materialIssueItems.forEach(item => {
      const issue = materialIssues.find(mi => mi.id === item.issueId);
      if (!issue) return;
      const dept = departments.find(d => d.id === issue.departmentId);
      const deptName = dept ? dept.name : issue.departmentId;
      data[deptName] = (data[deptName] || 0) + item.quantity;
    });
    return Object.entries(data).map(([name, count]) => ({ name, count }));
  }, [materialIssueItems, materialIssues, departments]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="font-bold text-lg mb-6">Material Consumption by Department</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consumptionByDepartment} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                itemStyle={{ color: '#F59E0B' }}
              />
              <Bar dataKey="count" name="Quantity Consumed" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function InventoryReportView() {
  const { stock, items, warehouses } = useApp();

  const lowStockData = useMemo(() => {
    const data = items.map(item => {
      const totalStock = stock.filter(s => s.itemId === item.id).reduce((sum, s) => sum + s.quantity, 0);
      return {
        name: item.name,
        stock: totalStock,
        reorderLevel: item.reorderLevel,
        isLow: totalStock <= item.reorderLevel
      };
    }).filter(d => d.isLow);
    return data;
  }, [items, stock]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="font-bold text-lg mb-6">Low Stock Items Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lowStockData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                itemStyle={{ color: '#EF4444' }}
              />
              <Legend />
              <Bar dataKey="stock" name="Current Stock" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reorderLevel" name="Reorder Level" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="font-bold text-lg">Daily Stock Report</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg">
            <Filter className="w-4 h-4" /> Filter Options
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Reorder Level</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stock && stock.map(s => {
                const item = items.find(i => i.id === s.itemId);
                const wh = warehouses.find(w => w.id === s.warehouseId);
                if (!item) return null;
                
                const isLowStock = s.quantity <= item.reorderLevel;

                return (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4">{item.sku}</td>
                    <td className="p-4">{item.type}</td>
                    <td className="p-4">{wh?.name || 'Unknown'}</td>
                    <td className="p-4">{s.quantity} {item.uom}</td>
                    <td className="p-4">{item.reorderLevel} {item.uom}</td>
                    <td className="p-4">
                      {isLowStock ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Healthy</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(!stock || stock.length === 0) && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No stock data available. Add inventory to view reports.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
