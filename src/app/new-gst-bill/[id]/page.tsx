'use client';

import React, { useState, useEffect, use } from 'react';
import { ArrowLeft, Save, Eye, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GSTItem, GSTBillDetails, GSTBill } from '@/types';
import GSTItemForm from '@/components/GSTItemForm';
import GSTBillDisplay from '@/components/GSTBillDisplay';
import { 
  calculateGSTBillTotals, 
  createTaxSummary, 
  numberToWords, 
  generateInvoiceNumber,
  formatDateForBill
} from '@/lib/gstCalculations';
import { cn } from '@/lib/utils';

interface NewGSTBillPageProps {
  params: Promise<{ id: string }>;
}

export default function NewGSTBillPage({ params }: NewGSTBillPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [items, setItems] = useState<GSTItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [billDetails, setBillDetails] = useState<GSTBillDetails>({
    companyName: 'ASHAPURA CONSTRUCTIONS',
    companyAddress: 'HANUMAN SHALA SCHOOL KE SAMNE, AHORE',
    companyGSTIN: '08CBWPM6776L2ZE',
    companyPAN: 'CBWPM6776L',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    placeOfSupply: 'Rajasthan (08)',
    reverseCharge: 'N',
    billedToName: '',
    billedToAddress: '',
    billedToGSTIN: '',
    shippedToName: '',
    shippedToAddress: '',
    shippedToGSTIN: '',
    bankDetails: 'RMGB CA AC NO. 8306041866\nRMGB0000103 RMGB AHORE',
    termsConditions: [
      'E. & O.E.',
      'Goods once sold will not be taken back.',
      'Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.',
      'Subject to "JALORE" Jurisdiction only.'
    ]
  });

  // Fetch existing draft or initialize new one
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/gst-bills/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.bill) {
            // API returns { success: true, bill: gstBillData }
            setBillDetails(data.bill.billDetails || {
              companyName: 'ASHAPURA CONSTRUCTIONS',
              companyAddress: 'HANUMAN SHALA SCHOOL KE SAMNE, AHORE',
              companyGSTIN: '08CBWPM6776L2ZE',
              companyPAN: 'CBWPM6776L',
              invoiceNo: '',
              invoiceDate: '',
              billedToName: '',
              billedToAddress: '',
              billedToGSTIN: '',
              placeOfSupply: 'राजस्थान'
            });
            setItems(data.bill.items || []);
          }
        } else {
          // If not found, it's a new draft, use default state
          console.log('No existing draft found for ID, using default.');
        }
      } catch (err) {
        console.error('Error fetching draft:', err);
        toast.error('ड्राफ्ट लोड करने में त्रुटि');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDraft();
  }, [id]);

  // Auto-save draft functionality - starts immediately
  useEffect(() => {
    // Initial save when component loads
    const initialSave = setTimeout(() => {
      saveDraft();
    }, 2000); // Save after 2 seconds of loading

    const timer = setInterval(() => {
      // Auto-save regardless of content - save the current state
      saveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => {
      clearTimeout(initialSave);
      clearInterval(timer);
    };
  }, [billDetails, items, id]);

  const saveDraft = async () => {
    try {
      setIsSaving(true);
      const draftBill = generatePreview();
      
      const response = await fetch(`/api/gst-bills/${id}`, {
        method: 'PUT', // Always PUT for existing ID
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...draftBill,
          isDraft: true // Mark as draft
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastSaved(new Date());
      } else {
        toast.error(data.error || 'ड्राफ्ट सेव करने में त्रुटि');
      }
    } catch (error) {
      console.error('Draft save error:', error);
      toast.error('ड्राफ्ट सेव करने में त्रुटि');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreview = (): GSTBill => {
    const totals = calculateGSTBillTotals(items);
    const taxSummary = createTaxSummary(items);
    
    const currentInvoiceNo = billDetails.invoiceNo || generateInvoiceNumber();

    const fullBill: GSTBill = {
      id: id, // Use ID for consistency
      billDetails: {
        ...billDetails,
        invoiceNo: currentInvoiceNo,
        invoiceDate: billDetails.invoiceDate || formatDateForBill(new Date()),
      },
      items: items,
      grandTotal: totals.grandTotal,
      totalUnits: totals.totalUnits,
      totalTaxableAmount: totals.totalTaxableAmount,
      totalCGSTAmount: totals.totalCGSTAmount,
      totalSGSTAmount: totals.totalSGSTAmount,
      totalTaxAmount: totals.totalTaxAmount,
      bsrDeduction: totals.bsrDeduction,
      finalAmount: totals.finalAmount,
      taxSummary: taxSummary,
      amountInWords: numberToWords(totals.finalAmount),
      createdAt: new Date().toISOString(),
    };
    return fullBill;
  };

  const handleSaveBill = async () => {
    setIsLoading(true);
    try {
      const finalBill = generatePreview();
      
      const response = await fetch(`/api/gst-bills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...finalBill,
          isDraft: false // Mark as final bill
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल सेव करने में त्रुटि');
      }

      router.push(`/gst-bills?saved=true`);
    } catch (err) {
      console.error('Save bill error:', err);
      toast.error(err instanceof Error ? err.message : 'बिल सेव करने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
          <p className="text-gray-600">बिल लोड हो रहा है...</p>
        </div>
      </div>
    );
  }


  if (showPreview) {
    const previewBill = generatePreview();
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              एडिट पर वापस जाएं
            </button>
            <h1 className="text-2xl font-bold text-gray-800">GST बिल प्रीव्यू</h1>
            <button
              onClick={handleSaveBill}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={20} />
              बिल सेव करें
            </button>
          </div>
          <GSTBillDisplay bill={previewBill} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/gst-bills"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            वापस जाएं
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-600 p-3 rounded-full">
                  <FileText className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                  नया GST बिल बनाएं
                </h1>
              </div>
              <button
                onClick={saveDraft}
                disabled={isSaving}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
              >
                {isSaving ? 'सेव हो रहा है...' : 'ड्राफ्ट सेव करें'}
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              यहां अपने GST बिल का विवरण और वस्तुएं दर्ज करें।
            </p>
          </div>
        </div>

        {/* Auto-save Status */}
        {(lastSaved || isSaving) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-blue-700">
              <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm">
                {isSaving 
                  ? 'ड्राफ्ट सेव हो रहा है...' 
                  : `अंतिम बार सेव किया गया: ${lastSaved?.toLocaleTimeString('hi-IN')}`
                }
              </span>
            </div>
          </div>
        )}

        {/* Company Details Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">कंपनी विवरण</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                कंपनी का नाम
              </label>
              <input
                type="text"
                value={billDetails.companyName}
                onChange={(e) => setBillDetails(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Company Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                कंपनी का पता
              </label>
              <input
                type="text"
                value={billDetails.companyAddress}
                onChange={(e) => setBillDetails(prev => ({ ...prev, companyAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN
              </label>
              <input
                type="text"
                value={billDetails.companyGSTIN}
                onChange={(e) => setBillDetails(prev => ({ ...prev, companyGSTIN: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* PAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN
              </label>
              <input
                type="text"
                value={billDetails.companyPAN}
                onChange={(e) => setBillDetails(prev => ({ ...prev, companyPAN: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Invoice No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                इनवॉइस नंबर
              </label>
              <input
                type="text"
                value={billDetails.invoiceNo}
                onChange={(e) => setBillDetails(prev => ({ ...prev, invoiceNo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="AUTO-GENERATED"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                इनवॉइस दिनांक
              </label>
              <input
                type="date"
                value={billDetails.invoiceDate}
                onChange={(e) => setBillDetails(prev => ({ ...prev, invoiceDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Billed To Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                बिल करने वाले का नाम
              </label>
              <input
                type="text"
                value={billDetails.billedToName}
                onChange={(e) => setBillDetails(prev => ({ ...prev, billedToName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="ग्राहक का नाम"
              />
            </div>

            {/* Billed To Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                बिल करने वाले का पता
              </label>
              <input
                type="text"
                value={billDetails.billedToAddress}
                onChange={(e) => setBillDetails(prev => ({ ...prev, billedToAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="ग्राहक का पता"
              />
            </div>

            {/* Billed To GSTIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ग्राहक GSTIN <span className="text-gray-400">(वैकल्पिक)</span>
              </label>
              <input
                type="text"
                value={billDetails.billedToGSTIN}
                onChange={(e) => setBillDetails(prev => ({ ...prev, billedToGSTIN: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="ग्राहक का GSTIN"
              />
            </div>

            {/* Place of Supply */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                आपूर्ति का स्थान
              </label>
              <input
                type="text"
                value={billDetails.placeOfSupply}
                onChange={(e) => setBillDetails(prev => ({ ...prev, placeOfSupply: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Item Form */}
        <GSTItemForm items={items} onItemsChange={setItems} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            <Eye size={20} />
            प्रीव्यू देखें
          </button>
          <button
            onClick={handleSaveBill}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save size={20} />
            बिल सेव करें
          </button>
        </div>
      </div>
    </div>
  );
}
