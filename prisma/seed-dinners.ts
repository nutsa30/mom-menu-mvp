import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const recipes = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6-8 MONTHS (FROM_6) — DINNER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ბროკოლის პიურე',
    titleEn: 'Broccoli Puree',
    descriptionKa: 'ბროკოლი ყვავილებად გაყავით. ორთქლზე ან წყალში 8-10 წუთი მოხარშეთ სრულ დარბილებამდე. ბლენდერით გახეხეთ. საჭიროების შემთხვევაში ოდნავ მოხარშული წყალი დაუმატეთ სასურველი კონსისტენციისთვის.',
    descriptionEn: 'Divide broccoli into florets. Steam or boil for 8-10 minutes until fully soft. Blend until smooth. Add a little cooking water if needed for desired consistency.',
    ingredientsKa: ['ბროკოლი - 80-100 გ', 'წყალი - საჭიროებისამებრ'],
    ingredientsEn: ['Broccoli - 80-100g', 'Water - as needed'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ყვავილოვანი კომბოსტოს პიურე',
    titleEn: 'Cauliflower Puree',
    descriptionKa: 'ყვავილოვანი კომბოსტო ყვავილებად გაყავით. ორთქლზე 10-12 წუთი მოხარშეთ სრულ დარბილებამდე. ბლენდერით ძალიან გლუვ პიურედ გახეხეთ. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Divide cauliflower into florets. Steam for 10-12 minutes until fully soft. Blend into a very smooth puree. Serve slightly cooled.',
    ingredientsKa: ['ყვავილოვანი კომბოსტო - 80-100 გ'],
    ingredientsEn: ['Cauliflower - 80-100g'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ავოკადოს პიურე',
    titleEn: 'Avocado Puree',
    descriptionKa: 'მწიფე ავოკადო გახეხეთ, კურკა ამოიღეთ. ჩანგლით ძალიან გლუვად დაჭყლიტეთ. ახლად მომზადებული მიეცით — ავოკადო სწრაფად შავდება. გათბობა საჭირო არ არის.',
    descriptionEn: 'Peel ripe avocado, remove pit. Mash very smoothly with fork. Serve freshly made — avocado darkens quickly. No heating needed.',
    ingredientsKa: ['ავოკადო - 1/3 - 1/2 ცალი'],
    ingredientsEn: ['Avocado - 1/3 - 1/2'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'კარტოფილი და ყაბაყი',
    titleEn: 'Potato and Zucchini',
    descriptionKa: 'კარტოფილი და ყაბაყი გაფცქვენით, კუბიკებად დაჭერით. ორთქლზე ან წყალში 12-15 წუთი მოხარშეთ. ბლენდერით გლუვ პიურედ გახეხეთ. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel potato and zucchini, cut into cubes. Steam or boil for 12-15 minutes. Blend into a smooth puree. Serve slightly cooled.',
    ingredientsKa: ['კარტოფილი - 50 გ', 'ყაბაყი - 50 გ'],
    ingredientsEn: ['Potato - 50g', 'Zucchini - 50g'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'სტაფილო და გოგრა',
    titleEn: 'Carrot and Pumpkin',
    descriptionKa: 'სტაფილო და გოგრა გაფცქვენით, კუბიკებად დაჭერით. ორთქლზე 15 წუთი მოხარშეთ სრულ დარბილებამდე. ბლენდერით გლუვ ნარინჯისფერ პიურედ გახეხეთ. ბეტა-კაროტინით მდიდარია.',
    descriptionEn: 'Peel carrot and pumpkin, cut into cubes. Steam for 15 minutes until fully soft. Blend into a smooth orange puree. Rich in beta-carotene.',
    ingredientsKa: ['სტაფილო - 50 გ', 'გოგრა - 50 გ'],
    ingredientsEn: ['Carrot - 50g', 'Pumpkin - 50g'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'მსხლის ფაფა',
    titleEn: 'Pear Puree',
    descriptionKa: 'მსხალი გაფცქვენით, გული ამოიღეთ, კუბიკებად დაჭერით. ორთქლზე 5-7 წუთი მოხარშეთ. ბლენდერით გლუვ ფაფად გახეხეთ. ახლად მომზადებული ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel pear, remove core, cut into cubes. Steam for 5-7 minutes. Blend into a smooth puree. Serve freshly made, slightly cooled.',
    ingredientsKa: ['მსხალი - 1 საშუალო'],
    ingredientsEn: ['Pear - 1 medium'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ვაშლის ფაფა',
    titleEn: 'Apple Puree',
    descriptionKa: 'ვაშლი გაფცქვენით, გული ამოიღეთ, კუბიკებად დაჭერით. ორთქლზე 8-10 წუთი მოხარშეთ. ბლენდერით გლუვ ფაფად გახეხეთ. ახლად მომზადებული ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel apple, remove core, cut into cubes. Steam for 8-10 minutes. Blend into a smooth puree. Serve freshly made, slightly cooled.',
    ingredientsKa: ['ვაშლი - 1 საშუალო'],
    ingredientsEn: ['Apple - 1 medium'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ტკბილი კარტოფილის პიურე',
    titleEn: 'Sweet Potato Puree',
    descriptionKa: 'ტკბილი კარტოფილი გაფცქვენით, კუბიკებად დაჭერით. ორთქლზე 12-15 წუთი მოხარშეთ სრულ დარბილებამდე. ბლენდერით ძალიან გლუვ ნარინჯისფერ პიურედ გახეხეთ.',
    descriptionEn: 'Peel sweet potato, cut into cubes. Steam for 12-15 minutes until fully soft. Blend into a very smooth orange puree.',
    ingredientsKa: ['ტკბილი კარტოფილი - 100 გ'],
    ingredientsEn: ['Sweet potato - 100g'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბანანი და ავოკადო',
    titleEn: 'Banana and Avocado',
    descriptionKa: 'ბანანი და ავოკადო ჩანგლით ძალიან გლუვად ერთად დაჭყლიტეთ. ახლად მომზადებული მიეცით. კალიუმისა და ჯანსაღი ცხიმების შესანიშნავი კომბინაციაა.',
    descriptionEn: 'Mash banana and avocado together very smoothly with fork. Serve freshly made. An excellent combination of potassium and healthy fats.',
    ingredientsKa: ['ბანანი - 1/2 ცალი', 'ავოკადო - 1/4 ცალი'],
    ingredientsEn: ['Banana - 1/2', 'Avocado - 1/4'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის პიურე',
    titleEn: 'Vegetable Puree',
    descriptionKa: 'სტაფილო, ყაბაყი და კარტოფილი გაფცქვენით, კუბიკებად დაჭერით. ერთად ორთქლზე 15 წუთი მოხარშეთ. ბლენდერით გლუვ პიურედ გახეხეთ. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel carrot, zucchini and potato, cut into cubes. Steam together for 15 minutes. Blend into a smooth puree. Serve slightly cooled.',
    ingredientsKa: ['სტაფილო - 40 გ', 'ყაბაყი - 40 გ', 'კარტოფილი - 40 გ'],
    ingredientsEn: ['Carrot - 40g', 'Zucchini - 40g', 'Potato - 40g'],
    ageGroups: ['FROM_6'], mealType: 'DINNER', allergens: [],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9-11 MONTHS (FROM_9) — DINNER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ბოსტნეულის ომლეტი',
    titleEn: 'Vegetable Omelette',
    descriptionKa: 'ბროკოლი და სტაფილო ორთქლზე ოდნავ მოხარშეთ. კვერცხი ავურიეთ, ბოსტნეული შეუმატეთ. ზეთის მინიმალური რაოდენობით გამოაცხვეთ. ასაკისთვის უსაფრთხო ზომის ნაჭრებად მიეცით.',
    descriptionEn: 'Lightly steam broccoli and carrot. Beat egg and add vegetables. Cook with minimal oil. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['კვერცხი - 1 ცალი', 'ბროკოლი - 30 გ', 'სტაფილო - 30 გ'],
    ingredientsEn: ['Egg - 1', 'Broccoli - 30g', 'Carrot - 30g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: ['egg'],
  },
  {
    titleKa: 'ავოკადო და კვერცხი',
    titleEn: 'Avocado and Egg',
    descriptionKa: 'კვერცხი მოჩლუნგებულ ან მომზადებულ სახით მოხარშეთ. ავოკადო ჩანგლით ოდნავ დაჭყლიტეთ. ორივე ცალ-ცალკე მიეცით. ასაკისთვის უსაფრთხო ზომის ნაჭრებად.',
    descriptionEn: 'Cook egg scrambled or hard-boiled. Lightly mash avocado with fork. Serve both separately in age-appropriate sized pieces.',
    ingredientsKa: ['ავოკადო - 1/4 ცალი', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Avocado - 1/4', 'Egg - 1'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: ['egg'],
  },
  {
    titleKa: 'ქათამი და ყაბაყი',
    titleEn: 'Chicken and Zucchini',
    descriptionKa: 'ქათმის ფილე ორთქლზე ან ბულიონში მოხარშეთ. ყაბაყი ასევე ორთქლზე დაარბილეთ. ქათამი ბოჭკოებად დაჭყლიტეთ, ყაბაყი კუბიკებად დაჭერით. ასაკისთვის უსაფრთხო ზომის ნაჭრებად მიეცით.',
    descriptionEn: 'Steam or boil chicken fillet in broth. Also soften zucchini by steaming. Shred chicken into fibers, cut zucchini into cubes. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ქათამი - 60-80 გ', 'ყაბაყი - 60 გ'],
    ingredientsEn: ['Chicken - 60-80g', 'Zucchini - 60g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ოსპის პიურე',
    titleEn: 'Lentil Puree',
    descriptionKa: 'წითელი ოსპი კარგად გარეცხეთ. სტაფილოსთან ერთად ორჯერ ადუღეთ. 20-25 წუთი მოხარშეთ სრულ დარბილებამდე. ბლენდერით გლუვ პიურედ გახეხეთ.',
    descriptionEn: 'Rinse red lentils well. Bring to boil twice with carrot. Cook for 20-25 minutes until fully soft. Blend into a smooth puree.',
    ingredientsKa: ['წითელი ოსპი - 50 გ', 'სტაფილო - 40 გ'],
    ingredientsEn: ['Red lentils - 50g', 'Carrot - 40g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'კარტოფილი და ბროკოლი',
    titleEn: 'Potato and Broccoli',
    descriptionKa: 'კარტოფილი გაფცქვენით, კუბიკებად დაჭერით. ბროკოლი ყვავილებად გაყავით. ერთად ორთქლზე 12-15 წუთი მოხარშეთ. ბლენდერით ან ჩანგლით ოდნავ გახეხეთ. ასაკისთვის უსაფრთხო ტექსტურით მიეცით.',
    descriptionEn: 'Peel potato, cut into cubes. Divide broccoli into florets. Steam together for 12-15 minutes. Blend or mash slightly with fork. Serve with age-appropriate texture.',
    ingredientsKa: ['კარტოფილი - 60 გ', 'ბროკოლი - 60 გ'],
    ingredientsEn: ['Potato - 60g', 'Broccoli - 60g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ინდაური და გოგრა',
    titleEn: 'Turkey and Pumpkin',
    descriptionKa: 'ინდაურის ფილე ორთქლზე ან ბულიონში მოხარშეთ. გოგრა კუბიკებად დაჭერით, ორთქლზე 15 წუთი დაარბილეთ. ინდაური ბოჭკოებად დაჭყლიტეთ. ასაკისთვის უსაფრთხო ზომის ნაჭრებად მიეცით.',
    descriptionEn: 'Steam or boil turkey fillet in broth. Cut pumpkin into cubes and soften by steaming for 15 minutes. Shred turkey into fibers. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ინდაური - 60-80 გ', 'გოგრა - 60 გ'],
    ingredientsEn: ['Turkey - 60-80g', 'Pumpkin - 60g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბრინჯი ბოსტნეულით',
    titleEn: 'Rice with Vegetables',
    descriptionKa: 'ბრინჯი კარგად მოხარშეთ, სანამ ძალიან რბილი გახდება. სტაფილო და ყაბაყი ბრინჯთან ერთად ან ცალ-ცალკე ორთქლზე მოხარშეთ. ერთად ოდნავ გახეხეთ. ასაკისთვის უსაფრთხო ტექსტურით მიეცით.',
    descriptionEn: 'Cook rice until very soft. Steam carrot and zucchini with rice or separately. Mash together slightly. Serve with age-appropriate texture.',
    ingredientsKa: ['ბრინჯი - 40-50 გ', 'სტაფილო - 30 გ', 'ყაბაყი - 30 გ'],
    ingredientsEn: ['Rice - 40-50g', 'Carrot - 30g', 'Zucchini - 30g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ყვავილოვანი კომბოსტო და ქათამი',
    titleEn: 'Cauliflower and Chicken',
    descriptionKa: 'ქათმის ფილე ბულიონში ან ორთქლზე მოხარშეთ. ყვავილოვანი კომბოსტო ყვავილებად გაყავით, ორთქლზე 10 წუთი დაარბილეთ. ქათამი ბოჭკოებად დაჭყლიტეთ, ბოსტნეული კუბიკებად. ერთად მიეცით.',
    descriptionEn: 'Cook chicken fillet in broth or steam. Divide cauliflower into florets, soften by steaming for 10 minutes. Shred chicken into fibers, cut vegetables into cubes. Serve together.',
    ingredientsKa: ['ყვავილოვანი კომბოსტო - 70 გ', 'ქათამი - 60-70 გ'],
    ingredientsEn: ['Cauliflower - 70g', 'Chicken - 60-70g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ტკბილი კარტოფილი და ოსპი',
    titleEn: 'Sweet Potato and Lentils',
    descriptionKa: 'ოსპი გარეცხეთ, 20 წუთი მოხარშეთ. ტკბილი კარტოფილი გაფცქვენით, კუბიკებად დაჭერით, ორთქლზე 12 წუთი მოხარშეთ. ერთად ოდნავ გახეხეთ. ასაკისთვის უსაფრთხო ტექსტურით მიეცით.',
    descriptionEn: 'Rinse lentils and cook for 20 minutes. Peel sweet potato, cut into cubes, steam for 12 minutes. Mash together slightly. Serve with age-appropriate texture.',
    ingredientsKa: ['ტკბილი კარტოფილი - 70 გ', 'ოსპი - 40 გ'],
    ingredientsEn: ['Sweet potato - 70g', 'Lentils - 40g'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის გუფთა',
    titleEn: 'Vegetable Meatballs',
    descriptionKa: 'ბოსტნეული (სტაფილო, ყაბაყი, ბარდა) წვრილად დაჭერით. კვერცხი ავურიეთ, ბოსტნეული შეუმატეთ. პატარა გუფთები ჩამოაყალიბეთ. ღუმელში 180°C-ზე 18-20 წუთი გამოაცხვეთ.',
    descriptionEn: 'Finely chop vegetables (carrot, zucchini, peas). Beat egg and add vegetables. Shape small balls. Bake in oven at 180°C for 18-20 minutes.',
    ingredientsKa: ['ბოსტნეული (სტაფილო/ყაბაყი) - 100 გ', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Vegetables (carrot/zucchini) - 100g', 'Egg - 1'],
    ageGroups: ['FROM_9'], mealType: 'DINNER', allergens: ['egg'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12-18 MONTHS (FROM_12) — DINNER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ქათმის გუფთა ბოსტნეულით',
    titleEn: 'Chicken Meatballs with Vegetables',
    descriptionKa: 'ქათმის ხორცი ბლენდერში ან ხორცსაკეპ მანქანაში გახეხეთ. სტაფილო და ყაბაყი წვრილად გახეხეთ, ხორცს შეუმატეთ. პატარა გუფთები ჩამოაყალიბეთ. ორთქლზე 15-18 წუთი მოხარშეთ ან ღუმელში გამოაცხვეთ.',
    descriptionEn: 'Mince chicken in blender or meat grinder. Grate carrot and zucchini finely and add to meat. Shape small balls. Steam for 15-18 minutes or bake in oven.',
    ingredientsKa: ['ქათმის ხორცი - 100 გ', 'სტაფილო - 40 გ', 'ყაბაყი - 40 გ'],
    ingredientsEn: ['Chicken meat - 100g', 'Carrot - 40g', 'Zucchini - 40g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ორაგული და ბროკოლი',
    titleEn: 'Salmon and Broccoli',
    descriptionKa: 'ორაგული ორთქლზე ან ბულიონში 10-12 წუთი მოხარშეთ. ბროკოლი ყვავილებად გაყავით, ორთქლზე 6-8 წუთი დაარბილეთ. ცილებით, ომეგა-3-ითა და ვიტამინ C-ით მდიდარი ვახშამია.',
    descriptionEn: 'Steam or cook salmon in broth for 10-12 minutes. Divide broccoli into florets, soften by steaming for 6-8 minutes. A dinner rich in protein, omega-3 and vitamin C.',
    ingredientsKa: ['ორაგული - 80-100 გ', 'ბროკოლი - 80 გ'],
    ingredientsEn: ['Salmon - 80-100g', 'Broccoli - 80g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: ['fish'],
  },
  {
    titleKa: 'ბოსტნეულის პილაფი',
    titleEn: 'Vegetable Pilaf',
    descriptionKa: 'ბრინჯი გარეცხეთ. სტაფილო წვრილად გახეხეთ, ბარდა დაუმატეთ. ბრინჯი და ბოსტნეული ბულიონში ან წყალში 20 წუთი ოდნავ ადუღეთ. ოდნავ გაგრილებული ასაკისთვის უსაფრთხო ზომებად მიეცით.',
    descriptionEn: 'Wash rice. Grate carrot finely and add peas. Simmer rice and vegetables in broth or water for 20 minutes. Serve slightly cooled in age-appropriate portions.',
    ingredientsKa: ['ბრინჯი - 50-60 გ', 'სტაფილო - 40 გ', 'ბარდა - 30 გ'],
    ingredientsEn: ['Rice - 50-60g', 'Carrot - 40g', 'Peas - 30g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ინდაური და გოგრა',
    titleEn: 'Turkey and Pumpkin',
    descriptionKa: 'ინდაურის ფილე ბულიონში ან ორთქლზე მოხარშეთ. გოგრა კუბიკებად დაჭერით, ორთქლზე 15 წუთი დაარბილეთ. ინდაური ბოჭკოებად ან კუბიკებად. ასაკისთვის უსაფრთხო ზომის ნაჭრებად მიეცით.',
    descriptionEn: 'Cook turkey fillet in broth or steam. Cut pumpkin into cubes and soften by steaming for 15 minutes. Serve turkey in fibers or cubes in age-appropriate sized pieces.',
    ingredientsKa: ['ინდაური - 80-100 გ', 'გოგრა - 80 გ'],
    ingredientsEn: ['Turkey - 80-100g', 'Pumpkin - 80g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ოსპის კატლეტები',
    titleEn: 'Lentil Cutlets',
    descriptionKa: 'ოსპი 25 წუთი მოხარშეთ სრულ დარბილებამდე. ბლენდერით ოდნავ გახეხეთ. კვერცხი დაუმატეთ, ჩამოაყალიბეთ. ღუმელში 180°C-ზე 20 წუთი გამოაცხვეთ. ასაკისთვის უსაფრთხო ზომებად მიეცით.',
    descriptionEn: 'Cook lentils for 25 minutes until fully soft. Blend slightly. Add egg and shape. Bake in oven at 180°C for 20 minutes. Serve in age-appropriate portions.',
    ingredientsKa: ['ოსპი - 70-80 გ', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Lentils - 70-80g', 'Egg - 1'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: ['egg'],
  },
  {
    titleKa: 'ყვავილოვანი კომბოსტოს გრატენი',
    titleEn: 'Cauliflower Gratin',
    descriptionKa: 'ყვავილოვანი კომბოსტო ყვავილებად გაყავით, ორთქლზე 8 წუთი ოდნავ დაარბილეთ. საცხობ ფირფიტაში დაალაგეთ. პასტერიზებული ყველი ზემოდან გადაიფხაქეთ. ღუმელში 180°C-ზე 15 წუთი გამოაცხვეთ.',
    descriptionEn: 'Divide cauliflower into florets, soften slightly by steaming for 8 minutes. Arrange in baking dish. Grate pasteurized cheese on top. Bake in oven at 180°C for 15 minutes.',
    ingredientsKa: ['ყვავილოვანი კომბოსტო - 150 გ', 'პასტერიზებული ყველი - 30-40 გ'],
    ingredientsEn: ['Cauliflower - 150g', 'Pasteurized cheese - 30-40g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: ['dairy'],
  },
  {
    titleKa: 'ქათამი და ტკბილი კარტოფილი',
    titleEn: 'Chicken and Sweet Potato',
    descriptionKa: 'ქათამი ბულიონში ან ორთქლზე მოხარშეთ. ტკბილი კარტოფილი გაფცქვენით, კუბიკებად დაჭერით, ორთქლზე 12 წუთი. ქათამი ბოჭკოებად ან კუბიკებად. ასაკისთვის უსაფრთხო ზომებად მიეცით.',
    descriptionEn: 'Cook chicken in broth or steam. Peel sweet potato, cut into cubes, steam for 12 minutes. Serve chicken in fibers or cubes in age-appropriate portions.',
    ingredientsKa: ['ქათამი - 80-100 გ', 'ტკბილი კარტოფილი - 100 გ'],
    ingredientsEn: ['Chicken - 80-100g', 'Sweet potato - 100g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის სუპი',
    titleEn: 'Vegetable Soup',
    descriptionKa: 'კარტოფილი, სტაფილო და ყაბაყი გაფცქვენით, კუბიკებად დაჭერით. ბულიონში ან წყალში 20 წუთი მოხარშეთ. ბლენდერით გლუვ ან ნახევრად გლუვ სუპად გახეხეთ. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel potato, carrot and zucchini, cut into cubes. Cook in broth or water for 20 minutes. Blend into smooth or semi-smooth soup. Serve slightly cooled.',
    ingredientsKa: ['კარტოფილი - 60 გ', 'სტაფილო - 50 გ', 'ყაბაყი - 50 გ'],
    ingredientsEn: ['Potato - 60g', 'Carrot - 50g', 'Zucchini - 50g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბრინჯი და ავოკადო',
    titleEn: 'Rice and Avocado',
    descriptionKa: 'ბრინჯი კარგად მოხარშეთ, სანამ ძალიან რბილი გახდება. ავოკადო გახეხეთ, ჩანგლით ოდნავ დაჭყლიტეთ. ბრინჯი ოდნავ გაგრილებულს ავოკადო ზემოდან დაუმატეთ.',
    descriptionEn: 'Cook rice until very soft. Peel avocado and mash slightly with fork. Add avocado on top of slightly cooled rice.',
    ingredientsKa: ['ბრინჯი - 50-60 გ', 'ავოკადო - 1/4 ცალი'],
    ingredientsEn: ['Rice - 50-60g', 'Avocado - 1/4'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'კვერცხის მაფინი ბოსტნეულით',
    titleEn: 'Egg Muffin with Vegetables',
    descriptionKa: 'ბროკოლი და სტაფილო წვრილად გახეხეთ ან დაჭერით. კვერცხი ავურიეთ, ბოსტნეული შეუმატეთ. მინი მაფინის ფორმებში ჩაასხით. 180°C-ზე 15-18 წუთი გამოაცხვეთ. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Finely grate or chop broccoli and carrot. Beat egg and add vegetables. Pour into mini muffin forms. Bake at 180°C for 15-18 minutes. Serve slightly cooled.',
    ingredientsKa: ['კვერცხი - 2 ცალი', 'ბროკოლი - 40 გ', 'სტაფილო - 40 გ'],
    ingredientsEn: ['Egg - 2', 'Broccoli - 40g', 'Carrot - 40g'],
    ageGroups: ['FROM_12'], mealType: 'DINNER', allergens: ['egg'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 18-36 MONTHS (FROM_24) — DINNER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ქათმის შნიცელი ბოსტნეულით',
    titleEn: 'Chicken Schnitzel with Vegetables',
    descriptionKa: 'ქათმის ფილე გაბრტყელეთ. ორთქლზე მოხარშეთ ან ზეთის მინიმალური რაოდენობით შეწვით. ბროკოლი და სტაფილო ორთქლზე ოდნავ მოხარშეთ. ასაკისთვის უსაფრთხო ზომის ნაჭრებად მიეცით.',
    descriptionEn: 'Flatten chicken fillet. Steam or cook with minimal oil. Lightly steam broccoli and carrot. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ქათმის ფილე - 100-120 გ', 'ბროკოლი - 60 გ', 'სტაფილო - 50 გ'],
    ingredientsEn: ['Chicken fillet - 100-120g', 'Broccoli - 60g', 'Carrot - 50g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ორაგული ბრინჯით',
    titleEn: 'Salmon with Rice',
    descriptionKa: 'ორაგული ორთქლზე ან ბულიონში 10-12 წუთი მოხარშეთ. ბრინჯი ცალ-ცალკე კარგად მოხარშეთ. ერთ თეფშზე მოაწყვეთ. ომეგა-3 ცხიმოვანი მჟავების შესანიშნავი წყაროა.',
    descriptionEn: 'Steam or cook salmon in broth for 10-12 minutes. Cook rice separately until done. Arrange on one plate. An excellent source of omega-3 fatty acids.',
    ingredientsKa: ['ორაგული - 100-120 გ', 'ბრინჯი - 60-70 გ'],
    ingredientsEn: ['Salmon - 100-120g', 'Rice - 60-70g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: ['fish'],
  },
  {
    titleKa: 'ინდაურის კატლეტი',
    titleEn: 'Turkey Cutlet',
    descriptionKa: 'ინდაური ბლენდერში გახეხეთ. ყაბაყი წვრილად გახეხეთ, წყალი გამოწუროთ, ხორცს შეუმატეთ. კატლეტები ჩამოაყალიბეთ. ორთქლზე 15-18 წუთი ან ღუმელში 180°C-ზე 20 წუთი მოხარშეთ.',
    descriptionEn: 'Blend turkey. Grate zucchini finely, squeeze out water and add to meat. Shape cutlets. Steam for 15-18 minutes or bake at 180°C for 20 minutes.',
    ingredientsKa: ['ინდაური - 120-150 გ', 'ყაბაყი - 60 გ'],
    ingredientsEn: ['Turkey - 120-150g', 'Zucchini - 60g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის ლაზანია',
    titleEn: 'Vegetable Lasagna',
    descriptionKa: 'ბოსტნეული (სტაფილო, ყაბაყი, ბარდა) წვრილად დაჭერით. ლაზანიის ფენები ბოსტნეულისა და ყველის ფენებს მოარიდეთ. ღუმელში 180°C-ზე 25-30 წუთი გამოაცხვეთ. ოდნავ გაგრილებული ასაკისთვის უსაფრთხო ზომებად მიეცით.',
    descriptionEn: 'Finely chop vegetables (carrot, zucchini, peas). Layer lasagna sheets with vegetable and cheese layers. Bake in oven at 180°C for 25-30 minutes. Serve slightly cooled in age-appropriate portions.',
    ingredientsKa: ['ბოსტნეული (სტაფილო/ყაბაყი/ბარდა) - 150 გ', 'ყველი - 50 გ'],
    ingredientsEn: ['Vegetables (carrot/zucchini/peas) - 150g', 'Cheese - 50g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: ['dairy', 'gluten'],
  },
  {
    titleKa: 'პასტა ტომატის სოუსით',
    titleEn: 'Pasta with Tomato Sauce',
    descriptionKa: 'მაკარონი ალ დენტეზე ოდნავ მეტ ხანს მოხარშეთ, სანამ ძალიან რბილი გახდება. ტომატი პიურედ გადააქციეთ, ოდნავ ჩააბოლეთ. ნაყოფი ანუ სოუსი პასტას დაასხით.',
    descriptionEn: 'Cook pasta slightly longer than al dente until very soft. Puree tomato and lightly simmer. Pour sauce over pasta.',
    ingredientsKa: ['მაკარონი - 60-70 გ', 'ტომატი - 100 გ'],
    ingredientsEn: ['Pasta - 60-70g', 'Tomato - 100g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: ['gluten'],
  },
  {
    titleKa: 'ლობიოს ჩაშუშული',
    titleEn: 'Bean Stew',
    descriptionKa: 'ლობიო წინასწარ გაჟღენთეთ, 40-50 წუთი მოხარშეთ. ბოსტნეული (სტაფილო, ბოლოკი, პომიდორი) წვრილ კუბიკებად დაჭერით, ჩააშუშეთ. ლობიო ბოსტნეულს შეუმატეთ, 10 წუთი ერთად მოხარშეთ.',
    descriptionEn: 'Soak beans beforehand, cook for 40-50 minutes. Finely dice vegetables (carrot, turnip, tomato) and stew. Add beans to vegetables and cook together for 10 minutes.',
    ingredientsKa: ['ლობიო - 80 გ (მოხარშული)', 'ბოსტნეული (სტაფილო/ბოლოკი) - 100 გ'],
    ingredientsEn: ['Beans - 80g (cooked)', 'Vegetables (carrot/turnip) - 100g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ბოსტნეულის სუპი',
    titleEn: 'Vegetable Soup',
    descriptionKa: 'კარტოფილი, სტაფილო და ბროკოლი გაფცქვენით, კუბიკებად დაჭერით. ბულიონში 20 წუთი მოხარშეთ. ბლენდერით ნახევრად გახეხეთ ან მთლიანად დატოვეთ. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel potato, carrot and broccoli, cut into cubes. Cook in broth for 20 minutes. Blend partially or leave chunky. Serve slightly cooled.',
    ingredientsKa: ['კარტოფილი - 60 გ', 'სტაფილო - 50 გ', 'ბროკოლი - 60 გ'],
    ingredientsEn: ['Potato - 60g', 'Carrot - 50g', 'Broccoli - 60g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'საქონლის ხორცის გუფთა',
    titleEn: 'Beef Meatballs',
    descriptionKa: 'საქონლის ხორცი ბლენდერში ან ხორცსაკეპ მანქანაში გახეხეთ. ბრინჯი ოდნავ მოხარშეთ, შეუმატეთ. პატარა გუფთები ჩამოაყალიბეთ. ბულიონში ან ორთქლზე 20-25 წუთი მოხარშეთ.',
    descriptionEn: 'Mince beef in blender or meat grinder. Lightly cook rice and add. Shape small balls. Cook in broth or steam for 20-25 minutes.',
    ingredientsKa: ['საქონლის ხორცი - 120-150 გ', 'ბრინჯი - 30-40 გ'],
    ingredientsEn: ['Beef - 120-150g', 'Rice - 30-40g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ქათმის პილაფი',
    titleEn: 'Chicken Pilaf',
    descriptionKa: 'ქათამი კუბიკებად დაჭერით, ოდნავ შეწვით. ბრინჯი და სტაფილო დაუმატეთ. ბულიონი ჩაასხით, სახე ახურეთ. 20-25 წუთი ოდნავ ადუღეთ. ოდნავ გაგრილებული ასაკისთვის უსაფრთხო ზომებად მიეცით.',
    descriptionEn: 'Cut chicken into cubes and lightly fry. Add rice and carrot. Pour in broth and cover. Simmer for 20-25 minutes. Serve slightly cooled in age-appropriate portions.',
    ingredientsKa: ['ქათამი - 100-120 გ', 'ბრინჯი - 60-70 გ', 'სტაფილო - 50 გ'],
    ingredientsEn: ['Chicken - 100-120g', 'Rice - 60-70g', 'Carrot - 50g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: [],
  },
  {
    titleKa: 'ოჯახური ვახშმის თეფში',
    titleEn: 'Family Dinner Plate',
    descriptionKa: 'ბალანსირებული ვახშამი: ცილა (ქათამი/ინდაური/ორაგული/კვერცხი), ბოსტნეული (ბრინჯი/ბარდა/ბროკოლი) და მარცვლეული (ბრინჯი/მაკარონი) ასაკისთვის უსაფრთხო ზომებად ერთ თეფშზე. ოჯახთან ერთად მიეცით.',
    descriptionEn: 'A balanced dinner: protein (chicken/turkey/salmon/egg), vegetables (zucchini/peas/broccoli) and grains (rice/pasta) in age-appropriate portions on one plate. Serve together with the family.',
    ingredientsKa: ['ცილა (ქათამი/ინდაური/ორაგული) - 100 გ', 'ბოსტნეული - 80 გ', 'მარცვლეული (ბრინჯი/მაკარონი) - 60 გ'],
    ingredientsEn: ['Protein (chicken/turkey/salmon) - 100g', 'Vegetables - 80g', 'Grains (rice/pasta) - 60g'],
    ageGroups: ['FROM_24'], mealType: 'DINNER', allergens: [],
  },
];

async function main() {
  console.log('🌱 Seeding 40 dinner recipes...');

  let created = 0;
  let skipped = 0;

  for (const r of recipes) {
    const existing = await prisma.dish.findFirst({
      where: { titleKa: r.titleKa, mealType: 'DINNER' },
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
