import { Item } from '@/types';

// Test data based on the Excel screenshot provided
export const SAMPLE_ITEMS: Item[] = [
  {
    id: 'cement',
    name: 'सीमेंट',
    rate: 360,
    quantity: 196,
    allowsDecimal: true,
    minQuantity: 50,
    maxQuantity: 300
  },
  {
    id: 'gravel',
    name: 'बजरी',
    rate: 1025,
    quantity: 15.25,
    allowsDecimal: true,
    minQuantity: 5,
    maxQuantity: 30
  },
  {
    id: 'concrete40',
    name: '40 एमएम कंक्रीट',
    rate: 880,
    quantity: 4.86,
    allowsDecimal: true,
    minQuantity: 2,
    maxQuantity: 10
  },
  {
    id: 'concrete20',
    name: '20 एमएम कंक्रीट',
    rate: 1050,
    quantity: 17.06,
    allowsDecimal: true,
    minQuantity: 5,
    maxQuantity: 25
  },
  {
    id: 'mixture',
    name: 'मिक्चर',
    rate: 930,
    quantity: 1,
    allowsDecimal: false,
    minQuantity: 1,
    maxQuantity: 1
  },
  {
    id: 'vibrator',
    name: 'वाइब्रेटर',
    rate: 770,
    quantity: 1,
    allowsDecimal: false,
    minQuantity: 1,
    maxQuantity: 1
  },
  {
    id: 'water',
    name: 'पानी',
    rate: 650,
    quantity: 5,
    allowsDecimal: false,
    minQuantity: 1,
    maxQuantity: 10
  },
  {
    id: 'steel',
    name: 'स्टील पट्टी',
    rate: 1275,
    quantity: 20.54,
    allowsDecimal: true,
    minQuantity: 10,
    maxQuantity: 40
  }
];

// Expected total: ₹189,790 (as shown in the Excel)
export const EXPECTED_TOTAL = 189790;

// Calculate total from sample items
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
};

// Test function to verify distribution logic
export const testDistribution = () => {
  const total = calculateTotal(SAMPLE_ITEMS);
  console.log('Sample Data Test:');
  console.log('Items:', SAMPLE_ITEMS.length);
  console.log('Calculated Total:', total);
  console.log('Expected Total:', EXPECTED_TOTAL);
  console.log('Match:', Math.abs(total - EXPECTED_TOTAL) < 100); // Allow small rounding differences
  
  return {
    items: SAMPLE_ITEMS,
    calculatedTotal: total,
    expectedTotal: EXPECTED_TOTAL,
    matches: Math.abs(total - EXPECTED_TOTAL) < 100
  };
};
