import { PrismaClient, AgeGroup, MealType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const img = {
  oats: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=1200&auto=format&fit=crop',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop',
  pancakes: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=1200&auto=format&fit=crop',
  rice: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop'
};

async function main() {
  await prisma.mealPlanItem.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.child.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@mommenu.test', passwordHash: await bcrypt.hash('Admin123!', 10), role: 'ADMIN', subscriptionStatus: 'FULL_PLAN' }
  });

  const user = await prisma.user.create({
    data: {
      name: 'áƒœáƒ˜áƒœáƒ',
      email: 'nino@mommenu.test',
      passwordHash: await bcrypt.hash('User123!', 10),
      subscriptionStatus: 'FULL_PLAN',
      subscriptionStartedAt: new Date(),
      children: { create: { name: 'áƒšáƒ˜áƒšáƒ”', birthDate: new Date('2021-06-12'), ageGroup: 'FROM_24', allergies: ['nuts'], dislikes: ['onion'] } }
    }
  });

  const dishes = await Promise.all([
    prisma.dish.create({ data: {
      titleKa: 'áƒ¨áƒ•áƒ áƒ˜áƒ˜áƒ¡ áƒ¤áƒáƒ¤áƒ áƒ‘áƒáƒœáƒáƒœáƒ˜áƒ—', titleEn: 'Banana oat porridge',
      descriptionKa: 'áƒœáƒáƒ–áƒ˜, áƒ—áƒ‘áƒ˜áƒšáƒ˜ áƒ¡áƒáƒ£áƒ–áƒ›áƒ” áƒ™áƒáƒšáƒªáƒ˜áƒ£áƒ›áƒ˜áƒ— áƒ“áƒ áƒ‘áƒáƒ­áƒ™áƒáƒ—áƒ˜.', descriptionEn: 'A soft warm breakfast with fiber and calcium.',
      imageUrl: img.oats, ingredientsKa: ['áƒ¨áƒ•áƒ áƒ˜áƒ','áƒ‘áƒáƒœáƒáƒœáƒ˜','áƒ áƒ«áƒ”','áƒ“áƒáƒ áƒ˜áƒ©áƒ˜áƒœáƒ˜'], ingredientsEn: ['oats','banana','milk','cinnamon'],
      calories: 260, proteinGrams: 8, ageGroups: ['FROM_9','FROM_12','FROM_24'], allergens: ['dairy']
    }}),
    prisma.dish.create({ data: {
      titleKa: 'áƒ˜áƒœáƒ“áƒáƒ£áƒ áƒ˜áƒ¡ áƒ‘áƒáƒ¡áƒ¢áƒœáƒ”áƒ£áƒšáƒ˜áƒ¡ áƒ¡áƒ£áƒžáƒ˜', titleEn: 'Turkey vegetable soup',
      descriptionKa: 'áƒ›áƒ¡áƒ£áƒ‘áƒ£áƒ¥áƒ˜ áƒ¡áƒáƒ“áƒ˜áƒšáƒ˜ áƒªáƒ˜áƒšáƒ˜áƒ— áƒ“áƒ áƒ¡áƒ”áƒ–áƒáƒœáƒ£áƒ áƒ˜ áƒ‘áƒáƒ¡áƒ¢áƒœáƒ”áƒ£áƒšáƒ˜áƒ—.', descriptionEn: 'Light lunch with protein and seasonal vegetables.',
      imageUrl: img.soup, ingredientsKa: ['áƒ˜áƒœáƒ“áƒáƒ£áƒ áƒ˜','áƒ¡áƒ¢áƒáƒ¤áƒ˜áƒšáƒ','áƒ™áƒáƒ áƒ¢áƒáƒ¤áƒ˜áƒšáƒ˜','áƒ‘áƒ áƒáƒ™áƒáƒšáƒ˜'], ingredientsEn: ['turkey','carrot','potato','broccoli'],
      calories: 330, proteinGrams: 22, ageGroups: ['FROM_9','FROM_12','FROM_24'], allergens: []
    }}),
    prisma.dish.create({ data: {
      titleKa: 'áƒ˜áƒáƒ’áƒ£áƒ áƒ¢áƒ˜ áƒ•áƒáƒ¨áƒšáƒ˜áƒ—', titleEn: 'Apple yogurt cup',
      descriptionKa: 'áƒ¡áƒ¬áƒ áƒáƒ¤áƒ˜ áƒ¡áƒœáƒ”áƒ¥áƒ˜ áƒ®áƒ˜áƒšáƒ˜áƒ— áƒ“áƒ áƒªáƒ˜áƒšáƒ˜áƒ—.', descriptionEn: 'Quick snack with fruit and protein.',
      imageUrl: img.yogurt, ingredientsKa: ['áƒ˜áƒáƒ’áƒ£áƒ áƒ¢áƒ˜','áƒ•áƒáƒ¨áƒšáƒ˜','áƒ©áƒ˜áƒ'], ingredientsEn: ['yogurt','apple','chia'],
      calories: 190, proteinGrams: 9, ageGroups: ['FROM_9','FROM_12','FROM_24'], allergens: ['dairy']
    }}),
    prisma.dish.create({ data: {
      titleKa: 'áƒžáƒáƒ¡áƒ¢áƒ áƒáƒ•áƒáƒ™áƒáƒ“áƒáƒ¡ áƒ¡áƒáƒ£áƒ¡áƒ˜áƒ—', titleEn: 'Pasta with avocado sauce',
      descriptionKa: 'áƒ áƒ‘áƒ˜áƒšáƒ˜ áƒ•áƒáƒ®áƒ¨áƒáƒ›áƒ˜ áƒ¯áƒáƒœáƒ¡áƒáƒ¦áƒ˜ áƒªáƒ®áƒ˜áƒ›áƒ”áƒ‘áƒ˜áƒ—.', descriptionEn: 'Comforting dinner with healthy fats.',
      imageUrl: img.pasta, ingredientsKa: ['áƒžáƒáƒ¡áƒ¢áƒ','áƒáƒ•áƒáƒ™áƒáƒ“áƒ','áƒ˜áƒáƒ’áƒ£áƒ áƒ¢áƒ˜','áƒšáƒ˜áƒ›áƒáƒœáƒ˜'], ingredientsEn: ['pasta','avocado','yogurt','lemon'],
      calories: 410, proteinGrams: 12, ageGroups: ['FROM_24'], allergens: ['gluten','dairy']
    }}),
    prisma.dish.create({ data: {
      titleKa: 'áƒ®áƒáƒ­áƒáƒ¡ áƒ¤áƒáƒœáƒ¥áƒ”áƒ˜áƒ¥áƒ”áƒ‘áƒ˜', titleEn: 'Cottage cheese pancakes',
      descriptionKa: 'áƒ¢áƒ™áƒ‘áƒ˜áƒšáƒ˜, áƒ›áƒáƒ’áƒ áƒáƒ› áƒ“áƒáƒ‘áƒáƒšáƒáƒœáƒ¡áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ¡áƒáƒ£áƒ–áƒ›áƒ”.', descriptionEn: 'Sweet but balanced breakfast.',
      imageUrl: img.pancakes, ingredientsKa: ['áƒ®áƒáƒ­áƒ','áƒ™áƒ•áƒ”áƒ áƒªáƒ®áƒ˜','áƒ¤áƒ¥áƒ•áƒ˜áƒšáƒ˜','áƒ™áƒ”áƒœáƒ™áƒ áƒ'], ingredientsEn: ['cottage cheese','egg','flour','berries'],
      calories: 310, proteinGrams: 17, ageGroups: ['FROM_24'], allergens: ['dairy','egg','gluten']
    }}),
    prisma.dish.create({ data: {
      titleKa: 'áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜ áƒ¥áƒáƒ—áƒ›áƒ˜áƒ— áƒ“áƒ áƒ‘áƒáƒ¡áƒ¢áƒœáƒ”áƒ£áƒšáƒ˜áƒ—', titleEn: 'Chicken veggie rice',
      descriptionKa: 'áƒ”áƒœáƒ”áƒ áƒ’áƒ˜áƒ£áƒšáƒ˜ áƒ¡áƒáƒ“áƒ˜áƒšáƒ˜ áƒ“áƒ¦áƒ˜áƒ¡ áƒ¨áƒ£áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡.', descriptionEn: 'Energy-rich lunch for the middle of the day.',
      imageUrl: img.rice, ingredientsKa: ['áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜','áƒ¥áƒáƒ—áƒáƒ›áƒ˜','áƒ‘áƒáƒ áƒ“áƒ','áƒ¡áƒ¢áƒáƒ¤áƒ˜áƒšáƒ'], ingredientsEn: ['rice','chicken','peas','carrot'],
      calories: 390, proteinGrams: 24, ageGroups: ['FROM_24'], allergens: []
    }})
  ]);

  const preschoolPlans = await Promise.all([0,1,2].map(dayOffset => prisma.mealPlan.create({
    data: {
      titleKa: dayOffset === 0 ? 'áƒšáƒ˜áƒšáƒ”áƒ¡ áƒ“áƒ¦áƒ”áƒ•áƒáƒœáƒ“áƒ”áƒšáƒ˜ áƒ áƒáƒªáƒ˜áƒáƒœáƒ˜' : `áƒšáƒ˜áƒšáƒ”áƒ¡ áƒ›áƒ”áƒœáƒ˜áƒ£ +${dayOffset}`,
      titleEn: dayOffset === 0 ? "Lile's menu today" : `Lile's menu +${dayOffset}`,
      ageGroup: 'FROM_24',
      dayOffset
    }
  })));

  const planItems = [
    [preschoolPlans[0].id, dishes[0].id, 'BREAKFAST', 1],
    [preschoolPlans[0].id, dishes[2].id, 'SNACK', 2],
    [preschoolPlans[0].id, dishes[1].id, 'LUNCH', 3],
    [preschoolPlans[0].id, dishes[3].id, 'DINNER', 4],
    [preschoolPlans[1].id, dishes[4].id, 'BREAKFAST', 1],
    [preschoolPlans[1].id, dishes[2].id, 'SNACK', 2],
    [preschoolPlans[1].id, dishes[5].id, 'LUNCH', 3],
    [preschoolPlans[1].id, dishes[1].id, 'DINNER', 4],
    [preschoolPlans[2].id, dishes[0].id, 'BREAKFAST', 1],
    [preschoolPlans[2].id, dishes[2].id, 'SNACK', 2],
    [preschoolPlans[2].id, dishes[5].id, 'LUNCH', 3],
    [preschoolPlans[2].id, dishes[3].id, 'DINNER', 4]
  ] as const;

  for (const [mealPlanId, dishId, mealType, sortOrder] of planItems) {
    await prisma.mealPlanItem.create({ data: { mealPlanId, dishId, mealType: mealType as MealType, sortOrder } });
  }

  for (const ageGroup of ['FROM_6','FROM_9','FROM_12'] as AgeGroup[]) {
    for (const dayOffset of [0,1,2]) {
      const p = await prisma.mealPlan.create({ data: { titleKa: `${ageGroup} áƒ¡áƒáƒ¢áƒ”áƒ¡áƒ¢áƒ áƒ›áƒ”áƒœáƒ˜áƒ£ +${dayOffset}`, titleEn: `${ageGroup} test menu +${dayOffset}`, ageGroup, dayOffset } });
      await prisma.mealPlanItem.create({ data: { mealPlanId: p.id, dishId: dishes[0].id, mealType: 'BREAKFAST', sortOrder: 1 } });
      await prisma.mealPlanItem.create({ data: { mealPlanId: p.id, dishId: dishes[1].id, mealType: 'LUNCH', sortOrder: 2 } });
    }
  }

  await prisma.emailTemplate.createMany({ data: [
    {
      key: 'welcome',
      subjectKa: 'áƒ™áƒ”áƒ—áƒ˜áƒšáƒ˜ áƒ˜áƒ§áƒáƒ¡ áƒ—áƒ¥áƒ•áƒ”áƒœáƒ˜ áƒ›áƒáƒ¡áƒ•áƒšáƒ áƒ“áƒ”áƒ“áƒ˜áƒ¡ áƒ›áƒ”áƒœáƒ˜áƒ£áƒ¨áƒ˜',
      subjectEn: 'Welcome to Mom Menu',
      bodyKa: 'áƒ’áƒáƒ›áƒáƒ áƒ¯áƒáƒ‘áƒ {{name}}, áƒ—áƒ¥áƒ•áƒ”áƒœáƒ˜ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ áƒ›áƒ”áƒœáƒ˜áƒ£ áƒ›áƒ–áƒáƒ“ áƒáƒ áƒ˜áƒ¡.',
      bodyEn: 'Hi {{name}}, your child menu is ready.'
    },
    {
      key: 'subscription_activated',
      subjectKa: 'áƒ¡áƒáƒ‘áƒ¡áƒ¥áƒ áƒ˜áƒ‘áƒ¨áƒ”áƒœáƒ˜ áƒ’áƒáƒáƒ¥áƒ¢áƒ˜áƒ£áƒ áƒ“áƒ',
      subjectEn: 'Subscription activated',
      bodyKa: 'áƒ—áƒ¥áƒ•áƒ”áƒœáƒ˜ áƒ’áƒáƒ›áƒáƒ¬áƒ”áƒ áƒ áƒáƒ¥áƒ¢áƒ˜áƒ£áƒ áƒ˜áƒ. áƒ“áƒ¦áƒ”áƒ•áƒáƒœáƒ“áƒ”áƒšáƒ˜ áƒ áƒáƒªáƒ˜áƒáƒœáƒ˜ áƒ£áƒ™áƒ•áƒ” áƒ“áƒ”áƒ¨áƒ‘áƒáƒ áƒ“áƒ¨áƒ˜áƒ.',
      bodyEn: 'Your subscription is active. Todayâ€™s plan is in your dashboard.'
    },
    {
      key: 'daily_menu',
      subjectKa: 'áƒ“áƒ¦áƒ”áƒ•áƒáƒœáƒ“áƒ”áƒšáƒ˜ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ áƒ áƒáƒªáƒ˜áƒáƒœáƒ˜',
      subjectEn: "Today's child meal plan",
      bodyKa: 'áƒ“áƒ¦áƒ”áƒ•áƒáƒœáƒ“áƒ”áƒšáƒ˜ áƒ“áƒ áƒ›áƒáƒ›áƒ“áƒ”áƒ•áƒœáƒ 2 áƒ“áƒ¦áƒ˜áƒ¡ áƒ›áƒ”áƒœáƒ˜áƒ£ áƒ›áƒ–áƒáƒ“ áƒáƒ áƒ˜áƒ¡.',
      bodyEn: 'Today and the next 2 days of menus are ready.'
    }
  ]});

  console.log('Seed completed');
  console.log('Admin:', admin.email, 'Admin123!');
  console.log('User:', user.email, 'User123!');
}

main().finally(async () => prisma.$disconnect());

