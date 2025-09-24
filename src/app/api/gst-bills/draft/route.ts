import { NextRequest, NextResponse } from 'next/server';
import { saveGSTBill, getDatabase } from '@/lib/database';
import { GSTBill } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const gstBill: GSTBill & { isDraft: boolean } = await request.json();
    
    const billId = saveGSTBill(gstBill);
    
    return NextResponse.json(
      { 
        success: true, 
        id: billId,
        message: 'GST बिल ड्राफ्ट सेव हो गया'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('GST Bill draft save error:', error);
    return NextResponse.json(
      { error: 'GST बिल ड्राफ्ट सेव करने में त्रुटि' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const gstBill: GSTBill & { isDraft: boolean; id: number } = await request.json();
    
    const db = getDatabase();
    
    // Update existing draft
    const updateBill = db.prepare(`
      UPDATE gst_bills 
      SET bill_data = ?, 
          company_name = ?, 
          invoice_no = ?, 
          invoice_date = ?, 
          billed_to_name = ?, 
          grand_total = ?, 
          final_amount = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = updateBill.run(
      JSON.stringify(gstBill),
      gstBill.billDetails.companyName,
      gstBill.billDetails.invoiceNo,
      gstBill.billDetails.invoiceDate,
      gstBill.billDetails.billedToName,
      gstBill.grandTotal,
      gstBill.finalAmount,
      gstBill.id
    );
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'ड्राफ्ट अपडेट नहीं हो सका' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        id: gstBill.id,
        message: 'GST बिल ड्राफ्ट अपडेट हो गया'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GST Bill draft update error:', error);
    return NextResponse.json(
      { error: 'GST बिल ड्राफ्ट अपडेट करने में त्रुटि' },
      { status: 500 }
    );
  }
}
