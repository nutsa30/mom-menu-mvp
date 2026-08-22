'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY  = 'mommenu-pwa-dismissed';
const DISMISS_DAYS = 7;

function wasDismissedRecently() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    return ts ? Date.now() - parseInt(ts, 10) < DISMISS_DAYS * 86_400_000 : false;
  } catch {
    return false;
  }
}

function markDismissed() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PWAInstallBanner() {
  const [prompt, setPrompt]     = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS]       = useState(false);
  const [visible, setVisible]   = useState(false);
  const [iosModal, setIosModal] = useState(false);

  useEffect(() => {
    // Already running as an installed PWA — never show
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // Dismissed recently — respect user's choice
    if (wasDismissedRecently()) return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const iosSafari = ios && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);

    if (iosSafari) {
      setIsIOS(true);
      setVisible(true);
    }

    // Chrome / Edge / Samsung / Android — native install prompt
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    markDismissed();
    setVisible(false);
    setIosModal(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
      setPrompt(null);
    } else if (isIOS) {
      setIosModal(true);
    }
  }, [prompt, isIOS]);

  if (!visible) return null;

  return (
    <>
      {/* ── Top install bar ──────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #3a4d35 0%, #6F7A5C 100%)',
          borderBottom: '1px solid rgba(245,241,228,0.10)',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          width: '100%',
          position: 'relative',
          zIndex: 9500,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '9px',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          <img
            src="/android-chrome-192x192.png"
            alt="MomMenu"
            width={38}
            height={38}
            style={{ display: 'block', objectFit: 'cover' }}
          />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              color: '#F5F1E4',
              fontSize: '0.83rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            MomMenu-ს აპლიკაცია
          </div>
          <div
            style={{
              color: 'rgba(245,241,228,0.65)',
              fontSize: '0.7rem',
              marginTop: '0.1rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            სწრაფი წვდომა · ოფლაინ · შეტყობინებები
          </div>
        </div>

        {/* Install button */}
        <button
          onClick={handleInstall}
          style={{
            background: '#F5F1E4',
            color: '#6F7A5C',
            border: 'none',
            borderRadius: '999px',
            padding: '6px 15px',
            fontWeight: 800,
            fontSize: '0.78rem',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
          }}
        >
          {isIOS && !prompt ? 'ინსტრუქცია' : 'დაყენება'}
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="დახურვა"
          style={{
            background: 'none',
            border: 'none',
            color: '#F5F1E4',
            opacity: 0.45,
            fontSize: '1.25rem',
            lineHeight: 1,
            cursor: 'pointer',
            padding: '0 0 0 0.1rem',
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* ── iOS bottom-sheet ─────────────────────────────────────────────── */}
      {iosModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={dismiss}
        >
          <div
            style={{
              background: '#F5F1E4',
              borderRadius: '24px 24px 0 0',
              padding: '1.75rem 1.5rem 2.5rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src="/apple-touch-icon.png"
                  alt="MomMenu"
                  width={40}
                  height={40}
                  style={{ borderRadius: '10px', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 900, color: '#6F7A5C', fontSize: '1rem' }}>MomMenu</div>
                  <div style={{ fontSize: '0.75rem', color: '#6F7A5C', opacity: 0.55 }}>mommenu.ge</div>
                </div>
              </div>
              <button
                onClick={dismiss}
                aria-label="დახურვა"
                style={{
                  background: 'rgba(111,122,92,0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  color: '#6F7A5C',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <h2
              style={{
                fontWeight: 900,
                color: '#6F7A5C',
                margin: '0 0 1.25rem',
                fontSize: '1.1rem',
              }}
            >
              Home Screen-ზე დასამატებლად:
            </h2>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { num: '1', text: 'ბრაუზერის ქვეში Share ღილაკზე დააჭირე' },
                { num: '2', text: '"Add to Home Screen" ვარიანტი აირჩიე' },
                { num: '3', text: '"Add" ან "დამატება" ღილაკზე დააჭირე — მზადაა!' },
              ].map(({ num, text }) => (
                <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      background: '#6F7A5C',
                      color: '#F5F1E4',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                    }}
                  >
                    {num}
                  </span>
                  <p style={{ margin: 0, color: '#6F7A5C', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={dismiss}
              style={{
                width: '100%',
                padding: '14px',
                background: '#6F7A5C',
                color: '#F5F1E4',
                border: 'none',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              გასაგებია!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
