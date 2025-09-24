import { structuredData } from '@/lib/seo';

interface StructuredDataProps {
  type: 'website' | 'softwareApplication' | 'organization';
}

export default function StructuredData({ type }: StructuredDataProps) {
  const data = structuredData[type];
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}
