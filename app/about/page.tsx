import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ჩვენ შესახებ — moMeals',
  description: 'moMeals — ქართული სტარტაპი, რომელიც მშობლებს ეხმარება ბავშვის ჯანსაღი კვების ჩვევების ჩამოყალიბებაში პერსონალური მენიუებით.',
  alternates: {
    canonical: '/about',
    languages: { 'ka': '/about?lang=ka', 'en': '/about?lang=en', 'x-default': '/about' },
  },
  openGraph: {
    title: 'ჩვენ შესახებ — moMeals',
    url: '/about',
    images: [{ url: `/og?title=About+moMeals&sub=Georgian+startup+for+personalized+child+meal+planning`, width: 1200, height: 630, alt: 'About moMeals' }],
  },
};

export default function AboutPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  return (
    <main className="min-h-screen bg-[#fff8f6]">

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-20 px-6 text-center">
        <p className="text-[#ff7f50] text-xs font-black uppercase tracking-widest mb-4">
          {ka ? 'ჩვენ შესახებ' : 'About us'}
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight max-w-2xl mx-auto">
          {ka
            ? 'შეიქმნა დედის მიერ — დედებისთვის'
            : 'Built by a mom — for moms'}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          {ka
            ? 'moMeals არ არის უბრალოდ პროდუქტი. ეს არის პასუხი ყოველდღიურ კითხვაზე — „ხვალ რას ვაჭმევ?"'
            : 'moMeals is not just a product. It\'s an answer to the daily question — "What do I feed them tomorrow?"'}
        </p>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Quote block */}
          <div className="bg-[#fff1ec] px-10 py-10 border-b border-orange-100">
            <div className="text-[#ff7f50] text-5xl font-black leading-none mb-4">❝</div>
            <p className="text-xl font-semibold text-gray-800 leading-relaxed">
              {ka
                ? 'დედებს ისედაც რთული ყოველდღიურობა გვაქვს, მინდოდა ერთი სირთულე — „დღეს რა ვაჭამო" — ამომეგდო დღის განრიგიდან და არც იმაზე მეფიქრა, რომელიმე ვიტამინი ხომ არ დავაკელი.'
                : "We moms already have a hard enough daily life. I just wanted to take one worry — \"what do I feed them today\" — off my schedule, and stop stressing about whether I\'m missing some vitamin."}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-11 h-11 rounded-full bg-[#ff7f50] flex items-center justify-center text-white font-black text-lg">
                ნ
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">{ka ? 'ნუცა' : 'Nutsa'}</p>
                <p className="text-xs text-gray-400">{ka ? 'moMeals-ის დამფუძნებელი' : 'Founder of moMeals'}</p>
              </div>
            </div>
          </div>

          {/* Story text */}
          <div className="px-10 py-10 space-y-6 text-gray-600 leading-relaxed">
            <p>
              {ka
                ? 'ვარ დედა და ვიცი, როგორია ის დღეები — როცა ყველაფერი ერთდროულად გჭირდება, ენერგია კი სულ ამოწურული გაქვს. სწორედ ამ დღეებში ყველაზე რთულია ჯანსაღი, გემრიელი და ასაკისთვის შესაფერისი საჭმლის მოფიქრება.'
                : "I'm a mom, and I know what those days feel like — when everything is needed at once and your energy is completely gone. It's on exactly those days that it's hardest to think of healthy, tasty, age-appropriate food."}
            </p>
            <p>
              {ka
                ? 'moMeals-ის შექმნის იდეა სწორედ ჩემი ყოველდღიურობიდან დაიბადა. მინდოდა რაღაც, რაც მე თავად გამომადგებოდა — სისტემა, რომელიც ბავშვის ასაკს, ალერგიებს და გემოვნებას ითვალისწინებს და მზა გეგმას გთავაზობს. ისე, რომ ყოველ საღამოს ნულიდან არ მომიხდეს ფიქრი.'
                : "The idea for moMeals was born from my own daily life. I wanted something that would actually work for me — a system that takes into account a child's age, allergies, and preferences and offers a ready-made plan. So I wouldn't have to think from scratch every evening."}
            </p>
            <p>
              {ka
                ? 'ეს საიტი ჩემი პასუხია იმ რთულ დღეებზე. და ვიმედოვნებ, შენი დღეებიც ცოტათი გამარტივდება.'
                : "This site is my answer to those hard days. And I hope it makes your days a little easier too."}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-t border-b border-gray-100 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-12">
            {ka ? 'რა გვამოძრავებს' : 'What drives us'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: '💛',
                titleKa: 'სიმარტივე',
                titleEn: 'Simplicity',
                descKa: 'დედის დრო ძვირფასია. ყველა ფუნქცია შექმნილია სიჩქარისა და სიმარტივისთვის.',
                descEn: "A mom's time is precious. Every feature is built for speed and ease.",
              },
              {
                icon: '🥦',
                titleKa: 'ჯანმრთელობა',
                titleEn: 'Health',
                descKa: 'ყველა კერძი შექმნილია ბავშვის ასაკობრივი საჭიროებების გათვალისწინებით.',
                descEn: "Every dish is designed with a child's age-appropriate nutritional needs in mind.",
              },
              {
                icon: '🤝',
                titleKa: 'ნდობა',
                titleEn: 'Trust',
                descKa: 'შენი და შენი ბავშვის მონაცემები უსაფრთხოდ ინახება და არასდროს იყიდება.',
                descEn: "Your data and your child's data is stored securely and never sold.",
              },
            ].map(({ icon, titleKa, titleEn, descKa, descEn }) => (
              <div key={titleKa} className="bg-[#fff8f6] rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-black text-gray-900 mb-2">{ka ? titleKa : titleEn}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{ka ? descKa : descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {ka ? 'სცადე უფასოდ' : 'Try it for free'}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          {ka
            ? 'რეგისტრაცია სამ წუთზე ნაკლებს მოითხოვს. კვების გეგმა — მზა.'
            : 'Registration takes less than three minutes. Your meal plan — ready.'}
        </p>
        <a
          href={`/register?lang=${locale}`}
          className="inline-block bg-[#ff7f50] hover:bg-[#e86e40] text-white font-bold px-10 py-4 rounded-full transition shadow-md"
        >
          {ka ? 'დაიწყე ახლა' : 'Get started'}
        </a>
      </section>

      <div className="border-t border-orange-100 bg-white py-6 text-center text-xs text-gray-400">
        © 2026 moMeals. {ka ? 'ყველა უფლება დაცულია.' : 'All rights reserved.'}
      </div>
    </main>
  );
}
