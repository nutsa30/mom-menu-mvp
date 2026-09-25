import { PrismaClient, AgeGroup, MealType } from '@prisma/client';

const p = new PrismaClient();

// One-time script adding 10 new dishes (recipes) to the catalog — content and ingredient
// amounts supplied by the site owner; grammar polished, all dashes normalized to "-" per her
// instruction. Nutrient amounts (vitamins/minerals) were calculated per-ingredient from
// standard nutrition-composition reference data (USDA FoodData Central figures, the same
// public reference most nutrition-facts databases draw from), scaled to the exact gram/ml
// amount used in each recipe, using cooked/cooked-and-drained values where the ingredient is
// cooked, and summed to ONE full child portion (not per 100g). These are reasonable
// approximations, not lab-measured values — see the report printed after this script runs.
//
// Only fills nutrient fields that already exist on the Dish model (matches the admin "ახალი
// კერძი" form's own nutrient list). Three of the fully-requested checklist items — Vitamin
// B3 (niacin), Selenium, and Iodine — have NO field on Dish at all and are skipped entirely,
// not approximated with an unrelated field.
//
// Safe to re-run: skips any dish whose titleKa already exists.
//
// Run: npx tsx prisma/add-10-new-dishes.ts

type NewDish = {
  titleKa: string;
  titleEn: string;
  stepsKa: string[];
  stepsEn: string[];
  ingredientsKa: string[];
  ingredientsEn: string[];
  mealType: MealType;
  ageGroups: AgeGroup[];
  prepTimeMinutes: number;
  allergens: string[];
  nutrients: Record<string, number>;
};

