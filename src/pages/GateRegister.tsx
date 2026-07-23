import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Download, Plus, MapPin, X, ExternalLink, LogIn } from 'lucide-react';
import { initialGateEntries } from '../data/initialData';
import { initAuth, googleSignIn, User } from '../lib/auth';
import { getOrCreateSpreadsheet, appendRow, getSpreadsheetLink } from '../lib/sheets';

export default function GateRegister() {
  const { gateEntries, addGateEntry } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Auth State
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setSheetUrl(getSpreadsheetLink());
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        const spreadsheetId = await getOrCreateSpreadsheet();
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('Failed to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleNo: '',
    partyName: '',
    materialDescription: '',
    quantityWeight: '',
    inTime: '',
    outTime: '',
    invoiceNoValue: '',
    driverLicenceNo: '',
    contactNoSign: '',
    securitySign: ''
  });

  const allEntries = [...initialGateEntries, ...gateEntries].reverse();

  const filteredEntries = allEntries.filter(entry => 
    entry.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.materialDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ITEMS_PER_PAGE = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE) || 1;
  
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = () => {
    // Basic CSV export
    const headers = ['SL. No', 'Date', 'Vehicle No.', 'Party Name', 'Material Description', 'Quantity & Weight', 'In Time', 'Out Time', 'Invoice No./Value', 'Driver Licence No.', 'Contact No.'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + filteredEntries.map(e => {
        return `"${e.slNo}","${e.date}","${e.vehicleNo}","${e.partyName}","${e.materialDescription}","${e.quantityWeight}","${e.inTime}","${e.outTime}","${e.invoiceNoValue}","${e.driverLicenceNo}","${e.contactNoSign}"`;
      }).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gate_register.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsAuth) {
      alert("Please sign in to Google to sync gate entries.");
      return;
    }

    setIsSyncing(true);
    try {
      const spreadsheetId = await getOrCreateSpreadsheet();
      if (!sheetUrl) {
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
      }

      const slNo = (allEntries.length + 1).toString();
      
      // Save locally
      addGateEntry({ ...formData, slNo });
      
      // Sync to sheets
      await appendRow(spreadsheetId, [
        slNo,
        formData.date,
        formData.vehicleNo,
        formData.partyName,
        formData.materialDescription,
        formData.quantityWeight,
        formData.inTime,
        formData.outTime,
        formData.invoiceNoValue,
        formData.driverLicenceNo,
        formData.contactNoSign
      ]);

      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vehicleNo: '',
        partyName: '',
        materialDescription: '',
        quantityWeight: '',
        inTime: '',
        outTime: '',
        invoiceNoValue: '',
        driverLicenceNo: '',
        contactNoSign: '',
        securitySign: ''
      });
    } catch (err) {
      console.error('Failed to sync to Google Sheets', err);
      alert('Failed to sync to Google Sheets. Data was saved locally.');
      // Still close modal if local save was successful
      setIsModalOpen(false);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" /> Gate Entry Register
        </h1>
        <div className="flex gap-2 items-center">
          {needsAuth ? (
            <button 
              onClick={handleLogin} 
              disabled={isLoggingIn}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" /> {isLoggingIn ? 'Connecting...' : 'Connect Sheets'}
            </button>
          ) : (
            sheetUrl && (
              <a 
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" /> View Google Sheet
              </a>
            )
          )}
          <button onClick={handleExport} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={() => alert('Filter By Date coming soon!')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg whitespace-nowrap">
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
                <th className="px-4 py-3">Invoice No./Value</th>
                <th className="px-4 py-3">Driver Licence No.</th>
                <th className="px-4 py-3">Contact No.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
              {currentEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{entry.slNo}</td>
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.vehicleNo || '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{entry.partyName}</td>
                  <td className="px-4 py-3 truncate max-w-xs" title={entry.materialDescription}>{entry.materialDescription}</td>
                  <td className="px-4 py-3">{entry.quantityWeight}</td>
                  <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">{entry.inTime}</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{entry.outTime}</td>
                  <td className="px-4 py-3">{entry.invoiceNoValue}</td>
                  <td className="px-4 py-3">{entry.driverLicenceNo || '-'}</td>
                  <td className="px-4 py-3">{entry.contactNoSign || '-'}</td>
                </tr>
              ))}
              {currentEntries.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    No entries found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length} entries
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-200 dark:border-zinc-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-200 dark:border-zinc-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold">New Gate Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vehicle No</label>
                  <input type="text" value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Party Name</label>
                  <input required type="text" value={formData.partyName} onChange={e => setFormData({...formData, partyName: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Material Description</label>
                  <input required type="text" value={formData.materialDescription} onChange={e => setFormData({...formData, materialDescription: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity & Weight</label>
                  <input required type="text" value={formData.quantityWeight} onChange={e => setFormData({...formData, quantityWeight: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice No. / Value</label>
                  <input type="text" value={formData.invoiceNoValue} onChange={e => setFormData({...formData, invoiceNoValue: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">In Time</label>
                  <input type="time" value={formData.inTime} onChange={e => setFormData({...formData, inTime: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Out Time</label>
                  <input type="time" value={formData.outTime} onChange={e => setFormData({...formData, outTime: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Driver Licence No</label>
                  <input type="text" value={formData.driverLicenceNo} onChange={e => setFormData({...formData, driverLicenceNo: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact No</label>
                  <input type="text" value={formData.contactNoSign} onChange={e => setFormData({...formData, contactNoSign: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 dark:text-gray-300">Cancel</button>
                <button type="submit" disabled={isSyncing} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                  {isSyncing ? 'Syncing to Sheets...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
