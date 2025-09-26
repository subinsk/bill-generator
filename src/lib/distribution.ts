import { Item, Bill, BillItem, BillSet, DistributionResult } from '@/types';

export class BillDistributor {
  private static readonly PERCENTAGES = [60, 30, 10] as const;

  /**
   * Distributes items across three bills (60%, 30%, 10%)
   * Only uses correct distribution logic - no fallbacks or adjustments
   */
  static distributeItems(items: Item[]): DistributionResult {
    try {
      // Input validation
      if (!items || !Array.isArray(items) || items.length === 0) {
        return { success: false, error: 'Items array is empty or invalid' };
      }

      // Validate each item
      for (const item of items) {
        if (!item || typeof item.quantity !== 'number' || typeof item.rate !== 'number') {
          return { success: false, error: 'Invalid item data: missing quantity or rate' };
        }
        if (item.quantity < 0 || item.rate < 0) {
          return { success: false, error: 'Item quantity and rate must be non-negative' };
        }
      }

      const bills = this.createInitialBills();
      
      // Distribute each item across the three bills
      for (const item of items) {
        this.distributeItemAcrossBills(item, bills);
      }

      // Calculate totals
      this.calculateBillTotals(bills);

      const billSet: BillSet = {
        originalItems: items,
        bills: bills as [Bill, Bill, Bill],
        totalAmount: bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
      };

      return { success: true, billSet };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Alternative distribution method (for compatibility)
   */
  static distributeItemsSingleAdjustment(items: Item[]): DistributionResult {
    // Use the same logic as distributeItems - no separate adjustment method
    return this.distributeItems(items);
  }

  /**
   * Creates initial bill structure
   */
  private static createInitialBills(): Bill[] {
    return this.PERCENTAGES.map((percentage, index) => ({
      id: `bill-${percentage}`,
      percentage,
      items: [],
      totalAmount: 0
    }));
  }

  /**
   * Distributes a single item across the three bills
   */
  private static distributeItemAcrossBills(item: Item, bills: Bill[]): void {
    // Input validation
    if (!item || !bills || bills.length !== 3) {
      throw new Error('Invalid input: item or bills array is invalid');
    }

    if (item.quantity === 0) {
      // Handle zero quantity items
      bills.forEach(bill => {
        const billItem: BillItem = {
          item: { ...item },
          quantity: 0,
          amount: 0
        };
        bill.items.push(billItem);
      });
      return;
    }

    const totalAmount = item.quantity * item.rate;
    
    // For items that don't allow decimal, distribute whole numbers intelligently
    if (!item.allowsDecimal) {
      const quantities = this.distributeWholeNumbersWithValidation(item.quantity);
      
      quantities.forEach((qty, index) => {
        if (index >= bills.length) {
          throw new Error('Index out of bounds: bills array has insufficient elements');
        }
        
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
    
    // Standard percentage distribution for decimal items
    const distributions = this.calculatePreciseDistribution(item.quantity, item.rate, totalAmount);
    
    distributions.forEach((dist, index) => {
      if (index >= bills.length) {
        throw new Error('Index out of bounds: bills array has insufficient elements');
      }
      
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
    // Input validation
    if (quantity < 0 || rate < 0 || totalAmount < 0) {
      throw new Error('Invalid input: quantity, rate, and totalAmount must be non-negative');
    }
    
    if (rate === 0) {
      // Handle zero rate items
      return [
        { quantity: quantity * 0.6, amount: 0 },
        { quantity: quantity * 0.3, amount: 0 },
        { quantity: quantity * 0.1, amount: 0 }
      ];
    }
    
    // Calculate exact percentages for quantities
    const qty60 = Math.round(quantity * 0.6 * 100) / 100;
    const qty30 = Math.round(quantity * 0.3 * 100) / 100;
    const qty10 = Math.round(quantity * 0.1 * 100) / 100;
    
    // Check if we need to adjust quantities for rounding errors
    const totalDistributedQty = qty60 + qty30 + qty10;
    const qtyAdjustment = quantity - totalDistributedQty;
    
    // Adjust the last distribution (10%) to ensure exact quantity total
    const finalQty10 = Math.round((qty10 + qtyAdjustment) * 100) / 100;
    
    // Calculate amounts based on FINAL quantities to ensure amount = quantity × rate
    const amt60 = Math.round(qty60 * rate * 100) / 100;
    const amt30 = Math.round(qty30 * rate * 100) / 100;
    const amt10 = Math.round(finalQty10 * rate * 100) / 100;
    
    return [
      { quantity: qty60, amount: amt60 },
      { quantity: qty30, amount: amt30 },
      { quantity: finalQty10, amount: amt10 }
    ];
  }

  /**
   * Distribute whole numbers with validation to ensure percentage limits
   */
  private static distributeWholeNumbersWithValidation(totalQuantity: number): [number, number, number] {
    // Input validation
    if (totalQuantity < 0 || !Number.isInteger(totalQuantity)) {
      throw new Error('Invalid input: totalQuantity must be a non-negative integer');
    }
    
    if (totalQuantity === 0) {
      return [0, 0, 0];
    }
    
    const result: [number, number, number] = [0, 0, 0];
    
    // Robust distribution logic that works for any quantity
    // Strategy: Distribute as close as possible to 60%, 30%, 10% while ensuring whole numbers
    
    if (totalQuantity === 1) {
      // Single item goes to 60% bill
      result[0] = 1;
      result[1] = 0;
      result[2] = 0;
    } else if (totalQuantity === 2) {
      // Two items: 1 in 60%, 1 in 30%
      result[0] = 1;
      result[1] = 1;
      result[2] = 0;
    } else if (totalQuantity === 3) {
      // Three items: 2 in 60%, 1 in 30%
      result[0] = 2;
      result[1] = 1;
      result[2] = 0;
    } else if (totalQuantity === 4) {
      // Four items: 2 in 60%, 2 in 30%
      result[0] = 2;
      result[1] = 2;
      result[2] = 0;
    } else {
      // For 5 or more items, use intelligent distribution
      // Calculate target percentages
      const target60 = Math.round(totalQuantity * 0.6);
      const target30 = Math.round(totalQuantity * 0.3);
      const target10 = Math.round(totalQuantity * 0.1);
      
      // Check if targets add up to total quantity
      const targetSum = target60 + target30 + target10;
      
      if (targetSum === totalQuantity) {
        // Perfect match
        result[0] = target60;
        result[1] = target30;
        result[2] = target10;
      } else if (targetSum < totalQuantity) {
        // Need to add more items - add to 60% first, then 30%
        const difference = totalQuantity - targetSum;
        result[0] = target60 + Math.floor(difference / 2);
        result[1] = target30 + Math.ceil(difference / 2);
        result[2] = target10;
      } else {
        // Need to remove items - remove from 30% first, then 10%
        const excess = targetSum - totalQuantity;
        result[0] = target60;
        result[1] = Math.max(0, target30 - Math.min(excess, target30));
        result[2] = Math.max(0, target10 - Math.max(0, excess - target30));
      }
      
      // Final validation and adjustment
      const currentSum = result[0] + result[1] + result[2];
      if (currentSum !== totalQuantity) {
        // Adjust by adding/removing from the 60% bill
        result[0] = totalQuantity - result[1] - result[2];
      }
    }
    
    // Final validation
    if (result[0] < 0 || result[1] < 0 || result[2] < 0) {
      throw new Error('Negative quantity in distribution result');
    }
    
    const finalSum = result[0] + result[1] + result[2];
    if (finalSum !== totalQuantity) {
      throw new Error(`Distribution sum mismatch: ${finalSum} !== ${totalQuantity}`);
    }
    
    return result;
  }

  /**
   * Calculates bill totals
   */
  private static calculateBillTotals(bills: Bill[]): void {
    bills.forEach(bill => {
      bill.totalAmount = bill.items.reduce((sum, item) => sum + item.amount, 0);
      bill.totalAmount = Math.round(bill.totalAmount * 100) / 100;
    });
  }

  /**
   * Adjusts quantities to handle minimum requirements for distribution
   */
  private static adjustQuantitiesForDistribution(items: Item[]): Item[] {
    return items.map(item => {
      if (!item.allowsDecimal && item.quantity > 0 && item.quantity < 3) {
        // For whole number items with very low quantities, we need at least 3 to distribute across all bills
        // But we keep the original logic to maintain consistency
        return { ...item };
      }
      return { ...item };
    });
  }
}