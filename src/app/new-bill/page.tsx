'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, AlertTriangle, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ItemForm } from '@/components/ItemForm';
import { BillDisplay } from '@/components/BillDisplay';
import { Item, BillSet } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';

export default function NewBillPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [billSet, setBillSet] = useState<BillSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [billTitle, setBillTitle] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const generateDefaultBillTitle = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    // Generate a simple counter based on timestamp
    const timestamp = Date.now();
    const counter = timestamp.toString().slice(-3); // Last 3 digits
    
    return `बिल-${year}${month}${day}-${counter}`;
  };

  const generateBills = async () => {
    if (items.length === 0) {
      setError('कम से कम एक वस्तु जोड़ें');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const decimalItems = items.filter(item => item.allowsDecimal);
      let targetItem = APP_CONFIG.PREFERRED_ADJUSTMENT_ITEM;
      
      if (APP_CONFIG.DISTRIBUTION_METHOD === 'single' && !targetItem && decimalItems.length > 0) {
        targetItem = decimalItems[0].name;
      }

      const response = await fetch('/api/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          method: APP_CONFIG.DISTRIBUTION_METHOD,
          targetItem: targetItem
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल जनरेशन में त्रुटि');
      }

      setBillSet(data.billSet);
      
      // Auto-save with default title if no title is provided
      const autoSaveTitle = billTitle.trim() || generateDefaultBillTitle();
      setBillTitle(autoSaveTitle);
      
      // Auto-save the bill
      setTimeout(() => {
        autoSaveBill(autoSaveTitle, data.billSet);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveBill = async (title: string, generatedBillSet: BillSet) => {
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          items,
          billSet: generatedBillSet,
          isAutoSave: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('बिल ऑटो-सेव हो गया:', data.billId);
        if (!data.alreadyExists) {
          setSuccessMessage('✅ बिल स्वचालित रूप से सेव हो गया!');
          setError('');
          // Hide success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
      // Don't show auto-save errors to user, they can still manually save
    }
  };

  const saveBill = async () => {
    if (!billSet || !billTitle.trim()) {
      setError('कृपया बिल का शीर्षक दर्ज करें');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: billTitle,
          items,
          billSet
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल सेव करने में त्रुटि');
      }

      // Redirect to home page after successful save
      router.push('/?saved=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setItems([]);
    setBillSet(null);
    setError('');
    setBillTitle('');
    setSuccessMessage('');
  };

  // Auto-generation disabled - user must click "बिल जेनरेट करें" button
  // useEffect(() => {
  //   if (items.length > 0) {
  //     const timeoutId = setTimeout(() => {
  //       generateBills();
  //     }, 1000); // Auto-generate after 1 second of inactivity
  //     
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            वापस जाएं
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Calculator className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                नया बिल बनाएं
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  बिल का शीर्षक
                </label>
                <input
                  type="text"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  placeholder="उदाहरण: घर निर्माण बिल - मार्च 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {billSet && (
                <button
                  onClick={saveBill}
                  disabled={isSaving || !billTitle.trim()}
                  className={cn(
                    "px-6 py-2 rounded-md font-medium text-white transition-colors flex items-center gap-2",
                    isSaving || !billTitle.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      सेव हो रहा है...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      बिल सेव करें
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-green-700">
              <span className="font-medium">{successMessage}</span>
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

        {/* Item Form */}
        <div className="mb-8 max-w-6xl mx-auto">
          <ItemForm items={items} onItemsChange={setItems} />
        </div>

        {/* Generate Bills Button */}
        {items.length > 0 && (
          <div className="text-center mb-8">
            <div className="flex gap-4 justify-center">
              <button
                onClick={generateBills}
                disabled={isLoading}
                className={cn(
                  "px-8 py-3 rounded-lg font-medium text-white transition-all duration-200",
                  "flex items-center gap-2",
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
                )}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    बिल तैयार हो रहे हैं...
                  </>
                ) : (
                  <>
                    <Calculator size={20} />
                    बिल जेनरेट करें
                  </>
                )}
              </button>

              <button
                onClick={resetForm}
                className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                रीसेट करें
              </button>
            </div>
          </div>
        )}

        {/* Bill Display */}
        {billSet && (
          <div className="mb-8 max-w-7xl mx-auto">
            <BillDisplay billSet={billSet} />
          </div>
        )}
      </div>
    </div>
  );
}
