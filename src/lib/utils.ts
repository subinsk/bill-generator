import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format number to Indian currency format
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number for English display
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Validate if string contains only numbers and decimals
export function isValidNumber(value: string): boolean {
  return /^\d*\.?\d*$/.test(value) && value !== '';
}

// Parse number from input
export function parseNumber(value: string): number {
  return parseFloat(value) || 0;
}
