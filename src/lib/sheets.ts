import { getAccessToken } from './auth';

const INVENTORY_SPREADSHEET_ID_KEY = 'yashoda_inventory_spreadsheet_id';

export const getOrCreateSpreadsheet = async (): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const existingId = localStorage.getItem(INVENTORY_SPREADSHEET_ID_KEY);
  if (existingId) return existingId;

  // Create a new spreadsheet
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Yashoda Linen ERP Data'
      },
      sheets: [
        { properties: { title: 'GateEntries' } },
        { properties: { title: 'Items' } },
        { properties: { title: 'Departments' } },
        { properties: { title: 'Warehouses' } },
        { properties: { title: 'Suppliers' } },
        { properties: { title: 'Stock' } },
        { properties: { title: 'MaterialIssues' } }
      ]
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to create spreadsheet: ${JSON.stringify(errorData)}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  localStorage.setItem(INVENTORY_SPREADSHEET_ID_KEY, spreadsheetId);

  // Initialize headers for Gate Entries
  await appendRow(spreadsheetId, 'GateEntries', [
    'SL. No',
    'Date',
    'Vehicle No.',
    'Party Name',
    'Material Description',
    'Quantity & Weight',
    'In Time',
    'Out Time',
    'Invoice No. / Value',
    'Driver Licence No.',
    'Contact No.'
  ]);

  // Optionally initialize headers for other sheets here...

  return spreadsheetId;
};

export const appendRow = async (spreadsheetId: string, sheetName: string, values: string[]) => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [values]
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to append row: ${JSON.stringify(errorData)}`);
  }
};

export const fetchRows = async (spreadsheetId: string, sheetName: string): Promise<string[][]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to fetch rows: ${JSON.stringify(errorData)}`);
  }

  const data = await res.json();
  return data.values || [];
};

export const getSpreadsheetLink = () => {
  const existingId = localStorage.getItem(INVENTORY_SPREADSHEET_ID_KEY);
  if (existingId) {
    return `https://docs.google.com/spreadsheets/d/${existingId}/edit`;
  }
  return null;
};
