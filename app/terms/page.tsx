import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'მომსახურების პირობები — mom menu',
  description: 'mom menu-ის გამოყენების პირობები და სერვისის პოლიტიკა.',
  openGraph: { title: 'მომსახურების პირობები — mom menu', url: '/terms' },
  robots: { index: false, follow: false },
};

export default function TermsPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  return (
    <main className="min-h-screen bg-[#465940]">

      {/* Header */}
      <div className="bg-[#FDFBF0] border-b border-[#465940]/10">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <h1 className="text-4xl font-black text-[#465940] mb-3">
            {ka ? 'გამოყენების პირობები' : 'Terms of Service'}
          </h1>
          <p className="text-sm text-[#465940]/60">
            {ka ? 'ბოლო განახლება: 2026 წლის მაისი' : 'Last updated: May 2026'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-8">

        {/* Intro */}
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-8">
          <p className="text-[#465940]/80 leading-relaxed">
            {ka
              ? 'mom menu-ის სერვისით სარგებლობით თქვენ ეთანხმებით ამ პირობებს. გთხოვთ, ყურადღებით წაიკითხოთ სარგებლობამდე.'
              : 'By using the mom menu service, you agree to these terms. Please read them carefully before use.'}
          </p>
        </div>

        <Section num="01" title={ka ? 'სერვისი და მომხმარებელი' : 'Service and user'}>
          <p className="text-[#465940]/80 text-sm leading-relaxed mb-4">
            {ka
              ? 'mom menu არის ონლაინ პლატფორმა, რომელიც მშობლებს სთავაზობს ბავშვების კვების გეგმების შექმნის სერვისს. სერვისით სარგებლობა შეუძლია ნებისმიერ პირს, ვინც:'
              : 'mom menu is an online platform offering meal plan creation services for parents. The service may be used by anyone who:'}
          </p>
          <ul className="space-y-2 text-sm text-[#465940]/80">
            {(ka ? [
              '18 წელს გადაცილებულია',
              'ზუსტ ინფორმაციას მიუთითებს რეგისტრაციისას',
              'პასუხისმგებლობით იყენებს სერვისს',
            ] : [
              'Is 18 years of age or older',
              'Provides accurate information during registration',
              'Uses the service responsibly',
            ]).map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 text-[#465940] font-black leading-none mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section num="02" title={ka ? 'ანგარიში და უსაფრთხოება' : 'Account and security'}>
          <div className="space-y-4 text-sm text-[#465940]/80 leading-relaxed">
            <p>
              {ka
                ? 'თქვენ პასუხისმგებელი ხართ თქვენი ანგარიშის სახელისა და პაროლის კონფიდენციალურობაზე. ანგარიშიდან განხორციელებული ნებისმიერი მოქმედება თქვენს პასუხისმგებლობად ითვლება.'
                : 'You are responsible for maintaining the confidentiality of your account credentials. Any action taken from your account is considered your responsibility.'}
            </p>
            <p>
              {ka
                ? 'სხვა პირის მონაცემებით ანგარიშის შექმნა ან სხვისი ანგარიშის გამოყენება მკაცრად აკრძალულია.'
                : 'Creating an account using another person\'s information or using someone else\'s account is strictly prohibited.'}
            </p>
          </div>
        </Section>

        <Section num="03" title={ka ? 'გამოწერა და გადახდა' : 'Subscription and payment'}>
          <div className="space-y-4 text-sm text-[#465940]/80 leading-relaxed">
            <p>
              {ka
                ? 'mom menu გთავაზობთ უფასო და ფასიანი გამოწერის გეგმებს. ფასიანი გამოწერის პირობები:'
                : 'mom menu offers free and paid subscription plans. Paid subscription terms:'}
            </p>
            <ul className="space-y-2">
              {(ka ? [
                'გამოწერა ავტომატურად განახლდება ყოველ თვე',
                'გაუქმება შეიძლება ნებისმიერ დროს პარამეტრებიდან',
                'გაუქმების შემდეგ სარგებლობა შეიძლება მიმდინარე პერიოდის ბოლომდე',
                'ფასები შეიძლება შეიცვალოს წინასწარი შეტყობინებით',
              ] : [
                'Subscriptions renew automatically each month',
                'Cancellation is possible at any time from settings',
                'After cancellation, access continues until the end of the current period',
                'Prices may change with prior notice',
              ]).map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 text-[#465940] font-black leading-none mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section num="04" title={ka ? 'დაუშვებელი გამოყენება' : 'Prohibited use'}>
          <p className="text-[#465940]/80 text-sm leading-relaxed mb-4">
            {ka ? 'სერვისის გამოყენება აკრძალულია შემდეგი მიზნებისთვის:' : 'Use of the service is prohibited for the following purposes:'}
          </p>
          <ul className="space-y-2 text-sm text-[#465940]/80">
            {(ka ? [
              'სხვა მომხმარებლების შეცდომაში შეყვანა ან მათი ანგარიშებზე წვდომის მცდელობა',
              'სერვისის ავტომატური ხელსაწყოებით ბოროტად გამოყენება',
              'კონტენტის კომერციული მიზნებისთვის გამოყენება ნებართვის გარეშე',
              'სერვისის სტაბილური მუშაობის ხელის შეშლა',
            ] : [
              'Misleading other users or attempting to access their accounts',
              'Abusing the service with automated tools',
              'Using content for commercial purposes without permission',
              'Disrupting the stable operation of the service',
            ]).map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 text-[#FDFBF0]/70 font-black leading-none mt-0.5">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section num="05" title={ka ? 'ინტელექტუალური საკუთრება' : 'Intellectual property'}>
          <p className="text-[#465940]/80 text-sm leading-relaxed">
            {ka
              ? 'პლატფორმაზე განთავსებული ყველა კონტენტი — კერძების რეცეპტები, ტექსტები, დიზაინი და ლოგო — წარმოადგენს mom menu-ის ინტელექტუალურ საკუთრებას. ამ კონტენტის კოპირება, გავრცელება ან კომერციული მიზნებისთვის გამოყენება დასაშვებია მხოლოდ წინასწარი წერილობითი თანხმობით.'
              : 'All content on the platform — recipes, texts, design and logo — is the intellectual property of mom menu. Copying, distributing or using this content for commercial purposes is only permitted with prior written consent.'}
          </p>
        </Section>

        <Section num="06" title={ka ? 'სერვისის ხელმისაწვდომობა' : 'Service availability'}>
          <p className="text-[#465940]/80 text-sm leading-relaxed">
            {ka
              ? 'ვცდილობთ სერვისი მუდმივად ხელმისაწვდომი იყოს, თუმცა არ ვიძლევით გარანტიას შეუფერხებელ მუშაობაზე. ტექნიკური სამუშაოების ან გაუთვალისწინებელი გარემოებების შემთხვევაში სერვისი შეიძლება დროებით მიუწვდომელი გახდეს.'
              : 'We strive to keep the service continuously available, but we cannot guarantee uninterrupted operation. In case of technical work or unforeseen circumstances, the service may become temporarily unavailable.'}
          </p>
        </Section>

        <Section num="07" title={ka ? 'ანგარიშის შეჩერება' : 'Account suspension'}>
          <p className="text-[#465940]/80 text-sm leading-relaxed">
            {ka
              ? 'mom menu იტოვებს უფლებას შეაჩეროს ან წაშალოს ანგარიში, თუ მომხმარებელი არღვევს ამ პირობებს. ასეთ შემთხვევაში მომხმარებელი წინასწარ ან დარღვევისთანავე ეცნობება.'
              : 'mom menu reserves the right to suspend or delete an account if a user violates these terms. In such cases, the user will be notified in advance or at the time of the violation.'}
          </p>
        </Section>

        <Section num="08" title={ka ? 'პირობების ცვლილება' : 'Changes to terms'}>
          <p className="text-[#465940]/80 text-sm leading-relaxed">
            {ka
              ? 'mom menu იტოვებს უფლებას შეცვალოს ეს პირობები. ცვლილების შემთხვევაში მომხმარებლები ეცნობებიან ელ.ფოსტით ან სერვისში შეტყობინებით. სერვისის შემდგომი გამოყენება ახალ პირობებზე თანხმობად ჩაითვლება.'
              : 'mom menu reserves the right to modify these terms. In the event of changes, users will be notified by email or in-app notification. Continued use of the service will be considered acceptance of the new terms.'}
          </p>
        </Section>

        {/* Contact */}
        <div className="bg-[#465940] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-[#FDFBF0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FDFBF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className="font-black text-[#FDFBF0] mb-2">
            {ka ? 'კითხვები გაქვთ?' : 'Have questions?'}
          </h3>
          <p className="text-sm text-[#FDFBF0]/70 mb-1">
            {ka
              ? 'პირობებთან დაკავშირებული ნებისმიერი კითხვისთვის მოგვწერეთ:'
              : 'For any questions regarding these terms, contact us at:'}
          </p>
          <p className="text-sm text-[#FDFBF0]/60 italic">
            {ka ? 'მეილი მალე დაემატება' : 'Email coming soon'}
          </p>
        </div>

      </div>

    </main>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-black text-[#FDFBF0] bg-[#465940] px-3 py-1 rounded-full">{num}</span>
        <h2 className="text-xl font-black text-[#465940]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
