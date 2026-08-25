'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';

const NAV_ICONS = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  mealManager: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  planEditor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  plans: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  blogs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  userStats: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ingredients: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/></svg>,
  analytics: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  testimonials: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  birthdays: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 21h16"/><path d="M12 3c-1 1.5-1 2.5 0 4 1-1.5 1-2.5 0-4Z"/><path d="M4 11h16"/></svg>,
  howItWorks: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  promo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  homepage: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  seo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  emails: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  contact: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  notifications: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const locale = getAdminLocale(searchParams.get('lang') ?? undefined);
  const d = adminDict[locale];

  const withLang = (href: string) => locale === 'en' ? `${href}?lang=en` : href;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const switchLang = () => {
    const next = locale === 'ka' ? 'en' : 'ka';
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', next);
    router.push(`${pathname}?${params.toString()}`);
  };

  const navItems = [
    { key: 'homepage',  label: locale === 'ka' ? 'მთავარი გვერდი'  : 'Home page',    href: '/admin/homepage' },
    { key: 'mealManager', label: d.mealManager,                                        href: '/admin/meals' },
    { key: 'plans',     label: locale === 'ka' ? 'კვების გეგმები'   : 'Meal Plans',    href: '/admin/plans' },
    { key: 'blogs',     label: d.blogs,                                                href: '/admin/blogs' },
    { key: 'howItWorks', label: locale === 'ka' ? 'როგორ მუშაობს' : 'How it works',  href: '/admin/how-it-works' },
    { key: 'promo',     label: locale === 'ka' ? 'პრომოკოდები'    : 'Promo codes',   href: '/admin/promo' },
    { key: 'userStats', label: d.userStats,                                            href: '/admin/users' },
    { key: 'ingredients', label: d.ingredientsNav,                                     href: '/admin/ingredients' },
    { key: 'analytics', label: locale === 'ka' ? 'ანალიტიკა'      : 'Analytics',       href: '/admin/analytics' },
    { key: 'testimonials', label: locale === 'ka' ? 'კომენტარები' : 'Testimonials',    href: '/admin/testimonials' },
    { key: 'birthdays', label: locale === 'ka' ? 'დაბადების დღეები' : 'Birthdays',    href: '/admin/birthdays' },
    { key: 'seo',      label: 'SEO',                                                   href: '/admin/seo' },
    { key: 'emails',   label: locale === 'ka' ? 'Email Center'    : 'Email Center',   href: '/admin/emails' },
    { key: 'notifications', label: locale === 'ka' ? 'Push შეტყობინებები' : 'Push Notifications', href: '/admin/notifications' },
    { key: 'contact',      label: locale === 'ka' ? 'კონტაქტის გვერდი'  : 'Contact page',       href: '/admin/contact' },
    { key: 'settings',  label: d.settings,                                             href: '/admin/settings' },
  ] as const;

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[#FDFBF0]/20 flex items-center justify-between">
        <span className="text-lg font-extrabold tracking-tight text-[#FDFBF0]">
          mom menu
          <span className="ml-2 text-sm font-semibold text-[#FDFBF0]/50">Admin</span>
        </span>
        <div className="flex items-center gap-2">
          <button onClick={switchLang}
            className="text-xs font-bold px-2.5 py-1 rounded-full border border-[#FDFBF0]/20 text-[#FDFBF0]/70 hover:border-[#FDFBF0]/50 hover:text-[#FDFBF0] transition">
            {locale === 'ka' ? 'EN' : 'ქარ'}
          </button>
          {/* Close button on mobile */}
          <button onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded-lg text-[#FDFBF0]/60 hover:text-[#FDFBF0] transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a key={item.href} href={withLang(item.href)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active ? 'bg-[#FDFBF0]/15 text-[#FDFBF0]' : 'text-[#FDFBF0]/60 hover:bg-[#FDFBF0]/10 hover:text-[#FDFBF0]'
              }`}>
              <span className={active ? 'text-[#FDFBF0]' : 'text-[#FDFBF0]/40'}>
                {NAV_ICONS[item.key]}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 space-y-1.5">
        <a href={withLang('/admin/meals/new')}
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-2 w-full text-[#465940] text-sm font-bold py-3 rounded-full transition"
          style={{ background: '#FDFBF0' }}>
          {d.addRecipe}
        </a>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#FDFBF0]/60 hover:bg-[#FDFBF0]/10 hover:text-[#FDFBF0] transition">
          {NAV_ICONS.logout}
          {d.logout}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-[#FDFBF0]/10 px-4 py-3 flex items-center justify-between" style={{ background: '#465940', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <span className="text-base font-extrabold tracking-tight text-[#FDFBF0]">
          mom menu
          <span className="ml-1.5 text-xs font-semibold text-[#FDFBF0]/50">Admin</span>
        </span>
        <button onClick={() => setOpen(true)}
          className="p-2 rounded-xl text-[#FDFBF0]/70 hover:bg-[#FDFBF0]/10 transition">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — mobile: slide-in drawer, desktop: always visible */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 flex-shrink-0 border-r border-[#FDFBF0]/10 min-h-screen flex flex-col
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `} style={{ background: '#465940' }}>
        <SidebarContent />
      </aside>
    </>
  );
}
