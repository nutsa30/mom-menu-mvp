'use client';

import { useState } from 'react';

type PaymentRow = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  isDeletedUser: boolean;
  planLabel: string;
  promoCode: string | null;
  status: string;
  failureReason: string | null;
  cardType: string | null;
  grossAmount: number;
  commissionAmount: number | null;
  netAmount: number | null;
};

// Transactions table (SUCCESS + FAILED, newest first — admin/users/page.tsx already excludes
// REFUNDED trial-hold releases and caps this at the 100 most recent). Collapsed to the most
// recent COLLAPSED_COUNT by default with a manual expand, same pattern as UsersSearchTable —
// admin mostly wants a quick glance, not a huge table on every page load.
const COLLAPSED_COUNT = 4;

export default function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? payments : payments.slice(0, COLLAPSED_COUNT);

  return (
    <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
      {payments.length === 0 ? (
        <p className="text-center py-12 text-[#465940]/60 text-sm">ჯერ არცერთი BOG გადახდა არ დაფიქსირებულა</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-[#465940]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თარიღი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მომხმარებელი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">სტატუსი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ბარათი</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ბრუტო</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">საკომისიო</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">წმინდა</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#465940]/5">
              {visible.map((p) => (
                <tr key={p.id} className="hover:bg-[#465940]/5 transition">
                  <td className="px-6 py-4 text-sm text-[#465940]/70">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-[#465940]">{p.name}</p>
                    <p className="text-xs text-[#465940]/50">
                      {p.email}
                      {p.isDeletedUser && <span className="ml-1 text-[10px] text-[#465940]/40">(ანგარიში წაშლილია)</span>}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70">
                    {p.planLabel}
                    {p.promoCode && (
                      <span className="ml-2 inline-block font-mono text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                        {p.promoCode}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'SUCCESS' ? 'bg-[#465940]/10 text-[#465940]' :
                      p.status === 'REFUNDED' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {p.status}
                    </span>
                    {p.status === 'FAILED' && p.failureReason && (
                      <p className="text-[10px] text-red-500 mt-1 max-w-[180px]">{p.failureReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70">{p.cardType ?? '—'}</td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70 text-right">{p.grossAmount.toFixed(2)}₾</td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70 text-right">{p.commissionAmount != null ? `${p.commissionAmount.toFixed(2)}₾` : '—'}</td>
                  <td className="px-6 py-4 text-sm text-[#465940] font-semibold text-right">{p.netAmount != null ? `${p.netAmount.toFixed(2)}₾` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payments.length > COLLAPSED_COUNT && (
        <div className="flex justify-center py-3 border-t border-[#465940]/10">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-semibold text-[#465940] hover:text-[#465940]/70 transition flex items-center gap-1.5"
          >
            {expanded ? 'აკეცვა' : `ვრცლად (სულ ${payments.length})`}
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
