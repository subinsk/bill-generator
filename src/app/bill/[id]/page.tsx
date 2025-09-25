'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Calculator, FileSpreadsheet, RefreshCw, AlertTriangle, Save, Edit } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ItemForm } from '@/components/ItemForm';
import { BillDisplay } from '@/components/BillDisplay';
import { Item, BillSet } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { formatNumber, cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ViewBillData {
  bill: {
    id: number;
    uuid: string;
    title: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    is_draft: boolean;
  };
  items: Array<{
    id: number;
    bill_id: number;
    name: string;
    rate: number;
    quantity: number;
    allows_decimal: boolean;
  }>;
  distributions: Array<{
    id: number;
    bill_id: number;
    item_name: string;
    percentage: number;
    quantity: number;
    amount: number;
  }>;
}

export default function ViewBillPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;
  
  const [billData, setBillData] = useState<ViewBillData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [billSet, setBillSet] = useState<BillSet | null>(null);
  const [billTitle, setBillTitle] = useState<string>(''); // Initialize with empty string to prevent controlled/uncontrolled switch
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchBillData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/bills/${billId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल लोड करने में त्रुटि');
      }

      // The API returns { success: true, bill: { bill, items, distributions } }
      const billData = data.bill;
      setBillData(billData);
      setBillTitle(billData.bill?.title || '');
      
      // Convert bill data to editable items
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
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchBillData();
  }, [fetchBillData]);

  const generateBills = async () => {
    if (items.length === 0) {
      toast.error('कम से कम एक वस्तु जोड़ें');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          method: APP_CONFIG.DISTRIBUTION_METHOD,
          targetItem: APP_CONFIG.PREFERRED_ADJUSTMENT_ITEM
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल जनरेशन में त्रुटि');
      }

      setBillSet(data.billSet);
      
      // Auto-save the updated bill
      setTimeout(() => {
        autoSaveBill(billTitle, data.billSet);
      }, 500);
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBill = async () => {
    if (!billTitle.trim()) {
      toast.error('बिल का शीर्षक आवश्यक है');
      return;
    }

    setIsSaving(true);

    try {
      // If no billSet exists, generate distributions automatically
      let billSetToSave = billSet;
      if (!billSetToSave && items.length > 0) {
        const response = await fetch('/api/distribute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            method: APP_CONFIG.DISTRIBUTION_METHOD,
            targetItem: APP_CONFIG.PREFERRED_ADJUSTMENT_ITEM
          }),
        });

        const data = await response.json();
        if (response.ok && data.billSet) {
          billSetToSave = data.billSet;
          setBillSet(billSetToSave);
        }
      }

      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: billTitle,
          items,
          billSet: billSetToSave
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'बिल सेव करने में त्रुटि');
      }

      setSuccessMessage('✅ बिल सफलतापूर्वक सेव हो गया!');
      setIsEditing(false);
      await fetchBillData(); // Refresh data
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsSaving(false);
    }
  };

  const autoSaveBill = async (title: string, generatedBillSet: BillSet) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          items,
          billSet: generatedBillSet
        }),
      });

      if (response.ok) {
        setSuccessMessage('✅ बिल अपडेट हो गया!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Auto-save when title changes (debounced)
  useEffect(() => {
    if (isEditing && billTitle && billData) {
      const timeoutId = setTimeout(() => {
        if (billSet) {
          autoSaveBill(billTitle, billSet);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [billTitle, isEditing, billData, billSet]);

  const downloadExcel = () => {
    if (!billData) return;

    const wb = XLSX.utils.book_new();
    const excelData = [];

    // Header rows
    excelData.push(['', '', '', '', '', '60%', '', '30%', '', '10%', '']);
    excelData.push(['क्र सं', 'सामग्री', 'दर रू', 'मात्रा', 'कुल राशि', 'मात्रा', 'Amount', 'मात्रा', 'Amount', 'मात्रा', 'Amount']);

    // Group distributions by item
    const itemGroups: { [key: string]: { item: ViewBillData['items'][0]; distributions: ViewBillData['distributions'] } } = {};
    (billData.items || []).forEach(item => {
      itemGroups[item.name] = {
        item,
        distributions: (billData.distributions || []).filter(d => d.item_name === item.name)
      };
    });

    // Data rows
    let rowIndex = 1;
    Object.values(itemGroups).forEach((group) => {
      const { item, distributions } = group;
      const dist60 = distributions.find((d) => d.percentage === 60) || { quantity: 0, amount: 0 };
      const dist30 = distributions.find((d) => d.percentage === 30) || { quantity: 0, amount: 0 };
      const dist10 = distributions.find((d) => d.percentage === 10) || { quantity: 0, amount: 0 };

      excelData.push([
        rowIndex++,
        item.name,
        item.rate,
        item.quantity,
        item.quantity * item.rate,
        parseFloat(dist60.quantity.toFixed(2)),
        parseFloat(dist60.amount.toFixed(2)),
        parseFloat(dist30.quantity.toFixed(2)),
        parseFloat(dist30.amount.toFixed(2)),
        parseFloat(dist10.quantity.toFixed(2)),
        parseFloat(dist10.amount.toFixed(2))
      ]);
    });

    // Total row
    const total60 = (billData.distributions || []).filter(d => d.percentage === 60).reduce((sum, d) => sum + d.amount, 0);
    const total30 = (billData.distributions || []).filter(d => d.percentage === 30).reduce((sum, d) => sum + d.amount, 0);
    const total10 = (billData.distributions || []).filter(d => d.percentage === 10).reduce((sum, d) => sum + d.amount, 0);

    excelData.push([
      '', '', '', 'सामग्री की कुल राशि',
      billData.bill?.total_amount || 0,
      '',
      parseFloat(total60.toFixed(2)),
      '',
      parseFloat(total30.toFixed(2)),
      '',
      parseFloat(total10.toFixed(2))
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },   // क्र सं
      { wch: 20 },  // सामग्री
      { wch: 10 },  // दर रू
      { wch: 10 },  // मात्रा
      { wch: 12 },  // कुल राशि
      { wch: 10 },  // 60% मात्रा
      { wch: 12 },  // 60% Amount
      { wch: 10 },  // 30% मात्रा
      { wch: 12 },  // 30% Amount
      { wch: 10 },  // 10% मात्रा
      { wch: 12 }   // 10% Amount
    ];

    // Merge cells for header
    ws['!merges'] = [
      { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }, // 60%
      { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } }, // 30%
      { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } }  // 10%
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'वितरित बिल');

    // Generate filename
    const fileName = `${billData.bill.title.replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '')}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">बिल लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-600 mb-4">बिल नहीं मिला</p>
          <Link
            href="/distribution-bills"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            वापस जाएं
          </Link>
        </div>
      </div>
    );
  }

  // Group distributions by item for display
  const itemGroups: { [key: string]: { item: ViewBillData['items'][0]; distributions: ViewBillData['distributions'] } } = {};
  (billData.items || []).forEach(item => {
    itemGroups[item.name] = {
      item,
      distributions: (billData.distributions || []).filter(d => d.item_name === item.name)
    };
  });

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
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <div className="mr-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      बिल का शीर्षक
                    </label>
                    <input
                      type="text"
                      value={billTitle}
                      onChange={(e) => setBillTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                      {billData.bill?.title || 'Untitled Bill'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calculator size={14} />
                        कुल राशि: ₹{billData.bill?.total_amount?.toLocaleString('en-IN') || '0'}
                      </span>
                      <span>
                        बनाया गया: {billData.bill?.created_at ? new Date(billData.bill.created_at).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      एडिट करें
                    </button>
                    <button
                      onClick={downloadExcel}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <FileSpreadsheet size={16} />
                      Excel डाउनलोड करें
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      रद्द करें
                    </button>
                    <button
                      onClick={saveBill}
                      disabled={isSaving}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                        isSaving
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
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
                          सेव करें
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
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


        {/* Edit Mode - Item Form */}
        {isEditing && (
          <div className="mb-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">वस्तुओं की जानकारी</h3>
              <ItemForm items={items} onItemsChange={setItems} />
              
              {/* Generate Bills Button */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-6 text-center">
                  <button
                    onClick={generateBills}
                    disabled={isGenerating}
                    className={cn(
                      "px-8 py-3 rounded-lg font-medium text-white transition-all duration-200",
                      "flex items-center gap-2 mx-auto",
                      isGenerating
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        बिल अपडेट हो रहे हैं...
                      </>
                    ) : (
                      <>
                        <Calculator size={20} />
                        बिल अपडेट करें
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bill Display */}
        {(billSet || (!isEditing && billData)) && (
          <div className="mb-8 max-w-7xl mx-auto">
            {billSet ? (
              <BillDisplay billSet={billSet} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto border border-gray-400">
                  <table className="w-full border-collapse text-sm">
                    {/* Header */}
                    <thead>
                      <tr>
                        <th rowSpan={2} className="border border-gray-400 px-2 py-3 bg-gray-100 text-center font-semibold min-w-[60px]">
                          क्र सं
                        </th>
                        <th rowSpan={2} className="border border-gray-400 px-2 py-3 bg-gray-100 text-center font-semibold min-w-[120px]">
                          सामग्री
                        </th>
                        <th rowSpan={2} className="border border-gray-400 px-2 py-3 bg-gray-100 text-center font-semibold min-w-[80px]">
                          दर रू
                        </th>
                        <th rowSpan={2} className="border border-gray-400 px-2 py-3 bg-gray-100 text-center font-semibold min-w-[60px]">
                          मात्रा
                        </th>
                        <th rowSpan={2} className="border border-gray-400 px-2 py-3 bg-gray-100 text-center font-semibold min-w-[80px]">
                          कुल राशि
                        </th>
                        <th colSpan={2} className="border border-gray-400 px-2 py-1 bg-blue-50 text-center font-semibold">
                          60%
                        </th>
                        <th colSpan={2} className="border border-gray-400 px-2 py-1 bg-green-50 text-center font-semibold">
                          30%
                        </th>
                        <th colSpan={2} className="border border-gray-400 px-2 py-1 bg-yellow-50 text-center font-semibold">
                          10%
                        </th>
                      </tr>
                      <tr>
                        <th className="border border-gray-400 px-2 py-2 bg-blue-25 text-center font-medium">मात्रा</th>
                        <th className="border border-gray-400 px-2 py-2 bg-blue-25 text-center font-medium">Amount</th>
                        <th className="border border-gray-400 px-2 py-2 bg-green-25 text-center font-medium">मात्रा</th>
                        <th className="border border-gray-400 px-2 py-2 bg-green-25 text-center font-medium">Amount</th>
                        <th className="border border-gray-400 px-2 py-2 bg-yellow-25 text-center font-medium">मात्रा</th>
                        <th className="border border-gray-400 px-2 py-2 bg-yellow-25 text-center font-medium">Amount</th>
                      </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                      {Object.values(itemGroups).map((group, index: number) => {
                        const { item, distributions } = group;
                        const dist60 = distributions.find((d) => d.percentage === 60) || { quantity: 0, amount: 0 };
                        const dist30 = distributions.find((d) => d.percentage === 30) || { quantity: 0, amount: 0 };
                        const dist10 = distributions.find((d) => d.percentage === 10) || { quantity: 0, amount: 0 };

                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-2 py-2 text-center font-medium">
                              {index + 1}
                            </td>
                      <td className="border border-gray-400 px-3 py-2 font-medium">
                        {item.name}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-right">
                        {formatNumber(item.rate, 2)}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-right">
                        {formatNumber(item.quantity, item.allows_decimal ? 2 : 0)}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-right font-medium">
                        {formatNumber(item.quantity * item.rate, 2)}
                      </td>
                      {/* 60% Bill */}
                      <td className="border border-gray-400 px-2 py-2 text-right bg-blue-25">
                        {formatNumber(dist60.quantity, item.allows_decimal ? 2 : 0)}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-right bg-blue-25">
                        {formatNumber(dist60.amount, 2)}
                      </td>
                      {/* 30% Bill */}
                      <td className="border border-gray-400 px-2 py-2 text-right bg-green-25">
                        {formatNumber(dist30.quantity, item.allows_decimal ? 2 : 0)}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-right bg-green-25">
                        {formatNumber(dist30.amount, 2)}
                      </td>
                      {/* 10% Bill */}
                      <td className="border border-gray-400 px-2 py-2 text-right bg-yellow-25">
                        {formatNumber(dist10.quantity, item.allows_decimal ? 2 : 0)}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-right bg-yellow-25">
                        {formatNumber(dist10.amount, 2)}
                      </td>
                          </tr>
                        );
                      })}

                      {/* Total Row */}
                      <tr className="bg-gray-100 font-semibold">
                  <td colSpan={4} className="border border-gray-400 px-3 py-3 text-right">
                    सामग्री की कुल राशि
                  </td>
                  <td className="border border-gray-400 px-2 py-3 text-right font-bold">
                    {formatNumber(billData.bill?.total_amount || 0, 2)}
                  </td>
                  <td className="border border-gray-400 px-2 py-3 text-right bg-blue-50">
                    {formatNumber((billData.distributions || []).filter(d => d.percentage === 60).reduce((sum, d) => sum + d.quantity, 0), 2)}
                  </td>
                  <td className="border border-gray-400 px-2 py-3 text-right bg-blue-50">
                    {formatNumber((billData.distributions || []).filter(d => d.percentage === 60).reduce((sum, d) => sum + d.amount, 0), 2)}
                  </td>
                  <td className="border border-gray-400 px-2 py-3 text-right bg-green-50">
                    {formatNumber((billData.distributions || []).filter(d => d.percentage === 30).reduce((sum, d) => sum + d.quantity, 0), 2)}
                  </td>
                  <td className="border border-gray-400 px-2 py-3 text-right bg-green-50">
                    {formatNumber((billData.distributions || []).filter(d => d.percentage === 30).reduce((sum, d) => sum + d.amount, 0), 2)}
                  </td>
                  <td className="border border-gray-400 px-2 py-3 text-right bg-yellow-50">
                    {formatNumber((billData.distributions || []).filter(d => d.percentage === 10).reduce((sum, d) => sum + d.quantity, 0), 2)}
                  </td>
                  <td className="border border-gray-400 px-2 py-3 text-right bg-yellow-50">
                    {formatNumber((billData.distributions || []).filter(d => d.percentage === 10).reduce((sum, d) => sum + d.amount, 0), 2)}
                  </td>
                </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
