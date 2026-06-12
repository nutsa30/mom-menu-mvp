'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY  = 'mommenu-notif-prompt';
const SNOOZE_DAYS  = 30;          // wait 30 days before showing again after dismissal
const SHOW_DELAY   = 8_000;       // show 8 s after page load

declare global {
  interface Window {
    OneSignalDeferred?: ((fn: (os: OneSignalAPI) => void) => void)[];
  }
}

interface OneSignalAPI {
  Notifications: {
    permission: boolean;
    requestPermission(): Promise<void>;
  };
  User: {
    PushSubscription: {
      optedIn: boolean;
    };
  };
}

function snoozed() {
  try {
    const ts = localStorage.getItem(STORAGE_KEY);
    return ts ? Date.now() - parseInt(ts, 10) < SNOOZE_DAYS * 86_400_000 : false;
  } catch {
    return false;
  }
}

function snooze() {
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return; // already granted or denied
    if (snoozed()) return;

    const timer = setTimeout(() => setShow(true), SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    snooze();
    setShow(false);
  }, []);

  const enable = useCallback(async () => {
    try {
      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

      if (appId && window.OneSignalDeferred) {
        // Request via OneSignal (handles all platforms correctly)
        window.OneSignalDeferred.push(async (os: OneSignalAPI) => {
          await os.Notifications.requestPermission();
        });
      } else {
        // Fallback: native browser API
        await Notification.requestPermission();
      }
    } catch {
      // User denied or browser blocked — silently ignore
    } finally {
      snooze();
      setShow(false);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="შეტყობინებების ნებართვა"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1rem',
        right: '1rem',
        maxWidth: '400px',
        margin: '0 auto',
        zIndex: 10000,
        background: '#FDFBF0',
        borderRadius: '20px',
        boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
        padding: '1.4rem 1.4rem 1.3rem',
        border: '1px solid rgba(70,89,64,0.12)',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        onClick={dismiss}
        aria-label="დახურვა"
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          fontSize: '1.3rem',
          color: '#465940',
          opacity: 0.35,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        ×
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: '#465940',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
          }}
        >
          🔔
        </div>
        <div>
          <div style={{ fontWeight: 900, color: '#465940', fontSize: '0.95rem', lineHeight: 1.2 }}>
            ყოველდღიური შეხსენება
          </div>
          <div style={{ fontSize: '0.73rem', color: '#465940', opacity: 0.55, marginTop: '0.15rem' }}>
            MomMenu — კვების გეგმა
          </div>
        </div>
      </div>

      <p style={{ margin: '0 0 0.75rem', color: '#465940', fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.85 }}>
        ჩართე შეტყობინება და ყოველდღე დროულად ჩაფიქრდი, რა გააჭამო პატარას.
      </p>

      {/* Benefit list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {[
          '🍽️  ყოველდღიური კვების შეხსენება',
          '📖  ახალი რეცეპტები და სტატიები',
          '🛒  საყიდლების სიის შეხსენება',
          '💌  გამოწერის სიახლეები',
        ].map((item) => (
          <li key={item} style={{ fontSize: '0.8rem', color: '#465940', opacity: 0.8 }}>
            {item}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: '0.65rem' }}>
        <button
          onClick={dismiss}
          style={{
            flex: 1,
            padding: '10px 8px',
            borderRadius: '999px',
            border: '1.5px solid rgba(70,89,64,0.22)',
            background: 'transparent',
            color: '#465940',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          გვიანდელ
        </button>
        <button
          onClick={enable}
          style={{
            flex: 2,
            padding: '10px 8px',
            borderRadius: '999px',
            background: '#465940',
            color: '#FDFBF0',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          ✓ ჩართე შეტყობინება
        </button>
      </div>
    </div>
  );
}
