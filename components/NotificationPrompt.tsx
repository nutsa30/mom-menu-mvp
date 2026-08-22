'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY  = 'mommenu-notif-prompt';
const SNOOZE_DAYS  = 30;          // wait 30 days before showing again after dismissal
const SHOW_DELAY   = 8_000;       // show 8 s after page load

interface OneSignalAPI {
  Notifications: {
    permission: boolean;
    requestPermission(): Promise<void>;
  };
  User: {
    PushSubscription: {
      optedIn: boolean;
      optIn(): Promise<void>;
    };
  };
}

declare global {
  interface Window {
    OneSignalDeferred?: ((fn: (os: OneSignalAPI) => void) => void)[];
    OneSignal?: OneSignalAPI;
  }
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

  // Non-async — iOS requires the permission call to start in the SAME synchronous tick as the tap
  const enable = useCallback(() => {
    snooze();
    setShow(false);

    const os = (window as unknown as { OneSignal?: { Notifications?: { requestPermission(): Promise<void> } } }).OneSignal;

    if (os?.Notifications?.requestPermission) {
      os.Notifications.requestPermission().catch(() => {});
    } else if ('Notification' in window) {
      Notification.requestPermission().catch(() => {});
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
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '400px',
        zIndex: 10002,
        background: '#F5F1E4',
        borderRadius: '20px',
        boxShadow: '0 8px 48px rgba(0,0,0,0.35)',
        padding: '1.4rem 1.4rem 1.3rem',
        border: '1px solid rgba(111,122,92,0.12)',
      }}
    >

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
          color: '#6F7A5C',
          opacity: 0.35,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        ×
      </button>

      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontWeight: 900, color: '#6F7A5C', fontSize: '0.95rem', lineHeight: 1.2 }}>
          ყოველდღიური შეხსენება
        </div>
        <div style={{ fontSize: '0.73rem', color: '#6F7A5C', opacity: 0.55, marginTop: '0.15rem' }}>
          MomMenu — კვების გეგმა
        </div>
      </div>

      <p style={{ margin: '0 0 0.75rem', color: '#6F7A5C', fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.85 }}>
        ჩართე შეტყობინება და ყოველდღე დროულად ჩაფიქრდი, რა გააჭამო პატარას.
      </p>

      {/* Benefit list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {[
          'ყოველდღიური კვების შეხსენება',
          'ახალი რეცეპტები და სტატიები',
          'საყიდლების სიის შეხსენება',
          'გამოწერის სიახლეები',
        ].map((item) => (
          <li key={item} style={{ fontSize: '0.8rem', color: '#6F7A5C', opacity: 0.8 }}>
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
            border: '1.5px solid rgba(111,122,92,0.22)',
            background: 'transparent',
            color: '#6F7A5C',
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
            background: '#6F7A5C',
            color: '#F5F1E4',
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
