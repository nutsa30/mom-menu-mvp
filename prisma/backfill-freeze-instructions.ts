// Idempotent backfill — sets isFreezable + freeze instructions (Ka/En) for the 12 dishes
// that are genuinely suited to shaping ahead and freezing raw (meatballs/cutlets/schnitzel),
// for the new "გაყინვა" dashboard tab. Recipe prep time and description are left untouched —
// this only adds the optional freeze-ahead guidance shown in the new tab.
// Safe to re-run: each entry is a plain update by id.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const FREEZE_2_3H =
  'დაალაგეთ საცხობ ქაღალდზე ისე, რომ ერთმანეთს არ ეხებოდნენ, და მოათავსეთ საყინულეში 2-3 საათით, სანამ გამაგრდებიან. გამაგრებულის შემდეგ გადაიტანეთ საყინულის პარკში ან კონტეინერში, ჰაერი მაქსიმალურად გამოაძევეთ და დაწერეთ თარიღი. ინახება საყინულეში 1 თვემდე.';
const FREEZE_2_3H_EN =
  'Arrange on a baking sheet so they don\'t touch, and freeze for 2-3 hours until firm. Once firm, transfer to a freezer bag or airtight container, press out as much air as possible, and label with the date. Keeps frozen for up to 1 month.';

