// Simple test script to test PDF export
const { testPdfExportWithImage } = require('./src/lib/testPdfExport.ts');

// Mock GST bill data for testing
const mockBill = {
  billDetails: {
    invoiceNo: 'TEST-001',
    companyName: 'ASHAPURA CONSTRUCTIONS',
    companyAddress: 'HANUMAN SHALA SCHOOL KE SAMNE, AHORE',
    companyPAN: 'CBWPM6776L',
    companyGSTIN: '08CBWPM6776L',
    billedToName: 'Test Customer',
    billedToAddress: 'Test Address',
    billedToGSTIN: 'TEST123456789',
    placeOfSupply: 'Rajasthan (08)',
    reverseCharge: 'N',
    shippedTo: 'Test Shipping Address',
    bankDetails: 'RMGB CA AC NO. 8306041866 RMGB0000103 RMGB AHORE'
  },
  items: [
    {
      description: 'cement',
      hsnSacCode: 'asdf23',
      quantity: 1.00,
      unit: 'CB. MTR',
      rate: 23.00,
      cgstRate: 4.50,
      sgstRate: 4.50,
      taxableAmount: 23.00,
      cgstAmount: 1.03,
      sgstAmount: 1.03,
      totalAmount: 25.06
    },
    {
      description: 'bajri',
      hsnSacCode: 'asdfl',
      quantity: 34.50,
      unit: 'CB. MTR',
      rate: 56.22,
      cgstRate: 9.00,
      sgstRate: 9.00,
      taxableAmount: 1939.59,
      cgstAmount: 174.56,
      sgstAmount: 174.56,
      totalAmount: 2288.71
    }
  ],
  totals: {
    totalQuantity: 35.50,
    totalTaxableAmount: 1962.59,
    totalCGSTAmount: 175.59,
    totalSGSTAmount: 175.59,
    totalTaxAmount: 351.18,
    bsrDeduction: 35.33,
    finalAmount: 2278.46
  },
  taxSummary: [
    {
      taxRate: 9.00,
      taxableAmount: 23.00,
      cgstAmount: 1.03,
      sgstAmount: 1.03,
      totalTaxAmount: 2.06
    },
    {
      taxRate: 18.00,
      taxableAmount: 1939.59,
      cgstAmount: 174.56,
      sgstAmount: 174.56,
      totalTaxAmount: 349.12
    }
  ]
};

console.log('🧪 Starting PDF export test...');
console.log('📊 Mock bill data:', JSON.stringify(mockBill, null, 2));

// This would need to be run in a browser environment
// testPdfExportWithImage(mockBill);
