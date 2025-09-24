import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GSTBill } from '@/types';
import toast from 'react-hot-toast';

export function exportGSTBillToPDFHTML2Canvas(bill: GSTBill) {
  console.log('🎨 Starting HTML2Canvas export...');
  
  // Find the bill display element
  const billElement = document.querySelector('.gst-bill-display') as HTMLElement;
  
  if (!billElement) {
    console.error('❌ Bill display element not found');
    console.log('Available elements with class gst-bill-display:', document.querySelectorAll('.gst-bill-display'));
    toast.error('Unable to find bill content. Please try again.');
    return;
  }
  
  console.log('✅ Found bill element:', billElement);

  // Add PDF export mode class
  billElement.classList.add('pdf-export-mode');

  // Create comprehensive style override
  const tempStyle = document.createElement('style');
  tempStyle.id = 'pdf-export-override';
  tempStyle.textContent = `
    /* PDF Export Mode Styles */
    .pdf-export-mode {
      width: 210mm !important;
      max-width: 210mm !important;
      min-width: 210mm !important;
      margin: 0 auto !important;
      padding: 10mm !important;
      box-sizing: border-box !important;
      background: white !important;
    }
    
    .pdf-export-mode * {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
      outline-color: #000000 !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }
    
    /* Override all Tailwind color classes to use hex values */
    .pdf-export-mode .bg-white { background-color: #ffffff !important; }
    .pdf-export-mode .bg-gray-50 { background-color: #f9fafb !important; }
    .pdf-export-mode .bg-gray-100 { background-color: #f3f4f6 !important; }
    .pdf-export-mode .bg-gray-200 { background-color: #e5e7eb !important; }
    .pdf-export-mode .bg-gray-300 { background-color: #d1d5db !important; }
    .pdf-export-mode .bg-gray-400 { background-color: #9ca3af !important; }
    .pdf-export-mode .bg-gray-500 { background-color: #6b7280 !important; }
    .pdf-export-mode .bg-gray-600 { background-color: #4b5563 !important; }
    .pdf-export-mode .bg-gray-700 { background-color: #374151 !important; }
    .pdf-export-mode .bg-gray-800 { background-color: #1f2937 !important; }
    .pdf-export-mode .bg-gray-900 { background-color: #111827 !important; }
    
    .pdf-export-mode .text-white { color: #ffffff !important; }
    .pdf-export-mode .text-gray-50 { color: #f9fafb !important; }
    .pdf-export-mode .text-gray-100 { color: #f3f4f6 !important; }
    .pdf-export-mode .text-gray-200 { color: #e5e7eb !important; }
    .pdf-export-mode .text-gray-300 { color: #d1d5db !important; }
    .pdf-export-mode .text-gray-400 { color: #9ca3af !important; }
    .pdf-export-mode .text-gray-500 { color: #6b7280 !important; }
    .pdf-export-mode .text-gray-600 { color: #4b5563 !important; }
    .pdf-export-mode .text-gray-700 { color: #374151 !important; }
    .pdf-export-mode .text-gray-800 { color: #1f2937 !important; }
    .pdf-export-mode .text-gray-900 { color: #111827 !important; }
    
    .pdf-export-mode .border-gray-300 { border-color: #d1d5db !important; }
    .pdf-export-mode .border-gray-800 { border-color: #1f2937 !important; }
    
    /* Table optimizations for PDF */
    .pdf-export-mode table {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      font-size: 10px !important;
      margin: 0 !important;
    }
    
    .pdf-export-mode th,
    .pdf-export-mode td {
      padding: 3px 4px !important;
      font-size: 9px !important;
      line-height: 1.2 !important;
      border: 1px solid #000000 !important;
      word-wrap: break-word !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
    
    /* Optimized column widths for A4 (190mm usable width) */
    .pdf-export-mode .gst-table-sn { width: 5% !important; }
    .pdf-export-mode .gst-table-description { width: 25% !important; }
    .pdf-export-mode .gst-table-hsn { width: 8% !important; }
    .pdf-export-mode .gst-table-qty { width: 8% !important; }
    .pdf-export-mode .gst-table-unit { width: 7% !important; }
    .pdf-export-mode .gst-table-rate { width: 8% !important; }
    .pdf-export-mode .gst-table-cgst-rate { width: 7% !important; }
    .pdf-export-mode .gst-table-cgst-amt { width: 8% !important; }
    .pdf-export-mode .gst-table-sgst-rate { width: 7% !important; }
    .pdf-export-mode .gst-table-sgst-amt { width: 8% !important; }
    .pdf-export-mode .gst-table-total { width: 10% !important; }
    
    /* Header styles */
    .pdf-export-mode h1,
    .pdf-export-mode h2,
    .pdf-export-mode h3 {
      color: #000000 !important;
      font-weight: bold !important;
    }
    
    /* Hide action buttons */
    .pdf-export-mode .print\\:hidden,
    .pdf-export-mode [class*="print:hidden"] {
      display: none !important;
    }
    
    /* Ensure proper spacing */
    .pdf-export-mode .mb-6 {
      margin-bottom: 15px !important;
    }
    
    .pdf-export-mode .mb-4 {
      margin-bottom: 10px !important;
    }
    
    .pdf-export-mode .mb-2 {
      margin-bottom: 5px !important;
    }
  `;
  
  document.head.appendChild(tempStyle);
  
  // Add additional style override to handle oklch colors
  const oklchOverrideStyle = document.createElement('style');
  oklchOverrideStyle.id = 'oklch-override';
  oklchOverrideStyle.textContent = `
    /* Override oklch colors globally */
    * {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
    }
    
    /* Specific overrides for common Tailwind classes */
    .bg-white { background-color: #ffffff !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .bg-gray-300 { background-color: #d1d5db !important; }
    .bg-gray-400 { background-color: #9ca3af !important; }
    .bg-gray-500 { background-color: #6b7280 !important; }
    .bg-gray-600 { background-color: #4b5563 !important; }
    .bg-gray-700 { background-color: #374151 !important; }
    .bg-gray-800 { background-color: #1f2937 !important; }
    .bg-gray-900 { background-color: #111827 !important; }
    
    .text-white { color: #ffffff !important; }
    .text-gray-50 { color: #f9fafb !important; }
    .text-gray-100 { color: #f3f4f6 !important; }
    .text-gray-200 { color: #e5e7eb !important; }
    .text-gray-300 { color: #d1d5db !important; }
    .text-gray-400 { color: #9ca3af !important; }
    .text-gray-500 { color: #6b7280 !important; }
    .text-gray-600 { color: #4b5563 !important; }
    .text-gray-700 { color: #374151 !important; }
    .text-gray-800 { color: #1f2937 !important; }
    .text-gray-900 { color: #111827 !important; }
    
    .border-gray-300 { border-color: #d1d5db !important; }
    .border-gray-800 { border-color: #1f2937 !important; }
  `;
  document.head.appendChild(oklchOverrideStyle);

  // Hide action buttons
  const actionButtons = billElement.querySelector('.print\\:hidden') as HTMLElement;
  if (actionButtons) {
    actionButtons.style.display = 'none';
  }
  
  // Also try to hide action buttons by class name
  const actionButtonsByClass = billElement.querySelector('[class*="print:hidden"]') as HTMLElement;
  if (actionButtonsByClass) {
    actionButtonsByClass.style.display = 'none';
  }

  // Force a reflow
  billElement.offsetHeight;

  // Capture with html2canvas
  html2canvas(billElement, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: 794, // 210mm at 96 DPI
    height: billElement.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1200,
    windowHeight: window.innerHeight,
    logging: false,
    removeContainer: true,
    imageTimeout: 15000,
    foreignObjectRendering: false,
    onclone: (clonedDoc) => {
      // Additional processing on cloned document
      const clonedElement = clonedDoc.querySelector('.gst-bill-display') as HTMLElement;
      if (clonedElement) {
        clonedElement.style.width = '210mm';
        clonedElement.style.maxWidth = '210mm';
        clonedElement.style.margin = '0 auto';
        clonedElement.style.padding = '10mm';
        clonedElement.style.boxSizing = 'border-box';
      }
      
      // Remove all oklch colors from the cloned document
      const allElements = clonedDoc.querySelectorAll('*');
      allElements.forEach((element: any) => {
        const computedStyle = clonedDoc.defaultView?.getComputedStyle(element);
        if (computedStyle) {
          // Override background colors
          if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
            element.style.backgroundColor = '#ffffff';
          }
          // Override text colors
          if (computedStyle.color && computedStyle.color.includes('oklch')) {
            element.style.color = '#000000';
          }
          // Override border colors
          if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
            element.style.borderColor = '#000000';
          }
        }
      });
    }
  }).then((canvas) => {
    console.log('📸 Canvas captured:', {
      width: canvas.width,
      height: canvas.height
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width; // 210mm
    const pageHeight = pdf.internal.pageSize.height; // 297mm

    // Calculate image dimensions
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    console.log('📏 PDF dimensions:', {
      pageWidth: pageWidth + 'mm',
      pageHeight: pageHeight + 'mm',
      imgWidth: imgWidth + 'mm',
      imgHeight: imgHeight + 'mm'
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', 1.0);

    if (imgHeight <= pageHeight - 20) {
      // Single page
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      console.log('✅ Added image to single page');
    } else {
      // Multiple pages
      const totalPages = Math.ceil(imgHeight / (pageHeight - 20));
      console.log(`📄 Splitting into ${totalPages} pages`);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const sourceY = (canvas.height / totalPages) * i;
        const sourceHeight = canvas.height / totalPages;
        const pageImgHeight = (pageHeight - 20) / totalPages;

        // Create temporary canvas for this page
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageImgHeight);
        }
      }
    }

    // Save PDF
    const fileName = `GST_Invoice_${bill.billDetails.invoiceNo}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('✅ HTML2Canvas export completed successfully');
    toast.success('PDF exported successfully!');

  }).catch((error) => {
    console.error('❌ HTML2Canvas export error:', error);
    toast.error('PDF generation failed. Please try again.');
  }).finally(() => {
    // Cleanup
    billElement.classList.remove('pdf-export-mode');
    if (actionButtons) {
      actionButtons.style.display = '';
    }
    if (actionButtonsByClass) {
      actionButtonsByClass.style.display = '';
    }
    const styleElement = document.getElementById('pdf-export-override');
    if (styleElement) {
      styleElement.remove();
    }
    const oklchStyleElement = document.getElementById('oklch-override');
    if (oklchStyleElement) {
      oklchStyleElement.remove();
    }
  });
}
