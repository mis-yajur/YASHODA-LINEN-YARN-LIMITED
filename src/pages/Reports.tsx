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
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">Available Reports</h2>
            <button onClick={() => alert('Filter options coming soon!')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg">
              <Filter className="w-4 h-4" /> Filter Options
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCategory === 'inventory' && (
              <>
                <ReportCard title="Stock Ledger" description="Detailed item-wise stock movement history." />
                <ReportCard title="Daily Stock Report" description="End of day stock balances across all warehouses." />
                <ReportCard title="Low Stock Alert" description="Items below minimum reorder levels." />
                <ReportCard title="Stock Valuation" description="Current inventory value based on average cost." />
                <ReportCard title="Slow Moving Items" description="Items with no movement in the last 90 days." />
              </>
            )}
            {activeCategory === 'procurement' && (
              <>
                <ReportCard title="Purchase Register" description="Summary of all POs generated in a period." />
                <ReportCard title="Supplier Analysis" description="Supplier performance and purchase history." />
                <ReportCard title="Pending GRNs" description="Purchase orders pending goods receipt." />
              </>
            )}
            {activeCategory === 'consumption' && (
              <>
                <ReportCard title="Dept Consumption" description="Material consumed by each department." />
                <ReportCard title="Issue Register" description="Log of all material issue slips." />
              </>
            )}
          </div>
        </div>
      )}
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
