import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Code, Check, Copy, Link as LinkIcon, Database } from 'lucide-react';

const SCRIPT_CONTENT = `function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = [
    {name: "companies", headers: ["id", "name", "address"]},
    {name: "plants", headers: ["id", "companyId", "name", "location"]},
    {name: "departments", headers: ["id", "plantId", "name", "head"]},
    {name: "employees", headers: ["id", "departmentId", "name", "designation", "email", "phone"]},
    {name: "users", headers: ["id", "employeeId", "username", "roleId"]},
    {name: "roles", headers: ["id", "name", "permissions"]},
    {name: "suppliers", headers: ["id", "name", "contactName", "email", "phone", "address"]},
    {name: "item_categories", headers: ["id", "name", "description"]},
    {name: "units", headers: ["id", "name", "abbreviation"]},
    {name: "items", headers: ["id", "categoryId", "name", "sku", "uom", "reorderLevel", "type", "brandId"]},
    {name: "warehouses", headers: ["id", "plantId", "name", "type"]},
    {name: "warehouse_locations", headers: ["id", "warehouseId", "rack", "bin"]},
    {name: "purchase_requisitions", headers: ["id", "departmentId", "date", "status", "requestedBy"]},
    {name: "purchase_orders", headers: ["id", "supplierId", "date", "status", "expectedDelivery"]},
    {name: "goods_receipts", headers: ["id", "poId", "date", "receivedBy", "status"]},
    {name: "stock", headers: ["id", "itemId", "warehouseId", "quantity", "batchNo"]},
    {name: "stock_movements", headers: ["id", "itemId", "type", "quantity", "date", "referenceId"]},
    {name: "stock_adjustments", headers: ["id", "itemId", "warehouseId", "adjustedQty", "reason", "date", "approvedBy"]},
    {name: "stock_transfers", headers: ["id", "itemId", "fromWarehouseId", "toWarehouseId", "quantity", "date", "status"]},
    {name: "material_requisitions", headers: ["id", "departmentId", "date", "requestedBy", "status"]},
    {name: "material_issues", headers: ["id", "requisitionId", "departmentId", "date", "issuedBy", "receivedBy", "status"]},
    {name: "material_issue_items", headers: ["id", "issueId", "itemId", "quantity"]},
    {name: "material_returns", headers: ["id", "departmentId", "date", "returnedBy", "receivedBy", "reason"]},
    {name: "material_return_items", headers: ["id", "returnId", "itemId", "quantity"]}
  ];

  sheets.forEach(function(s) {
    var sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
      sheet.getRange(1, 1, 1, s.headers.length).setValues([s.headers]);
      sheet.getRange(1, 1, 1, s.headers.length).setFontWeight("bold");
    }
  });
  
  var sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1 && ss.getSheets().length > 1 && sheet1.getLastRow() === 0) {
    ss.deleteSheet(sheet1);
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var sheetName = payload.sheetName;
    var data = payload.data;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({error: "Sheet not found"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "append") {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var row = headers.map(function(h) { return data[h] !== undefined ? data[h] : ""; });
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "getAll") {
    var result = {};
    var sheets = ss.getSheets();
    sheets.forEach(function(sheet) {
      var name = sheet.getName();
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      if (values.length > 1) {
        var headers = values[0];
        var rows = [];
        for (var i = 1; i < values.length; i++) {
          var obj = {};
          for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = values[i][j];
          }
          rows.push(obj);
        }
        result[name] = rows;
      } else {
        result[name] = [];
      }
    });
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: "ok"})).setMimeType(ContentService.MimeType.JSON);
}`;

export default function Setup() {
  const { scriptUrl, setScriptUrl, initApp } = useApp();
  const [urlInput, setUrlInput] = useState(scriptUrl || '');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setScriptUrl(urlInput);
    setSaved(true);
    await initApp();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Database Setup</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configure Google Sheets as your backend database for Yashoda Linen Yarn Limited.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold shrink-0">1</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Create a Google Sheet & Apps Script</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Create a new Google Sheet. Go to <strong>Extensions &gt; Apps Script</strong>. Replace all code in <code className="bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Code.gs</code> with the code below.
            </p>
            <div className="relative group">
              <pre className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-300">
                <code>{SCRIPT_CONTENT}</code>
              </pre>
              <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold shrink-0">2</div>
          <div>
            <h3 className="font-bold text-lg mb-2">Initialize Database Tables</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              In the Apps Script editor, select the <code>setupSheets</code> function from the dropdown in the toolbar and click <strong>Run</strong>. This will automatically create all the necessary tabs and headers in your Google Sheet.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold shrink-0">3</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Deploy as Web App</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Click <strong>Deploy &gt; New deployment</strong>. Select type <strong>Web App</strong>. Set "Execute as" to <strong>Me</strong> and "Who has access" to <strong>Anyone</strong>. Click Deploy and copy the resulting Web App URL.
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="url" 
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={!urlInput.startsWith('https://script.google.com/')}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {saved ? <Check className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                Connect
              </button>
            </div>
            {scriptUrl && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                <Check className="w-4 h-4" /> Connected to Google Sheets API
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
