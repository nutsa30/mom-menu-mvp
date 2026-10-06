import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Reviewed corrections to existing English fields only. Never touches Georgian copy.
const descriptions: Record<string, string> = {
  cmsthtfpi0003fooc102cfp31: 'Rinse the red lentils well. Chop the carrot and zucchini into small pieces. Place all ingredients in a saucepan, add water and cook for about 15–20 minutes, until the lentils and vegetables are completely soft. Blend into a smooth soup or puree. If needed, add a little cooking water to reach the desired consistency.',
  cmsthsxkl0005foss2qls4mj2: 'Remove the peach skin and stone. If the peach is not very soft, steam it briefly to soften it. Cook the oats in water for about 5–7 minutes, until soft. Combine the peach and oats, then blend to the desired consistency.',
  cmtuiymgy0000jm047iy3d1lq: 'Mash the banana thoroughly with a fork into a smooth puree.\nAdd the egg and milk and mix well.\nAdd the rolled oats, unsweetened cocoa, cinnamon and baking powder.\nMix and leave for about 5 minutes so the oats can absorb some of the liquid.\nDivide the mixture between small silicone moulds.\nBake in a preheated oven at 180°C for about 18–20 minutes, until the muffins are cooked through in the centre.\nAllow to cool, then offer soft, small pieces appropriate for your child’s age.',
};
const push: Record<string, [string, string]> = {
  breakfast: ['☀️ Breakfast time!', 'Good morning! See what is on your child’s breakfast menu today.'],
  lunch: ['🍽️ Lunch time!', 'See what delicious lunch is planned for your child today.'],
  snack: ['🍎 Snack time!', 'A little snack can help keep your child going through the day.'],
  dinner: ['🌙 Dinner time!', 'Finish your child’s day with a delicious dinner.'],
  weekly: ['📅 Your weekly meal plan', 'A new week is coming. Plan your child’s meals with MomMenu.'],
};
async function main() {
  if (process.env.MOMMENU_SANDBOX !== '1') throw new Error('Run reviewed content updates on the isolated preview database first.');
  for (const [id, descriptionEn] of Object.entries(descriptions)) await prisma.dish.updateMany({ where: { id }, data: { descriptionEn } });
  for (const [mealType, [titleEn, bodyEn]] of Object.entries(push)) await prisma.pushTemplate.updateMany({ where: { mealType, titleEn: null }, data: { titleEn, bodyEn } });
  await prisma.testimonial.upsert({ where: { id: 'cmtai27o9001qjv049xjh1ovd' }, update: { contentEn: 'A very interesting and helpful page. Wishing you success! ❤️❤️' }, create: { id: 'cmtai27o9001qjv049xjh1ovd', authorName: 'eliso gulordava', content: 'ძალიან საინტერესო და სასარგებლო გვერდია,წარმატებები,❤️❤️', contentEn: 'A very interesting and helpful page. Wishing you success! ❤️❤️', approved: true } });
}
main().finally(() => prisma.$disconnect());
