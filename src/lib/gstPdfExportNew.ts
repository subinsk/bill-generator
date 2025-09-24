import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GSTBill } from '@/types';

export function exportGSTBillToPDF(bill: GSTBill) {
  // Create A4 PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const primaryBlue: [number, number, number] = [68, 114, 196];
  const lightBlue: [number, number, number] = [230, 243, 255];
  const darkBlue: [number, number, number] = [54, 95, 145];
  const orange: [number, number, number] = [255, 102, 0];
  const lightGray: [number, number, number] = [245, 245, 245];
  
  // Set document properties
  doc.setProperties({
    title: `GST Invoice ${bill.billDetails.invoiceNo}`,
    subject: 'GST Tax Invoice',
    author: bill.billDetails.companyName,
    keywords: 'GST, Invoice, Tax',
    creator: 'GST Bill Generator'
  });

  let yPos = 20;

  // === HEADER SECTION ===
  
  // Top border
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // GSTIN in top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(68, 114, 196);
  doc.text(`GSTIN: ${bill.billDetails.companyGSTIN}`, pageWidth - 15, 15, { align: 'right' });
  
  yPos = 25;
  
  // TAX INVOICE title with background
  doc.setFillColor(...lightBlue);
  doc.rect(15, yPos - 5, pageWidth - 30, 15, 'F');
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos - 5, pageWidth - 30, 15, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...darkBlue);
  doc.text('TAX INVOICE', pageWidth / 2, yPos + 5, { align: 'center' });
  
  yPos += 20;
  
  // Company details with styled background
  doc.setFillColor(248, 249, 250);
  doc.rect(15, yPos, pageWidth - 30, 25, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos, pageWidth - 30, 25, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(bill.billDetails.companyName, pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(bill.billDetails.companyAddress, pageWidth / 2, yPos + 15, { align: 'center' });
  doc.text(`PAN: ${bill.billDetails.companyPAN}`, pageWidth / 2, yPos + 21, { align: 'center' });
  
  yPos += 35;
  
  // === INVOICE DETAILS SECTION ===
  
  doc.setFillColor(...primaryBlue);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE DETAILS', 20, yPos + 5);
  
  yPos += 15;
  
  // Invoice details in two columns
  const leftCol = 20;
  const rightCol = pageWidth / 2 + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Left column
  doc.text('Invoice No:', leftCol, yPos);
  doc.text('Dated:', leftCol, yPos + 6);
  
  // Right column  
  doc.text('Place of Supply:', rightCol, yPos);
  doc.text('Reverse Charge:', rightCol, yPos + 6);
  
  doc.setFont('helvetica', 'normal');
  
  // Values
  doc.text(bill.billDetails.invoiceNo, leftCol + 25, yPos);
  doc.text(bill.billDetails.invoiceDate, leftCol + 25, yPos + 6);
  doc.text(bill.billDetails.placeOfSupply, rightCol + 35, yPos);
  doc.text(bill.billDetails.reverseCharge, rightCol + 35, yPos + 6);
  
  yPos += 20;
  
  // === BILLING & SHIPPING SECTION ===
  
  doc.setFillColor(...primaryBlue);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('BILLING & SHIPPING DETAILS', 20, yPos + 5);
  
  yPos += 15;
  
  // Billing and shipping boxes
  const boxHeight = 25;
  const boxWidth = (pageWidth - 40) / 2 - 5;
  
  // Billed to box
  doc.setFillColor(250, 250, 250);
  doc.rect(15, yPos, boxWidth, boxHeight, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos, boxWidth, boxHeight, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkBlue);
  doc.text('Billed to:', 20, yPos + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(bill.billDetails.billedToName, 20, yPos + 12);
  const billedAddress = doc.splitTextToSize(bill.billDetails.billedToAddress, boxWidth - 10);
  doc.text(billedAddress, 20, yPos + 17);
  
  if (bill.billDetails.billedToGSTIN) {
    doc.text(`GSTIN: ${bill.billDetails.billedToGSTIN}`, 20, yPos + 22);
  }
  
  // Shipped to box
  doc.setFillColor(250, 250, 250);
  doc.rect(25 + boxWidth, yPos, boxWidth, boxHeight, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(25 + boxWidth, yPos, boxWidth, boxHeight, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkBlue);
  doc.text('Shipped to:', 30 + boxWidth, yPos + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(bill.billDetails.shippedToName || bill.billDetails.billedToName, 30 + boxWidth, yPos + 12);
  const shippedAddress = doc.splitTextToSize(bill.billDetails.shippedToAddress || bill.billDetails.billedToAddress, boxWidth - 10);
  doc.text(shippedAddress, 30 + boxWidth, yPos + 17);
  
  if (bill.billDetails.shippedToGSTIN) {
    doc.text(`GSTIN: ${bill.billDetails.shippedToGSTIN}`, 30 + boxWidth, yPos + 22);
  }
  
  yPos += boxHeight + 15;
  
  // === ITEMS TABLE ===
  
  const tableData = bill.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.hsnSacCode || '',
    item.quantity.toFixed(2),
    item.unit,
    item.rate.toFixed(2),
    item.amount.toFixed(2),
    `${item.cgstRate.toFixed(1)}%`,
    item.cgstAmount.toFixed(2),
    `${item.sgstRate.toFixed(1)}%`,
    item.sgstAmount.toFixed(2),
    item.totalAmount.toFixed(2)
  ]);
  
  // Add totals row
  tableData.push([
    '', 'TOTAL', '', 
    bill.totalUnits.toFixed(2), '', '',
    bill.totalTaxableAmount.toFixed(2), '',
    bill.totalCGSTAmount.toFixed(2), '',
    bill.totalSGSTAmount.toFixed(2),
    bill.grandTotal.toFixed(2)
  ]);
  
  // Add BSR deduction row
  tableData.push([
    '', '', '', '', '', 
    'Less: BSR -1.80% BELOW',
    '@ O12', '1.80%', '', '',
    '',
    bill.bsrDeduction.toFixed(2)
  ]);
  
  // Add empty row
  tableData.push(Array(12).fill(''));
  
  // Add grand total row
  tableData.push([
    '', '', '', '', '', '', '', '', '', '', 
    'GRAND TOTAL',
    bill.finalAmount.toFixed(2)
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [[
      'S.N', 'Description of Goods', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 
      'Amount', 'CGST Rate', 'CGST Amt', 'SGST Rate', 'SGST Amt', 'Total Amount'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 35, halign: 'left' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 15, halign: 'right' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 20, halign: 'right' },
      9: { cellWidth: 18, halign: 'center' },
      10: { cellWidth: 20, halign: 'right' },
      11: { cellWidth: 24, halign: 'right' }
    },
    didParseCell: function(data: any) {
      // Style total rows
      if (data.row.index >= bill.items.length && data.row.index < bill.items.length + 2) {
        data.cell.styles.fillColor = [255, 255, 153]; // Light yellow
        data.cell.styles.fontStyle = 'bold';
      }
      // Style grand total row
      if (data.row.index === bill.items.length + 3) {
        data.cell.styles.fillColor = orange;
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 15, right: 15 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page
  if (finalY > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos = finalY;
  }
  
  // === TAX SUMMARY ===
  
  doc.setFillColor(...primaryBlue);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX SUMMARY', 20, yPos + 5);
  
  yPos += 15;
  
  const taxSummaryData = bill.taxSummary.map(summary => [
    `${summary.taxRate.toFixed(1)}%`,
    summary.taxableAmount.toFixed(2),
    summary.cgstAmount.toFixed(2),
    summary.sgstAmount.toFixed(2),
    summary.totalTaxAmount.toFixed(2)
  ]);
  
  // Add total row
  taxSummaryData.push([
    'TOTAL',
    bill.totalTaxableAmount.toFixed(2),
    bill.totalCGSTAmount.toFixed(2),
    bill.totalSGSTAmount.toFixed(2),
    bill.totalTaxAmount.toFixed(2)
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Tax Rate', 'Taxable Amount', 'CGST Amount', 'SGST Amount', 'Total Tax']],
    body: taxSummaryData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    didParseCell: function(data: any) {
      if (data.row.index === taxSummaryData.length - 1) {
        data.cell.styles.fillColor = [255, 255, 153];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // === AMOUNT IN WORDS ===
  
  doc.setFillColor(...lightBlue);
  doc.rect(15, yPos, pageWidth - 30, 12, 'F');
  doc.setDrawColor(...primaryBlue);
  doc.rect(15, yPos, pageWidth - 30, 12, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkBlue);
  doc.text('Amount in Words:', 20, yPos + 4);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(bill.amountInWords, 20, yPos + 9);
  
  yPos += 20;
  
  // === FOOTER SECTION ===
  
  // Bank details and terms in columns
  const leftColWidth = (pageWidth - 40) / 2;
  
  // Bank details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkBlue);
  doc.text('Bank Details:', 20, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const bankLines = doc.splitTextToSize(bill.billDetails.bankDetails, leftColWidth - 10);
  doc.text(bankLines, 20, yPos + 6);
  
  // Terms & Conditions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkBlue);
  doc.text('Terms & Conditions:', 20, yPos + 25);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  let termY = yPos + 31;
  bill.billDetails.termsConditions.forEach((term, index) => {
    doc.text(`${index + 1}. ${term}`, 20, termY);
    termY += 5;
  });
  
  // Signature section
  const signatureX = pageWidth / 2 + 20;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkBlue);
  doc.text("Receiver's Signature", signatureX, yPos);
  
  // Draw signature line
  doc.setDrawColor(0, 0, 0);
  doc.line(signatureX, yPos + 20, signatureX + 60, yPos + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`for ${bill.billDetails.companyName}`, signatureX, yPos + 35);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', signatureX, yPos + 42);
  
  // Draw signatory line
  doc.line(signatureX, yPos + 50, signatureX + 60, yPos + 50);
  
  // === FOOTER ===
  
  // Bottom border
  doc.setFillColor(...primaryBlue);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
  
  // Page number and date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 15, pageHeight - 3);
  doc.text('Page 1 of 1', pageWidth - 15, pageHeight - 3, { align: 'right' });
  
  // Save the PDF
  const filename = `GST_Invoice_${bill.billDetails.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}_${bill.billDetails.billedToName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
