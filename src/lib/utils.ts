import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return crypto.randomUUID();
}

export function convertUnitQuantity(qty: number, fromUnit?: string, toUnit?: string): number {
  if (!qty || isNaN(qty)) return 0;
  if (!fromUnit || !toUnit) return qty;

  const cleanFrom = fromUnit.trim().toUpperCase().replace(/[^A-Z]/g, '');
  const cleanTo = toUnit.trim().toUpperCase().replace(/[^A-Z]/g, '');

  if (cleanFrom === cleanTo || !cleanFrom || !cleanTo) return qty;

  // Mass conversion factors to KGS
  const toKgsMap: Record<string, number> = {
    'KG': 1,
    'KGS': 1,
    'KILOGRAM': 1,
    'KILOGRAMS': 1,
    'TON': 1000,
    'TONS': 1000,
    'MT': 1000,
    'TONNE': 1000,
    'TONNES': 1000,
    'QUINTAL': 100,
    'QUINTALS': 100,
    'G': 0.001,
    'GRAM': 0.001,
    'GRAMS': 0.001,
    'LB': 0.453592,
    'LBS': 0.453592
  };

  // Length conversion factors to METERS
  const toMetersMap: Record<string, number> = {
    'MTR': 1,
    'MTRS': 1,
    'METER': 1,
    'METERS': 1,
    'M': 1,
    'KM': 1000,
    'CM': 0.01,
    'MM': 0.001
  };

  if (toKgsMap[cleanFrom] !== undefined && toKgsMap[cleanTo] !== undefined) {
    const qtyInKgs = qty * toKgsMap[cleanFrom];
    return qtyInKgs / toKgsMap[cleanTo];
  }

  if (toMetersMap[cleanFrom] !== undefined && toMetersMap[cleanTo] !== undefined) {
    const qtyInMeters = qty * toMetersMap[cleanFrom];
    return qtyInMeters / toMetersMap[cleanTo];
  }

  return qty;
}
