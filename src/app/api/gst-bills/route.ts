import { NextRequest, NextResponse } from 'next/server';
import { saveGSTBill, getAllGSTBills } from '@/lib/database';
import { GSTBill } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const gstBill: GSTBill = await request.json();
    
    // Validate required fields
    if (!gstBill.billDetails.companyName || !gstBill.billDetails.billedToName || gstBill.items.length === 0) {
      return NextResponse.json(
        { error: 'आवश्यक फील्ड गुम हैं' },
        { status: 400 }
      );
    }

    const billId = saveGSTBill(gstBill);
    
    return NextResponse.json(
      { 
        success: true, 
        id: billId,
        message: 'GST बिल सफलतापूर्वक सेव हो गया'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('GST Bill save error:', error);
    return NextResponse.json(
      { error: 'GST बिल सेव करने में त्रुटि' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bills = getAllGSTBills();
    
    return NextResponse.json(
      { 
        success: true, 
        bills: bills 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GST Bills fetch error:', error);
    return NextResponse.json(
      { error: 'GST बिल लोड करने में त्रुटि' },
      { status: 500 }
    );
  }
}
