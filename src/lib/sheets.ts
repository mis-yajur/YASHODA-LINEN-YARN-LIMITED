import { getAccessToken } from './auth';

const GATE_ENTRIES_SPREADSHEET_ID_KEY = 'gate_entries_spreadsheet_id';

export const getOrCreateSpreadsheet = async (): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const existingId = localStorage.getItem(GATE_ENTRIES_SPREADSHEET_ID_KEY);
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
        title: 'Yashoda Linen Gate Entries'
      },
      sheets: [
        {
          properties: {
            title: 'Entries'
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to create spreadsheet: ${JSON.stringify(errorData)}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  localStorage.setItem(GATE_ENTRIES_SPREADSHEET_ID_KEY, spreadsheetId);

  // Initialize headers
  await appendRow(spreadsheetId, [
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

  return spreadsheetId;
};

export const appendRow = async (spreadsheetId: string, values: string[]) => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Entries!A:K:append?valueInputOption=USER_ENTERED`, {
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

export const getSpreadsheetLink = () => {
  const existingId = localStorage.getItem(GATE_ENTRIES_SPREADSHEET_ID_KEY);
  if (existingId) {
    return `https://docs.google.com/spreadsheets/d/${existingId}/edit`;
  }
  return null;
};
