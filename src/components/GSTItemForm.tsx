'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Info } from 'lucide-react';
import { GSTItem, UNIT_OPTIONS } from '@/types';
import { calculateItemAmounts } from '@/lib/gstCalculations';

interface GSTItemFormProps {
  items: GSTItem[];
  onItemsChange: (items: GSTItem[]) => void;
}

interface ValidationErrors {
  description?: boolean;
  quantity?: boolean;
  rate?: boolean;
  totalTaxRate?: boolean;
}

export default function GSTItemForm({ items, onItemsChange }: GSTItemFormProps) {
  const [newItem, setNewItem] = useState<Partial<GSTItem>>({
    description: '',
    hsnSacCode: '',
    quantity: 1,
    unit: 'CB. MTR',
    rate: 0,
    cgstRate: 2.5,
    sgstRate: 2.5
  });

  const [totalTaxRate, setTotalTaxRate] = useState<number>(5);
  const [separateTaxInput, setSeparateTaxInput] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Predefined tax rates
  const PREDEFINED_TAX_RATES = [5, 9, 18, 24];
  const [selectedPredefinedRate, setSelectedPredefinedRate] = useState<number | null>(5);

  // Calculate tax rates when total tax rate changes
  useEffect(() => {
    if (!separateTaxInput) {
      const halfRate = totalTaxRate / 2;
      setNewItem(prev => ({ 
        ...prev, 
        cgstRate: halfRate, 
        sgstRate: halfRate 
      }));
    }
  }, [totalTaxRate, separateTaxInput]);

  // Calculate amounts when any value changes
  useEffect(() => {
    if (newItem.quantity && newItem.rate && newItem.cgstRate !== undefined && newItem.sgstRate !== undefined) {
      const amounts = calculateItemAmounts(
        newItem.quantity,
        newItem.rate,
        newItem.cgstRate,
        newItem.sgstRate
      );
      setNewItem(prev => ({ ...prev, ...amounts }));
    }
  }, [newItem.quantity, newItem.rate, newItem.cgstRate, newItem.sgstRate]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!newItem.description?.trim()) {
      newErrors.description = true;
    }
    
    if (!newItem.quantity || newItem.quantity <= 0) {
      newErrors.quantity = true;
    }
    
    if (!newItem.rate || newItem.rate <= 0) {
      newErrors.rate = true;
    }

    if (!separateTaxInput && (!totalTaxRate || totalTaxRate < 0)) {
      newErrors.totalTaxRate = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTotalTaxRateChange = (value: number) => {
    setTotalTaxRate(value);
    
    // Check if the entered value matches any predefined rate
    if (PREDEFINED_TAX_RATES.includes(value)) {
      setSelectedPredefinedRate(value);
    } else {
      setSelectedPredefinedRate(null);
    }
    
    if (!separateTaxInput) {
      const halfRate = value / 2;
      setNewItem(prev => ({ 
        ...prev, 
        cgstRate: halfRate, 
        sgstRate: halfRate 
      }));
    }
  };

  const handlePredefinedRateClick = (rate: number) => {
    setTotalTaxRate(rate);
    setSelectedPredefinedRate(rate);
    
    if (!separateTaxInput) {
      const halfRate = rate / 2;
      setNewItem(prev => ({ 
        ...prev, 
        cgstRate: halfRate, 
        sgstRate: halfRate 
      }));
    }
  };

  const addItem = () => {
    if (!validateForm()) {
      return;
    }

    const item: GSTItem = {
      id: Date.now().toString(),
      description: newItem.description!,
      hsnSacCode: newItem.hsnSacCode || '',
      quantity: newItem.quantity!,
      unit: newItem.unit!,
      rate: newItem.rate!,
      cgstRate: newItem.cgstRate!,
      sgstRate: newItem.sgstRate!,
      amount: newItem.amount!,
      cgstAmount: newItem.cgstAmount!,
      sgstAmount: newItem.sgstAmount!,
      totalAmount: newItem.totalAmount!
    };

    onItemsChange([...items, item]);
    
    // Reset form
    setNewItem({
      description: '',
      hsnSacCode: '',
      quantity: 1,
      unit: 'CB. MTR',
      rate: 0,
      cgstRate: separateTaxInput ? 0 : totalTaxRate / 2,
      sgstRate: separateTaxInput ? 0 : totalTaxRate / 2
    });
    setErrors({});
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateExistingItem = (id: string, field: keyof GSTItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Recalculate amounts if relevant fields changed
        if (['quantity', 'rate', 'cgstRate', 'sgstRate'].includes(field)) {
          const amounts = calculateItemAmounts(
            updated.quantity,
            updated.rate,
            updated.cgstRate,
            updated.sgstRate
          );
          return { ...updated, ...amounts };
        }
        
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Calculator size={24} />
        वस्तु विवरण
      </h3>

      {/* Add New Item Form */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50/30">
        <h4 className="text-lg font-medium text-gray-700 mb-6">नई वस्तु जोड़ें</h4>
        
        {/* Basic Item Details */}
        <div className="space-y-6">
          {/* Row 1: Description and HSN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                वस्तु का विवरण <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newItem.description || ''}
                onChange={(e) => {
                  setNewItem(prev => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors(prev => ({ ...prev, description: false }));
                }}
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.description 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="जैसे: 40 MM CONCRETE"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">वस्तु का विवरण आवश्यक है</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HSN/SAC Code <span className="text-gray-400">(वैकल्पिक)</span>
              </label>
              <input
                type="text"
                value={newItem.hsnSacCode || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, hsnSacCode: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="HSN/SAC Code"
              />
            </div>
          </div>

          {/* Row 2: Quantity, Unit, and Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                मात्रा <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newItem.quantity || ''}
                onChange={(e) => {
                  setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }));
                  if (errors.quantity) setErrors(prev => ({ ...prev, quantity: false }));
                }}
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.quantity 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="1.00"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">मात्रा आवश्यक है</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                इकाई <span className="text-red-500">*</span>
              </label>
              <select
                value={newItem.unit || 'CB. MTR'}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {UNIT_OPTIONS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                दर (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newItem.rate || ''}
                onChange={(e) => {
                  setNewItem(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }));
                  if (errors.rate) setErrors(prev => ({ ...prev, rate: false }));
                }}
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.rate 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="0.00"
              />
              {errors.rate && (
                <p className="text-red-500 text-xs mt-1">दर आवश्यक है</p>
              )}
            </div>
          </div>

          {/* Tax Rate Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                कर दर <span className="text-red-500">*</span>
              </label>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">अलग से CGST/SGST भरें</span>
                <button
                  type="button"
                  onClick={() => setSeparateTaxInput(!separateTaxInput)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    separateTaxInput ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      separateTaxInput ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

                {!separateTaxInput ? (
                  <div className="space-y-4">
                    {/* Predefined Tax Rate Buttons */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        प्रीसेट कर दर चुनें
                      </label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {PREDEFINED_TAX_RATES.map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => handlePredefinedRateClick(rate)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedPredefinedRate === rate
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          कुल कर दर (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={totalTaxRate || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            handleTotalTaxRateChange(value);
                            if (errors.totalTaxRate) setErrors(prev => ({ ...prev, totalTaxRate: false }));
                          }}
                          className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors.totalTaxRate 
                              ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                              : selectedPredefinedRate === totalTaxRate
                                ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50'
                                : 'border-gray-300 focus:ring-emerald-500'
                          }`}
                          placeholder="5"
                        />
                        {errors.totalTaxRate && (
                          <p className="text-red-500 text-xs mt-1">कर दर आवश्यक है</p>
                        )}
                      </div>
                  
                  <div className="flex items-end">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
                      <div className="flex items-start gap-2">
                        <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                        <div className="text-sm text-blue-700">
                          <div className="font-medium mb-1">स्वचालित वितरण:</div>
                          <div>CGST: {(totalTaxRate / 2).toFixed(2)}%</div>
                          <div>SGST: {(totalTaxRate / 2).toFixed(2)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CGST दर (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={newItem.cgstRate || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, cgstRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SGST दर (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={newItem.sgstRate || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, sgstRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="2.5"
                  />
                </div>
              </div>
            )}
          </div>


          <button
            onClick={addItem}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            वस्तु जोड़ें
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">S.N</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">विवरण</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">HSN/SAC</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">मात्रा</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">इकाई</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">दर</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">राशि</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">CGST%</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">SGST%</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">कुल राशि</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">{item.description}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">{item.hsnSacCode || '-'}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">{item.quantity}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">{item.unit}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">₹{item.rate}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">₹{item.amount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">{item.cgstRate}%</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">{item.sgstRate}%</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm font-medium">₹{item.totalAmount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-sm">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="हटाएं"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calculator size={48} className="mx-auto mb-4 opacity-50" />
          <p>अभी तक कोई वस्तु नहीं जोड़ी गई है</p>
        </div>
      )}
    </div>
  );
}
