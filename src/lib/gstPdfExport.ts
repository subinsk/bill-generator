import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GSTBill } from '@/types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportGSTBillToPDF(bill: GSTBill) {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set fonts
  doc.setFont('helvetica');
  
  // Company Header Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 105, 20, { align: 'center' });
  
  // Company Details
  doc.setFontSize(14);
  doc.text(bill.billDetails.companyName, 105, 35, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.billDetails.companyAddress, 105, 45, { align: 'center' });
  doc.text(`PAN: ${bill.billDetails.companyPAN}`, 105, 52, { align: 'center' });
  
  // GSTIN in top right
  doc.setFontSize(10);
  doc.text(`GSTIN: ${bill.billDetails.companyGSTIN}`, 200, 15, { align: 'right' });
  
  // Invoice Details Section
  let yPos = 65;
  
  // Left side - Invoice details
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.billDetails.invoiceNo, 50, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Dated:', 15, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.billDetails.invoiceDate, 35, yPos + 7);
  
  // Right side - Place of supply
  doc.setFont('helvetica', 'bold');
  doc.text('Place of Supply:', 120, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.billDetails.placeOfSupply, 170, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Reverse Charge:', 120, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.billDetails.reverseCharge, 170, yPos + 7);
  
  yPos += 20;
  
  // Billing and Shipping Details
  doc.setFont('helvetica', 'bold');
  doc.text('Billed to:', 15, yPos);
  doc.text('Shipped to:', 120, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  
  // Split long addresses into multiple lines
  const billedLines = doc.splitTextToSize(bill.billDetails.billedToName + '\n' + bill.billDetails.billedToAddress, 90);
  const shippedLines = doc.splitTextToSize(
    (bill.billDetails.shippedToName || bill.billDetails.billedToName) + '\n' + 
    (bill.billDetails.shippedToAddress || bill.billDetails.billedToAddress), 
    90
  );
  
  doc.text(billedLines, 15, yPos);
  doc.text(shippedLines, 120, yPos);
  
  yPos = Math.max(yPos + (billedLines.length * 5), yPos + (shippedLines.length * 5)) + 10;
  
  // Add GSTIN if available
  if (bill.billDetails.billedToGSTIN) {
    doc.text(`GSTIN: ${bill.billDetails.billedToGSTIN}`, 15, yPos);
  }
  if (bill.billDetails.shippedToGSTIN) {
    doc.text(`GSTIN: ${bill.billDetails.shippedToGSTIN}`, 120, yPos);
  }
  
  yPos += 15;
  
  // Items Table
  const tableData = bill.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.hsnSacCode || '',
    item.quantity.toFixed(2),
    item.unit,
    item.rate.toFixed(2),
    item.amount.toFixed(2),
    `${item.cgstRate.toFixed(2)}%`,
    item.cgstAmount.toFixed(2),
    `${item.sgstRate.toFixed(2)}%`,
    item.sgstAmount.toFixed(2),
    item.totalAmount.toFixed(2)
  ]);
  
  // Add totals row
  tableData.push([
    '', 'Total', '', 
    bill.totalUnits.toFixed(2), '', '',
    bill.totalTaxableAmount.toFixed(2), '',
    bill.totalCGSTAmount.toFixed(2), '',
    bill.totalSGSTAmount.toFixed(2),
    bill.grandTotal.toFixed(2)
  ]);
  
  // Add BSR deduction row
  tableData.push([
    '', '', '', '', '', 'Less: BSR -1.80% BELOW',
    '@ O12', '1.80%', '', '',
    '',
    `-${bill.bsrDeduction.toFixed(2)}`
  ]);
  
  // Add empty row
  tableData.push(Array(12).fill(''));
  
  // Add grand total row
  tableData.push([
    '', '', '', '', '', '', '', '', '', '', 'Grand Total',
    bill.finalAmount.toFixed(2)
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [[
      'S.N', 'Description of Goods', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 
      'Amount', 'CGST Rate', 'CGST Amt', 'SGST Rate', 'SGST Amt', 'Total Amount'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [68, 114, 196], // Blue header
      textColor: 255, // White text
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // S.N
      1: { cellWidth: 35, halign: 'left' },   // Description
      2: { cellWidth: 15, halign: 'center' }, // HSN/SAC
      3: { cellWidth: 12, halign: 'right' },  // Qty
      4: { cellWidth: 12, halign: 'center' }, // Unit
      5: { cellWidth: 15, halign: 'right' },  // Rate
      6: { cellWidth: 18, halign: 'right' },  // Amount
      7: { cellWidth: 15, halign: 'center' }, // CGST Rate
      8: { cellWidth: 18, halign: 'right' },  // CGST Amount
      9: { cellWidth: 15, halign: 'center' }, // SGST Rate
      10: { cellWidth: 18, halign: 'right' }, // SGST Amount
      11: { cellWidth: 22, halign: 'right' }  // Total Amount
    },
    didParseCell: function(data: any) {
      // Style total rows
      if (data.row.index >= bill.items.length && data.row.index < bill.items.length + 2) {
        data.cell.styles.fillColor = [231, 230, 230]; // Light gray for totals
        data.cell.styles.fontStyle = 'bold';
      }
      // Style grand total row
      if (data.row.index === bill.items.length + 3) {
        data.cell.styles.fillColor = [255, 215, 0]; // Gold for grand total
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 10;
      }
    }
  });
  
  // Get position after table
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Tax Summary Section
  if (bill.taxSummary.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TAX SUMMARY', 15, finalY);
    
    const taxSummaryData = bill.taxSummary.map(summary => [
      `${summary.taxRate.toFixed(2)}%`,
      summary.taxableAmount.toFixed(2),
      summary.cgstAmount.toFixed(2),
      summary.sgstAmount.toFixed(2),
      summary.totalTaxAmount.toFixed(2)
    ]);
    
    // Add total row to tax summary
    taxSummaryData.push([
      'TOTAL',
      bill.totalTaxableAmount.toFixed(2),
      bill.totalCGSTAmount.toFixed(2),
      bill.totalSGSTAmount.toFixed(2),
      bill.totalTaxAmount.toFixed(2)
    ]);
    
    doc.autoTable({
      startY: finalY + 5,
      head: [['Tax Rate', 'Taxable Amount', 'CGST Amount', 'SGST Amount', 'Total Tax']],
      body: taxSummaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [68, 114, 196],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center' },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      },
      didParseCell: function(data: any) {
        // Style total row
        if (data.row.index === taxSummaryData.length - 1) {
          data.cell.styles.fillColor = [231, 230, 230];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
  }
  
  // Amount in Words
  const amountWordsY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Amount in Words:', 15, amountWordsY);
  doc.setFont('helvetica', 'normal');
  const amountWordsLines = doc.splitTextToSize(bill.amountInWords, 180);
  doc.text(amountWordsLines, 15, amountWordsY + 7);
  
  // Bank Details
  const bankDetailsY = amountWordsY + (amountWordsLines.length * 5) + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details:', 15, bankDetailsY);
  doc.setFont('helvetica', 'normal');
  const bankLines = doc.splitTextToSize(bill.billDetails.bankDetails, 180);
  doc.text(bankLines, 15, bankDetailsY + 7);
  
  // Terms & Conditions and Signature
  const termsY = bankDetailsY + (bankLines.length * 5) + 15;
  
  // Left side - Terms & Conditions
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', 15, termsY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let currentY = termsY + 7;
  bill.billDetails.termsConditions.forEach((term, index) => {
    doc.text(`${index + 1}. ${term}`, 15, currentY);
    currentY += 5;
  });
  
  // Right side - Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Receiver's Signature", 120, termsY);
  
  // Company signature
  const signatureY = Math.max(currentY + 10, termsY + 30);
  doc.text(`for ${bill.billDetails.companyName}`, 120, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', 120, signatureY + 7);
  
  // Generate filename and save
  const filename = `GST_Invoice_${bill.billDetails.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}_${bill.billDetails.billedToName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
