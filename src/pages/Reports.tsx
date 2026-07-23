import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Filter, BarChart2, Truck, TrendingUp, 
  Package, ShoppingCart, Layers, AlertTriangle, CheckCircle2, 
  Calendar, RefreshCw, Sparkles, Building2, User, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#3B82F6'];

export default function Reports() {
  const { 
    gateEntriesYashoda = [], 
    gateEntriesAIPL = [], 
    items = [], 
    stock = [], 
    warehouses = [], 
    prs = [], 
    pos = [], 
    grns = [], 
    materialIssues = [], 
    materialIssueItems = [],
    departments = [],
    suppliers = []
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'gate' | 'inventory' | 'procurement' | 'consumption' | 'export'>('gate');
  const [companyFilter, setCompanyFilter] = useState<'ALL' | 'Yashoda' | 'AIPL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');

  // Combined Gate Entries
  const allGateEntries = useMemo(() => {
    const yashoda = (gateEntriesYashoda || []).map(e => ({ ...e, companyType: 'Yashoda' as const }));
    const aipl = (gateEntriesAIPL || []).map(e => ({ ...e, companyType: 'AIPL' as const }));
    let list = [...yashoda, ...aipl];

    if (companyFilter !== 'ALL') {
      list = list.filter(e => e.companyType === companyFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const days = dateFilter === '7days' ? 7 : 30;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      list = list.filter(e => {
        if (!e.date) return true;
        const d = new Date(e.date);
        return isNaN(d.getTime()) || d >= cutoff;
      });
    }

    return list;
  }, [gateEntriesYashoda, gateEntriesAIPL, companyFilter, dateFilter]);

  // Analytics: Gate Entries by Date Trend
  const gateEntriesByDate = useMemo(() => {
    const map: Record<string, { date: string; Yashoda: number; AIPL: number; Total: number }> = {};
    allGateEntries.forEach(entry => {
      if (!entry || !entry.date) return;
      const dateStr = entry.date.split(' ')[0] || entry.date;
      if (!map[dateStr]) {
        map[dateStr] = { date: dateStr, Yashoda: 0, AIPL: 0, Total: 0 };
      }
      if (entry.companyType === 'Yashoda') map[dateStr].Yashoda += 1;
      else map[dateStr].AIPL += 1;
      map[dateStr].Total += 1;
    });

    return Object.values(map)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);
  }, [allGateEntries]);

  // Analytics: Gate Entries Top Parties
  const topPartiesData = useMemo(() => {
    const map: Record<string, { name: string; entries: number; totalVal: number }> = {};
    allGateEntries.forEach(entry => {
      const name = (entry.partyName || 'Unknown Party').trim();
      if (!map[name]) {
        map[name] = { name: name.length > 18 ? name.substring(0, 18) + '...' : name, entries: 0, totalVal: 0 };
      }
      map[name].entries += 1;
      const priceStr = String(entry.totalPrice || '').replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr) || 0;
      map[name].totalVal += price;
    });

    return Object.values(map)
      .sort((a, b) => b.entries - a.entries)
      .slice(0, 8);
  }, [allGateEntries]);

  // Analytics: Material Categories Distribution
  const materialDistData = useMemo(() => {
    const map: Record<string, number> = {};
    allGateEntries.forEach(entry => {
      const mat = (entry.materialDescription || 'General Goods').trim();
      map[mat] = (map[mat] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [allGateEntries]);

  // Total Inward Value Estimation
  const totalInwardValue = useMemo(() => {
    return allGateEntries.reduce((sum, e) => {
      const valStr = String(e.totalPrice || '').replace(/[^0-9.]/g, '');
      return sum + (parseFloat(valStr) || 0);
    }, 0);
  }, [allGateEntries]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Real-time Analytics & Intelligence
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Reports & Analytics Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Comprehensive multi-company intelligence for Yashoda Linen Yarn Ltd & Contractor AIPL
          </p>
        </div>

        {/* Global Date & Company Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setCompanyFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${companyFilter === 'ALL' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              All Companies
            </button>
            <button
              onClick={() => setCompanyFilter('Yashoda')}
              className={`px-3 py-1.5 rounded-lg transition-all ${companyFilter === 'Yashoda' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Yashoda
            </button>
            <button
              onClick={() => setCompanyFilter('AIPL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${companyFilter === 'AIPL' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              AIPL
            </button>
          </div>

          <select
            value={dateFilter}
            onChange={(e: any) => setDateFilter(e.target.value)}
            className="text-xs font-medium bg-gray-100 dark:bg-zinc-800 border-0 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">All Time History</option>
            <option value="30days">Last 30 Days</option>
            <option value="7days">Last 7 Days</option>
          </select>

          <button
            onClick={() => setActiveCategory('export')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-xs font-semibold shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Center
          </button>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveCategory('gate')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'gate' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Truck className="w-4 h-4" /> Gate Entry Reports
        </button>
        <button
          onClick={() => setActiveCategory('inventory')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'inventory' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Inventory Reports
        </button>
        <button
          onClick={() => setActiveCategory('procurement')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'procurement' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Procurement Reports
        </button>
        <button
          onClick={() => setActiveCategory('consumption')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'consumption' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Layers className="w-4 h-4" /> Consumption Reports
        </button>
        <button
          onClick={() => setActiveCategory('export')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'export' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Download className="w-4 h-4 text-emerald-500" /> Export Data
        </button>
      </div>

      {/* GATE ENTRY REPORTS SECTION */}
      {activeCategory === 'gate' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Gate Entries</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{allGateEntries.length}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> Live Inward Activity
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Inward Value</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{totalInwardValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Across all registered bills</div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Yashoda Entries</div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {(gateEntriesYashoda || []).length}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Yashoda Linen Yarn Ltd</div>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Contractor AIPL Entries</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {(gateEntriesAIPL || []).length}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Contractor AIPL Register</div>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gate Entry Trend Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-bold text-base text-gray-900 dark:text-white">Gate Entries Daily Volume Trend</h2>
                  <p className="text-xs text-gray-500">Inward frequency over recent dates</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gateEntriesByDate}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAipl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                    <Legend />
                    <Area type="monotone" dataKey="Yashoda" stroke="#6366F1" fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="AIPL" stroke="#F59E0B" fillOpacity={1} fill="url(#colorAipl)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Parties Horizontal Bar Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-bold text-base text-gray-900 dark:text-white">Top Suppliers / Parties by Inward Count</h2>
                  <p className="text-xs text-gray-500">Most frequent inward vendors</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPartiesData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
                    <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                    <Bar dataKey="entries" name="Gate Entries" fill="#10B981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Material Category Distribution Donut Chart & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-2">Material Distribution</h2>
              <p className="text-xs text-gray-500 mb-4">Top material categories received</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {materialDistData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-4">Recent Gate Entries Audit Trail</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold">
                    <tr>
                      <th className="p-3">SL No</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Party Name</th>
                      <th className="p-3">Material Description</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {allGateEntries.slice(0, 7).map((entry, idx) => (
                      <tr key={entry.id || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                        <td className="p-3 font-mono">{entry.slNo || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.companyType === 'Yashoda' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                            {entry.companyType}
                          </span>
                        </td>
                        <td className="p-3">{entry.date}</td>
                        <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{entry.partyName}</td>
                        <td className="p-3 truncate max-w-[150px]">{entry.materialDescription}</td>
                        <td className="p-3 font-bold text-emerald-600">{entry.quantityWeight} {entry.unit}</td>
                        <td className="p-3 font-mono font-bold">{entry.totalPrice || '-'}</td>
                      </tr>
                    ))}
                    {allGateEntries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-gray-500">No gate entries logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY REPORTS SECTION */}
      {activeCategory === 'inventory' && (
        <InventoryReportView items={items} stock={stock} warehouses={warehouses} />
      )}

      {/* PROCUREMENT REPORTS SECTION */}
      {activeCategory === 'procurement' && (
        <ProcurementReportView prs={prs} pos={pos} grns={grns} suppliers={suppliers} />
      )}

      {/* CONSUMPTION REPORTS SECTION */}
      {activeCategory === 'consumption' && (
        <ConsumptionReportView 
          materialIssueItems={materialIssueItems} 
          materialIssues={materialIssues} 
          departments={departments}
          items={items}
        />
      )}

      {/* EXPORT DATA SECTION */}
      {activeCategory === 'export' && (
        <ExportDataCenter 
          gateEntriesYashoda={gateEntriesYashoda}
          gateEntriesAIPL={gateEntriesAIPL}
          items={items}
          stock={stock}
          prs={prs}
          pos={pos}
          materialIssues={materialIssues}
          materialIssueItems={materialIssueItems}
        />
      )}
    </div>
  );
}

/* ================= INVENTORY REPORTS VIEW ================= */
function InventoryReportView({ items, stock, warehouses }: { items: any[]; stock: any[]; warehouses: any[] }) {
  const stockByWarehouse = useMemo(() => {
    const map: Record<string, number> = {};
    (stock || []).forEach(s => {
      const wh = warehouses.find(w => w.id === s.warehouseId);
      const name = wh ? wh.name : 'Unassigned Warehouse';
      map[name] = (map[name] || 0) + (Number(s.quantity) || 0);
    });
    return Object.entries(map).map(([name, qty]) => ({ name, qty }));
  }, [stock, warehouses]);

  const stockHealthStatus = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let outOfStock = 0;

    (items || []).forEach(item => {
      const itemStock = (stock || []).filter(s => s.itemId === item.id).reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      if (itemStock <= 0) outOfStock++;
      else if (itemStock <= (item.reorderLevel || 10)) low++;
      else healthy++;
    });

    return [
      { name: 'Healthy Stock', value: healthy, color: '#10B981' },
      { name: 'Low Stock Alert', value: low, color: '#F59E0B' },
      { name: 'Out of Stock', value: outOfStock, color: '#EF4444' }
    ];
  }, [items, stock]);

  const topStockItems = useMemo(() => {
    return (items || []).map(item => {
      const itemQty = (stock || []).filter(s => s.itemId === item.id).reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      return { name: item.name, quantity: itemQty, uom: item.uom || 'Kgs' };
    }).sort((a, b) => b.quantity - a.quantity).slice(0, 7);
  }, [items, stock]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Item Master Total</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{items.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Configured raw materials & goods</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Warehouse Stock</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stock.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Physical stock quantity</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {stockHealthStatus.find(s => s.name === 'Low Stock Alert')?.value || 0}
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">Requires reorder action</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Active Warehouses</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{warehouses.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Configured storage locations</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Stock Quantity by Warehouse</h2>
          <p className="text-xs text-gray-500 mb-6">Distribution across physical locations</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="qty" name="Stock Qty" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Stock Health Breakdown</h2>
          <p className="text-xs text-gray-500 mb-4">Stock level vs reorder thresholds</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockHealthStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockHealthStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Inventory Items */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Top Available Inventory Items</h2>
        <p className="text-xs text-gray-500 mb-6">Highest stock volume items</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStockItems} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
              <Bar dataKey="quantity" name="Stock Qty" fill="#10B981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= PROCUREMENT REPORTS VIEW ================= */
function ProcurementReportView({ prs, pos, grns, suppliers }: { prs: any[]; pos: any[]; grns: any[]; suppliers: any[] }) {
  const poValueByStatus = useMemo(() => {
    const map: Record<string, number> = { Approved: 0, Pending: 0, Rejected: 0 };
    (pos || []).forEach(p => {
      const status = p.status || 'Pending';
      map[status] = (map[status] || 0) + (Number(p.totalAmount) || 0);
    });
    return Object.entries(map).map(([status, amount]) => ({ status, amount }));
  }, [pos]);

  const prStatusDist = useMemo(() => {
    const map: Record<string, number> = {};
    (prs || []).forEach(p => {
      const st = p.status || 'Pending';
      map[st] = (map[st] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [prs]);

  const totalPoValue = useMemo(() => {
    return (pos || []).reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  }, [pos]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total PRs</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{prs.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Purchase Requisitions</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total POs Generated</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{pos.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Purchase Orders</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Procurement Value</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalPoValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Value of generated POs</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">GRNs Logged</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{grns.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Goods Receipt Notes</div>
        </div>
      </div>

      {/* Procurement Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Purchase Order Value by Status</h2>
          <p className="text-xs text-gray-500 mb-6">Financial breakdown of POs</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poValueByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="status" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="amount" name="PO Amount (₹)" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">PR Approval Status Distribution</h2>
          <p className="text-xs text-gray-500 mb-4">Requisitions Workflow Health</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prStatusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {prStatusDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= CONSUMPTION REPORTS VIEW ================= */
function ConsumptionReportView({ materialIssueItems, materialIssues, departments, items }: { materialIssueItems: any[]; materialIssues: any[]; departments: any[]; items: any[] }) {
  const consumptionByDept = useMemo(() => {
    const data: Record<string, number> = {};
    (materialIssueItems || []).forEach(item => {
      const issue = (materialIssues || []).find(mi => mi.id === item.issueId);
      if (!issue) return;
      const dept = (departments || []).find(d => d.id === issue.departmentId);
      const deptName = dept ? dept.name : (issue.departmentId || 'General Production');
      data[deptName] = (data[deptName] || 0) + (Number(item.quantity) || 0);
    });
    return Object.entries(data).map(([name, quantity]) => ({ name, quantity }));
  }, [materialIssueItems, materialIssues, departments]);

  const topConsumedItems = useMemo(() => {
    const data: Record<string, number> = {};
    (materialIssueItems || []).forEach(item => {
      const matched = (items || []).find(i => i.id === item.itemId);
      const itemName = matched ? matched.name : (item.itemId || 'Raw Material');
      data[itemName] = (data[itemName] || 0) + (Number(item.quantity) || 0);
    });
    return Object.entries(data).map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 6);
  }, [materialIssueItems, items]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Material Issue Vouchers</div>
          <div className="text-2xl font-black text-amber-500 mt-1">{materialIssues.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Approved issue requests</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Quantity Consumed</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {materialIssueItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Issued to production departments</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Consuming Departments</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{consumptionByDept.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Active departmental centers</div>
        </div>
      </div>

      {/* Consumption Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Material Consumption by Department</h2>
          <p className="text-xs text-gray-500 mb-6">Quantity issued per department</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionByDept}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="quantity" name="Quantity Consumed" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Top Consumed Raw Materials</h2>
          <p className="text-xs text-gray-500 mb-6">Most issued materials</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConsumedItems} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="quantity" name="Quantity Issued" fill="#6366F1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= EXPORT DATA CENTER VIEW ================= */
function ExportDataCenter({ gateEntriesYashoda, gateEntriesAIPL, items, stock, prs, pos, materialIssues, materialIssueItems }: any) {
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGateYashoda = () => {
    const headers = ['SL No', 'Date', 'Vehicle No', 'Party Name', 'GST No', 'Material Description', 'Quantity', 'UOM', 'Rate/UOM', 'Base Price', 'SGST', 'CGST', 'IGST', 'Total Price', 'eWay Bill', 'Invoice No/Value', 'In Time', 'Out Time', 'Driver Licence', 'Contact/Sign', 'Security Sign'];
    const rows = (gateEntriesYashoda || []).map((e: any) => [
      e.slNo || '', e.date || '', e.vehicleNo || '', e.partyName || '', e.gstNo || '', e.materialDescription || '', e.quantityWeight || '', e.unit || '', e.rateUom || '', e.basePrice || '', e.sgst || '', e.cgst || '', e.igst || '', e.totalPrice || '', e.ewayBill || '', e.invoiceNoValue || '', e.inTime || '', e.outTime || '', e.driverLicenceNo || '', e.contactNoSign || '', e.securitySign || ''
    ]);
    downloadCSV('Yashoda_Gate_Entry_Register.csv', headers, rows);
  };

  const handleExportGateAIPL = () => {
    const headers = ['SL', 'Date', 'Vehicle No', 'Party Name', 'GST No', 'Material Description', 'Quantity', 'UOM', 'Rate/UOM', 'Base Price', 'SGST', 'CGST', 'IGST', 'Total Price', 'eWay Bill', 'Invoice No/Value', 'In Time', 'Out Time', 'Driver Licence', 'Contact/Sign', 'Security Sign'];
    const rows = (gateEntriesAIPL || []).map((e: any) => [
      e.slNo || '', e.date || '', e.vehicleNo || '', e.partyName || '', e.gstNo || '', e.materialDescription || '', e.quantityWeight || '', e.unit || '', e.rateUom || '', e.basePrice || '', e.sgst || '', e.cgst || '', e.igst || '', e.totalPrice || '', e.ewayBill || '', e.invoiceNoValue || '', e.inTime || '', e.outTime || '', e.driverLicenceNo || '', e.contactNoSign || '', e.securitySign || ''
    ]);
    downloadCSV('AIPL_Gate_Entry_Register.csv', headers, rows);
  };

  const handleExportItemsStock = () => {
    const headers = ['Item ID', 'SKU', 'Item Name', 'Category', 'UOM', 'Type', 'Reorder Level', 'Total Stock Qty'];
    const rows = (items || []).map((i: any) => {
      const itemQty = (stock || []).filter((s: any) => s.itemId === i.id).reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);
      return [i.id || '', i.sku || '', i.name || '', i.categoryId || '', i.uom || '', i.type || '', i.reorderLevel || 0, itemQty];
    });
    downloadCSV('Item_Master_And_Stock_Report.csv', headers, rows);
  };

  const handleExportProcurement = () => {
    const headers = ['PO ID', 'PO Number', 'Supplier ID', 'Issue Date', 'Delivery Date', 'Total Amount', 'Status'];
    const rows = (pos || []).map((p: any) => [
      p.id || '', p.poNumber || '', p.supplierId || '', p.issueDate || '', p.deliveryDate || '', p.totalAmount || 0, p.status || ''
    ]);
    downloadCSV('Purchase_Orders_Report.csv', headers, rows);
  };

  const handleExportConsumption = () => {
    const headers = ['Issue ID', 'Department ID', 'Issue Date', 'Issued By', 'Item ID', 'Quantity'];
    const rows = (materialIssueItems || []).map((mi: any) => {
      const parent = (materialIssues || []).find((m: any) => m.id === mi.issueId);
      return [mi.issueId || '', parent?.departmentId || '', parent?.issueDate || '', parent?.issuedBy || '', mi.itemId || '', mi.quantity || 0];
    });
    downloadCSV('Material_Consumption_Report.csv', headers, rows);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-500" /> Export Data & CSV Downloader
        </h2>
        <p className="text-xs text-gray-500">
          Download complete raw dataset spreadsheets in standard CSV format for offline reporting and audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Truck className="w-4 h-4" /> Yashoda Gate Register
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export all Yashoda Linen Yarn Ltd gate entry inward records with vehicle numbers, rate, GST, e-Way bills.
            </p>
          </div>
          <button onClick={handleExportGateYashoda} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Yashoda Gate Entries ({gateEntriesYashoda.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-amber-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Truck className="w-4 h-4" /> Contractor AIPL Gate Register
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export all Contractor AIPL gate entry records with vehicle numbers, rate, GST, e-Way bills.
            </p>
          </div>
          <button onClick={handleExportGateAIPL} className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export AIPL Gate Entries ({gateEntriesAIPL.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Package className="w-4 h-4" /> Item Master & Stock Balances
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export current items catalog, categories, reorder levels, and aggregated warehouse stock quantities.
            </p>
          </div>
          <button onClick={handleExportItemsStock} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Item Master & Stock ({items.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <ShoppingCart className="w-4 h-4" /> Purchase Orders & Procurement
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export purchase orders, supplier IDs, requisition values, and approval status logs.
            </p>
          </div>
          <button onClick={handleExportProcurement} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Purchase Orders ({pos.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-purple-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
              <Layers className="w-4 h-4" /> Material Consumption Records
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export department material issue vouchers, issued quantities, dates, and issuer signatures.
            </p>
          </div>
          <button onClick={handleExportConsumption} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Consumption Data ({materialIssues.length})
          </button>
        </div>
      </div>
    </div>
  );
}

