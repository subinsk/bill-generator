import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';
import { Item, BillSet, GSTBill } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user.id;
}

// Types matching the Prisma schema
export interface SavedBill {
  id: number;
  uuid: string;
  title: string;
  total_amount: number;
  is_draft: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SavedBillItem {
  id: number;
  bill_id: number;
  name: string;
  rate: number;
  quantity: number;
  allows_decimal: boolean;
}

export interface SavedBillDistribution {
  id: number;
  bill_id: number;
  item_name: string;
  percentage: number;
  quantity: number;
  amount: number;
}

export interface SavedGSTBill {
  id: number;
  uuid: string;
  bill_data: string;
  company_name: string;
  invoice_no: string;
  invoice_date: string;
  billed_to_name: string;
  grand_total: number;
  final_amount: number;
  is_draft: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Bill functions
export async function saveBill(title: string, items: Item[], billSet: BillSet): Promise<number> {
  const uuid = uuidv4();
  const userId = await getCurrentUserId();
  
  const bill = await prisma.bill.create({
    data: {
      uuid,
      title,
      totalAmount: billSet.totalAmount,
      isDraft: false,
      userId,
      items: {
        create: items.map(item => ({
          name: item.name,
          rate: item.rate,
          quantity: item.quantity,
          allowsDecimal: item.allowsDecimal ?? true, // Default to true if not provided
        })),
      },
      distributions: {
        create: billSet.bills.flatMap((bill, billIndex) => {
          const percentage = [60, 30, 10][billIndex];
          return bill.items.map(billItem => ({
            itemName: billItem.item.name,
            percentage,
            quantity: billItem.quantity,
            amount: billItem.amount,
          }));
        }),
      },
    },
  });

  return bill.id;
}

export async function getAllBills(): Promise<SavedBill[]> {
  const userId = await getCurrentUserId();
  
  const bills = await prisma.bill.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return bills.map(bill => ({
    id: bill.id,
    uuid: bill.uuid,
    title: bill.title,
    total_amount: bill.totalAmount,
    is_draft: bill.isDraft,
    user_id: bill.userId,
    created_at: bill.createdAt.toISOString(),
    updated_at: bill.updatedAt.toISOString(),
  }));
}

export async function getBillById(id: number) {
  const userId = await getCurrentUserId();
  
  const bill = await prisma.bill.findFirst({
    where: { 
      id,
      userId 
    },
    include: {
      items: true,
      distributions: {
        orderBy: [
          { percentage: 'desc' },
          { itemName: 'asc' },
        ],
      },
    },
  });

  if (!bill) return null;

  return {
    bill: {
      id: bill.id,
      uuid: bill.uuid,
      title: bill.title,
      total_amount: bill.totalAmount,
      is_draft: bill.isDraft,
      user_id: bill.userId,
      created_at: bill.createdAt.toISOString(),
      updated_at: bill.updatedAt.toISOString(),
    },
    items: bill.items.map(item => ({
      id: item.id,
      bill_id: item.billId,
      name: item.name,
      rate: item.rate,
      quantity: item.quantity,
      allows_decimal: item.allowsDecimal,
    })),
    distributions: bill.distributions.map(dist => ({
      id: dist.id,
      bill_id: dist.billId,
      item_name: dist.itemName,
      percentage: dist.percentage,
      quantity: dist.quantity,
      amount: dist.amount,
    })),
  };
}

export async function getBillByUUID(uuid: string) {
  const userId = await getCurrentUserId();
  
  const bill = await prisma.bill.findFirst({
    where: { 
      uuid,
      userId 
    },
    include: {
      items: true,
      distributions: {
        orderBy: [
          { percentage: 'desc' },
          { itemName: 'asc' },
        ],
      },
    },
  });

  if (!bill) return null;

  return {
    bill: {
      id: bill.id,
      uuid: bill.uuid,
      title: bill.title,
      total_amount: bill.totalAmount,
      is_draft: bill.isDraft,
      user_id: bill.userId,
      created_at: bill.createdAt.toISOString(),
      updated_at: bill.updatedAt.toISOString(),
    },
    items: bill.items.map(item => ({
      id: item.id,
      bill_id: item.billId,
      name: item.name,
      rate: item.rate,
      quantity: item.quantity,
      allows_decimal: item.allowsDecimal,
    })),
    distributions: bill.distributions.map(dist => ({
      id: dist.id,
      bill_id: dist.billId,
      item_name: dist.itemName,
      percentage: dist.percentage,
      quantity: dist.quantity,
      amount: dist.amount,
    })),
  };
}

export async function deleteBill(id: number): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    const result = await prisma.bill.deleteMany({
      where: { 
        id,
        userId 
      },
    });
    
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting bill:', error);
    return false;
  }
}

