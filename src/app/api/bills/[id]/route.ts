import { NextRequest, NextResponse } from 'next/server';
import { getBillByUUID, updateBillByUUID, updateBillWithDistributions, deleteBillByUUID } from '@/lib/database-prisma';
import { BillDistributor } from '@/lib/distribution';
import { APP_CONFIG } from '@/lib/config';

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

    // CRITICAL: Always re-generate distribution with updated logic
    let updatedBillSet = billSet;
    
    if (items && items.length > 0) {
      console.log('Re-generating distribution with updated logic...');
      
      // Re-generate distribution using the updated logic
      const distributionResult = BillDistributor.distributeItems(items);
      
      if (distributionResult.success) {
        updatedBillSet = distributionResult.billSet;
        console.log('Distribution re-generated successfully');
        
        // No validation or adjustment - only use correct distribution
      } else {
        console.error('Failed to re-generate distribution:', distributionResult.error);
        return NextResponse.json(
          { error: `Distribution error: ${distributionResult.error}` },
          { status: 400 }
        );
      }
    }

    // Use updateBillWithDistributions with the re-generated billSet
    const updated = updatedBillSet 
      ? await updateBillWithDistributions(id, title, items, updatedBillSet, isDraft)
      : await updateBillByUUID(id, title, items, isDraft);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'बिल अपडेट नहीं हो सका' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'बिल सफलतापूर्वक अपडेट हो गया',
      billSet: updatedBillSet // Return the updated distribution
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
