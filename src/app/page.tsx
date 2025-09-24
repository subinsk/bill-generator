'use client';

import React, { Suspense } from 'react';
import { Calculator, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const savedParam = searchParams.get('saved');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mx-auto max-w-5xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg">
                <Calculator className="text-white" size={28} />
              </div>
              <h1 className="text-4xl font-semibold text-gray-900">
                बिल जेनरेटर
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम
            </p>
          </div>
        </div>

        {/* Success Message */}
        {savedParam === 'true' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="font-medium text-sm">बिल सफलतापूर्वक सेव हो गया</span>
            </div>
          </div>
        )}


        {/* Bill Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* GST Bill Card */}
          <Link
            href="/gst-bills"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 p-8"
          >
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="text-white" size={28} />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                GST बिल
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                पूर्ण GST इनवॉइस बनाएं CGST, SGST और HSN कोड के साथ
              </p>
              
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium">
                  <Plus size={20} />
                  GST बिल मैनेज करें
                </div>
              </div>
            </div>
          </Link>

          {/* Distribution Bill Card */}
          <Link
            href="/distribution-bills"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 p-8"
          >
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calculator className="text-white" size={28} />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                स्मार्ट वितरण बिल
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                वस्तुओं को 60%, 30%, और 10% में स्वचालित वितरण करें
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-blue-700 font-medium">
                  <Plus size={20} />
                  वितरण बिल मैनेज करें
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-8 h-8 bg-gray-300 rounded mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हो रहा है...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}