import { MetadataRoute } from 'next';
import { getAllBills, getAllGSTBills } from '@/lib/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/gst-bills`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/distribution-bills`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Dynamic bill pages
  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // Get all regular bills
    const bills = await getAllBills();
    bills.forEach((bill) => {
      dynamicPages.push({
        url: `${baseUrl}/bill/${bill.uuid}`,
        lastModified: new Date(bill.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });

    // Get all GST bills
    const gstBills = await getAllGSTBills();
    gstBills.forEach((bill) => {
      dynamicPages.push({
        url: `${baseUrl}/gst-bill/${bill.uuid}`,
        lastModified: new Date(bill.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [...staticPages, ...dynamicPages];
}
