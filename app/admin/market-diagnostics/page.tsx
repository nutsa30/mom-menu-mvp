import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth';
import { getExperience } from '@/lib/experience';
import { marketDiagnostics } from '@/lib/market-diagnostics';

export const dynamic = 'force-dynamic';

export default async function MarketDiagnosticsPage() {
  await requireAdmin();
  const diagnostic = marketDiagnostics(await headers());
  const experience = await getExperience();
  const rows = [
    ['Vercel-ის ქვეყანა', diagnostic.vercelCountry || 'მონაცემი არ არის'],
    ['Cloudflare-ის ქვეყანა', diagnostic.cloudflareCountry || 'მონაცემი არ არის'],
    ['ქვეყნის მიხედვით სტუმრის ბაზარი', diagnostic.geoMarket],
    ['შენი ანგარიშის / პრევიუს მიმდინარე ბაზარი', experience.market],
    ['ადმინის პრევიუ', experience.preview || 'გამორთულია'],
    ['ქვეყნების განსხვავება', diagnostic.countriesDisagree ? 'კი — შესამოწმებელია' : 'არ დაფიქსირდა'],
    ['Cloudflare-ის მოთხოვნის ნიშანი', diagnostic.cloudflarePresent ? 'არის' : 'არ არის'],
  ];
  return <main className="w-full max-w-4xl p-5 sm:p-8">
    <h1 className="mb-4 text-2xl font-bold text-[#FDFBF0]">ბაზრის დიაგნოსტიკა</h1>
    <div className="rounded-2xl bg-[#FDFBF0] p-5 text-[#465940]">
      <p className="mb-4 text-sm">ეს არის ამ მოთხოვნის ტექნიკური შემოწმება. ქვეყანა IP-ის მიახლოებითი შეფასებაა და VPN-ს ვერ ადასტურებს. Cloudflare-ის მონაცემი მხოლოდ შედარებისთვის ჩანს; ბაზარს ავტომატურად არ ცვლის.</p>
      <dl className="space-y-3">{rows.map(([label, value]) => <div key={label} className="grid gap-1 border-b border-[#465940]/10 pb-3 sm:grid-cols-2">
        <dt className="font-semibold">{label}</dt><dd className="break-words">{value}</dd>
      </div>)}</dl>
      <p className="mt-4 text-sm">პრევიუ ან ანგარიშის ბაზარი სტუმრის IP-ით შერჩეულ ბაზარს შეიძლება არ ემთხვეოდეს. რეგისტრაციის ტექნიკური ჩანაწერები Vercel-ის Logs-ში მოძებნე ნიშნით: <code>[registration-market]</code>. email_pending და email_verified ერთმანეთს registrationId-ით უკავშირდება; წარმატებულ რეგისტრაციას userId აქვს.</p>
      <p className="mt-3 text-sm">სრული IP, ელფოსტა, პაროლი და კოდები ამ დიაგნოსტიკაში არ ინახება. ძველი რეგისტრაციების ქვეყნის აღდგენა ამ დამატებით ვერ მოხდება.</p>
    </div>
  </main>;
}
