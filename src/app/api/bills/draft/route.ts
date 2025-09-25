import { NextRequest, NextResponse } from 'next/server';
import { createBillDraft, updateBillByUUID } from '@/lib/database-prisma';
import { Item } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { title, items, isDraft }: { title: string; items: Item[]; isDraft: boolean } = await request.json();
    
    const { uuid, id } = await createBillDraft(title);
    
    // Update with items if provided
    if (items && items.length > 0) {
      await updateBillByUUID(uuid, title, items, isDraft);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        id: id,
        uuid: uuid,
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
    const { uuid, title, items, isDraft }: { uuid: string; title: string; items: Item[]; isDraft: boolean } = await request.json();
    
    const updated = await updateBillByUUID(uuid, title, items, isDraft);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'ड्राफ्ट अपडेट नहीं हो सका' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        uuid: uuid,
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
