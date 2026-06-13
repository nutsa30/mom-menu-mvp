import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const recipes = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6-8 MONTHS (FROM_6) — SNACK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ბანანის ჩხირები',
    titleEn: 'Banana Sticks',
    descriptionKa: 'მწიფე ბანანი გაფცქვენით და გრძელ ჩხირებად დაჭერით. ბავშვი ხელით ადვილად მოიჭერს. BLW-სთვის იდეალურია, რადგან ბანანი ბუნებრივად რბილია.',
    descriptionEn: 'Peel ripe banana and cut into long sticks. Baby can easily grip by hand. Ideal for BLW as banana is naturally soft.',
    ingredientsKa: ['მწიფე ბანანი - 1/2 ცალი'],
    ingredientsEn: ['Ripe banana - 1/2'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ავოკადოს ნაჭრები',
    titleEn: 'Avocado Pieces',
    descriptionKa: 'მწიფე ავოკადო გაფცქვენით და გრძელ ნაჭრებად დაჭერით. ბუნებრივი ცხიმებით მდიდარი სნექია. ახლად მომზადებული მიეცით — ავოკადო სწრაფად შავდება.',
    descriptionEn: 'Peel ripe avocado and cut into long pieces. A snack rich in natural fats. Serve freshly prepared — avocado darkens quickly.',
    ingredientsKa: ['რბილი ავოკადო - 1/4 ცალი'],
    ingredientsEn: ['Soft avocado - 1/4'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ორთქლზე მომზადებული მსხალი',
    titleEn: 'Steamed Pear',
    descriptionKa: 'მსხალი გაფცქვენით, გული ამოიღეთ და ორთქლზე 5-7 წუთი მოხარშეთ, სანამ რბილი გახდება. გრძელ ჩხირებად დაჭერით. მიეცით ოდნავ გაგრილებული.',
    descriptionEn: 'Peel pear, remove core and steam for 5-7 minutes until soft. Cut into long sticks. Serve slightly cooled.',
    ingredientsKa: ['მსხალი - 1/2 ცალი'],
    ingredientsEn: ['Pear - 1/2'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ორთქლზე მომზადებული ვაშლი',
    titleEn: 'Steamed Apple',
    descriptionKa: 'ვაშლი გაფცქვენით, გული ამოიღეთ და ორთქლზე 7-10 წუთი მოხარშეთ სრულ დარბილებამდე. გრძელ ჩხირებად დაჭერით. მიეცით ოდნავ გაგრილებული.',
    descriptionEn: 'Peel apple, remove core and steam for 7-10 minutes until fully soft. Cut into long sticks. Serve slightly cooled.',
    ingredientsKa: ['ვაშლი - 1/2 ცალი'],
    ingredientsEn: ['Apple - 1/2'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ატმის ნაჭრები',
    titleEn: 'Peach Pieces',
    descriptionKa: 'მწიფე ატამი გაფცქვენით, კურკა ამოიღეთ. თუ ძალიან რბილია, ახალი მიეცით. თუ მაგარია, ორთქლზე ოდნავ დაარბილეთ. გრძელ ნაჭრებად დაჭერით.',
    descriptionEn: 'Peel ripe peach and remove pit. If very soft, serve fresh. If firm, soften slightly by steaming. Cut into long pieces.',
    ingredientsKa: ['მწიფე ატამი - 1/2 ცალი'],
    ingredientsEn: ['Ripe peach - 1/2'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'მანგოს ჩხირები',
    titleEn: 'Mango Sticks',
    descriptionKa: 'მწიფე მანგო გაფცქვენით და გრძელ ჩხირებად დაჭერით. ვიტამინ C-ითა და A-ით მდიდარი სნექია. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Peel ripe mango and cut into long sticks. A snack rich in vitamin C and A. Serve freshly prepared.',
    ingredientsKa: ['მწიფე მანგო - 50-60 გ'],
    ingredientsEn: ['Ripe mango - 50-60g'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ტკბილი კარტოფილის ჩხირები',
    titleEn: 'Sweet Potato Sticks',
    descriptionKa: 'ტკბილი კარტოფილი გაფცქვენით და ჩხირებად დაჭერით. ორთქლზე 10-12 წუთი მოხარშეთ სრულ დარბილებამდე. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel sweet potato and cut into sticks. Steam for 10-12 minutes until fully soft. Serve slightly cooled.',
    ingredientsKa: ['ტკბილი კარტოფილი - 60-70 გ'],
    ingredientsEn: ['Sweet potato - 60-70g'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ბროკოლის ყვავილები',
    titleEn: 'Broccoli Florets',
    descriptionKa: 'ბროკოლი ყვავილებად გაყავით. ორთქლზე 5-7 წუთი მოხარშეთ — ძალიან რბილი, მაგრამ ფოთოლი კი არ უნდა გახდეს. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Divide broccoli into florets. Steam for 5-7 minutes — should be very soft but not mushy. Serve slightly cooled.',
    ingredientsKa: ['ბროკოლი - 60-70 გ'],
    ingredientsEn: ['Broccoli - 60-70g'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ყვავილოვანი კომბოსტო',
    titleEn: 'Cauliflower Florets',
    descriptionKa: 'ყვავილოვანი კომბოსტო ყვავილებად გაყავით. ორთქლზე 7-10 წუთი მოხარშეთ სრულ დარბილებამდე. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Divide cauliflower into florets. Steam for 7-10 minutes until fully soft. Serve slightly cooled.',
    ingredientsKa: ['ყვავილოვანი კომბოსტო - 60-70 გ'],
    ingredientsEn: ['Cauliflower - 60-70g'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'ავოკადო და ბანანი',
    titleEn: 'Avocado and Banana',
    descriptionKa: 'ავოკადო და ბანანი ჩანგლით ერთად დაჭყლიტეთ ან ცალ-ცალკე ჩხირებად დაჭერით. ჯანსაღი ცხიმებისა და კალიუმის შესანიშნავი წყაროა.',
    descriptionEn: 'Mash avocado and banana together with a fork, or cut separately into sticks. An excellent source of healthy fats and potassium.',
    ingredientsKa: ['ავოკადო - 1/4 ცალი', 'ბანანი - 1/4 ცალი'],
    ingredientsEn: ['Avocado - 1/4', 'Banana - 1/4'],
    ageGroups: ['FROM_6'], mealType: 'SNACK', allergens: [],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9-11 MONTHS (FROM_9) — SNACK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ბანანის ბლინები',
    titleEn: 'Banana Pancakes',
    descriptionKa: 'ბანანი კარგად დაჭყლიტეთ. კვერცხი ავურიეთ და შეუმატეთ. ზეთის გარეშე ან მინიმალური ზეთით პატარა ბლინები გამოაცხვეთ. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Mash banana well. Beat egg and add. Cook small pancakes with no or minimal oil. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ბანანი - 1 მწიფე', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Banana - 1 ripe', 'Egg - 1'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: ['egg'],
  },
  {
    titleKa: 'მოცვის მაფინები',
    titleEn: 'Blueberry Muffins',
    descriptionKa: 'შვრიის ფქვილი, ბანანი და მოცვი შეურიეთ. მინი მაფინის ფორმებში ჩაასხით. 180°C-ზე 15-18 წუთი გამოაცხვეთ. ოდნავ გაგრილებული ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Mix oat flour, banana and blueberries. Pour into mini muffin forms. Bake at 180°C for 15-18 minutes. Serve slightly cooled in age-appropriate pieces.',
    ingredientsKa: ['მოცვი - 30-40 გ', 'შვრიის ფქვილი - 50-60 გ', 'ბანანი - 1 მწიფე'],
    ingredientsEn: ['Blueberry - 30-40g', 'Oat flour - 50-60g', 'Banana - 1 ripe'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'ავოკადო ტოსტზე',
    titleEn: 'Avocado on Toast',
    descriptionKa: 'მთლიანი მარცვლის პური შეწვით. ავოკადო ჩანგლით დაჭყლიტეთ და პურზე წაუსვით. ასაკის შესაბამის ზომებად დაჭერით. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Toast whole grain bread. Mash avocado with fork and spread on bread. Cut into age-appropriate sized pieces. Serve freshly made.',
    ingredientsKa: ['ავოკადო - 1/4 ცალი', 'მთლიანი მარცვლის პური - 1 ნაჭერი'],
    ingredientsEn: ['Avocado - 1/4', 'Whole grain bread - 1 slice'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'იოგურტი ბანანით',
    titleEn: 'Yogurt with Banana',
    descriptionKa: 'ბანანი ჩანგლით დაჭყლიტეთ. ბუნებრივ იოგურტს შეუმატეთ და ავურიეთ. კოვზით ასაკის შესაბამის ზომებად მიეცით. შაქრის გარეშე.',
    descriptionEn: 'Mash banana with fork. Add to natural yogurt and mix. Serve by spoon in age-appropriate amounts. Without sugar.',
    ingredientsKa: ['ბუნებრივი იოგურტი - 60-80 გ', 'ბანანი - 1/3 ცალი'],
    ingredientsEn: ['Natural yogurt - 60-80g', 'Banana - 1/3'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: ['dairy'],
  },
  {
    titleKa: 'ორთქლზე მომზადებული სტაფილო',
    titleEn: 'Steamed Carrot',
    descriptionKa: 'სტაფილო გაფცქვენით და გრძელ ჩხირებად დაჭერით. ორთქლზე 10-15 წუთი მოხარშეთ სრულ დარბილებამდე. ოდნავ გაგრილებული მიეცით.',
    descriptionEn: 'Peel carrot and cut into long sticks. Steam for 10-15 minutes until fully soft. Serve slightly cooled.',
    ingredientsKa: ['სტაფილო - 60-70 გ'],
    ingredientsEn: ['Carrot - 60-70g'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'მარწყვის ნაჭრები',
    titleEn: 'Strawberry Pieces',
    descriptionKa: 'მარწყვი კარგად გარეცხეთ. 9 თვის ბავშვისთვის მეოთხედებად დაჭერით. 10+ თვის ბავშვისთვის ნახევრებად. ახლად გარეცხილი, ოთახის ტემპერატურაზე მიეცით.',
    descriptionEn: 'Wash strawberries well. For 9-month baby cut into quarters. For 10+ months cut in halves. Serve freshly washed at room temperature.',
    ingredientsKa: ['მწიფე მარწყვი - 4-5 ცალი'],
    ingredientsEn: ['Ripe strawberry - 4-5 pcs'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: ['strawberry'],
  },
  {
    titleKa: 'ხაჭო ატმით',
    titleEn: 'Cottage Cheese with Peach',
    descriptionKa: 'ატამი გაფცქვენით, კურკა ამოიღეთ და წვრილად დაჭერით ან ჩაჭყლიტეთ. ხაჭოს შეუმატეთ. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Peel peach, remove pit and finely chop or mash. Add to cottage cheese. Serve in age-appropriate amounts.',
    ingredientsKa: ['ხაჭო - 60-70 გ', 'ატამი - 1/2 ცალი'],
    ingredientsEn: ['Cottage cheese - 60-70g', 'Peach - 1/2'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: ['dairy'],
  },
  {
    titleKa: 'ტკბილი კარტოფილის ჩხირები',
    titleEn: 'Sweet Potato Sticks',
    descriptionKa: 'ტკბილი კარტოფილი გაფცქვენით და ჩხირებად დაჭერით. ორთქლზე 10-12 წუთი მოხარშეთ. 9-11 თვის ბავშვი ჩხირს დამოუკიდებლად მოიჭერს.',
    descriptionEn: 'Peel sweet potato and cut into sticks. Steam for 10-12 minutes. A 9-11 month baby can independently grip the stick.',
    ingredientsKa: ['ტკბილი კარტოფილი - 60-70 გ'],
    ingredientsEn: ['Sweet potato - 60-70g'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: [],
  },
  {
    titleKa: 'შვრიის მინი მაფინები',
    titleEn: 'Mini Oat Muffins',
    descriptionKa: 'შვრიის ფქვილი და ბანანი შეურიეთ. მინი ფორმებში ჩაასხით. 180°C-ზე 15 წუთი გამოაცხვეთ. ოდნავ გაგრილებული ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Mix oat flour and banana. Pour into mini forms. Bake at 180°C for 15 minutes. Serve slightly cooled in age-appropriate pieces.',
    ingredientsKa: ['შვრიის ფქვილი - 50-60 გ', 'ბანანი - 1 მწიფე'],
    ingredientsEn: ['Oat flour - 50-60g', 'Banana - 1 ripe'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'ავოკადო და მსხალი',
    titleEn: 'Avocado and Pear',
    descriptionKa: 'ავოკადო გრძელ ნაჭრებად დაჭერით. მსხალი ორთქლზე მოხარშეთ (ან თუ ძალიან მწიფეა, ახლადაც შეიძლება) და ასევე ნაჭრებად. ცალ-ცალკე მიეცით.',
    descriptionEn: 'Cut avocado into long pieces. Steam pear (or serve fresh if very ripe) and also cut into pieces. Serve separately.',
    ingredientsKa: ['ავოკადო - 1/4 ცალი', 'მსხალი - 1/2 ცალი'],
    ingredientsEn: ['Avocado - 1/4', 'Pear - 1/2'],
    ageGroups: ['FROM_9'], mealType: 'SNACK', allergens: [],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12-18 MONTHS (FROM_12) — SNACK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'ჩიას პუდინგი',
    titleEn: 'Chia Pudding',
    descriptionKa: 'ჩიას თესლი რძეში ჩაყარეთ, კარგად ავურიეთ. 15-20 წუთი ან ღამით დაისვენეთ. სეზონური ხილი ზემოდან დაუმატეთ. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Add chia seeds to milk, stir well. Rest for 15-20 minutes or overnight. Top with seasonal fruit. Serve in age-appropriate amounts.',
    ingredientsKa: ['ჩიას თესლი - 10 გ', 'რძე - 100 მლ'],
    ingredientsEn: ['Chia seeds - 10g', 'Milk - 100ml'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['dairy'],
  },
  {
    titleKa: 'იოგურტი მოცვით',
    titleEn: 'Yogurt with Blueberry',
    descriptionKa: 'ბუნებრივი იოგურტი თასში ჩაასხით. მოცვი ზემოდან დაუმატეთ — ნახევარი მთელი, ნახევარი ჩაჭყლეტილი. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Pour natural yogurt into a bowl. Add blueberries on top — half whole, half crushed. Serve in age-appropriate amounts.',
    ingredientsKa: ['ბუნებრივი იოგურტი - 80-100 გ', 'მოცვი - 30-40 გ'],
    ingredientsEn: ['Natural yogurt - 80-100g', 'Blueberry - 30-40g'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['dairy'],
  },
  {
    titleKa: 'მინი შვრიის მაფინები',
    titleEn: 'Mini Oat Muffins',
    descriptionKa: 'შვრიის ფქვილი და ბანანი კარგად შეურიეთ. მინი ფორმებში ჩაასხით. 180°C-ზე 15-18 წუთი გამოაცხვეთ. ოდნავ გაგრილებული ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Mix oat flour and banana well. Pour into mini forms. Bake at 180°C for 15-18 minutes. Serve slightly cooled in age-appropriate pieces.',
    ingredientsKa: ['შვრიის ფქვილი - 60-70 გ', 'ბანანი - 1 მწიფე'],
    ingredientsEn: ['Oat flour - 60-70g', 'Banana - 1 ripe'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'ავოკადოს ტოსტი',
    titleEn: 'Avocado Toast',
    descriptionKa: 'პური შეწვით. ავოკადო ჩანგლით გლუვად დაჭყლიტეთ და პურზე წაუსვით. ასაკის შესაბამის ზომებად დაჭერით. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Toast bread. Mash avocado smoothly with fork and spread on bread. Cut into age-appropriate sized pieces. Serve freshly made.',
    ingredientsKa: ['ავოკადო - 1/3 ცალი', 'პური - 1 ნაჭერი'],
    ingredientsEn: ['Avocado - 1/3', 'Bread - 1 slice'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'ხაჭო მარწყვით',
    titleEn: 'Cottage Cheese with Strawberry',
    descriptionKa: 'მარწყვი გარეცხეთ და წვრილ ნაჭრებად დაჭერით. ხაჭოს შეუმატეთ. ასაკის შესაბამის ზომებად მიეცით. კალციუმისა და ვიტამინ C-ის შესანიშნავი კომბინაციაა.',
    descriptionEn: 'Wash strawberries and cut into small pieces. Add to cottage cheese. Serve in age-appropriate amounts. An excellent combination of calcium and vitamin C.',
    ingredientsKa: ['ხაჭო - 70-80 გ', 'მარწყვი - 30-40 გ'],
    ingredientsEn: ['Cottage cheese - 70-80g', 'Strawberry - 30-40g'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['dairy', 'strawberry'],
  },
  {
    titleKa: 'ბანანის ენერგეტიკული ბურთულები',
    titleEn: 'Banana Energy Balls',
    descriptionKa: 'ბანანი კარგად დაჭყლიტეთ. შვრია შეუმატეთ და კარგად შეურიეთ. პატარა ბურთულები ჩამოაყალიბეთ. მაცივარში 30 წუთი შედეთ. ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Mash banana well. Add oats and mix well. Shape into small balls. Refrigerate for 30 minutes. Serve in age-appropriate sized pieces.',
    ingredientsKa: ['ბანანი - 1 მწიფე', 'შვრია - 40-50 გ'],
    ingredientsEn: ['Banana - 1 ripe', 'Oats - 40-50g'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'ვაშლის ნაჭრები არაქისის კარაქით',
    titleEn: 'Apple Slices with Peanut Butter',
    descriptionKa: 'ვაშლი თხელ ნაჭრებად დაჭერით. არაქისის კარაქი თხელი ფენით წაუსვით. ახლად მომზადებული მიეცით. არაქისი ერთ-ერთი ყველაზე მნიშვნელოვანი ალერგენია — პირველად მცირე რაოდენობით სცადეთ.',
    descriptionEn: 'Cut apple into thin slices. Spread thin layer of peanut butter. Serve freshly made. Peanut is one of the most important allergens — try in small amounts first.',
    ingredientsKa: ['ვაშლი - 1/2 ცალი', 'არაქისის კარაქი - 1 ჩ/კ'],
    ingredientsEn: ['Apple - 1/2', 'Peanut butter - 1 tsp'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['peanut'],
  },
  {
    titleKa: 'ყველის კუბიკები',
    titleEn: 'Cheese Cubes',
    descriptionKa: 'პასტერიზებული ყველი პატარა კუბიკებად დაჭერით. ასაკის შესაბამის ზომებად მიეცით. კალციუმით მდიდარი, ადვილად მოსამზადებელი სნექია.',
    descriptionEn: 'Cut pasteurized cheese into small cubes. Serve in age-appropriate sized pieces. A calcium-rich, easy-to-prepare snack.',
    ingredientsKa: ['პასტერიზებული ყველი - 20-30 გ'],
    ingredientsEn: ['Pasteurized cheese - 20-30g'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['dairy'],
  },
  {
    titleKa: 'მოცვის პანკეიქები',
    titleEn: 'Blueberry Pancakes',
    descriptionKa: 'კვერცხი ავურიეთ. მოცვი დაუმატეთ. ზეთის მინიმალური რაოდენობით პატარა პანკეიქები გამოაცხვეთ. ოდნავ გაგრილებული ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Beat egg. Add blueberries. Cook small pancakes with minimal oil. Serve slightly cooled in age-appropriate pieces.',
    ingredientsKa: ['მოცვი - 40-50 გ', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Blueberry - 40-50g', 'Egg - 1'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['egg'],
  },
  {
    titleKa: 'ხილის თეფში',
    titleEn: 'Fruit Plate',
    descriptionKa: 'ბანანი, მსხალი და მარწყვი ასაკის შესაბამის ზომებად დაჭერით. ერთ თეფშზე მოაწყვეთ. ახლად გაჭრილი მიეცით. ვიტამინებისა და ბოჭკოების შესანიშნავი წყაროა.',
    descriptionEn: 'Cut banana, pear and strawberry into age-appropriate sized pieces. Arrange on one plate. Serve freshly cut. An excellent source of vitamins and fiber.',
    ingredientsKa: ['ბანანი - 1/3 ცალი', 'მსხალი - 1/4 ცალი', 'მარწყვი - 2-3 ცალი'],
    ingredientsEn: ['Banana - 1/3', 'Pear - 1/4', 'Strawberry - 2-3 pcs'],
    ageGroups: ['FROM_12'], mealType: 'SNACK', allergens: ['strawberry'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 18-36 MONTHS (FROM_24) — SNACK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    titleKa: 'იოგურტის გრანოლა ბოული',
    titleEn: 'Yogurt Granola Bowl',
    descriptionKa: 'ბუნებრივი იოგურტი თასში ჩაასხით. გრანოლა ზემოდან დაუმატეთ. სეზონური ხილი (ბანანი, მარწყვი, მოცვი) ნაჭრებად ზემოდან. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Pour natural yogurt into bowl. Add granola on top. Add seasonal fruit (banana, strawberry, blueberry) pieces on top. Serve freshly made.',
    ingredientsKa: ['ბუნებრივი იოგურტი - 100-120 გ', 'გრანოლა - 20-30 გ', 'სეზონური ხილი - 40-50 გ'],
    ingredientsEn: ['Natural yogurt - 100-120g', 'Granola - 20-30g', 'Seasonal fruit - 40-50g'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['dairy', 'gluten'],
  },
  {
    titleKa: 'ვაშლი არაქისის კარაქით',
    titleEn: 'Apple with Peanut Butter',
    descriptionKa: 'ვაშლი თხელ ნაჭრებად დაჭერით. არაქისის კარაქი გვერდზე დადეთ — ბავშვი ნაჭერს ჩაუყავს. ახლად მომზადებული მიეცით. ენერგიისა და ჯანსაღი ცხიმების შესანიშნავი სნექია.',
    descriptionEn: 'Cut apple into thin slices. Place peanut butter on the side — child dips the slice. Serve freshly made. An excellent snack for energy and healthy fats.',
    ingredientsKa: ['ვაშლი - 1/2 ცალი', 'არაქისის კარაქი - 1-2 ჩ/კ'],
    ingredientsEn: ['Apple - 1/2', 'Peanut butter - 1-2 tsp'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['peanut'],
  },
  {
    titleKa: 'ყველი და ხილი',
    titleEn: 'Cheese and Fruit',
    descriptionKa: 'პასტერიზებული ყველი კუბიკებად ან ზოლებად დაჭერით. სეზონური ხილი ასაკის შესაბამის ზომებად. ერთ თეფშზე მოაწყვეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Cut pasteurized cheese into cubes or strips. Cut seasonal fruit into age-appropriate pieces. Arrange on one plate. Serve freshly made.',
    ingredientsKa: ['პასტერიზებული ყველი - 25-30 გ', 'სეზონური ხილი - 50-60 გ'],
    ingredientsEn: ['Pasteurized cheese - 25-30g', 'Seasonal fruit - 50-60g'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['dairy'],
  },
  {
    titleKa: 'ბანანის მაფინი',
    titleEn: 'Banana Muffin',
    descriptionKa: 'ბანანი კარგად დაჭყლიტეთ. შვრიის ფქვილი შეუმატეთ. კვერცხი და ოდნავ ვანილი დაუმატეთ. ფორმებში ჩაასხით. 180°C-ზე 18-20 წუთი გამოაცხვეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Mash banana well. Add oat flour. Add egg and a little vanilla. Pour into forms. Bake at 180°C for 18-20 minutes. Serve freshly made.',
    ingredientsKa: ['ბანანი - 2 მწიფე', 'შვრიის ფქვილი - 70-80 გ'],
    ingredientsEn: ['Banana - 2 ripe', 'Oat flour - 70-80g'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'ენერგეტიკული ბურთულები',
    titleEn: 'Energy Balls',
    descriptionKa: 'შვრია, დაჭყლეტილი ბანანი და თესლები (სეზამი, ჩია, სელი) შეურიეთ. პატარა ბურთულები ჩამოაყალიბეთ. მაცივარში 30 წუთი შედეთ. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Mix oats, mashed banana and seeds (sesame, chia, flax). Shape into small balls. Refrigerate for 30 minutes. Serve freshly made.',
    ingredientsKa: ['შვრია - 50-60 გ', 'ბანანი - 1 მწიფე', 'თესლები (სეზამი/ჩია/სელი) - 1-2 ს/კ'],
    ingredientsEn: ['Oats - 50-60g', 'Banana - 1 ripe', 'Seeds (sesame/chia/flax) - 1-2 tbsp'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'ხაჭო მოცვით',
    titleEn: 'Cottage Cheese with Blueberry',
    descriptionKa: 'ხაჭო თასში ჩაასხით. მოცვი ზემოდან დაუმატეთ. სასურველია ოდნავ ჩაჭყლეტილი, რომ ფერი გამოვიდეს. ახლად მომზადებული მიეცით.',
    descriptionEn: 'Pour cottage cheese into bowl. Add blueberries on top. Preferably slightly crushed to release color. Serve freshly made.',
    ingredientsKa: ['ხაჭო - 80-100 გ', 'მოცვი - 30-40 გ'],
    ingredientsEn: ['Cottage cheese - 80-100g', 'Blueberry - 30-40g'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['dairy'],
  },
  {
    titleKa: 'ავოკადოს ტოსტი',
    titleEn: 'Avocado Toast',
    descriptionKa: 'პური შეწვით. ავოკადო ჩანგლით დაჭყლიტეთ. პურზე წაუსვით. სასურველია ოდნავ ლიმონი გამოწუროთ ზემოდან. ასაკის შესაბამის ზომებად დაჭერით.',
    descriptionEn: 'Toast bread. Mash avocado with fork. Spread on bread. Optionally squeeze a little lemon on top. Cut into age-appropriate sized pieces.',
    ingredientsKa: ['ავოკადო - 1/2 ცალი', 'პური - 1 ნაჭერი'],
    ingredientsEn: ['Avocado - 1/2', 'Bread - 1 slice'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['gluten'],
  },
  {
    titleKa: 'მინი სენდვიჩი',
    titleEn: 'Mini Sandwich',
    descriptionKa: 'პური ნახევრად დაჭერით. ყველი თხელ ფენად დადეთ. კვერცხი მოჩლუნგებულ სახით მოხარშეთ და დაუმატეთ. ნახევარი ან მეოთხედი სენდვიჩი ასაკის შესაბამისად მიეცით.',
    descriptionEn: 'Cut bread in half. Place a thin layer of cheese. Add scrambled egg. Serve half or quarter sandwich according to age.',
    ingredientsKa: ['პური - 1 ნაჭერი', 'ყველი - 15-20 გ', 'კვერცხი - 1 ცალი'],
    ingredientsEn: ['Bread - 1 slice', 'Cheese - 15-20g', 'Egg - 1'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['gluten', 'dairy', 'egg'],
  },
  {
    titleKa: 'ხილის თეფში',
    titleEn: 'Fruit Plate',
    descriptionKa: 'მარწყვი, ბანანი და მსხალი ასაკის შესაბამის ზომებად დაჭერით. ერთ თეფშზე ლამაზად მოაწყვეთ. ახლად გაჭრილი მიეცით. სეზონური ხილის ნებისმიერი კომბინაცია შეიძლება.',
    descriptionEn: 'Cut strawberry, banana and pear into age-appropriate pieces. Arrange nicely on one plate. Serve freshly cut. Any combination of seasonal fruit works.',
    ingredientsKa: ['მარწყვი - 3-4 ცალი', 'ბანანი - 1/3 ცალი', 'მსხალი - 1/4 ცალი'],
    ingredientsEn: ['Strawberry - 3-4 pcs', 'Banana - 1/3', 'Pear - 1/4'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['strawberry'],
  },
  {
    titleKa: 'შვრიის ორცხობილა',
    titleEn: 'Oat Cookies',
    descriptionKa: 'ბანანი კარგად დაჭყლიტეთ. შვრია შეუმატეთ. ბრტყელი ორცხობილები ჩამოაყალიბეთ. 180°C-ზე 12-15 წუთი გამოაცხვეთ. ოდნავ გაგრილებული ასაკის შესაბამის ზომებად მიეცით.',
    descriptionEn: 'Mash banana well. Add oats. Shape flat cookies. Bake at 180°C for 12-15 minutes. Serve slightly cooled in age-appropriate pieces.',
    ingredientsKa: ['შვრია - 60-70 გ', 'ბანანი - 1 მწიფე'],
    ingredientsEn: ['Oats - 60-70g', 'Banana - 1 ripe'],
    ageGroups: ['FROM_24'], mealType: 'SNACK', allergens: ['gluten'],
  },
];

async function main() {
  console.log('🌱 Seeding 40 snack recipes...');

  let created = 0;
  let skipped = 0;

  for (const r of recipes) {
    const existing = await prisma.dish.findFirst({
      where: { titleKa: r.titleKa, mealType: 'SNACK' },
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
