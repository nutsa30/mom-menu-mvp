'use client';

import { useMemo, useState } from 'react';

type DueUser = {
  id: string;
  name: string;
  email: string;
  subscriptionRenewsAt: string | Date;
  paymentFailedAt: string | Date | null;
  isFirstCharge: boolean;
  planLabel: string;
  amount: number;
};

// Date-dropdown queue of upcoming charges (trial conversions + renewals) — same "pick an
// actual date from the data" pattern as the registration/purchase date filters on
// UsersSearchTable below, but for "who's due to be charged" instead of "who registered/paid".
// `users` arrives already computed server-side (admin/users/page.tsx's upcomingDueUsers) and
// sorted by subscriptionRenewsAt; this just derives the distinct dates and filters client-side
// so switching dates doesn't reload the page. Defaults to `todayKey` when someone is actually
// due today, otherwise the earliest upcoming date — never an empty dropdown selection.
export default function DueByDateList({ users, todayKey }: { users: DueUser[]; todayKey: string }) {
  const dueDates = useMemo(() => {
    const set = new Set<string>();
    for (const u of users) {
      set.add(new Date(u.subscriptionRenewsAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Tbilisi' }));
    }
    return Array.from(set).sort(); // earliest first — this is a forward-looking queue, not a history
  }, [users]);

  const [selectedDate, setSelectedDate] = useState(() => (dueDates.includes(todayKey) ? todayKey : (dueDates[0] ?? todayKey)));

  const usersOnDate = useMemo(
    () => users.filter((u) => new Date(u.subscriptionRenewsAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Tbilisi' }) === selectedDate),
    [users, selectedDate]
  );

  const totalOnDate = usersOnDate.reduce((sum, u) => sum + u.amount, 0);

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-black text-[#465940]">გადასახდელები თარიღით</h2>
        {dueDates.length > 0 ? (
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-[#465940]/15 rounded-full px-4 py-2.5 text-sm font-semibold text-[#465940]/80 focus:outline-none focus:border-[#465940] bg-white cursor-pointer"
          >
            {dueDates.map((d) => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                {d === todayKey ? ' (დღეს)' : ''}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {usersOnDate.length === 0 ? (
        <p className="bg-[#FDFBF0] rounded-2xl p-6 text-center text-sm text-[#465940]/60 shadow-sm">
          ამ თარიღზე გადასახდელი არავინ არის.
        </p>
      ) : (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-[#465940]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">დრო</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მომხმარებელი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ტიპი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">სტატუსი</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თანხა</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465940]/5">
                {usersOnDate.map((u) => (
                  <tr key={u.id} className="hover:bg-[#465940]/5 transition">
                    <td className="px-6 py-4 text-sm text-[#465940]/70">
                      {new Date(u.subscriptionRenewsAt).toLocaleTimeString('ka-GE', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#465940]">{u.name}</p>
                      <p className="text-xs text-[#465940]/50">{u.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#465940]/70">{u.planLabel}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isFirstCharge ? 'bg-amber-50 text-amber-700' : 'bg-[#465940]/10 text-[#465940]'
                      }`}>
                        {u.isFirstCharge ? 'პირველი გადახდა' : 'განახლება'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {u.paymentFailedAt ? (
                        <span className="text-[10px] font-bold text-red-600">⚠️ გადახდა ვერ ჩამოეჭრა</span>
                      ) : (
                        <span className="text-[#465940]/40 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#465940] text-right">{u.amount}₾</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end px-6 py-3 border-t border-[#465940]/10">
            <p className="text-sm text-[#465940]">
              სულ ამ თარიღზე: <span className="font-black">{totalOnDate}₾</span> ({usersOnDate.length} მომხმარებელი)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
