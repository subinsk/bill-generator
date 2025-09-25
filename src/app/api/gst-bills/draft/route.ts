import { NextRequest, NextResponse } from 'next/server';
import { createGSTBillDraft, updateGSTBillByUUID } from '@/lib/database-prisma';
import { GSTBill } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const gstBill: GSTBill & { isDraft: boolean } = await request.json();
    
    const { uuid, id } = await createGSTBillDraft();
    
    // Update with GST bill data if provided
    if (gstBill) {
      await updateGSTBillByUUID(uuid, gstBill, gstBill.isDraft);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        id: id,
        uuid: uuid,
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
    const gstBill: GSTBill & { isDraft: boolean; uuid: string } = await request.json();
    
    const updated = await updateGSTBillByUUID(gstBill.uuid, gstBill, gstBill.isDraft);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'ड्राफ्ट अपडेट नहीं हो सका' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        uuid: gstBill.uuid,
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
