'use client';

import { useEffect, useState } from 'react';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

type Stats = {
  code: string;
  discountPercent: number;
  creditPerReferral: number;
  invitedCount: number;
  paidCount: number;
  availableCredit: number;
  totalEarned: number;
  totalUsed: number;
  totalReversed: number;
  packagePrice: number | null;
  nextChargeAmount: number | null;
  canRedeem: boolean;
  alreadyUsedCode: string | null;
};

export default function ReferralTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const load = () => {
    fetch('/api/referral').then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const copyCode = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(stats.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const redeem = async () => {
    if (!redeemInput.trim() || redeeming) return;
    setRedeeming(true);
    setRedeemStatus(null);
    try {
      const res = await fetch('/api/referral/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRedeemStatus({ ok: true, msg: 'პრომოკოდი გააქტიურდა! 10% ფასდაკლება მოქმედებს პირველ გადახდაზე.' });
        setRedeemInput('');
        load();
      } else {
        setRedeemStatus({ ok: false, msg: data.message || 'ვერ მოხერხდა გააქტიურება.' });
      }
    } catch {
      setRedeemStatus({ ok: false, msg: 'შეცდომა, სცადეთ მოგვიანებით.' });
    } finally {
      setRedeeming(false);
    }
  };

  if (!stats) {
    return <div className={`${card} p-6 text-center text-sm text-[#465940]/50`}>იტვირთება...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Own code */}
      <div className={`${card} p-5`}>
        <h3 className="font-black text-[#465940] mb-1">შენი პრომოკოდი</h3>
        <p className="text-xs text-[#465940]/60 mb-4">
          გაუზიარე შენი კოდი მეგობარს. მეგობარი მიიღებს 10%-იან ფასდაკლებას, შენ კი თითო წარმატებით გადახდილ მომხმარებელზე
          დაგერიცხება 1.70₾ ფასდაკლება, მანამ, სანამ მოწვეული მომხმარებლის გამოწერა აქტიურია.
        </p>
        <div className="flex items-center gap-2">
          <span className="flex-1 font-mono font-black text-lg tracking-widest text-[#465940] bg-[#465940]/10 rounded-xl px-4 py-2.5 text-center">
            {stats.code}
          </span>
          <button onClick={copyCode}
            className="bg-[#465940] text-[#FDFBF0] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#465940]/90 transition flex-shrink-0">
            {copied ? '✓ დაკოპირდა' : 'კოპირება'}
          </button>
        </div>
      </div>

      {/* Redeem a friend's code */}
      {stats.canRedeem && (
        <div className={`${card} p-5`}>
          <h3 className="font-black text-[#465940] mb-1">გაქვს მეგობრის პრომოკოდი?</h3>
          <p className="text-xs text-[#465940]/60 mb-3">
            შეიყვანე პირველი გამოწერის დაწყებამდე — მიიღებ {stats.discountPercent}% ფასდაკლებას პირველ გადახდაზე.
          </p>
          <p className="text-[11px] text-[#465940]/50 italic mb-3">
            გადახდისას ბარათიდან ჩამოგეჭრებათ სრული თანხა — {stats.discountPercent}%-იანი ფასდაკლება ავტომატურად
            დაგიბრუნდებათ იმავე ბარათზე ქეშბექის სახით, გადახდის დადასტურებისთანავე.
          </p>
          <div className="flex gap-2">
            <input
              value={redeemInput}
              onChange={(e) => setRedeemInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && redeem()}
              placeholder="მაგ: AB2CD3E"
              className="flex-1 min-w-0 border border-[#465940]/20 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-[#465940] bg-white focus:outline-none focus:border-[#465940]"
            />
            <button onClick={redeem} disabled={redeeming || !redeemInput.trim()}
              className="bg-[#465940] text-[#FDFBF0] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#465940]/90 transition disabled:opacity-50 flex-shrink-0">
              {redeeming ? '...' : 'გააქტიურება'}
            </button>
          </div>
          {redeemStatus && (
            <p className={`text-xs mt-2 font-semibold ${redeemStatus.ok ? 'text-[#465940]' : 'text-red-500'}`}>
              {redeemStatus.msg}
            </p>
          )}
        </div>
      )}
      {!stats.canRedeem && stats.alreadyUsedCode && (
        <div className={`${card} p-4`}>
          <p className="text-xs text-[#465940]/70">
            გააქტიურებული გაქვს კოდი <span className="font-mono font-bold">{stats.alreadyUsedCode}</span>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1">მოწვეულია</p>
          <p className="text-2xl font-black text-[#465940]">{stats.invitedCount}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1">გადაიხადა</p>
          <p className="text-2xl font-black text-[#465940]">{stats.paidCount}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1">დაგროვილი კრედიტი</p>
          <p className="text-2xl font-black text-[#465940]">{stats.availableCredit.toFixed(2)}₾</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1">მომდევნო გადასახდელი</p>
          <p className="text-2xl font-black text-[#465940]">
            {stats.nextChargeAmount !== null ? `${stats.nextChargeAmount.toFixed(2)}₾` : '—'}
          </p>
        </div>
      </div>

      <div className={`${card} p-4`}>
        <p className="text-xs font-semibold text-[#465940]/60 mb-2">კრედიტის ისტორია</p>
        <div className="flex justify-between text-sm text-[#465940]/80 py-1">
          <span>სულ დარიცხული</span><span className="font-bold">{stats.totalEarned.toFixed(2)}₾</span>
        </div>
        <div className="flex justify-between text-sm text-[#465940]/80 py-1">
          <span>გამოყენებულია</span><span className="font-bold">{stats.totalUsed.toFixed(2)}₾</span>
        </div>
        <div className="flex justify-between text-sm text-[#465940]/80 py-1">
          <span>გაუქმებულია (გაუქმებული გამომწერების გამო)</span><span className="font-bold">{stats.totalReversed.toFixed(2)}₾</span>
        </div>
        <p className="text-[11px] text-[#465940]/50 italic mt-2 pt-2 border-t border-[#465940]/10">
          დაგროვილი კრედიტიც იმავე პრინციპით მუშაობს — შენს საკუთარ გადახდაზეც ჯერ ჩამოგეჭრება სრული ფასი, შემდეგ
          დაგროვილი კრედიტის ოდენობა ავტომატურად დაგიბრუნდება ქეშბექის სახით.
        </p>
      </div>
    </div>
  );
}
