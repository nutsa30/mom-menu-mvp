import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'mom menu';
  const sub   = searchParams.get('sub')   ?? 'Personal Meal Plans for Children';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: 'linear-gradient(145deg, #F4F0EA 0%, #d4edda 55%, #F4F0EA 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'center',
          padding: '80px 100px', position: 'relative', overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, borderRadius: '50%', background: '#bbf7d0', opacity: 0.55 }} />
        <div style={{ position: 'absolute', bottom: -80, right: 140, width: 360, height: 360, borderRadius: '50%', background: '#86efac', opacity: 0.35 }} />
        <div style={{ position: 'absolute', top: 60, right: 120, width: 200, height: 200, borderRadius: '50%', background: '#465940', opacity: 0.08 }} />

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#FDFBF0', letterSpacing: -1 }}>mom</span>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#FDFBF0', letterSpacing: -1 }}>&#x2665;</span>
          </div>
          <span style={{ fontSize: 48, fontWeight: 900, color: '#FDFBF0', letterSpacing: -1, marginTop: -8 }}>menu</span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: title.length > 40 ? 44 : 56,
          fontWeight: 900, color: '#FDFBF0',
          lineHeight: 1.15, marginBottom: 28,
          maxWidth: 820, letterSpacing: -1,
        }}>
          {title}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 26, color: '#FDFBF0', lineHeight: 1.45, maxWidth: 680, fontWeight: 500 }}>
          {sub}
        </div>

        {/* Domain badge */}
        <div style={{
          position: 'absolute', bottom: 56, left: 100,
          background: '#465940', color: 'white',
          borderRadius: 50, padding: '14px 36px',
          fontSize: 24, fontWeight: 800, letterSpacing: 0.5,
        }}>
          momeals.ge
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
