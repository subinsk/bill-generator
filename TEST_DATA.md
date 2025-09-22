# बिल जेनरेटर टेस्ट डेटा

## Test Case 1: Basic Construction Materials (मिश्रित वस्तुएं)

### Items to Add:
1. **सीमेंट**
   - दर: 360
   - मात्रा: 50
   - दशमलव: हाँ

2. **बजरी**
   - दर: 1025
   - मात्रा: 8.5
   - दशमलव: हाँ

3. **मिक्चर**
   - दर: 930
   - मात्रा: 1
   - दशमलव: नहीं

4. **पानी**
   - दर: 650
   - मात्रा: 3
   - दशमलव: नहीं

### Expected Total: ₹37,665.00

### Expected Distribution:
- **60% Bill**: ₹22,599.00
- **30% Bill**: ₹11,299.50  
- **10% Bill**: ₹3,766.50

---

## Test Case 2: Large Construction Project (बड़ा प्रोजेक्ट)

### Items to Add:
1. **सीमेंट**
   - दर: 360
   - मात्रा: 196
   - दशमलव: हाँ

2. **बजरी**
   - दर: 1025
   - मात्रा: 15.25
   - दशमलव: हाँ

3. **40 एमएम कंक्रीट**
   - दर: 880
   - मात्रा: 4.86
   - दशमलव: हाँ

4. **20 एमएम कंक्रीट**
   - दर: 1050
   - मात्रा: 17.06
   - दशमलव: हाँ

5. **मिक्चर**
   - दर: 930
   - मात्रा: 1
   - दशमलव: नहीं

6. **वाइब्रेटर**
   - दर: 770
   - मात्रा: 1
   - दशमलव: नहीं

7. **पानी**
   - दर: 650
   - मात्रा: 5
   - दशमलव: हाँ

8. **स्टील पट्टी**
   - दर: 1275
   - मात्रा: 20.54
   - दशमलव: हाँ

### Expected Total: ₹1,89,790.00

### Expected Distribution:
- **60% Bill**: ₹1,13,874.00
- **30% Bill**: ₹56,937.00
- **10% Bill**: ₹18,979.00

---

## Test Case 3: Simple Materials Only (केवल सरल वस्तुएं)

### Items to Add:
1. **ईंट**
   - दर: 8
   - मात्रा: 1000
   - दशमलव: नहीं

2. **रेत**
   - दर: 45
   - मात्रा: 20
   - दशमलव: हाँ

3. **पत्थर**
   - दर: 55
   - मात्रा: 15
   - दशमलव: हाँ

### Expected Total: ₹9,625.00

### Expected Distribution:
- **60% Bill**: ₹5,775.00
- **30% Bill**: ₹2,887.50
- **10% Bill**: ₹962.50

---

## How to Test:

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Open Browser**
   - Go to http://localhost:3000

3. **Test Each Case**
   - Enter the items one by one
   - Verify the total calculation
   - Click "बिल जेनरेट करें"
   - Check the distribution percentages
   - Test Excel download functionality
   - Verify print functionality

4. **Expected Results**
   - Bills should be distributed exactly as 60%, 30%, 10%
   - Excel file should download as `.xlsx` format
   - All Hindi text should display correctly
   - Decimal items should allow fractional quantities
   - Non-decimal items should only accept whole numbers

---

## Features to Verify:

✅ **UI Elements**
- Clean, professional design
- Proper Hindi text display
- Icons instead of emojis
- Subtle color scheme

✅ **Functionality**
- Automatic rate suggestions for known items
- Decimal/non-decimal toggle works correctly
- Distribution algorithm maintains 60/30/10 ratio
- Excel export creates proper .xlsx file
- Print functionality works

✅ **Data Validation**
- Only numeric input accepted for rates and quantities
- Form validation prevents empty submissions
- Error messages display in Hindi

✅ **Distribution Logic**
- Total amounts match exactly
- Percentages are properly maintained
- Decimal adjustments work as expected

---

## Troubleshooting:

**If Excel download doesn't work:**
- Check if xlsx library is installed: `npm list xlsx`
- Ensure browser allows file downloads
- Try different browsers (Chrome, Firefox, Edge)

**If totals don't match:**
- Check decimal precision in calculations
- Verify distribution algorithm is working correctly
- Ensure all items are being included in calculations

**If Hindi text doesn't display:**
- Check browser font settings
- Ensure UTF-8 encoding is enabled
- Try refreshing the page
