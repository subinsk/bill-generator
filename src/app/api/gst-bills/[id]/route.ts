import { NextRequest, NextResponse } from 'next/server';
import { getGSTBillByUUID, updateGSTBillByUUID, deleteGSTBillByUUID } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = getGSTBillByUUID(id);
    
    if (!bill) {
      return NextResponse.json(
        { error: 'GST बिल नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        bill 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GST Bill fetch error:', error);
    return NextResponse.json(
      { error: 'GST बिल लोड करने में त्रुटि' },
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
    const requestBody = await request.json();
    const { isDraft, ...gstBill } = requestBody;
    
    const updated = updateGSTBillByUUID(id, gstBill, isDraft);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'GST बिल अपडेट नहीं हो सका' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'GST बिल अपडेट हो गया'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GST Bill update error:', error);
    return NextResponse.json(
      { error: 'GST बिल अपडेट करने में त्रुटि' },
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
    
    const deleted = deleteGSTBillByUUID(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'GST बिल नहीं मिला या डिलीट नहीं हो सका' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'GST बिल सफलतापूर्वक डिलीट हो गया'
    });

  } catch (error) {
    console.error('Delete GST bill error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'सर्वर त्रुटि' },
      { status: 500 }
    );
  }
}
