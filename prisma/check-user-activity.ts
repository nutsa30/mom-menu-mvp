import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Real usage check for one user by email — beyond subscription/billing status, shows
// whether they've actually added a child, logged into the dashboard (lastActiveAt, set
// by /api/heartbeat), and marked/logged any meals. Distinct from check-one-user.ts, which
// only covers subscription + payment history, not actual product usage.
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('გამოყენება: npx tsx prisma/check-user-activity.ts <email>');
    process.exit(1);
  }

  const user = await p.user.findUnique({
    where: { email },
    include: { children: true },
  });
  if (!user) {
    console.error('ვერ მოიძებნა:', email);
    process.exit(1);
  }

  console.log('სახელი:', user.name, `<${email}>`);
  console.log('რეგისტრირდა:', user.createdAt.toISOString());
  console.log(
    'ბოლოს შემოვიდა საიტზე (dashboard):',
    user.lastActiveAt ? user.lastActiveAt.toISOString() : 'არასდროს — dashboard არ გაუხსნია'
  );

  if (user.children.length === 0) {
    console.log('\nშვილი დამატებული არ აქვს — ანუ ჯერ არც პროფილი შეუქმნია.');
    await p.$disconnect();
    return;
  }

  for (const child of user.children) {
    console.log(`\n── შვილი: ${child.name} (${child.ageGroup}) — დამატებულია ${child.createdAt.toISOString()}`);

    const [mealPlans, dailyLogs, dailyLogsEaten, dishVotes, extraFoodLogs, foodIntros, babyMealLogs, babyIngredientStatuses] =
      await Promise.all([
        p.mealPlan.count({ where: { childId: child.id } }),
        p.dailyLog.count({ where: { childId: child.id } }),
        p.dailyLog.count({ where: { childId: child.id, wasEaten: true } }),
        p.dishVote.count({ where: { childId: child.id } }),
        p.extraFoodLog.count({ where: { childId: child.id } }),
        p.foodIntroduction.count({ where: { childId: child.id } }),
        p.babyMealLog.count({ where: { childId: child.id } }),
        p.babyIngredientStatus.count({ where: { childId: child.id, tried: true } }),
      ]);

    console.log('  კვების გეგმები (მენიუები):', mealPlans);
    console.log('  დღის ჩანაწერები (რამდენჯერ მონიშნა კერძი):', dailyLogs, `(მათგან "ჭამა" მონიშნული: ${dailyLogsEaten})`);
    console.log('  კერძზე შეფასება (მოეწონა/არ მოეწონა):', dishVotes);
    console.log('  დამატებული საკვები (რაც გეგმის გარეთ ჭამა):', extraFoodLogs);
    console.log('  პირველი საკვების დანერგვა (6-12თვე):', foodIntros);
    console.log('  ჩვილის კვების ჩანაწერები (6-12თვე):', babyMealLogs, `(მათგან ნაცადი ინგრედიენტი: ${babyIngredientStatuses})`);
  }

  const totalActivity = await Promise.all(
    user.children.map((c) =>
      Promise.all([
        p.dailyLog.count({ where: { childId: c.id } }),
        p.dishVote.count({ where: { childId: c.id } }),
        p.babyMealLog.count({ where: { childId: c.id } }),
        p.extraFoodLog.count({ where: { childId: c.id } }),
      ])
    )
  );
  const anyActivity = totalActivity.some(([a, b, c, d]) => a + b + c + d > 0);

  console.log('\n' + (anyActivity ? '✅ ჩანაწერები აქვს — რეალურად იყენებს საიტს.' : '⚠️ არცერთი ჩანაწერი არ არის — შვილი დამატებული აქვს, მაგრამ არაფერი აღუნიშნავს/გამოუყენებია.'));

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
