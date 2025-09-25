import { GSTItem, GSTTaxSummary } from '@/types';

// Calculate individual item amounts
export function calculateItemAmounts(
  quantity: number,
  rate: number,
  cgstRate: number,
  sgstRate: number
): Pick<GSTItem, 'amount' | 'cgstAmount' | 'sgstAmount' | 'totalAmount'> {
  const amount = quantity * rate;
  const cgstAmount = (amount * cgstRate) / 100;
  const sgstAmount = (amount * sgstRate) / 100;
  const totalAmount = amount + cgstAmount + sgstAmount;

  return {
    amount: parseFloat(amount.toFixed(2)),
    cgstAmount: parseFloat(cgstAmount.toFixed(2)),
    sgstAmount: parseFloat(sgstAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
}

// Calculate GST bill totals
export function calculateGSTBillTotals(items: GSTItem[]): {
  grandTotal: number;
  totalUnits: number;
  totalTaxableAmount: number;
  totalCGSTAmount: number;
  totalSGSTAmount: number;
  totalTaxAmount: number;
  bsrDeduction: number;
  finalAmount: number;
} {
  const grandTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalTaxableAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalCGSTAmount = items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGSTAmount = items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalTaxAmount = totalCGSTAmount + totalSGSTAmount;
  
  // BSR deduction of 1.80% on total taxable amount (as seen in Excel)
  const bsrDeduction = (totalTaxableAmount * 1.80) / 100;
  const finalAmount = grandTotal - bsrDeduction;

  return {
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    totalUnits: parseFloat(totalUnits.toFixed(2)),
    totalTaxableAmount: parseFloat(totalTaxableAmount.toFixed(2)),
    totalCGSTAmount: parseFloat(totalCGSTAmount.toFixed(2)),
    totalSGSTAmount: parseFloat(totalSGSTAmount.toFixed(2)),
    totalTaxAmount: parseFloat(totalTaxAmount.toFixed(2)),
    bsrDeduction: parseFloat(bsrDeduction.toFixed(2)),
    finalAmount: parseFloat(finalAmount.toFixed(2))
  };
}

// Create tax rate summary (consolidation by tax rates like 5%, 18%, 28%)
export function createTaxSummary(items: GSTItem[]): GSTTaxSummary[] {
  const summaryMap = new Map<number, GSTTaxSummary>();

  items.forEach(item => {
    const combinedTaxRate = item.cgstRate + item.sgstRate;
    
    if (summaryMap.has(combinedTaxRate)) {
      const existing = summaryMap.get(combinedTaxRate)!;
      existing.taxableAmount += item.amount;
      existing.cgstAmount += item.cgstAmount;
      existing.sgstAmount += item.sgstAmount;
      existing.totalTaxAmount += (item.cgstAmount + item.sgstAmount);
    } else {
      summaryMap.set(combinedTaxRate, {
        taxRate: combinedTaxRate,
        taxableAmount: item.amount,
        cgstAmount: item.cgstAmount,
        sgstAmount: item.sgstAmount,
        totalTaxAmount: item.cgstAmount + item.sgstAmount
      });
    }
  });

  // Convert to array and round values
  return Array.from(summaryMap.values())
    .map(summary => ({
      ...summary,
      taxableAmount: parseFloat(summary.taxableAmount.toFixed(2)),
      cgstAmount: parseFloat(summary.cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(summary.sgstAmount.toFixed(2)),
      totalTaxAmount: parseFloat(summary.totalTaxAmount.toFixed(2))
    }))
    .sort((a, b) => a.taxRate - b.taxRate);
}

// Convert number to words (Indian format)
export function numberToWords(amount: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertHundreds(num: number): string {
    let result = '';
    let remaining = num;
    
    if (remaining >= 100) {
      result += ones[Math.floor(remaining / 100)] + ' Hundred ';
      remaining %= 100;
    }
    
    if (remaining >= 20) {
      result += tens[Math.floor(remaining / 10)] + ' ';
      remaining %= 10;
    }
    
    if (remaining > 0) {
      result += ones[remaining] + ' ';
    }
    
    return result;
  }

  if (amount === 0) return 'Zero Only';

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - Math.floor(amount)) * 100);

  let result = '';

  if (integerPart >= 10000000) { // Crore
    result += convertHundreds(Math.floor(integerPart / 10000000)) + 'Crore ';
    integerPart %= 10000000;
  }

  if (integerPart >= 100000) { // Lakh
    result += convertHundreds(Math.floor(integerPart / 100000)) + 'Lakh ';
    integerPart %= 100000;
  }

  if (integerPart >= 1000) { // Thousand
    result += convertHundreds(Math.floor(integerPart / 1000)) + 'Thousand ';
    integerPart %= 1000;
  }

  if (integerPart > 0) {
    result += convertHundreds(integerPart);
  }

  result = result.trim();
  
  if (decimalPart > 0) {
    result += ' and ' + convertHundreds(decimalPart) + 'Paise ';
  }

  return result.trim() + ' Only';
}

// Validate GST number format
export function validateGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

// Validate PAN format
export function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

// Generate invoice number
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const time = now.getTime().toString().slice(-4);
  
  return `${year}-${month}/${day}${time}`;
}

// Format date for display
export function formatDateForBill(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}
