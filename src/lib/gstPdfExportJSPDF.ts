import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GSTBill } from '@/types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportGSTBillToPDFJSPDF(bill: GSTBill) {
  try {
    console.log('🚀 Starting jsPDF export...');
    
    // Create PDF with A4 portrait dimensions
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width; // 210mm
    const pageHeight = doc.internal.pageSize.height; // 297mm
    
    // Colors matching the actual UI exactly
    const lightGray: [number, number, number] = [243, 244, 246]; // #f3f4f6 - Light gray for headers and totals (bg-gray-100)
    const darkGray: [number, number, number] = [31, 41, 55]; // #1f2937 - Dark gray for text
    const black: [number, number, number] = [0, 0, 0]; // Black for borders and text
    const white: [number, number, number] = [255, 255, 255]; // White background
    
    let yPosition = 15;
    
    // GSTIN at top right (matching reference - closer to top)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`GSTIN : ${bill.billDetails.companyGSTIN}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // TAX INVOICE centered (matching reference - larger and more prominent)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('TAX INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Company Name centered below TAX INVOICE (matching reference)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(bill.billDetails.companyName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    // Company details below company name (matching reference)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(bill.billDetails.companyAddress, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    doc.text(`PAN : ${bill.billDetails.companyPAN}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Invoice Details in two columns (matching reference layout)
    const leftColX = 20;
    const rightColX = pageWidth / 2 + 20;
    const detailsStartY = yPosition;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left column (matching reference format with colons)
    doc.text(`Invoice No. : ${bill.billDetails.invoiceNo}`, leftColX, detailsStartY);
    doc.text(`Dated : ${bill.billDetails.invoiceDate}`, leftColX, detailsStartY + 6);
    doc.text(`Billed to : ${bill.billDetails.billedToName || ''}`, leftColX, detailsStartY + 12);
    
    // Right column (matching reference format with colons)
    doc.text(`Place of Supply : ${bill.billDetails.placeOfSupply || 'Rajasthan (08)'}`, rightColX, detailsStartY);
    doc.text(`Reverse Charge : ${bill.billDetails.reverseCharge || 'N'}`, rightColX, detailsStartY + 6);
    doc.text(`Shipped to : `, rightColX, detailsStartY + 12);
    
    yPosition = detailsStartY + 20;
    
    // Items Table - matching exact UI structure
    const tableData = bill.items.map((item, index) => [
      index + 1,
      item.description,
      item.hsnSacCode || '-',
      item.quantity.toFixed(2),
      item.unit,
      item.rate.toFixed(2),
      item.cgstRate.toFixed(2) + '%',
      item.cgstAmount.toFixed(2),
      item.sgstRate.toFixed(2) + '%',
      item.sgstAmount.toFixed(2),
      item.totalAmount.toFixed(2)
    ]);
    
    // Add totals row (matching reference - "Total" spans first 3 columns)
    tableData.push([
      'Total',
      '',
      '',
      bill.totalUnits.toFixed(2),
      '',
      bill.totalTaxableAmount.toFixed(2),
      '',
      bill.totalCGSTAmount.toFixed(2),
      '',
      bill.totalSGSTAmount.toFixed(2),
      bill.grandTotal.toFixed(2)
    ]);
    
    // Add BSR deduction row (matching reference exactly)
    const bsrDeduction = bill.grandTotal * 0.018; // 1.8%
    tableData.push([
      '',
      'Less : BSR -1.80 % BELOW',
      '',
      '',
      '',
      '',
      '@ O12',
      '1.80%',
      '',
      '',
      bsrDeduction.toFixed(2)
    ]);
    
    // Add Grand Total row
    tableData.push([
      '',
      'Grand Total',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      bill.finalAmount.toFixed(2)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['S.N', 'Description of Goods', 'HSN/SAC Code', 'Qty', 'Unit', 'Rate', 'CGST Rate', 'CGST Amount', 'SGST Rate', 'SGST Amount', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: lightGray,
        textColor: black,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },   // S.N
        1: { cellWidth: 35, halign: 'left' },     // Description of Goods
        2: { cellWidth: 18, halign: 'center' },   // HSN/SAC Code
        3: { cellWidth: 12, halign: 'center' },   // Qty
        4: { cellWidth: 15, halign: 'center' },   // Unit
        5: { cellWidth: 12, halign: 'center' },   // Rate
        6: { cellWidth: 12, halign: 'center' },   // CGST Rate
        7: { cellWidth: 15, halign: 'center' },   // CGST Amount
        8: { cellWidth: 12, halign: 'center' },   // SGST Rate
        9: { cellWidth: 15, halign: 'center' },   // SGST Amount
        10: { cellWidth: 15, halign: 'center' }   // Amount
      },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      showHead: 'everyPage',
      didParseCell: function(data: any) {
        // Style totals row (light gray background)
        if (data.row.index === bill.items.length) {
          data.cell.styles.fillColor = lightGray;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
        // Style BSR deduction row (no special background, just bold text)
        if (data.row.index === bill.items.length + 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
        // Style Grand Total row (bold)
        if (data.row.index === bill.items.length + 2) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
      }
    });
    
    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Tax Summary Table - matching UI layout exactly
    const taxSummaryData = bill.taxSummary.map(tax => [
      tax.taxRate.toFixed(2) + '%',
      tax.taxableAmount.toFixed(2),
      tax.cgstAmount.toFixed(2),
      tax.sgstAmount.toFixed(2),
      tax.totalTaxAmount.toFixed(2)
    ]);
    
    // Add total row for tax summary
    taxSummaryData.push([
      'Total',
      bill.totalTaxableAmount.toFixed(2),
      bill.totalCGSTAmount.toFixed(2),
      bill.totalSGSTAmount.toFixed(2),
      (bill.totalCGSTAmount + bill.totalSGSTAmount).toFixed(2)
    ]);
    
    autoTable(doc, {
      startY: finalY,
      head: [['Tax Rate', 'Taxable Amt.', 'CGST Amt.', 'SGST Amt.', 'Total Tax']],
      body: taxSummaryData,
      theme: 'grid',
      headStyles: {
        fillColor: lightGray,
        textColor: black,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 35, halign: 'center' }
      },
      margin: { left: 10, right: 10 },
      didParseCell: function(data: any) {
        // Style total row
        if (data.row.index === bill.taxSummary.length) {
          data.cell.styles.fillColor = lightGray;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
      }
    });
    
    // Footer section - matching reference layout exactly
    const finalTableY = (doc as any).lastAutoTable.finalY + 10;
    
    // Amount in words
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Amount in words: ${bill.amountInWords}`, 20, finalTableY);
    
    // Bank details (matching reference format - separate lines)
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details :', 20, finalTableY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('RMGB CA AC NO. 8306041866', 20, finalTableY + 12);
    doc.text('RMGB0000103 RMGB AHORE', 20, finalTableY + 18);
    
    // Two-column layout for terms and signature (matching reference)
    const leftColumnX = 20;
    const rightColumnX = pageWidth - 80;
    const termsStartY = finalTableY + 25;
    
    // Terms and conditions (left column)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', leftColumnX, termsStartY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Terms (matching reference exactly)
    const terms = [
      '1. E. & O.E.',
      '2. Goods once sold will not be taken back.',
      '3. Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.',
      '4. Subject to "JALORE" Jurisdiction only.'
    ];
    
    terms.forEach((term, index) => {
      doc.text(term, leftColumnX, termsStartY + 5 + (index * 6));
    });
    
    // Receiver signature section (right column, matching reference - higher position)
    const signatureY = termsStartY - 5;
    
    // "Receiver's Signature" text (just above the line)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("Receiver's Signature", rightColumnX, signatureY - 3);
    
    // Draw signature line
    doc.setLineWidth(0.5);
    doc.line(rightColumnX, signatureY, rightColumnX + 50, signatureY);
    
    // Company signature section (lower right, matching reference - lower position)
    const companySignatureY = termsStartY + 25;
    
    // Draw line for company signature
    doc.line(rightColumnX, companySignatureY, rightColumnX + 50, companySignatureY);
    
    // Company signature text (below the line)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`for ${bill.billDetails.companyName}`, rightColumnX, companySignatureY + 5);
    doc.text('Authorised Signatory', rightColumnX, companySignatureY + 10);
    
    // Save the PDF
    const fileName = `GST_Invoice_${bill.billDetails.invoiceNo}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ jsPDF export completed successfully');
    
  } catch (error) {
    console.error('❌ jsPDF export error:', error);
    throw new Error('PDF generation failed');
  }
}
