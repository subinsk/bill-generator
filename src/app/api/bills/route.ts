import { NextRequest, NextResponse } from 'next/server';
import { saveBill, getAllBills } from '@/lib/database-prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, items, billSet, isAutoSave = false } = body;

    // Validate input
    if (!title || !items || !billSet) {
      return NextResponse.json(
        { error: 'शीर्षक, वस्तुएं और बिल सेट आवश्यक हैं' },
        { status: 400 }
      );
    }

    if (!title.trim()) {
      return NextResponse.json(
        { error: 'बिल का शीर्षक आवश्यक है' },
        { status: 400 }
      );
    }

    // For auto-save, check if bill already exists and update it
    if (isAutoSave) {
      try {
        // Try to find existing bill with same title (simple approach for now)
        const existingBills = await getAllBills();
        const existingBill = existingBills.find(bill => bill.title === title.trim());
        
        if (existingBill) {
          // For auto-save, we could either skip or update
          // For now, let's skip to avoid duplicates
          return NextResponse.json({
            success: true,
            billId: existingBill.id,
            message: 'बिल पहले से मौजूद है',
            alreadyExists: true
          });
        }
      } catch (checkError) {
        // If check fails, proceed with saving
        console.warn('Could not check for existing bill:', checkError);
      }
    }

    // Save bill to database
    const billId = await saveBill(title.trim(), items, billSet);

    return NextResponse.json({
      success: true,
      billId,
      message: isAutoSave ? 'बिल स्वचालित रूप से सेव हो गया' : 'बिल सफलतापूर्वक सेव हो गया'
    });

  } catch (error) {
    console.error('Save bill error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'सर्वर त्रुटि' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bills = await getAllBills();
    return NextResponse.json({
      success: true,
      bills
    });
  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'डेटाबेस कनेक्शन त्रुटि' },
      { status: 500 }
    );
  }
}
