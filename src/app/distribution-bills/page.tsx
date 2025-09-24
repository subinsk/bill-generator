'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye, Trash2, Calculator, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SavedBill } from '@/lib/database';
import { cn } from '@/lib/utils';

export default function DistributionBillsPage() {
  const [bills, setBills] = useState<SavedBill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingBillId, setDeletingBillId] = useState<number | null>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bills');
      
      if (!response.ok) {
        throw new Error('बिल लोड करने में त्रुटि');
      }

      const data = await response.json();
      setBills(data.bills || []);
    } catch (err) {
      console.error('Fetch bills error:', err);
      toast.error(err instanceof Error ? err.message : 'बिल लोड करने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBill = async (billUuid: string, billId: number) => {
    if (!confirm('क्या आप वाकई इस बिल को डिलीट करना चाहते हैं?')) {
      return;
    }

    try {
      setDeletingBillId(billId);
      const response = await fetch(`/api/bills/${billUuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'बिल डिलीट करने में त्रुटि');
      }

      // Response is successful, remove from list
      setBills(bills.filter(bill => bill.id !== billId));
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setDeletingBillId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              होम पर वापस जाएं
            </Link>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mx-auto max-w-4xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                  <Calculator className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">
                  स्मार्ट वितरण बिल मैनेजमेंट
                </h1>
              </div>
              <p className="text-gray-600 text-base">
                अपने सभी वितरण बिल यहाँ मैनेज करें
              </p>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                वितरण बिल ({bills.length})
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchBills}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  रिफ्रेश करें
                </button>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    console.log('Button clicked - creating new distribution bill...');
                    try {
                      const response = await fetch('/api/new-bill', { 
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                      const data = await response.json();
                      console.log('API Response:', data);
                      if (response.ok && data.uuid) {
                        console.log('Navigating to:', `/new-bill/${data.uuid}`);
                        window.location.href = `/new-bill/${data.uuid}`;
                      } else {
                        console.error('API Error:', data);
                        alert('वितरण बिल बनाने में त्रुटि: ' + (data.error || 'अज्ञात त्रुटि'));
                      }
                    } catch (error) {
                      console.error('Error creating distribution bill:', error);
                      alert('वितरण बिल बनाने में त्रुटि: ' + (error instanceof Error ? error.message : 'अज्ञात त्रुटि'));
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  type="button"
                >
                  <Plus size={18} />
                  नया वितरण बिल बनाएं
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="animate-spin mx-auto mb-3 text-gray-400" size={24} />
                  <p className="text-gray-500 text-sm">वितरण बिल लोड हो रहे हैं...</p>
                </div>
              </div>
            ) : bills.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calculator className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">कोई वितरण बिल नहीं मिला</h3>
                <p className="text-gray-500 text-sm mb-6">अपना पहला स्मार्ट वितरण बिल बनाकर शुरुआत करें</p>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    console.log('Empty state button clicked - creating first distribution bill...');
                    try {
                      const response = await fetch('/api/new-bill', { 
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                      const data = await response.json();
                      console.log('API Response:', data);
                      if (response.ok && data.uuid) {
                        console.log('Navigating to:', `/new-bill/${data.uuid}`);
                        window.location.href = `/new-bill/${data.uuid}`;
                      } else {
                        console.error('API Error:', data);
                        alert('वितरण बिल बनाने में त्रुटि: ' + (data.error || 'अज्ञात त्रुटि'));
                      }
                    } catch (error) {
                      console.error('Error creating distribution bill:', error);
                      alert('वितरण बिल बनाने में त्रुटि: ' + (error instanceof Error ? error.message : 'अज्ञात त्रुटि'));
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors cursor-pointer"
                  type="button"
                >
                  <Plus size={16} />
                  पहला वितरण बिल बनाएं
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div key={bill.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {bill.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>कुल राशि: ₹{bill.total_amount.toLocaleString('en-IN')}</span>
                          <span>{formatDate(bill.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/bill/${bill.uuid}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors text-sm"
                        >
                          <Eye size={14} />
                          देखें
                        </Link>
                        
                        <button
                          onClick={() => deleteBill(bill.uuid, bill.id)}
                          disabled={deletingBillId === bill.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 text-sm"
                        >
                          {deletingBillId === bill.id ? (
                            <RefreshCw className="animate-spin" size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          हटाएं
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
