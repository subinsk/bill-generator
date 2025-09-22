import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format number to Indian currency format
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hi-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number for Hindi display
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('hi-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Convert English numbers to Hindi numerals
export function toHindiNumerals(text: string): string {
  const hindiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return text.replace(/[0-9]/g, (digit) => hindiNumerals[parseInt(digit)]);
}

// Convert Hindi numerals to English numbers
export function fromHindiNumerals(text: string): string {
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const hindiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  
  return text.replace(/[०-९]/g, (digit) => {
    const index = hindiNumerals.indexOf(digit);
    return index !== -1 ? englishNumerals[index] : digit;
  });
}

// Validate if string contains only numbers and decimals
export function isValidNumber(value: string): boolean {
  const cleanValue = fromHindiNumerals(value);
  return /^\d*\.?\d*$/.test(cleanValue) && cleanValue !== '';
}

// Parse number from Hindi input
export function parseHindiNumber(value: string): number {
  const cleanValue = fromHindiNumerals(value);
  return parseFloat(cleanValue) || 0;
}
