const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, 'pdf-test-output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🧪 Starting standalone PDF export test...');

// Mock GST bill data
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

// Create a simple HTML representation of the bill
function createBillHTML(bill) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>GST Bill Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
        }
        .gst-bill-display {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border: 1px solid #ccc;
            padding: 20px;
        }
        .bill-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .bill-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .company-info {
            font-size: 14px;
            margin-bottom: 20px;
        }
        .bill-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .bill-details-left, .bill-details-right {
            flex: 1;
        }
        .bill-details-right {
            text-align: right;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            font-size: 12px;
        }
        .items-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .items-table .text-left {
            text-align: left;
        }
        .items-table .text-right {
            text-align: right;
        }
        .totals-section {
            margin-top: 20px;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: right;
        }
        .totals-table .label {
            text-align: left;
            font-weight: bold;
        }
        .tax-summary {
            margin-top: 20px;
        }
        .tax-summary-table {
            width: 100%;
            border-collapse: collapse;
        }
        .tax-summary-table th, .tax-summary-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
        }
        .tax-summary-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="gst-bill-display">
        <div class="bill-header">
            <div class="bill-title">TAX INVOICE</div>
            <div class="company-info">
                <div><strong>${bill.billDetails.companyName}</strong></div>
                <div>${bill.billDetails.companyAddress}</div>
                <div>PAN: ${bill.billDetails.companyPAN} | GSTIN: ${bill.billDetails.companyGSTIN}</div>
            </div>
        </div>
        
        <div class="bill-details">
            <div class="bill-details-left">
                <div><strong>Invoice No.:</strong> ${bill.billDetails.invoiceNo}</div>
                <div><strong>Dated:</strong> ${new Date().toISOString().split('T')[0]}</div>
                <div><strong>Billed to:</strong> ${bill.billDetails.billedToName}</div>
                <div><strong>GSTIN / UIN:</strong> ${bill.billDetails.billedToGSTIN}</div>
            </div>
            <div class="bill-details-right">
                <div><strong>Place of Supply:</strong> ${bill.billDetails.placeOfSupply}</div>
                <div><strong>Reverse Charge:</strong> ${bill.billDetails.reverseCharge}</div>
                <div><strong>Shipped to:</strong> ${bill.billDetails.shippedTo}</div>
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%;">S.N</th>
                    <th style="width: 25%;">Description of Goods</th>
                    <th style="width: 10%;">HSN/SAC Code</th>
                    <th style="width: 8%;">Qty. Unit</th>
                    <th style="width: 8%;">Rate</th>
                    <th style="width: 8%;">Price</th>
                    <th style="width: 6%;">CGST Rate</th>
                    <th style="width: 8%;">CGST Amount</th>
                    <th style="width: 6%;">SGST Rate</th>
                    <th style="width: 8%;">SGST Amount</th>
                    <th style="width: 8%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${bill.items.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="text-left">${item.description}</td>
                        <td>${item.hsnSacCode}</td>
                        <td>${item.quantity} ${item.unit}</td>
                        <td class="text-right">${item.rate.toFixed(2)}</td>
                        <td class="text-right">${item.taxableAmount.toFixed(2)}</td>
                        <td>${item.cgstRate.toFixed(2)}%</td>
                        <td class="text-right">${item.cgstAmount.toFixed(2)}</td>
                        <td>${item.sgstRate.toFixed(2)}%</td>
                        <td class="text-right">${item.sgstAmount.toFixed(2)}</td>
                        <td class="text-right">${item.totalAmount.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                    <td colspan="3">Total</td>
                    <td>${bill.totals.totalQuantity.toFixed(2)}</td>
                    <td></td>
                    <td class="text-right">${bill.totals.totalTaxableAmount.toFixed(2)}</td>
                    <td></td>
                    <td class="text-right">${bill.totals.totalCGSTAmount.toFixed(2)}</td>
                    <td></td>
                    <td class="text-right">${bill.totals.totalSGSTAmount.toFixed(2)}</td>
                    <td class="text-right">${(bill.totals.totalTaxableAmount + bill.totals.totalTaxAmount).toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="10" class="text-right"><strong>Less : BSR -1.80 % BELOW</strong></td>
                    <td class="text-right">${bill.totals.bsrDeduction.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="10" class="text-right"><strong>Grand Total</strong></td>
                    <td class="text-right"><strong>${bill.totals.finalAmount.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div class="tax-summary">
            <h3>Tax Summary</h3>
            <table class="tax-summary-table">
                <thead>
                    <tr>
                        <th>Tax Rate</th>
                        <th>Taxable Amt.</th>
                        <th>CGST Amt.</th>
                        <th>SGST Amt.</th>
                        <th>Total Tax</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.taxSummary.map(tax => `
                        <tr>
                            <td>${tax.taxRate.toFixed(2)}%</td>
                            <td class="text-right">${tax.taxableAmount.toFixed(2)}</td>
                            <td class="text-right">${tax.cgstAmount.toFixed(2)}</td>
                            <td class="text-right">${tax.sgstAmount.toFixed(2)}</td>
                            <td class="text-right">${tax.totalTaxAmount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background-color: #f9f9f9; font-weight: bold;">
                        <td><strong>Total</strong></td>
                        <td class="text-right"><strong>${bill.totals.totalTaxableAmount.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>${bill.totals.totalCGSTAmount.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>${bill.totals.totalSGSTAmount.toFixed(2)}</strong></td>
                        <td class="text-right"><strong>${bill.totals.totalTaxAmount.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 30px;">
            <div><strong>Amount in Words:</strong> Two Thousand Two Hundred Seventy Eight and Forty Six Paise Only</div>
            <div style="margin-top: 20px;"><strong>Bank Details:</strong> ${bill.billDetails.bankDetails}</div>
        </div>
    </div>
</body>
</html>
  `;
}

// Save the HTML file
const htmlContent = createBillHTML(mockBill);
const htmlPath = path.join(outputDir, 'bill-preview.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log('💾 HTML preview saved to:', htmlPath);

// Create a simple PDF using jsPDF
function createSimplePDF(bill) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  console.log('📄 PDF page dimensions:', {
    pageWidth: pageWidth + 'mm',
    pageHeight: pageHeight + 'mm'
  });
  
  // Header
  pdf.setFontSize(20);
  pdf.text('TAX INVOICE', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(bill.billDetails.companyName, pageWidth / 2, 30, { align: 'center' });
  pdf.text(bill.billDetails.companyAddress, pageWidth / 2, 35, { align: 'center' });
  pdf.text(`PAN: ${bill.billDetails.companyPAN} | GSTIN: ${bill.billDetails.companyGSTIN}`, pageWidth / 2, 40, { align: 'center' });
  
  // Bill details
  let yPos = 50;
  pdf.text(`Invoice No.: ${bill.billDetails.invoiceNo}`, 20, yPos);
  pdf.text(`Dated: ${new Date().toISOString().split('T')[0]}`, 20, yPos + 5);
  pdf.text(`Billed to: ${bill.billDetails.billedToName}`, 20, yPos + 10);
  pdf.text(`GSTIN: ${bill.billDetails.billedToGSTIN}`, 20, yPos + 15);
  
  pdf.text(`Place of Supply: ${bill.billDetails.placeOfSupply}`, 120, yPos);
  pdf.text(`Reverse Charge: ${bill.billDetails.reverseCharge}`, 120, yPos + 5);
  pdf.text(`Shipped to: ${bill.billDetails.shippedTo}`, 120, yPos + 10);
  
  // Items table
  yPos = 80;
  const tableData = [
    ['S.N', 'Description', 'HSN/SAC', 'Qty', 'Rate', 'Price', 'CGST%', 'CGST Amt', 'SGST%', 'SGST Amt', 'Amount']
  ];
  
  bill.items.forEach((item, index) => {
    tableData.push([
      (index + 1).toString(),
      item.description,
      item.hsnSacCode,
      `${item.quantity} ${item.unit}`,
      item.rate.toFixed(2),
      item.taxableAmount.toFixed(2),
      `${item.cgstRate.toFixed(2)}%`,
      item.cgstAmount.toFixed(2),
      `${item.sgstRate.toFixed(2)}%`,
      item.sgstAmount.toFixed(2),
      item.totalAmount.toFixed(2)
    ]);
  });
  
  // Add totals row
  tableData.push([
    'Total',
    '',
    '',
    bill.totals.totalQuantity.toFixed(2),
    '',
    bill.totals.totalTaxableAmount.toFixed(2),
    '',
    bill.totals.totalCGSTAmount.toFixed(2),
    '',
    bill.totals.totalSGSTAmount.toFixed(2),
    (bill.totals.totalTaxableAmount + bill.totals.totalTaxAmount).toFixed(2)
  ]);
  
  // Add BSR deduction row
  tableData.push([
    'Less: BSR -1.80%',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    bill.totals.bsrDeduction.toFixed(2)
  ]);
  
  // Add grand total row
  tableData.push([
    'Grand Total',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    bill.totals.finalAmount.toFixed(2)
  ]);
  
  // Calculate column widths - optimized for A4 portrait
  const colWidths = [8, 25, 12, 12, 12, 12, 10, 12, 10, 12, 12];
  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
  
  console.log('📊 Table dimensions:', {
    totalWidth: totalWidth + 'mm',
    pageWidth: pageWidth + 'mm',
    fitsInPage: totalWidth <= pageWidth - 20
  });
  
  // Draw table
  pdf.setFontSize(7); // Reduced font size for better fit
  let xPos = 20;
  tableData.forEach((row, rowIndex) => {
    xPos = 20;
    row.forEach((cell, colIndex) => {
      const cellWidth = colWidths[colIndex];
      const cellHeight = 6;
      
      // Draw border
      pdf.rect(xPos, yPos, cellWidth, cellHeight);
      
      // Add text
      pdf.text(cell, xPos + 2, yPos + 4);
      
      xPos += cellWidth;
    });
    yPos += 6;
  });
  
  // Tax summary
  yPos += 10;
  pdf.setFontSize(12);
  pdf.text('Tax Summary', 20, yPos);
  
  yPos += 10;
  const taxTableData = [
    ['Tax Rate', 'Taxable Amt.', 'CGST Amt.', 'SGST Amt.', 'Total Tax']
  ];
  
  bill.taxSummary.forEach(tax => {
    taxTableData.push([
      `${tax.taxRate.toFixed(2)}%`,
      tax.taxableAmount.toFixed(2),
      tax.cgstAmount.toFixed(2),
      tax.sgstAmount.toFixed(2),
      tax.totalTaxAmount.toFixed(2)
    ]);
  });
  
  // Add total row
  taxTableData.push([
    'Total',
    bill.totals.totalTaxableAmount.toFixed(2),
    bill.totals.totalCGSTAmount.toFixed(2),
    bill.totals.totalSGSTAmount.toFixed(2),
    bill.totals.totalTaxAmount.toFixed(2)
  ]);
  
  const taxColWidths = [25, 35, 35, 35, 35];
  const taxTotalWidth = taxColWidths.reduce((sum, width) => sum + width, 0);
  
  console.log('📊 Tax table dimensions:', {
    totalWidth: taxTotalWidth + 'mm',
    pageWidth: pageWidth + 'mm',
    fitsInPage: taxTotalWidth <= pageWidth - 20
  });
  
  // Draw tax table
  pdf.setFontSize(8);
  taxTableData.forEach((row, rowIndex) => {
    xPos = 20;
    row.forEach((cell, colIndex) => {
      const cellWidth = taxColWidths[colIndex];
      const cellHeight = 6;
      
      // Draw border
      pdf.rect(xPos, yPos, cellWidth, cellHeight);
      
      // Add text
      pdf.text(cell, xPos + 2, yPos + 4);
      
      xPos += cellWidth;
    });
    yPos += 6;
  });
  
  return pdf;
}

// Generate the PDF
const pdf = createSimplePDF(mockBill);
const pdfPath = path.join(outputDir, 'bill-test.pdf');
pdf.save(pdfPath);
console.log('💾 PDF saved to:', pdfPath);

// Also save as base64 for analysis
const pdfOutput = pdf.output('datauristring');
const base64Path = path.join(outputDir, 'bill-test-base64.txt');
fs.writeFileSync(base64Path, pdfOutput);
console.log('💾 PDF base64 saved to:', base64Path);

console.log('🎉 Test completed!');
console.log('📁 Check the output folder:', outputDir);
console.log('📋 Files created:');
console.log('  - bill-preview.html (HTML preview)');
console.log('  - bill-test.pdf (Generated PDF)');
console.log('  - bill-test-base64.txt (PDF as base64)');
