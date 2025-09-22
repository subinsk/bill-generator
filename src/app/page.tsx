'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Calculator, Plus, Eye, Trash2, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { hi } from 'date-fns/locale';
import { SavedBill } from '@/lib/database';
import { cn } from '@/lib/utils';

function HomeContent() {
  const [bills, setBills] = useState<SavedBill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deletingBillId, setDeletingBillId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const savedParam = searchParams.get('saved');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/bills');
      
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('सर्वर त्रुटि - कृपया पेज रिफ्रेश करें');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('सर्वर से अमान्य प्रतिक्रिया मिली');
      }

      const data = await response.json();
      setBills(data.bills || []);
    } catch (err) {
      console.error('Fetch bills error:', err);
      setError(err instanceof Error ? err.message : 'बिल लोड करने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBill = async (billId: number) => {
    if (!confirm('क्या आप वाकई इस बिल को डिलीट करना चाहते हैं?')) {
      return;
    }

    try {
      setDeletingBillId(billId);
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल डिलीट करने में त्रुटि');
      }

      // Remove bill from list
      setBills(bills.filter(bill => bill.id !== billId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setDeletingBillId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: hi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mx-auto max-w-4xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-blue-600 p-3 rounded-full">
                <Calculator className="text-white" size={32} />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                हिंदी बिल जेनरेटर
              </h1>
            </div>
            <p className="text-gray-600 text-xl mb-6">
              📊 वस्तुओं को 60%, 30%, और 10% में स्वचालित वितरण
            </p>
            <div className="text-sm text-gray-500">
              💡 Excel फॉर्मेट में बिल जेनरेशन और ऑटो-सेव
            </div>
          </div>
        </div>

        {/* Success Message */}
        {savedParam === 'true' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-green-700">
              <FileText size={20} />
              <span className="font-medium">बिल सफलतापूर्वक सेव हो गया!</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle size={20} />
              <span className="font-medium">त्रुटि: {error}</span>
            </div>
          </div>
        )}

        {/* Create New Bill Button */}
        <div className="text-center mb-8">
          <Link
            href="/new-bill"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={24} />
            नया बिल बनाएं
          </Link>
        </div>

        {/* Bills List */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  सेव किए गए बिल
                </h2>
                <button
                  onClick={fetchBills}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  रिफ्रेश करें
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
                <p className="text-gray-600">बिल लोड हो रहे हैं...</p>
              </div>
            ) : bills.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-4">अभी तक कोई बिल सेव नहीं किया गया है</p>
                <Link
                  href="/new-bill"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  पहला बिल बनाएं
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {bills.map((bill) => (
                  <div key={bill.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {bill.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calculator size={14} />
                            कुल राशि: ₹{bill.total_amount.toLocaleString('hi-IN')}
                          </span>
                          <span>
                            {formatDate(bill.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/bill/${bill.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                          देखें
                        </Link>
                        
                        <button
                          onClick={() => deleteBill(bill.id)}
                          disabled={deletingBillId === bill.id}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingBillId === bill.id ? (
                            <RefreshCw className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          {deletingBillId === bill.id ? 'डिलीट हो रहा है...' : 'डिलीट करें'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">लोड हो रहा है...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}