export async function deleteBillByUUID(uuid: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    const result = await prisma.bill.deleteMany({
      where: { 
        uuid,
        userId 
      },
    });
    
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting bill by UUID:', error);
    return false;
  }
}

// Draft functions
export async function createBillDraft(title: string = ''): Promise<{ uuid: string; id: number }> {
  const uuid = uuidv4();
  const userId = await getCurrentUserId();
  
  const bill = await prisma.bill.create({
    data: {
      uuid,
      title,
      totalAmount: 0,
      isDraft: true,
      userId,
    },
  });

  return { uuid, id: bill.id };
}

export async function updateBillByUUID(uuid: string, title: string, items: Item[], isDraft?: boolean): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    await prisma.$transaction(async (tx) => {
      // Check if bill exists and belongs to user
      const existingBill = await tx.bill.findFirst({
        where: { uuid, userId }
      });

      if (!existingBill) {
        throw new Error('Bill not found or access denied');
      }

      // Update bill
      await tx.bill.update({
        where: { id: existingBill.id },
        data: {
          title,
          isDraft: isDraft ?? false,
          updatedAt: new Date(),
        },
      });

      // Delete existing items and distributions
      await tx.billItem.deleteMany({
        where: { billId: existingBill.id },
      });
      await tx.billDistribution.deleteMany({
        where: { billId: existingBill.id },
      });

      // Add new items
      if (items.length > 0) {
        await tx.billItem.createMany({
          data: items.map(item => ({
            billId: existingBill.id,
            name: item.name,
            rate: item.rate,
            quantity: item.quantity,
            allowsDecimal: item.allowsDecimal ?? true, // Default to true if not provided
          })),
        });
      }
    });

    return true;
  } catch (error) {
    console.error('Error updating bill:', error);
    return false;
  }
}

export async function updateBillWithDistributions(uuid: string, title: string, items: Item[], billSet: BillSet, isDraft?: boolean): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    await prisma.$transaction(async (tx) => {
      // Check if bill exists and belongs to user
      const existingBill = await tx.bill.findFirst({
        where: { uuid, userId }
      });

      if (!existingBill) {
        throw new Error('Bill not found or access denied');
      }

      // Update bill
      await tx.bill.update({
        where: { id: existingBill.id },
        data: {
          title,
          totalAmount: billSet.totalAmount,
          isDraft: isDraft ?? false,
          updatedAt: new Date(),
        },
      });

      // Delete existing items and distributions
      await tx.billItem.deleteMany({
        where: { billId: existingBill.id },
      });
      await tx.billDistribution.deleteMany({
        where: { billId: existingBill.id },
      });

      // Add new items
      await tx.billItem.createMany({
        data: items.map(item => ({
          billId: existingBill.id,
          name: item.name,
          rate: item.rate,
          quantity: item.quantity,
          allowsDecimal: item.allowsDecimal ?? true, // Default to true if not provided
        })),
      });

      // Add distributions
      await tx.billDistribution.createMany({
        data: billSet.bills.flatMap((billSetBill, billIndex) => {
          const percentage = [60, 30, 10][billIndex];
          return billSetBill.items.map(billItem => ({
            billId: existingBill.id,
            itemName: billItem.item.name,
            percentage,
            quantity: billItem.quantity,
            amount: billItem.amount,
          }));
        }),
      });
    });

    return true;
  } catch (error) {
    console.error('Error updating bill with distributions:', error);
    return false;
  }
}

// GST Bill functions
export async function saveGSTBill(gstBill: GSTBill): Promise<number> {
  const uuid = uuidv4();
  const userId = await getCurrentUserId();
  
  const bill = await prisma.gstBill.create({
    data: {
      uuid,
      billData: JSON.stringify(gstBill),
      companyName: gstBill.billDetails.companyName,
      invoiceNo: gstBill.billDetails.invoiceNo,
      invoiceDate: gstBill.billDetails.invoiceDate,
      billedToName: gstBill.billDetails.billedToName,
      grandTotal: gstBill.grandTotal,
      finalAmount: gstBill.finalAmount,
      isDraft: false,
      userId,
    },
  });

  return bill.id;
}

