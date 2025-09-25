'use client';

import React, { useState, useEffect, use } from 'react';
import { Calculator, RefreshCw, AlertTriangle, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ItemForm } from '@/components/ItemForm';
import { BillDisplay } from '@/components/BillDisplay';
import { Item, BillSet } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';

interface NewBillPageProps {
  params: Promise<{ id: string }>;
}

export default function NewBillPage({ params }: NewBillPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [billSet, setBillSet] = useState<BillSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [billTitle, setBillTitle] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  const generateDefaultBillTitle = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    const timestamp = Date.now();
    const counter = timestamp.toString().slice(-3); 
    
    return `बिल-${year}${month}${day}-${counter}`;
  };

  // Fetch existing draft or initialize new one
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/bills/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.bill) {
            // API returns { success: true, bill: { bill, items, distributions } }
            const billData = data.bill;
            setBillTitle(billData.bill?.title || '');
            
            // Convert database items to frontend format
            const editableItems: Item[] = (billData.items || []).map((item: {
              id: number;
              bill_id: number;
              name: string;
              rate: number;
              quantity: number;
              allows_decimal: boolean;
            }, index: number) => ({
              id: `item-${index}`,
              name: item.name,
              rate: item.rate,
              quantity: item.quantity,
              allowsDecimal: item.allows_decimal
            }));
            setItems(editableItems);
          }
        } else {
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
  }, [billTitle, items, id]);

  // Auto-save when title changes (debounced)
  useEffect(() => {
    if (!isLoading) { // Only after initial load
      const saveTimer = setTimeout(() => {
        saveDraft();
      }, 3000); // Save 3 seconds after title change

      return () => clearTimeout(saveTimer);
    }
  }, [billTitle, isLoading]);

  // Auto-save when items change (debounced)
  useEffect(() => {
    if (!isLoading) { // Only after initial load
      const saveTimer = setTimeout(() => {
        saveDraft();
      }, 5000); // Save 5 seconds after items change

      return () => clearTimeout(saveTimer);
    }
  }, [items, isLoading]);

  const saveDraft = async () => {
    try {
      setIsDraftSaving(true);
      const title = billTitle.trim() || generateDefaultBillTitle();
      
      const response = await fetch(`/api/bills/${id}`, {
        method: 'PUT', // Always PUT for existing ID
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          items: items || [],
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
      setIsDraftSaving(false);
    }
  };

  const generateBills = async () => {
    if (!items || items.length === 0) {
      toast.error('कम से कम एक वस्तु जोड़ें');
      return;
    }

    setIsGenerating(true);

    try {
      const decimalItems = (items || []).filter(item => item.allowsDecimal);
      const targetItem = APP_CONFIG.PREFERRED_ADJUSTMENT_ITEM;
      
      if (decimalItems.length === 0) {
        toast.error('कम से कम एक दशमलव वस्तु होनी चाहिए वितरण के लिए');
        setIsGenerating(false);
        return;
      }

      // Find preferred item or use first decimal item
      const adjustmentItem = decimalItems.find(item => 
        item.name.toLowerCase().includes(targetItem.toLowerCase())
      ) || decimalItems[0];

      const response = await fetch('/api/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items || [],
          adjustmentItemId: adjustmentItem.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल बनाने में त्रुटि');
      }

      setBillSet(data.billSet);
    } catch (err) {
      console.error('Generate bills error:', err);
      toast.error(err instanceof Error ? err.message : 'बिल बनाने में त्रुटि');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBill = async () => {
    setIsSaving(true);
    setSuccessMessage('');

    try {
      if (!billSet) {
        await generateBills(); // Ensure bills are generated before saving
        if (!billSet) { // Check again after generation
          throw new Error('बिल बनाने में त्रुटि: कोई बिल सेट नहीं');
        }
      }

      const titleToSave = billTitle.trim() || generateDefaultBillTitle();

      const response = await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleToSave,
          items,
          billSet,
          isDraft: false // Mark as final bill
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल सेव करने में त्रुटि');
      }

      setSuccessMessage('बिल सफलतापूर्वक सेव हो गया!');
      router.push(`/distribution-bills?saved=true`);
    } catch (err) {
      console.error('Save bill error:', err);
      toast.error(err instanceof Error ? err.message : 'बिल सेव करने में त्रुटि');
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/distribution-bills"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            वापस जाएं
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Calculator className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                  नया वितरण बिल बनाएं
                </h1>
              </div>
              <button
                onClick={saveDraft}
                disabled={isDraftSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg border border-blue-300 font-medium transition-colors text-sm"
              >
                <Save size={16} />
                {isDraftSaving ? 'सेव हो रहा है...' : 'ड्राफ्ट सेव करें'}
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              यहां अपने वितरण बिल का विवरण और वस्तुएं दर्ज करें।
            </p>
          </div>
        </div>

        {/* Auto-save Status */}
        {(lastSaved || isDraftSaving) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-blue-700">
              <div className={`w-2 h-2 rounded-full ${isDraftSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm">
                {isDraftSaving 
                  ? 'ड्राफ्ट सेव हो रहा है...' 
                  : `अंतिम बार सेव किया गया: ${lastSaved?.toLocaleTimeString('hi-IN')}`
                }
              </span>
            </div>
          </div>
        )}

        {/* Bill Title */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">बिल का शीर्षक</h3>
          <input
            type="text"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={generateDefaultBillTitle()}
          />
        </div>

        {/* Item Form */}
        <ItemForm items={items} onItemsChange={setItems} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={generateBills}
            disabled={isGenerating || !items || items.length === 0}
            className={cn(
              "flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors",
              isGenerating && "opacity-50 cursor-not-allowed"
            )}
          >
            <Calculator size={20} />
            बिल बनाएं
          </button>
        </div>

        {/* Loading indicator for bill generation */}
        {isGenerating && !billSet && (
          <div className="mt-8 text-center py-8">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={24} />
            <p className="text-gray-600">बिल बन रहा है...</p>
          </div>
        )}

        {/* Bill Display */}
        {billSet && (
          <div className="mt-8">
            <BillDisplay billSet={billSet} />
            <div className="flex justify-end mt-6">
              <button
                onClick={saveBill}
                disabled={isSaving || !billTitle.trim()}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors",
                  isSaving && "opacity-50 cursor-not-allowed"
                )}
              >
                <Save size={20} />
                {isSaving ? 'सेव हो रहा है...' : 'बिल सेव करें'}
              </button>
            </div>
          </div>
        )}


        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 text-green-700">
            <Save size={20} className="inline mr-2" />
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
