import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: {
      index: !config.noindex,
      follow: !config.noindex,
    },
    alternates: {
      canonical: config.canonical ? `${baseUrl}${config.canonical}` : undefined,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.canonical ? `${baseUrl}${config.canonical}` : undefined,
    },
    twitter: {
      title: config.title,
      description: config.description,
    },
  };
}

export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "बिल जेनरेटर",
    "description": "व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम",
    "url": process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png`,
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Hindi", "English"]
    }
  },
  
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "बिल जेनरेटर",
    "description": "व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम",
    "url": process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  },

  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "बिल जेनरेटर",
    "description": "व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "featureList": [
      "GST बिल जेनरेशन",
      "स्मार्ट वितरण बिल",
      "CGST/SGST कैलकुलेशन",
      "HSN कोड सपोर्ट",
      "PDF एक्सपोर्ट",
      "Excel एक्सपोर्ट"
    ]
  }
};

export function generateBillStructuredData(bill: Record<string, unknown>, type: 'gst' | 'distribution') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    "@context": "https://schema.org",
    "@type": "Invoice",
    "identifier": bill.invoice_no || bill.title,
    "name": bill.invoice_no || bill.title,
    "description": type === 'gst' ? 'GST इनवॉइस' : 'वितरण बिल',
    "totalPaymentDue": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": bill.grand_total || bill.total_amount
    },
    "dateCreated": bill.created_at,
    "billingPeriod": bill.created_at,
    "customer": {
      "@type": "Organization",
      "name": bill.billed_to_name || bill.title
    },
    "provider": {
      "@type": "Organization",
      "name": "बिल जेनरेटर"
    },
    "url": `${baseUrl}/${type === 'gst' ? 'gst-bill' : 'bill'}/${bill.uuid}`
  };
}
