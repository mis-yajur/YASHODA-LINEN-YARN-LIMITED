import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, MapPin, Users, AlertTriangle, ArrowRightLeft } from 'lucide-react';

export default function Dashboard() {
  const { items, stock, materialIssues, warehouses, suppliers } = useApp();

  const totalItems = items.length;
  const totalStockValue = stock.reduce((sum, item) => sum + item.quantity, 0); // Simplified value as quantity for now
  const lowStockItems = items.filter(item => {
    const itemStock = stock.filter(i => i.itemId === item.id).reduce((sum, i) => sum + i.quantity, 0);
    return itemStock < item.reorderLevel;
  });

  const recentIssues = [...materialIssues].reverse().slice(0, 5);

  const stockByWarehouse = warehouses.map(w => {
    const wStock = stock.filter(i => i.warehouseId === w.id);
    return {
      name: w.name,
      value: wStock.reduce((sum, i) => sum + i.quantity, 0)
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Items (Master)" value={totalItems} icon={Package} color="bg-blue-500" />
        <StatCard title="Total Stock Qty" value={totalStockValue} icon={MapPin} color="bg-emerald-500" />
        <StatCard title="Suppliers" value={suppliers.length} icon={Users} color="bg-purple-500" />
        <StatCard title="Low Stock Alerts" value={lowStockItems.length} icon={AlertTriangle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold mb-4">Stock by Warehouse</h2>
          <div className="h-64">
            {stockByWarehouse.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByWarehouse}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No stock data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold mb-4">Recent Material Issues</h2>
          <div className="space-y-4">
            {recentIssues.length > 0 ? recentIssues.map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Issue to Dept: {issue.departmentId}</p>
                    <p className="text-xs text-gray-500">{new Date(issue.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded">
                    {issue.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-400 py-8">No recent material issues</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
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
