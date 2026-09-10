import { prisma } from '@/lib/prisma';

// Georgian labels — kept in sync with CANCEL_REASONS in components/DashboardClient.tsx
// (both the cancel-subscription modal and the delete-account modal use this same list)
// and the CancellationReason enum in schema.prisma.
const REASON_LABEL: Record<string, string> = {
  PRICE: 'ძვირია',
  NOT_NEEDED: 'აღარ სჭირდება',
  NOT_USED_ENOUGH: 'საკმარისად ხშირად ვერ იყენებდა',
  MISSING_FEATURES: 'ფუნქციები არ ჰყოფნიდა',
  DISLIKED_MENU: 'მენიუ/რეცეპტები არ მოეწონა',
  TECHNICAL_ISSUE: 'ტექნიკური პრობლემა',
  WANT_DIFFERENT_PLAN: 'სხვა პაკეტზე გადასვლა სურდა',
  OTHER: 'სხვა',
};

const PLAN_LABEL: Record<string, string> = {
  FREE: 'უფასო',
  RECIPE_PLAN: 'რეცეპტების წვდომა',
  FULL_PLAN: 'სრული პაკეტი',
  CANCELED: 'გაუქმებული',
};

// Unified row shape — a plain "cancel subscription" click (SubscriptionCancellation, still
// tied to a live User row) and a full "delete my account" (AccountDeletion, a standalone
// snapshot with no User row left to read from) merge into one list here so admin sees both
// side by side, newest first, distinguished only by the `type` badge.
type UnifiedRow = {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  plan: string;
  reason: string;
  reasonText: string | null;
  type: 'CANCEL' | 'DELETE';
};

export default async function AdminCancellationsPage() {
  const [cancellations, deletions] = await Promise.all([
    prisma.subscriptionCancellation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.accountDeletion.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  const unified: UnifiedRow[] = [
    ...cancellations.map((c): UnifiedRow => ({
      id: c.id, createdAt: c.createdAt, name: c.user.name, email: c.user.email,
      plan: c.plan, reason: c.reason, reasonText: c.reasonText, type: 'CANCEL',
    })),
    ...deletions.map((d): UnifiedRow => ({
      id: d.id, createdAt: d.createdAt, name: d.userName, email: d.userEmail,
      plan: d.plan, reason: d.reason, reasonText: d.reasonText, type: 'DELETE',
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = unified.length;
  const cancelOnlyCount = cancellations.length;
  const deleteCount = deletions.length;

  const byReason = Object.keys(REASON_LABEL).map((reason) => ({
    reason,
    label: REASON_LABEL[reason],
    count: unified.filter((r) => r.reason === reason).length,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...byReason.map((r) => r.count), 1);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const last30Days = unified.filter((r) => new Date(r.createdAt) > thirtyDaysAgo).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">გაუქმებები</h1>
        <p className="text-[#465940]/60 text-sm mt-1">{total} მოვლენა სულ — ვინ, რა გააკეთა (გააუქმა გამოწერა თუ წაშალა ანგარიში) და რატომ</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div className="bg-[#465940] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-3">გააუქმა გამოწერა</p>
          <p className="text-3xl font-black text-[#FDFBF0]">{cancelOnlyCount}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-red-200 shadow-sm">
          <p className="text-xs font-semibold text-red-700 mb-3">🗑️ წაშალა ანგარიში</p>
          <p className="text-3xl font-black text-red-600">{deleteCount}</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">ბოლო 30 დღე</p>
          <p className="text-3xl font-black text-[#465940]">{last30Days}</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">ყველაზე ხშირი მიზეზი</p>
          <p className="text-xl font-black text-[#465940]">{byReason[0]?.count ? byReason[0].label : '—'}</p>
        </div>
      </div>

      {/* Breakdown by reason */}
      <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm mb-6 lg:mb-8">
        <h2 className="mb-4 font-bold text-[#465940]">მიზეზების განაწილება (ორივე ერთად)</h2>
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
          {total === 0 && <p className="text-center text-sm text-[#465940]/40">ჯერ არც გაუქმება და არც ანგარიშის წაშლა ყოფილა</p>}
        </div>
      </section>

      {/* Table */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        {unified.length === 0 ? (
          <p className="text-center py-12 text-[#465940]/60 text-sm">ჯერ არც გაუქმება და არც ანგარიშის წაშლა ყოფილა</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead className="bg-[#465940]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თარიღი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ტიპი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მომხმარებელი</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მიზეზი</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">დეტალი</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465940]/5">
                {unified.map((r) => (
                  <tr key={`${r.type}-${r.id}`} className="hover:bg-[#465940]/5 transition">
                    <td className="px-6 py-4 text-sm text-[#465940]/70">{new Date(r.createdAt).toLocaleDateString('ka-GE')}</td>
                    <td className="px-4 py-4">
                      {r.type === 'DELETE' ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">🗑️ ანგარიშის წაშლა</span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]">გამოწერის გაუქმება</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#465940]">{r.name}</p>
                      <p className="text-xs text-[#465940]/50">{r.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#465940]/70">{PLAN_LABEL[r.plan] ?? r.plan}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]">
                        {REASON_LABEL[r.reason] ?? r.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#465940]/70 max-w-xs truncate" title={r.reasonText ?? ''}>{r.reasonText ?? '—'}</td>
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
