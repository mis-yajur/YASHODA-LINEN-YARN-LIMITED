import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Download, Plus, MapPin, X, ExternalLink, LogIn, Edit, Trash2, MoreVertical, Calendar, RotateCcw } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';
import { GateEntry } from '../types';
import { parseDateToYYYYMMDD } from '../lib/utils';

export default function GateRegister() {
  const { items = [], gateEntriesYashoda = [], gateEntriesAIPL = [], addGateEntry, updateGateEntry, deleteGateEntry, clearAllGateEntries } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companyType, setCompanyType] = useState<'AIPL' | 'Yashoda'>('Yashoda');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      const entry: Omit<GateEntry, 'id'> = {
        slNo: row.slNo || String(Date.now()),
        date: row.date || new Date().toISOString().split('T')[0],
        vehicleNo: row.vehicleNo || '',
        partyName: row.partyName || '',
        gstNo: row.gstNo || row['GST No.'] || '',
        materialDescription: row.materialDescription || row['Material Description'] || '',
        quantityWeight: row.quantityWeight || row['Quantity'] || '',
        unit: row.unit || row['UOM'] || 'Kgs',
        rateUom: row.rateUom || row['RATE/UOM'] || '',
        basePrice: row.basePrice || row['Base Price'] || '',
        sgst: row.sgst || row['SGST'] || '',
        cgst: row.cgst || row['CGST'] || '',
        igst: row.igst || row['IGST'] || '',
        totalPrice: row.totalPrice || row['Total Price'] || '',
        ewayBill: row.ewayBill || row['e-Way Bill'] || '',
        invoiceNoValue: row.invoiceNoValue || row['Invoice No./Value'] || '',
        inTime: row.inTime || row['In Time'] || '',
        outTime: row.outTime || row['Out Time'] || '',
        driverLicenceNo: row.driverLicenceNo || row['Driver Licence No.'] || '',
        contactNoSign: row.contactNoSign || row['Contact No./Sign.'] || '',
        securitySign: row.securitySign || row['Security Sign.'] || ''
      };
      await addGateEntry(entry, companyType);
    }
    alert(`Bulk upload completed for ${companyType === 'Yashoda' ? 'Yashoda' : 'Contractor AIPL'}`);
  };
  // Unique material descriptions from previous entries and items
  const uniqueMaterialDescriptions = useMemo(() => {
    const set = new Set<string>();
    (gateEntriesYashoda || []).forEach(e => {
      if (e.materialDescription?.trim()) set.add(e.materialDescription.trim());
    });
    (gateEntriesAIPL || []).forEach(e => {
      if (e.materialDescription?.trim()) set.add(e.materialDescription.trim());
    });
    (items || []).forEach(i => {
      if (i.name?.trim()) set.add(i.name.trim());
    });
    return Array.from(set).sort();
  }, [gateEntriesYashoda, gateEntriesAIPL, items]);
  
  
  // Auth State
  
  
  
  
  

  

  
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleNo: '',
    partyName: '',
    gstNo: '',
    materialDescription: '',
    quantityWeight: '',
    unit: 'Kgs',
    rateUom: '',
    basePrice: '',
    sgst: '',
    cgst: '',
    igst: '',
    totalPrice: '',
    ewayBill: '',
    inTime: '',
    outTime: '',
    invoiceNoValue: '',
    driverLicenceNo: '',
    contactNoSign: '',
    securitySign: ''
  });

  const allEntries = [...(companyType === 'Yashoda' ? (gateEntriesYashoda || []) : (gateEntriesAIPL || []))].reverse();

  const filteredEntries = (allEntries || []).filter(entry => {
    const matchesSearch = 
      (entry?.partyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry?.materialDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry?.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const parsedEntryDate = parseDateToYYYYMMDD(entry.date);

    if (startDate) {
      if (!parsedEntryDate || parsedEntryDate < startDate) return false;
    }
    if (endDate) {
      if (!parsedEntryDate || parsedEntryDate > endDate) return false;
    }

    return true;
  });

  const ITEMS_PER_PAGE = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE) || 1;
  
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') return;
      
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));
      
      if (rows.length > 1) {
        try {
          let currentSlNo = allEntries.length;
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 4) continue;
            currentSlNo++;
            
            // Adjust mapping based on companyType
            let entry = {};
            if (true) {
              entry = {
                
                slNo: currentSlNo.toString(),
                date: row[1] || '',
                vehicleNo: row[2] || '',
                partyName: row[3] || '',
                gstNo: row[4] || '',
                materialDescription: row[5] || '',
                quantityWeight: row[6] || '',
                unit: row[7] || 'Kgs',
                rateUom: row[8] || '',
                basePrice: row[9] || '',
                sgst: row[10] || '',
                cgst: row[11] || '',
                igst: row[12] || '',
                totalPrice: row[13] || '',
                ewayBill: row[14] || '',
                invoiceNoValue: row[15] || '',
                inTime: row[16] || '',
                outTime: row[17] || '',
                driverLicenceNo: row[18] || '',
                contactNoSign: row[19] || '',
                securitySign: row[20] || ''
              };
            }
            await addGateEntry(entry as any, companyType);
          }
          alert("Import successful");
        } catch (error) {
          console.error('Import failed', error);
          alert('Import failed. Please check the CSV format.');
        } finally {
          e.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleEdit = (entry: GateEntry) => {
    setFormData({
      date: entry.date || '',
      vehicleNo: entry.vehicleNo || '',
      partyName: entry.partyName || '',
      gstNo: entry.gstNo || '',
      materialDescription: entry.materialDescription || '',
      quantityWeight: entry.quantityWeight || '',
      unit: entry.unit || 'Kgs',
      rateUom: entry.rateUom || '',
      basePrice: entry.basePrice || '',
      sgst: entry.sgst || '',
      cgst: entry.cgst || '',
      igst: entry.igst || '',
      totalPrice: entry.totalPrice || '',
      ewayBill: entry.ewayBill || '',
      inTime: entry.inTime || '',
      outTime: entry.outTime || '',
      invoiceNoValue: entry.invoiceNoValue || '',
      driverLicenceNo: entry.driverLicenceNo || '',
      contactNoSign: entry.contactNoSign || '',
      securitySign: entry.securitySign || ''
    });
    setEditId(entry.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteGateEntry(id, companyType);
    }
  };

  const handleExport = () => {
    const headers = ['SL', 'Date', 'Vehicle No.', 'Party Name', 'GST No.', 'Material Description', 'Quantity', 'UOM', 'RATE/UOM', 'Base Price', 'SGST', 'CGST', 'IGST', 'Total Price', 'e-Way Bill', 'Invoice No./Value', 'In Time', 'Out Time', 'Driver Licence No.', 'Contact No./Sign.', 'Security Sign.'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + filteredEntries.map(e => 
      `"${e.slNo}","${e.date}","${e.vehicleNo}","${e.partyName}","${e.gstNo}","${e.materialDescription}","${e.quantityWeight}","${e.unit}","${e.rateUom}","${e.basePrice}","${e.sgst}","${e.cgst}","${e.igst}","${e.totalPrice}","${e.ewayBill}","${e.invoiceNoValue}","${e.inTime}","${e.outTime}","${e.driverLicenceNo}","${e.contactNoSign}","${e.securitySign}"`
    ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gate_register_${companyType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateGateEntry(editId, { ...formData }, companyType);
      } else {
        const slNo = (allEntries.length + 1).toString();
        await addGateEntry({ ...formData, slNo }, companyType);
      }
      setIsModalOpen(false);
      setEditId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vehicleNo: '',
        partyName: '',
        gstNo: '',
        materialDescription: '',
        quantityWeight: '',
        unit: 'Kgs',
        rateUom: '',
        basePrice: '',
        sgst: '',
        cgst: '',
        igst: '',
        totalPrice: '',
        ewayBill: '',
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
      
    }
  };

  
  const hasGstNo = currentEntries.some(e => e.gstNo);
  const hasRateUom = currentEntries.some(e => e.rateUom);
  const hasBasePrice = currentEntries.some(e => e.basePrice);
  const hasSgst = currentEntries.some(e => e.sgst);
  const hasCgst = currentEntries.some(e => e.cgst);
  const hasIgst = currentEntries.some(e => e.igst);
  const hasTotalPrice = currentEntries.some(e => e.totalPrice);
  const hasEwayBill = currentEntries.some(e => e.ewayBill);
  const hasInvoiceNoValue = currentEntries.some(e => e.invoiceNoValue);
  const hasInTime = currentEntries.some(e => e.inTime);
  const hasOutTime = currentEntries.some(e => e.outTime);
  const hasDriverLicenceNo = currentEntries.some(e => e.driverLicenceNo);
  const hasContactNoSign = currentEntries.some(e => e.contactNoSign);
  const hasSecuritySign = currentEntries.some(e => e.securitySign);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" /> Gate Entry Register
        </h1>
        <div className="flex gap-2 items-center">
          <div className="relative overflow-hidden inline-block">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImport} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              title="Import CSV"
            />
            <button className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
              <Download className="w-4 h-4 rotate-180" /> Import CSV
            </button>
          </div>
          <button onClick={handleExport} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> New Entry
          </button>
          <button onClick={async () => { if (confirm('Delete ALL Gate Entries? This cannot be undone.')) await clearAllGateEntries(companyType); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
            <X className="w-4 h-4" /> Delete All
          </button>
        </div>
      </div>
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => { setCompanyType('Yashoda'); setCurrentPage(1); }}
          className={`flex-1 sm:flex-none text-center px-6 py-3 font-bold text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${companyType === 'Yashoda' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <span>Yashoda Store Table</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
            {gateEntriesYashoda.length}
          </span>
        </button>
        <button
          onClick={() => { setCompanyType('AIPL'); setCurrentPage(1); }}
          className={`flex-1 sm:flex-none text-center px-6 py-3 font-bold text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${companyType === 'AIPL' ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <span>Contractor AIPL Store Table</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            {gateEntriesAIPL.length}
          </span>
        </button>
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
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 font-semibold hidden md:inline">Date:</span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-medium outline-none text-gray-700 dark:text-gray-300"
              title="Start Date"
            />
            <span className="text-gray-400 font-bold">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-medium outline-none text-gray-700 dark:text-gray-300"
              title="End Date"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }} 
                className="p-1 text-gray-400 hover:text-red-500 rounded"
                title="Clear Date Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">{companyType === 'AIPL' ? 'SL' : 'SL. No'}</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle No.</th>
                <th className="px-4 py-3">Party Name</th>
                <th className="px-4 py-3">GST No.</th>
                <th className="px-4 py-3">Material Description</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">UOM</th>
                <th className="px-4 py-3">RATE/UOM</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">SGST</th>
                <th className="px-4 py-3">CGST</th>
                <th className="px-4 py-3">IGST</th>
                <th className="px-4 py-3">Total Price</th>
                <th className="px-4 py-3">e-Way Bill</th>
                <th className="px-4 py-3">Invoice No./Value</th>
                <th className="px-4 py-3">In Time</th>
                <th className="px-4 py-3">Out Time</th>
                <th className="px-4 py-3">Driver Licence No.</th>
                <th className="px-4 py-3">Contact No./Sign.</th>
                <th className="px-4 py-3">Security Sign.</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
              {currentEntries.map((entry, idx) => (
                <tr key={idx} onDoubleClick={() => handleEdit(entry)} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                  <td className="px-4 py-3 font-medium">{entry.slNo}</td>
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.vehicleNo || '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{entry.partyName || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.gstNo || '-'}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]" title={entry.materialDescription}>{entry.materialDescription || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{entry.quantityWeight || '-'}</td>
                  <td className="px-4 py-3 text-xs">{entry.unit || '-'}</td>
                  <td className="px-4 py-3 font-mono">{entry.rateUom || '-'}</td>
                  <td className="px-4 py-3 font-mono">{entry.basePrice || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.sgst || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.cgst || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.igst || '-'}</td>
                  <td className="px-4 py-3 font-extrabold font-mono text-gray-900 dark:text-white">{entry.totalPrice || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.ewayBill || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.invoiceNoValue || '-'}</td>
                  <td className="px-4 py-3 text-xs">{entry.inTime || '-'}</td>
                  <td className="px-4 py-3 text-xs">{entry.outTime || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.driverLicenceNo || '-'}</td>
                  <td className="px-4 py-3 text-xs">{entry.contactNoSign || '-'}</td>
                  <td className="px-4 py-3 text-xs">{entry.securitySign || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(entry); }} className="p-1 text-gray-500 hover:text-indigo-600 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentEntries.length === 0 && (
                <tr>
                  <td colSpan={22} className="px-4 py-8 text-center text-gray-500">
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              <h2 className="text-xl font-bold">{editId ? 'Edit Gate Entry' : 'New Gate Entry'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditId(null); }} className="text-gray-500 hover:text-gray-700">
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
                  <label className="block text-sm font-medium mb-1">
                    Material Description <span className="text-xs text-gray-500 font-normal">(Auto-suggest or type new)</span>
                  </label>
                  <input
                    required
                    type="text"
                    list="material-descriptions-list"
                    placeholder="Type or select existing material..."
                    value={formData.materialDescription}
                    onChange={e => setFormData({...formData, materialDescription: e.target.value})}
                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 font-medium"
                  />
                  <datalist id="material-descriptions-list">
                    {uniqueMaterialDescriptions.map((desc, idx) => (
                      <option key={idx} value={desc} />
                    ))}
                  </datalist>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">GST No.</label>
                    <input type="text" value={formData.gstNo} onChange={e => setFormData({...formData, gstNo: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                  </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <div className="flex gap-2">
                    <input required type="text" value={formData.quantityWeight} onChange={e => setFormData({...formData, quantityWeight: e.target.value})} className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-24 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
                      <option value="Kgs">Kgs</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Box">Box</option>
                      <option value="Ltr">Ltr</option>
                      <option value="Ton">Ton</option>
                      <option value="Bale">Bale</option>
                    </select>
                  </div>
                </div>
                <div>
                      <label className="block text-sm font-medium mb-1">RATE/UOM</label>
                      <input type="text" value={formData.rateUom} onChange={e => setFormData({...formData, rateUom: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Base Price</label>
                      <input type="text" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SGST</label>
                      <input type="text" value={formData.sgst} onChange={e => setFormData({...formData, sgst: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CGST</label>
                      <input type="text" value={formData.cgst} onChange={e => setFormData({...formData, cgst: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">IGST</label>
                      <input type="text" value={formData.igst} onChange={e => setFormData({...formData, igst: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Price</label>
                      <input type="text" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">e-Way Bill</label>
                      <input type="text" value={formData.ewayBill} onChange={e => setFormData({...formData, ewayBill: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
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
                  <label className="block text-sm font-medium mb-1">Contact No. / Sign.</label>
                  <input type="text" value={formData.contactNoSign} onChange={e => setFormData({...formData, contactNoSign: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Security Sign.</label>
                  <input type="text" value={formData.securitySign} onChange={e => setFormData({...formData, securitySign: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditId(null); }} className="px-4 py-2 border rounded text-gray-600 dark:text-gray-300">Cancel</button>
                <button type="submit"  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                  {editId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
