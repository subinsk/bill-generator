# Percentage Limit Validation Test

## Validation Rule:
**Each bill's total (both quantity and amount) must never exceed its designated percentage of the overall total.**

## Test Case: Mixed Items with Potential Overflow

### Input Items:
1. **सीमेंट** (High value, decimal allowed)
   - दर: 360
   - मात्रा: 10
   - दशमलव: हाँ
   - Total: ₹3,600

2. **पानी** (Low value, whole numbers, smart distribution)
   - दर: 650  
   - मात्रा: 5
   - दशमलव: नहीं
   - Total: ₹3,250

3. **मिक्चर** (Medium value, single item)
   - दर: 930
   - मात्रा: 1  
   - दशमलव: नहीं
   - Total: ₹930

**Overall Total: ₹7,780**

### Expected Maximum Limits:
- **60% Bill Max**: ₹4,668.00
- **30% Bill Max**: ₹2,334.00  
- **10% Bill Max**: ₹778.00

### Before Validation (Potential Issue):
**सीमेंट** (Normal Distribution):
- 60%: 6.0 × 360 = ₹2,160
- 30%: 3.0 × 360 = ₹1,080
- 10%: 1.0 × 360 = ₹360

**पानी** (Smart Distribution - qty=5):
- 60%: 3 × 650 = ₹1,950  
- 30%: 1 × 650 = ₹650
- 10%: 1 × 650 = ₹650

**मिक्चर** (Smart Distribution - qty=1):
- 60%: 0 × 930 = ₹0
- 30%: 0 × 930 = ₹0
- 10%: 1 × 930 = ₹930

**Totals Before Validation:**
- 60% Bill: ₹2,160 + ₹1,950 + ₹0 = **₹4,110** ✅ (Under ₹4,668 limit)
- 30% Bill: ₹1,080 + ₹650 + ₹0 = **₹1,730** ✅ (Under ₹2,334 limit)  
- 10% Bill: ₹360 + ₹650 + ₹930 = **₹1,940** ❌ (Exceeds ₹778 limit!)

### After Validation (Corrected):
The system detects that 10% bill exceeds its limit by ₹1,162 and will:

1. **Identify excess**: ₹1,940 - ₹778 = ₹1,162
2. **Smart adjustment**: Reduce items intelligently
   - Move 1 पानी from 10% to 30% (if 30% has capacity)
   - Or reduce decimal quantities proportionally
   - Or reduce largest whole items first

**Expected Corrected Result:**
- 60% Bill: **≤ ₹4,668** ✅
- 30% Bill: **≤ ₹2,334** ✅  
- 10% Bill: **≤ ₹778** ✅

## Features of the Validation System:

### 1. **Automatic Detection**
- Calculates expected maximums: `originalTotal × percentage`
- Compares actual totals against limits
- Triggers adjustment if exceeded

### 2. **Smart Adjustment Strategy**
- **Priority 1**: Adjust decimal items proportionally
- **Priority 2**: Move whole items between bills
- **Priority 3**: Reduce largest value items first

### 3. **Preservation Logic**
- Maintains total quantity accuracy
- Preserves smart distribution rules where possible
- Minimizes impact on user's intended quantities

### 4. **Validation Tolerance**
- Allows small rounding differences (±₹0.01)
- Accounts for floating-point precision issues
- Maintains mathematical accuracy

## Expected Behavior:

✅ **Normal cases**: No adjustment needed  
✅ **Small overflows**: Automatic proportional adjustment  
✅ **Large overflows**: Smart item redistribution  
✅ **Edge cases**: Graceful handling with minimal impact  

The system ensures that **no bill ever exceeds its designated percentage limit** while maintaining calculation accuracy and smart distribution logic! 🎯
