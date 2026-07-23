import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, IndianRupee, ArrowRightLeft, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { stock = [], items = [], materialIssues = [], gateEntriesYashoda = [], gateEntriesAIPL = [] } = useApp();

  // Metrics
  const currentStock = (stock || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Mocking stock value for now since we don't have price on Item
  const stockValue = (stock || []).reduce((sum, item) => sum + ((item.quantity || 0) * 150), 0); 

  // This month transactions (Gate Entries + Material Issues)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthIssues = (materialIssues || []).filter(m => {
    if (!m || !m.date) return false;
    const d = new Date(m.date);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  
  const thisMonthGate = [...(gateEntriesYashoda || []), ...(gateEntriesAIPL || [])].filter(g => {
    if (!g || !g.date) return false;
    const d = new Date(g.date);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  
  const thisMonthTransactions = thisMonthIssues + thisMonthGate;

  // Top 10 High Value Items (using quantity * mock price)
  const top10Items = useMemo(() => {
    const itemTotals = (items || []).map(item => {
      const itemStock = (stock || []).filter(s => s.itemId === item.id).reduce((sum, s) => sum + (s.quantity || 0), 0);
      return {
        name: item.name || 'Unknown',
        value: itemStock * 150, // mock price
        quantity: itemStock
      };
    });
    
    return itemTotals.sort((a, b) => b.value - a.value).slice(0, 10);
  }, [items, stock]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Current Stock Qty" value={currentStock.toLocaleString()} icon={Package} color="bg-blue-500" />
        <StatCard title="Stock Value (Est)" value={formatCurrency(stockValue)} icon={IndianRupee} color="bg-emerald-500" />
        <StatCard title="This Month Trans." value={thisMonthTransactions.toString()} icon={ArrowRightLeft} color="bg-purple-500" />
        <StatCard title="Active Items" value={items.length.toString()} icon={TrendingUp} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold mb-4">Top 10 High Value Items (Stock)</h2>
          <div className="h-80">
            {top10Items.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Items} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    interval={0}
                    height={60}
                  />
                  <YAxis 
                    tickFormatter={(val) => `₹${(val / 1000)}k`}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No stock data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
      <div className={`p-4 rounded-xl text-white ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
