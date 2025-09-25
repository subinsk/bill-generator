import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { structuredData } from '@/lib/seo';
import { SessionProvider } from '@/components/SessionProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "बिल जेनरेटर - GST इनवॉइस और स्मार्ट वितरण बिल सिस्टम",
    template: "%s | बिल जेनरेटर"
  },
  description: "व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम। CGST, SGST, HSN कोड के साथ पूर्ण GST बिल बनाएं और स्मार्ट वितरण बिल सिस्टम का उपयोग करें।",
  keywords: [
    "बिल जेनरेटर",
    "GST बिल",
    "GST इनवॉइस",
    "वितरण बिल",
    "CGST",
    "SGST",
    "HSN कोड",
    "व्यावसायिक बिल",
    "इनवॉइस सिस्टम",
    "बिल मैनेजमेंट",
    "tax invoice",
    "business billing",
    "invoice generator"
  ],
  authors: [{ name: "बिल जेनरेटर टीम" }],
  creator: "बिल जेनरेटर",
  publisher: "बिल जेनरेटर",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'hi-IN': '/hi',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: '/',
    title: 'बिल जेनरेटर - GST इनवॉइस और स्मार्ट वितरण बिल सिस्टम',
    description: 'व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम। CGST, SGST, HSN कोड के साथ पूर्ण GST बिल बनाएं।',
    siteName: 'बिल जेनरेटर',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'बिल जेनरेटर - GST इनवॉइस सिस्टम',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'बिल जेनरेटर - GST इनवॉइस और स्मार्ट वितरण बिल सिस्टम',
    description: 'व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम। CGST, SGST, HSN कोड के साथ पूर्ण GST बिल बनाएं।',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.organization)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.website)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.softwareApplication)
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          }}
        />
      </body>
    </html>
  );
}
