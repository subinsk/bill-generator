import Database from 'better-sqlite3';
import path from 'path';
import { Item, BillSet } from '@/types';

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
      title TEXT NOT NULL,
      total_amount REAL NOT NULL,
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
}

export interface SavedBill {
  id: number;
  title: string;
  total_amount: number;
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
