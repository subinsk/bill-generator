'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { GSTBill } from '@/types';
import GSTBillDisplay from '@/components/GSTBillDisplay';

export default function GSTBillViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [bill, setBill] = useState<GSTBill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const savedParam = searchParams.get('saved');

  useEffect(() => {
    fetchBill();
  }, [params.id]);

  const fetchBill = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/gst-bills/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'GST बिल लोड करने में त्रुटि');
      }

      setBill(data.bill);
    } catch (err) {
      console.error('Fetch GST bill error:', err);
      setError(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    if (!bill) return;
    
    const { exportGSTBillToExcel } = await import('@/lib/gstExcelExport');
    exportGSTBillToExcel(bill);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">GST बिल लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">त्रुटि</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/gst-bills"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            वापस जाएं
          </Link>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">GST बिल नहीं मिला</h2>
          <p className="text-gray-600 mb-4">यह GST बिल मौजूद नहीं है या डिलीट हो गया है</p>
          <Link
            href="/gst-bills"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            वापस जाएं
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/gst-bills"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            वापस जाएं
          </Link>
        </div>

        {/* Success Message */}
        {savedParam === 'true' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-green-700">
              <span className="font-medium">GST बिल सफलतापूर्वक सेव हो गया!</span>
            </div>
          </div>
        )}

        {/* Bill Display */}
        <GSTBillDisplay 
          bill={bill} 
          onExportToExcel={handleExportToExcel}
          showActions={true}
        />
      </div>
    </div>
  );
}
