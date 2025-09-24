const { jsPDF } = require('jspdf');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, 'pdf-test-output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function testPdfExport() {
  console.log('🧪 Starting PDF export test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the GST bill page (you'll need to adjust this URL)
    console.log('📱 Navigating to GST bill page...');
    await page.goto('http://localhost:3000/gst-bills', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if there are any bills, if not create one
    const hasBills = await page.$('.gst-bill-item');
    if (!hasBills) {
      console.log('📝 No bills found, creating a test bill...');
      await page.click('button:contains("नया GST बिल बनाएं")');
      await page.waitForTimeout(3000);
      
      // Fill in some test data
      await page.type('input[placeholder*="Company Name"]', 'ASHAPURA CONSTRUCTIONS');
      await page.type('input[placeholder*="Invoice No"]', 'TEST-001');
      await page.type('input[placeholder*="Billed to"]', 'Test Customer');
      
      // Add a test item
      await page.type('input[placeholder*="Description"]', 'cement');
      await page.type('input[placeholder*="Quantity"]', '1.00');
      await page.type('input[placeholder*="Rate"]', '23.00');
      await page.type('input[placeholder*="Tax Rate"]', '9.00');
      
      // Click add item button
      await page.click('button:contains("Add Item")');
      await page.waitForTimeout(1000);
      
      // Save the bill
      await page.click('button:contains("Save Bill")');
      await page.waitForTimeout(2000);
    }
    
    // Navigate to a bill view page
    console.log('🔍 Finding a bill to test...');
    const billLink = await page.$('a[href*="/gst-bill/"]');
    if (billLink) {
      await billLink.click();
      await page.waitForTimeout(2000);
    } else {
      throw new Error('No bills found to test');
    }
    
    // Wait for the bill display to load
    await page.waitForSelector('.gst-bill-display');
    
    console.log('📸 Capturing bill element...');
    
    // Get the bill element dimensions
    const elementInfo = await page.evaluate(() => {
      const element = document.querySelector('.gst-bill-display');
      if (!element) return null;
      
      return {
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight
      };
    });
    
    console.log('📏 Element dimensions:', elementInfo);
    
    // Capture the bill element as image
    const billElement = await page.$('.gst-bill-display');
    const screenshot = await billElement.screenshot({
      type: 'png',
      quality: 100
    });
    
    // Save the screenshot
    const screenshotPath = path.join(outputDir, 'bill-screenshot.png');
    fs.writeFileSync(screenshotPath, screenshot);
    console.log('💾 Screenshot saved to:', screenshotPath);
    
    // Also capture the full page for comparison
    const fullPageScreenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      quality: 100
    });
    
    const fullPagePath = path.join(outputDir, 'full-page-screenshot.png');
    fs.writeFileSync(fullPagePath, fullPageScreenshot);
    console.log('💾 Full page screenshot saved to:', fullPagePath);
    
    // Now test the PDF generation
    console.log('📄 Testing PDF generation...');
    
    const pdfResult = await page.evaluate(async () => {
      // Import the PDF export function (this will need to be available in the page)
      if (typeof exportGSTBillToPDFFallback === 'undefined') {
        throw new Error('PDF export function not available');
      }
      
      // Get the bill data
      const billElement = document.querySelector('.gst-bill-display');
      if (!billElement) {
        throw new Error('Bill element not found');
      }
      
      // Mock bill data for testing
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
          }
        ],
        totals: {
          totalQuantity: 1.00,
          totalTaxableAmount: 23.00,
          totalCGSTAmount: 1.03,
          totalSGSTAmount: 1.03,
          totalTaxAmount: 2.06,
          bsrDeduction: 0.41,
          finalAmount: 24.65
        },
        taxSummary: [
          {
            taxRate: 9.00,
            taxableAmount: 23.00,
            cgstAmount: 1.03,
            sgstAmount: 1.03,
            totalTaxAmount: 2.06
          }
        ]
      };
      
      // Call the PDF export function
      exportGSTBillToPDFFallback(mockBill);
      
      return { success: true };
    });
    
    console.log('✅ PDF generation test completed');
    
  } catch (error) {
    console.error('❌ Error during PDF test:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testPdfExport().then(() => {
  console.log('🎉 PDF export test completed!');
  console.log('📁 Check the output folder:', outputDir);
}).catch(console.error);
