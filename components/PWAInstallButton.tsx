'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton({ ka }: { ka: boolean }) {
  const [prompt, setPrompt]         = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS]           = useState(false);
  const [visible, setVisible]       = useState(false);
  const [iosModal, setIosModal]     = useState(false);

  useEffect(() => {
    // Already installed as PWA — never show
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    ) return;

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const iosSafari = ios && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);

    if (iosSafari) {
      setIsIOS(true);
      setVisible(true);
    }

    // Chrome / Edge / Android — show when browser fires the prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setVisible(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleClick = async () => {
    if (prompt) {
      // Native install dialog — opens immediately, no extra steps
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
      setPrompt(null);
    } else if (isIOS) {
      setIosModal(true);
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* ── Top Banner ── */}
      <div
        role="button"
        onClick={handleClick}
        aria-label={ka ? 'დაამატე MomMenu აპლიკაციად' : 'Install MomMenu app'}
        style={{
          background: '#3a4d35',
          borderBottom: '1px solid rgba(245,241,228,0.1)',
          padding: '0.6rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.65rem', cursor: 'pointer', width: '100%',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F5F1E4' }}>
          {ka ? 'დაამატე MomMenu აპლიკაციად' : 'Install MomMenu App'}
        </span>

        <span style={{
          background: '#F5F1E4', color: '#6F7A5C',
          borderRadius: '999px', padding: '3px 13px',
          fontSize: '0.73rem', fontWeight: 800, flexShrink: 0,
        }}>
          {ka ? 'დაამატე' : 'Install'}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          aria-label="Close"
          style={{ background: 'none', border: 'none', color: '#F5F1E4', opacity: 0.4, fontSize: '1rem', cursor: 'pointer', padding: '0 0 0 0.25rem', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* ── iOS Modal (compact) ── */}
      {iosModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setIosModal(false)}
        >
          <div
            style={{ background: '#F5F1E4', borderRadius: '20px 20px 0 0', padding: '1.75rem 1.5rem 2.25rem', width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#6F7A5C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#F5F1E4', fontWeight: 900, fontSize: '1rem' }}>m</span>
                </div>
                <span style={{ fontWeight: 900, color: '#6F7A5C' }}>MomMenu</span>
              </div>
              <button onClick={() => setIosModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#6F7A5C', opacity: 0.35, cursor: 'pointer' }}>×</button>
            </div>

            <p style={{ fontWeight: 800, color: '#6F7A5C', fontSize: '1rem', margin: '0 0 0.35rem' }}>
              {ka ? 'Home Screen-ზე დასამატებლად:' : 'To add to Home Screen:'}
            </p>
            <p style={{ color: '#6F7A5C', opacity: 0.65, fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              {ka
                ? '1. ქვემოთ Share ღილაკზე დააჭირე\n2. "Add to Home Screen" აირჩიე'
                : '1. Tap Share at the bottom\n2. Select "Add to Home Screen"'}
            </p>

            <button
              onClick={() => setIosModal(false)}
              style={{ marginTop: '1.4rem', width: '100%', background: '#6F7A5C', color: '#F5F1E4', border: 'none', borderRadius: '999px', padding: '13px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              {ka ? 'გასაგებია' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
