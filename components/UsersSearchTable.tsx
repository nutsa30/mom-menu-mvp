'use client';

import { useMemo, useState } from 'react';
import { BlockUserButton, ToggleAdminButton, GiftSubscriptionButton } from '@/components/AdminUserActions';
import type { AdminLocale } from '@/lib/adminI18n';

const subBadge: Record<string, string> = {
  FREE: 'bg-[#465940]/10 text-[#465940]/70',
  RECIPE_PLAN: 'bg-[#FDFBF0]/10 text-[#465940]',
  FULL_PLAN: 'bg-[#465940]/20 text-[#465940]',
  CANCELED: 'bg-[#465940]/10 text-[#465940]/60',
};

// Live client-side search over name/email — filters as you type, no page reload and no
// need to scroll through the whole table to find someone. `users` arrives already
// tab/promo-filtered from the server; `planLabel`/`price` are pre-computed server-side
// (subLabelFor/priceFor use env-configured prices) since functions can't cross the
// server→client component boundary as props.
export default function UsersSearchTable({
  users,
  locale,
  intervalPrices,
}: {
  users: any[];
  locale: AdminLocale;
  intervalPrices: Record<number, number>;
}) {
  const [query, setQuery] = useState('');
  // Registration-date filter — a select of the actual dates someone registered on
  // (derived from the data itself), not a calendar picker, per how this is meant to be
  // used: "show me who signed up on this specific day", not an arbitrary date range.
  const [dateFilter, setDateFilter] = useState('');

  const registrationDates = useMemo(() => {
    const set = new Set<string>();
    for (const u of users) set.add(new Date(u.createdAt).toISOString().slice(0, 10));
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1)); // newest first
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !(u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))) return false;
      if (dateFilter && new Date(u.createdAt).toISOString().slice(0, 10) !== dateFilter) return false;
      return true;
    });
  }, [users, query, dateFilter]);

  return (
    <div>
      <div className="p-4 sm:p-6 border-b border-[#465940]/10">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#465940]/40"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === 'ka' ? 'ძებნა სახელით ან ელფოსტით...' : 'Search by name or email...'}
              className="w-full pl-9 pr-9 py-2.5 rounded-full border border-[#465940]/15 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465940]/40 hover:text-[#465940] transition text-lg leading-none"
                aria-label={locale === 'ka' ? 'გასუფთავება' : 'Clear'}
              >
                ×
              </button>
            )}
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-[#465940]/15 rounded-full px-4 py-2.5 text-sm font-semibold text-[#465940]/80 focus:outline-none focus:border-[#465940] bg-white cursor-pointer"
          >
            <option value="">{locale === 'ka' ? 'ყველა თარიღი' : 'All dates'}</option>
            {registrationDates.map((d) => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
              </option>
            ))}
          </select>
        </div>
        {(query || dateFilter) && (
          <p className="text-xs text-[#465940]/50 mt-2">
            {locale === 'ka' ? `${filtered.length} შედეგი` : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-[#465940]/60 text-sm">
          {query
            ? (locale === 'ka' ? 'ვერაფერი მოიძებნა' : 'No matches found')
            : (locale === 'ka' ? 'მომხმარებელი არ არის' : 'No users')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#465940]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">სახელი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">პრომოკოდი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">შვილები</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">რეგ. თარიღი</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#465940]/5">
              {filtered.map((user) => (
                <tr key={user.id} className={`hover:bg-[#465940]/5 transition ${user.isBlocked ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#465940]/20 flex items-center justify-center text-[#465940] font-bold text-xs flex-shrink-0">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#465940]">{user.name}</p>
                        {user.role === 'ADMIN' && <span className="text-[10px] font-bold text-[#FDFBF0] bg-[#465940] px-1.5 py-0.5 rounded">ADMIN</span>}
                        {user.isBlocked && <span className="text-[10px] font-bold text-[#FDFBF0]">{locale === 'ka' ? 'დაბლოკილი' : 'BLOCKED'}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${subBadge[user.subscriptionStatus]}`}>
                      {user.planLabel}
                    </span>
                    {user.subscriptionCanceledAt && (user.subscriptionStatus === 'FULL_PLAN' || user.subscriptionStatus === 'RECIPE_PLAN') && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">
                        გაუქმებული — წვდომა {user.subscriptionRenewsAt ? new Date(user.subscriptionRenewsAt).toLocaleDateString('ka-GE') : '?'}-მდე
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {user.promoCode ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs bg-[#465940]/10 text-[#465940] border border-[#465940]/30 px-2 py-0.5 rounded font-bold w-fit">
                          {user.promoCode.code}
                        </span>
                        <span className="text-[10px] text-[#465940]/60">{user.promoPrice}₾</span>
                      </div>
                    ) : (
                      <span className="text-[#465940]/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70">{user._count.children}</td>
                  <td className="px-4 py-4 text-sm text-[#465940]/60">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <GiftSubscriptionButton userId={user.id} currentStatus={user.subscriptionStatus} isGifted={user.isGifted} intervalPrices={intervalPrices} />
                      <ToggleAdminButton userId={user.id} role={user.role} locale={locale} />
                      <BlockUserButton userId={user.id} isBlocked={user.isBlocked} locale={locale} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
