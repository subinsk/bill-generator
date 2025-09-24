import { NextResponse } from 'next/server';
import { createGSTBillDraft } from '@/lib/database';

export async function POST() {
  try {
    const { uuid, id } = createGSTBillDraft();
    
    return NextResponse.json(
      { 
        success: true, 
        uuid,
        id,
        message: 'नया GST बिल ड्राफ्ट बनाया गया'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create GST bill draft error:', error);
    return NextResponse.json(
      { 
        error: 'नया GST बिल बनाने में त्रुटि',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
