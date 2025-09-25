import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Item, BillSet, GSTBill } from '@/types';

const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'bills.db')
  : path.join(process.cwd(), 'bills.db');
let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    try {
      db = new Database(dbPath);
      initializeDatabase();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error('डेटाबेस शुरू करने में त्रुटि');
    }
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  // Create bills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      total_amount REAL NOT NULL,
      is_draft BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create bill_items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      rate REAL NOT NULL,
      quantity REAL NOT NULL,
      allows_decimal BOOLEAN NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE CASCADE
    )
  `);

  // Create bill_distributions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bill_distributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      percentage INTEGER NOT NULL,
      quantity REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE CASCADE
    )
  `);

  // Create GST bills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS gst_bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      bill_data TEXT NOT NULL,
      company_name TEXT NOT NULL,
      invoice_no TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      billed_to_name TEXT NOT NULL,
      grand_total REAL NOT NULL,
      final_amount REAL NOT NULL,
      is_draft BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add missing columns if they don't exist (for existing databases)
  try {
    db.exec('ALTER TABLE bills ADD COLUMN uuid TEXT UNIQUE');
  } catch (e) {
    // Column might already exist, ignore error
  }
  
  try {
    db.exec('ALTER TABLE bills ADD COLUMN is_draft BOOLEAN DEFAULT 1');
  } catch (e) {
    // Column might already exist, ignore error
  }
  
  try {
    db.exec('ALTER TABLE gst_bills ADD COLUMN uuid TEXT UNIQUE');
  } catch (e) {
    // Column might already exist, ignore error
  }
  
  try {
    db.exec('ALTER TABLE gst_bills ADD COLUMN is_draft BOOLEAN DEFAULT 1');
  } catch (e) {
    // Column might already exist, ignore error
  }
}

