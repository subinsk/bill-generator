'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { Item } from '@/types';
import { cn, formatNumber, parseHindiNumber, isValidNumber } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/config';

interface ItemFormProps {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
}

export function ItemForm({ items, onItemsChange }: ItemFormProps) {
  const [itemName, setItemName] = useState<string>('');
  const [itemRate, setItemRate] = useState<string>('');
  const [customQuantity, setCustomQuantity] = useState<string>('');
  const [allowsDecimal, setAllowsDecimal] = useState<boolean>(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!itemName.trim()) {
      newErrors.itemName = 'वस्तु का नाम आवश्यक है';
    }
    
    if (!itemRate.trim()) {
      newErrors.itemRate = 'दर आवश्यक है';
    } else if (!isValidNumber(itemRate)) {
      newErrors.itemRate = 'केवल संख्या दर्ज करें';
    }
    
    if (!customQuantity.trim()) {
      newErrors.customQuantity = 'मात्रा आवश्यक है';
    } else if (!isValidNumber(customQuantity)) {
      newErrors.customQuantity = 'केवल संख्या दर्ज करें';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    if (!validateForm()) {
      return;
    }

    const quantity = parseHindiNumber(customQuantity);
    const rate = parseHindiNumber(itemRate);
    
    if (quantity <= 0 || rate <= 0) {
      alert('मात्रा और दर शून्य से अधिक होनी चाहिए');
      return;
    }

    // Check if item already exists
    const existingItemIndex = items.findIndex(item => item.name.toLowerCase() === itemName.trim().toLowerCase());
    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: quantity,
        rate: rate,
        allowsDecimal: allowsDecimal
      };
      onItemsChange(updatedItems);
    } else {
      // Add new item
      const newItem: Item = {
        id: `item-${Date.now()}`,
        name: itemName.trim(),
        rate: rate,
        quantity: quantity,
        allowsDecimal: allowsDecimal,
        minQuantity: allowsDecimal ? 0.5 : 1,
        maxQuantity: allowsDecimal ? quantity * 2 : Math.max(10, quantity * 2)
      };
      onItemsChange([...items, newItem]);
    }

    // Reset form
    setItemName('');
    setItemRate('');
    setCustomQuantity('');
    setAllowsDecimal(true);
    setErrors({});
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id: string, newQuantity: string) => {
    // Only allow numbers and decimal point
    const isValid = /^[0-9]*\.?[0-9]*$/.test(newQuantity);
    if (!isValid && newQuantity !== '') return;

    const updatedItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity ? parseHindiNumber(newQuantity) : 0
        };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const updateItemRate = (id: string, newRate: string) => {
    // Only allow numbers and decimal point
    const isValid = /^[0-9]*\.?[0-9]*$/.test(newRate);
    if (!isValid && newRate !== '') return;

    const updatedItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          rate: newRate ? parseHindiNumber(newRate) : 0
        };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const fillSuggestedRate = (name: string) => {
    const suggestedRate = APP_CONFIG.DEFAULT_RATES[name as keyof typeof APP_CONFIG.DEFAULT_RATES];
    if (suggestedRate) {
      setItemRate(suggestedRate.toString());
    }
    
    // Auto-set decimal preference based on item type
    const isNonDecimalItem = (APP_CONFIG.NON_DECIMAL_ITEMS as readonly string[]).includes(name);
    setAllowsDecimal(!isNonDecimalItem);
    
    // Clear errors when user starts typing
    if (errors.itemName) {
      setErrors(prev => ({ ...prev, itemName: '' }));
    }
  };

  const handleRateChange = (value: string) => {
    // Only allow numbers, decimal point, and basic navigation
    const isValid = /^[0-9]*\.?[0-9]*$/.test(value);
    if (isValid || value === '') {
      setItemRate(value);
      if (errors.itemRate) {
        setErrors(prev => ({ ...prev, itemRate: '' }));
      }
    }
  };

  const handleQuantityChange = (value: string) => {
    // Only allow numbers, decimal point, and basic navigation
    const isValid = /^[0-9]*\.?[0-9]*$/.test(value);
    if (isValid || value === '') {
      setCustomQuantity(value);
      if (errors.customQuantity) {
        setErrors(prev => ({ ...prev, customQuantity: '' }));
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Plus className="text-gray-600" size={20} />
          वस्तु प्रविष्टि फॉर्म
        </h2>
        <p className="text-gray-600 mt-1">
          अपनी वस्तुओं की जानकारी दर्ज करें
        </p>
      </div>
      
      <div className="p-6">
        {/* Add Item Form */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center gap-2">
            <Plus className="text-gray-600" size={16} />
            नई वस्तु जोड़ें
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                वस्तु का नाम
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  fillSuggestedRate(e.target.value);
                }}
                placeholder="वस्तु का नाम दर्ज करें"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-blue-500 bg-white",
                  errors.itemName 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                )}
              />
              {errors.itemName && (
                <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                दर (₹)
              </label>
              <input
                type="text"
                value={itemRate}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="दर दर्ज करें"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-blue-500",
                  errors.itemRate 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                )}
              />
              {errors.itemRate && (
                <p className="text-red-500 text-xs mt-1">{errors.itemRate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                मात्रा
              </label>
              <input
                type="text"
                value={customQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="मात्रा दर्ज करें"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-blue-500",
                  errors.customQuantity 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                )}
              />
              {errors.customQuantity && (
                <p className="text-red-500 text-xs mt-1">{errors.customQuantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                दशमलव की अनुमति
              </label>
              <div className="flex items-center space-x-3">
                <label className={cn(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  allowsDecimal 
                    ? "bg-green-100 text-green-800 border border-green-300" 
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 opacity-50"
                )}>
                  <input
                    type="radio"
                    value="yes"
                    checked={allowsDecimal}
                    onChange={() => setAllowsDecimal(true)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">हाँ</span>
                </label>
                <label className={cn(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  !allowsDecimal 
                    ? "bg-red-100 text-red-800 border border-red-300" 
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 opacity-50"
                )}>
                  <input
                    type="radio"
                    value="no"
                    checked={!allowsDecimal}
                    onChange={() => setAllowsDecimal(false)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">नहीं</span>
                </label>
              </div>
              <div className="flex items-start gap-1 mt-2">
                <Info size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  गैर-दशमलव: पानी, मिक्चर, वाइब्रेटर जैसी वस्तुएं
                </p>
              </div>
            </div>

            <button
              onClick={addItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} />
              जोड़ें
            </button>
          </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center gap-2">
              <Info className="text-gray-600" size={16} />
              जोड़ी गई वस्तुएं
            </h3>
            
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">क्र सं</th>
                    <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">वस्तु</th>
                    <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">दर (₹)</th>
                    <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">मात्रा</th>
                    <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">राशि (₹)</th>
                    <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">दशमलव</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="border-r border-gray-200 px-4 py-3 text-center">
                        {index + 1}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-3 font-medium">
                        {item.name}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-3">
                        <input
                          type="text"
                          value={formatNumber(item.rate, 0)}
                          onChange={(e) => updateItemRate(item.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border-r border-gray-200 px-4 py-3">
                        <input
                          type="text"
                          value={formatNumber(item.quantity, item.allowsDecimal ? 2 : 0)}
                          onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border-r border-gray-200 px-4 py-3">
                        {formatNumber(item.quantity * item.rate, 2)}
                      </td>
                    <td className="border-r border-gray-200 px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        item.allowsDecimal 
                          ? "bg-green-100 text-green-800 border border-green-300" 
                          : "bg-red-100 text-red-800 border border-red-300"
                      )}>
                        {item.allowsDecimal ? "हाँ" : "नहीं"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 group"
                        title="हटाएं"
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td colSpan={4} className="border-r border-gray-200 px-4 py-3 text-right">
                      कुल राशि:
                    </td>
                    <td className="border-r border-gray-200 px-4 py-3">
                      ₹{formatNumber(items.reduce((sum, item) => sum + (item.quantity * item.rate), 0), 2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}