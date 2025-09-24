'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewGSTBillRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const createNewGSTBill = async () => {
      try {
        const response = await fetch('/api/new-gst-bill', {
          method: 'POST',
        });
        
        const data = await response.json();
        
        if (response.ok && data.uuid) {
          router.replace(`/new-gst-bill/${data.uuid}`);
        } else {
          console.error('Failed to create new GST bill:', data.error);
          router.replace('/');
        }
      } catch (error) {
        console.error('Error creating new GST bill:', error);
        router.replace('/');
      }
    };

    createNewGSTBill();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 bg-emerald-600 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">नया GST बिल बनाया जा रहा है...</p>
      </div>
    </div>
  );
}