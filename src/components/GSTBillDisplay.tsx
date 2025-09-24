'use client';

import React from 'react';
import { Download, Printer, FileText, Edit } from 'lucide-react';
import { GSTBill } from '@/types';
import { exportGSTBillToExcel } from '@/lib/gstExcelExportNew';
import { exportGSTBillToPDFJSPDF } from '@/lib/gstPdfExportJSPDF';
import { exportGSTBillToPDFHTML2Canvas } from '@/lib/gstPdfExportHTML2Canvas';

interface GSTBillDisplayProps {
  bill: GSTBill;
  onExportToExcel?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export default function GSTBillDisplay({ bill, onExportToExcel, onEdit, showActions = true }: GSTBillDisplayProps) {
  const handleExportToExcel = () => {
    if (onExportToExcel) {
      onExportToExcel();
    } else {
      exportGSTBillToExcel(bill);
    }
  };

  const handleExportToPDFJSPDF = () => {
    try {
      exportGSTBillToPDFJSPDF(bill);
    } catch (error) {
      console.error('JSPDF export error:', error);
    }
  };

  const handleExportToPDFHTML2Canvas = () => {
    try {
      exportGSTBillToPDFHTML2Canvas(bill);
    } catch (error) {
      console.error('HTML2Canvas export error:', error);
    }
  };

  return (
    <div className="gst-bill-display bg-white shadow-lg border border-gray-300 max-w-6xl mx-auto">
      {/* Actions */}
      {showActions && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-300 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">GST इनवॉइस प्रीव्यू</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit size={18} />
                  संपादित करें
                </button>
              )}
              <button
                onClick={handleExportToPDFJSPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                title="PDF Export using jsPDF (Structured Layout)"
              >
                <FileText size={18} />
                PDF (jsPDF)
              </button>
              <button
                onClick={handleExportToPDFHTML2Canvas}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                title="PDF Export using HTML2Canvas (Exact UI Copy)"
              >
                <FileText size={18} />
                PDF (UI Copy)
              </button>
              <button
                onClick={handleExportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download size={18} />
                Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Content */}
      <div className="p-6 print:p-4">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <div className="text-right text-sm font-medium mb-2">
            GSTIN : {bill.billDetails.companyGSTIN}
          </div>
          <div className="text-xl font-bold mb-2">TAX INVOICE</div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {bill.billDetails.companyName}
          </div>
          <div className="text-sm text-gray-600 mb-1">
            {bill.billDetails.companyAddress}
          </div>
          <div className="text-sm text-gray-600">
            PAN : {bill.billDetails.companyPAN}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Invoice No.</div>
              <div>: {bill.billDetails.invoiceNo}</div>
              <div className="font-medium">Dated</div>
              <div>: {bill.billDetails.invoiceDate}</div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Place of Supply</div>
              <div>: {bill.billDetails.placeOfSupply}</div>
              <div className="font-medium">Reverse Charge</div>
              <div>: {bill.billDetails.reverseCharge}</div>
            </div>
          </div>
        </div>

        {/* Billing and Shipping Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="font-medium text-sm mb-1">Billed to :</div>
            <div className="text-sm">{bill.billDetails.billedToName}</div>
            <div className="text-sm">{bill.billDetails.billedToAddress}</div>
            {bill.billDetails.billedToGSTIN && (
              <div className="text-sm">GSTIN / UIN : {bill.billDetails.billedToGSTIN}</div>
            )}
          </div>
          <div>
            <div className="font-medium text-sm mb-1">Shipped to :</div>
            <div className="text-sm">{bill.billDetails.shippedToName}</div>
            <div className="text-sm">{bill.billDetails.shippedToAddress}</div>
            {bill.billDetails.shippedToGSTIN && (
              <div className="text-sm">GSTIN / UIN : {bill.billDetails.shippedToGSTIN}</div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-800 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-sn">S.N</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-description">Description of Goods</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-hsn">HSN/SAC Code</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-qty">Qty</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-unit">Unit</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-rate">Rate</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-cgst-rate">CGST Rate</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-cgst-amt">CGST Amount</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-sgst-rate">SGST Rate</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-sgst-amt">SGST Amount</th>
                <th className="border border-gray-800 px-2 py-2 text-left gst-table-total">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={item.id} className="print:text-xs">
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-center gst-table-sn">{index + 1}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-left gst-table-description">{item.description}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-center gst-table-hsn">{item.hsnSacCode || '-'}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-right gst-table-qty">{item.quantity.toFixed(2)}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-center gst-table-unit">{item.unit}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-right gst-table-rate">{item.rate.toFixed(2)}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-center gst-table-cgst-rate">{item.cgstRate.toFixed(2)}%</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-right gst-table-cgst-amt">{item.cgstAmount.toFixed(2)}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-center gst-table-sgst-rate">{item.sgstRate.toFixed(2)}%</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-right gst-table-sgst-amt">{item.sgstAmount.toFixed(2)}</td>
                  <td className="border border-gray-800 px-2 py-2 print:px-1 print:py-1 text-right font-medium gst-table-total">{item.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-gray-100 font-medium">
                <td colSpan={3} className="border border-gray-800 px-2 py-2 text-center font-bold">Total</td>
                <td className="border border-gray-800 px-2 py-2 text-center font-bold">{bill.totalUnits.toFixed(2)}</td>
                <td className="border border-gray-800 px-2 py-2"></td>
                <td className="border border-gray-800 px-2 py-2 text-right font-bold">{bill.totalTaxableAmount.toFixed(2)}</td>
                <td className="border border-gray-800 px-2 py-2"></td>
                <td className="border border-gray-800 px-2 py-2 text-right font-bold">{bill.totalCGSTAmount.toFixed(2)}</td>
                <td className="border border-gray-800 px-2 py-2"></td>
                <td className="border border-gray-800 px-2 py-2 text-right font-bold">{bill.totalSGSTAmount.toFixed(2)}</td>
                <td className="border border-gray-800 px-2 py-2 text-right font-bold">{bill.grandTotal.toFixed(2)}</td>
              </tr>

              {/* BSR Deduction Row */}
              <tr>
                <td colSpan={6} className="border border-gray-800 px-2 py-2 text-center font-medium">
                  Less : BSR -1.80 % BELOW
                </td>
                <td className="border border-gray-800 px-2 py-2 text-center">@ O12</td>
                <td className="border border-gray-800 px-2 py-2 text-center">1.80%</td>
                <td colSpan={2} className="border border-gray-800 px-2 py-2"></td>
                <td className="border border-gray-800 px-2 py-2 font-medium">{bill.bsrDeduction.toFixed(2)}</td>
              </tr>
              
              {/* Empty Row */}
              <tr>
                <td colSpan={11} className="border border-gray-800 px-2 py-2 h-8"></td>
              </tr>
              
              {/* Grand Total Row */}
              <tr className="bg-gray-100">
                <td colSpan={10} className="border border-gray-800 px-2 py-2 text-center font-bold">
                  Grand Total
                </td>
                <td className="border border-gray-800 px-2 py-2 text-right font-bold text-lg">
                  {bill.finalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Summary */}
        <div className="mb-6">
          <table className="border-collapse border border-gray-800 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-4 py-2 text-left">Tax Rate</th>
                <th className="border border-gray-800 px-4 py-2 text-left">Taxable Amt.</th>
                <th className="border border-gray-800 px-4 py-2 text-left">CGST Amt.</th>
                <th className="border border-gray-800 px-4 py-2 text-left">SGST Amt.</th>
                <th className="border border-gray-800 px-4 py-2 text-left">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {bill.taxSummary.map((summary) => (
                <tr key={summary.taxRate}>
                  <td className="border border-gray-800 px-4 py-2">{summary.taxRate.toFixed(2)}%</td>
                  <td className="border border-gray-800 px-4 py-2">{summary.taxableAmount.toFixed(2)}</td>
                  <td className="border border-gray-800 px-4 py-2">{summary.cgstAmount.toFixed(2)}</td>
                  <td className="border border-gray-800 px-4 py-2">{summary.sgstAmount.toFixed(2)}</td>
                  <td className="border border-gray-800 px-4 py-2">{summary.totalTaxAmount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-medium">
                <td className="border border-gray-800 px-4 py-2">Total</td>
                <td className="border border-gray-800 px-4 py-2">{bill.totalTaxableAmount.toFixed(2)}</td>
                <td className="border border-gray-800 px-4 py-2">{bill.totalCGSTAmount.toFixed(2)}</td>
                <td className="border border-gray-800 px-4 py-2">{bill.totalSGSTAmount.toFixed(2)}</td>
                <td className="border border-gray-800 px-4 py-2">{bill.totalTaxAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="mb-6">
          <div className="text-lg font-bold">
            {bill.amountInWords}
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-6">
          <div className="font-medium text-sm mb-1">Bank Details :</div>
          <div className="text-sm">{bill.billDetails.bankDetails}</div>
        </div>

        {/* Terms and Conditions */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="font-medium text-sm mb-2">Terms & Conditions</div>
            {bill.billDetails.termsConditions.map((term, index) => (
              <div key={index} className="text-sm mb-1">
                {index + 1}. {term}
              </div>
            ))}
          </div>
          <div className="text-right">
            <div className="mt-16">
              <div className="font-medium text-sm mb-1">Receiver's Signature</div>
              <div className="mt-8 pt-8 border-t border-gray-400">
                <div className="font-medium text-sm">for {bill.billDetails.companyName}</div>
                <div className="font-medium text-sm">Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
