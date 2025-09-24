import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { Item } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { title, items, isDraft }: { title: string; items: Item[]; isDraft: boolean } = await request.json();
    
    const db = getDatabase();
    
    // Insert draft bill
    const insertBill = db.prepare(`
      INSERT INTO bills (title, total_amount)
      VALUES (?, ?)
    `);
    
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const result = insertBill.run(title, totalAmount);
    const billId = result.lastInsertRowid as number;
    
    // Insert items
    const insertItem = db.prepare(`
      INSERT INTO bill_items (bill_id, name, rate, quantity, allows_decimal)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const item of items) {
      insertItem.run(billId, item.name, item.rate, item.quantity, item.allowsDecimal ? 1 : 0);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        id: billId,
        message: 'बिल ड्राफ्ट सेव हो गया'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bill draft save error:', error);
    return NextResponse.json(
      { error: 'बिल ड्राफ्ट सेव करने में त्रुटि' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, items, isDraft }: { id: number; title: string; items: Item[]; isDraft: boolean } = await request.json();
    
    const db = getDatabase();
    
    // Update existing draft
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    
    const updateBill = db.prepare(`
      UPDATE bills 
      SET title = ?, 
          total_amount = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = updateBill.run(title, totalAmount, id);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'ड्राफ्ट अपडेट नहीं हो सका' },
        { status: 404 }
      );
    }
    
    // Delete existing items and insert new ones
    const deleteItems = db.prepare('DELETE FROM bill_items WHERE bill_id = ?');
    deleteItems.run(id);
    
    const insertItem = db.prepare(`
      INSERT INTO bill_items (bill_id, name, rate, quantity, allows_decimal)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const item of items) {
      insertItem.run(id, item.name, item.rate, item.quantity, item.allowsDecimal ? 1 : 0);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        id: id,
        message: 'बिल ड्राफ्ट अपडेट हो गया'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bill draft update error:', error);
    return NextResponse.json(
      { error: 'बिल ड्राफ्ट अपडेट करने में त्रुटि' },
      { status: 500 }
    );
  }
}
