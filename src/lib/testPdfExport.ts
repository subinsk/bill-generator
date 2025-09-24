import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GSTBill } from '@/types';

export function testPdfExportWithImage(bill: GSTBill) {
  // This function exports PDF and also creates a preview image for testing
  console.log('🧪 Starting PDF export test...');
  
  // Find the bill display element
  const billElement = document.querySelector('.gst-bill-display') as HTMLElement;
  
  if (!billElement) {
    console.error('❌ Bill display element not found');
    alert('Unable to find bill content. Please try again.');
    return;
  }

  console.log('✅ Bill element found, dimensions:', {
    width: billElement.offsetWidth,
    height: billElement.offsetHeight,
    scrollWidth: billElement.scrollWidth,
    scrollHeight: billElement.scrollHeight
  });

  // Pre-process: Remove any oklch colors from the element before capture
  const preprocessElement = (element: HTMLElement) => {
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Force override any oklch colors
      if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
        htmlEl.style.setProperty('background-color', '#ffffff', 'important');
      }
      if (computedStyle.color && computedStyle.color.includes('oklch')) {
        htmlEl.style.setProperty('color', '#000000', 'important');
      }
      if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
        htmlEl.style.setProperty('border-color', '#000000', 'important');
      }
      if (computedStyle.outlineColor && computedStyle.outlineColor.includes('oklch')) {
        htmlEl.style.setProperty('outline-color', '#000000', 'important');
      }
      if (computedStyle.textShadow && computedStyle.textShadow.includes('oklch')) {
        htmlEl.style.setProperty('text-shadow', 'none', 'important');
      }
      if (computedStyle.boxShadow && computedStyle.boxShadow.includes('oklch')) {
        htmlEl.style.setProperty('box-shadow', '0 1px 3px rgba(0,0,0,0.1)', 'important');
      }
    });
  };

  // Pre-process the element
  preprocessElement(billElement);

  // Ensure the element has proper dimensions for PDF generation
  billElement.style.width = '100%';
  billElement.style.maxWidth = '100%';
  billElement.style.overflow = 'visible';
  billElement.style.boxSizing = 'border-box';

  // Add a class to the element for PDF export styling
  billElement.classList.add('pdf-export-mode');

  // Add a temporary style override to the document head
  const tempStyle = document.createElement('style');
  tempStyle.id = 'pdf-export-override';
  tempStyle.textContent = `
    /* Temporary override for PDF export - Nuclear option */
    .pdf-export-mode,
    .pdf-export-mode *,
    .pdf-export-mode *::before,
    .pdf-export-mode *::after {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
      outline-color: #000000 !important;
      text-shadow: none !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }
    
    .pdf-export-mode .bg-white { background-color: #ffffff !important; }
    .pdf-export-mode .bg-gray-50 { background-color: #f9fafb !important; }
    .pdf-export-mode .bg-gray-100 { background-color: #f3f4f6 !important; }
    .pdf-export-mode .bg-gray-200 { background-color: #e5e7eb !important; }
    .pdf-export-mode .bg-blue-600 { background-color: #2563eb !important; }
    .pdf-export-mode .bg-red-600 { background-color: #dc2626 !important; }
    .pdf-export-mode .bg-green-600 { background-color: #16a34a !important; }
    .pdf-export-mode .text-white { color: #ffffff !important; }
    .pdf-export-mode .text-gray-800 { color: #1f2937 !important; }
    .pdf-export-mode .text-gray-600 { color: #4b5563 !important; }
    .pdf-export-mode .border-gray-300 { border-color: #d1d5db !important; }
    .pdf-export-mode .border-gray-800 { border-color: #1f2937 !important; }
    
    /* Override any oklch colors */
    .pdf-export-mode [style*="oklch"] {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
    }
  `;
  document.head.appendChild(tempStyle);

  // Hide the action buttons for PDF export
  const actionButtons = billElement.querySelector('.print\\:hidden') as HTMLElement;
  if (actionButtons) {
    actionButtons.style.display = 'none';
  }

  // Temporarily make the element full width for capture
  const originalWidth = billElement.style.width;
  const originalMaxWidth = billElement.style.maxWidth;
  billElement.style.width = '100vw';
  billElement.style.maxWidth = 'none';
  
  // Force a reflow to ensure styles are applied
  billElement.offsetHeight;

  console.log('📸 Capturing with html2canvas...');

  // Use html2canvas to capture the element with high quality
  html2canvas(billElement, {
    scale: 1.5, // Further reduced scale to prevent width issues
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: billElement.scrollWidth, // Use scrollWidth instead of offsetWidth
    height: billElement.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    windowWidth: Math.max(window.innerWidth, billElement.scrollWidth + 100), // Extra padding
    windowHeight: window.innerHeight,
    logging: false, // Disable console logging
    removeContainer: true,
    imageTimeout: 15000,
    foreignObjectRendering: false, // Disable foreign object rendering to prevent width issues
    ignoreElements: (element) => {
      // Ignore elements that might cause oklch issues
      const htmlElement = element as HTMLElement;
      return htmlElement.classList.contains('print:hidden') || 
             htmlElement.style.display === 'none';
    },
    onclone: (clonedDoc) => {
      // Additional cleanup for oklch colors
      const allElements = clonedDoc.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Force standard colors
        if (htmlEl.style.backgroundColor && htmlEl.style.backgroundColor.includes('oklch')) {
          htmlEl.style.backgroundColor = '#ffffff';
        }
        if (htmlEl.style.color && htmlEl.style.color.includes('oklch')) {
          htmlEl.style.color = '#000000';
        }
        if (htmlEl.style.borderColor && htmlEl.style.borderColor.includes('oklch')) {
          htmlEl.style.borderColor = '#000000';
        }
      });
      
      // Ensure all styles are applied in the cloned document
      const clonedElement = clonedDoc.querySelector('.gst-bill-display');
      if (clonedElement) {
        // Make sure the element is visible and properly styled
        (clonedElement as HTMLElement).style.visibility = 'visible';
        (clonedElement as HTMLElement).style.display = 'block';
        (clonedElement as HTMLElement).style.position = 'static';
        (clonedElement as HTMLElement).style.transform = 'none';
      }
      
      // Override any oklch colors with standard hex colors
      const clonedElements = clonedDoc.querySelectorAll('*');
      clonedElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlElement);
        
        // Override background colors
        if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
          htmlElement.style.backgroundColor = '#ffffff';
        }
        
        // Override text colors
        if (computedStyle.color && computedStyle.color.includes('oklch')) {
          htmlElement.style.color = '#000000';
        }
        
        // Override border colors
        if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
          htmlElement.style.borderColor = '#000000';
        }
      });
      
      // Add comprehensive style overrides to prevent oklch color issues
      const style = clonedDoc.createElement('style');
      style.textContent = `
        /* Nuclear option: Override ALL possible oklch sources */
        *, *::before, *::after {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #000000 !important;
          outline-color: #000000 !important;
          text-shadow: none !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        
        /* Override CSS custom properties */
        :root {
          --color-primary: #2563eb !important;
          --color-secondary: #6b7280 !important;
          --color-background: #ffffff !important;
          --color-text: #000000 !important;
          --color-border: #000000 !important;
        }
        
        /* Override any computed styles */
        [style*="oklch"] {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #000000 !important;
        }
        
        /* Force override all Tailwind classes */
        /* Override all oklch colors with standard hex colors */
        * {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        
        /* Tailwind color overrides for PDF generation */
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
        
        .bg-blue-50 { background-color: #eff6ff !important; }
        .bg-blue-100 { background-color: #dbeafe !important; }
        .bg-blue-200 { background-color: #bfdbfe !important; }
        .bg-blue-300 { background-color: #93c5fd !important; }
        .bg-blue-400 { background-color: #60a5fa !important; }
        .bg-blue-500 { background-color: #3b82f6 !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
        .bg-blue-700 { background-color: #1d4ed8 !important; }
        .bg-blue-800 { background-color: #1e40af !important; }
        .bg-blue-900 { background-color: #1e3a8a !important; }
        
        .bg-red-50 { background-color: #fef2f2 !important; }
        .bg-red-100 { background-color: #fee2e2 !important; }
        .bg-red-200 { background-color: #fecaca !important; }
        .bg-red-300 { background-color: #fca5a5 !important; }
        .bg-red-400 { background-color: #f87171 !important; }
        .bg-red-500 { background-color: #ef4444 !important; }
        .bg-red-600 { background-color: #dc2626 !important; }
        .bg-red-700 { background-color: #b91c1c !important; }
        .bg-red-800 { background-color: #991b1b !important; }
        .bg-red-900 { background-color: #7f1d1d !important; }
        
        .bg-green-50 { background-color: #f0fdf4 !important; }
        .bg-green-100 { background-color: #dcfce7 !important; }
        .bg-green-200 { background-color: #bbf7d0 !important; }
        .bg-green-300 { background-color: #86efac !important; }
        .bg-green-400 { background-color: #4ade80 !important; }
        .bg-green-500 { background-color: #22c55e !important; }
        .bg-green-600 { background-color: #16a34a !important; }
        .bg-green-700 { background-color: #15803d !important; }
        .bg-green-800 { background-color: #166534 !important; }
        .bg-green-900 { background-color: #14532d !important; }
        
        /* Text color overrides */
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
        
        .text-blue-600 { color: #2563eb !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-green-600 { color: #16a34a !important; }
        
        /* Border color overrides */
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .border-gray-400 { border-color: #9ca3af !important; }
        .border-gray-500 { border-color: #6b7280 !important; }
        .border-gray-600 { border-color: #4b5563 !important; }
        .border-gray-700 { border-color: #374151 !important; }
        .border-gray-800 { border-color: #1f2937 !important; }
        .border-gray-900 { border-color: #111827 !important; }
        
        .border-blue-600 { border-color: #2563eb !important; }
        .border-red-600 { border-color: #dc2626 !important; }
        .border-green-600 { border-color: #16a34a !important; }
        
        /* Table specific styles */
        table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        table th {
          background: #f3f4f6 !important;
          font-weight: bold !important;
          border: 1px solid #000 !important;
        }
        
        table td {
          border: 1px solid #000 !important;
        }
        
        table tr:nth-child(even) {
          background: #f9fafb !important;
        }
        
        table tr:nth-child(odd) {
          background: #ffffff !important;
        }
        
        /* Ensure all elements are visible */
        .gst-bill-display {
          background: white !important;
          color: black !important;
          box-shadow: none !important;
          border: 1px solid #000 !important;
          max-width: none !important;
          margin: 0 !important;
        }
        
        /* Override any remaining oklch colors */
        [style*="oklch"] {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #000000 !important;
        }
      `;
      clonedDoc.head.appendChild(style);
    }
  }).then((canvas) => {
    console.log('✅ Canvas captured successfully!', {
      width: canvas.width,
      height: canvas.height,
      aspectRatio: canvas.width / canvas.height
    });

    // Clean up temporary style and class
    const tempStyle = document.getElementById('pdf-export-override');
    if (tempStyle) {
      tempStyle.remove();
    }
    
    // Remove PDF export class
    billElement.classList.remove('pdf-export-mode');

    // Restore original width settings
    billElement.style.width = originalWidth;
    billElement.style.maxWidth = originalMaxWidth;

    // Restore action buttons
    if (actionButtons) {
      actionButtons.style.display = '';
    }

    const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
    
    // Create PDF with A4 PORTRAIT dimensions
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait
    const pageWidth = pdf.internal.pageSize.width; // 210mm in portrait
    const pageHeight = pdf.internal.pageSize.height; // 297mm in portrait
    
    console.log('📄 PDF page dimensions:', {
      pageWidth: pageWidth + 'mm',
      pageHeight: pageHeight + 'mm'
    });
    
    // Calculate image dimensions to fit page width while maintaining aspect ratio
    const imgWidth = pageWidth - 5; // Minimal margin for portrait
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    console.log('📏 Calculated image dimensions:', {
      imgWidth: imgWidth + 'mm',
      imgHeight: imgHeight + 'mm',
      aspectRatio: imgWidth / imgHeight
    });
    
    // Ensure the image fits within the page width
    const maxWidth = pageWidth - 5;
    const maxHeight = pageHeight - 5;
    
    let finalImgWidth = imgWidth;
    let finalImgHeight = imgHeight;
    
    // If image is too wide, scale it down
    if (finalImgWidth > maxWidth) {
      const scale = maxWidth / finalImgWidth;
      finalImgWidth = maxWidth;
      finalImgHeight = finalImgHeight * scale;
      console.log('⚠️ Image too wide, scaled down by factor:', scale);
    }
    
    // If image is too tall, scale it down
    if (finalImgHeight > maxHeight) {
      const scale = maxHeight / finalImgHeight;
      finalImgHeight = maxHeight;
      finalImgWidth = finalImgWidth * scale;
      console.log('⚠️ Image too tall, scaled down by factor:', scale);
    }
    
    console.log('📐 Final image dimensions:', {
      finalImgWidth: finalImgWidth + 'mm',
      finalImgHeight: finalImgHeight + 'mm',
      fitsInOnePage: finalImgHeight <= pageHeight - 10
    });
    
    // If the image fits on one page, add it directly
    if (finalImgHeight <= pageHeight - 10) {
      pdf.addImage(imgData, 'PNG', 2.5, 2.5, finalImgWidth, finalImgHeight);
      console.log('✅ Added image to single page');
    } else {
      // If image is too tall, split it across multiple pages
      const totalPages = Math.ceil(finalImgHeight / (pageHeight - 10));
      const pageImgHeight = (pageHeight - 10) / totalPages;
      
      console.log('📄 Splitting across pages:', totalPages);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const sourceY = (canvas.height / totalPages) * i;
        const sourceHeight = canvas.height / totalPages;
        
        // Create a temporary canvas for this page
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(pageImgData, 'PNG', 2.5, 2.5, finalImgWidth, pageImgHeight);
        }
      }
    }
    
    // Add document properties
    pdf.setProperties({
      title: `GST Invoice ${bill.billDetails.invoiceNo}`,
      subject: 'GST Tax Invoice',
      author: bill.billDetails.companyName,
      keywords: 'GST, Invoice, Tax',
      creator: 'GST Bill Generator'
    });
    
    // Save the PDF
    const filename = `GST_Invoice_${bill.billDetails.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}_${bill.billDetails.billedToName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(filename);
    
    console.log('💾 PDF saved as:', filename);
    
    // Create a preview image for testing
    const previewImg = document.createElement('img');
    previewImg.src = imgData;
    previewImg.style.maxWidth = '100%';
    previewImg.style.height = 'auto';
    previewImg.style.border = '2px solid #ccc';
    previewImg.style.margin = '10px';
    previewImg.style.display = 'block';
    
    // Add title to preview
    const previewTitle = document.createElement('h3');
    previewTitle.textContent = 'PDF Preview (What will be exported)';
    previewTitle.style.margin = '10px 0 5px 0';
    previewTitle.style.color = '#333';
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.style.position = 'fixed';
    previewContainer.style.top = '20px';
    previewContainer.style.right = '20px';
    previewContainer.style.width = '400px';
    previewContainer.style.maxHeight = '80vh';
    previewContainer.style.overflow = 'auto';
    previewContainer.style.backgroundColor = 'white';
    previewContainer.style.padding = '10px';
    previewContainer.style.border = '2px solid #007bff';
    previewContainer.style.borderRadius = '8px';
    previewContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    previewContainer.style.zIndex = '9999';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close Preview';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.background = '#dc3545';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.padding = '5px 10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => previewContainer.remove();
    
    previewContainer.appendChild(closeBtn);
    previewContainer.appendChild(previewTitle);
    previewContainer.appendChild(previewImg);
    
    // Add to page
    document.body.appendChild(previewContainer);
    
    console.log('🖼️ Preview image added to page');
    
  }).catch((error) => {
    console.error('❌ Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
    
    // Clean up on error
    const tempStyle = document.getElementById('pdf-export-override');
    if (tempStyle) {
      tempStyle.remove();
    }
    
    billElement.classList.remove('pdf-export-mode');
    billElement.style.width = originalWidth;
    billElement.style.maxWidth = originalMaxWidth;
    
    if (actionButtons) {
      actionButtons.style.display = '';
    }
  });
}
