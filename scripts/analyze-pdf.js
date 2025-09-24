const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const outputDir = path.join(__dirname, 'pdf-test-output');

console.log('🔍 Analyzing PDF output...');

// Check if files exist
const files = [
  'bill-preview.html',
  'bill-test.pdf',
  'bill-test-base64.txt'
];

files.forEach(file => {
  const filePath = path.join(outputDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file}: ${stats.size} bytes`);
  } else {
    console.log(`❌ ${file}: Not found`);
  }
});

// Try to convert PDF to image using ImageMagick (if available)
const pdfPath = path.join(outputDir, 'bill-test.pdf');
const imagePath = path.join(outputDir, 'bill-test-image.png');

console.log('🖼️ Converting PDF to image...');

exec(`magick "${pdfPath}" "${imagePath}"`, (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️ ImageMagick not available, trying alternative method...');
    
    // Try with pdftoppm if available
    exec(`pdftoppm -png -singlefile "${pdfPath}" "${path.join(outputDir, 'bill-test')}"`, (error2, stdout2, stderr2) => {
      if (error2) {
        console.log('⚠️ pdftoppm not available either');
        console.log('📋 Manual analysis needed:');
        console.log('  1. Open bill-preview.html in browser to see expected layout');
        console.log('  2. Open bill-test.pdf to see actual PDF output');
        console.log('  3. Compare the two to identify issues');
      } else {
        console.log('✅ PDF converted to image using pdftoppm');
        console.log('🖼️ Image saved as:', path.join(outputDir, 'bill-test-1.png'));
      }
    });
  } else {
    console.log('✅ PDF converted to image using ImageMagick');
    console.log('🖼️ Image saved as:', imagePath);
  }
});

// Analyze the table width issue
console.log('\n📊 Table Width Analysis:');
console.log('Expected table width: 169mm');
console.log('A4 page width: 210mm');
console.log('Available space: 41mm margin (should be enough)');
console.log('Issue: Table might be getting cut off due to:');
console.log('  1. Font size too large for columns');
console.log('  2. Column widths not optimized');
console.log('  3. html2canvas capture width issues');
console.log('  4. PDF scaling problems');

// Check the base64 content
const base64Path = path.join(outputDir, 'bill-test-base64.txt');
if (fs.existsSync(base64Path)) {
  const base64Content = fs.readFileSync(base64Path, 'utf8');
  console.log('\n📄 PDF Base64 length:', base64Content.length);
  console.log('📄 PDF Base64 preview:', base64Content.substring(0, 100) + '...');
}
