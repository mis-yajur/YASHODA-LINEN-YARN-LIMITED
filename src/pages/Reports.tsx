import React, { useState } from 'react';
import { FileText, Download, Filter, BarChart2 } from 'lucide-react';

export default function Reports() {
  const [activeCategory, setActiveCategory] = useState<'inventory' | 'procurement' | 'consumption'>('inventory');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveCategory('inventory')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeCategory === 'inventory' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <BarChart2 className="w-4 h-4" /> Inventory Reports
        </button>
        <button
          onClick={() => setActiveCategory('procurement')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeCategory === 'procurement' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText className="w-4 h-4" /> Procurement Reports
        </button>
        <button
          onClick={() => setActiveCategory('consumption')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeCategory === 'consumption' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText className="w-4 h-4" /> Consumption Reports
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">Available Reports</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg">
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
