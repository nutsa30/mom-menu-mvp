'use client';

import { useMemo, useState } from 'react';

type PaymentDayRow = {
  id: string;
  createdAt: string;
  day: number; // Tbilisi day-of-month (1-31), computed server-side
  name: string;
  email: string;
  planLabel: string;
  amount: number;
};

// "გადახდის დღე" (payment day) picker — pick a bare day-of-month (1-31), not a specific
// calendar date, and see every actual completed, bank-deducted payment that ever landed on
// that day, across every month combined. This is a recurring-billing-day view (who's my
// "day 2" cohort, historically), not a forward-looking "who's due" list — that's the
// separate, unfiltered "დღეს გადასახდელები" block above this component on the page.
// `payments` arrives already computed server-side (admin/users/page.tsx's paymentDayRows).
export default function DueByDateList({ payments, todayDay }: { payments: PaymentDayRow[]; todayDay: number }) {
  const availableDays = useMemo(() => {
    const set = new Set<number>();
    for (const p of payments) set.add(p.day);
    return Array.from(set).sort((a, b) => a - b);
  }, [payments]);

  const [selectedDay, setSelectedDay] = useState(() => (availableDays.includes(todayDay) ? todayDay : (availableDays[0] ?? todayDay)));

  const paymentsOnDay = useMemo(
    () => payments.filter((p) => p.day === selectedDay).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [payments, selectedDay]
  );

  const totalOnDay = paymentsOnDay.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-black text-[#465940]">გადახდის დღე</h2>
        {availableDays.length > 0 ? (
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="border border-[#465940]/15 rounded-full px-4 py-2.5 text-sm font-semibold text-[#465940]/80 focus:outline-none focus:border-[#465940] bg-white cursor-pointer"
          >
            {availableDays.map((day) => (
              <option key={day} value={day}>
                {day}
                {day === todayDay ? ' (დღეს)' : ''}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {paymentsOnDay.length === 0 ? (
        <p className="bg-[#FDFBF0] rounded-2xl p-6 text-center text-sm text-[#465940]/60 shadow-sm">
          ამ დღეს გადახდილი არაფერია.
        </p>
      ) : (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-[#465940]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თარიღი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მომხმარებელი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თანხა</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465940]/5">
                {paymentsOnDay.map((p) => (
                  <tr key={p.id} className="hover:bg-[#465940]/5 transition">
                    <td className="px-6 py-4 text-sm text-[#465940]/70">
                      {new Date(p.createdAt).toLocaleDateString('ka-GE', { timeZone: 'Asia/Tbilisi', year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#465940]">{p.name}</p>
                      <p className="text-xs text-[#465940]/50">{p.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#465940]/70">{p.planLabel}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#465940] text-right">{p.amount}₾</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end px-6 py-3 border-t border-[#465940]/10">
            <p className="text-sm text-[#465940]">
              სულ {selectedDay} რიცხვში: <span className="font-black">{totalOnDay}₾</span> ({paymentsOnDay.length} გადახდა)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
