import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5F1E8',
        }}
      >
        <span
          style={{
            color: '#556B4D',
            fontSize: 20,
            fontWeight: 900,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: 3,
          }}
        >
          m
        </span>
      </div>
    ),
    { ...size },
  );
}
