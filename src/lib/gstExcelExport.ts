import * as XLSX from 'xlsx';
import { GSTBill } from '@/types';

export function exportGSTBillToExcel(bill: GSTBill) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create main sheet data
  const sheetData: (string | number | null)[][] = [];
  
  // Header Section with company info
  sheetData.push([]);
  sheetData.push(['', '', '', '', '', '', '', '', '', `GSTIN : ${bill.billDetails.companyGSTIN}`]);
  sheetData.push([]);
  sheetData.push(['', '', '', '', 'TAX INVOICE', '', '', '', '', '']);
  sheetData.push([]);
  sheetData.push(['', '', '', bill.billDetails.companyName, '', '', '', '', '', '']);
  sheetData.push(['', '', '', bill.billDetails.companyAddress, '', '', '', '', '', '']);
  sheetData.push(['', '', '', `PAN : ${bill.billDetails.companyPAN}`, '', '', '', '', '', '']);
  sheetData.push([]);
  
  // Invoice Details
  sheetData.push(['Invoice No.', ':', bill.billDetails.invoiceNo, '', '', 'Place of Supply', ':', bill.billDetails.placeOfSupply, '', '']);
  sheetData.push(['Dated', ':', bill.billDetails.invoiceDate, '', '', 'Reverse Charge', ':', bill.billDetails.reverseCharge, '', '']);
  sheetData.push([]);
  
  // Billing and Shipping Details
  sheetData.push(['Billed to :', '', '', '', '', 'Shipped to :', '', '', '', '']);
  sheetData.push([bill.billDetails.billedToName, '', '', '', '', bill.billDetails.shippedToName || bill.billDetails.billedToName, '', '', '', '']);
  sheetData.push([bill.billDetails.billedToAddress, '', '', '', '', bill.billDetails.shippedToAddress || bill.billDetails.billedToAddress, '', '', '', '']);
  if (bill.billDetails.billedToGSTIN || bill.billDetails.shippedToGSTIN) {
    sheetData.push([
      bill.billDetails.billedToGSTIN ? `GSTIN / UIN : ${bill.billDetails.billedToGSTIN}` : '',
      '', '', '', '',
      bill.billDetails.shippedToGSTIN ? `GSTIN / UIN : ${bill.billDetails.shippedToGSTIN}` : '',
      '', '', '', ''
    ]);
  }
  sheetData.push([]);
  
  // Items Table Header
  const headerRow = [
    'S.N',
    'Description of Goods',
    'HSN/SAC Code',
    'Qty',
    'Unit', 
    'Rate',
    'Amount',
    'CGST Rate',
    'CGST Amount',
    'SGST Rate', 
    'SGST Amount',
    'Total Amount'
  ];
  sheetData.push(headerRow);
  const headerRowIndex = sheetData.length - 1;
  
  // Items Data
  bill.items.forEach((item, index) => {
    sheetData.push([
      index + 1,
      item.description,
      item.hsnSacCode || '',
      item.quantity.toFixed(2),
      item.unit,
      item.rate.toFixed(2),
      item.amount.toFixed(2),
      `${item.cgstRate}%`,
      item.cgstAmount.toFixed(2),
      `${item.sgstRate}%`,
      item.sgstAmount.toFixed(2),
      item.totalAmount.toFixed(2)
    ]);
  });
  
  // Total row
  sheetData.push([
    '', 'Total', '', 
    bill.totalUnits.toFixed(2), '', '',
    bill.totalTaxableAmount.toFixed(2), '',
    bill.totalCGSTAmount.toFixed(2), '',
    bill.totalSGSTAmount.toFixed(2),
    bill.grandTotal.toFixed(2)
  ]);
  
  // BSR Deduction Row
  sheetData.push([
    '', '', '', '', '', 'Less : BSR -1.80 % BELOW',
    '@ O12', '1.80%', '', '',
    '',
    `-${bill.bsrDeduction.toFixed(2)}`
  ]);
  
  // Empty Row
  sheetData.push([]);
  
  // Grand Total
  sheetData.push([
    '', '', '', '', '', '', '', '', '', '', 'Grand Total',
    bill.finalAmount.toFixed(2)
  ]);
  
  sheetData.push([]);
  sheetData.push([]);
  
  // Tax Summary Section
  sheetData.push(['TAX SUMMARY', '', '', '', '', '', '', '', '', '', '', '']);
  sheetData.push(['Tax Rate', 'Taxable Amount', 'CGST Amount', 'SGST Amount', 'Total Tax', '', '', '', '', '', '', '']);
  
  bill.taxSummary.forEach(summary => {
    sheetData.push([
      `${summary.taxRate.toFixed(2)}%`,
      summary.taxableAmount.toFixed(2),
      summary.cgstAmount.toFixed(2),
      summary.sgstAmount.toFixed(2),
      summary.totalTaxAmount.toFixed(2),
      '', '', '', '', '', '', ''
    ]);
  });
  
  // Tax Summary Total
  sheetData.push([
    'TOTAL',
    bill.totalTaxableAmount.toFixed(2),
    bill.totalCGSTAmount.toFixed(2),
    bill.totalSGSTAmount.toFixed(2),
    bill.totalTaxAmount.toFixed(2),
    '', '', '', '', '', '', ''
  ]);
  
  sheetData.push([]);
  sheetData.push([]);
  
  // Amount in Words
  sheetData.push(['Amount in Words:', bill.amountInWords, '', '', '', '', '', '', '', '', '', '']);
  sheetData.push([]);
  
  // Bank Details
  sheetData.push(['Bank Details:', bill.billDetails.bankDetails, '', '', '', '', '', '', '', '', '', '']);
  sheetData.push([]);
  
  // Terms and Conditions Section
  sheetData.push(['Terms & Conditions', '', '', '', '', '', '', '', '', "Receiver's Signature", '', '']);
  bill.billDetails.termsConditions.forEach((term, index) => {
    sheetData.push([`${index + 1}. ${term}`, '', '', '', '', '', '', '', '', '', '', '']);
  });
  
  sheetData.push([]);
  sheetData.push([]);
  
  // Signatory
  sheetData.push(['', '', '', '', '', '', '', '', '', `for ${bill.billDetails.companyName}`, '', '']);
  sheetData.push(['', '', '', '', '', '', '', '', '', 'Authorised Signatory', '', '']);
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  const columnWidths = [
    { wch: 6 },  // S.N
    { wch: 30 }, // Description
    { wch: 12 }, // HSN/SAC
    { wch: 8 },  // Qty
    { wch: 10 }, // Unit
    { wch: 10 }, // Rate
    { wch: 12 }, // Amount
    { wch: 12 }, // CGST Rate
    { wch: 12 }, // CGST Amount
    { wch: 12 }, // SGST Rate
    { wch: 12 }, // SGST Amount
    { wch: 15 }  // Total Amount
  ];
  worksheet['!cols'] = columnWidths;
  
  // Define styles for professional invoice look
  const borderAll = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, size: 12 },
    fill: { fgColor: { rgb: '4472C4' } },
    border: borderAll,
    alignment: { horizontal: 'center', vertical: 'center' }
  };
  
  const titleStyle = {
    font: { bold: true, size: 16, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };
  
  const companyStyle = {
    font: { bold: true, size: 14, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };
  
  const dataStyle = {
    border: borderAll,
    alignment: { horizontal: 'center', vertical: 'center' }
  };
  
  const dataLeftStyle = {
    border: borderAll,
    alignment: { horizontal: 'left', vertical: 'center' }
  };
  
  const totalStyle = {
    font: { bold: true, color: { rgb: '000000' } },
    fill: { fgColor: { rgb: 'E7E6E6' } },
    border: borderAll,
    alignment: { horizontal: 'center', vertical: 'center' }
  };
  
  // Apply styling to specific cells
  
  // Style TAX INVOICE header
  const taxInvoiceCell = XLSX.utils.encode_cell({ r: 3, c: 4 });
  if (worksheet[taxInvoiceCell]) {
    worksheet[taxInvoiceCell].s = titleStyle;
  }
  
  // Style company name
  const companyNameCell = XLSX.utils.encode_cell({ r: 5, c: 3 });
  if (worksheet[companyNameCell]) {
    worksheet[companyNameCell].s = companyStyle;
  }
  
  // Apply header styling to table headers
  headerRow.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
    if (!worksheet[cellAddress]) {
      worksheet[cellAddress] = { v: headerRow[colIndex], t: 's' };
    }
    worksheet[cellAddress].s = headerStyle;
  });
  
  // Apply styling to data rows
  for (let rowIndex = 0; rowIndex < bill.items.length; rowIndex++) {
    const actualRowIndex = headerRowIndex + 1 + rowIndex;
    for (let colIndex = 0; colIndex < 12; colIndex++) {
      const cellAddress = XLSX.utils.encode_cell({ r: actualRowIndex, c: colIndex });
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: '', t: 's' };
      }
      // Description column gets left alignment
      worksheet[cellAddress].s = colIndex === 1 ? dataLeftStyle : dataStyle;
    }
  }
  
  // Style totals row
  const totalRowIndex = headerRowIndex + 1 + bill.items.length;
  for (let colIndex = 0; colIndex < 12; colIndex++) {
    const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: colIndex });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = totalStyle;
    }
  }
  
  // Style BSR deduction row
  const bsrRowIndex = totalRowIndex + 1;
  for (let colIndex = 0; colIndex < 12; colIndex++) {
    const cellAddress = XLSX.utils.encode_cell({ r: bsrRowIndex, c: colIndex });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = dataStyle;
    }
  }
  
  // Style grand total row
  const grandTotalRowIndex = bsrRowIndex + 2;
  for (let colIndex = 10; colIndex < 12; colIndex++) {
    const cellAddress = XLSX.utils.encode_cell({ r: grandTotalRowIndex, c: colIndex });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true, size: 14, color: { rgb: '000000' } },
        fill: { fgColor: { rgb: 'FFD700' } },
        border: borderAll,
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }
  
  // Merge cells for headers
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  
  // Merge TAX INVOICE header
  worksheet['!merges'].push({
    s: { r: 3, c: 3 },
    e: { r: 3, c: 8 }
  });
  
  // Merge company name
  worksheet['!merges'].push({
    s: { r: 5, c: 3 },
    e: { r: 5, c: 8 }
  });
  
  // Merge company address
  worksheet['!merges'].push({
    s: { r: 6, c: 3 },
    e: { r: 6, c: 8 }
  });
  
  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'GST Invoice');
  
  // Generate filename
  const filename = `GST_Invoice_${bill.billDetails.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}_${bill.billDetails.billedToName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  
  // Save the file
  XLSX.writeFile(workbook, filename);
}

// Export GST bill data as JSON for backup
export function exportGSTBillAsJSON(bill: GSTBill) {
  const jsonData = JSON.stringify(bill, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GST_Bill_${bill.billDetails.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
