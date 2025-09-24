export interface Item {
  id: string;
  name: string; // Hindi name like "सीमेंट", "बजरी"
  rate: number; // दर
  quantity: number; // मात्रा
  allowsDecimal: boolean; // true for items like cement, false for items like mixture
  minQuantity?: number; // minimum allowed quantity for decimal items
  maxQuantity?: number; // maximum allowed quantity for decimal items
}

export interface BillItem {
  item: Item;
  quantity: number;
  amount: number;
}

export interface Bill {
  id: string;
  percentage: number; // 60, 30, or 10
  items: BillItem[];
  totalAmount: number;
}

export interface BillSet {
  originalItems: Item[];
  bills: [Bill, Bill, Bill]; // Always 3 bills: 60%, 30%, 10%
  totalAmount: number;
}

export interface DistributionResult {
  success: boolean;
  billSet?: BillSet;
  error?: string;
}

// Predefined items based on the Excel data
export const PREDEFINED_ITEMS: Omit<Item, 'id' | 'quantity'>[] = [
  {
    name: "सीमेंट",
    rate: 360,
    allowsDecimal: true,
    minQuantity: 1,
    maxQuantity: 300
  },
  {
    name: "बजरी",
    rate: 1025,
    allowsDecimal: true,
    minQuantity: 1,
    maxQuantity: 50
  },
  {
    name: "40 एमएम कंक्रीट",
    rate: 880,
    allowsDecimal: true,
    minQuantity: 1,
    maxQuantity: 20
  },
  {
    name: "20 एमएम कंक्रीट",
    rate: 1050,
    allowsDecimal: true,
    minQuantity: 1,
    maxQuantity: 25
  },
  {
    name: "मिक्चर",
    rate: 930,
    allowsDecimal: false,
    minQuantity: 1,
    maxQuantity: 1
  },
  {
    name: "वाइब्रेटर",
    rate: 770,
    allowsDecimal: false,
    minQuantity: 1,
    maxQuantity: 1
  },
  {
    name: "पानी",
    rate: 650,
    allowsDecimal: false,
    minQuantity: 1,
    maxQuantity: 10
  },
  {
    name: "स्टील पट्टी",
    rate: 1275,
    allowsDecimal: true,
    minQuantity: 1,
    maxQuantity: 30
  }
];

// GST Bill Types
export interface GSTItem {
  id: string;
  description: string;
  hsnSacCode?: string; // Optional HSN/SAC code
  quantity: number;
  unit: string; // From dropdown
  rate: number;
  cgstRate: number; // CGST percentage
  sgstRate: number; // SGST percentage
  amount: number; // quantity * rate
  cgstAmount: number; // (amount * cgstRate) / 100
  sgstAmount: number; // (amount * sgstRate) / 100
  totalAmount: number; // amount + cgstAmount + sgstAmount
}

export interface GSTBillDetails {
  companyName: string;
  companyAddress: string;
  companyGSTIN: string;
  companyPAN: string;
  invoiceNo: string;
  invoiceDate: string;
  placeOfSupply: string;
  reverseCharge: string;
  billedToName: string;
  billedToAddress: string;
  billedToGSTIN?: string;
  shippedToName: string;
  shippedToAddress: string;
  shippedToGSTIN?: string;
  bankDetails: string;
  termsConditions: string[];
}

export interface GSTTaxSummary {
  taxRate: number; // Combined rate (CGST + SGST)
  taxableAmount: number; // Total amount for this tax rate
  cgstAmount: number;
  sgstAmount: number;
  totalTaxAmount: number;
}

export interface GSTBill {
  id: string;
  billDetails: GSTBillDetails;
  items: GSTItem[];
  grandTotal: number;
  totalUnits: number;
  totalTaxableAmount: number;
  totalCGSTAmount: number;
  totalSGSTAmount: number;
  totalTaxAmount: number;
  bsrDeduction: number; // BSR -1.80% BELOW
  finalAmount: number; // After BSR deduction
  taxSummary: GSTTaxSummary[]; // Consolidated by tax rates (5%, 18%, 28%)
  amountInWords: string;
  createdAt: string;
}

// Unit options for dropdown
export const UNIT_OPTIONS = [
  'CB. MTR', // Cubic Meter
  'SQ.M', // Square Meter
  'KG', // Kilogram
  'NOS', // Numbers
  'MTR', // Meter
  'BAGS', // Bags
  'TONNES', // Tonnes
  'LITRE', // Litre
  'PCS', // Pieces
  'UNITS' // Units
];

// Common CGST/SGST rate combinations
export const TAX_RATE_OPTIONS = [
  { cgst: 0, sgst: 0, total: 0, label: '0% (No Tax)' },
  { cgst: 2.5, sgst: 2.5, total: 5, label: '5% (2.5% CGST + 2.5% SGST)' },
  { cgst: 6, sgst: 6, total: 12, label: '12% (6% CGST + 6% SGST)' },
  { cgst: 9, sgst: 9, total: 18, label: '18% (9% CGST + 9% SGST)' },
  { cgst: 14, sgst: 14, total: 28, label: '28% (14% CGST + 14% SGST)' }
];