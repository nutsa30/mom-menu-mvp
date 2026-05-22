import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const blogs = [
  {
    slug: 'myar-sakvelze-gadasvla-6-tvidan',
    titleKa: 'მყარ საკვებზე გადასვლა 6 თვიდან — სრული სახელმძღვანელო',
    titleEn: 'Starting Solids at 6 Months — Complete Guide for Parents',
    contentKa: `ბავშვის კვებაში ერთ-ერთი ყველაზე მნიშვნელოვანი ეტაპი არის მყარ საკვებზე გადასვლა. ჯანდაცვის მსოფლიო ორგანიზაცია (WHO) რეკომენდაციას იძლევა, რომ ეს პროცესი 6 თვის ასაკიდან დაიწყოს, სანამ დედის რძე ან ადაპტირებული ნარევი ძირითად კვებად რჩება.

როგორ ვიცით, მზადაა თუ არა ბავშვი?

არსებობს სამი მთავარი ნიშანი: ბავშვი შეუძლია თავის გამართვა და მჯდომარე პოზაში ყოფნა; ბავშვს გაქრა "გამოდევნების რეფლექსი" (tongue thrust) — ენა ავტომატურად არ გამოუდის საკვების შეხებაზე; ბავშვი იჩენს ინტერესს ჭამასთან — ხელს წვდება, პირს ღებავს.

პირველი საკვები — ვიდან დავიწყოთ?

პირველი საკვები შეიძლება იყოს ერთ-კომპონენტიანი პიურე: ბოსტნეულიდან — გოგრა, კარტოფილი, სტაფილო, ბოლოქი; ხილიდან — ვაშლი, მსხალი, ბანანი; მარცვლეულიდან — ბრინჯის ფაფა ან შვრია. მნიშვნელოვანია ახალი საკვები 3-4 დღის ინტერვალით შეიყვანოთ, რათა ალერგიული რეაქცია დროულად გამოავლინოთ.

კვების სიხშირე და რაოდენობა

6-7 თვის ასაკში — 1-2 ჯერ კვება დღეში, 2-3 სუფრის კოვზი; 8-9 თვის ასაკში — 2-3 ჯერ კვება, 100-150 მლ; 10-12 თვის ასაკში — 3 ძირითადი კვება + 1-2 სნექი. გახსოვდეთ: ბავშვი თვითონ ამბობს, როდის გძაძდა — აიძულება არ შეიძლება.

ყველაზე გავრცელებული შეცდომები

დამწყები მშობლები ხშირად ძალიან ადრე ან ძალიან გვიან იწყებენ მყარ კვებას. ასევე, ბევრი ამატებს შაქარს და მარილს — ეს კატეგორიულად არ შეიძლება 1 წლამდე. კიდევ ერთი ხშირი შეცდომა: ბავშვის ლიმიტირება ერთ-ორ პროდუქტზე. ადრეული მრავალფეროვნება ამცირებს ახირებული მჭამელის განვითარების რისკს.

moMeals პლატფორმა გთავაზობთ ასაკის მიხედვით შედგენილ დღიურ კვების გეგმებს, რომლებიც ყველა ამ პრინციპს ითვალისწინებს.`,
    contentEn: `Starting solid foods is one of the most important milestones in your baby's development. The World Health Organization (WHO) recommends introducing solids at around 6 months, while breast milk or formula remains the primary source of nutrition.

Signs your baby is ready: Baby can sit up with minimal support and hold their head steady. The tongue-thrust reflex has diminished — baby no longer automatically pushes food out. Baby shows interest in food by reaching for it and opening their mouth.

First foods to introduce: Vegetables — pumpkin, sweet potato, carrot, zucchini. Fruits — apple, pear, banana. Grains — rice cereal or oatmeal porridge. Introduce one new food every 3-4 days to watch for allergic reactions.

Feeding frequency by age: 6-7 months — 1-2 times daily, 2-3 tablespoons. 8-9 months — 2-3 times daily, 100-150ml portions. 10-12 months — 3 main meals plus 1-2 snacks. Always follow your baby's hunger and fullness cues.

Common mistakes to avoid: Starting too early or too late. Adding salt or sugar before age 1. Limiting variety — early exposure to diverse flavors reduces picky eating later. Never force-feeding.

moMeals creates personalized daily meal plans based on your child's exact age and nutritional needs.`,
    imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=80',
    images: [],
    isPublished: true,
  },
  {
    slug: 'dakhrchovis-prevencia-bavshvebistvic',
    titleKa: 'დახრჩობის პრევენცია — რომელი საკვები არის სახიფათო ბავშვისთვის',
    titleEn: 'Choking Prevention in Babies and Toddlers — Safe Foods by Age',
    contentKa: `დახრჩობა ერთ-ერთი ყველაზე გავრცელებული უბედური შემთხვევაა ბავშვებში და მშობლებისთვის ეს ყველაზე დიდ შიშს იწვევს. სწორი ინფორმაცია კი ამ რისკს მნიშვნელოვნად ამცირებს.

მთავარი განსხვავება: დახრჩობა და ხველება

ბავშვები ხშირად ახველებენ კვებისას — ეს ნორმალურია. ახველება ნიშნავს, რომ სასუნთქი გზები მუშაობენ. ნამდვილი დახრჩობისას ბავშვი ხმას ვერ იღებს, პირი ღია აქვს, სახე წითლდება ან ლურჯდება. ასეთ შემთხვევაში 5 ზურგის დარტყმა 5 მუცლის ქვედა ნაწილზე ზეწოლა — სასწრაფოდ.

სახიფათო საკვები ასაკის მიხედვით (1-3 წელი)

1 წლამდე: მტკიცე, მრგვალი ხილი — ყურძენი, ალუბალი (მხოლოდ გახლეჩილი ან დაჭრილი); ნაჭრებად დაუჭრელი ხორცი; ბოლოყი ან სიმინდი ნაჭრებად; ნიგოზი, ფიჩვი, თხილი; ბლინი ან პური, თუ ბავშვს ბევრი გამოუხდება.

1-3 წელი: ყურძენი — ყოველთვის გახლეჩეთ მეოთხედებად; სტაფილო — მხოლოდ შემდუღარე ან გახეხილი; ატამი, ქლიავი — კერკლის გარეშე; პოპკორნი — კატეგორიულად არ შეიძლება 4 წლამდე; სოსისი — მხოლოდ ვერტიკალურად გახლეჩილი.

უსაფრთხო კვების წესები

ბავშვი ყოველთვის მჯდომარე პოზაში ჭამდეს. არასოდეს დაუტოვოთ ბავშვი მარტო კვებისას. ხილი მრგვალი ყოველთვის გახლეჩეთ ან მოხარშეთ. საკვები პატარა ნაჭრებად დაჭერით — 1 სმ x 1 სმ. ნუ გამოიყენებთ ბავშვის გაჩუმებისთვის საკვებს სვლაში ან სათამაშოდ.

Heimlich-ის მანევრის სწავლა

ყველა მშობელს ვურჩევთ ბავშვის სასწრაფო სამედიცინო დახმარების — CPR და Heimlich — კურსის გავლას. საქართველოში ეს კურსები ხელმისაწვდომია სხვადასხვა კლინიკასა და სასწავლო ცენტრში.`,
    contentEn: `Choking is one of the most common accidents involving children, and it causes great anxiety for parents. Having the right information significantly reduces this risk.

The key difference: choking vs. gagging. Gagging is normal — it's the body's defense mechanism. True choking: baby makes no sound, mouth is open, face turns red or blue. In this case, 5 back blows followed by 5 abdominal thrusts immediately.

Dangerous foods by age (1-3 years): Whole grapes or cherries — always cut into quarters. Uncut meat pieces. Raw carrots or corn on the cob. Whole nuts. Popcorn is dangerous until age 4. Hot dogs — only slice lengthwise.

Safe eating rules: Baby should always eat sitting upright. Never leave baby alone while eating. Cut round fruits into small pieces or cook them. Cut all food into 1cm x 1cm pieces. Don't use food to distract or entertain a child while walking.

We strongly recommend all parents take an infant CPR and Heimlich maneuver course. This knowledge can save your child's life.`,
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
    images: [],
    isPublished: true,
  },
  {
    slug: 'rkinit-mdidari-sakvebi-chvilebistvis',
    titleKa: 'რკინით მდიდარი საკვები — ანემიის პრევენცია ბავშვობაში',
    titleEn: 'Iron-Rich Foods for Babies — Preventing Iron Deficiency Anemia',
    contentKa: `რკინის დეფიციტი ბავშვობაში ერთ-ერთი ყველაზე გავრცელებული კვებითი პრობლემაა მსოფლიოში. 6 თვის შემდეგ დედის რძეში რკინა აღარ კმარა ბავშვის საჭიროებისთვის, ამიტომ მყარი საკვებიდან მიღება განსაკუთრებით მნიშვნელოვანია.

რატომ არის რკინა ასე მნიშვნელოვანი?

რკინა აუცილებელია ჰემოგლობინის წარმოქმნისთვის — ცილა, რომელიც ჟანგბადს ატარებს სხეულში. ასევე, მნიშვნელოვანია ტვინის განვითარებისთვის. რკინის დეფიციტი ბავშვობაში შეიძლება გამოიხატოს სისუსტით, ფერმკრთალობით, ზრდის შეფერხებით, ხოლო გამოუსწორებელ შემთხვევაში — კოგნიტური განვითარების პრობლემებით.

რომელი საკვები შეიცავს ყველაზე მეტ რკინას?

ჰემ-რკინა (ჰემოგლობინიდან, უკეთ შეიწოვება): ძროხის ხორცი (განსაკუთრებით ღვიძლი); ქათმის ხორცი; თევზი; კვერცხის გული.

არა-ჰემ-რკინა (მცენარეული): სოიო; ოსპი, ლობიო; ისპანახი, ბროკოლი; ქიშმიში; ბეჭდვიანი მარცვლეული.

მნიშვნელოვანი ტრიუკი: C ვიტამინი ერთად

არა-ჰემ-რკინის შეწოვა 3-ჯერ უმჯობესდება, თუ C ვიტამინი ერთად მიირთმევთ. ისპანახის პიური + ატმის პიური; ოსპის წვნიანი + პომიდვრის ნაჭრები; ბეჭდვიანი ფაფა + ნარინჯის წვენი. ამ კომბინაციებს moMeals-ის კვების გეგმა ავტომატურად ითვალისწინებს.

კვებითი ნორმა ასაკის მიხედვით

7-12 თვის ბავშვს სჭირდება 11 მგ რკინა დღეში; 1-3 წლის ბავშვს — 7 მგ დღეში. ეს ნორმა ეფექტურად დაფარდება, თუ კვირაში 3-4 ჯერ ჩავრთავთ რკინით მდიდარ საკვებს.

დეფიციტის სიმპტომები

ყურადღება მიაქციეთ: ბავშვი ძალიან ღლება, ნაკლებად აქტიურია; ფერი ფერმკრთალია, განსაკუთრებით ტუჩები; ნაკლებად ჭამს ან გიჩვენებს არა-საკვებ ნივთებზე ინტერეს (pica). ამ შემთხვევაში სისხლის ანალიზი ექიმის დანიშნულებით.`,
    contentEn: `Iron deficiency is one of the most common nutritional problems in childhood worldwide. After 6 months, breast milk alone no longer provides enough iron, making iron-rich solid foods critically important.

Why is iron so essential? Iron is necessary for hemoglobin production — the protein that carries oxygen in the blood. It's also crucial for brain development. Iron deficiency in infancy can cause weakness, pallor, growth delays, and in untreated cases, cognitive development problems.

Best iron-rich foods: Heme iron (better absorbed): beef, especially liver; chicken; fish; egg yolks. Non-heme iron (plant-based): soybeans; lentils and beans; spinach, broccoli; raisins; iron-fortified cereals.

Key trick — combine with vitamin C: Non-heme iron absorption triples when eaten with vitamin C. Spinach puree + peach puree. Lentil soup + tomato pieces. Iron-fortified porridge + orange juice. moMeals meal plans automatically include these optimal combinations.

Daily iron requirements: 7-12 months — 11mg per day. 1-3 years — 7mg per day. Including iron-rich foods 3-4 times per week effectively meets these needs.

Signs of iron deficiency: Child tires easily, less active. Pale appearance, especially lips. Reduced appetite. Talk to your doctor if you notice these signs — a simple blood test can diagnose iron-deficiency anemia.`,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
    images: [],
    isPublished: true,
  },
  {
    slug: 'akhirebuli-mchameeli-8-strategia',
    titleKa: 'ახირებული მჭამელი — 8 სტრატეგია, რომელიც მუშაობს',
    titleEn: 'Picky Eater — 8 Science-Backed Strategies That Actually Work',
    contentKa: `"ჩემი ბავშვი არაფერს ჭამს" — ეს ჩივილი ყველაზე ხშირი იმ მშობლებში, ვინც 1-5 წლამდე ბავშვებს ზრდის. კარგი სიახლე: ახირებული კვება ამ ასაკში ნორმაა. ცუდი სიახლე: მცდარი რეაქცია ამ ქცევას გამოამყარებს.

სტრატეგია 1: "სამი უფლება" მეთოდი

ელინ სატერის "პასუხისმგებლობის განაწილება" — მშობელი წყვეტს, რა მიართვას, სად და როდის. ბავშვი წყვეტს, ჭამს თუ არა და რამდენს. ეს ამცირებს კვებაზე კონფლიქტს და ბავშვს ანიჭებს ავტონომიას.

სტრატეგია 2: ახალი საკვები 10-15-ჯერ გაეცანით

კვლევები გვიჩვენებს, რომ ბავშვს ახალი საკვების გასაცნობად საჭიროა 8-15 შეხება. პირველ ხუთ ჯერ ბავშვმა შეიძლება უარი თქვას — ეს ნორმაა, მოქნეულად განაგრძეთ.

სტრატეგია 3: ახალი საკვები + ცნობილი საკვები

ყოველ კვებაში ერთი ახალი პროდუქტი + ერთი უკვე საყვარელი. ახალი კი ყოველთვის "სტუმარია" — ბავშვი ვალდებული არ არის, ჭამოს, მაგრამ "დამეგობრება" სავალდებულოა.

სტრატეგია 4: ჭამა ოჯახთან ერთად

სოციალური კვება ამცირებს სტრესს. ბავშვი ხედავს, რომ სხვებიც ჭამენ ამ საკვებს. მიმბაძველობის ინსტინქტი — ყველაზე ძლიერი იარაღი.

სტრატეგია 5: ინდოეთი ჭამის პროცესში

მიეცით ბავშვს, დამოუკიდებლად ჭამოს — თუნდაც ყველაფერი გადაყაროს. ფუნქია = ჭამაზე ინტერეს. გამოიყენეთ სახელმძღვანელო: კოვზი, ჩანგალი, თითები — ყველა ინსტრუმენტი ერთნაირად კარგია.

სტრატეგია 6: კვების ჩქარობის თავიდან აცილება

ყოველ კვებას დაუთმეთ სულ მცირე 20 წუთი. ჩქარობა და ფიზიკური ზეწოლა — ყველაზე დიდი შეცდომა. ბავშვი სტრესსა და საკვებს ასოციაციაში ყრის.

სტრატეგია 7: "ვარ ოქროს ვარსკვლავი" სისტემა

2-3 წლის ბავშვებისთვის: ვიზუალური მოტივაცია — ყოველი ახალი საკვების გაგემოვნებაზე ნახატი, სტიკერი ან ვარსკვლავი. ეს გამოწვევა და სახალისო გახდის კვებას.

სტრატეგია 8: კვების პროცესში ჩართეთ ბავშვი

ბავშვი, ვინც ყვავილობენ სამზარეულოში, 3-ჯერ უფრო მეტს ჭამს. მიეცით ამოღება, ჩაყრა, შეზელა — ასაკის შესაბამისად. "ჩემმა ხელებმა გააკეთა" ამცირებს ახალ საკვებთან სიფრთხილეს.`,
    contentEn: `"My child won't eat anything" — this is the most common complaint from parents of children aged 1-5. Good news: picky eating at this age is developmentally normal. Bad news: the wrong response can make it permanent.

Strategy 1: The Division of Responsibility (Ellyn Satter method). Parent decides what, where, and when to serve. Child decides whether to eat and how much. This reduces mealtime conflict and gives children appropriate autonomy.

Strategy 2: Expose new foods 10-15 times. Research shows children need 8-15 exposures to a new food before accepting it. Refusal in the first five attempts is completely normal — keep offering calmly.

Strategy 3: New food + familiar food. Every meal includes one new item alongside something already liked. The new food is a "guest" — child doesn't have to eat it, but must get acquainted.

Strategy 4: Family meals together. Social eating reduces food anxiety. Children see others eating the same foods. Imitation instinct is the most powerful tool available.

Strategy 5: Encourage independence at the table. Let children self-feed even if it's messy. Engagement = interest in food. Use spoons, forks, and fingers — all tools are equally valid.

Strategy 6: Avoid mealtime rushing. Allow at least 20 minutes per meal. Rushing and pressure are the biggest mistakes. Children associate stress with food, creating negative relationships with eating.

Strategy 7: Reward curiosity, not consumption. For 2-3 year olds: visual rewards like stickers or drawings for trying (not finishing) new foods. This gamifies eating in a healthy way.

Strategy 8: Involve children in food preparation. Children who help cook eat 3 times more variety. Age-appropriate tasks: stirring, pouring, washing vegetables. "My hands made this" reduces wariness of new foods.`,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    images: [],
    isPublished: true,
  },
  {
    slug: 'baby-led-weaning-sruli-saxelmdzghvanelo',
    titleKa: 'Baby-Led Weaning — ბავშვი თავად ირჩევს. სრული სახელმძღვანელო',
    titleEn: 'Baby-Led Weaning — Complete Guide for First-Time Parents',
    contentKa: `Baby-Led Weaning (BLW) — ეს მიდგომა უკვე 15 წელია მსოფლიოში პოპულარულია, მაგრამ საქართველოში ჯერ ბევრი მშობელი არ იცნობს. BLW ნიშნავს, რომ ბავშვი მყარ კვებაზე გადადის პიურეების გარეშე — პირდაპირ "ნამდვილ" საკვებზე, ოღონდ ასაკის შესაბამის ზომებში.

BLW-ის ძირითადი პრინციპები

6 თვის ასაკიდან, მზაობის ნიშნების შემდეგ, ბავშვს ვთავაზობთ ლმობიერ ან მოხარშულ საკვებს ნაჭრებად — არა გახეხილს. ზომა: სანამ ბავშვი პინცეტის ხელებს ვერ იყენებს (7-8 თვემდე), საკვები ჩვილის მკლავის სიგრძის ნაჭრებად (7-8 სმ). შემდეგ — პატარა ნაჭრებად.

BLW-ის უპირატესობები

კვლევები გვიჩვენებს: BLW-ის ბავშვები უფრო ნაკლებად ახირებული მჭამელები ხდებიან. ადრე ვითარდება ხელის მოტორიკა. ბავშვი სწავლობს სიმძღნარისა და შიმშილის სიგნალებს — ნაკლები სიმსუქნე მოზრდილ ასაკში. ოჯახური სუფრა უფრო ადვილი ხდება.

BLW-ის გამოწვევები — გულწრფელად

ბევრი ჭუჭყი. ბევრი გაგდება. პირველ კვირებში ბავშვი შეიძლება "ითამაშოს" საკვებთან, ვიდრე ჭამოს — ეს ნორმაა. დახრჩობის შიში — გამართლებული, მაგრამ BLW-ით ნათლად სწავლობენ, ახველება კი სხვა რამეა.

BLW-ისთვის შესაფერი პირველი საკვები

ბრინჯი ან შვრია (ოდნავ სქელი); ბოლოქი — მოხარშული და ნაჭრებად; ბანანი — სამ ნაჭრად გახლეჩილი; ბრინჯის ბლინი; ქათმის ნაჭერი მარილის გარეშე; სუჭი — ჩვილის ზომის ნაჭრებად.

BLW vs ტრადიციული პიურე — ვინ "იგებს"?

სიმართლე: არ არსებობს ერთი სწორი გზა. ბევრი მშობელი "კომბინირებულ" მეთოდს იყენებს — ზოგ კვებაში პიურე, ზოგ კვებაში BLW. ბავშვი და მშობელი განსაზღვრავენ, რა მუშაობს.`,
    contentEn: `Baby-Led Weaning (BLW) has been popular worldwide for 15 years, but many parents are still unfamiliar with this approach. BLW means transitioning to solid foods without purees — going directly to "real" food in age-appropriate sizes and textures.

Core BLW principles: Starting at 6 months with readiness signs, offer soft or cooked foods in pieces — not mashed. Size: until baby develops a pincer grasp (around 7-8 months), food should be finger-length sticks (7-8cm). After that, smaller pieces are appropriate.

Benefits of BLW: Research shows BLW babies become less picky eaters. Fine motor skills develop earlier. Babies learn hunger and fullness cues naturally — associated with lower obesity rates later. Family mealtimes become easier.

BLW challenges — honestly: Lots of mess. Lots of food on the floor. In the first weeks, baby may "play" with food more than eat — this is completely normal. Choking fear is understandable, but BLW babies learn to chew and manage food; gagging is different from choking.

Good first BLW foods: Rice or oat porridge (slightly thick). Cooked broccoli florets. Banana cut into three strips. Rice pancakes. Unsalted chicken strips. Zucchini cut into finger-sized pieces.

BLW vs traditional purees — who "wins"? Honestly: there's no single right approach. Many parents use a combined method — purees for some meals, BLW for others. Baby and parent together determine what works best.`,
    imageUrl: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=1200&q=80',
    images: [],
    isPublished: true,
  },
  {
    slug: 'akrdzaluli-sakvebi-ertwlamde-ataswlamde',
    titleKa: '1 წლამდე ბავშვებისთვის 10 საკვები, რომელიც უნდა მოვარიდოთ',
    titleEn: '10 Foods to Avoid for Babies Under 1 Year — Complete Safety Guide',
    contentKa: `1 წლამდე ბავშვის კუჭ-ნაწლავი ჯერ არ არის საკმარისად ჩამოყალიბებული გარკვეული საკვებისა და ნივთიერებების გადასამუშავებლად. ქვემოთ — 10 საკვები, რომელიც ამ ასაკამდე კატეგორიულად არ შეიძლება.

1. თაფლი

ყველაზე მნიშვნელოვანი! თაფლი შეიძლება შეიცავდეს Clostridium botulinum სპორებს, რომელიც ჩვილებში ინფანტილური ბოტულიზმის გამომწვევია. 1 წლამდე — კატეგორიულად არ შეიძლება. ეს ეხება ნებისმიერ ფორმას — ნედლი, გათბობილი, ცხობაში გამოყენებული.

2. მარილი

ჩვილის თირკმელები ჯერ ვერ ამუშავებს ბევრ ნატრიუმს. დღიური ნორმა: 6-12 თვის ბავშვისთვის — 1 გ-ზე ნაკლები. მნიშვნელოვანია: ბრინჯის ბლინები, სოფლის პური, ყველი ხშირად ბევრ მარილს შეიცავს.

3. შაქარი და ტკბილეული

ადრეული შაქარი ყალიბებს ტკბილზე დამოკიდებულებას. ასევე ავითარებს კარიესს (პირველი კბილებიდანვე). ხილის შაქარი ბუნებრივ ხილში — ნორმალურია. დამატებული შაქარი — არა.

4. მთლიანი ძროხის რძე

ძირითად სასმელად 1 წლამდე — არარეკომენდებულია (ფარდობით ბევრ ცილას და ნატრიუმს შეიცავს). სამზარეულოში, ფაფაში — მცირე რაოდენობა ნებადართულია 6 თვის შემდეგ.

5. მთლიანი კაკალი (გახლეჩის გარეშე)

დახრჩობის რისკი. 1 წლამდე — კაკალი მხოლოდ პასტის სახით (არაქისის პასტა, ნუშის პასტა) მცირე რაოდენობით, წყლით განზავებული.

6. ზღვის პროდუქტები მაღალი ვერცხლისწყლით

ზვიგენი, მახვილთევზი, სკუმბრია — ეს სახეობები ამ ასაკამდე არარეკომენდებულია. ლოსოსი, ტუნა (კვირაში ერთხელ), ტილაპია — ნორმალური.

7. ალერგენური საკვები (ადრეული გაცნობა — ახლა რეკომენდებულია!)

ახალი კვლევები: ადრეულმა გაცნობამ (4-6 თვიდან) შეიძლება შეამციროს ალერგია. მაგრამ ალერგიული ოჯახის ისტორიის დროს — ექიმის კონსულტაცია ვალდებულია.

8. ახალი ხახვი და ნიორი

არ წარმოადგენს სერიოზულ საფრთხეს, მაგრამ ამ ასაკის კუჭს უჭირს გადამუშავება. 8-9 თვის შემდეგ — მცირე რაოდენობა შემწვარ სახით.

9. ციტრუსი (6-8 თვემდე)

მჟავიანობა ხშირად იწვევს კანის გამონაყარს ტუჩებსა და ნიკაპზე. 6-8 თვის შემდეგ — ნელ-ნელა შეიყვანეთ.

10. სასმელი წვენები

1 წლამდე — კომლის წვენი 120 მლ-ზე მეტი, ხილის ნებისმიერი ტიპის წვენი — არარეკომენდებულია. მიზეზი: ბევრი შაქარი, ნაკლები ბოჭკო, ვიდრე მთლიანი ხილი.`,
    contentEn: `Until age 1, a baby's digestive system is not fully developed enough to process certain foods and substances. Here are 10 foods to strictly avoid during this period.

1. Honey — Most important! Honey may contain Clostridium botulinum spores causing infant botulism. Absolutely no honey before age 1 in any form — raw, heated, or baked in.

2. Salt — Infant kidneys can't process large amounts of sodium. Daily limit under 1g for 6-12 month olds. Watch out: rice crackers, bread, and cheese often contain significant salt.

3. Sugar and sweets — Early sugar exposure creates a preference for sweet tastes and promotes tooth decay from first teeth. Natural sugar in whole fruit is fine. Added sugar is not.

4. Whole cow's milk as main drink — Not recommended as primary drink before 1 year (contains relatively high protein and sodium). Small amounts in porridge or cooking are fine after 6 months.

5. Whole nuts — Choking hazard. Before 1 year, nuts only as paste (peanut butter, almond butter) in small amounts, thinned with water.

6. High-mercury seafood — Shark, swordfish, king mackerel not recommended at this age. Salmon, canned tuna (once weekly), tilapia are fine.

7. Note on allergens — New research: early introduction (4-6 months) may REDUCE allergy risk. However, with family history of allergies, doctor consultation is mandatory.

8. Raw onion and garlic — Not seriously dangerous but hard on infant digestion. Small amounts cooked are fine after 8-9 months.

9. Citrus fruits (before 6-8 months) — Acidity often causes skin rash around lips and chin. Introduce gradually after 6-8 months.

10. Fruit juices — Under 1 year, no juice exceeding 120ml, and ideally none. Reason: high sugar content, low fiber compared to whole fruit.`,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80',
    images: [],
    isPublished: true,
  },
  {
    slug: 'jasnsakeli-snekebi-mcire-bavshvistvis',
    titleKa: 'ჯანსაღი სნექები 1-3 წლის ბავშვებისთვის — 20 იდეა',
    titleEn: 'Healthy Snacks for Toddlers 1-3 Years — 20 Nutritious Ideas',
    contentKa: `სნექი 1-3 წლის ბავშვისთვის კვების განუყოფელი ნაწილია — მათი მცირე კუჭი ვერ ინახავს საკმარის ენერგიას ძირითად კვებებს შორის. სწორი სნექი კი ამავდროულად ვიტამინების, მინერალებისა და ბოჭკოს მნიშვნელოვანი წყაროა.

რატომ არის სნექი ასე მნიშვნელოვანი?

1-3 წლის ბავშვს სჭირდება 1000-1400 kcal დღეში. 3 ძირითადი კვება ხშირად არ ფარავს ამ საჭიროებას. 2 ჯანსაღი სნექი დღეში — ოპტიმალური სქემა. მნიშვნელოვანია: სნექი ჭამის სამ კვებამდე ერთი საათით ადრე — ბავშვი ჭამა ვახშამზე მოინდომებს.

ხილი და ბოსტნეული — საუკეთესო არჩევანი

ბანანი — ენერგიის სწრაფი წყარო, კალიუმი; ავოკადო ნახევარი — ჯანსაღი ცხიმი, ბოჭკო; ყვითელი, წითელი ან ნარინჯისფერი ბულგარული წიწაკა ნაჭრებად — C ვიტამინი; ბლუბერი — ანტიოქსიდანტები; ბამბუკის ყლორტი (ჩვეულებრივ ყველა ბავშვი უყვარს); სტაფილო — მოხარშული ან გახეხილი.

რძის პროდუქტები — კალციუმი და ცილა

ბუნებრივი იოგურტი (შაქრის გარეშე) + ხილი; ყველი ნაჭრებად (სულუგუნი, ბრინზა — მარილი უნდა ვაკონტროლოთ); კოტეჯ ჩიზი; გახდილი ყველი ბლინზე.

მარცვლეული — ნელი ენერგია

შვრიის ბისკვიტი; ბრინჯის ბლინი ავოკადოთი; ხორბლის ტოსტი არაქისის პასტით (1 წლის შემდეგ); ჩირი შვრია; ბარდა-ბრინჯის ბლინი.

ცილა — ძირითადი სამშენებლო მასალა

მოხარშული კვერცხი — მთლიანი ან ნაჭრებად; ქათმის კუბიკები; ჰუმუსი ბოსტნეულით; ოსპის ბლინი.

20 იდეა, რომელიც ბავშვებს უყვართ

1. ბანანი + არაქისის პასტა; 2. იოგურტი + ბლუბერი; 3. ავოკადო + ტოსტი; 4. სტაფილო + ჰუმუსი; 5. ყველი + ვაშლი; 6. მოხარშული კვერცხი + ტომატი; 7. ბრინჯის ბლინი + ქათამი; 8. ბოლოქი + ჰუმუსი; 9. ნ.იოგურტი + მარწყვი; 10. მოხარშული სიმინდი; 11. ყვითელი წიწაკა + ჰუმუსი; 12. ბრინზა + ყურძენი (გახლეჩილი); 13. ბრინჯის კრეკერი + ავოკადო; 14. ხახვ-ქათმის ბლინი; 15. ატამი + კოტეჯ ჩიზი; 16. მწვანე ბარდა (გაყინული-გაყინული); 17. ბანანი + შვრია; 18. ნ.პომიდვრი ნახევრებად; 19. ხილის სალათი; 20. მოხარშული კარტოფილი.

moMeals-ის გეგმა ყოველდღე ავტომატურად ირჩევს ასაკის შესაბამის სნექს — სეზონის, გემოვნებისა და კვებითი საჭიროებების მიხედვით.`,
    contentEn: `Snacks are an essential part of nutrition for toddlers 1-3 years old — their small stomachs can't store enough energy between main meals. The right snack also provides important vitamins, minerals, and fiber.

Why snacks matter: Toddlers need 1000-1400 kcal daily. Three main meals often don't cover this. Two healthy snacks per day is optimal. Important: offer snacks at least one hour before the next main meal so appetite isn't affected.

Fruits and vegetables — the best choice: Banana — quick energy, potassium. Half an avocado — healthy fats, fiber. Yellow, red, or orange bell pepper strips — vitamin C. Blueberries — antioxidants. Cooked broccoli florets. Grated or cooked carrot.

Dairy — calcium and protein: Plain yogurt (no added sugar) + fruit. Cheese cubes (watch sodium content). Cottage cheese. Cheese spread on a small pancake.

Grains — slow-release energy: Oat biscuit. Rice pancake with avocado. Wheat toast with peanut butter (after age 1). Overnight oats. Pea-rice pancakes.

Protein — essential building blocks: Hard-boiled egg, whole or in pieces. Chicken cubes. Hummus with vegetables. Lentil pancakes.

20 ideas toddlers love: Banana + peanut butter. Yogurt + blueberries. Avocado toast. Carrot + hummus. Cheese + apple slices. Boiled egg + tomato. Rice pancake + chicken. Radish + hummus. Plain yogurt + strawberries. Corn on the cob (soft). Bell pepper + hummus. Bryndza + quartered grapes. Rice cracker + avocado. Chicken-onion pancake. Peach + cottage cheese. Frozen green peas (thawed). Banana oat mix. Cherry tomato halves. Fruit salad. Soft cooked potato.

moMeals automatically selects age-appropriate daily snacks based on season, taste preferences, and nutritional needs.`,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    images: [],
    isPublished: true,
  },
];

async function main() {
  console.log('🌱 Seeding blog posts...');

  for (const blog of blogs) {
    const existing = await prisma.blog.findUnique({ where: { slug: blog.slug } });
    if (existing) {
      console.log(`  ⚠️  Skipping "${blog.titleKa}" — slug already exists`);
      continue;
    }
    await prisma.blog.create({ data: blog });
    console.log(`  ✅  Created: ${blog.titleKa}`);
  }

  console.log('✅ Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
