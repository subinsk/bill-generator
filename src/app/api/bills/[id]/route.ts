import { NextRequest, NextResponse } from 'next/server';
import { getBillById, deleteBill, saveBill } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'अवैध बिल ID' },
        { status: 400 }
      );
    }

    const billData = getBillById(id);
    
    if (!billData) {
      return NextResponse.json(
        { error: 'बिल नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...billData
    });

  } catch (error) {
    console.error('Get bill error:', error);
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
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'अवैध बिल ID' },
        { status: 400 }
      );
    }

    const deleted = deleteBill(id);
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'अवैध बिल ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, items, billSet } = body;

    // For now, we'll delete and recreate (in a real app, you'd want proper update logic)
    const deleted = deleteBill(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'मूल बिल नहीं मिला' },
        { status: 404 }
      );
    }

    // Create new bill with same ID logic would be complex, so we'll create new
    const newBillId = saveBill(title, items, billSet);

    return NextResponse.json({
      success: true,
      billId: newBillId,
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
