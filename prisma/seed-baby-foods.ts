import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const VEGETABLES = [
  { nameKa: 'კარტოფილი',            nameEn: 'Potato',           minAgeMonths: 6 },
  { nameKa: 'სტაფილო',              nameEn: 'Carrot',           minAgeMonths: 6 },
  { nameKa: 'გოგრა',                nameEn: 'Pumpkin',          minAgeMonths: 6 },
  { nameKa: 'ყაბაყი',               nameEn: 'Zucchini',         minAgeMonths: 6 },
  { nameKa: 'ბარდა',                nameEn: 'Peas',             minAgeMonths: 6 },
  { nameKa: 'ტკბილი კარტოფილი',     nameEn: 'Sweet Potato',     minAgeMonths: 6 },
  { nameKa: 'ჭარხალი',              nameEn: 'Beetroot',         minAgeMonths: 6 },
  { nameKa: 'მწვანე ლობიო',         nameEn: 'Green Beans',      minAgeMonths: 6 },
  { nameKa: 'ბროკოლი',              nameEn: 'Broccoli',         minAgeMonths: 7 },
  { nameKa: 'ყვავილოვანი კომბოსტო',  nameEn: 'Cauliflower',      minAgeMonths: 7 },
  { nameKa: 'ბრიუსელის კომბოსტო',   nameEn: 'Brussels Sprouts', minAgeMonths: 7 },
  { nameKa: 'კომბოსტო',             nameEn: 'Cabbage',          minAgeMonths: 7 },
  { nameKa: 'ისპანახი',             nameEn: 'Spinach',          minAgeMonths: 8 },
  { nameKa: 'ბადრიჯანი',            nameEn: 'Eggplant',         minAgeMonths: 8 },
  { nameKa: 'ტკბილი წიწაკა',        nameEn: 'Sweet Pepper',     minAgeMonths: 8 },
  { nameKa: 'კიტრი',                nameEn: 'Cucumber',         minAgeMonths: 8 },
  { nameKa: 'სიმინდი',              nameEn: 'Corn',             minAgeMonths: 8 },
  { nameKa: 'პრასი',                nameEn: 'Leek',             minAgeMonths: 8 },
  { nameKa: 'ბოლოკი',               nameEn: 'Radish',           minAgeMonths: 8 },
  { nameKa: 'პომიდორი',             nameEn: 'Tomato',           minAgeMonths: 9 },
];

const FRUITS = [
  { nameKa: 'ვაშლი',     nameEn: 'Apple',       minAgeMonths: 6 },
  { nameKa: 'ბანანი',    nameEn: 'Banana',       minAgeMonths: 6 },
  { nameKa: 'მსხალი',    nameEn: 'Pear',         minAgeMonths: 6 },
  { nameKa: 'ატამი',     nameEn: 'Peach',        minAgeMonths: 6 },
  { nameKa: 'ქლიავი',    nameEn: 'Plum',         minAgeMonths: 6 },
  { nameKa: 'ავოკადო',   nameEn: 'Avocado',      minAgeMonths: 6 },
  { nameKa: 'მანგო',     nameEn: 'Mango',         minAgeMonths: 6 },
  { nameKa: 'გარგარი',   nameEn: 'Apricot',      minAgeMonths: 6 },
  { nameKa: 'ნესვი',     nameEn: 'Melon',         minAgeMonths: 8 },
  { nameKa: 'ჟოლო',     nameEn: 'Raspberry',     minAgeMonths: 8 },
  { nameKa: 'მარწყვი',  nameEn: 'Strawberry',    minAgeMonths: 8 },
  { nameKa: 'კივი',     nameEn: 'Kiwi',           minAgeMonths: 8 },
  { nameKa: 'მოცვი',    nameEn: 'Blueberry',     minAgeMonths: 8 },
  { nameKa: 'ალუბალი',  nameEn: 'Cherry',         minAgeMonths: 8 },
  { nameKa: 'მანდარინი',nameEn: 'Mandarin',       minAgeMonths: 8 },
  { nameKa: 'ანანასი',  nameEn: 'Pineapple',      minAgeMonths: 8 },
  { nameKa: 'საზამთრო', nameEn: 'Watermelon',     minAgeMonths: 8 },
  { nameKa: 'ლეღვი',    nameEn: 'Fig',            minAgeMonths: 8 },
  { nameKa: 'კომში',    nameEn: 'Quince',         minAgeMonths: 8 },
  { nameKa: 'ფორთოხალი', nameEn: 'Orange',         minAgeMonths: 8 },
  { nameKa: 'მაყვალი',  nameEn: 'Blackberry',     minAgeMonths: 8 },
  { nameKa: 'მოცხარი',  nameEn: 'Currant',        minAgeMonths: 8 },
  { nameKa: 'ყურძენი',  nameEn: 'Grape',          minAgeMonths: 10 },
  { nameKa: 'ბროწეული', nameEn: 'Pomegranate',    minAgeMonths: 10 },
];

