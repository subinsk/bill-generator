import * as XLSX from 'xlsx';
import { GSTBill } from '@/types';

export function exportGSTBillToExcel(bill: GSTBill) {
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Create a worksheet from scratch with professional styling
  const worksheet: XLSX.WorkSheet = {};
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },   // A - S.N
    { wch: 25 },  // B - Description  
    { wch: 12 },  // C - HSN/SAC
    { wch: 8 },   // D - Qty
    { wch: 8 },   // E - Unit
    { wch: 10 },  // F - Rate
    { wch: 12 },  // G - Amount
    { wch: 10 },  // H - CGST Rate
    { wch: 12 },  // I - CGST Amount
    { wch: 10 },  // J - SGST Rate
    { wch: 12 },  // K - SGST Amount
    { wch: 15 }   // L - Total Amount
  ];

  // Define professional styles
  const styles = {
    // Main title style - Large, Bold, Center
    title: {
      font: { bold: true, size: 20, color: { rgb: '000080' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'E6F3FF' } },
      border: {
        top: { style: 'thick', color: { rgb: '000080' } },
        bottom: { style: 'thick', color: { rgb: '000080' } },
        left: { style: 'thick', color: { rgb: '000080' } },
        right: { style: 'thick', color: { rgb: '000080' } }
      }
    },
    
    // Company name style
    companyName: {
      font: { bold: true, size: 16, color: { rgb: '000080' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'F0F8FF' } }
    },
    
    // Section headers
    sectionHeader: {
      font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    },
    
    // Table headers
    tableHeader: {
      font: { bold: true, size: 11, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '365F91' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    },
    
    // Data cells
    dataCell: {
      font: { size: 10 },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      },
      alignment: { vertical: 'center' }
    },
    
    // Total rows
    totalRow: {
      font: { bold: true, size: 11, color: { rgb: '000000' } },
      fill: { fgColor: { rgb: 'FFFF99' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    
    // Grand total
    grandTotal: {
      font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'FF6600' } },
      border: {
        top: { style: 'thick' },
        bottom: { style: 'thick' },
        left: { style: 'thick' },
        right: { style: 'thick' }
      },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  };

  // Helper function to set cell value and style
  const setCell = (address: string, value: any, style?: any) => {
    worksheet[address] = { 
      v: value, 
      t: typeof value === 'number' ? 'n' : 's',
      s: style 
    };
  };

  let currentRow = 1;

  // GSTIN in top right corner
  setCell('K1', `GSTIN: ${bill.billDetails.companyGSTIN}`, {
    font: { bold: true, size: 11, color: { rgb: '000080' } },
    alignment: { horizontal: 'right' }
  });

  currentRow = 3;

  // TAX INVOICE title - merge across columns and style
  setCell('A3', 'TAX INVOICE', styles.title);
  worksheet['!merges'] = [
    { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } } // Merge A3 to L3
  ];

  currentRow = 5;

  // Company details
  setCell('A5', bill.billDetails.companyName, styles.companyName);
  worksheet['!merges'].push({ s: { r: 4, c: 0 }, e: { r: 4, c: 11 } });

  setCell('A6', bill.billDetails.companyAddress, {
    font: { size: 11 },
    alignment: { horizontal: 'center' }
  });
  worksheet['!merges'].push({ s: { r: 5, c: 0 }, e: { r: 5, c: 11 } });

  setCell('A7', `PAN: ${bill.billDetails.companyPAN}`, {
    font: { size: 11 },
    alignment: { horizontal: 'center' }
  });
  worksheet['!merges'].push({ s: { r: 6, c: 0 }, e: { r: 6, c: 11 } });

  currentRow = 9;

  // Invoice details section
  setCell('A9', 'Invoice No:', { font: { bold: true } });
  setCell('B9', bill.billDetails.invoiceNo);
  setCell('G9', 'Place of Supply:', { font: { bold: true } });
  setCell('H9', bill.billDetails.placeOfSupply);

  setCell('A10', 'Dated:', { font: { bold: true } });
  setCell('B10', bill.billDetails.invoiceDate);
  setCell('G10', 'Reverse Charge:', { font: { bold: true } });
  setCell('H10', bill.billDetails.reverseCharge);

  currentRow = 12;

  // Billing and shipping details
  setCell('A12', 'Billed to:', { font: { bold: true, color: { rgb: '000080' } } });
  setCell('G12', 'Shipped to:', { font: { bold: true, color: { rgb: '000080' } } });

  setCell('A13', bill.billDetails.billedToName);
  setCell('G13', bill.billDetails.shippedToName || bill.billDetails.billedToName);

  setCell('A14', bill.billDetails.billedToAddress);
  setCell('G14', bill.billDetails.shippedToAddress || bill.billDetails.billedToAddress);

  if (bill.billDetails.billedToGSTIN) {
    setCell('A15', `GSTIN: ${bill.billDetails.billedToGSTIN}`);
  }
  if (bill.billDetails.shippedToGSTIN) {
    setCell('G15', `GSTIN: ${bill.billDetails.shippedToGSTIN}`);
  }

  currentRow = 17;

  // Items table header
  const headers = [
    'S.N', 'Description of Goods', 'HSN/SAC', 'Qty', 'Unit', 'Rate',
    'Amount', 'CGST Rate', 'CGST Amt', 'SGST Rate', 'SGST Amt', 'Total Amount'
  ];

  headers.forEach((header, index) => {
    const colLetter = String.fromCharCode(65 + index); // A, B, C, etc.
    setCell(`${colLetter}${currentRow}`, header, styles.tableHeader);
  });

  currentRow++;

  // Items data
  bill.items.forEach((item, index) => {
    const itemData = [
      index + 1,
      item.description,
      item.hsnSacCode || '',
      parseFloat(item.quantity.toFixed(2)),
      item.unit,
      parseFloat(item.rate.toFixed(2)),
      parseFloat(item.amount.toFixed(2)),
      `${item.cgstRate.toFixed(1)}%`,
      parseFloat(item.cgstAmount.toFixed(2)),
      `${item.sgstRate.toFixed(1)}%`,
      parseFloat(item.sgstAmount.toFixed(2)),
      parseFloat(item.totalAmount.toFixed(2))
    ];

    itemData.forEach((value, colIndex) => {
      const colLetter = String.fromCharCode(65 + colIndex);
      const cellStyle = { ...styles.dataCell };
      
      // Right align numbers, center align others
      if (typeof value === 'number' && colIndex > 0) {
        cellStyle.alignment = { vertical: 'center', horizontal: 'right' } as any;
      } else if (colIndex === 0 || colIndex === 4 || colIndex === 7 || colIndex === 9) {
        cellStyle.alignment = { vertical: 'center', horizontal: 'center' } as any;
      } else {
        cellStyle.alignment = { vertical: 'center', horizontal: 'left' } as any;
      }
      
      setCell(`${colLetter}${currentRow}`, value, cellStyle);
    });
    currentRow++;
  });

  // Total row
  const totalData = [
    '', 'TOTAL', '', 
    parseFloat(bill.totalUnits.toFixed(2)), '', '',
    parseFloat(bill.totalTaxableAmount.toFixed(2)), '',
    parseFloat(bill.totalCGSTAmount.toFixed(2)), '',
    parseFloat(bill.totalSGSTAmount.toFixed(2)),
    parseFloat(bill.grandTotal.toFixed(2))
  ];

  totalData.forEach((value, colIndex) => {
    const colLetter = String.fromCharCode(65 + colIndex);
    if (value !== '') {
      setCell(`${colLetter}${currentRow}`, value, styles.totalRow);
    }
  });
  currentRow++;

  // BSR Deduction
  setCell('F' + currentRow, 'Less: BSR -1.80% BELOW', styles.dataCell);
  setCell('G' + currentRow, '@ O12', styles.dataCell);
  setCell('H' + currentRow, '1.80%', styles.dataCell);
  setCell('L' + currentRow, parseFloat(bill.bsrDeduction.toFixed(2)), {
    ...styles.dataCell,
    alignment: { horizontal: 'right', vertical: 'center' }
  });
  currentRow += 2;

  // Grand Total
  setCell('K' + currentRow, 'Grand Total', styles.grandTotal);
  setCell('L' + currentRow, parseFloat(bill.finalAmount.toFixed(2)), styles.grandTotal);
  currentRow += 3;

  // Tax Summary
  setCell('A' + currentRow, 'TAX SUMMARY', {
    font: { bold: true, size: 14, color: { rgb: '000080' } },
    fill: { fgColor: { rgb: 'E6F3FF' } }
  });
  worksheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 4 } });
  currentRow++;

  const taxHeaders = ['Tax Rate', 'Taxable Amount', 'CGST Amount', 'SGST Amount', 'Total Tax'];
  taxHeaders.forEach((header, index) => {
    const colLetter = String.fromCharCode(65 + index);
    setCell(`${colLetter}${currentRow}`, header, styles.sectionHeader);
  });
  currentRow++;

  bill.taxSummary.forEach(summary => {
    const taxData = [
      `${summary.taxRate.toFixed(1)}%`,
      parseFloat(summary.taxableAmount.toFixed(2)),
      parseFloat(summary.cgstAmount.toFixed(2)),
      parseFloat(summary.sgstAmount.toFixed(2)),
      parseFloat(summary.totalTaxAmount.toFixed(2))
    ];

    taxData.forEach((value, colIndex) => {
      const colLetter = String.fromCharCode(65 + colIndex);
      setCell(`${colLetter}${currentRow}`, value, {
        ...styles.dataCell,
        alignment: { horizontal: colIndex === 0 ? 'center' : 'right', vertical: 'center' }
      });
    });
    currentRow++;
  });

  // Tax total
  const taxTotalData = [
    'TOTAL',
    parseFloat(bill.totalTaxableAmount.toFixed(2)),
    parseFloat(bill.totalCGSTAmount.toFixed(2)),
    parseFloat(bill.totalSGSTAmount.toFixed(2)),
    parseFloat(bill.totalTaxAmount.toFixed(2))
  ];

  taxTotalData.forEach((value, colIndex) => {
    const colLetter = String.fromCharCode(65 + colIndex);
    setCell(`${colLetter}${currentRow}`, value, styles.totalRow);
  });
  currentRow += 3;

  // Amount in words
  setCell('A' + currentRow, 'Amount in Words:', { font: { bold: true, size: 12 } });
  currentRow++;
  setCell('A' + currentRow, bill.amountInWords, { font: { italic: true, size: 11 } });
  worksheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 11 } });
  currentRow += 2;

  // Bank details
  setCell('A' + currentRow, 'Bank Details:', { font: { bold: true, size: 12 } });
  currentRow++;
  setCell('A' + currentRow, bill.billDetails.bankDetails, { font: { size: 11 } });
  worksheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 11 } });
  currentRow += 2;

  // Terms and signature
  setCell('A' + currentRow, 'Terms & Conditions', { font: { bold: true, size: 12 } });
  setCell('I' + currentRow, "Receiver's Signature", { font: { bold: true, size: 12 } });
  currentRow++;

  bill.billDetails.termsConditions.forEach((term, index) => {
    setCell('A' + currentRow, `${index + 1}. ${term}`, { font: { size: 10 } });
    currentRow++;
  });

  currentRow += 2;
  setCell('I' + currentRow, `for ${bill.billDetails.companyName}`, { font: { bold: true, size: 11 } });
  currentRow++;
  setCell('I' + currentRow, 'Authorised Signatory', { font: { size: 11 } });

  // Set row heights for better appearance
  worksheet['!rows'] = [
    { hpt: 20 }, // Row 1
    { hpt: 15 }, // Row 2
    { hpt: 25 }, // Row 3 - Title
    { hpt: 15 }, // Row 4
    { hpt: 20 }, // Row 5 - Company name
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'GST Invoice');

  // Generate filename and save
  const filename = `GST_Invoice_${bill.billDetails.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
