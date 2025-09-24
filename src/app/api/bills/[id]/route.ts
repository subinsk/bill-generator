import { NextRequest, NextResponse } from 'next/server';
import { getBillByUUID, updateBillByUUID, deleteBillByUUID } from '@/lib/database';
import { Item } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = getBillByUUID(id);
    
    if (!bill) {
      return NextResponse.json(
        { error: 'बिल नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bill
    });

  } catch (error) {
    console.error('Get bill error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'सर्वर त्रुटि' },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, items, isDraft } = body;

    const updated = updateBillByUUID(id, title, items, isDraft);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'बिल अपडेट नहीं हो सका' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'बिल सफलतापूर्वक अपडेट हो गया'
    });

  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'सर्वर त्रुटि' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const deleted = deleteBillByUUID(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'बिल नहीं मिला या डिलीट नहीं हो सका' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'बिल सफलतापूर्वक डिलीट हो गया'
    });

  } catch (error) {
    console.error('Delete bill error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'सर्वर त्रुटि' },
      { status: 500 }
    );
  }
}
