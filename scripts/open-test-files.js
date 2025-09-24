const { exec } = require('child_process');
const path = require('path');

const outputDir = path.join(__dirname, 'pdf-test-output');

console.log('🌐 Opening test files in browser...');

// Open HTML file
const htmlPath = path.join(outputDir, 'bill-preview.html');
console.log('📄 Opening HTML preview:', htmlPath);

// Try to open with default browser
const command = process.platform === 'win32' ? 'start' : 
                process.platform === 'darwin' ? 'open' : 'xdg-open';

exec(`${command} "${htmlPath}"`, (error) => {
  if (error) {
    console.log('❌ Could not open HTML file automatically');
    console.log('📋 Please manually open:', htmlPath);
  } else {
    console.log('✅ HTML file opened in browser');
  }
});

// Also try to open the PDF
const pdfPath = path.join(outputDir, 'bill-test.pdf');
console.log('📄 Opening PDF file:', pdfPath);

setTimeout(() => {
  exec(`${command} "${pdfPath}"`, (error) => {
    if (error) {
      console.log('❌ Could not open PDF file automatically');
      console.log('📋 Please manually open:', pdfPath);
    } else {
      console.log('✅ PDF file opened in browser');
    }
  });
}, 1000);

console.log('\n📋 Analysis Instructions:');
console.log('1. Compare the HTML preview with the PDF output');
console.log('2. Check if the table columns are being cut off');
console.log('3. Look for width issues in the PDF');
console.log('4. Note any differences in layout or content');
