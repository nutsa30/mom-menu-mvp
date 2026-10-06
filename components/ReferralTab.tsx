'use client';
import { useExperience } from '@/components/ExperienceProvider';

import Copy, { useCopy } from '@/components/Copy';


import { useEffect, useState } from 'react';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

type Stats = {
  code: string;
  currency: 'GEL' | 'USD';
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
  const experience = useExperience();
  const [stats, setStats] = useState<Stats | null>(null);
  const currency = stats?.currency ?? experience.currency;
  const symbol = currency === 'USD' ? '$' : '₾';
  const formatPrice = (value: string | number) => currency === 'USD' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value)) : `${value}₾`;
  const copy = useCopy();
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
    return <div className={`${card} p-6 text-center text-sm text-[#465940]/50`}> <Copy>{"იტვირთება..."}</Copy> </div>;
  }

  return (
    <div className="space-y-4">
      {/* Own code */}
      <div className={`${card} p-5`}>
        <h3 className="font-black text-[#465940] mb-1"> <Copy>{"შენი პრომოკოდი"}</Copy> </h3>
        <p className="text-xs text-[#465940]/60 mb-4"> {experience.locale === 'en' ? 'Share your code with a friend. They receive 10% off their first payment. Your reward per successful referral is ' : 'გაუზიარე კოდი მეგობარს: პირველ გადახდაზე მიიღებს 10% ფასდაკლებას. შენი ჯილდო თითო წარმატებულ მოწვევაზეა '}{formatPrice(stats.creditPerReferral.toFixed(2))}{experience.locale === 'en' ? ', while their subscription remains active.' : ', სანამ მათი გამოწერა აქტიურია.'} </p>
        <div className="flex items-center gap-2">
          <span className="flex-1 font-mono font-black text-lg tracking-widest text-[#465940] bg-[#465940]/10 rounded-xl px-4 py-2.5 text-center">
            {stats.code}
          </span>
          <button onClick={copyCode}
            className="bg-[#465940] text-[#FDFBF0] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#465940]/90 transition flex-shrink-0">
            <Copy>{copied ? '✓ დაკოპირდა' : 'კოპირება'}</Copy>
          </button>
        </div>
      </div>

      {/* Redeem a friend's code */}
      {stats.canRedeem && (
        <div className={`${card} p-5`}>
          <h3 className="font-black text-[#465940] mb-1"> <Copy>{"გაქვს მეგობრის პრომოკოდი?"}</Copy> </h3>
          <p className="text-xs text-[#465940]/60 mb-3"> <Copy>{"შეიყვანე პირველი გამოწერის დაწყებამდე — მიიღებ"}</Copy> {stats.discountPercent} <Copy>{"% ფასდაკლებას პირველ გადახდაზე."}</Copy> </p>
          <p className="text-[11px] text-[#465940]/50 italic mb-3"> <Copy>{"გადახდისას ბარათიდან ჩამოგეჭრებათ სრული თანხა —"}</Copy> {stats.discountPercent} <Copy>{"%-იანი ფასდაკლება ავტომატურად დაგიბრუნდებათ იმავე ბარათზე ქეშბექის სახით, გადახდის დადასტურებისთანავე."}</Copy> </p>
          <div className="flex gap-2">
            <input
              value={redeemInput}
              onChange={(e) => setRedeemInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && redeem()}
              placeholder={copy("მაგ: AB2CD3E")}
              className="flex-1 min-w-0 border border-[#465940]/20 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-[#465940] bg-white focus:outline-none focus:border-[#465940]"
            />
            <button onClick={redeem} disabled={redeeming || !redeemInput.trim()}
              className="bg-[#465940] text-[#FDFBF0] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#465940]/90 transition disabled:opacity-50 flex-shrink-0">
              <Copy>{redeeming ? '...' : 'გააქტიურება'}</Copy>
            </button>
          </div>
          {redeemStatus && (
            <p className={`text-xs mt-2 font-semibold ${redeemStatus.ok ? 'text-[#465940]' : 'text-red-500'}`}>
              <Copy>{redeemStatus.msg}</Copy>
            </p>
          )}
        </div>
      )}
      {!stats.canRedeem && stats.alreadyUsedCode && (
        <div className={`${card} p-4`}>
          <p className="text-xs text-[#465940]/70"> <Copy>{"გააქტიურებული გაქვს კოდი"}</Copy> <span className="font-mono font-bold">{stats.alreadyUsedCode}</span>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1"> <Copy>{"მოწვეულია"}</Copy> </p>
          <p className="text-2xl font-black text-[#465940]">{stats.invitedCount}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1"> <Copy>{"გადაიხადა"}</Copy> </p>
          <p className="text-2xl font-black text-[#465940]">{stats.paidCount}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1"> <Copy>{"დაგროვილი კრედიტი"}</Copy> </p>
          <p className="text-2xl font-black text-[#465940]">{formatPrice(stats.availableCredit.toFixed(2))}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs font-semibold text-[#465940]/60 mb-1"> <Copy>{"მომდევნო გადასახდელი"}</Copy> </p>
          <p className="text-2xl font-black text-[#465940]">
            {stats.nextChargeAmount !== null ? formatPrice(stats.nextChargeAmount.toFixed(2)) : '—'}
          </p>
        </div>
      </div>

      <div className={`${card} p-4`}>
        <p className="text-xs font-semibold text-[#465940]/60 mb-2"> <Copy>{"კრედიტის ისტორია"}</Copy> </p>
        <div className="flex justify-between text-sm text-[#465940]/80 py-1">
          <span> <Copy>{"სულ დარიცხული"}</Copy> </span><span className="font-bold">{formatPrice(stats.totalEarned.toFixed(2))}</span>
        </div>
        <div className="flex justify-between text-sm text-[#465940]/80 py-1">
          <span> <Copy>{"გამოყენებულია"}</Copy> </span><span className="font-bold">{formatPrice(stats.totalUsed.toFixed(2))}</span>
        </div>
        <div className="flex justify-between text-sm text-[#465940]/80 py-1">
          <span> <Copy>{"გაუქმებულია (გაუქმებული გამომწერების გამო)"}</Copy> </span><span className="font-bold">{formatPrice(stats.totalReversed.toFixed(2))}</span>
        </div>
        <p className="text-[11px] text-[#465940]/50 italic mt-2 pt-2 border-t border-[#465940]/10"> <Copy>{"დაგროვილი კრედიტიც იმავე პრინციპით მუშაობს — შენს საკუთარ გადახდაზეც ჯერ ჩამოგეჭრება სრული ფასი, შემდეგ დაგროვილი კრედიტის ოდენობა ავტომატურად დაგიბრუნდება ქეშბექის სახით."}</Copy> </p>
      </div>
    </div>
  );
}
