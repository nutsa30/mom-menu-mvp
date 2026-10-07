import RefundPolicy from '@/components/RefundPolicy';
import MerchantInfo from '@/components/MerchantInfo';
import { localizedMetadata } from '@/lib/metadata';
export async function generateMetadata() {
  return localizedMetadata({ title: 'გაუქმება და თანხის დაბრუნება — Mommenu' }, 'Refunds and cancellation — Mommenu', 'Cancel your subscription and request a refund, including UK customer rights.', '/refunds');
}
export default async function RefundsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = (await searchParams).lang === 'en' ? 'en' : 'ka';
  return <main className="min-h-screen bg-[#6F7A5C] px-4 sm:px-6 py-10 sm:py-14"><article className="max-w-3xl mx-auto rounded-3xl bg-[#F5F1E4] p-5 sm:p-8">
    <h1 className="text-3xl font-black text-[#6F7A5C] mb-3">{locale === 'en' ? 'Refunds and cancellation' : 'გაუქმება და თანხის დაბრუნება'}</h1>
    <p className="text-xs text-[#6F7A5C]/70 mb-6">{locale === 'en' ? 'Last updated: 7 October 2026' : 'ბოლო განახლება: 7 ოქტომბერი, 2026'}</p>
    <RefundPolicy locale={locale} />
    <div className="mt-8 pt-6 border-t border-[#6F7A5C]/20 text-[#6F7A5C]"><MerchantInfo locale={locale} /></div>
  </article></main>;
}
