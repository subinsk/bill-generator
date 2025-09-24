import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'बिल जेनरेटर - GST इनवॉइस और स्मार्ट वितरण बिल सिस्टम',
    short_name: 'बिल जेनरेटर',
    description: 'व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम। CGST, SGST, HSN कोड के साथ पूर्ण GST बिल बनाएं।',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity', 'finance'],
    lang: 'hi',
    dir: 'ltr',
  };
}