const DISHES: NewDish[] = [
  {
    titleKa: 'ვაშლის, რიკოტასა და შვრიის ღუმელის ბლინი',
    titleEn: 'Apple, Ricotta and Oat Baked Pancake',
    mealType: 'BREAKFAST',
    ageGroups: ['FROM_12'],
    prepTimeMinutes: 30,
    allergens: ['dairy', 'egg'],
    ingredientsKa: [
      'შვრიის ფანტელი - 25 გ',
      'რიკოტა - 40 გ',
      'ვაშლი - 50 გ',
      'კვერცხი - 1 ცალი',
      'სრულცხიმიანი რძე - 30 მლ',
      'დარიჩინი - მცირე რაოდენობა',
      'უმარილო კარაქი - 3 გ',
    ],
    ingredientsEn: [
      'Rolled oats - 25 g',
      'Ricotta - 40 g',
      'Apple - 50 g',
      'Egg - 1',
      'Whole milk - 30 ml',
      'Cinnamon - a small amount',
      'Unsalted butter - 3 g',
    ],
    stepsKa: [
      'გააცხელე ღუმელი 180°C-მდე.',
      'ვაშლი გათალე, ამოაცალე გული და წვრილად გახეხე.',
      'შვრიის ფანტელი დააბლენდერე უფრო წვრილ ტექსტურამდე.',
      'ჯამში კარგად აურიე კვერცხი, რძე და რიკოტა.',
      'დაუმატე შვრია, გახეხილი ვაშლი და მცირე რაოდენობით დარიჩინი.',
      'პატარა საცხობ ფორმას თხლად წაუსვი უმარილო კარაქი და გადაიტანე მასა.',
      'გამოაცხვე დაახლოებით 18-20 წუთი, სანამ მთლიანად მომზადდება.',
      'ბავშვისთვის მიცემამდე გააგრილე და დაჭერი რბილ, ასაკისთვის უსაფრთხო ნაჭრებად.',
    ],
    stepsEn: [
      'Preheat the oven to 180°C.',
      'Peel and core the apple, then finely grate it.',
      'Blend the rolled oats to a finer texture.',
      'Mix the egg, milk and ricotta well.',
      'Add the oats, grated apple and a small amount of cinnamon.',
      'Lightly grease a small baking dish with unsalted butter and add the mixture.',
      'Bake for about 18-20 minutes, until fully cooked.',
      'Allow to cool and cut into soft, age-appropriate pieces.',
    ],
    nutrients: {
      vitaminAmcg: 169, vitaminB1mg: 0.21, vitaminB2mg: 0.4, vitaminB6mg: 0.09,
      folateMcg: 46, vitaminB12mcg: 0.73, calciumMg: 158, ironMg: 2.2, zincMg: 2.1,
    },
  },
  {
    titleKa: 'კვერცხისა და ბროკოლის ქესადილია',
    titleEn: 'Egg and Broccoli Quesadilla',
    mealType: 'BREAKFAST',
    ageGroups: ['FROM_12'],
    prepTimeMinutes: 20,
    allergens: ['gluten', 'egg', 'dairy'],
    ingredientsKa: [
      'პატარა მთლიანი მარცვლეულის ტორტილა - 30 გ',
      'კვერცხი - 1 ცალი',
      'ბროკოლი - 30 გ',
      'მოცარელა - 20 გ',
      'ზეითუნის ზეთი - 3 მლ',
    ],
    ingredientsEn: [
      'Whole-grain tortilla - 30 g',
      'Egg - 1',
      'Broccoli - 30 g',
      'Mozzarella - 20 g',
      'Olive oil - 3 ml',
    ],
    stepsKa: [
      'ბროკოლი ორთქლზე ან წყალში მოხარშე დაახლოებით 6-8 წუთი, სანამ კარგად დარბილდება.',
      'გადაწურე და ძალიან წვრილად დაჭერი.',
      'კვერცხი ათქვიფე და დაბალ ცეცხლზე სრულად მოამზადე მცირე რაოდენობით ზეითუნის ზეთში.',
      'ტორტილას ნახევარზე გადაანაწილე კვერცხი, ბროკოლი და გახეხილი მოცარელა.',
      'გადაკეცე და დაბალ ცეცხლზე თითოეული მხარე დაახლოებით 1-2 წუთი გაათბე.',
      'გააგრილე და ბავშვისთვის მოსახერხებელ რბილ ზოლებად დაჭერი.',
    ],
    stepsEn: [
      'Steam or boil the broccoli for about 6-8 minutes until very tender.',
      'Drain and finely chop it.',
      'Beat the egg and cook thoroughly over low heat with a small amount of olive oil.',
      'Place the egg, broccoli and grated mozzarella over one half of the tortilla.',
      'Fold and cook over low heat for about 1-2 minutes per side.',
      'Allow to cool and cut into soft, child-friendly strips.',
    ],
    nutrients: {
      vitaminAmcg: 134, vitaminCmg: 19.5, vitaminKmcg: 44, vitaminB2mg: 0.29,
      folateMcg: 62, vitaminB12mcg: 0.69, calciumMg: 168, ironMg: 1.9, zincMg: 1.7,
    },
  },
  {
    titleKa: 'სტაფილოსა და ბანანის რბილი პანქეიქები',
    titleEn: 'Soft Carrot and Banana Pancakes',
    mealType: 'BREAKFAST',
    ageGroups: ['FROM_24'],
    prepTimeMinutes: 20,
    allergens: ['egg', 'dairy'],
    ingredientsKa: [
      'ბანანი - 60 გ',
      'სტაფილო - 40 გ',
      'კვერცხი - 1 ცალი',
      'შვრიის ფქვილი - 30 გ',
      'სრულცხიმიანი რძე - 30 მლ',
      'დარიჩინი - მცირე რაოდენობა',
      'ზეითუნის ზეთი - 3 მლ',
    ],
    ingredientsEn: [
      'Banana - 60 g',
      'Carrot - 40 g',
      'Egg - 1',
      'Oat flour - 30 g',
      'Whole milk - 30 ml',
      'Cinnamon - a small amount',
      'Olive oil - 3 ml',
    ],
    stepsKa: [
      'სტაფილო გათალე და ძალიან წვრილად გახეხე.',
      'ბანანი ჩანგლით დაჭყლიტე.',
      'დაუმატე კვერცხი და რძე.',
      'შეურიე სტაფილო, შვრიის ფქვილი და დარიჩინი.',
      'ტაფაზე გააცხელე მცირე რაოდენობით ზეითუნის ზეთი.',
      'პატარა პანქეიქები დაბალ ცეცხლზე ორივე მხრიდან სრულად მოამზადე.',
      'ოდნავ გააგრილე და მიირთვი რბილ ნაჭრებად.',
    ],
    stepsEn: [
      'Peel and finely grate the carrot.',
      'Mash the banana.',
      'Add the egg and milk.',
      'Mix in the carrot, oat flour and cinnamon.',
      'Heat a small amount of olive oil in a pan.',
      'Cook small pancakes over low heat on both sides until completely cooked through.',
      'Allow to cool slightly and serve in soft pieces.',
    ],
    nutrients: {
      vitaminAmcg: 428, vitaminB1mg: 0.29, vitaminB2mg: 0.39, vitaminB6mg: 0.37,
      folateMcg: 62, vitaminB12mcg: 0.59, calciumMg: 91, ironMg: 2.4, zincMg: 2.0,
    },
  },
  {
    titleKa: 'საქონლის ხორცისა და წითელი ოსპის პატარა ბოლონეზე',
    titleEn: 'Beef and Red Lentil Bolognese',
    mealType: 'LUNCH',
    ageGroups: ['FROM_12'],
    prepTimeMinutes: 35,
    allergens: ['gluten'],
    ingredientsKa: [
      'საქონლის უცხიმო ფარში - 40 გ',
      'მშრალი წითელი ოსპი - 20 გ',
      'პატარა ზომის მშრალი მაკარონი - 35 გ',
      'დაქუცმაცებული პომიდორი მარილისა და შაქრის გარეშე - 60 გ',
      'სტაფილო - 30 გ',
      'ყაბაყი - 20 გ',
      'ზეითუნის ზეთი - 5 მლ',
      'წყალი - საჭიროებისამებრ',
    ],
    ingredientsEn: [
      'Lean ground beef - 40 g',
      'Dry red lentils - 20 g',
      'Small dry pasta - 35 g',
      'Crushed tomatoes with no added salt or sugar - 60 g',
      'Carrot - 30 g',
      'Zucchini - 20 g',
      'Olive oil - 5 ml',
      'Water - as needed',
    ],
    stepsKa: [
      'ოსპი კარგად გარეცხე და მოხარშე დაახლოებით 12-15 წუთი.',
      'სტაფილო და ყაბაყი წვრილად გახეხე.',
      'საქონლის ფარში სრულად მოამზადე ზეითუნის ზეთში.',
      'დაუმატე სტაფილო და ყაბაყი.',
      'დაუმატე პომიდორი, მოხარშული ოსპი და საჭიროების შემთხვევაში წყალი.',
      'ხარშე კიდევ დაახლოებით 10 წუთი.',
      'პარალელურად მაკარონი უმარილო წყალში რბილ ტექსტურამდე მოხარშე.',
      'მაკარონი შეურიე სოუსს და მიირთვი ბავშვის ასაკისთვის შესაფერისი ტექსტურით.',
    ],
    stepsEn: [
      'Rinse and boil the lentils for about 12-15 minutes.',
      'Finely grate the carrot and zucchini.',
      'Cook the ground beef thoroughly in the olive oil.',
      'Add the carrot and zucchini.',
      'Add the tomatoes, cooked lentils and water if needed.',
      'Simmer for about 10 more minutes.',
      'Meanwhile, cook the pasta in unsalted water until soft.',
      'Combine with the sauce and serve in an age-appropriate texture.',
    ],
    nutrients: {
      vitaminAmcg: 278, vitaminCmg: 11, vitaminB1mg: 0.17, vitaminB6mg: 0.33,
      folateMcg: 78, vitaminB12mcg: 1.0, ironMg: 3.1, zincMg: 3.2,
    },
  },
  {
    titleKa: 'ორაგულისა და ისპანახის კრემოვანი პასტა',
    titleEn: 'Creamy Salmon and Spinach Pasta',
    mealType: 'LUNCH',
    ageGroups: ['FROM_12'],
    prepTimeMinutes: 30,
    allergens: ['fish', 'gluten', 'dairy'],
    ingredientsKa: [
      'ორაგულის ფილე - 45 გ',
      'პატარა ზომის მშრალი მაკარონი - 35 გ',
      'ისპანახი - 30 გ',
      'ბარდა - 20 გ',
      'სრულცხიმიანი უშაქრო იოგურტი - 40 გ',
      'ზეითუნის ზეთი - 5 მლ',
    ],
    ingredientsEn: [
      'Salmon fillet - 45 g',
      'Small dry pasta - 35 g',
      'Spinach - 30 g',
      'Peas - 20 g',
      'Full-fat plain yogurt - 40 g',
      'Olive oil - 5 ml',
    ],
    stepsKa: [
      'ორაგული ორთქლზე ან ღუმელში სრულად მოამზადე.',
      'ძალიან ყურადღებით შეამოწმე და ყველა ფხა სრულად მოაცილე.',
      'მაკარონი უმარილო წყალში რბილ ტექსტურამდე მოხარშე.',
      'ბარდა მოხარშე დაახლოებით 5-7 წუთი.',
      'ისპანახი რამდენიმე წუთით მოამზადე და წვრილად დაჭერი.',
      'ორაგული დაფშვენი და შეურიე მაკარონს, ბარდასა და ისპანახს.',
      'ცეცხლიდან გადმოდგმის შემდეგ ოდნავ გააგრილე და შეურიე იოგურტი და ზეითუნის ზეთი.',
    ],
    stepsEn: [
      'Steam or bake the salmon until fully cooked.',
      'Carefully check it and completely remove all bones.',
      'Cook the pasta in unsalted water until soft.',
      'Boil the peas for about 5-7 minutes.',
      'Cook the spinach for a few minutes and finely chop it.',
      'Flake the salmon and combine with the pasta, peas and spinach.',
      'Remove from the heat, allow to cool slightly and mix in the yogurt and olive oil.',
    ],
    nutrients: {
      vitaminAmcg: 189, vitaminB6mg: 0.3, folateMcg: 71, vitaminB12mcg: 1.64,
      vitaminCmg: 5.8, vitaminDmcg: 4.5, vitaminKmcg: 157, calciumMg: 95,
      ironMg: 1.9, omega3Mg: 900,
    },
  },
  {
    titleKa: 'ქათმისა და წიწიბურას ბოსტნეულის ბოული',
    titleEn: 'Chicken and Buckwheat Vegetable Bowl',
    mealType: 'LUNCH',
    ageGroups: ['FROM_24'],
    prepTimeMinutes: 35,
    allergens: [],
    ingredientsKa: [
      'ქათმის უძვლო ხორცი - 50 გ',
      'მშრალი წიწიბურა - 30 გ',
      'ბროკოლი - 30 გ',
      'წითელი ბულგარული წიწაკა - 30 გ',
      'სტაფილო - 30 გ',
      'ზეითუნის ზეთი - 5 მლ',
    ],
    ingredientsEn: [
      'Boneless chicken - 50 g',
      'Dry buckwheat - 30 g',
      'Broccoli - 30 g',
      'Red bell pepper - 30 g',
      'Carrot - 30 g',
      'Olive oil - 5 ml',
    ],
    stepsKa: [
      'წიწიბურა გარეცხე და მოხარშე დაახლოებით 15-20 წუთი.',
      'ქათამი პატარა ნაჭრებად დაჭერი და სრულად მოამზადე.',
      'ბოსტნეული დაჭერი პატარა ნაჭრებად.',
      'ორთქლზე ან წყალში მოამზადე დაახლოებით 8-10 წუთი, სანამ დარბილდება.',
      'შეურიე წიწიბურა, ქათამი და ბოსტნეული.',
      'ბოლოს დაუმატე ზეითუნის ზეთი.',
    ],
    stepsEn: [
      'Rinse and cook the buckwheat for about 15-20 minutes.',
      'Cut the chicken into small pieces and cook thoroughly.',
      'Cut the vegetables into small pieces.',
      'Steam or boil for about 8-10 minutes until tender.',
      'Combine the buckwheat, chicken and vegetables.',
      'Add the olive oil at the end.',
    ],
    nutrients: {
      vitaminAmcg: 320, vitaminCmg: 50, vitaminKmcg: 51, vitaminB6mg: 0.39,
      folateMcg: 60, ironMg: 1.25, zincMg: 1.27, magnesiumMg: 85,
    },
  },
  {
    titleKa: 'ოსპისა და ტკბილი კარტოფილის პატარა მწყემსის ღვეზელი',
    titleEn: "Lentil and Sweet Potato Mini Shepherd's Pie",
    mealType: 'DINNER',
    ageGroups: ['FROM_12'],
    prepTimeMinutes: 40,
    allergens: ['tomato'],
    ingredientsKa: [
      'მშრალი წითელი ოსპი - 30 გ',
      'ტკბილი კარტოფილი - 80 გ',
      'სტაფილო - 30 გ',
      'ბარდა - 20 გ',
      'პომიდორი - 30 გ',
      'ზეითუნის ზეთი - 5 მლ',
    ],
    ingredientsEn: [
      'Dry red lentils - 30 g',
      'Sweet potato - 80 g',
      'Carrot - 30 g',
      'Peas - 20 g',
      'Tomato - 30 g',
      'Olive oil - 5 ml',
    ],
    stepsKa: [
      'გააცხელე ღუმელი 180°C-მდე.',
      'ოსპი გარეცხე და მოხარშე დაახლოებით 12-15 წუთი.',
      'ტკბილი კარტოფილი გათალე, დაჭერი და მოხარშე დაახლოებით 12-15 წუთი.',
      'სტაფილო და ბარდა მცირე რაოდენობის წყალში დარბილებამდე მოამზადე.',
      'დაუმატე წვრილად დაჭრილი პომიდორი.',
      'შეურიე მოხარშული ოსპი.',
      'ტკბილი კარტოფილი დაჭყლიტე.',
      'პატარა ფორმაში მოათავსე ოსპისა და ბოსტნეულის ნარევი და ზემოდან გადაანაწილე ტკბილი კარტოფილი.',
      'გამოაცხვე დაახლოებით 10 წუთი.',
      'გააგრილე უსაფრთხო ტემპერატურამდე.',
    ],
    stepsEn: [
      'Preheat the oven to 180°C.',
      'Rinse and boil the lentils for about 12-15 minutes.',
      'Peel, cut and boil the sweet potato for about 12-15 minutes.',
      'Cook the carrot and peas in a small amount of water until tender.',
      'Add the finely chopped tomato.',
      'Mix in the cooked lentils.',
      'Mash the sweet potato.',
      'Place the lentil mixture in a small baking dish and spread the sweet potato over the top.',
      'Bake for about 10 minutes.',
      'Cool to a safe serving temperature.',
    ],
    nutrients: {
      vitaminAmcg: 838, vitaminCmg: 24, vitaminB1mg: 0.3, vitaminB6mg: 0.37,
      folateMcg: 107, ironMg: 2.8, zincMg: 1.72, magnesiumMg: 61, potassiumMg: 614,
    },
  },
  {
    titleKa: 'თეთრი ლობიოსა და ყვავილოვანი კომბოსტოს კრემ-სუპი',
    titleEn: 'White Bean and Cauliflower Cream Soup',
    mealType: 'DINNER',
    ageGroups: ['FROM_12'],
    // Not given a fixed time by the recipe author — determined here instead of guessing:
    // dry beans need to be soaked first (soaking time NOT counted, per her instruction),
    // then boiled from raw until fully tender, which realistically takes about 45-60 minutes
    // even after soaking; vegetables are prepped/cooked in parallel during that time, then
    // combined and blended. ~60 minutes is the realistic total active time after soaking.
    prepTimeMinutes: 60,
    allergens: [],
    ingredientsKa: [
      'მშრალი თეთრი ლობიო - 25 გ',
      'ყვავილოვანი კომბოსტო - 70 გ',
      'კარტოფილი - 40 გ',
      'სტაფილო - 30 გ',
      'ზეითუნის ზეთი - 5 მლ',
      'წყალი - 180-220 მლ',
    ],
    ingredientsEn: [
      'Dry white beans - 25 g',
      'Cauliflower - 70 g',
      'Potato - 40 g',
      'Carrot - 30 g',
      'Olive oil - 5 ml',
      'Water - 180-220 ml',
    ],
    stepsKa: [
      'თეთრი ლობიო რამდენიმე საათით ან მთელი ღამით დაალბე.',
      'გადაწურე, დაასხი სუფთა წყალი და სრულ დარბილებამდე მოხარშე.',
      'კარტოფილი და სტაფილო გათალე და დაჭერი.',
      'ყვავილოვანი კომბოსტო პატარა ყვავილებად დაყავი.',
      'ბოსტნეული დაახლოებით 15-20 წუთი მოხარშე.',
      'დაუმატე მოხარშული ლობიო და კიდევ რამდენიმე წუთი ხარშე.',
      'დააბლენდერე ან დაჭყლიტე ბავშვისთვის შესაფერის კონსისტენციამდე.',
      'ბოლოს დაუმატე ზეითუნის ზეთი.',
    ],
    stepsEn: [
      'Soak the white beans for several hours or overnight.',
      'Drain, cover with fresh water and cook until completely tender.',
      'Peel and cut the potato and carrot.',
      'Divide the cauliflower into small florets.',
      'Cook the vegetables for about 15-20 minutes.',
      'Add the cooked beans and simmer for a few more minutes.',
      'Blend or mash to an age-appropriate consistency.',
      'Add the olive oil at the end.',
    ],
    nutrients: {
      vitaminAmcg: 251, vitaminCmg: 35, vitaminKmcg: 18, vitaminB1mg: 0.18,
      folateMcg: 88, ironMg: 2.6, calciumMg: 75, magnesiumMg: 58, potassiumMg: 794,
    },
  },
  {
    titleKa: 'კვერცხის, კარტოფილისა და ისპანახის მინი ფრიტატა',
    titleEn: 'Mini Egg, Potato and Spinach Frittata',
    mealType: 'DINNER',
    ageGroups: ['FROM_12'],
    prepTimeMinutes: 35,
    allergens: ['egg', 'dairy'],
    ingredientsKa: [
      'კვერცხი - 1 ცალი',
      'კარტოფილი - 50 გ',
      'ისპანახი - 25 გ',
      'მოცარელა - 20 გ',
      'სრულცხიმიანი რძე - 20 მლ',
      'ზეითუნის ზეთი - 3 მლ',
    ],
    ingredientsEn: [
      'Egg - 1',
      'Potato - 50 g',
      'Spinach - 25 g',
      'Mozzarella - 20 g',
      'Whole milk - 20 ml',
      'Olive oil - 3 ml',
    ],
    stepsKa: [
      'გააცხელე ღუმელი 180°C-მდე.',
      'კარტოფილი გათალე, პატარა კუბებად დაჭერი და 10-12 წუთი მოხარშე.',
      'ისპანახი 2-3 წუთი მოამზადე და წვრილად დაჭერი.',
      'კვერცხი და რძე ათქვიფე.',
      'დაუმატე კარტოფილი, ისპანახი და გახეხილი მოცარელა.',
      'ფორმას მსუბუქად წაუსვი ზეითუნის ზეთი და ჩაასხი ნარევი.',
      'გამოაცხვე დაახლოებით 15 წუთი, სანამ კვერცხი ცენტრშიც სრულად მომზადდება.',
      'გააგრილე და პატარა რბილ ნაჭრებად დაჭერი.',
    ],
    stepsEn: [
      'Preheat the oven to 180°C.',
      'Peel and dice the potato and boil for 10-12 minutes.',
      'Cook the spinach for 2-3 minutes and finely chop.',
      'Whisk the egg and milk.',
      'Add the potato, spinach and grated mozzarella.',
      'Lightly grease a small baking dish with olive oil and add the mixture.',
      'Bake for about 15 minutes until completely cooked through.',
      'Allow to cool and cut into small soft pieces.',
    ],
    nutrients: {
      vitaminAmcg: 268, vitaminB2mg: 0.37, vitaminB6mg: 0.19, folateMcg: 65,
      vitaminB12mcg: 0.78, vitaminDmcg: 1.0, vitaminKmcg: 125, calciumMg: 187,
      ironMg: 1.9, zincMg: 1.5,
    },
  },
  {
    titleKa: 'მსხლისა და ტაჰინის შვრიის რბილი ბაითები',
    titleEn: 'Soft Pear and Tahini Oat Bites',
    mealType: 'SNACK',
    ageGroups: ['FROM_9'],
    prepTimeMinutes: 25,
    allergens: ['sesame'],
    ingredientsKa: [
      'მსხალი - 60 გ',
      'შვრიის ფანტელი - 30 გ',
      'ბანანი - 20 გ',
      '100% სეზამის ტაჰინი - 5 გ',
      'დარიჩინი - მცირე რაოდენობა',
    ],
    ingredientsEn: [
      'Pear - 60 g',
      'Rolled oats - 30 g',
      'Banana - 20 g',
      '100% sesame tahini - 5 g',
      'Cinnamon - a small amount',
    ],
    stepsKa: [
      'გააცხელე ღუმელი 180°C-მდე.',
      'მსხალი გათალე, ამოაცალე გული და წვრილად გახეხე.',
      'ბანანი კარგად დაჭყლიტე.',
      'შეურიე მსხალი, ბანანი, შვრია, ტაჰინი და დარიჩინი.',
      'გააკეთე პატარა მოგრძო ფორმები.',
      'გამოაცხვე დაახლოებით 15-18 წუთი.',
      'სრულად გააგრილე.',
      'საბოლოო ტექსტურა უნდა იყოს ძალიან რბილი და თითებს შორის ადვილად იჭყლიტებოდეს. თუ მყარი გამოვიდა, 9-11 თვის ბავშვისთვის არ გამოიყენო.',
    ],
    stepsEn: [
      'Preheat the oven to 180°C.',
      'Peel and core the pear, then finely grate it.',
      'Mash the banana thoroughly.',
      'Mix the pear, banana, oats, tahini and cinnamon.',
      'Shape into small finger-shaped pieces.',
      'Bake for about 15-18 minutes.',
      'Allow to cool completely.',
      'The final texture must be very soft and easily squashed between the fingers. Do not serve to a 9-11 month old if the bites become firm.',
    ],
    nutrients: {
      vitaminB1mg: 0.29, vitaminB6mg: 0.13, vitaminEmg: 0.23, folateMcg: 30,
      calciumMg: 43, ironMg: 1.9, zincMg: 1.5, magnesiumMg: 56,
    },
  },
];

