import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GST बिल मैनेजमेंट',
  description: 'अपने सभी GST इनवॉइस यहाँ मैनेज करें। CGST, SGST, HSN कोड के साथ पूर्ण GST बिल बनाएं और मैनेज करें।',
  keywords: ['GST बिल', 'GST इनवॉइस', 'CGST', 'SGST', 'HSN कोड', 'बिल मैनेजमेंट'],
  openGraph: {
    title: 'GST बिल मैनेजमेंट',
    description: 'अपने सभी GST इनवॉइस यहाँ मैनेज करें। CGST, SGST, HSN कोड के साथ पूर्ण GST बिल बनाएं।',
  },
};

export default function GSTBillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
