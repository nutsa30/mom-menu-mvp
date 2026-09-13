import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Diagnostic for the 2026-09-13 trial retirement: the free trial is now retired for
// everyone except promo-code signups (3 days instead of the old, blanket 7). Most of the
// site's marketing/informational copy lives in the DB (edited through admin CMS pages —
// Email Center, Home Page Settings, How It Works), not in code, so a plain code search
// can't find it. This scans every likely spot — email templates, the homepage settings
// singleton, the How It Works page's settings/steps/FAQ — for anything that might still
// promise the old "7-day free trial" and prints the FULL text of each match so the exact
// wording can be reviewed and fixed, either here or directly in the relevant admin page.
const KEYWORDS = [
  /7[\s-]?დღ/i,        // "7 დღე" / "7-დღიანი" etc.
  /შვიდ\s?დღ/i,        // "შვიდი დღე" spelled out
  /ტრიალ/i,            // "ტრიალი" / "ტრიალის"
  /საცდელ/i,           // "საცდელი პერიოდი"
  /ტესტ[- ]?პერიოდ/i,  // "ტესტ-პერიოდი"
  /free trial/i,
  /7[\s-]?day/i,
  /first week/i,
  /პირველი კვირა/i,
];

function hits(text: string | null | undefined): boolean {
  if (!text) return false;
  return KEYWORDS.some((re) => re.test(text));
}

function report(section: string, id: string, fields: [string, string | null | undefined][]) {
  const matched = fields.filter(([, v]) => hits(v));
  if (matched.length === 0) return 0;
  console.log('══════════════════════════════════════');
  console.log(`${section}: ${id}`);
  for (const [field, value] of matched) {
    console.log(`\n[${field}]`);
    console.log(value);
  }
  console.log('');
  return 1;
}

async function main() {
  let found = 0;

  const templates = await p.emailTemplate.findMany({ orderBy: { key: 'asc' } });
  for (const t of templates) {
    found += report(`მეილის თემფლეიტი${t.enabled ? '' : ' (გამორთულია)'}`, t.key, [
      ['subjectKa', t.subjectKa], ['subjectEn', t.subjectEn],
      ['bodyKa', t.bodyKa], ['bodyEn', t.bodyEn],
    ]);
  }

  const home = await p.homePageSettings.findUnique({ where: { id: 'singleton' } });
  if (home) {
    found += report('მთავარი გვერდის პარამეტრები (HomePageSettings)', 'singleton', [
      ['heroBadgeKa', home.heroBadgeKa], ['heroBadgeEn', home.heroBadgeEn],
      ['heroTitleKa', home.heroTitleKa], ['heroTitleEn', home.heroTitleEn],
      ['heroTextKa', home.heroTextKa], ['heroTextEn', home.heroTextEn],
      ['heroCta1Ka', home.heroCta1Ka], ['heroCta1En', home.heroCta1En],
      ['heroCta2Ka', home.heroCta2Ka], ['heroCta2En', home.heroCta2En],
      ['featuresTitleKa', home.featuresTitleKa], ['featuresTitleEn', home.featuresTitleEn],
      ['feature1DescKa', home.feature1DescKa], ['feature1DescEn', home.feature1DescEn],
      ['feature2DescKa', home.feature2DescKa], ['feature2DescEn', home.feature2DescEn],
      ['feature3DescKa', home.feature3DescKa], ['feature3DescEn', home.feature3DescEn],
      ['pricingTitleKa', home.pricingTitleKa], ['pricingTitleEn', home.pricingTitleEn],
      ['pricingSubtitleKa', home.pricingSubtitleKa], ['pricingSubtitleEn', home.pricingSubtitleEn],
      ['plan1Feature1Ka', home.plan1Feature1Ka], ['plan1Feature2Ka', home.plan1Feature2Ka], ['plan1Feature3Ka', home.plan1Feature3Ka],
      ['plan2Feature1Ka', home.plan2Feature1Ka], ['plan2Feature2Ka', home.plan2Feature2Ka], ['plan2Feature3Ka', home.plan2Feature3Ka],
    ]);
  }

  const howItWorks = await p.howItWorksSettings.findUnique({ where: { id: 'singleton' } });
  if (howItWorks) {
    found += report('How It Works პარამეტრები (HowItWorksSettings)', 'singleton', [
      ['heroTitleKa', howItWorks.heroTitleKa], ['heroTitleEn', howItWorks.heroTitleEn],
      ['heroSubtitleKa', howItWorks.heroSubtitleKa], ['heroSubtitleEn', howItWorks.heroSubtitleEn],
      ['ctaTitleKa', howItWorks.ctaTitleKa], ['ctaTitleEn', howItWorks.ctaTitleEn],
      ['ctaSubtitleKa', howItWorks.ctaSubtitleKa], ['ctaSubtitleEn', howItWorks.ctaSubtitleEn],
    ]);
  }

  const steps = await p.howItWorksStep.findMany({ orderBy: { sortOrder: 'asc' } });
  for (const s of steps) {
    found += report('How It Works ნაბიჯი', s.id, [
      ['titleKa', s.titleKa], ['titleEn', s.titleEn], ['descKa', s.descKa], ['descEn', s.descEn],
    ]);
  }

  const faqs = await p.howItWorksFaq.findMany({ orderBy: { sortOrder: 'asc' } });
  for (const f of faqs) {
    found += report('ხშირად დასმული კითხვა (FAQ)', f.id, [
      ['questionKa', f.questionKa], ['questionEn', f.questionEn],
      ['answerKa', f.answerKa], ['answerEn', f.answerEn],
    ]);
  }

  if (found === 0) {
    console.log('არცერთ ადგილას ტრიალის/7-დღიანი უფასო პერიოდის ხსენება არ მოიძებნა.');
  } else {
    console.log(`\nსულ ${found} ადგილას მოიძებნა შესაძლო ხსენება — გადახედე ტექსტს ზემოთ.`);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
