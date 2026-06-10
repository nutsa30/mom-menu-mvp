import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'კონფიდენციალურობის პოლიტიკა — mom menu',
  description: 'mom menu-ის კონფიდენციალურობის პოლიტიკა. გაეცანი როგორ ვიყენებთ და ვიცავთ შენს პირად მონაცემებს.',
  openGraph: { title: 'კონფიდენციალურობის პოლიტიკა — mom menu', url: '/privacy' },
  robots: { index: false, follow: false },
};

export default function PrivacyPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  return (
    <main className="min-h-screen bg-[#465940]">

      {/* Header */}
      <div className="bg-[#FDFBF0] border-b border-[#465940]/10">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <h1 className="text-4xl font-black text-[#465940] mb-3">
            {ka ? 'კონფიდენციალურობის პოლიტიკა' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-[#465940]/60">
            {ka ? 'ბოლო განახლება: 2026 წლის მაისი' : 'Last updated: May 2026'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-12">

        {/* Intro */}
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-8">
          <p className="text-[#465940]/80 leading-relaxed">
            {ka
              ? 'mom menu ("ჩვენ", "ჩვენი") პატივს სცემს თქვენს კონფიდენციალურობას. ეს დოკუმენტი განმარტავს, თუ რა პერსონალურ მონაცემებს ვაგროვებთ, როგორ ვიყენებთ და როგორ ვიცავთ მათ, როდესაც იყენებთ ჩვენს სერვისს.'
              : 'mom menu ("we", "our") respects your privacy. This document explains what personal data we collect, how we use it, and how we protect it when you use our service.'}
          </p>
        </div>

        <Section
          num="01"
          title={ka ? 'რა ინფორმაციას ვაგროვებთ' : 'What information we collect'}
        >
          <SubSection title={ka ? 'ანგარიშის მონაცემები' : 'Account data'}>
            {ka
              ? 'რეგისტრაციისას ვაგროვებთ: სახელსა და გვარს, ელექტრონული ფოსტის მისამართს და პაროლს (დაშიფრული სახით — პირდაპირი პაროლი არასდროს ინახება).'
              : 'When you register, we collect: your full name, email address, and password (stored in encrypted form — your actual password is never stored).'}
          </SubSection>
          <SubSection title={ka ? 'ბავშვის მონაცემები' : "Child's data"}>
            {ka
              ? 'კვების გეგმის პერსონალიზაციისთვის ვაგროვებთ ბავშვის სახელს, დაბადების თარიღს და ალერგიების სიას. ეს მონაცემები გამოიყენება მხოლოდ სერვისის მიწოდებისთვის.'
              : "For meal plan personalization, we collect your child's name, date of birth, and allergy information. This data is used solely to provide the service."}
          </SubSection>
          <SubSection title={ka ? 'გამოყენების მონაცემები' : 'Usage data'}>
            {ka
              ? 'ვაგროვებთ ინფორმაციას, თუ როგორ იყენებთ სერვისს — გენერირებული კვების გეგმები, არჩეული კერძები, გამოწერის სტატუსი.'
              : 'We collect information about how you use our service — generated meal plans, selected dishes, subscription status.'}
          </SubSection>
          <SubSection title={ka ? 'ტექნიკური მონაცემები' : 'Technical data'}>
            {ka
              ? 'ავტორიზაციისთვის ვიყენებთ httpOnly JWT cookie-ს. ეს cookie უსაფრთხოა და JavaScript-ით წვდომა არ შეიძლება.'
              : 'For authentication, we use an httpOnly JWT cookie. This cookie is secure and cannot be accessed by JavaScript.'}
          </SubSection>
        </Section>

        <Section
          num="02"
          title={ka ? 'რატომ ვიყენებთ თქვენს მონაცემებს' : 'Why we use your data'}
        >
          <ul className="space-y-3 text-[#465940]/80 text-sm leading-relaxed">
            {(ka ? [
              'პერსონალური კვების გეგმების შექმნა და მიწოდება',
              'ანგარიშის მართვა და უსაფრთხო ავტორიზაცია',
              'გამოწერის სტატუსის და გადახდების დამუშავება',
              'სერვისის გაუმჯობესება და ტექნიკური მხარდაჭერა',
              'სამართლებრივი ვალდებულებების შესრულება',
            ] : [
              'Creating and delivering personalized meal plans',
              'Account management and secure authentication',
              'Processing subscription status and payments',
              'Service improvement and technical support',
              'Compliance with legal obligations',
            ]).map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#465940] text-[#FDFBF0] text-[10px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          num="03"
          title={ka ? 'ვინ ხედავს თქვენს მონაცემებს' : 'Who can see your data'}
        >
          <p className="text-[#465940]/80 text-sm leading-relaxed mb-4">
            {ka
              ? 'თქვენს პერსონალურ მონაცემებს არ ვყიდით, არ ვქირაობთ და არ ვაზიარებთ მესამე პირებთან, გარდა შემდეგი შემთხვევებისა:'
              : 'We do not sell, rent, or share your personal data with third parties, except in the following cases:'}
          </p>
          <ul className="space-y-3 text-[#465940]/80 text-sm leading-relaxed">
            {(ka ? [
              'ტექნიკური ინფრასტრუქტურის პროვაიდერები (მონაცემთა ბაზა, სერვერი) — მხოლოდ სერვისის ფუნქციონირებისთვის',
              'კანონით გათვალისწინებული შემთხვევები — სასამართლოს ან უფლებამოსილი ორგანოს მოთხოვნით',
            ] : [
              'Technical infrastructure providers (database, server) — solely for service operation',
              'As required by law — upon request from a court or authorized authority',
            ]).map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 text-[#465940] font-black text-base leading-none mt-0.5">—</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          num="04"
          title={ka ? 'Cookie-ები' : 'Cookies'}
        >
          <p className="text-[#465940]/80 text-sm leading-relaxed mb-4">
            {ka
              ? 'ვიყენებთ მხოლოდ ერთ cookie-ს — ავტორიზაციის JWT ტოკენს (mom_menu_token). ეს cookie:'
              : 'We use only one cookie — the authentication JWT token (mom_menu_token). This cookie is:'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(ka ? [
              { label: 'httpOnly', desc: 'JavaScript-ით წვდომა შეუძლებელია' },
              { label: 'Secure', desc: 'მხოლოდ HTTPS კავშირით გადადის' },
              { label: 'SameSite', desc: 'CSRF შეტევებისგან დაცულია' },
              { label: 'დროებითი', desc: 'გასვლისას ავტომატურად იშლება' },
            ] : [
              { label: 'httpOnly', desc: 'Cannot be accessed by JavaScript' },
              { label: 'Secure', desc: 'Only transmitted over HTTPS' },
              { label: 'SameSite', desc: 'Protected against CSRF attacks' },
              { label: 'Temporary', desc: 'Automatically deleted on logout' },
            ]).map(({ label, desc }) => (
              <div key={label} className="bg-[#465940] rounded-xl p-4">
                <p className="font-black text-[#FDFBF0] text-sm mb-1">{label}</p>
                <p className="text-xs text-[#FDFBF0]/70">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[#465940]/70 text-xs mt-4 leading-relaxed">
            {ka
              ? 'სარეკლამო, ანალიტიკური ან მესამე მხარის tracking cookie-ებს არ ვიყენებთ.'
              : 'We do not use advertising, analytics, or third-party tracking cookies.'}
          </p>
        </Section>

        <Section
          num="05"
          title={ka ? 'თქვენი უფლებები' : 'Your rights'}
        >
          <p className="text-[#465940]/80 text-sm leading-relaxed mb-4">
            {ka ? 'თქვენ გაქვთ უფლება:' : 'You have the right to:'}
          </p>
          <ul className="space-y-3 text-[#465940]/80 text-sm leading-relaxed">
            {(ka ? [
              'ნახოთ, რა მონაცემები გვაქვს თქვენზე',
              'შეასწოროთ არასწორი მონაცემები პარამეტრებიდან',
              'მოითხოვოთ თქვენი ანგარიშისა და ყველა მონაცემის წაშლა',
              'გამოხვიდეთ გამოწერიდან ნებისმიერ დროს',
              'მოითხოვოთ თქვენი მონაცემების ასლი',
            ] : [
              'See what data we hold about you',
              'Correct inaccurate data from your settings',
              'Request deletion of your account and all associated data',
              'Cancel your subscription at any time',
              'Request a copy of your personal data',
            ]).map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 text-[#465940] font-black leading-none mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          num="06"
          title={ka ? 'მონაცემების შენახვის ვადა' : 'Data retention'}
        >
          <p className="text-[#465940]/80 text-sm leading-relaxed">
            {ka
              ? 'თქვენს მონაცემებს ვინახავთ მანამ, სანამ გამოიყენებთ სერვისს. ანგარიშის წაშლის მოთხოვნის შემდეგ, ყველა პერსონალური მონაცემი წაიშლება 30 დღის განმავლობაში, გარდა იმ შემთხვევებისა, როდესაც კანონი გვავალდებულებს უფრო ხანგრძლივ შენახვას.'
              : 'We retain your data for as long as you use the service. Upon a deletion request, all personal data will be erased within 30 days, unless we are legally required to retain it longer.'}
          </p>
        </Section>

        <Section
          num="07"
          title={ka ? 'ცვლილებები პოლიტიკაში' : 'Changes to this policy'}
        >
          <p className="text-[#465940]/80 text-sm leading-relaxed">
            {ka
              ? 'პოლიტიკის მნიშვნელოვანი ცვლილების შემთხვევაში, გაცნობებთ ელ.ფოსტით ან სერვისში შეტყობინებით. განახლებული პოლიტიკა ამ გვერდზე გამოჩნდება "ბოლო განახლების" თარიღის ცვლილებით.'
              : "In the event of significant changes to this policy, we will notify you by email or in-app notification. The updated policy will appear on this page with a revised \"last updated\" date."}
          </p>
        </Section>

        {/* Contact box */}
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
              ? 'კონფიდენციალურობასთან დაკავშირებული ნებისმიერი კითხვისთვის მოგვწერეთ:'
              : 'For any privacy-related questions, contact us at:'}
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-black text-[#465940] mb-1.5">{title}</p>
      <p className="text-sm text-[#465940]/80 leading-relaxed">{children}</p>
    </div>
  );
}
