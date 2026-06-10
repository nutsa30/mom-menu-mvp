import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import HomepageAdminClient from './HomepageAdminClient';

const HOMEPAGE_DEFAULTS: Record<string, string | number> = {
  heroBadgeKa:      'შემდეგი თაობის კვება',
  heroBadgeEn:      'Nurturing the Next Generation',
  heroTitleKa:      'პერსონალური ყოველდღიური კვების გეგმა შენი ბავშვისთვის',
  heroTitleEn:      'Personalized daily meal plans for your child',
  heroTextKa:       'გემრიელი საუზმე, სადილი, ვახშამი და სნექი, მორგებული ბავშვის ასაკზე, კვებით საჭიროებებსა და გემოვნებაზე.',
  heroTextEn:       'Delicious breakfast, lunch, dinner, and snacks tailored to your child\'s age, dietary needs, and preferences.',
  heroCta1Ka:       'გეგმის დაწყება',
  heroCta1En:       'Start planning',
  heroCta2Ka:       'ფასები',
  heroCta2En:       'View pricing',
  heroImageUrl:     'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  featuresTitleKa:  'შექმნილია გადატვირთული, მზრუნველი მშობლებისთვის',
  featuresTitleEn:  'Designed for Busy, Mindful Parents',
  feature1Icon:     '❤️',
  feature1TitleKa:  'მეცნიერულად დაფუძნებული კვება',
  feature1TitleEn:  'Science-Backed Nutrition',
  feature1DescKa:   'თითოეული კერძი შერჩეულია იმისთვის, რომ ბავშვმა მიიღოს ყველა საჭირო ვიტამინი და საკვები ნივთიერება.',
  feature1DescEn:   'Every meal is curated to ensure your child gets essential vitamins and nutrients.',
  feature2Icon:     '⚡',
  feature2TitleKa:  'სტრესის გარეშე მომზადება',
  feature2TitleEn:  'Stress-Free Prep',
  feature2DescKa:   'მარტივი რეცეპტები და სავაჭრო სიები კვირაში საათებს დაგიზოგავს.',
  feature2DescEn:   'Simple recipes and smart shopping lists save you hours every week.',
  feature3Icon:     '🎯',
  feature3TitleKa:  'მორგებული კაპრიზულ მჭამელებზე',
  feature3TitleEn:  'Tailored for Picky Eaters',
  feature3DescKa:   'გეგმები ადაპტირდება ბავშვის გემოვნებაზე და ამასთან ახალ კერძებს აცნობს.',
  feature3DescEn:   'Plans adapt to your child\'s taste while introducing new foods.',
  sampleTitleKa:    'mom menu-ს გემო',
  sampleTitleEn:    'A Taste of mom menu',
  sampleSubtitleKa: 'გაეცანი ტიპიურ ყოველდღიურ კვების გეგმას.',
  sampleSubtitleEn: 'Explore a typical daily meal plan for your child.',
  pricingTitleKa:   'მარტივი, გამჭვირვალე ფასები',
  pricingTitleEn:   'Simple, Transparent Pricing',
  pricingSubtitleKa:'აირჩიე შენი ოჯახისთვის შესაფერი გეგმა. გაუქმება ნებისმიერ დროს.',
  pricingSubtitleEn:'Choose the plan that fits your family. Cancel anytime.',
  plan1NameKa:      'რეცეპტების წვდომა',
  plan1NameEn:      'Recipe Access',
  plan1Price:       15,
  plan1SalePrice:   null,
  plan1Feature1Ka:  '✔ ასობით რეცეპტი სრული ინსტრუქციებით',
  plan1Feature1En:  '✔ Hundreds of recipes with full instructions',
  plan1Feature2Ka:  '✔ ბლოგები, სტატიები და კვებითი რჩევები',
  plan1Feature2En:  '✔ Blog posts, articles & nutrition tips',
  plan1Feature3Ka:  '✔ საიტის ყველა კონტენტი შეუზღუდავად',
  plan1Feature3En:  '✔ Unlimited access to all site content',
  plan2NameKa:      'სრული პაკეტი',
  plan2NameEn:      'Full Package',
  plan2Price:       30,
  plan2SalePrice:   null,
  plan2Feature1Ka:  '✔ ყველაფერი, რაც 15₾ გეგმაშია',
  plan2Feature1En:  '✔ Everything included in the 15₾ plan',
  plan2Feature2Ka:  '✔ შვილის პირადი პროფილი — ასაკი, ალერგენები და გემოვნება',
  plan2Feature2En:  '✔ Child profile — age, allergies & food preferences',
  plan2Feature3Ka:  '✔ კვირის კვების გეგმა და ავტომატური საყიდლების სია',
  plan2Feature3En:  '✔ Weekly meal plan with an automatic shopping list',
};

export default async function HomepageAdminPage() {
  await requireAdmin();

  const raw = await prisma.homePageSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });

  const { updatedAt, id, ...rawFields } = raw;

  // Merge: DB values take priority; fall back to HOMEPAGE_DEFAULTS for any null/undefined field
  const settings = {
    ...HOMEPAGE_DEFAULTS,
    ...Object.fromEntries(
      Object.entries(rawFields).map(([k, v]) => [k, v ?? (HOMEPAGE_DEFAULTS as any)[k] ?? ''])
    ),
  };

  return <HomepageAdminClient settings={settings as any} />;
}
