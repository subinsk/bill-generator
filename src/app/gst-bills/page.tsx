'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye, Trash2, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SavedGSTBill } from '@/lib/database';
import { cn } from '@/lib/utils';

export default function GSTBillsPage() {
  const [gstBills, setGstBills] = useState<SavedGSTBill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingBillId, setDeletingBillId] = useState<number | null>(null);

  useEffect(() => {
    fetchGSTBills();
  }, []);

  const fetchGSTBills = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gst-bills');
      
      if (!response.ok) {
        throw new Error('GST बिल लोड करने में त्रुटि');
      }

      const data = await response.json();
      setGstBills(data.bills || []);
    } catch (err) {
      console.error('Fetch GST bills error:', err);
      toast.error(err instanceof Error ? err.message : 'GST बिल लोड करने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGSTBill = async (billUuid: string, billId: number) => {
    if (!confirm('क्या आप वाकई इस GST बिल को डिलीट करना चाहते हैं?')) {
      return;
    }

    try {
      setDeletingBillId(billId);
      const response = await fetch(`/api/gst-bills/${billUuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'GST बिल डिलीट करने में त्रुटि');
      }

      // Response is successful, remove from list
      setGstBills(gstBills.filter(bill => bill.id !== billId));
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-emerald-100">
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
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg">
                  <FileText className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">
                  GST बिल मैनेजमेंट
                </h1>
              </div>
              <p className="text-gray-600 text-base">
                अपने सभी GST इनवॉइस यहाँ मैनेज करें
              </p>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                GST बिल ({gstBills.length})
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchGSTBills}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  रिफ्रेश करें
                </button>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    console.log('Button clicked - creating new GST bill...');
                    try {
                      const response = await fetch('/api/new-gst-bill', { 
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                      const data = await response.json();
                      console.log('API Response:', data);
                      if (response.ok && data.uuid) {
                        console.log('Navigating to:', `/new-gst-bill/${data.uuid}`);
                        window.location.href = `/new-gst-bill/${data.uuid}`;
                      } else {
                        console.error('API Error:', data);
                        alert('GST बिल बनाने में त्रुटि: ' + (data.error || 'अज्ञात त्रुटि'));
                      }
                    } catch (error) {
                      console.error('Error creating GST bill:', error);
                      alert('GST बिल बनाने में त्रुटि: ' + (error instanceof Error ? error.message : 'अज्ञात त्रुटि'));
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  type="button"
                >
                  <Plus size={18} />
                  नया GST बिल बनाएं
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
                  <p className="text-gray-500 text-sm">GST बिल लोड हो रहे हैं...</p>
                </div>
              </div>
            ) : gstBills.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">कोई GST बिल नहीं मिला</h3>
                <p className="text-gray-500 text-sm mb-6">अपना पहला GST बिल बनाकर शुरुआत करें</p>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    console.log('Empty state button clicked - creating first GST bill...');
                    try {
                      const response = await fetch('/api/new-gst-bill', { 
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                      const data = await response.json();
                      console.log('API Response:', data);
                      if (response.ok && data.uuid) {
                        console.log('Navigating to:', `/new-gst-bill/${data.uuid}`);
                        window.location.href = `/new-gst-bill/${data.uuid}`;
                      } else {
                        console.error('API Error:', data);
                        alert('GST बिल बनाने में त्रुटि: ' + (data.error || 'अज्ञात त्रुटि'));
                      }
                    } catch (error) {
                      console.error('Error creating GST bill:', error);
                      alert('GST बिल बनाने में त्रुटि: ' + (error instanceof Error ? error.message : 'अज्ञात त्रुटि'));
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors cursor-pointer"
                  type="button"
                >
                  <Plus size={16} />
                  पहला GST बिल बनाएं
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {gstBills.map((bill) => (
                  <div key={bill.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {bill.invoice_no} - {bill.billed_to_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>कुल: ₹{bill.grand_total.toLocaleString('en-IN')}</span>
                          <span>अंतिम: ₹{bill.final_amount.toLocaleString('en-IN')}</span>
                          <span>{formatDate(bill.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/gst-bill/${bill.uuid}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors text-sm"
                        >
                          <Eye size={14} />
                          देखें
                        </Link>
                        <button
                          onClick={() => deleteGSTBill(bill.uuid, bill.id)}
                          disabled={deletingBillId === bill.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors text-sm disabled:opacity-50"
                        >
                          {deletingBillId === bill.id ? (
                            <RefreshCw className="animate-spin" size={14} />
                          ) : (
                            <Trash2 size={14} />
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