const items: {
  id: string;
  titleKa: string;
  freezeInstructionsKa: string;
  freezeInstructionsEn: string;
}[] = [
  {
    id: 'cmsthuhay000jfou8391p0g7m',
    titleKa: 'ბოსტნეულის გუფთა',
    freezeInstructionsKa: `გუფთები ჩამოაყალიბეთ ისე, როგორც რეცეპტშია მითითებული, მაგრამ არ გამოაცხვოთ. ${FREEZE_2_3H} მომზადებისას პირდაპირ გაყინულიდან გამოაცხვეთ ღუმელში 180°C-ზე, ჩვეულებრივ დროს დაუმატეთ 5-7 წუთი.`,
    freezeInstructionsEn: `Shape the meatballs as in the recipe, but do not bake them yet. ${FREEZE_2_3H_EN} To cook, bake straight from frozen at 180°C, adding 5-7 minutes to the usual time.`,
  },
  {
    id: 'cmsthukdw000wfou8m6gflr7g',
    titleKa: 'ინდაურის კატლეტი',
    freezeInstructionsKa: `კატლეტები ჩამოაყალიბეთ, მაგრამ არ მოამზადოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე მოამზადეთ ორთქლზე ან ღუმელში, ჩვეულებრივ დროს დაუმატეთ 5-8 წუთი.`,
    freezeInstructionsEn: `Shape the cutlets, but do not cook them yet. ${FREEZE_2_3H_EN} To cook, steam or bake straight from frozen, adding 5-8 minutes to the usual time.`,
  },
  {
    id: 'cmsthulk20011fou8eppjcfem',
    titleKa: 'საქონლის ხორცის გუფთა',
    freezeInstructionsKa: `გუფთები ჩამოაყალიბეთ, მაგრამ არ მოხარშოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე ჩაუშვით ბულიონში ან მოხარშეთ ორთქლზე, ჩვეულებრივ დროს დაუმატეთ 8-10 წუთი.`,
    freezeInstructionsEn: `Shape the meatballs, but do not cook them yet. ${FREEZE_2_3H_EN} To cook, drop them straight from frozen into broth or steam them, adding 8-10 minutes to the usual time.`,
  },
  {
    id: 'cmsthtmhk000vfoocaqejq3qb',
    titleKa: 'საქონლის ხორცის გუფთა ბრინჯით',
    freezeInstructionsKa: `გუფთები ჩამოაყალიბეთ, მაგრამ არ მოამზადოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე ჩაუშვით ტომატის სოუსში ან მოხარშეთ ორთქლზე, ჩვეულებრივ დროს დაუმატეთ 8-10 წუთი.`,
    freezeInstructionsEn: `Shape the meatballs, but do not cook them yet. ${FREEZE_2_3H_EN} To cook, drop them straight from frozen into the tomato sauce or steam them, adding 8-10 minutes to the usual time.`,
  },
  {
    id: 'cmsthtk1n000lfoocn2jetrhs',
    titleKa: 'საქონლის ხორცის გუფთები ყაბაყითა და სტაფილოთი',
    freezeInstructionsKa: `გუფთები ჩამოაყალიბეთ, მაგრამ ორთქლზე არ მოხარშოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე მოხარშეთ ორთქლზე, ჩვეულებრივ დროს დაუმატეთ 8-10 წუთი.`,
    freezeInstructionsEn: `Shape the meatballs, but do not steam them yet. ${FREEZE_2_3H_EN} To cook, steam them straight from frozen, adding 8-10 minutes to the usual time.`,
  },
  {
    id: 'cmsthuika000ofou86x50ic7e',
    titleKa: 'ოსპის კატლეტები',
    freezeInstructionsKa: `კატლეტები ჩამოაყალიბეთ, მაგრამ არ შეწვათ. ${FREEZE_2_3H} მომზადებისას გაყინულივე შეწვით მსუბუქად ზეთიან ტაფაზე, დაბალ-საშუალო ცეცხლზე, ორივე მხრიდან — ჩვეულებრივ დროს დაუმატეთ 3-5 წუთი, რომ შიგნითაც კარგად მომზადდეს.`,
    freezeInstructionsEn: `Shape the cutlets, but do not fry them yet. ${FREEZE_2_3H_EN} To cook, fry them straight from frozen in a lightly oiled pan over low-medium heat on both sides, adding 3-5 minutes to the usual time so the inside cooks through.`,
  },
  {
    id: 'cmsthtjt6000kfooc2iwnrrfm',
    titleKa: 'ქათმის გუფთა (ბრინჯით)',
    freezeInstructionsKa: `გუფთები ჩამოაყალიბეთ, მაგრამ არ მოხარშოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე მოხარშეთ ორთქლზე ან წყალში, ჩვეულებრივ დროს დაუმატეთ 5-8 წუთი.`,
    freezeInstructionsEn: `Shape the meatballs, but do not cook them yet. ${FREEZE_2_3H_EN} To cook, steam or boil them straight from frozen, adding 5-8 minutes to the usual time.`,
  },
  {
    id: 'cmsthuhj6000kfou8fuudezys',
    titleKa: 'ქათმის გუფთა ბოსტნეულით',
    freezeInstructionsKa: `გუფთები ჩამოაყალიბეთ, მაგრამ არ მოამზადოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე მოხარშეთ ორთქლზე ან გამოაცხვეთ ღუმელში, ჩვეულებრივ დროს დაუმატეთ 5-8 წუთი.`,
    freezeInstructionsEn: `Shape the meatballs, but do not cook them yet. ${FREEZE_2_3H_EN} To cook, steam or bake them straight from frozen, adding 5-8 minutes to the usual time.`,
  },
  {
    id: 'cmsthtlwz000tfoocazotn59a',
    titleKa: 'ქათმის კოტლეტი',
    freezeInstructionsKa: `კოტლეტები ჩამოაყალიბეთ, მაგრამ არ მოამზადოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე მოხარშეთ ორთქლზე ან შეწვით მინიმალურ ზეთზე, ჩვეულებრივ დროს დაუმატეთ 5-8 წუთი.`,
    freezeInstructionsEn: `Shape the cutlets, but do not cook them yet. ${FREEZE_2_3H_EN} To cook, steam them straight from frozen or fry with a minimal amount of oil, adding 5-8 minutes to the usual time.`,
  },
  {
    id: 'cmsththca000afooc0bmq14tt',
    titleKa: 'ქათმის ხორცის ბურთულები',
    freezeInstructionsKa: `ბურთულები ჩამოაყალიბეთ, მაგრამ არ მოხარშოთ. ${FREEZE_2_3H} მომზადებისას გაყინულივე მოხარშეთ ორთქლზე ან წყალში, ჩვეულებრივ დროს დაუმატეთ 5-8 წუთი.`,
    freezeInstructionsEn: `Shape the balls, but do not cook them yet. ${FREEZE_2_3H_EN} To cook, steam or boil them straight from frozen, adding 5-8 minutes to the usual time.`,
  },
  {
    id: 'cmsthtm5q000ufoocgvob8dpd',
    titleKa: 'ქათმის შნიცელი',
    freezeInstructionsKa: `ქათმის ფილე გაბრტყელეთ და ჩააფროთ ათქვეფილ კვერცხში, როგორც რეცეპტშია, მაგრამ არ შეწვათ. თითოეული ცალკე დადეთ საცხობ ქაღალდზე და საყინულეში 2-3 საათით გაყინეთ გამაგრებამდე. შემდეგ პარკში ან კონტეინერში გადაიტანეთ ცალკე ფურცლებით გამოყოფილი, რომ ერთმანეთს არ მიეკრას, ჰაერი გამოაძევეთ და თარიღი მიუწერეთ. ინახება 1 თვემდე. მომზადებისას გაყინულივე შეწვით, დაბალ-საშუალო ცეცხლზე, ორივე მხრიდან — ჩვეულებრივ დროს დაუმატეთ 3-5 წუთი.`,
    freezeInstructionsEn: `Flatten the chicken fillet and dip it in beaten egg as in the recipe, but do not fry it yet. Place each one separately on a baking sheet and freeze for 2-3 hours until firm. Then transfer to a freezer bag or container, separating them with sheets of parchment so they don't stick together, press out the air, and label with the date. Keeps for up to 1 month. To cook, fry straight from frozen over low-medium heat on both sides, adding 3-5 minutes to the usual time.`,
  },
  {
    id: 'cmsthujxj000ufou8d8o4fnin',
    titleKa: 'ქათმის შნიცელი ბოსტნეულით',
    freezeInstructionsKa: `ქათმის ფილე გაბრტყელეთ, როგორც რეცეპტშია, მაგრამ არ მოამზადოთ (ბოსტნეული ცალკე, ახალი მოამზადეთ მირთმევის დღეს). თითოეული ცალკე დადეთ საცხობ ქაღალდზე და საყინულეში 2-3 საათით გაყინეთ გამაგრებამდე. შემდეგ პარკში გადაიტანეთ ცალკე ფურცლებით გამოყოფილი, ჰაერი გამოაძევეთ და თარიღი მიუწერეთ. ინახება 1 თვემდე. მომზადებისას გაყინულივე მოხარშეთ ორთქლზე ან შეწვით მინიმალურ ზეთზე, ჩვეულებრივ დროს დაუმატეთ 5-8 წუთი.`,
    freezeInstructionsEn: `Flatten the chicken fillet as in the recipe, but do not cook it yet (prepare the vegetables separately, fresh, on the day you serve it). Place each one separately on a baking sheet and freeze for 2-3 hours until firm. Then transfer to a freezer bag, separating them with sheets of parchment, press out the air, and label with the date. Keeps for up to 1 month. To cook, steam it straight from frozen or fry with a minimal amount of oil, adding 5-8 minutes to the usual time.`,
  },
];

async function main() {
  let updated = 0;
  for (const item of items) {
    const dish = await p.dish.findUnique({ where: { id: item.id }, select: { id: true, titleKa: true } });
    if (!dish) {
      console.warn(`⚠️  ვერ მოიძებნა: ${item.titleKa} (${item.id}) — გამოტოვებულია`);
      continue;
    }
    await p.dish.update({
      where: { id: item.id },
      data: {
        isFreezable: true,
        freezeInstructionsKa: item.freezeInstructionsKa,
        freezeInstructionsEn: item.freezeInstructionsEn,
      },
    });
    console.log(`✓ ${dish.titleKa}`);
    updated++;
  }
  console.log(`\nსულ განახლდა ${updated}/${items.length} კერძი.`);
  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
