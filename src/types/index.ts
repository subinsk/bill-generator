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
