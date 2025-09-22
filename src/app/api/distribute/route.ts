import { NextRequest, NextResponse } from 'next/server';
import { BillDistributor } from '@/lib/distribution';
import { Item } from '@/types';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, method = APP_CONFIG.DISTRIBUTION_METHOD } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'वस्तुओं की सूची आवश्यक है' },
        { status: 400 }
      );
    }

    // Validate each item
    const validatedItems: Item[] = items.map((item: {
      id?: string;
      name: string;
      rate: number;
      quantity: number;
      allowsDecimal: boolean;
      minQuantity?: number;
      maxQuantity?: number;
    }, index: number) => {
      if (!item.name || typeof item.rate !== 'number' || typeof item.quantity !== 'number') {
        throw new Error(`वस्तु ${index + 1} में अमान्य डेटा`);
      }

      return {
        id: item.id || `item-${Date.now()}-${index}`,
        name: item.name,
        rate: item.rate,
        quantity: item.quantity,
        allowsDecimal: item.allowsDecimal || false,
        minQuantity: item.minQuantity,
        maxQuantity: item.maxQuantity
      };
    });

    // Choose distribution method
    let result;
    if (method === 'single') {
      result = BillDistributor.distributeItemsSingleAdjustment(validatedItems);
    } else {
      result = BillDistributor.distributeItems(validatedItems);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Validate the distribution
    const isValid = BillDistributor.validateDistribution(result.billSet!);
    
    return NextResponse.json({
      success: true,
      billSet: result.billSet,
      valid: isValid,
      method: method
    });

  } catch (error) {
    console.error('Distribution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'सर्वर त्रुटि' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'बिल वितरण API चालू है' },
    { status: 200 }
  );
}
