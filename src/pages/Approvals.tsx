import React, { useState } from 'react';
import { CheckSquare, XSquare, Clock, Filter } from 'lucide-react';

export default function Approvals() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingApprovals = [
    { id: 'PR-2023-001', type: 'Purchase Requisition', department: 'Production', date: '2023-10-25', amount: '$5,000', status: 'Pending' },
    { id: 'MI-2023-042', type: 'Material Issue', department: 'Maintenance', date: '2023-10-26', amount: 'N/A', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Approvals Workflow</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Clock className="w-4 h-4" /> Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <CheckSquare className="w-4 h-4" /> Approval History
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Pending Requests</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {pendingApprovals.map((req, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-indigo-600">{req.id}</td>
                    <td className="px-6 py-4">{req.type}</td>
                    <td className="px-6 py-4">{req.department}</td>
                    <td className="px-6 py-4">{req.date}</td>
                    <td className="px-6 py-4">{req.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => alert('Approved!')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded">
                          <CheckSquare className="w-5 h-5" />
                        </button>
                        <button onClick={() => alert('Rejected!')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded">
                          <XSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingApprovals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No pending approvals.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 text-center text-gray-500">
          <p>No approval history found.</p>
        </div>
      )}
    </div>
  );
}