// Each suggestion: { titleKa, titleEn, texture, minAge, ingredientNames[] }
const SUGGESTIONS = [
  // ── ბოსტნეულის ერთი კომპონენტის პიურე ─────────────────────────────────────
  { titleKa: 'კარტოფილის პიურე',              titleEn: 'Potato Puree',                  texture: 'puree',      min: 6, ing: ['კარტოფილი'] },
  { titleKa: 'სტაფილოს პიურე',                titleEn: 'Carrot Puree',                  texture: 'puree',      min: 6, ing: ['სტაფილო'] },
  { titleKa: 'გოგრის პიურე',                  titleEn: 'Pumpkin Puree',                 texture: 'puree',      min: 6, ing: ['გოგრა'] },
  { titleKa: 'ყაბაყის პიურე',                 titleEn: 'Zucchini Puree',                texture: 'puree',      min: 6, ing: ['ყაბაყი'] },
  { titleKa: 'ბარდის პიურე',                  titleEn: 'Pea Puree',                     texture: 'puree',      min: 6, ing: ['ბარდა'] },
  { titleKa: 'ტკბილი კარტოფილის პიურე',       titleEn: 'Sweet Potato Puree',            texture: 'puree',      min: 6, ing: ['ტკბილი კარტოფილი'] },
  { titleKa: 'ჭარხლის პიურე',                 titleEn: 'Beetroot Puree',                texture: 'puree',      min: 6, ing: ['ჭარხალი'] },
  { titleKa: 'მწვანე ლობიოს პიურე',           titleEn: 'Green Bean Puree',              texture: 'puree',      min: 6, ing: ['მწვანე ლობიო'] },
  { titleKa: 'ბროკოლის პიურე',                titleEn: 'Broccoli Puree',                texture: 'puree',      min: 7, ing: ['ბროკოლი'] },
  { titleKa: 'ყვავილოვანი კომბოსტოს პიურე',   titleEn: 'Cauliflower Puree',             texture: 'puree',      min: 7, ing: ['ყვავილოვანი კომბოსტო'] },
  { titleKa: 'ბრიუსელის კომბოსტოს პიურე',     titleEn: 'Brussels Sprouts Puree',        texture: 'puree',      min: 7, ing: ['ბრიუსელის კომბოსტო'] },
  { titleKa: 'კომბოსტოს პიურე',               titleEn: 'Cabbage Puree',                 texture: 'puree',      min: 7, ing: ['კომბოსტო'] },
  { titleKa: 'ისპანახის პიურე',               titleEn: 'Spinach Puree',                 texture: 'puree',      min: 8, ing: ['ისპანახი'] },
  { titleKa: 'ბადრიჯნის პიურე',               titleEn: 'Eggplant Puree',                texture: 'puree',      min: 8, ing: ['ბადრიჯანი'] },

  // ── ხილის ერთი კომპონენტის პიურე ──────────────────────────────────────────
  { titleKa: 'ვაშლის პიურე',                  titleEn: 'Apple Puree',                   texture: 'puree',      min: 6, ing: ['ვაშლი'] },
  { titleKa: 'ბანანის პიურე',                 titleEn: 'Banana Puree',                  texture: 'puree',      min: 6, ing: ['ბანანი'] },
  { titleKa: 'მსხლის პიურე',                  titleEn: 'Pear Puree',                    texture: 'puree',      min: 6, ing: ['მსხალი'] },
  { titleKa: 'ატმის პიურე',                   titleEn: 'Peach Puree',                   texture: 'puree',      min: 6, ing: ['ატამი'] },
  { titleKa: 'ქლიავის პიურე',                 titleEn: 'Plum Puree',                    texture: 'puree',      min: 6, ing: ['ქლიავი'] },
  { titleKa: 'ავოკადოს პიურე',                titleEn: 'Avocado Puree',                 texture: 'puree',      min: 6, ing: ['ავოკადო'] },
  { titleKa: 'მანგოს პიურე',                  titleEn: 'Mango Puree',                   texture: 'puree',      min: 6, ing: ['მანგო'] },
  { titleKa: 'გარგარის პიურე',                titleEn: 'Apricot Puree',                 texture: 'puree',      min: 6, ing: ['გარგარი'] },
  { titleKa: 'ჟოლოს პიურე',                   titleEn: 'Raspberry Puree',               texture: 'puree',      min: 8, ing: ['ჟოლო'] },
  { titleKa: 'მარწყვის პიურე',                titleEn: 'Strawberry Puree',              texture: 'puree',      min: 8, ing: ['მარწყვი'] },
  { titleKa: 'მოცვის პიურე',                  titleEn: 'Blueberry Puree',               texture: 'puree',      min: 8, ing: ['მოცვი'] },
  { titleKa: 'ნესვის პიურე',                  titleEn: 'Melon Puree',                   texture: 'puree',      min: 8, ing: ['ნესვი'] },
  { titleKa: 'ფორთოხლის პიურე',               titleEn: 'Orange Puree',                  texture: 'puree',      min: 8, ing: ['ფორთოხალი'] },

  // ── ბოსტნეული + ბოსტნეული (2 კომპ.) ───────────────────────────────────────
  { titleKa: 'კარტოფილი + სტაფილო',           titleEn: 'Potato & Carrot Puree',         texture: 'puree',      min: 7, ing: ['კარტოფილი', 'სტაფილო'] },
  { titleKa: 'კარტოფილი + გოგრა',             titleEn: 'Potato & Pumpkin Puree',        texture: 'puree',      min: 7, ing: ['კარტოფილი', 'გოგრა'] },
  { titleKa: 'გოგრა + სტაფილო',               titleEn: 'Pumpkin & Carrot Puree',        texture: 'puree',      min: 7, ing: ['გოგრა', 'სტაფილო'] },
  { titleKa: 'კარტოფილი + ყაბაყი',            titleEn: 'Potato & Zucchini Puree',       texture: 'puree',      min: 7, ing: ['კარტოფილი', 'ყაბაყი'] },
  { titleKa: 'კარტოფილი + ტკბილი კარტოფილი',  titleEn: 'Potato & Sweet Potato Puree',   texture: 'puree',      min: 7, ing: ['კარტოფილი', 'ტკბილი კარტოფილი'] },
  { titleKa: 'სტაფილო + ყაბაყი',              titleEn: 'Carrot & Zucchini Puree',       texture: 'puree',      min: 7, ing: ['სტაფილო', 'ყაბაყი'] },
  { titleKa: 'სტაფილო + ბარდა',               titleEn: 'Carrot & Pea Puree',            texture: 'puree',      min: 7, ing: ['სტაფილო', 'ბარდა'] },
  { titleKa: 'გოგრა + ყაბაყი',                titleEn: 'Pumpkin & Zucchini Puree',      texture: 'puree',      min: 7, ing: ['გოგრა', 'ყაბაყი'] },
  { titleKa: 'გოგრა + ბარდა',                 titleEn: 'Pumpkin & Pea Puree',           texture: 'puree',      min: 7, ing: ['გოგრა', 'ბარდა'] },
  { titleKa: 'ბროკოლი + კარტოფილი',           titleEn: 'Broccoli & Potato Puree',       texture: 'puree',      min: 7, ing: ['ბროკოლი', 'კარტოფილი'] },
  { titleKa: 'ბროკოლი + სტაფილო',             titleEn: 'Broccoli & Carrot Puree',       texture: 'puree',      min: 7, ing: ['ბროკოლი', 'სტაფილო'] },
  { titleKa: 'ბროკოლი + გოგრა',               titleEn: 'Broccoli & Pumpkin Puree',      texture: 'puree',      min: 7, ing: ['ბროკოლი', 'გოგრა'] },
  { titleKa: 'ბროკოლი + ყაბაყი',              titleEn: 'Broccoli & Zucchini Puree',     texture: 'puree',      min: 7, ing: ['ბროკოლი', 'ყაბაყი'] },
  { titleKa: 'ყვ.კომბოსტო + კარტოფილი',       titleEn: 'Cauliflower & Potato',          texture: 'puree',      min: 7, ing: ['ყვავილოვანი კომბოსტო', 'კარტოფილი'] },
  { titleKa: 'ყვ.კომბოსტო + სტაფილო',         titleEn: 'Cauliflower & Carrot Puree',    texture: 'puree',      min: 7, ing: ['ყვავილოვანი კომბოსტო', 'სტაფილო'] },
  { titleKa: 'ყვ.კომბოსტო + გოგრა',           titleEn: 'Cauliflower & Pumpkin Puree',   texture: 'puree',      min: 7, ing: ['ყვავილოვანი კომბოსტო', 'გოგრა'] },
  { titleKa: 'ბრიუსელის კომბოსტო + კარტოფილი', titleEn: 'Brussels Sprouts & Potato Puree', texture: 'puree',   min: 7, ing: ['ბრიუსელის კომბოსტო', 'კარტოფილი'] },
  { titleKa: 'ჭარხალი + კარტოფილი',           titleEn: 'Beetroot & Potato Puree',       texture: 'puree',      min: 7, ing: ['ჭარხალი', 'კარტოფილი'] },
  { titleKa: 'ჭარხალი + გოგრა',               titleEn: 'Beetroot & Pumpkin Puree',      texture: 'puree',      min: 7, ing: ['ჭარხალი', 'გოგრა'] },
  { titleKa: 'ისპანახი + კარტოფილი',          titleEn: 'Spinach & Potato Puree',        texture: 'puree',      min: 8, ing: ['ისპანახი', 'კარტოფილი'] },
  { titleKa: 'ისპანახი + ბარდა',              titleEn: 'Spinach & Pea Puree',           texture: 'puree',      min: 8, ing: ['ისპანახი', 'ბარდა'] },
  { titleKa: 'ისპანახი + გოგრა',              titleEn: 'Spinach & Pumpkin Puree',       texture: 'puree',      min: 8, ing: ['ისპანახი', 'გოგრა'] },

  // ── ხილი + ხილი (2 კომპ.) ──────────────────────────────────────────────────
  { titleKa: 'ვაშლი + ბანანი',                titleEn: 'Apple & Banana Puree',          texture: 'puree',      min: 7, ing: ['ვაშლი', 'ბანანი'] },
  { titleKa: 'ვაშლი + მსხალი',                titleEn: 'Apple & Pear Puree',            texture: 'puree',      min: 7, ing: ['ვაშლი', 'მსხალი'] },
  { titleKa: 'ვაშლი + ატამი',                 titleEn: 'Apple & Peach Puree',           texture: 'puree',      min: 7, ing: ['ვაშლი', 'ატამი'] },
  { titleKa: 'ვაშლი + გარგარი',               titleEn: 'Apple & Apricot Puree',         texture: 'puree',      min: 7, ing: ['ვაშლი', 'გარგარი'] },
  { titleKa: 'ვაშლი + მანგო',                 titleEn: 'Apple & Mango Puree',           texture: 'puree',      min: 7, ing: ['ვაშლი', 'მანგო'] },
  { titleKa: 'ქლიავი + ვაშლი',                titleEn: 'Plum & Apple Puree',            texture: 'puree',      min: 7, ing: ['ქლიავი', 'ვაშლი'] },
  { titleKa: 'ქლიავი + ბანანი',               titleEn: 'Plum & Banana Puree',           texture: 'puree',      min: 7, ing: ['ქლიავი', 'ბანანი'] },
  { titleKa: 'ბანანი + მსხალი',               titleEn: 'Banana & Pear Puree',           texture: 'puree',      min: 7, ing: ['ბანანი', 'მსხალი'] },
  { titleKa: 'ბანანი + ავოკადო',              titleEn: 'Banana & Avocado Puree',        texture: 'puree',      min: 7, ing: ['ბანანი', 'ავოკადო'] },
  { titleKa: 'ბანანი + მანგო',                titleEn: 'Banana & Mango Puree',          texture: 'puree',      min: 7, ing: ['ბანანი', 'მანგო'] },
  { titleKa: 'ბანანი + გარგარი',              titleEn: 'Banana & Apricot Puree',        texture: 'puree',      min: 7, ing: ['ბანანი', 'გარგარი'] },
  { titleKa: 'ატამი + ბანანი',                titleEn: 'Peach & Banana Puree',          texture: 'puree',      min: 7, ing: ['ატამი', 'ბანანი'] },
  { titleKa: 'ატამი + გარგარი',               titleEn: 'Peach & Apricot Puree',         texture: 'puree',      min: 7, ing: ['ატამი', 'გარგარი'] },
  { titleKa: 'ავოკადო + მანგო',               titleEn: 'Avocado & Mango Puree',         texture: 'puree',      min: 7, ing: ['ავოკადო', 'მანგო'] },
  { titleKa: 'მანგო + გარგარი',               titleEn: 'Mango & Apricot Puree',         texture: 'puree',      min: 7, ing: ['მანგო', 'გარგარი'] },
  // 8mo ხილის კომბინაციები
  { titleKa: 'ვაშლი + ჟოლო',                  titleEn: 'Apple & Raspberry Puree',       texture: 'puree',      min: 8, ing: ['ვაშლი', 'ჟოლო'] },
  { titleKa: 'ვაშლი + მარწყვი',               titleEn: 'Apple & Strawberry Puree',      texture: 'puree',      min: 8, ing: ['ვაშლი', 'მარწყვი'] },
  { titleKa: 'ვაშლი + მოცვი',                 titleEn: 'Apple & Blueberry Puree',       texture: 'puree',      min: 8, ing: ['ვაშლი', 'მოცვი'] },
  { titleKa: 'ვაშლი + ნესვი',                 titleEn: 'Apple & Melon Puree',           texture: 'puree',      min: 8, ing: ['ვაშლი', 'ნესვი'] },
  { titleKa: 'ვაშლი + ალუბალი',               titleEn: 'Apple & Cherry Puree',          texture: 'puree',      min: 8, ing: ['ვაშლი', 'ალუბალი'] },
  { titleKa: 'ვაშლი + ფორთოხალი',             titleEn: 'Apple & Orange Puree',          texture: 'puree',      min: 8, ing: ['ვაშლი', 'ფორთოხალი'] },
  { titleKa: 'ბანანი + მოცვი',                titleEn: 'Banana & Blueberry Puree',      texture: 'puree',      min: 8, ing: ['ბანანი', 'მოცვი'] },
  { titleKa: 'ბანანი + ჟოლო',                 titleEn: 'Banana & Raspberry Puree',      texture: 'puree',      min: 8, ing: ['ბანანი', 'ჟოლო'] },
  { titleKa: 'ბანანი + მარწყვი',              titleEn: 'Banana & Strawberry Puree',     texture: 'puree',      min: 8, ing: ['ბანანი', 'მარწყვი'] },
  { titleKa: 'ბანანი + ანანასი',              titleEn: 'Banana & Pineapple Puree',      texture: 'puree',      min: 8, ing: ['ბანანი', 'ანანასი'] },
  { titleKa: 'ატამი + მარწყვი',               titleEn: 'Peach & Strawberry Puree',      texture: 'puree',      min: 8, ing: ['ატამი', 'მარწყვი'] },
  { titleKa: 'ატამი + ჟოლო',                  titleEn: 'Peach & Raspberry Puree',       texture: 'puree',      min: 8, ing: ['ატამი', 'ჟოლო'] },
  { titleKa: 'მსხალი + ჟოლო',                 titleEn: 'Pear & Raspberry Puree',        texture: 'puree',      min: 8, ing: ['მსხალი', 'ჟოლო'] },
  { titleKa: 'ბანანი + მანდარინი',            titleEn: 'Banana & Mandarin Puree',       texture: 'puree',      min: 8, ing: ['ბანანი', 'მანდარინი'] },
  { titleKa: 'ვაშლი + კივი',                  titleEn: 'Apple & Kiwi Puree',            texture: 'puree',      min: 8, ing: ['ვაშლი', 'კივი'] },

  // ── ხილი + ბოსტნეული (2 კომპ.) ────────────────────────────────────────────
  { titleKa: 'ვაშლი + სტაფილო',               titleEn: 'Apple & Carrot Puree',          texture: 'puree',      min: 7, ing: ['ვაშლი', 'სტაფილო'] },
  { titleKa: 'ვაშლი + გოგრა',                 titleEn: 'Apple & Pumpkin Puree',         texture: 'puree',      min: 7, ing: ['ვაშლი', 'გოგრა'] },
  { titleKa: 'ატამი + სტაფილო',               titleEn: 'Peach & Carrot Puree',          texture: 'puree',      min: 7, ing: ['ატამი', 'სტაფილო'] },
  { titleKa: 'მსხალი + გოგრა',                titleEn: 'Pear & Pumpkin Puree',          texture: 'puree',      min: 7, ing: ['მსხალი', 'გოგრა'] },
  { titleKa: 'ბანანი + სტაფილო',              titleEn: 'Banana & Carrot Puree',         texture: 'puree',      min: 7, ing: ['ბანანი', 'სტაფილო'] },
  { titleKa: 'მანგო + ყაბაყი',                titleEn: 'Mango & Zucchini Puree',        texture: 'puree',      min: 7, ing: ['მანგო', 'ყაბაყი'] },
  { titleKa: 'ჭარხალი + ვაშლი',              titleEn: 'Beetroot & Apple Puree',        texture: 'puree',      min: 7, ing: ['ჭარხალი', 'ვაშლი'] },
  { titleKa: 'ჭარხალი + მსხალი',             titleEn: 'Beetroot & Pear Puree',         texture: 'puree',      min: 7, ing: ['ჭარხალი', 'მსხალი'] },
  { titleKa: 'გოგრა + ვაშლი',                 titleEn: 'Pumpkin & Apple Puree',         texture: 'puree',      min: 7, ing: ['გოგრა', 'ვაშლი'] },
  { titleKa: 'გარგარი + სტაფილო',             titleEn: 'Apricot & Carrot Puree',        texture: 'puree',      min: 7, ing: ['გარგარი', 'სტაფილო'] },
  { titleKa: 'ტკბილი კარტოფილი + ვაშლი',      titleEn: 'Sweet Potato & Apple Puree',    texture: 'puree',      min: 7, ing: ['ტკბილი კარტოფილი', 'ვაშლი'] },
  { titleKa: 'ტკბილი კარტოფილი + ბანანი',     titleEn: 'Sweet Potato & Banana Puree',   texture: 'puree',      min: 7, ing: ['ტკბილი კარტოფილი', 'ბანანი'] },
  { titleKa: 'სტაფილო + მანგო',               titleEn: 'Carrot & Mango Puree',          texture: 'puree',      min: 7, ing: ['სტაფილო', 'მანგო'] },

  // ── 3 კომპონენტი ────────────────────────────────────────────────────────────
  { titleKa: 'კარტოფილი + სტაფილო + გოგრა',  titleEn: 'Potato Carrot Pumpkin Puree',   texture: 'puree',      min: 8, ing: ['კარტოფილი', 'სტაფილო', 'გოგრა'] },
  { titleKa: 'ბროკოლი + კარტოფილი + სტაფილო', titleEn: 'Broccoli Potato Carrot Puree', texture: 'puree',      min: 8, ing: ['ბროკოლი', 'კარტოფილი', 'სტაფილო'] },
  { titleKa: 'ყვ.კომბ + ბროკოლი + კარტოფილი', titleEn: 'Cauliflower Broccoli Potato',  texture: 'puree',      min: 8, ing: ['ყვავილოვანი კომბოსტო', 'ბროკოლი', 'კარტოფილი'] },
  { titleKa: 'ტკბ.კარტ + კარტოფილი + გოგრა',  titleEn: 'Sweet Potato Potato Pumpkin',  texture: 'puree',      min: 8, ing: ['ტკბილი კარტოფილი', 'კარტოფილი', 'გოგრა'] },
  { titleKa: 'ვაშლი + ბანანი + ავოკადო',      titleEn: 'Apple Banana Avocado Puree',    texture: 'puree',      min: 8, ing: ['ვაშლი', 'ბანანი', 'ავოკადო'] },
  { titleKa: 'ვაშლი + ბანანი + ატამი',        titleEn: 'Apple Banana Peach Puree',      texture: 'puree',      min: 8, ing: ['ვაშლი', 'ბანანი', 'ატამი'] },
  { titleKa: 'ვაშლი + მსხალი + ქლიავი',      titleEn: 'Apple Pear Plum Puree',         texture: 'puree',      min: 8, ing: ['ვაშლი', 'მსხალი', 'ქლიავი'] },
  { titleKa: 'ბანანი + ავოკადო + მანგო',      titleEn: 'Banana Avocado Mango Puree',    texture: 'puree',      min: 8, ing: ['ბანანი', 'ავოკადო', 'მანგო'] },
  { titleKa: 'ვაშლი + სტაფილო + გოგრა',      titleEn: 'Apple Carrot Pumpkin Puree',    texture: 'puree',      min: 8, ing: ['ვაშლი', 'სტაფილო', 'გოგრა'] },
  { titleKa: 'ატამი + ბანანი + ვაშლი',        titleEn: 'Peach Banana Apple Puree',      texture: 'puree',      min: 8, ing: ['ატამი', 'ბანანი', 'ვაშლი'] },
  { titleKa: 'ბანანი + ვაშლი + მოცვი',        titleEn: 'Banana Apple Blueberry Puree',  texture: 'puree',      min: 8, ing: ['ბანანი', 'ვაშლი', 'მოცვი'] },
  { titleKa: 'ატამი + მარწყვი + ბანანი',      titleEn: 'Peach Strawberry Banana Puree', texture: 'puree',      min: 8, ing: ['ატამი', 'მარწყვი', 'ბანანი'] },
  { titleKa: 'ვაშლი + ჟოლო + ბანანი',        titleEn: 'Apple Raspberry Banana Puree',  texture: 'puree',      min: 8, ing: ['ვაშლი', 'ჟოლო', 'ბანანი'] },
  { titleKa: 'სტაფილო + გოგრა + ვაშლი',      titleEn: 'Carrot Pumpkin Apple Puree',    texture: 'puree',      min: 8, ing: ['სტაფილო', 'გოგრა', 'ვაშლი'] },

  // ── დაწნეხილი (mashed) ──────────────────────────────────────────────────────
  { titleKa: 'კარტოფ. + ბარდა (ჩანგლ. დაჭყლ.)',   titleEn: 'Potato & Pea Mash',             texture: 'mashed',     min: 8, ing: ['კარტოფილი', 'ბარდა'] },
  { titleKa: 'ავოკადო + ბანანი (ჩანგლ. დაჭყლ.)',   titleEn: 'Avocado & Banana Mash',         texture: 'mashed',     min: 8, ing: ['ავოკადო', 'ბანანი'] },
  { titleKa: 'ტკბ.კარტ + ბანანი (ჩანგლ. დაჭყლ.)',  titleEn: 'Sweet Potato & Banana Mash',    texture: 'mashed',     min: 8, ing: ['ტკბილი კარტოფილი', 'ბანანი'] },
  { titleKa: 'კარტოფ. + ბროკოლი (ჩანგლ. დაჭყლ.)', titleEn: 'Potato & Broccoli Mash',        texture: 'mashed',     min: 8, ing: ['კარტოფილი', 'ბროკოლი'] },
  { titleKa: 'სტაფილო + ბარდა (ჩანგლ. დაჭყლ.)',    titleEn: 'Carrot & Pea Mash',             texture: 'mashed',     min: 8, ing: ['სტაფილო', 'ბარდა'] },

  // ── ლმობიერი ნაჭრები (soft pieces) ─────────────────────────────────────────
  { titleKa: 'ბროკოლი (ლმობიერი ნაჭრები)',    titleEn: 'Soft Broccoli Pieces',          texture: 'softPieces', min: 8, ing: ['ბროკოლი'] },
  { titleKa: 'ბანანი (ნახევარი)',              titleEn: 'Banana Halves',                 texture: 'softPieces', min: 8, ing: ['ბანანი'] },
  { titleKa: 'ავოკადო (ლმობიერი ნაჭრები)',    titleEn: 'Soft Avocado Pieces',           texture: 'softPieces', min: 8, ing: ['ავოკადო'] },
  { titleKa: 'ატამი (ლმობიერი ნაჭრები)',      titleEn: 'Soft Peach Pieces',             texture: 'softPieces', min: 8, ing: ['ატამი'] },
  { titleKa: 'კიტრი (ლმობიერი ნაჭრები)',      titleEn: 'Soft Cucumber Pieces',          texture: 'softPieces', min: 8, ing: ['კიტრი'] },
  { titleKa: 'მსხალი (ლმობიერი ნაჭრები)',     titleEn: 'Soft Pear Pieces',              texture: 'softPieces', min: 8, ing: ['მსხალი'] },
];

