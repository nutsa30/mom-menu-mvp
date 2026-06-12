'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'prompt' | 'ios' | 'other';

export default function PWAInstallButton({ ka }: { ka: boolean }) {
  const [prompt, setPrompt]           = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform]       = useState<Platform>('other');
  const [isInstalled, setIsInstalled] = useState(true); // hide until we confirm not installed
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    setIsInstalled(false);

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;

    if (isIOS) {
      setPlatform('ios');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setPlatform('prompt');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleClick = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* ── Install Banner — full-width top bar ── */}
      <div
        style={{
          background: '#3a4d35',
          borderBottom: '1px solid rgba(253,251,240,0.1)',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          width: '100%',
        }}
        onClick={handleClick}
        role="button"
        aria-label={ka ? 'დაამატე MomMenu აპლიკაციად' : 'Install MomMenu app'}
      >
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📲</span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FDFBF0', lineHeight: 1.2 }}>
            {ka ? 'დაამატე MomMenu აპლიკაციად' : 'Install MomMenu App'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#FDFBF0', opacity: 0.55, lineHeight: 1.2 }}>
            {ka ? '— ერთი დაჭერით გახსნა' : '— open with one tap'}
          </span>
        </div>

        <span style={{
          background: '#FDFBF0', color: '#465940',
          borderRadius: '999px', padding: '4px 14px',
          fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
        }}>
          {ka ? 'დაამატე' : 'Install'}
        </span>
      </div>

      {/* ── Fallback Modal ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#FDFBF0', borderRadius: '24px 24px 0 0',
              padding: '2rem 1.5rem 2.5rem', width: '100%', maxWidth: '480px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '9px', background: '#465940', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#FDFBF0', fontWeight: 900, fontSize: '1.1rem' }}>m</span>
                </div>
                <span style={{ fontWeight: 900, color: '#465940', fontSize: '1rem' }}>MomMenu</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#465940', opacity: 0.4, cursor: 'pointer', padding: '4px' }}
              >
                ×
              </button>
            </div>

            <h3 style={{ fontWeight: 900, color: '#465940', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {ka ? 'დაამატე Home Screen-ზე' : 'Add to Home Screen'}
            </h3>

            {platform === 'ios' ? (
              <>
                <p style={{ color: '#465940', opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {ka ? 'Safari-ში გახსენი MomMenu და:' : 'Open MomMenu in Safari and:'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    ka ? ['1', '📤', 'ქვემოთ Share ღილაკზე დააჭირე'] : ['1', '📤', 'Tap the Share button at the bottom'],
                    ka ? ['2', '➕', '"Add to Home Screen" აირჩიე'] : ['2', '➕', 'Select "Add to Home Screen"'],
                    ka ? ['3', '✅', '"Add" დააჭირე'] : ['3', '✅', 'Tap "Add"'],
                  ].map(([num, icon, text]) => (
                    <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#465940', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.85rem' }}>{icon}</span>
                      </div>
                      <span style={{ color: '#465940', fontSize: '0.88rem', fontWeight: 600 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p style={{ color: '#465940', opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {ka
                    ? 'Browser-ის მენიუში (⋮ ან ⋯) გადადი და "Install App" ან "Add to Home Screen" დააჭირე.'
                    : 'Open the browser menu (⋮ or ⋯) and tap "Install App" or "Add to Home Screen".'}
                </p>
              </>
            )}

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: '1.5rem', width: '100%',
                background: '#465940', color: '#FDFBF0',
                border: 'none', borderRadius: '999px',
                padding: '14px', fontWeight: 800, fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {ka ? 'გასაგებია' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