export interface SavedBill {
  id: number;
  uuid: string;
  title: string;
  total_amount: number;
  is_draft: boolean;
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

export function saveBill(title: string, items: Item[], billSet: BillSet): number {
  const db = getDatabase();
  
  // Insert bill
  const insertBill = db.prepare(`
    INSERT INTO bills (title, total_amount)
    VALUES (?, ?)
  `);
  
  const result = insertBill.run(title, billSet.totalAmount);
  const billId = result.lastInsertRowid as number;
  
  // Insert items
  const insertItem = db.prepare(`
    INSERT INTO bill_items (bill_id, name, rate, quantity, allows_decimal)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  for (const item of items) {
    insertItem.run(billId, item.name, item.rate, item.quantity, item.allowsDecimal ? 1 : 0);
  }
  
  // Insert distributions
  const insertDistribution = db.prepare(`
    INSERT INTO bill_distributions (bill_id, item_name, percentage, quantity, amount)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  billSet.bills.forEach((bill, billIndex: number) => {
    const percentage = [60, 30, 10][billIndex];
    bill.items.forEach((billItem) => {
      insertDistribution.run(
        billId,
        billItem.item.name,
        percentage,
        billItem.quantity,
        billItem.amount
      );
    });
  });
  
  return billId;
}

export function getAllBills(): SavedBill[] {
  const db = getDatabase();
  const query = db.prepare(`
    SELECT * FROM bills 
    ORDER BY created_at DESC
  `);
  
  return query.all() as SavedBill[];
}

export function getBillById(id: number) {
  const db = getDatabase();
  
  // Get bill details
  const billQuery = db.prepare('SELECT * FROM bills WHERE id = ?');
  const bill = billQuery.get(id) as SavedBill;
  
  if (!bill) return null;
  
  // Get bill items
  const itemsQuery = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?');
  const items = itemsQuery.all(id) as SavedBillItem[];
  
  // Get distributions
  const distributionsQuery = db.prepare(`
    SELECT * FROM bill_distributions 
    WHERE bill_id = ? 
    ORDER BY percentage DESC, item_name
  `);
  const distributions = distributionsQuery.all(id) as SavedBillDistribution[];
  
  return {
    bill,
    items,
    distributions
  };
}

export function deleteBill(id: number): boolean {
  const db = getDatabase();
  const deleteStmt = db.prepare('DELETE FROM bills WHERE id = ?');
  const result = deleteStmt.run(id);
  return result.changes > 0;
}

export function deleteBillByUUID(uuid: string): boolean {
  const db = getDatabase();
  const deleteStmt = db.prepare('DELETE FROM bills WHERE uuid = ?');
  const result = deleteStmt.run(uuid);
  return result.changes > 0;
}

// GST Bills Functions
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
  created_at: string;
  updated_at: string;
}

export function saveGSTBill(gstBill: GSTBill): number {
  const db = getDatabase();
  
  const insertBill = db.prepare(`
    INSERT INTO gst_bills (
      bill_data, 
      company_name, 
      invoice_no, 
      invoice_date, 
      billed_to_name, 
      grand_total, 
      final_amount
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = insertBill.run(
    JSON.stringify(gstBill),
    gstBill.billDetails.companyName,
    gstBill.billDetails.invoiceNo,
    gstBill.billDetails.invoiceDate,
    gstBill.billDetails.billedToName,
    gstBill.grandTotal,
    gstBill.finalAmount
  );
  
  return result.lastInsertRowid as number;
}

export function getAllGSTBills(): SavedGSTBill[] {
  const db = getDatabase();
  const query = db.prepare(`
    SELECT * FROM gst_bills 
    ORDER BY created_at DESC
  `);
  
  return query.all() as SavedGSTBill[];
}

export function getGSTBillById(id: number): GSTBill | null {
  const db = getDatabase();
  
  const billQuery = db.prepare('SELECT * FROM gst_bills WHERE id = ?');
  const savedBill = billQuery.get(id) as SavedGSTBill;
  
  if (!savedBill) return null;
  
  try {
    const gstBill = JSON.parse(savedBill.bill_data) as GSTBill;
    return { ...gstBill, id: id.toString() };
  } catch (error) {
    console.error('Error parsing GST bill data:', error);
    return null;
  }
}

export function deleteGSTBill(id: number): boolean {
  const db = getDatabase();
  const deleteStmt = db.prepare('DELETE FROM gst_bills WHERE id = ?');
  const result = deleteStmt.run(id);
  return result.changes > 0;
}

export function deleteGSTBillByUUID(uuid: string): boolean {
  const db = getDatabase();
  const deleteStmt = db.prepare('DELETE FROM gst_bills WHERE uuid = ?');
  const result = deleteStmt.run(uuid);
  return result.changes > 0;
}

// UUID-based functions for new bill creation workflow

export function createBillDraft(title: string = ''): { uuid: string; id: number } {
  const db = getDatabase();
  const uuid = uuidv4();
  
  const insertBill = db.prepare(`
    INSERT INTO bills (uuid, title, total_amount, is_draft)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = insertBill.run(uuid, title || 'नया बिल', 0, 1);
  const billId = result.lastInsertRowid as number;
  
  return { uuid, id: billId };
}

export function createGSTBillDraft(): { uuid: string; id: number } {
  const db = getDatabase();
  const uuid = uuidv4();
  
  const insertBill = db.prepare(`
    INSERT INTO gst_bills (
      uuid, 
      bill_data, 
      company_name, 
      invoice_no, 
      invoice_date, 
      billed_to_name, 
      grand_total, 
      final_amount, 
      is_draft
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const defaultBill: GSTBill = {
    id: '',
    billDetails: {
      companyName: 'ASHAPURA CONSTRUCTIONS',
      companyAddress: 'HANUMAN SHALA SCHOOL KE SAMNE, AHORE',
      companyGSTIN: '08CBWPM6776L2ZE',
      companyPAN: 'CBWPM6776L',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      placeOfSupply: 'Rajasthan (08)',
      reverseCharge: 'N',
      billedToName: '',
      billedToAddress: '',
      billedToGSTIN: '',
      shippedToName: '',
      shippedToAddress: '',
      shippedToGSTIN: '',
      bankDetails: 'RMGB CA AC NO. 8306041866\nRMGB0000103 RMGB AHORE',
      termsConditions: [
        'E. & O.E.',
        'Goods once sold will not be taken back.',
        'Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.',
        'Subject to "JALORE" Jurisdiction only.'
      ]
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
    amountInWords: 'Zero Only',
    createdAt: new Date().toISOString()
  };
  
  const result = insertBill.run(
    uuid,
    JSON.stringify(defaultBill),
    'ASHAPURA CONSTRUCTIONS',
    '',
    new Date().toISOString().split('T')[0],
    '',
    0,
    0,
    1
  );
  
  const billId = result.lastInsertRowid as number;
  return { uuid, id: billId };
}

export function getBillByUUID(uuid: string) {
  const db = getDatabase();
  
  const billQuery = db.prepare('SELECT * FROM bills WHERE uuid = ?');
  const bill = billQuery.get(uuid) as SavedBill;
  
  if (!bill) return null;
  
  const itemsQuery = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?');
  const items = itemsQuery.all(bill.id) as SavedBillItem[];
  
  const distributionsQuery = db.prepare(`
    SELECT * FROM bill_distributions 
    WHERE bill_id = ? 
    ORDER BY percentage DESC, item_name
  `);
  const distributions = distributionsQuery.all(bill.id) as SavedBillDistribution[];
  
  return {
    bill,
    items,
    distributions
  };
}

export function getGSTBillByUUID(uuid: string): GSTBill | null {
  const db = getDatabase();
  
  const billQuery = db.prepare('SELECT * FROM gst_bills WHERE uuid = ?');
  const savedBill = billQuery.get(uuid) as SavedGSTBill;
  
  if (!savedBill) return null;
  
  try {
    const gstBill = JSON.parse(savedBill.bill_data) as GSTBill;
    return { ...gstBill, id: savedBill.uuid };
  } catch (error) {
    console.error('Error parsing GST bill data:', error);
    return null;
  }
}

export function updateBillByUUID(uuid: string, title: string, items: Item[], isDraft?: boolean): boolean {
  const db = getDatabase();
  
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  
  const updateBill = db.prepare(`
    UPDATE bills 
    SET title = ?, 
        total_amount = ?,
        is_draft = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `);
  
  const result = updateBill.run(title, totalAmount, isDraft ? 1 : 0, uuid);
  
  if (result.changes === 0) return false;
  
  // Get bill ID
  const billQuery = db.prepare('SELECT id FROM bills WHERE uuid = ?');
  const bill = billQuery.get(uuid) as { id: number };
  
  if (!bill) return false;
  
  // Delete existing items and insert new ones
  const deleteItems = db.prepare('DELETE FROM bill_items WHERE bill_id = ?');
  deleteItems.run(bill.id);
  
  const insertItem = db.prepare(`
    INSERT INTO bill_items (bill_id, name, rate, quantity, allows_decimal)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  for (const item of items) {
    insertItem.run(bill.id, item.name, item.rate, item.quantity, item.allowsDecimal ? 1 : 0);
  }
  
  return true;
}

export function updateBillWithDistributions(uuid: string, title: string, items: Item[], billSet: any, isDraft?: boolean): boolean {
  const db = getDatabase();
  
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  
  const updateBill = db.prepare(`
    UPDATE bills 
    SET title = ?, 
        total_amount = ?,
        is_draft = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `);
  
  const result = updateBill.run(title, totalAmount, isDraft ? 1 : 0, uuid);
  
  if (result.changes === 0) return false;
  
  // Get bill ID
  const billQuery = db.prepare('SELECT id FROM bills WHERE uuid = ?');
  const billRecord = billQuery.get(uuid) as { id: number };
  
  if (!billRecord) return false;
  
  // Delete existing items and distributions
  const deleteItems = db.prepare('DELETE FROM bill_items WHERE bill_id = ?');
  deleteItems.run(billRecord.id);
  
  const deleteDistributions = db.prepare('DELETE FROM bill_distributions WHERE bill_id = ?');
  deleteDistributions.run(billRecord.id);
  
  // Insert new items
  const insertItem = db.prepare(`
    INSERT INTO bill_items (bill_id, name, rate, quantity, allows_decimal)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  for (const item of items) {
    insertItem.run(billRecord.id, item.name, item.rate, item.quantity, item.allowsDecimal ? 1 : 0);
  }
  
  // Insert distributions if billSet is provided
  if (billSet && billSet.bills) {
    const insertDistribution = db.prepare(`
      INSERT INTO bill_distributions (bill_id, item_name, percentage, quantity, amount)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    billSet.bills.forEach((bill: any, billIndex: number) => {
      const percentage = [60, 30, 10][billIndex];
      bill.items.forEach((billItem: any) => {
        insertDistribution.run(
          billRecord.id,
          billItem.item.name,
          percentage,
          billItem.quantity,
          billItem.amount
        );
      });
    });
  }
  
  return true;
}

export function updateGSTBillByUUID(uuid: string, gstBill: GSTBill, isDraft?: boolean): boolean {
  const db = getDatabase();
  
  const updateBill = db.prepare(`
    UPDATE gst_bills 
    SET bill_data = ?, 
        company_name = ?, 
        invoice_no = ?, 
        invoice_date = ?, 
        billed_to_name = ?, 
        grand_total = ?, 
        final_amount = ?,
        is_draft = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE uuid = ?
  `);
  
  const result = updateBill.run(
    JSON.stringify(gstBill),
    gstBill.billDetails.companyName,
    gstBill.billDetails.invoiceNo,
    gstBill.billDetails.invoiceDate,
    gstBill.billDetails.billedToName,
    gstBill.grandTotal,
    gstBill.finalAmount,
    isDraft ? 1 : 0,
    uuid
  );
  
  return result.changes > 0;
}
