// Quick Test Setup Script
// Run this in browser console to automatically populate test data

const testData = {
  basicTest: [
    { name: 'सीमेंट', rate: 360, quantity: 50, decimal: true },
    { name: 'बजरी', rate: 1025, quantity: 8.5, decimal: true },
    { name: 'मिक्चर', rate: 930, quantity: 1, decimal: false },
    { name: 'पानी', rate: 650, quantity: 3, decimal: false }
  ],
  
  largeProject: [
    { name: 'सीमेंट', rate: 360, quantity: 196, decimal: true },
    { name: 'बजरी', rate: 1025, quantity: 15.25, decimal: true },
    { name: '40 एमएम कंक्रीट', rate: 880, quantity: 4.86, decimal: true },
    { name: '20 एमएम कंक्रीट', rate: 1050, quantity: 17.06, decimal: true },
    { name: 'मिक्चर', rate: 930, quantity: 1, decimal: false },
    { name: 'वाइब्रेटर', rate: 770, quantity: 1, decimal: false },
    { name: 'पानी', rate: 650, quantity: 5, decimal: true },
    { name: 'स्टील पट्टी', rate: 1275, quantity: 20.54, decimal: true }
  ],
  
  simpleTest: [
    { name: 'ईंट', rate: 8, quantity: 1000, decimal: false },
    { name: 'रेत', rate: 45, quantity: 20, decimal: true },
    { name: 'पत्थर', rate: 55, quantity: 15, decimal: true }
  ]
};

function fillTestData(testType = 'basicTest') {
  const data = testData[testType];
  console.log(`Loading ${testType} test data...`);
  
  data.forEach((item, index) => {
    setTimeout(() => {
      // Fill item name
      const nameInput = document.querySelector('input[placeholder="वस्तु का नाम दर्ज करें"]');
      if (nameInput) {
        nameInput.value = item.name;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Fill rate
      const rateInput = document.querySelector('input[placeholder="दर दर्ज करें"]');
      if (rateInput) {
        rateInput.value = item.rate.toString();
        rateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Fill quantity
      const quantityInput = document.querySelector('input[placeholder="मात्रा दर्ज करें"]');
      if (quantityInput) {
        quantityInput.value = item.quantity.toString();
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Set decimal option
      const decimalRadios = document.querySelectorAll('input[type="radio"][value="' + (item.decimal ? 'yes' : 'no') + '"]');
      if (decimalRadios.length > 0) {
        decimalRadios[0].checked = true;
        decimalRadios[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Click add button
      setTimeout(() => {
        const addButton = document.querySelector('button:has(svg)');
        if (addButton) {
          addButton.click();
        }
      }, 100);
      
    }, index * 500);
  });
  
  console.log(`Test data will be loaded in ${data.length * 0.5} seconds`);
}

// Usage:
// fillTestData('basicTest')     - For basic test
// fillTestData('largeProject')  - For large project test  
// fillTestData('simpleTest')    - For simple test

console.log('Test data script loaded!');
console.log('Available tests: basicTest, largeProject, simpleTest');
console.log('Usage: fillTestData("basicTest")');
