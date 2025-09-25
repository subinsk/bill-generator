import { NextResponse } from 'next/server';
import { createBillDraft } from '@/lib/database-prisma';

export async function POST() {
  try {
    const { uuid, id } = await createBillDraft();
    
    return NextResponse.json(
      { 
        success: true, 
        uuid,
        id,
        message: 'नया बिल ड्राफ्ट बनाया गया'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create bill draft error:', error);
    return NextResponse.json(
      { error: 'नया बिल बनाने में त्रुटि' },
      { status: 500 }
    );
  }
}
