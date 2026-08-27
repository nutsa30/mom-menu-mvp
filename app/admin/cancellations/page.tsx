import { prisma } from '@/lib/prisma';

// Georgian labels — kept in sync with CANCEL_REASONS in components/DashboardClient.tsx
// (the modal shown at cancel-click time) and the CancellationReason enum in schema.prisma.
const REASON_LABEL: Record<string, string> = {
  PRICE: 'ძვირია',
  NOT_NEEDED: 'აღარ სჭირდება',
  NOT_USED_ENOUGH: 'საკმარისად ხშირად ვერ იყენებდა',
  MISSING_FEATURES: 'ფუნქციები არ ჰყოფნიდა',
  DISLIKED_MENU: 'მენიუ/რეცეპტები არ მოეწონა',
  TECHNICAL_ISSUE: 'ტექნიკური პრობლემა',
  OTHER: 'სხვა',
};

const PLAN_LABEL: Record<string, string> = {
  RECIPE_PLAN: 'რეცეპტების წვდომა',
  FULL_PLAN: 'სრული პაკეტი',
};

export default async function AdminCancellationsPage() {
  const cancellations = await prisma.subscriptionCancellation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });

  const total = cancellations.length;
  const byReason = Object.keys(REASON_LABEL).map((reason) => ({
    reason,
    label: REASON_LABEL[reason],
    count: cancellations.filter((c) => c.reason === reason).length,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...byReason.map((r) => r.count), 1);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const last30Days = cancellations.filter((c) => new Date(c.createdAt) > thirtyDaysAgo).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">გაუქმებები</h1>
        <p className="text-[#465940]/60 text-sm mt-1">{total} გაუქმება სულ — ვინ და რატომ გააუქმა გამოწერა</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div className="bg-[#465940] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-3">სულ გაუქმება</p>
          <p className="text-3xl font-black text-[#FDFBF0]">{total}</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">ბოლო 30 დღე</p>
          <p className="text-3xl font-black text-[#465940]">{last30Days}</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm col-span-2">
          <p className="text-xs font-semibold text-[#465940] mb-3">ყველაზე ხშირი მიზეზი</p>
          <p className="text-2xl font-black text-[#465940]">{byReason[0]?.count ? byReason[0].label : '—'}</p>
        </div>
      </div>

      {/* Breakdown by reason */}
      <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm mb-6 lg:mb-8">
        <h2 className="mb-4 font-bold text-[#465940]">მიზეზების განაწილება</h2>
        <div className="space-y-4">
          {byReason.map((r) => {
            const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
            return (
              <div key={r.reason}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-[#465940]">{r.label}</span>
                  <span className="font-black text-[#465940]">{r.count} <span className="font-normal text-[#465940]/50">({pct}%)</span></span>
                </div>
                <div className="h-3 bg-[#465940]/10 rounded-full overflow-hidden">
                  <div className="h-3 rounded-full bg-[#465940]" style={{ width: `${(r.count / maxCount) * 100}%` }} />
                </div>
              </div>
            );
          })}
          {total === 0 && <p className="text-center text-sm text-[#465940]/40">ჯერ გაუქმება არ ყოფილა</p>}
        </div>
      </section>

      {/* Table */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        {cancellations.length === 0 ? (
          <p className="text-center py-12 text-[#465940]/60 text-sm">ჯერ გაუქმება არ ყოფილა</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[#465940]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თარიღი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მომხმარებელი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მიზეზი</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">დეტალი</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465940]/5">
                {cancellations.map((c) => (
                  <tr key={c.id} className="hover:bg-[#465940]/5 transition">
                    <td className="px-6 py-4 text-sm text-[#465940]/70">{new Date(c.createdAt).toLocaleDateString('ka-GE')}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#465940]">{c.user.name}</p>
                      <p className="text-xs text-[#465940]/50">{c.user.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#465940]/70">{PLAN_LABEL[c.plan] ?? c.plan}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]">
                        {REASON_LABEL[c.reason] ?? c.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#465940]/70 max-w-xs truncate" title={c.reasonText ?? ''}>{c.reasonText ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
