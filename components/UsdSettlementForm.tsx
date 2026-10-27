'use client';

import { useState, useTransition } from 'react';
import { saveUsdSettlement, clearUsdSettlement } from '@/app/admin/analytics/actions';
import { CARD_KEYS, CARD_LABEL } from '@/lib/usd-settlement';

export type UsdPaymentRow = {
  id: string;
  createdAt: string; // ISO
  gross: number;
  bogCard: string | null; // normalized card from BOG, if known
  settledCardType: string | null;
  settledAmountGel: number | null;
  settledFxRate: number | null;
  settledRateDate: string | null;
};

// One USD payment: pick the card and type the lari that landed. The NBG rate for that day is
// fetched and stored on the server; leave "კურსი" empty unless the rate can't be fetched.
export default function UsdSettlementForm({ payment }: { payment: UsdPaymentRow }) {
  const settled = payment.settledAmountGel != null && payment.settledFxRate != null;
  const [editing, setEditing] = useState(!settled);
  const [card, setCard] = useState(payment.settledCardType ?? payment.bogCard ?? '');
  const [amount, setAmount] = useState(payment.settledAmountGel != null ? String(payment.settledAmountGel) : '');
  const [manualRate, setManualRate] = useState('');
  const [needsRate, setNeedsRate] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const dateLabel = new Date(payment.createdAt).toLocaleDateString('ka-GE', { timeZone: 'Asia/Tbilisi', day: 'numeric', month: 'short' });
  const pct = settled
    ? (((payment.gross * payment.settledFxRate! - payment.settledAmountGel!) / (payment.gross * payment.settledFxRate!)) * 100)
    : null;

  function save() {
    setError('');
    startTransition(async () => {
      const res = await saveUsdSettlement({
        paymentId: payment.id,
        card,
        amountGel: Number(amount),
        manualRate: manualRate ? Number(manualRate) : null,
      });
      if (res.ok) {
        setEditing(false);
        setNeedsRate(false);
        setManualRate('');
      } else {
        setError(res.error);
        if (res.error.includes('კურსი')) setNeedsRate(true);
      }
    });
  }

  function clear() {
    startTransition(async () => {
      await clearUsdSettlement(payment.id);
      setEditing(true);
      setAmount('');
    });
  }

  if (settled && !editing) {
    return (
      <div className="text-xs text-[#465940]">
        <span className="font-bold">{payment.gross}$</span> <span className="text-[#465940]/50">· {dateLabel}</span>
        <div className="text-[#465940]/70">
          {CARD_LABEL[payment.settledCardType as keyof typeof CARD_LABEL] ?? payment.settledCardType} · ჩაერიცხა {payment.settledAmountGel!.toFixed(2)}₾ · კურსი {payment.settledFxRate!.toFixed(4)} · ბანკს წაუღია {pct!.toFixed(2)}%
        </div>
        <button type="button" onClick={() => setEditing(true)} className="text-[10px] underline text-[#465940]/60 mr-2">შეცვლა</button>
        <button type="button" onClick={clear} disabled={pending} className="text-[10px] underline text-red-600/70">გასუფთავება</button>
      </div>
    );
  }

  return (
    <div className="text-xs text-[#465940]">
      <span className="font-bold">{payment.gross}$</span> <span className="text-[#465940]/50">· {dateLabel}</span>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <select
          value={card}
          onChange={(e) => setCard(e.target.value)}
          aria-label="ბარათის ტიპი"
          className="rounded-lg border border-[#465940]/20 bg-white px-2 py-1 text-xs"
        >
          <option value="">ბარათი...</option>
          {CARD_KEYS.map((k) => <option key={k} value={k}>{CARD_LABEL[k]}</option>)}
        </select>
        <input
          type="number" min="0" step="0.01" inputMode="decimal"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="ჩაერიცხა ₾"
          aria-label="ჩარიცხული თანხა ლარში"
          className="w-24 rounded-lg border border-[#465940]/20 bg-white px-2 py-1 text-xs"
        />
        {needsRate && (
          <input
            type="number" min="0" step="0.0001" inputMode="decimal"
            value={manualRate} onChange={(e) => setManualRate(e.target.value)}
            placeholder="კურსი"
            aria-label="USD კურსი ლარში"
            className="w-20 rounded-lg border border-amber-400 bg-white px-2 py-1 text-xs"
          />
        )}
        <button
          type="button" onClick={save} disabled={pending || !card || !amount}
          className="rounded-full bg-[#465940] px-3 py-1 text-[11px] font-bold text-[#FDFBF0] disabled:opacity-40"
        >
          {pending ? '...' : 'შენახვა'}
        </button>
        {settled && <button type="button" onClick={() => setEditing(false)} className="text-[10px] underline text-[#465940]/60">გაუქმება</button>}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
