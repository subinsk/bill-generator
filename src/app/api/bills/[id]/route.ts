import { NextRequest, NextResponse } from 'next/server';
import { getBillByUUID, updateBillByUUID, updateBillWithDistributions, deleteBillByUUID } from '@/lib/database-prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = await getBillByUUID(id);
    
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
    const { title, items, billSet, isDraft } = body;

    // Use updateBillWithDistributions if billSet is provided, otherwise use regular update
    const updated = billSet 
      ? await updateBillWithDistributions(id, title, items, billSet, isDraft)
      : await updateBillByUUID(id, title, items, isDraft);
    
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
    
    const deleted = await deleteBillByUUID(id);
    
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