// Human-readable label for the final report (only what actually got filled per dish).
const NUTRIENT_LABELS: Record<string, { label: string; unit: string }> = {
  vitaminAmcg: { label: 'Vitamin A', unit: 'mcg' },
  vitaminB1mg: { label: 'Vitamin B1', unit: 'mg' },
  vitaminB2mg: { label: 'Vitamin B2', unit: 'mg' },
  vitaminB6mg: { label: 'Vitamin B6', unit: 'mg' },
  vitaminB12mcg: { label: 'Vitamin B12', unit: 'mcg' },
  folateMcg: { label: 'Vitamin B9 / Folate', unit: 'mcg' },
  vitaminCmg: { label: 'Vitamin C', unit: 'mg' },
  vitaminDmcg: { label: 'Vitamin D', unit: 'mcg' },
  vitaminEmg: { label: 'Vitamin E', unit: 'mg' },
  vitaminKmcg: { label: 'Vitamin K', unit: 'mcg' },
  ironMg: { label: 'Iron', unit: 'mg' },
  calciumMg: { label: 'Calcium', unit: 'mg' },
  zincMg: { label: 'Zinc', unit: 'mg' },
  magnesiumMg: { label: 'Magnesium', unit: 'mg' },
  potassiumMg: { label: 'Potassium', unit: 'mg' },
  omega3Mg: { label: 'Omega-3', unit: 'mg' },
};

