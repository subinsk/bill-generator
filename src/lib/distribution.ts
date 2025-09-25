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
      
      // Final validation
      if (!this.validateDistributionSum(billSet)) {
        console.warn('Distribution sum validation failed, but continuing...');
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
      
      // Final validation
      if (!this.validateDistributionSum(billSet)) {
        console.warn('Distribution sum validation failed, but continuing...');
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
    // For items that don't allow decimal (like पानी, मिक्चर), distribute whole numbers intelligently
    if (!item.allowsDecimal && item.quantity <= 10) {
      // Special handling for small whole number quantities
      const quantities = this.distributeWholeNumbers(item.quantity);
      
      quantities.forEach((qty, index) => {
        const billAmount = qty * item.rate;
        const billItem: BillItem = {
          item: { ...item },
          quantity: qty,
          amount: billAmount // Exact calculation for whole numbers
        };
        bills[index].items.push(billItem);
      });
      return;
    }
    
    // Standard percentage distribution for decimal items or large quantities
    // Calculate exact quantities and amounts based on percentages
    this.PERCENTAGES.forEach((percentage, index) => {
      const exactQuantity = (item.quantity * percentage) / 100;
      
      // Round quantity to 2 decimal places for display
      const displayQuantity = Math.round(exactQuantity * 100) / 100;
      
      // Use exact mathematical calculation for amount to ensure accuracy with 2 decimal places
      const displayAmount = Math.round((item.quantity * percentage / 100) * item.rate * 100) / 100;

      const billItem: BillItem = {
        item: { ...item },
        quantity: displayQuantity,
        amount: displayAmount
      };

      bills[index].items.push(billItem);
    });
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
}

export default BillDistributor;
