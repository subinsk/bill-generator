import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'स्मार्ट वितरण बिल मैनेजमेंट',
  description: 'अपने सभी वितरण बिल यहाँ मैनेज करें। वस्तुओं को 60%, 30%, और 10% में स्वचालित वितरण करें।',
  keywords: ['वितरण बिल', 'स्मार्ट वितरण', 'बिल मैनेजमेंट', 'व्यावसायिक बिल'],
  openGraph: {
    title: 'स्मार्ट वितरण बिल मैनेजमेंट',
    description: 'अपने सभी वितरण बिल यहाँ मैनेज करें। वस्तुओं को 60%, 30%, और 10% में स्वचालित वितरण करें।',
  },
};

export default function DistributionBillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
