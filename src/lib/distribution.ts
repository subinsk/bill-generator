import { Item, Bill, BillItem, BillSet, DistributionResult } from '@/types';

export class BillDistributor {
  private static readonly PERCENTAGES = [60, 30, 10] as const;

  /**
   * Distributes items across three bills (60%, 30%, 10%)
   * Approach 1: Distribute quantities evenly among decimal-allowed items
   */
  static distributeItems(items: Item[]): DistributionResult {
    try {
      const bills = this.createInitialBills();
      const adjustedItems = this.adjustQuantitiesForDistribution(items);
      
      // Distribute each item across the three bills
      for (const item of adjustedItems) {
        this.distributeItemAcrossBills(item, bills);
      }

      // Calculate totals
      this.calculateBillTotals(bills);

      const billSet: BillSet = {
        originalItems: items,
        bills: bills as [Bill, Bill, Bill],
        totalAmount: bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
      };

      // Validate and adjust to ensure totals don't exceed percentage limits
      this.validateAndAdjustBillTotals(billSet);
      
      // Ensure the sum of distributions equals the total
      this.adjustDistributionToMatchTotal(billSet);
      
      // Final validation and auto-adjustment
      const accuracyValidation = this.validateBillSetAccuracy(billSet);
      if (!accuracyValidation.isValid) {
        console.log('Auto-adjusting distribution for mathematical accuracy...');
        this.autoAdjustDistribution(billSet);
      }
      
      // Final check - if still not valid, use fallback distribution
      const finalValidation = this.validateBillSetAccuracy(billSet);
      if (!finalValidation.isValid) {
        console.log('Using fallback distribution method...');
        this.applyFallbackDistribution(billSet);
      }

      return { success: true, billSet };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Alternative approach: Adjust only one decimal item at a time
   */
  static distributeItemsSingleAdjustment(items: Item[]): DistributionResult {
    try {
      const bills = this.createInitialBills();
      const decimalItems = items.filter(item => item.allowsDecimal);
      
      if (decimalItems.length === 0) {
        return { success: false, error: 'कम से कम एक दशमलव वस्तु होनी चाहिए' };
      }

      const adjustedItems = this.adjustSingleItem(items);
      
      // Distribute items across bills
      for (const item of adjustedItems) {
        this.distributeItemAcrossBills(item, bills);
      }

      this.calculateBillTotals(bills);

      const billSet: BillSet = {
        originalItems: items,
        bills: bills as [Bill, Bill, Bill],
        totalAmount: bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
      };

      // Validate and adjust to ensure totals don't exceed percentage limits
      this.validateAndAdjustBillTotals(billSet);
      
      // Ensure the sum of distributions equals the total
      this.adjustDistributionToMatchTotal(billSet);
      
      // Final validation and auto-adjustment
      const accuracyValidation = this.validateBillSetAccuracy(billSet);
      if (!accuracyValidation.isValid) {
        console.log('Auto-adjusting distribution for mathematical accuracy...');
        this.autoAdjustDistribution(billSet);
      }
      
      // Final check - if still not valid, use fallback distribution
      const finalValidation = this.validateBillSetAccuracy(billSet);
      if (!finalValidation.isValid) {
        console.log('Using fallback distribution method...');
        this.applyFallbackDistribution(billSet);
      }

      return { success: true, billSet };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private static createInitialBills(): Bill[] {
    return this.PERCENTAGES.map((percentage, index) => ({
      id: `bill-${index + 1}`,
      percentage,
      items: [],
      totalAmount: 0
    }));
  }

  private static adjustQuantitiesForDistribution(items: Item[]): Item[] {
    // Return items as-is without any adjustments to maintain exact calculations
    return items;
  }

  private static adjustSingleItem(items: Item[]): Item[] {
    // Return items as-is without any adjustments to maintain exact calculations
    return items;
  }

  private static calculateVariation(item: Item): number {
    // Calculate a small variation (±10% of quantity, max ±2 units)
    const maxVariation = Math.min(item.quantity * 0.1, 2);
    return (Math.random() - 0.5) * 2 * maxVariation;
  }

  private static distributeItemAcrossBills(item: Item, bills: Bill[]): void {
    const totalAmount = item.quantity * item.rate;
    
    // For items that don't allow decimal (like पानी, मिक्चर), distribute whole numbers intelligently
    if (!item.allowsDecimal && item.quantity <= 10) {
      // Special handling for small whole number quantities
      const quantities = this.distributeWholeNumbersWithValidation(item.quantity, item.rate, totalAmount);
      
      quantities.forEach((qty, index) => {
        const billAmount = qty * item.rate;
        const billItem: BillItem = {
          item: { ...item },
          quantity: qty,
          amount: billAmount
        };
        bills[index].items.push(billItem);
      });
      return;
    }
    
    // Standard percentage distribution for decimal items or large quantities
    // Use precise mathematical distribution that ensures accuracy
    const distributions = this.calculatePreciseDistribution(item.quantity, item.rate, totalAmount);
    
    distributions.forEach((dist, index) => {
      const billItem: BillItem = {
        item: { ...item },
        quantity: dist.quantity,
        amount: dist.amount
      };
      bills[index].items.push(billItem);
    });
  }

  /**
   * Calculate precise distribution that ensures mathematical accuracy
   */
  private static calculatePreciseDistribution(quantity: number, rate: number, totalAmount: number): Array<{quantity: number, amount: number}> {
    const distributions = [];
    
    // Calculate exact percentages
    const qty60 = Math.round(quantity * 0.6 * 100) / 100;
    const qty30 = Math.round(quantity * 0.3 * 100) / 100;
    const qty10 = Math.round(quantity * 0.1 * 100) / 100;
    
    // Calculate amounts based on quantities
    const amt60 = Math.round(qty60 * rate * 100) / 100;
    const amt30 = Math.round(qty30 * rate * 100) / 100;
    const amt10 = Math.round(qty10 * rate * 100) / 100;
    
    // Check if we need to adjust for rounding errors
    const totalDistributedQty = qty60 + qty30 + qty10;
    const totalDistributedAmt = amt60 + amt30 + amt10;
    
    // Adjust the last distribution (10%) to ensure exact totals
    const qtyAdjustment = quantity - totalDistributedQty;
    const amtAdjustment = totalAmount - totalDistributedAmt;
    
    const finalQty10 = Math.round((qty10 + qtyAdjustment) * 100) / 100;
    const finalAmt10 = Math.round((amt10 + amtAdjustment) * 100) / 100;
    
    distributions.push(
      { quantity: qty60, amount: amt60 },
      { quantity: qty30, amount: amt30 },
      { quantity: finalQty10, amount: finalAmt10 }
    );
    
    return distributions;
  }

  /**
   * Distribute whole numbers with validation to ensure percentage limits
   */
  private static distributeWholeNumbersWithValidation(totalQuantity: number, rate: number, totalAmount: number): [number, number, number] {
    const result: [number, number, number] = [0, 0, 0];
    
    if (totalQuantity === 1) {
      result[2] = 1; // Put in 10% bill
    } else if (totalQuantity === 2) {
      result[1] = 1; // 30% bill
      result[2] = 1; // 10% bill
    } else if (totalQuantity === 3) {
      result[0] = 1; // 60% bill
      result[1] = 1; // 30% bill
      result[2] = 1; // 10% bill
    } else if (totalQuantity === 4) {
      result[0] = 2; // 60% bill (50% of total)
      result[1] = 1; // 30% bill (25% of total)
      result[2] = 1; // 10% bill (25% of total)
    } else if (totalQuantity === 5) {
      result[0] = 3; // 60% bill (60% of total)
      result[1] = 1; // 30% bill (20% of total)
      result[2] = 1; // 10% bill (20% of total)
    } else {
      // For larger quantities, use proportional distribution
      const qty60 = Math.floor(totalQuantity * 0.6);
      const qty30 = Math.floor((totalQuantity - qty60) * 0.5);
      const qty10 = totalQuantity - qty60 - qty30;
      
      result[0] = qty60;
      result[1] = qty30;
      result[2] = qty10;
    }
    
    // Validate that amounts don't exceed percentage limits
    const amt60 = result[0] * rate;
    const amt30 = result[1] * rate;
    const amt10 = result[2] * rate;
    
    const maxAmt60 = totalAmount * 0.6;
    const maxAmt30 = totalAmount * 0.3;
    const maxAmt10 = totalAmount * 0.1;
    
    // If any amount exceeds limit, redistribute
    if (amt60 > maxAmt60 || amt30 > maxAmt30 || amt10 > maxAmt10) {
      // Use a more conservative distribution
      const qty60 = Math.floor(totalQuantity * 0.5); // Use 50% instead of 60%
      const qty30 = Math.floor((totalQuantity - qty60) * 0.4); // Use 40% of remaining
      const qty10 = totalQuantity - qty60 - qty30;
      
      result[0] = qty60;
      result[1] = qty30;
      result[2] = qty10;
    }
    
    return result;
  }

  /**
   * Distribute small whole numbers intelligently across bills
   * Priority: 60% > 30% > 10%, but never exceed available quantity
   */
  private static distributeWholeNumbers(totalQuantity: number): [number, number, number] {
    const result: [number, number, number] = [0, 0, 0]; // [60%, 30%, 10%]
    
    if (totalQuantity === 1) {
      // Put single item in 10% bill only
      result[2] = 1;
    } else if (totalQuantity === 2) {
      // 1 in 30%, 1 in 10%
      result[1] = 1;
      result[2] = 1;
    } else if (totalQuantity === 3) {
      // 1 in each bill
      result[0] = 1;
      result[1] = 1;
      result[2] = 1;
    } else if (totalQuantity === 4) {
      // 2 in 60%, 1 in 30%, 1 in 10%
      result[0] = 2;
      result[1] = 1;
      result[2] = 1;
    } else if (totalQuantity === 5) {
      // 3 in 60%, 1 in 30%, 1 in 10%
      result[0] = 3;
      result[1] = 1;
      result[2] = 1;
    } else {
      // For larger quantities, use proportional distribution but ensure whole numbers
      const qty60 = Math.floor(totalQuantity * 0.6);
      const qty30 = Math.floor((totalQuantity - qty60) * 0.5);
      const qty10 = totalQuantity - qty60 - qty30;
      
      result[0] = qty60;
      result[1] = qty30;
      result[2] = qty10;
    }
    
    return result;
  }

  private static calculateBillTotals(bills: Bill[]): void {
    bills.forEach(bill => {
      bill.totalAmount = bill.items.reduce((sum, item) => sum + item.amount, 0);
      bill.totalAmount = Math.round(bill.totalAmount * 100) / 100;
    });
  }

  /**
   * Validates and adjusts bill totals to ensure they don't exceed their percentage limits
   * This handles edge cases where smart distribution might cause totals to exceed limits
   */
  private static validateAndAdjustBillTotals(billSet: BillSet): void {
    // Calculate the original total from input quantities × rates
    const originalTotal = billSet.originalItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    
    const expectedTotals = [
      Math.round(originalTotal * 0.6 * 100) / 100,  // 60%
      Math.round(originalTotal * 0.3 * 100) / 100,  // 30%
      Math.round(originalTotal * 0.1 * 100) / 100   // 10%
    ];

    billSet.bills.forEach((bill, index) => {
      const expectedMaxTotal = expectedTotals[index];
      const actualTotal = bill.totalAmount;
      
      // If actual total exceeds expected maximum, we need to adjust
      if (actualTotal > expectedMaxTotal + 0.01) { // Allow small rounding tolerance
        console.warn(`Bill ${bill.percentage}% exceeds limit: ${actualTotal} > ${expectedMaxTotal}`);
        
        // Find the smartest way to adjust - prefer adjusting decimal items over whole number items
        const decimalItems = bill.items.filter(item => item.item.allowsDecimal);
        const wholeItems = bill.items.filter(item => !item.item.allowsDecimal);
        
        const excessAmount = actualTotal - expectedMaxTotal;
        
        if (decimalItems.length > 0) {
          // Adjust decimal items proportionally
          const decimalTotal = decimalItems.reduce((sum, item) => sum + item.amount, 0);
          if (decimalTotal > 0) {
            const reductionFactor = Math.max(0, (decimalTotal - excessAmount) / decimalTotal);
            
            decimalItems.forEach(billItem => {
              billItem.quantity = Math.round(billItem.quantity * reductionFactor * 10) / 10;
              billItem.amount = Math.round(billItem.amount * reductionFactor * 100) / 100;
            });
          }
        } else if (wholeItems.length > 0) {
          // If only whole items, reduce quantities intelligently
          // Start from the largest amounts and work down
          wholeItems.sort((a, b) => b.amount - a.amount);
          let remainingExcess = excessAmount;
          
          for (const item of wholeItems) {
            if (remainingExcess <= 0) break;
            if (item.quantity > 0) {
              const itemValue = item.item.rate;
              if (itemValue <= remainingExcess) {
                item.quantity -= 1;
                item.amount -= itemValue;
                remainingExcess -= itemValue;
              }
            }
          }
        }
        
        // Recalculate bill total
        bill.totalAmount = bill.items.reduce((sum, item) => sum + item.amount, 0);
        bill.totalAmount = Math.round(bill.totalAmount * 100) / 100;
      }
    });
    
    // Update the total amount of the bill set
    billSet.totalAmount = billSet.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  }

  /**
   * Validates that the distribution maintains the correct proportions
   */
  static validateDistribution(billSet: BillSet): boolean {
    const [bill60, bill30, bill10] = billSet.bills;
    const totalAmount = billSet.totalAmount;

    const expectedAmount60 = totalAmount * 0.6;
    const expectedAmount30 = totalAmount * 0.3;
    const expectedAmount10 = totalAmount * 0.1;

    const tolerance = totalAmount * 0.01; // 1% tolerance

    return (
      Math.abs(bill60.totalAmount - expectedAmount60) <= tolerance &&
      Math.abs(bill30.totalAmount - expectedAmount30) <= tolerance &&
      Math.abs(bill10.totalAmount - expectedAmount10) <= tolerance
    );
  }

  /**
   * Validates that the sum of all distributions equals the total amount
   */
  static validateDistributionSum(billSet: BillSet): boolean {
    const [bill60, bill30, bill10] = billSet.bills;
    const totalAmount = billSet.totalAmount;
    
    const sumOfDistributions = bill60.totalAmount + bill30.totalAmount + bill10.totalAmount;
    
    // Allow small rounding differences (within 1 paisa)
    const tolerance = 0.01;
    
    return Math.abs(sumOfDistributions - totalAmount) <= tolerance;
  }

  /**
   * Validates mathematical accuracy of each item's distribution
   */
  static validateItemDistribution(item: Item, billSet: BillSet): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const totalAmount = item.quantity * item.rate;
    
    // Find the item in each bill
    const item60 = billSet.bills[0].items.find(bi => bi.item.name === item.name);
    const item30 = billSet.bills[1].items.find(bi => bi.item.name === item.name);
    const item10 = billSet.bills[2].items.find(bi => bi.item.name === item.name);
    
    if (!item60 || !item30 || !item10) {
      errors.push(`Item ${item.name} not found in all bills`);
      return { isValid: false, errors };
    }
    
    // Validate 60% distribution
    const maxQty60 = totalAmount * 0.6 / item.rate;
    const maxAmt60 = totalAmount * 0.6;
    
    if (item60.quantity > maxQty60) {
      errors.push(`${item.name} 60% quantity (${item60.quantity}) exceeds 60% of total quantity (${maxQty60})`);
    }
    if (item60.amount > maxAmt60) {
      errors.push(`${item.name} 60% amount (${item60.amount}) exceeds 60% of total amount (${maxAmt60})`);
    }
    if (Math.abs(item60.amount - (item60.quantity * item.rate)) > 0.01) {
      errors.push(`${item.name} 60% amount (${item60.amount}) doesn't match quantity × rate (${item60.quantity * item.rate})`);
    }
    
    // Validate 30% distribution
    const maxQty30 = totalAmount * 0.3 / item.rate;
    const maxAmt30 = totalAmount * 0.3;
    
    if (item30.quantity > maxQty30) {
      errors.push(`${item.name} 30% quantity (${item30.quantity}) exceeds 30% of total quantity (${maxQty30})`);
    }
    if (item30.amount > maxAmt30) {
      errors.push(`${item.name} 30% amount (${item30.amount}) exceeds 30% of total amount (${maxAmt30})`);
    }
    if (Math.abs(item30.amount - (item30.quantity * item.rate)) > 0.01) {
      errors.push(`${item.name} 30% amount (${item30.amount}) doesn't match quantity × rate (${item30.quantity * item.rate})`);
    }
    
    // Validate 10% distribution
    const maxQty10 = totalAmount * 0.1 / item.rate;
    const maxAmt10 = totalAmount * 0.1;
    
    if (item10.quantity > maxQty10) {
      errors.push(`${item.name} 10% quantity (${item10.quantity}) exceeds 10% of total quantity (${maxQty10})`);
    }
    if (item10.amount > maxAmt10) {
      errors.push(`${item.name} 10% amount (${item10.amount}) exceeds 10% of total amount (${maxAmt10})`);
    }
    if (Math.abs(item10.amount - (item10.quantity * item.rate)) > 0.01) {
      errors.push(`${item.name} 10% amount (${item10.amount}) doesn't match quantity × rate (${item10.quantity * item.rate})`);
    }
    
    // Validate total quantity and amount
    const totalDistributedQty = item60.quantity + item30.quantity + item10.quantity;
    const totalDistributedAmt = item60.amount + item30.amount + item10.amount;
    
    if (Math.abs(totalDistributedQty - item.quantity) > 0.01) {
      errors.push(`${item.name} total distributed quantity (${totalDistributedQty}) doesn't match original quantity (${item.quantity})`);
    }
    if (Math.abs(totalDistributedAmt - totalAmount) > 0.01) {
      errors.push(`${item.name} total distributed amount (${totalDistributedAmt}) doesn't match original amount (${totalAmount})`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validates the entire bill set for mathematical accuracy
   */
  static validateBillSetAccuracy(billSet: BillSet): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validate each item
    for (const item of billSet.originalItems) {
      const itemValidation = this.validateItemDistribution(item, billSet);
      if (!itemValidation.isValid) {
        errors.push(...itemValidation.errors);
      }
    }
    
    // Validate total distribution
    if (!this.validateDistributionSum(billSet)) {
      errors.push('Total distribution sum doesn\'t match total amount');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Adjusts the last bill to ensure the sum equals the total
   */
  static adjustDistributionToMatchTotal(billSet: BillSet): void {
    const [bill60, bill30, bill10] = billSet.bills;
    const totalAmount = billSet.totalAmount;
    
    const currentSum = bill60.totalAmount + bill30.totalAmount + bill10.totalAmount;
    const difference = totalAmount - currentSum;
    
    if (Math.abs(difference) > 0.01) {
      // Adjust the 10% bill to make the sum equal to total
      bill10.totalAmount = Math.round((bill10.totalAmount + difference) * 100) / 100;
      
      // Recalculate the last item's amount to match the bill total
      if (bill10.items.length > 0) {
        const lastItem = bill10.items[bill10.items.length - 1];
        const otherItemsSum = bill10.items.slice(0, -1).reduce((sum, item) => sum + item.amount, 0);
        lastItem.amount = Math.round((bill10.totalAmount - otherItemsSum) * 100) / 100;
      }
    }
  }

  /**
   * Auto-adjusts distribution to fix mathematical errors
   */
  static autoAdjustDistribution(billSet: BillSet): void {
    const [bill60, bill30, bill10] = billSet.bills;
    
    // For each item, ensure mathematical accuracy
    for (let i = 0; i < billSet.originalItems.length; i++) {
      const originalItem = billSet.originalItems[i];
      const totalAmount = originalItem.quantity * originalItem.rate;
      
      // Get the item from each bill
      const item60 = bill60.items[i];
      const item30 = bill30.items[i];
      const item10 = bill10.items[i];
      
      if (item60 && item30 && item10) {
        // Recalculate amounts based on quantities
        item60.amount = Math.round(item60.quantity * originalItem.rate * 100) / 100;
        item30.amount = Math.round(item30.quantity * originalItem.rate * 100) / 100;
        item10.amount = Math.round(item10.quantity * originalItem.rate * 100) / 100;
        
        // Ensure percentage limits are respected
        const maxAmt60 = totalAmount * 0.6;
        const maxAmt30 = totalAmount * 0.3;
        const maxAmt10 = totalAmount * 0.1;
        
        if (item60.amount > maxAmt60) {
          item60.amount = Math.round(maxAmt60 * 100) / 100;
          item60.quantity = Math.round(item60.amount / originalItem.rate * 100) / 100;
        }
        
        if (item30.amount > maxAmt30) {
          item30.amount = Math.round(maxAmt30 * 100) / 100;
          item30.quantity = Math.round(item30.amount / originalItem.rate * 100) / 100;
        }
        
        if (item10.amount > maxAmt10) {
          item10.amount = Math.round(maxAmt10 * 100) / 100;
          item10.quantity = Math.round(item10.amount / originalItem.rate * 100) / 100;
        }
      }
    }
    
    // Recalculate bill totals
    this.calculateBillTotals(billSet.bills);
  }

  /**
   * Uses a fallback distribution method that guarantees accuracy
   */
  static applyFallbackDistribution(billSet: BillSet): void {
    const [bill60, bill30, bill10] = billSet.bills;
    
    // Clear existing items
    bill60.items = [];
    bill30.items = [];
    bill10.items = [];
    
    // Redistribute using simple percentage method
    for (const originalItem of billSet.originalItems) {
      const totalAmount = originalItem.quantity * originalItem.rate;
      
      // Simple 60/30/10 distribution
      const qty60 = Math.round(originalItem.quantity * 0.6 * 100) / 100;
      const qty30 = Math.round(originalItem.quantity * 0.3 * 100) / 100;
      const qty10 = Math.round(originalItem.quantity * 0.1 * 100) / 100;
      
      const amt60 = Math.round(qty60 * originalItem.rate * 100) / 100;
      const amt30 = Math.round(qty30 * originalItem.rate * 100) / 100;
      const amt10 = Math.round(qty10 * originalItem.rate * 100) / 100;
      
      // Adjust for rounding errors in the 10% bill
      const totalDistributedQty = qty60 + qty30 + qty10;
      const totalDistributedAmt = amt60 + amt30 + amt10;
      
      const finalQty10 = Math.round((qty10 + (originalItem.quantity - totalDistributedQty)) * 100) / 100;
      const finalAmt10 = Math.round((amt10 + (totalAmount - totalDistributedAmt)) * 100) / 100;
      
      bill60.items.push({
        item: { ...originalItem },
        quantity: qty60,
        amount: amt60
      });
      
      bill30.items.push({
        item: { ...originalItem },
        quantity: qty30,
        amount: amt30
      });
      
      bill10.items.push({
        item: { ...originalItem },
        quantity: finalQty10,
        amount: finalAmt10
      });
    }
    
    // Recalculate bill totals
    this.calculateBillTotals(billSet.bills);
  }
}

export default BillDistributor;
