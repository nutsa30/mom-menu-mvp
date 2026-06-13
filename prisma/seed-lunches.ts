import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const recipes = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6-8 MONTHS (FROM_6) — LUNCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ქათამი და ტკბილი კარტოფილი',
    titleEn: 'Chicken and Sweet Potato',
    descriptionKa: 'ქათმის ფილე და ტკბილი კარტოფილი ორთქლზე ან წყალში მოხარშეთ სრულ დარბილებამდე. დააბლენდერეთ გლუვ პიურედ. გაათხელეთ საჭიროების შემთხვევაში მოხარშვის წყლით.',
    descriptionEn: 'Steam or boil chicken fillet and sweet potato until fully soft. Blend into a smooth puree. Thin with cooking water if needed.',
    ingredientsKa: ['ქათმის ფილე - 50-60 გ', 'ტკბილი კარტოფილი - 70 გ'],
    ingredientsEn: ['Chicken fillet - 50-60g', 'Sweet potato - 70g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ქათამი და გოგრა',
    titleEn: 'Chicken and Pumpkin',
    descriptionKa: 'ქათმის ფილე და გოგრა ორთქლზე ან წყალში მოხარშეთ. დააბლენდერეთ ერთგვაროვან, გლუვ მასად. ასაკის შესაბამისი ტექსტურით მიეცით.',
    descriptionEn: 'Steam or boil chicken fillet and pumpkin. Blend into a smooth, uniform mass. Serve with age-appropriate texture.',
    ingredientsKa: ['ქათმის ფილე - 50-60 გ', 'გოგრა - 70-80 გ'],
    ingredientsEn: ['Chicken fillet - 50-60g', 'Pumpkin - 70-80g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ინდაური და სტაფილო',
    titleEn: 'Turkey and Carrot',
    descriptionKa: 'ინდაურის ხორცი და სტაფილო ორთქლზე ან წყალში მოხარშეთ. ბლენდერით გლუვ პიურედ აქციეთ. სტაფილო ინდაურს ბუნებრივ სიტკბოს მატებს.',
    descriptionEn: 'Steam or boil turkey meat and carrot. Blend into a smooth puree. Carrot adds natural sweetness to the turkey.',
    ingredientsKa: ['ინდაურის ხორცი - 50-60 გ', 'სტაფილო - 50-60 გ'],
    ingredientsEn: ['Turkey meat - 50-60g', 'Carrot - 50-60g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'წითელი ოსპი ბოსტნეულით',
    titleEn: 'Red Lentils with Vegetables',
    descriptionKa: 'წითელი ოსპი კარგად გარეცხეთ. სტაფილო და ყაბაყი დაჭერით. ყველა ერთად წყალში მოხარშეთ 15-20 წუთი. ბლენდერით გლუვ სუპ-პიურედ დამუშავეთ.',
    descriptionEn: 'Rinse red lentils well. Chop carrot and zucchini. Cook everything in water for 15-20 minutes. Blend into a smooth soup-puree.',
    ingredientsKa: ['წითელი ოსპი - 30 გ', 'სტაფილო - 40 გ', 'ყაბაყი - 40 გ'],
    ingredientsEn: ['Red lentils - 30g', 'Carrot - 40g', 'Zucchini - 40g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ბროკოლი და კარტოფილი',
    titleEn: 'Broccoli and Potato',
    descriptionKa: 'კარტოფილი გაფცქვენით და ბროკოლთან ერთად ორთქლზე მოხარშეთ. ბლენდერით გლუვ პიურედ დამუშავეთ. საჭიროების შემთხვევაში გაათხელეთ.',
    descriptionEn: 'Peel potato and steam with broccoli until soft. Blend into a smooth puree. Thin with water if needed.',
    ingredientsKa: ['ბროკოლი - 60 გ', 'კარტოფილი - 60 გ'],
    ingredientsEn: ['Broccoli - 60g', 'Potato - 60g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ყაბაყი და ქათამი',
    titleEn: 'Zucchini and Chicken',
    descriptionKa: 'ქათმის ფილე და ყაბაყი ორთქლზე ან წყალში მოხარშეთ. ბლენდერით ერთგვაროვნად დამუშავეთ. მსუბუქი, ადვილად მოსანელებელი კომბინაციაა.',
    descriptionEn: 'Steam or boil chicken fillet and zucchini. Blend until uniform. A light, easily digestible combination.',
    ingredientsKa: ['ყაბაყი - 70 გ', 'ქათმის ფილე - 50 გ'],
    ingredientsEn: ['Zucchini - 70g', 'Chicken fillet - 50g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ყვავილოვანი კომბოსტო და კარტოფილი',
    titleEn: 'Cauliflower and Potato',
    descriptionKa: 'ყვავილოვანი კომბოსტო და კარტოფილი ორთქლზე მოხარშეთ. ბლენდერით გლუვ, კრემისებრ პიურედ დამუშავეთ. ზეითუნის ზეთის ერთი წვეთი შეგიძლიათ დაუმატოთ.',
    descriptionEn: 'Steam cauliflower and potato. Blend into a smooth, creamy puree. You can add a drop of olive oil.',
    ingredientsKa: ['ყვავილოვანი კომბოსტო - 70 გ', 'კარტოფილი - 60 გ'],
    ingredientsEn: ['Cauliflower - 70g', 'Potato - 60g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'საქონლის ხორცი და ტკბილი კარტოფილი',
    titleEn: 'Beef and Sweet Potato',
    descriptionKa: 'საქონლის ხორცი კარგად მოხარშეთ. ტკბილი კარტოფილი ორთქლზე მოამზადეთ. ერთად ბლენდერით გლუვ პიურედ დამუშავეთ. საჭიროების შემთხვევაში გაათხელეთ.',
    descriptionEn: 'Cook beef well. Steam sweet potato. Blend together into a smooth puree. Thin with water if needed.',
    ingredientsKa: ['საქონლის ხორცი - 50-60 გ', 'ტკბილი კარტოფილი - 70 გ'],
    ingredientsEn: ['Beef - 50-60g', 'Sweet potato - 70g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ოსპი და სტაფილო',
    titleEn: 'Lentils and Carrot',
    descriptionKa: 'ოსპი გარეცხეთ და სტაფილოსთან ერთად წყალში მოხარშეთ. ბლენდერით გლუვ სუპ-პიურედ დამუშავეთ. რკინითა და ცილით მდიდარი კომბინაციაა.',
    descriptionEn: 'Rinse lentils and cook with carrot in water. Blend into a smooth soup-puree. Rich in iron and protein.',
    ingredientsKa: ['ოსპი - 30 გ', 'სტაფილო - 60 გ'],
    ingredientsEn: ['Lentils - 30g', 'Carrot - 60g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ქათამი და ბროკოლი',
    titleEn: 'Chicken and Broccoli',
    descriptionKa: 'ქათმის ფილე და ბროკოლი ორთქლზე ან წყალში მოხარშეთ. ბლენდერით გლუვ პიურედ დამუშავეთ. ვიტამინებით მდიდარი, დაბალანსებული სადილია.',
    descriptionEn: 'Steam or boil chicken fillet and broccoli. Blend into a smooth puree. A balanced, vitamin-rich lunch.',
    ingredientsKa: ['ქათმის ფილე - 50-60 გ', 'ბროკოლი - 60 გ'],
    ingredientsEn: ['Chicken fillet - 50-60g', 'Broccoli - 60g'],
    ageGroups: ['FROM_6'], mealType: 'LUNCH', allergens: [],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9-11 MONTHS (FROM_9) — LUNCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ქათმის ხორცის ბურთულები',
    titleEn: 'Chicken Meatballs',
    descriptionKa: 'ქათმის ფილე და სტაფილო ბლენდერით დაამუშავეთ. პატარა ბურთულები ჩამოაყალიბეთ და ორთქლზე ან წყალში მოხარშეთ 15-20 წუთი. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Process chicken fillet and carrot in a blender. Shape into small balls and steam or boil for 15-20 minutes. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ქათმის ფილე - 70-80 გ', 'სტაფილო - 30-40 გ'],
    ingredientsEn: ['Chicken fillet - 70-80g', 'Carrot - 30-40g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ინდაურის კატლეტი',
    titleEn: 'Turkey Patty',
    descriptionKa: 'ინდაურის ხორცი და ყაბაყი ბლენდერით დაამუშავეთ. პატარა კატლეტები ჩამოაყალიბეთ. ზეთის მინიმალური რაოდენობით ან ორთქლზე მოხარშეთ. რბილი ტექსტურით მიეცით.',
    descriptionEn: 'Process turkey meat and zucchini in a blender. Shape into small patties. Cook with minimal oil or steam. Serve with soft texture.',
    ingredientsKa: ['ინდაური - 70-80 გ', 'ყაბაყი - 40-50 გ'],
    ingredientsEn: ['Turkey - 70-80g', 'Zucchini - 40-50g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'საქონლის ხორცი და წიწიბურა',
    titleEn: 'Beef and Buckwheat',
    descriptionKa: 'საქონლის ხორცი კარგად მოხარშეთ და წვრილად დაჭერით. წიწიბურა ცალკე მოხარშეთ სრულ დარბილებამდე. ერთად შეურიეთ. რბილი ტექსტურით მიეცით.',
    descriptionEn: 'Cook beef well and finely chop. Cook buckwheat separately until fully soft. Mix together. Serve with soft texture.',
    ingredientsKa: ['საქონლის ხორცი - 60-70 გ', 'წიწიბურა - 30 გ'],
    ingredientsEn: ['Beef - 60-70g', 'Buckwheat - 30g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ორაგული და კარტოფილი',
    titleEn: 'Salmon and Potato',
    descriptionKa: 'ორაგული ორთქლზე მოხარშეთ და ეკლები ფრთხილად მოაშორეთ. კარტოფილი ორთქლზე მოხარშეთ. ჩანგლით ერთად დაჭყლიტეთ. ომეგა-3-ით მდიდარი სადილია.',
    descriptionEn: 'Steam salmon and carefully remove bones. Steam potato. Mash together with a fork. A lunch rich in omega-3.',
    ingredientsKa: ['ორაგული - 50-60 გ', 'კარტოფილი - 70 გ'],
    ingredientsEn: ['Salmon - 50-60g', 'Potato - 70g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: ['fish'],
  },
  {
    titleKa: 'ქათამი და მაკარონი',
    titleEn: 'Chicken and Pasta',
    descriptionKa: 'საბავშვო მაკარონი კარგად მოხარშეთ. ქათმის ფილე ორთქლზე მოხარშეთ და წვრილ ნაჭრებად დაჭერით. ერთად შეურიეთ. რბილ ტექსტურად მიეცით.',
    descriptionEn: 'Cook baby pasta well. Steam chicken fillet and cut into small pieces. Mix together. Serve with soft texture.',
    ingredientsKa: ['ქათმის ფილე - 60-70 გ', 'საბავშვო მაკარონი - 30-40 გ'],
    ingredientsEn: ['Chicken fillet - 60-70g', 'Baby pasta - 30-40g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: ['gluten'],
  },
  {
    titleKa: 'ოსპის სუპი',
    titleEn: 'Lentil Soup',
    descriptionKa: 'წითელი ოსპი გარეცხეთ. ბოსტნეული (სტაფილო, ყაბაყი) დაჭერით. ყველა ერთად წყალში მოხარშეთ. ბლენდერით ან ჩანგლით ოდნავ დაჭყლიტეთ — ტექსტურა უნდა დარჩეს.',
    descriptionEn: 'Rinse red lentils. Chop vegetables (carrot, zucchini). Cook everything in water. Slightly blend or mash with fork — some texture should remain.',
    ingredientsKa: ['წითელი ოსპი - 30-40 გ', 'ბოსტნეული (სტაფილო, ყაბაყი) - 80-100 გ'],
    ingredientsEn: ['Red lentils - 30-40g', 'Vegetables (carrot, zucchini) - 80-100g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის რიზოტო',
    titleEn: 'Vegetable Risotto',
    descriptionKa: 'ბრინჯი ბოსტნეულთან ერთად წყალში მოხარშეთ. ხშირ-ხშირად ურიეთ. ბრინჯი კარგად დარბილდება და კრემისებრ კონსისტენციას მიიღებს. ასაკის შესაბამისი ტექსტურით მიეცით.',
    descriptionEn: 'Cook rice with vegetables in water. Stir frequently. Rice softens well and develops a creamy consistency. Serve with age-appropriate texture.',
    ingredientsKa: ['ბრინჯი - 30-40 გ', 'ბოსტნეული (სტაფილო, ყაბაყი, ბროკოლი) - 80 გ'],
    ingredientsEn: ['Rice - 30-40g', 'Vegetables (carrot, zucchini, broccoli) - 80g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ქათამი და ბრინჯი',
    titleEn: 'Chicken and Rice',
    descriptionKa: 'ქათამი და ბრინჯი ცალ-ცალკე ან ერთად მოხარშეთ. ქათამი წვრილ ნაჭრებად დაჭერით. ბრინჯი კარგად დარბილდება. ერთად შეურიეთ და ასაკის შესაბამისი ტექსტურით მიეცით.',
    descriptionEn: 'Cook chicken and rice separately or together. Cut chicken into small pieces. Rice softens well. Mix together and serve with age-appropriate texture.',
    ingredientsKa: ['ქათამი - 60-70 გ', 'ბრინჯი - 30-40 გ'],
    ingredientsEn: ['Chicken - 60-70g', 'Rice - 30-40g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ლობიო და ბოსტნეული',
    titleEn: 'Beans and Vegetables',
    descriptionKa: 'თეთრი ლობიო წინასწარ გაჟღენთეთ და კარგად მოხარშეთ. ბოსტნეული ცალკე მოხარშეთ. ჩანგლით ოდნავ დაჭყლიტეთ. ცილით მდიდარი, მაძღრობი სადილია.',
    descriptionEn: 'Soak white beans in advance and cook well. Cook vegetables separately. Mash slightly with a fork. A protein-rich, filling lunch.',
    ingredientsKa: ['თეთრი ლობიო - 40-50 გ', 'ბოსტნეული (სტაფილო, ყაბაყი) - 70-80 გ'],
    ingredientsEn: ['White beans - 40-50g', 'Vegetables (carrot, zucchini) - 70-80g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის ომლეტი',
    titleEn: 'Vegetable Omelette',
    descriptionKa: 'ბროკოლი და სტაფილო მოხარშეთ და წვრილად დაჭერით. კვერცხი ავურიეთ. ზეთის მინიმალური რაოდენობით გამოაცხვეთ ომლეტი. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Cook and finely chop broccoli and carrot. Beat egg. Cook omelette with minimal oil. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['კვერცხი - 1 ცალი', 'ბროკოლი - 30 გ', 'სტაფილო - 30 გ'],
    ingredientsEn: ['Egg - 1', 'Broccoli - 30g', 'Carrot - 30g'],
    ageGroups: ['FROM_9'], mealType: 'LUNCH', allergens: ['egg'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12-18 MONTHS (FROM_12) — LUNCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ქათმის გუფთა',
    titleEn: 'Chicken Meatballs with Rice',
    descriptionKa: 'ქათმის ხორცი ბლენდერით დაამუშავეთ. ბრინჯი ოდნავ მოხარშეთ და ქათამს შეუმატეთ. გუფთები ჩამოაყალიბეთ. ორთქლზე ან წყალში 20 წუთი მოხარშეთ. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Process chicken meat in a blender. Slightly cook rice and add to chicken. Shape meatballs. Steam or boil for 20 minutes. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ქათმის ხორცი - 80-90 გ', 'ბრინჯი - 20-30 გ'],
    ingredientsEn: ['Chicken meat - 80-90g', 'Rice - 20-30g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'საქონლის ხორცის გუფთა',
    titleEn: 'Beef Meatballs',
    descriptionKa: 'საქონლის ხორცი ბლენდერით დაამუშავეთ. ბოსტნეული (ყაბაყი, სტაფილო) გაატარეთ სახეხელაზე და შეუმატეთ. გუფთები ჩამოაყალიბეთ. ორთქლზე 20-25 წუთი მოხარშეთ.',
    descriptionEn: 'Process beef in a blender. Grate vegetables (zucchini, carrot) and add. Shape meatballs. Steam for 20-25 minutes.',
    ingredientsKa: ['საქონლის ხორცი - 80-90 გ', 'ბოსტნეული (ყაბაყი, სტაფილო) - 50-60 გ'],
    ingredientsEn: ['Beef - 80-90g', 'Vegetables (zucchini, carrot) - 50-60g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ორაგული ბოსტნეულით',
    titleEn: 'Salmon with Vegetables',
    descriptionKa: 'ორაგული ორთქლზე მოხარშეთ. ეკლები ფრთხილად მოაშორეთ. ბროკოლი და სტაფილო ორთქლზე მოხარშეთ. ჩანგლით ოდნავ დაჭყლიტეთ. ომეგა-3-ით და ვიტამინებით მდიდარი.',
    descriptionEn: 'Steam salmon. Carefully remove bones. Steam broccoli and carrot. Mash slightly with a fork. Rich in omega-3 and vitamins.',
    ingredientsKa: ['ორაგული - 70-80 გ', 'ბროკოლი - 40-50 გ', 'სტაფილო - 40-50 გ'],
    ingredientsEn: ['Salmon - 70-80g', 'Broccoli - 40-50g', 'Carrot - 40-50g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: ['fish'],
  },
  {
    titleKa: 'ქათმის სტიუ',
    titleEn: 'Chicken Stew',
    descriptionKa: 'ქათამი, კარტოფილი და სტაფილო წვრილ ნაჭრებად დაჭერით. ნებისმიერ ზეთში ოდნავ შეაცხვეთ, შემდეგ წყალი დაუმატეთ და დაახლოებით 25-30 წუთი ჩაშუშეთ. ასაკის შესაბამისი ტექსტურით მიეცით.',
    descriptionEn: 'Cut chicken, potato and carrot into small pieces. Lightly sauté in oil, then add water and stew for about 25-30 minutes. Serve with age-appropriate texture.',
    ingredientsKa: ['ქათამი - 70-80 გ', 'კარტოფილი - 50-60 გ', 'სტაფილო - 40 გ'],
    ingredientsEn: ['Chicken - 70-80g', 'Potato - 50-60g', 'Carrot - 40g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'მაკარონი ტომატის სოუსით',
    titleEn: 'Pasta with Tomato Sauce',
    descriptionKa: 'მაკარონი კარგად მოხარშეთ. პომიდორი გაფცქვენით, ჩამოაფშეკით და ოდნავ ჩაშუშეთ. მაკარონი სოუსს შეუმატეთ. ყოველგვარი მარილისა და შაქრის გარეშე.',
    descriptionEn: 'Cook pasta well. Peel tomatoes, blend and simmer slightly. Add pasta to sauce. Without any salt or sugar.',
    ingredientsKa: ['მაკარონი - 50-60 გ', 'პომიდორი - 70-80 გ'],
    ingredientsEn: ['Pasta - 50-60g', 'Tomato - 70-80g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: ['gluten'],
  },
  {
    titleKa: 'ბოსტნეულის პილაფი',
    titleEn: 'Vegetable Pilaf',
    descriptionKa: 'ბრინჯი ბოსტნეულთან ერთად ზეთში ოდნავ შეაცხვეთ. წყალი დაუმატეთ და კარგად მოხარშეთ. ყველა ბოსტნეული კარგად დარბილდება. ასაკის შესაბამისი ტექსტურით მიეცით.',
    descriptionEn: 'Lightly sauté rice with vegetables in oil. Add water and cook well. All vegetables soften well. Serve with age-appropriate texture.',
    ingredientsKa: ['ბრინჯი - 40-50 გ', 'ბოსტნეული (სტაფილო, ყაბაყი, ბროკოლი) - 80-100 გ'],
    ingredientsEn: ['Rice - 40-50g', 'Vegetables (carrot, zucchini, broccoli) - 80-100g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ლობიოს ჩაშუშული',
    titleEn: 'Bean Stew',
    descriptionKa: 'ლობიო წინასწარ გაჟღენთეთ და მოხარშეთ. სტაფილო წვრილად დაჭერით. ოდნავ შეაცხვეთ, ლობიო და წყალი დაუმატეთ. 15-20 წუთი ჩაშუშეთ. რბილი ტექსტურით მიეცით.',
    descriptionEn: 'Soak and cook beans in advance. Finely chop carrot. Lightly sauté, add beans and water. Stew for 15-20 minutes. Serve with soft texture.',
    ingredientsKa: ['ლობიო - 50-60 გ', 'სტაფილო - 40-50 გ'],
    ingredientsEn: ['Beans - 50-60g', 'Carrot - 40-50g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ინდაური და ბრინჯი',
    titleEn: 'Turkey and Rice',
    descriptionKa: 'ინდაური წვრილ ნაჭრებად დაჭერით და მოხარშეთ. ბრინჯი ცალკე მოხარშეთ. ერთად შეურიეთ. ასაკის შესაბამის ზომებად მიეცით. მსუბუქი, ადვილად მოსანელებელი სადილია.',
    descriptionEn: 'Cut turkey into small pieces and cook. Cook rice separately. Mix together. Serve in age-appropriate sized pieces. A light, easily digestible lunch.',
    ingredientsKa: ['ინდაური - 70-80 გ', 'ბრინჯი - 40-50 გ'],
    ingredientsEn: ['Turkey - 70-80g', 'Rice - 40-50g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ოსპის კატლეტები',
    titleEn: 'Lentil Patties',
    descriptionKa: 'ოსპი კარგად მოხარშეთ და გლუვ მასად დაჭყლიტეთ. კვერცხი შეუმატეთ. პატარა კატლეტები ჩამოაყალიბეთ. ზეთის მინიმალური რაოდენობით გამოაცხვეთ. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Cook lentils well and mash into a smooth mass. Add egg. Shape into small patties. Cook with minimal oil. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ოსპი - 60-70 გ', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Lentils - 60-70g', 'Egg - 1'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: ['egg'],
  },
  {
    titleKa: 'ქათმის კოტლეტი',
    titleEn: 'Chicken Cutlet',
    descriptionKa: 'ქათმის ფილე ბლენდერით დაამუშავეთ. ყაბაყი გაატარეთ სახეხელაზე და შეუმატეთ. კოტლეტები ჩამოაყალიბეთ. ორთქლზე ან ზეთის მინიმალური რაოდენობით გამოაცხვეთ. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Process chicken fillet in blender. Grate zucchini and add. Shape cutlets. Steam or cook with minimal oil. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ქათმის ფილე - 80-90 გ', 'ყაბაყი - 40-50 გ'],
    ingredientsEn: ['Chicken fillet - 80-90g', 'Zucchini - 40-50g'],
    ageGroups: ['FROM_12'], mealType: 'LUNCH', allergens: [],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 18-36 MONTHS (FROM_24) — LUNCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ქათმის შნიცელი',
    titleEn: 'Chicken Schnitzel',
    descriptionKa: 'ქათმის ფილე გაბრტყელეთ. კვერცხში ჩაასველეთ. ზეთში ოქროსფრამდე გამოაცხვეთ. სასურველ ზომებად დაჭერით. ახლად მომზადებული მიეცით ბოსტნეულის გარნირთან ერთად.',
    descriptionEn: 'Flatten chicken fillet. Dip in egg. Cook in oil until golden. Cut into desired sized pieces. Serve freshly made with a vegetable side.',
    ingredientsKa: ['ქათმის ფილე - 90-100 გ', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Chicken fillet - 90-100g', 'Egg - 1'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: ['egg'],
  },
  {
    titleKa: 'საქონლის ხორცის გუფთა ბრინჯით',
    titleEn: 'Beef Meatballs with Rice',
    descriptionKa: 'საქონლის ხორცი დაახვიეთ. ბრინჯი ოდნავ მოხარშეთ და ხორცს შეუმატეთ. ბუსო ჩამოაყალიბეთ. ორთქლზე ან ტომატის სოუსში 25-30 წუთი ჩაშუშეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Mince beef. Slightly cook rice and add to meat. Shape meatballs. Steam or stew in tomato sauce for 25-30 minutes. Serve freshly made.',
    ingredientsKa: ['საქონლის ხორცი - 90-100 გ', 'ბრინჯი - 30-40 გ'],
    ingredientsEn: ['Beef - 90-100g', 'Rice - 30-40g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ორაგული ბრინჯით',
    titleEn: 'Salmon with Rice',
    descriptionKa: 'ორაგული ორთქლზე ან ზეთის მინიმალური რაოდენობით გამოაცხვეთ. ეკლები ფრთხილად მოაშორეთ. ბრინჯი ცალკე მოხარშეთ. ახლად მომზადებული მიეცით. ომეგა-3-ით მდიდარი სადილია.',
    descriptionEn: 'Steam or cook salmon with minimal oil. Carefully remove bones. Cook rice separately. Serve freshly made. A lunch rich in omega-3.',
    ingredientsKa: ['ორაგული - 80-90 გ', 'ბრინჯი - 50-60 გ'],
    ingredientsEn: ['Salmon - 80-90g', 'Rice - 50-60g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: ['fish'],
  },
  {
    titleKa: 'პასტა ბოლონეზე',
    titleEn: 'Pasta Bolognese',
    descriptionKa: 'საქონლის ხორცი ოდნავ შეაცხვეთ. პომიდვრი გაფცქვენით და დაუმატეთ. 20-25 წუთი ჩაშუშეთ. მაკარონი ცალკე მოხარშეთ. სოუსი მაკარონს შეუმატეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Lightly sauté beef. Peel tomatoes and add. Stew for 20-25 minutes. Cook pasta separately. Add sauce to pasta. Serve freshly made.',
    ingredientsKa: ['საქონლის ხორცი - 80-90 გ', 'მაკარონი - 50-60 გ', 'პომიდვრი - 70-80 გ'],
    ingredientsEn: ['Beef - 80-90g', 'Pasta - 50-60g', 'Tomato - 70-80g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: ['gluten'],
  },
  {
    titleKa: 'ქათმის პილაფი',
    titleEn: 'Chicken Pilaf',
    descriptionKa: 'ქათამი წვრილ ნაჭრებად დაჭერით. სტაფილო გაატარეთ სახეხელაზე. ზეთში შეაცხვეთ. ბრინჯი დაუმატეთ და წყალი. დახურული სახურავით 20 წუთი მოხარშეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Cut chicken into small pieces. Grate carrot. Sauté in oil. Add rice and water. Cook covered for 20 minutes. Serve freshly made.',
    ingredientsKa: ['ქათამი - 80-90 გ', 'ბრინჯი - 50-60 გ', 'სტაფილო - 40-50 გ'],
    ingredientsEn: ['Chicken - 80-90g', 'Rice - 50-60g', 'Carrot - 40-50g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის ლაზანია',
    titleEn: 'Vegetable Lasagna',
    descriptionKa: 'ბოსტნეული ოდნავ შეაცხვეთ. ლაზანიას ფირფიტები, ბოსტნეული და ყველი ფენებად დაალაგეთ. 180°C-ზე 25-30 წუთი გამოაცხვეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Lightly sauté vegetables. Layer lasagna sheets, vegetables and cheese. Bake at 180°C for 25-30 minutes. Serve freshly made.',
    ingredientsKa: ['ბოსტნეული (ყაბაყი, სტაფილო, ბროკოლი) - 120-150 გ', 'ყველი - 40-50 გ', 'ლაზანიას ფირფიტები - 3-4 ცალი'],
    ingredientsEn: ['Vegetables (zucchini, carrot, broccoli) - 120-150g', 'Cheese - 40-50g', 'Lasagna sheets - 3-4 pcs'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: ['gluten', 'dairy'],
  },
  {
    titleKa: 'ინდაურის კატლეტი',
    titleEn: 'Turkey Patty',
    descriptionKa: 'ინდაური ბლენდერით დაამუშავეთ. ყაბაყი გაატარეთ სახეხელაზე და შეუმატეთ. კატლეტები ჩამოაყალიბეთ. ზეთის მინიმალური რაოდენობით ოქროსფრამდე გამოაცხვეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Process turkey in a blender. Grate zucchini and add. Shape patties. Cook with minimal oil until golden. Serve freshly made.',
    ingredientsKa: ['ინდაური - 90-100 გ', 'ყაბაყი - 40-50 გ'],
    ingredientsEn: ['Turkey - 90-100g', 'Zucchini - 40-50g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ლობიოს ჩაშუშული',
    titleEn: 'Bean Stew',
    descriptionKa: 'ლობიო წინასწარ გაჟღენთეთ და მოხარშეთ. ბოსტნეული წვრილად დაჭერით. ოდნავ შეაცხვეთ, ლობიო და წყალი დაუმატეთ. 20-25 წუთი ჩაშუშეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Soak and cook beans in advance. Finely chop vegetables. Lightly sauté, add beans and water. Stew for 20-25 minutes. Serve freshly made.',
    ingredientsKa: ['ლობიო - 60-70 გ', 'ბოსტნეული (სტაფილო, ყაბაყი) - 70-80 გ'],
    ingredientsEn: ['Beans - 60-70g', 'Vegetables (carrot, zucchini) - 70-80g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის სუპი',
    titleEn: 'Vegetable Soup',
    descriptionKa: 'კარტოფილი, სტაფილო და ბროკოლი წვრილ ნაჭრებად დაჭერით. წყალში 20-25 წუთი მოხარშეთ. ნახევარი ბლენდერით დამუშავეთ, ნახევარი ნაჭრებად დატოვეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Cut potato, carrot and broccoli into small pieces. Cook in water for 20-25 minutes. Blend half, leave half as pieces. Serve freshly made.',
    ingredientsKa: ['კარტოფილი - 60 გ', 'სტაფილო - 50 გ', 'ბროკოლი - 50 გ'],
    ingredientsEn: ['Potato - 60g', 'Carrot - 50g', 'Broccoli - 50g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: [],
  },
  {
    titleKa: 'ოჯახური სადილის თეფში',
    titleEn: 'Family Lunch Plate',
    descriptionKa: 'ცილა (ქათამი, კვერცხი ან ლობიო), მარცვლეული (ბრინჯი ან მაკარონი) და ბოსტნეული (სასეზონო) ერთ თეფშზე მოაწყვეთ. ყოველი კომპონენტი ცალ-ცალკე მოამზადეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Arrange protein (chicken, egg or beans), grain (rice or pasta) and vegetables (seasonal) on one plate. Prepare each component separately. Serve freshly made.',
    ingredientsKa: ['ცილა (ქათამი/კვერცხი/ლობიო) - 70-80 გ', 'მარცვლეული (ბრინჯი/მაკარონი) - 40-50 გ', 'ბოსტნეული - 60-70 გ'],
    ingredientsEn: ['Protein (chicken/egg/beans) - 70-80g', 'Grain (rice/pasta) - 40-50g', 'Vegetables - 60-70g'],
    ageGroups: ['FROM_24'], mealType: 'LUNCH', allergens: [],
  },
];

async function main() {
  console.log('🌱 Seeding 40 lunch recipes...');

  let created = 0;
  let skipped = 0;

  for (const r of recipes) {
    const existing = await prisma.dish.findFirst({
      where: { titleKa: r.titleKa, mealType: 'LUNCH' },
    });

    if (existing) {
      skipped++;
      console.log(`  ⏭  Already exists: ${r.titleKa}`);
      continue;
    }

    await prisma.dish.create({
      data: {
        titleKa: r.titleKa,
        titleEn: r.titleEn,
        descriptionKa: r.descriptionKa,
        descriptionEn: r.descriptionEn,
        ingredientsKa: r.ingredientsKa,
        ingredientsEn: r.ingredientsEn,
        ageGroups: r.ageGroups as any,
        mealType: r.mealType as any,
        allergens: r.allergens || [],
      },
    });
    created++;
    console.log(`  ✓  ${r.titleKa}`);
  }

  console.log(`\n✅ Done: ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
