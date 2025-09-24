import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'बिल जेनरेटर - GST इनवॉइस और स्मार्ट वितरण बिल सिस्टम';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            बिल जेनरेटर
          </div>
          <div
            style={{
              fontSize: '32px',
              marginBottom: '20px',
              opacity: 0.9,
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            GST इनवॉइस और स्मार्ट वितरण बिल सिस्टम
          </div>
          <div
            style={{
              fontSize: '24px',
              opacity: 0.8,
              textAlign: 'center',
              maxWidth: '600px',
            }}
          >
            व्यावसायिक बिल और GST इनवॉइस जेनरेशन सिस्टम
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
