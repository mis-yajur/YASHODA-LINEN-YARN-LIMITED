import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Warehouse, Department } from '../types';
import { Plus, MapPin, Building, Store, X, FolderTree, Users, Factory, Pencil, Trash2, Package } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';

export default function Masters() {
    const { users = [], addUser, updateUser, items = [], addItem, warehouses = [], departments = [], addWarehouse, updateWarehouse, deleteWarehouse, addDepartment, updateDepartment, deleteDepartment, stock = [] } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'warehouse' | 'department' | 'company' | 'user' | 'item'>('warehouse');
    const [activeTab, setActiveTab] = useState<'departments' | 'warehouses' | 'companies' | 'users' | 'items'>('departments');
  const [editItem, setEditItem] = useState<any>(null);
  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      if (activeTab === 'departments') {
        await addDepartment({ name: row.name || '', head: row.head || '', plantId: row.plantId || 'Plant-1' });
      } else if (activeTab === 'warehouses') {
        await addWarehouse({ name: row.name || '', type: row.type || 'Warehouse' });
      } else if (activeTab === 'items') {
        await addItem({ 
          name: row.name || '', 
          sku: row.sku || '', 
          categoryId: row.categoryId || 'Cat-1', 
          uom: row.uom || 'Kgs', 
          reorderLevel: Number(row.reorderLevel) || 10, 
          type: row.type || 'Raw Material' 
        });
      }
    }
    alert('Bulk upload completed');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Master Configurations</h1>
                {(activeTab === 'warehouses' || activeTab === 'departments' || activeTab === 'companies' || activeTab === 'users' || activeTab === 'items') && (
          <div className="flex gap-2">
            <CSVUploader onUpload={handleBulkUpload} />
          <button 
            onClick={() => { 
              setEditItem(null);
              if (activeTab === 'warehouses') setModalType('warehouse');
              else if (activeTab === 'departments') setModalType('department');
              else if (activeTab === 'companies') setModalType('user');
                            else if (activeTab === 'users') setModalType('user');
              else if (activeTab === 'items') setModalType('item');
              setIsModalOpen(true); 
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add {activeTab === 'warehouses' ? 'Warehouse' : activeTab === 'departments' ? 'Department' : activeTab === 'companies' ? 'User' : activeTab === 'items' ? 'Item' : 'User'}
          </button>
          </div>
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
          <Users className="w-4 h-4" /> Users
        </button>
        
              <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'items' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Items
        </button>
      </div>
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(warehouses || []).map(wh => {
            const whStock = (stock || []).filter(i => i.warehouseId === wh.id);
            const totalItems = new Set(whStock.map(i => i.itemId)).size;
            const totalQuantity = whStock.reduce((sum, i) => sum + i.quantity, 0);
            
            const Icon = wh.type.toLowerCase() === 'store' ? Store : Building;

            return (
              <div key={wh.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col h-full group">
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
                  <div className="flex gap-1 opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditItem(wh); setModalType('warehouse'); setIsModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Edit Warehouse"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Delete this warehouse?')) deleteWarehouse(wh.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Warehouse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            <div key={dept.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-between gap-4 group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{dept.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Head: {dept.head}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditItem(dept); setModalType('department'); setIsModalOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Edit Department"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { if(window.confirm('Delete this department?')) deleteDepartment(dept.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
            <h2 className="font-bold text-lg">Users</h2>
            <button 
              onClick={() => { setModalType('user'); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
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
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users && users.length > 0 ? users : [{ id: '1', name: 'Admin User', email: 'admin@yashoda.com', role: 'Administrator', status: 'Active' }]).map(u => (
                <tr key={u.id}>
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    {u.name}
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <span className={`${u.status === 'Active' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded-full text-xs font-medium`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { setEditItem(u); setModalType('user'); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
                    </table>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Name</th>
                <th className="p-4">UOM</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{item.sku}</td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.uom}</td>
                  <td className="p-4">
                    <button onClick={() => {}} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <MasterModal 
          type={modalType}
          initialData={editItem}
          onClose={() => { setIsModalOpen(false); setEditItem(null); }}
          onSave={async (data) => {
            if (modalType === 'warehouse') {
              if (editItem) await updateWarehouse(editItem.id, data);
              else await addWarehouse(data);
            }
            else if (modalType === 'department') {
              if (editItem) await updateDepartment(editItem.id, data);
              else await addDepartment(data);
            }
            else if (modalType === 'company') {
              // noop
            }
            else if (modalType === 'item') {
               await addItem(data);
            }
            else if (modalType === 'user') {
              if (editItem) await updateUser(editItem.id, data);
              else await addUser(data);
            }
            setIsModalOpen(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
}

function MasterModal({ type, onClose, onSave, initialData }: { type: string, onClose: () => void, onSave: (data: any) => void, initialData?: any }) {
  const [formData, setFormData] = useState(
    initialData || (
    type === 'warehouse' ? { name: '', type: 'Warehouse' } :
    type === 'department' ? { name: '', head: '', plantId: 'Plant-1' } :
    type === 'company' ? { name: '', type: 'Company', location: '' } :
    { name: '', email: '', role: 'User', status: 'Active', password: '' }
    )
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold">
            {initialData ? `Edit ${type === 'warehouse' ? 'Warehouse' : type === 'department' ? 'Department' : type === 'company' ? 'Company' : 'User'}` :
            type === 'warehouse' ? 'New Warehouse' : 
             type === 'department' ? 'New Department' : 
             type === 'company' ? 'New Company/Plant' : type === 'item' ? 'New Item' : 'New User'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={(formData as any).name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
          </div>
          {type === 'warehouse' && (
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={(formData as any).type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
                <option value="Warehouse">Warehouse</option>
                <option value="Store">Store</option>
              </select>
            </div>
          )}
          {type === 'department' && (
            <div>
              <label className="block text-sm font-medium mb-1">Department Head</label>
              <input type="text" value={(formData as any).head} onChange={e => setFormData({...formData, head: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
            </div>
          )}
          {type === 'company' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={(formData as any).type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
                  <option value="Company">Company</option>
                  <option value="Plant">Plant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location / Address</label>
                <input type="text" value={(formData as any).location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
            </>
          )}
                    {type === 'item' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input type="text" value={(formData as any).sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit of Measure (UoM)</label>
                <input type="text" value={(formData as any).uom} onChange={e => setFormData({...formData, uom: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={(formData as any).type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
                  <option value="Raw Material">Raw Material</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Spare Part">Spare Part</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reorder Level</label>
                <input type="number" value={(formData as any).reorderLevel} onChange={e => setFormData({...formData, reorderLevel: Number(e.target.value)})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
            </>
          )}
          {type === 'user' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={(formData as any).email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              {!initialData && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" value={(formData as any).password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={(formData as any).role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                </select>
              </div>
            </>
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
