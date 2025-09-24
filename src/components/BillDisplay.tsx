'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BillSet } from '@/types';
import { formatNumber } from '@/lib/utils';

interface BillDisplayProps {
  billSet: BillSet;
}

export function BillDisplay({ billSet }: BillDisplayProps) {
  const { bills } = billSet;

  const downloadExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for Excel sheet
    const excelData = [];
    
    // Header rows
    excelData.push(['', '', '', '', '', '60%', '', '30%', '', '10%', '']);
    excelData.push(['क्र सं', 'सामग्री', 'दर रू', 'मात्रा', 'कुल राशि', 'मात्रा', 'Amount', 'मात्रा', 'Amount', 'मात्रा', 'Amount']);
    
    // Data rows
    bills[0].items.forEach((_, itemIndex) => {
      const item60 = bills[0].items[itemIndex];
      const item30 = bills[1].items[itemIndex];
      const item10 = bills[2].items[itemIndex];
      const originalItem = item60.item;

      excelData.push([
        itemIndex + 1,
        originalItem.name,
        originalItem.rate,
        originalItem.quantity,
        originalItem.quantity * originalItem.rate, // कुल राशि
        parseFloat(item60.quantity.toFixed(1)),
        parseFloat(item60.amount.toFixed(1)),
        parseFloat(item30.quantity.toFixed(1)),
        parseFloat(item30.amount.toFixed(1)),
        parseFloat(item10.quantity.toFixed(1)),
        parseFloat(item10.amount.toFixed(1))
      ]);
    });
    
    // Total row
    const totalAmount = bills[0].items.reduce((sum, item) => sum + (item.item.quantity * item.item.rate), 0);
    excelData.push([
      '', 'कुल योग', '', '',
      totalAmount.toFixed(2),
      parseFloat(bills[0].items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)),
      parseFloat(bills[0].totalAmount.toFixed(2)),
      parseFloat(bills[1].items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)),
      parseFloat(bills[1].totalAmount.toFixed(2)),
      parseFloat(bills[2].items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)),
      parseFloat(bills[2].totalAmount.toFixed(2))
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
    
    // Apply professional styling
    const borderStyle = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, size: 12 },
      fill: { fgColor: { rgb: '4472C4' } },
      border: borderStyle,
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    
    const dataStyle = {
      border: borderStyle,
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    
    const totalStyle = {
      font: { bold: true, color: { rgb: '000000' } },
      fill: { fgColor: { rgb: 'FFD700' } },
      border: borderStyle,
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    
    // Apply styling to percentage header row
    for (let col = 5; col <= 10; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
      ws[cellAddress].s = headerStyle;
    }
    
    // Apply styling to column headers row
    for (let col = 0; col <= 10; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
      ws[cellAddress].s = headerStyle;
    }
    
    // Apply styling to data rows
    for (let row = 2; row < excelData.length - 1; row++) {
      for (let col = 0; col <= 10; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        ws[cellAddress].s = dataStyle;
      }
    }
    
    // Apply styling to total row
    const totalRowIndex = excelData.length - 1;
    for (let col = 0; col <= 10; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = totalStyle;
      }
    }
    
    // Merge cells for header
    ws['!merges'] = [
      { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }, // 60%
      { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } }, // 30%
      { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } }  // 10%
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'वितरित बिल');
    
    // Generate filename
    const fileName = `बिल-वितरण-${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fileName);
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 no-print">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">वितरित बिल</h2>
              <p className="text-sm text-gray-600">Excel प्रारूप में निर्यात के लिए तैयार</p>
            </div>
          </div>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <FileSpreadsheet size={16} />
            Excel डाउनलोड करें
          </button>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">

      {/* Excel-style Bill Table */}
      <div className="print-area">
        <div className="overflow-x-auto border border-gray-400">
          <table className="w-full border-collapse text-sm">
            {/* Header Row */}
            <thead>
              <tr>
                <th rowSpan={2} className="border border-gray-400 px-2 py-3 bg-gray-100 text-center font-semibold min-w-[40px]">
                  क्र सं
                </th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-3 bg-gray-100 text-center font-semibold min-w-[120px]">
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
                <th className="border border-gray-400 px-2 py-2 bg-blue-25 text-center font-medium text-xs">
                  मात्रा
                </th>
                <th className="border border-gray-400 px-2 py-2 bg-blue-25 text-center font-medium text-xs">
                  Amount
                </th>
                <th className="border border-gray-400 px-2 py-2 bg-green-25 text-center font-medium text-xs">
                  मात्रा
                </th>
                <th className="border border-gray-400 px-2 py-2 bg-green-25 text-center font-medium text-xs">
                  Amount
                </th>
                <th className="border border-gray-400 px-2 py-2 bg-yellow-25 text-center font-medium text-xs">
                  मात्रा
                </th>
                <th className="border border-gray-400 px-2 py-2 bg-yellow-25 text-center font-medium text-xs">
                  Amount
                </th>
              </tr>
            </thead>

            {/* Data Rows */}
            <tbody>
              {bills[0].items.map((_, itemIndex) => {
                const item60 = bills[0].items[itemIndex];
                const item30 = bills[1].items[itemIndex];
                const item10 = bills[2].items[itemIndex];
                const originalItem = item60.item;

                return (
                  <tr key={itemIndex} className="hover:bg-gray-25">
                    <td className="border border-gray-400 px-2 py-2 text-center font-medium">
                      {itemIndex + 1}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 font-medium">
                      {originalItem.name}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right">
                      {formatNumber(originalItem.rate, 0)}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right">
                      {formatNumber(originalItem.quantity, originalItem.allowsDecimal ? 2 : 0)}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right font-medium">
                      {formatNumber(originalItem.quantity * originalItem.rate, 2)}
                    </td>
                    {/* 60% Bill */}
                    <td className="border border-gray-400 px-2 py-2 text-right bg-blue-25">
                      {formatNumber(item60.quantity, originalItem.allowsDecimal ? 1 : 0)}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right bg-blue-25">
                      {formatNumber(item60.amount, 1)}
                    </td>
                    {/* 30% Bill */}
                    <td className="border border-gray-400 px-2 py-2 text-right bg-green-25">
                      {formatNumber(item30.quantity, originalItem.allowsDecimal ? 1 : 0)}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right bg-green-25">
                      {formatNumber(item30.amount, 1)}
                    </td>
                    {/* 10% Bill */}
                    <td className="border border-gray-400 px-2 py-2 text-right bg-yellow-25">
                      {formatNumber(item10.quantity, originalItem.allowsDecimal ? 1 : 0)}
                    </td>
                    <td className="border border-gray-400 px-2 py-2 text-right bg-yellow-25">
                      {formatNumber(item10.amount, 1)}
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
                  {formatNumber(bills[0].items.reduce((sum, item) => sum + (item.item.quantity * item.item.rate), 0), 2)}
                </td>
                <td className="border border-gray-400 px-2 py-3 text-right bg-blue-50">
                  {formatNumber(bills[0].items.reduce((sum, item) => sum + item.quantity, 0), 1)}
                </td>
                <td className="border border-gray-400 px-2 py-3 text-right bg-blue-50">
                  {formatNumber(bills[0].totalAmount, 1)}
                </td>
                <td className="border border-gray-400 px-2 py-3 text-right bg-green-50">
                  {formatNumber(bills[1].items.reduce((sum, item) => sum + item.quantity, 0), 1)}
                </td>
                <td className="border border-gray-400 px-2 py-3 text-right bg-green-50">
                  {formatNumber(bills[1].totalAmount, 1)}
                </td>
                <td className="border border-gray-400 px-2 py-3 text-right bg-yellow-50">
                  {formatNumber(bills[2].items.reduce((sum, item) => sum + item.quantity, 0), 1)}
                </td>
                <td className="border border-gray-400 px-2 py-3 text-right bg-yellow-50">
                  {formatNumber(bills[2].totalAmount, 1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div> {/* Close content section */}

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            margin: 0;
            padding: 0;
          }
          table {
            font-size: 11px;
            width: 100%;
          }
          th, td {
            padding: 3px 4px !important;
          }
        }
        .bg-blue-25 {
          background-color: rgba(239, 246, 255, 0.8);
        }
        .bg-green-25 {
          background-color: rgba(240, 253, 244, 0.8);
        }
        .bg-yellow-25 {
          background-color: rgba(254, 252, 232, 0.8);
        }
        .bg-gray-25 {
          background-color: rgba(249, 250, 251, 0.5);
        }
      `}</style>
    </div>
  );
}