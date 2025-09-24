import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '80px',
            fontWeight: 'bold',
            fontFamily: 'system-ui',
          }}
        >
          बि
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
