import { prisma } from '@/lib/prisma';

const MONTHS_KA = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

function ageLabel(birthDate: Date): string {
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  if (now.getDate() < birthDate.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  if (years === 0) return `${months} თვე`;
  if (months === 0) return `${years} წელი`;
  return `${years} წელი ${months} თვე`;
}

// Days until the next annual anniversary of this birthDate (this year if not yet passed,
// otherwise next year) — drives the "who's coming up soon" sort.
function daysUntilNextBirthday(birthDate: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (next < today) next = new Date(now.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  return Math.round((next.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function AdminBirthdaysPage() {
  const children = await prisma.child.findMany({
    select: {
      id: true, name: true, birthDate: true,
      user: { select: { name: true, email: true } },
    },
  });

  const rows = children
    .map((c) => ({ ...c, daysUntil: daysUntilNextBirthday(c.birthDate) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">დაბადების დღეები</h1>
        <p className="text-[#465940]/60 text-sm mt-1">{rows.length} ბავშვი — დალაგებულია უახლოესი დაბადების დღის მიხედვით</p>
      </div>

      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-[#465940]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ბავშვი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">დაბადების თარიღი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ასაკი</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">დედის სახელი</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ელფოსტა</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">დღდ-მდე</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#465940]/5">
              {rows.map((c) => (
                <tr key={c.id} className={`hover:bg-[#465940]/5 transition ${c.daysUntil <= 7 ? 'bg-amber-50' : ''}`}>
                  <td className="px-6 py-4 text-sm font-bold text-[#465940]">{c.name}</td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70">
                    {c.birthDate.getDate()} {MONTHS_KA[c.birthDate.getMonth()]}, {c.birthDate.getFullYear()}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#465940]/70">{ageLabel(c.birthDate)}</td>
                  <td className="px-4 py-4 text-sm text-[#465940]">{c.user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#465940]/70">{c.user.email}</td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-[#465940]">
                    {c.daysUntil === 0 ? 'დღეს! 🎉' : `${c.daysUntil} დღე`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
