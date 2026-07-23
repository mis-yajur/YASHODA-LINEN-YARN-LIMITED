import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Warehouse, Department } from '../types';
import { Plus, MapPin, Building, Store, X, FolderTree, Users, Factory } from 'lucide-react';

export default function Masters() {
  const { warehouses, departments, addWarehouse, addDepartment, stock } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'warehouse' | 'department'>('warehouse');
  const [activeTab, setActiveTab] = useState<'departments' | 'warehouses' | 'companies' | 'users'>('departments');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Master Configurations</h1>
        {(activeTab === 'warehouses' || activeTab === 'departments') && (
          <button 
            onClick={() => { setModalType(activeTab === 'warehouses' ? 'warehouse' : 'department'); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add {activeTab === 'warehouses' ? 'Warehouse' : 'Department'}
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'departments' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FolderTree className="w-4 h-4" /> Departments
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'warehouses' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Building className="w-4 h-4" /> Warehouses
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'companies' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Factory className="w-4 h-4" /> Companies & Plants
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Users className="w-4 h-4" /> Users & Roles
        </button>
      </div>

      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map(wh => {
            const whStock = stock.filter(i => i.warehouseId === wh.id);
            const totalItems = new Set(whStock.map(i => i.itemId)).size;
            const totalQuantity = whStock.reduce((sum, i) => sum + i.quantity, 0);
            
            const Icon = wh.type.toLowerCase() === 'store' ? Store : Building;

            return (
              <div key={wh.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{wh.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300">
                        {wh.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-zinc-800 pt-4 mt-auto">
                  <div>
                    <div className="text-xs text-gray-500">Unique Items</div>
                    <div className="font-bold text-lg">{totalItems}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Stock</div>
                    <div className="font-bold text-lg">{totalQuantity}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                <FolderTree className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{dept.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Head: {dept.head}</p>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
             <div className="col-span-full py-8 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
             No departments configured.
           </div>
          )}
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Companies & Plants</h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Company/Plant
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location/Address</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-zinc-800">
                <td className="p-4 font-medium">Yashoda Linen Yarn Limited</td>
                <td className="p-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">Company</span></td>
                <td className="p-4 text-gray-500">Head Office</td>
              </tr>
              <tr>
                <td className="p-4 pl-8 border-l-2 border-gray-200 dark:border-zinc-700">Main Plant</td>
                <td className="p-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Plant</span></td>
                <td className="p-4 text-gray-500">Unit 1</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Users & Roles</h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 font-medium flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">A</div>
                  Admin User
                </td>
                <td className="p-4 text-gray-500">admin@yashoda.com</td>
                <td className="p-4">Administrator</td>
                <td className="p-4"><span className="text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs font-medium">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <LocationModal 
          type={modalType}
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => { 
            if (modalType === 'warehouse') addWarehouse(data);
            else addDepartment(data);
            setIsModalOpen(false); 
          }} 
        />
      )}
    </div>
  );
}

function LocationModal({ type, onClose, onSave }: { type: 'warehouse' | 'department', onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(
    type === 'warehouse' 
      ? { name: '', type: 'Warehouse' }
      : { name: '', head: '', plantId: 'Plant-1' }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold">{type === 'warehouse' ? 'New Warehouse' : 'New Department'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={(formData as any).name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
          </div>
          {type === 'warehouse' ? (
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={(formData as any).type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
                <option value="Warehouse">Warehouse</option>
                <option value="Store">Store</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Department Head</label>
              <input type="text" value={(formData as any).head} onChange={e => setFormData({...formData, head: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}
