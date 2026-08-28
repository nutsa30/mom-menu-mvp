'use client';

import { useState } from 'react';

type ReferralRow = {
  id: string; name: string; email: string; package: string;
  fullPrice: number | null; discount: number | null; actuallyPaid: number | null;
  paymentStatus: string; ownerCredit: number; status: string;
};

type OwnerRow = {
  id: string; name: string; email: string; code: string; createdAt: string;
  invitedCount: number; paidCount: number; activeCount: number; canceledCount: number;
  totalEarned: number; totalUsed: number; totalReversed: number; availableCredit: number;
  packagePrice: number | null; nextChargeAmount: number | null; subscriptionStatus: string;
  referrals: ReferralRow[];
};

export default function ReferralsAdminClient({ rows }: { rows: OwnerRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'free'>('all');

  const totals = rows.reduce((acc, r) => ({
    invited: acc.invited + r.invitedCount,
    paid: acc.paid + r.paidCount,
    earned: acc.earned + r.totalEarned,
    outstanding: acc.outstanding + r.availableCredit,
  }), { invited: 0, paid: 0, earned: 0, outstanding: 0 });

  const withReferrals = rows.filter((r) => r.invitedCount > 0);
  const freeUsers = rows.filter((r) => r.nextChargeAmount === 0);

  const list = tab === 'all' ? withReferrals : freeUsers;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">რეფერალები / პრომოკოდები</h1>
        <p className="text-[#465940]/60 text-sm mt-1">ყოველ მომხმარებელს ავტომატურად აქვს პირადი პრომოკოდი — აქ ჩანს ვინ რამდენი მეგობარი მოიწვია და რამდენი კრედიტი დააგროვა</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div className="bg-[#465940] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-3">სულ მოწვევა</p>
          <p className="text-3xl font-black text-[#FDFBF0]">{totals.invited}</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">გადაიხადა</p>
          <p className="text-3xl font-black text-[#465940]">{totals.paid}</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">სულ დარიცხული კრედიტი</p>
          <p className="text-3xl font-black text-[#465940]">{totals.earned.toFixed(2)}₾</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">ამჟამად გამოუყენებელი</p>
          <p className="text-3xl font-black text-[#465940]">{totals.outstanding.toFixed(2)}₾</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab === 'all' ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940]'}`}>
          მოწვევის მქონე მომხმარებლები ({withReferrals.length})
        </button>
        <button onClick={() => setTab('free')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab === 'free' ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940]'}`}>
          უფასო subscription-მდე მისულები ({freeUsers.length})
        </button>
      </div>

      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="text-center py-12 text-[#465940]/60 text-sm">მონაცემი არ არის</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-[#465940]">
                <tr>
                  {['მომხმარებელი', 'კოდი', 'რეგისტრაცია', 'მოწვეული', 'გადაიხადა', 'აქტიური/გაუქმებული', 'დაგროვილი', 'გამოყენებული', 'გაუქმებული', 'ხელმისაწვდომი', 'პაკეტი', 'მომდევნო გადასახდელი', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465940]/5">
                {list.map((r) => (
                  <>
                    <tr key={r.id} className="hover:bg-[#465940]/5 transition">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-[#465940]">{r.name}</p>
                        <p className="text-xs text-[#465940]/50">{r.email}</p>
                      </td>
                      <td className="px-4 py-3"><span className="font-mono font-bold text-xs bg-[#465940]/10 text-[#465940] px-2 py-0.5 rounded">{r.code}</span></td>
                      <td className="px-4 py-3 text-sm text-[#465940]/70 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('ka-GE')}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#465940]">{r.invitedCount}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#465940]">{r.paidCount}</td>
                      <td className="px-4 py-3 text-sm text-[#465940]/70 whitespace-nowrap">{r.activeCount} / {r.canceledCount}</td>
                      <td className="px-4 py-3 text-sm text-[#465940]/70">{r.totalEarned.toFixed(2)}₾</td>
                      <td className="px-4 py-3 text-sm text-[#465940]/70">{r.totalUsed.toFixed(2)}₾</td>
                      <td className="px-4 py-3 text-sm text-[#465940]/70">{r.totalReversed.toFixed(2)}₾</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#465940]">{r.availableCredit.toFixed(2)}₾</td>
                      <td className="px-4 py-3 text-sm text-[#465940]/70">{r.packagePrice ? `${r.packagePrice}₾` : '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#465940]">{r.nextChargeAmount !== null ? `${r.nextChargeAmount.toFixed(2)}₾` : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="text-xs font-bold text-[#465940] bg-[#465940]/10 hover:bg-[#465940]/20 rounded-full px-3 py-1.5 transition">
                          {expanded === r.id ? 'დახურვა' : 'დეტალები'}
                        </button>
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr>
                        <td colSpan={13} className="px-4 py-4 bg-[#465940]/5">
                          {r.referrals.length === 0 ? (
                            <p className="text-sm text-[#465940]/50 text-center py-2">მოწვეული არავინაა</p>
                          ) : (
                            <table className="w-full min-w-[760px]">
                              <thead>
                                <tr className="text-left text-[11px] font-semibold text-[#465940]/60 uppercase tracking-wide">
                                  <th className="px-3 py-2">რეფერალი</th>
                                  <th className="px-3 py-2">პაკეტი</th>
                                  <th className="px-3 py-2">სრული ფასი</th>
                                  <th className="px-3 py-2">10% ფასდაკლება</th>
                                  <th className="px-3 py-2">ფაქტობრივად გადახდილი</th>
                                  <th className="px-3 py-2">გადახდის სტატუსი</th>
                                  <th className="px-3 py-2">Owner-ის კრედიტი</th>
                                  <th className="px-3 py-2">სტატუსი</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#465940]/10">
                                {r.referrals.map((ref) => (
                                  <tr key={ref.id} className="text-sm text-[#465940]">
                                    <td className="px-3 py-2">
                                      <p className="font-semibold">{ref.name}</p>
                                      <p className="text-xs text-[#465940]/50">{ref.email}</p>
                                    </td>
                                    <td className="px-3 py-2">{ref.package}</td>
                                    <td className="px-3 py-2">{ref.fullPrice ? `${ref.fullPrice}₾` : '—'}</td>
                                    <td className="px-3 py-2">{ref.discount !== null ? `${ref.discount.toFixed(2)}₾` : '—'}</td>
                                    <td className="px-3 py-2">{ref.actuallyPaid !== null ? `${ref.actuallyPaid.toFixed(2)}₾` : '—'}</td>
                                    <td className="px-3 py-2">{ref.paymentStatus}</td>
                                    <td className="px-3 py-2">{ref.ownerCredit.toFixed(2)}₾</td>
                                    <td className="px-3 py-2">{ref.status}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