async function main() {
  let added = 0;
  const skipped: string[] = [];

  for (const d of DISHES) {
    const existing = await p.dish.findFirst({ where: { titleKa: d.titleKa } });
    if (existing) {
      skipped.push(d.titleKa);
      continue;
    }

    await p.dish.create({
      data: {
        titleKa: d.titleKa,
        titleEn: d.titleEn,
        descriptionKa: d.stepsKa.join('\n'),
        descriptionEn: d.stepsEn.join('\n'),
        ingredientsKa: d.ingredientsKa,
        ingredientsEn: d.ingredientsEn,
        mealType: d.mealType,
        ageGroups: d.ageGroups,
        allergens: d.allergens,
        prepTimeMinutes: d.prepTimeMinutes,
        ...d.nutrients,
      },
    });
    added++;
  }

  console.log(`\n✓ დაემატა ${added} კერძი${skipped.length ? `, გამოტოვდა ${skipped.length} (უკვე არსებობდა): ${skipped.join(', ')}` : ''}.\n`);

  console.log('=== თითოეული დამატებული კერძის nutrient ცხრილი ===\n');
  for (const d of DISHES) {
    if (skipped.includes(d.titleKa)) continue;
    console.log(`— ${d.titleKa} / ${d.titleEn} [${d.mealType}, ${d.ageGroups.join(',')}, ${d.prepTimeMinutes} წთ]`);
    for (const [key, value] of Object.entries(d.nutrients)) {
      const meta = NUTRIENT_LABELS[key];
      console.log(`    ${meta.label}: ${value} ${meta.unit}`);
    }
    console.log('');
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
