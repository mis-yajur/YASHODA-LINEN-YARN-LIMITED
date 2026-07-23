import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Download, Plus, MapPin } from 'lucide-react';
import { initialGateEntries } from '../data/initialData';

export default function GateRegister() {
  const { gateEntries } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Combine context entries with hardcoded entries for demo
  const allEntries = [...initialGateEntries, ...gateEntries];

  const filteredEntries = allEntries.filter(entry => 
    entry.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.materialDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" /> Gate Entry Register
        </h1>
        <div className="flex gap-2">
          <button className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by party, material or vehicle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg whitespace-nowrap">
            <Filter className="w-4 h-4" /> Filter By Date
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">SL. No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle No.</th>
                <th className="px-4 py-3">Party Name</th>
                <th className="px-4 py-3">Material Description</th>
                <th className="px-4 py-3">Quantity & Weight</th>
                <th className="px-4 py-3">In Time</th>
                <th className="px-4 py-3">Out Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
              {filteredEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{entry.slNo}</td>
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.vehicleNo || '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{entry.partyName}</td>
                  <td className="px-4 py-3 truncate max-w-xs" title={entry.materialDescription}>{entry.materialDescription}</td>
                  <td className="px-4 py-3">{entry.quantityWeight}</td>
                  <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">{entry.inTime}</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{entry.outTime}</td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No entries found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
