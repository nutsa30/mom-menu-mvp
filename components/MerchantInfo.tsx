export default function MerchantInfo({ locale }: { locale: 'ka' | 'en' }) {
  const en = locale === 'en';
  return <div className="text-sm leading-relaxed space-y-1 break-words">
    <p className="font-bold">{en ? 'Service provider: ' : 'სერვისის მომწოდებელი: '}{BUSINESS.legalName} · {BUSINESS.brand}</p>
    <p>{en ? 'Business identification number: ' : 'საიდენტიფიკაციო ნომერი: '}{BUSINESS.registrationNumber} · {en ? BUSINESS.country : 'საქართველო'}</p>
    <p>{en ? BUSINESS.addressEn : BUSINESS.addressKa}</p>
    <p><a className="underline" href="mailto:info@mommenu.ge">info@mommenu.ge</a> · <a className="underline" href="tel:+995557466668">+995 557 46 66 68</a></p>
  </div>;
}
import { BUSINESS } from '@/lib/business';
