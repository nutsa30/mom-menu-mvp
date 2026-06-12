import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '50%',
        }}
      >
        <span
          style={{
            color: '#556B4D',
            fontSize: 110,
            fontWeight: 900,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: 14,
          }}
        >
          m
        </span>
      </div>
    ),
    { ...size },
  );
}
