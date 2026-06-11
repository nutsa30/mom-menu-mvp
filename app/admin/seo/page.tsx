'use client';

import { useState, useEffect } from 'react';

interface SeoData {
  seo: { googleVerification: string; gaId: string; gtmId: string; updatedAt: string };
  stats: { publishedBlogs: number; totalBlogs: number };
}

export default function AdminSeoPage() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);

  const [googleVerification, setGoogleVerification] = useState('');
  const [gaId, setGaId] = useState('');
  const [gtmId, setGtmId] = useState('');

  useEffect(() => {
    fetch('/api/admin/seo')
      .then(r => r.json())
      .then((d: SeoData) => {
        setData(d);
        setGoogleVerification(d.seo.googleVerification);
        setGaId(d.seo.gaId);
        setGtmId(d.seo.gtmId);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleVerification, gaId, gtmId }),
      });
      setSaveResult(res.ok ? 'success' : 'error');
    } catch {
      setSaveResult('error');
    } finally {
      setSaving(false);
    }
  };

  const SITE = 'https://mommenu.ge';

  const dashCards = data ? [
    {
      icon: '📝',
      label: 'გამოქვეყნებული ბლოგები',
      value: `${data.stats.publishedBlogs} / ${data.stats.totalBlogs}`,
      status: data.stats.publishedBlogs > 0 ? 'ok' : 'warn',
    },
    {
      icon: '🗺️',
      label: 'Sitemap',
      value: 'აქტიური',
      status: 'ok',
      link: `${SITE}/sitemap.xml`,
    },
    {
      icon: '🤖',
      label: 'Robots.txt',
      value: 'აქტიური',
      status: 'ok',
      link: `${SITE}/robots.txt`,
    },
    {
      icon: '📊',
      label: 'Google Analytics 4',
      value: (data.seo.gaId || process.env.NEXT_PUBLIC_GA_ID) ? 'დაკავშირებული' : 'არ არის',
      status: data.seo.gaId ? 'ok' : 'warn',
    },
    {
      icon: '🏷️',
      label: 'Google Tag Manager',
      value: data.seo.gtmId ? 'დაკავშირებული' : 'არ არის',
      status: data.seo.gtmId ? 'ok' : 'warn',
    },
    {
      icon: '🔍',
      label: 'Search Console Verification',
      value: data.seo.googleVerification ? 'კოდი დაყენებულია' : 'არ არის',
      status: data.seo.googleVerification ? 'ok' : 'warn',
    },
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#465940]">SEO & Analytics</h1>
        <p className="text-[#465940]/60 text-sm mt-1">Google-ის ინტეგრაცია და საიტის SEO სტატუსი</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#465940]/40">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-sm">იტვირთება...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {dashCards.map((card) => (
              <div key={card.label} className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-4">
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${card.status === 'ok' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                  <span className={`text-sm font-bold ${card.status === 'ok' ? 'text-green-700' : 'text-yellow-700'}`}>
                    {card.value}
                  </span>
                </div>
                <p className="text-xs text-[#465940]/60">{card.label}</p>
                {card.link && (
                  <a href={card.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#465940] underline mt-1 inline-block hover:opacity-70">
                    ნახვა ↗
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-5 mb-6">
            <p className="text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-3">სასარგებლო ბმულები</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🔍 Google Search Console', url: 'https://search.google.com/search-console' },
                { label: '📊 Google Analytics', url: 'https://analytics.google.com' },
                { label: '🏷️ Google Tag Manager', url: 'https://tagmanager.google.com' },
                { label: '🗺️ Sitemap', url: `${SITE}/sitemap.xml` },
                { label: '🤖 Robots.txt', url: `${SITE}/robots.txt` },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Settings Form */}
          <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#465940] mb-1">პარამეტრები</h2>
            <p className="text-sm text-[#465940]/60 mb-6">კოდების შეცვლა მყისიერად ამოქმედდება — deploy-ი არ სჭირდება</p>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Google Verification */}
              <div>
                <label className="block text-sm font-bold text-[#465940] mb-1">
                  Google Search Console Verification Code
                </label>
                <p className="text-xs text-[#465940]/50 mb-2">
                  Search Console → Settings → Ownership verification → HTML tag → copy only the content="..." value
                </p>
                <input
                  type="text"
                  value={googleVerification}
                  onChange={e => setGoogleVerification(e.target.value)}
                  placeholder="abcdefgh1234567890..."
                  className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm text-[#465940] bg-white font-mono"
                />
              </div>

              {/* GA4 ID */}
              <div>
                <label className="block text-sm font-bold text-[#465940] mb-1">
                  Google Analytics 4 — Measurement ID
                </label>
                <p className="text-xs text-[#465940]/50 mb-2">
                  GA4 → Admin → Data Streams → Web → Measurement ID (format: G-XXXXXXXXXX)
                </p>
                <input
                  type="text"
                  value={gaId}
                  onChange={e => setGaId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm text-[#465940] bg-white font-mono"
                />
              </div>

              {/* GTM ID */}
              <div>
                <label className="block text-sm font-bold text-[#465940] mb-1">
                  Google Tag Manager — Container ID
                </label>
                <p className="text-xs text-[#465940]/50 mb-2">
                  GTM → Admin → Container → Container ID (format: GTM-XXXXXXX)
                </p>
                <input
                  type="text"
                  value={gtmId}
                  onChange={e => setGtmId(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm text-[#465940] bg-white font-mono"
                />
              </div>

              {saveResult === 'success' && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  ✅ პარამეტრები შენახულია. ცვლილება მყისიერად ამოქმედდება.
                </div>
              )}
              {saveResult === 'error' && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  ❌ შეცდომა. სცადეთ ახლიდან.
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-[#465940] text-[#FDFBF0] px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? 'ინახება...' : 'შენახვა'}
              </button>
            </form>
          </div>

          {/* Structured Data info */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-5">
            <p className="text-sm font-bold text-blue-800 mb-2">✅ ავტომატურად აქტიური</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Organization</strong> JSON-LD — ყველა გვერდზე</li>
              <li>• <strong>WebSite</strong> JSON-LD — ყველა გვერდზე</li>
              <li>• <strong>Article</strong> JSON-LD — ბლოგის გვერდებზე</li>
              <li>• <strong>Open Graph</strong> + <strong>Twitter Cards</strong> — ყველა გვერდზე</li>
              <li>• <strong>Canonical URL</strong> — ყველა გვერდზე</li>
              <li>• <strong>Sitemap</strong> — ავტომატური განახლება ბლოგის დამატებისას</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