export async function getAllGSTBills(): Promise<SavedGSTBill[]> {
  const userId = await getCurrentUserId();
  
  const bills = await prisma.gstBill.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return bills.map(bill => ({
    id: bill.id,
    uuid: bill.uuid,
    bill_data: bill.billData,
    company_name: bill.companyName,
    invoice_no: bill.invoiceNo,
    invoice_date: bill.invoiceDate,
    billed_to_name: bill.billedToName,
    grand_total: bill.grandTotal,
    final_amount: bill.finalAmount,
    is_draft: bill.isDraft,
    user_id: bill.userId,
    created_at: bill.createdAt.toISOString(),
    updated_at: bill.updatedAt.toISOString(),
  }));
}

export async function getGSTBillById(id: number): Promise<GSTBill | null> {
  const userId = await getCurrentUserId();
  
  const savedBill = await prisma.gstBill.findFirst({
    where: { 
      id,
      userId 
    },
  });

  if (!savedBill) return null;

  try {
    const gstBill = JSON.parse(savedBill.billData) as GSTBill;
    return { ...gstBill, id: id.toString() };
  } catch (error) {
    console.error('Error parsing GST bill data:', error);
    return null;
  }
}

export async function getGSTBillByUUID(uuid: string): Promise<GSTBill | null> {
  const userId = await getCurrentUserId();
  
  const savedBill = await prisma.gstBill.findFirst({
    where: { 
      uuid,
      userId 
    },
  });

  if (!savedBill) return null;

  try {
    const gstBill = JSON.parse(savedBill.billData) as GSTBill;
    return { ...gstBill, id: savedBill.uuid };
  } catch (error) {
    console.error('Error parsing GST bill data:', error);
    return null;
  }
}

export async function deleteGSTBill(id: number): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    const result = await prisma.gstBill.deleteMany({
      where: { 
        id,
        userId 
      },
    });
    
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting GST bill:', error);
    return false;
  }
}

export async function deleteGSTBillByUUID(uuid: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    const result = await prisma.gstBill.deleteMany({
      where: { 
        uuid,
        userId 
      },
    });
    
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting GST bill by UUID:', error);
    return false;
  }
}

export async function createGSTBillDraft(): Promise<{ uuid: string; id: number }> {
  const uuid = uuidv4();
  const userId = await getCurrentUserId();
  
  const defaultBill: GSTBill = {
    id: '',
    billDetails: {
      companyName: '',
      companyAddress: '',
      companyGSTIN: '',
      companyPAN: '',
      invoiceNo: '',
      invoiceDate: '',
      placeOfSupply: '',
      reverseCharge: 'No',
      billedToName: '',
      billedToAddress: '',
      billedToGSTIN: '',
      shippedToName: '',
      shippedToAddress: '',
      shippedToGSTIN: '',
      bankDetails: '',
      termsConditions: [],
    },
    items: [],
    grandTotal: 0,
    totalUnits: 0,
    totalTaxableAmount: 0,
    totalCGSTAmount: 0,
    totalSGSTAmount: 0,
    totalTaxAmount: 0,
    bsrDeduction: 0,
    finalAmount: 0,
    taxSummary: [],
    amountInWords: '',
    createdAt: new Date().toISOString(),
  };

  const bill = await prisma.gstBill.create({
    data: {
      uuid,
      billData: JSON.stringify(defaultBill),
      companyName: '',
      invoiceNo: '',
      invoiceDate: '',
      billedToName: '',
      grandTotal: 0,
      finalAmount: 0,
      isDraft: true,
      userId,
    },
  });

  return { uuid, id: bill.id };
}

export async function updateGSTBillByUUID(uuid: string, gstBill: GSTBill, isDraft?: boolean): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    
    // Check if bill exists and belongs to user
    const existingBill = await prisma.gstBill.findFirst({
      where: { uuid, userId }
    });

    if (!existingBill) {
      throw new Error('GST bill not found or access denied');
    }

    await prisma.gstBill.update({
      where: { id: existingBill.id },
      data: {
        billData: JSON.stringify(gstBill),
        companyName: gstBill.billDetails.companyName,
        invoiceNo: gstBill.billDetails.invoiceNo,
        invoiceDate: gstBill.billDetails.invoiceDate,
        billedToName: gstBill.billDetails.billedToName,
        grandTotal: gstBill.grandTotal,
        finalAmount: gstBill.finalAmount,
        isDraft: isDraft ?? false,
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating GST bill:', error);
    return false;
  }
}
