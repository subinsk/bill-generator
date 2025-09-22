# स्मार्ट डिस्ट्रिब्यूशन टेस्ट केसेस

## Smart Distribution Logic Testing

### Test Case 1: Single Quantity Items (मात्रा = 1)
**Rule**: Single item goes to 10% bill only

**Test Item**: पानी
- दर: 650
- मात्रा: 1
- दशमलव: नहीं

**Expected Distribution**:
- 60% Bill: 0 quantity, ₹0
- 30% Bill: 0 quantity, ₹0  
- 10% Bill: 1 quantity, ₹650

---

### Test Case 2: Two Quantity Items (मात्रा = 2)
**Rule**: 1 item in 30%, 1 item in 10%

**Test Item**: मिक्चर
- दर: 930
- मात्रा: 2
- दशमलव: नहीं

**Expected Distribution**:
- 60% Bill: 0 quantity, ₹0
- 30% Bill: 1 quantity, ₹930
- 10% Bill: 1 quantity, ₹930

---

### Test Case 3: Three Quantity Items (मात्रा = 3)
**Rule**: 1 item in each bill

**Test Item**: पानी
- दर: 650
- मात्रा: 3
- दशमलव: नहीं

**Expected Distribution**:
- 60% Bill: 1 quantity, ₹650
- 30% Bill: 1 quantity, ₹650
- 10% Bill: 1 quantity, ₹650

---

### Test Case 4: Five Quantity Items (मात्रा = 5)
**Rule**: 3 in 60%, 1 in 30%, 1 in 10%

**Test Item**: पानी
- दर: 650
- मात्रा: 5
- दशमलव: नहीं

**Expected Distribution**:
- 60% Bill: 3 quantity, ₹1,950
- 30% Bill: 1 quantity, ₹650
- 10% Bill: 1 quantity, ₹650

---

### Test Case 5: Mixed Items with Smart Distribution

**Items to Add**:
1. **सीमेंट** (Decimal allowed - normal percentage distribution)
   - दर: 360
   - मात्रा: 50
   - दशमलव: हाँ

2. **पानी** (Smart distribution for qty=1)
   - दर: 650
   - मात्रा: 1
   - दशमलव: नहीं

3. **मिक्चर** (Smart distribution for qty=5)
   - दर: 930
   - मात्रा: 5
   - दशमलव: नहीं

**Expected Results**:

**सीमेंट** (Normal Distribution):
- 60%: 30.0 qty, ₹10,800
- 30%: 15.0 qty, ₹5,400
- 10%: 5.0 qty, ₹1,800

**पानी** (Smart Distribution - qty=1):
- 60%: 0 qty, ₹0
- 30%: 0 qty, ₹0
- 10%: 1 qty, ₹650

**मिक्चर** (Smart Distribution - qty=5):
- 60%: 3 qty, ₹2,790
- 30%: 1 qty, ₹930
- 10%: 1 qty, ₹930

**Total Distribution**:
- 60% Bill: ₹13,590 (30×360 + 0×650 + 3×930)
- 30% Bill: ₹6,330 (15×360 + 0×650 + 1×930)
- 10% Bill: ₹3,380 (5×360 + 1×650 + 1×930)

---

## Key Features to Verify:

✅ **Smart Distribution**
- Single quantities go to 10% only
- Small quantities (2-5) distributed intelligently
- Large quantities use normal percentage distribution

✅ **UI Improvements**
- No voucher (बाउचर नं) column
- Trash icon instead of X for delete
- Beautiful pill design for decimal toggle
- Red error highlighting for invalid inputs

✅ **Input Validation**
- Only numbers allowed in rate and quantity
- Real-time error messages in Hindi
- Form validation prevents invalid submissions

✅ **Excel Export**
- Proper .xlsx file generation
- No voucher column in export
- Correct smart distribution reflected

---

## How to Test:

1. **Start Application**: `npm run dev`
2. **Add Test Items**: Use the test cases above
3. **Verify Smart Logic**: Check quantity distribution matches expectations
4. **Test Validation**: Try entering letters in number fields
5. **Export Excel**: Download and verify smart distribution in Excel
6. **Print Test**: Use print functionality

## Validation Rules:

- ❌ Letters in दर or मात्रा fields
- ❌ Empty required fields  
- ❌ Negative numbers
- ✅ Decimal numbers (when allowed)
- ✅ Whole numbers for non-decimal items
- ✅ Auto-suggestion for known items