async function run() {
  console.log('Seeding baby ingredients...');

  async function upsertIngredient(data: { nameKa: string; nameEn: string; minAgeMonths: number }, category: string) {
    const existing = await p.babyIngredient.findFirst({ where: { nameEn: data.nameEn } });
    if (existing) return existing;
    return p.babyIngredient.create({ data: { ...data, category } });
  }

  const vegs = await Promise.all(VEGETABLES.map(v => upsertIngredient(v, 'vegetable')));
  const fruits = await Promise.all(FRUITS.map(f => upsertIngredient(f, 'fruit')));

  const allIngredients = [...vegs, ...fruits];
  const byKa = Object.fromEntries(allIngredients.map(i => [i.nameKa, i]));

  console.log(`Seeded ${allIngredients.length} ingredients`);
  console.log('Seeding baby meal suggestions...');

  let created = 0;
  for (const s of SUGGESTIONS) {
    // Check all ingredients exist
    const ingObjs = s.ing.map(name => byKa[name]).filter(Boolean);
    if (ingObjs.length !== s.ing.length) {
      console.warn(`Skipping "${s.titleKa}" — missing ingredient`);
      continue;
    }

    // Check if suggestion already exists
    const existing = await p.babyMealSuggestion.findFirst({ where: { titleEn: s.titleEn } });
    if (existing) continue;

    const suggestion = await p.babyMealSuggestion.create({
      data: {
        titleKa: s.titleKa,
        titleEn: s.titleEn,
        texture: s.texture,
        minAgeMonths: s.min,
        ingredientLinks: {
          create: ingObjs.map(ing => ({ ingredientId: ing.id })),
        },
      },
    });
    created++;
  }

  console.log(`Seeded ${created} meal suggestions`);
}

run().catch(console.error).finally(() => p.$disconnect());
