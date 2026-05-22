import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates: { slug: string; contentKa: string; contentEn: string }[] = [
  {
    slug: 'myar-sakvelze-gadasvla-6-tvidan',
    contentKa: `<p>ბავშვის კვებაში ერთ-ერთი ყველაზე მნიშვნელოვანი ეტაპი არის მყარ საკვებზე გადასვლა. <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">ჯანდაცვის მსოფლიო ორგანიზაცია (WHO)</a> რეკომენდაციას იძლევა, რომ ეს პროცესი <strong>6 თვის ასაკიდან</strong> დაიწყოს, სანამ დედის რძე ან ადაპტირებული ნარევი ძირითად კვებად რჩება.</p>

<h2>როგორ ვიცით, მზადაა თუ არა ბავშვი?</h2>

<p>არსებობს სამი მთავარი ნიშანი, რომლებზეც ყველა პედიატრი ყურადღებას ამახვილებს:</p>

<ul>
  <li>ბავშვი შეუძლია <strong>თავის გამართვა</strong> და მჯდომარე პოზაში ყოფნა მხარდაჭერით</li>
  <li>ბავშვს გაქრა <strong>"გამოდევნების რეფლექსი"</strong> (tongue thrust) — ენა ავტომატურად არ გამოუდის საკვების შეხებაზე</li>
  <li>ბავშვი იჩენს <strong>ინტერესს ჭამასთან</strong> — ხელს წვდება, პირს ღებავს, სხვების ჭამას ადევნებს თვალს</li>
</ul>

<h2>პირველი საკვები — სიდან დავიწყოთ?</h2>

<p>პირველი საკვები შეიძლება იყოს <strong>ერთ-კომპონენტიანი პიურე</strong> — ნელ-ნელა ყოველი ახალი პროდუქტი ცალ-ცალკე:</p>

<ul>
  <li><strong>ბოსტნეული:</strong> გოგრა, კარტოფილი, სტაფილო, ბოლოქი</li>
  <li><strong>ხილი:</strong> ვაშლი, მსხალი, ბანანი</li>
  <li><strong>მარცვლეული:</strong> ბრინჯის ფაფა ან შვრია</li>
</ul>

<p>მნიშვნელოვანია ახალი საკვები <strong>3-4 დღის ინტერვალით</strong> შეიყვანოთ, რათა ალერგიული რეაქცია დროულად გამოავლინოთ. <a href="https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/Starting-Solid-Foods.aspx" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics-ის</a> რეკომენდაციებიც ამ პრინციპს ადასტურებს.</p>

<h2>კვების სიხშირე და რაოდენობა ასაკის მიხედვით</h2>

<ul>
  <li><strong>6–7 თვე:</strong> 1–2 ჯერ კვება დღეში, 2–3 სუფრის კოვზი</li>
  <li><strong>8–9 თვე:</strong> 2–3 ჯერ კვება, 100–150 მლ</li>
  <li><strong>10–12 თვე:</strong> 3 ძირითადი კვება + 1–2 სნექი</li>
</ul>

<p>გახსოვდეთ: <strong>ბავშვი თვითონ ამბობს, როდის გამძაძდა</strong> — აიძულება არ შეიძლება. კვების სტრესი მოგვიანებით ახირებული მჭამელის განვითარების მიზეზი ხდება.</p>

<h2>ყველაზე გავრცელებული შეცდომები</h2>

<ul>
  <li>ძალიან <strong>ადრე ან ძალიან გვიან</strong> დაწყება (4 თვემდე ან 7 თვის შემდეგ)</li>
  <li><strong>შაქრისა და მარილის</strong> დამატება — კატეგორიულად არ შეიძლება 1 წლამდე</li>
  <li>ბავშვის <strong>ლიმიტირება</strong> ერთ-ორ პროდუქტზე — ადრეული მრავალფეროვნება ამცირებს ახირებული მჭამელის განვითარების რისკს</li>
  <li><strong>ძალდატანება</strong> — ნებისმიერი ფორმით</li>
</ul>

<p><a href="/">moMeals პლატფორმა</a> გთავაზობთ <strong>ასაკის მიხედვით შედგენილ დღიურ კვების გეგმებს</strong>, რომლებიც ყველა ამ პრინციპს ითვალისწინებს — ავტომატურად, ყოველი დღისთვის.</p>`,

    contentEn: `<p>Starting solid foods is one of the most important milestones in your baby's development. The <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">World Health Organization (WHO)</a> recommends introducing solids at around <strong>6 months</strong>, while breast milk or formula remains the primary source of nutrition.</p>

<h2>Signs Your Baby Is Ready</h2>

<p>There are three key readiness signs that every pediatrician looks for:</p>

<ul>
  <li>Baby can <strong>sit up with minimal support</strong> and hold their head steady</li>
  <li>The <strong>tongue-thrust reflex has diminished</strong> — baby no longer automatically pushes food out</li>
  <li>Baby shows <strong>interest in food</strong> by reaching for it, opening their mouth, and watching others eat</li>
</ul>

<h2>First Foods — Where to Begin?</h2>

<p>Start with <strong>single-ingredient purees</strong>, introducing each new food separately:</p>

<ul>
  <li><strong>Vegetables:</strong> pumpkin, sweet potato, carrot, zucchini</li>
  <li><strong>Fruits:</strong> apple, pear, banana</li>
  <li><strong>Grains:</strong> rice cereal or oatmeal porridge</li>
</ul>

<p>Introduce one new food every <strong>3–4 days</strong> to watch for allergic reactions. The <a href="https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/Starting-Solid-Foods.aspx" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics</a> confirms this approach as the gold standard.</p>

<h2>Feeding Frequency by Age</h2>

<ul>
  <li><strong>6–7 months:</strong> 1–2 times daily, 2–3 tablespoons</li>
  <li><strong>8–9 months:</strong> 2–3 times daily, 100–150ml portions</li>
  <li><strong>10–12 months:</strong> 3 main meals plus 1–2 snacks</li>
</ul>

<p>Always <strong>follow your baby's hunger and fullness cues</strong> — never force-feed. Mealtime pressure creates negative associations with food that can persist for years.</p>

<h2>Common Mistakes to Avoid</h2>

<ul>
  <li>Starting <strong>too early or too late</strong> (before 4 months or after 7 months)</li>
  <li>Adding <strong>salt or sugar</strong> — strictly off-limits before age 1</li>
  <li><strong>Limiting variety</strong> — early exposure to diverse flavors reduces picky eating later in childhood</li>
  <li><strong>Force-feeding</strong> in any form</li>
</ul>

<p><a href="/">moMeals</a> creates <strong>personalized daily meal plans</strong> based on your child's exact age and nutritional needs — automatically, for every single day.</p>`,
  },

  {
    slug: 'dakhrchovis-prevencia-bavshvebistvic',
    contentKa: `<p>დახრჩობა ერთ-ერთი ყველაზე გავრცელებული უბედური შემთხვევაა ბავშვებში და მშობლებისთვის ეს ყველაზე დიდ შიშს იწვევს. <strong>სწორი ინფორმაცია</strong> კი ამ რისკს მნიშვნელოვნად ამცირებს.</p>

<h2>მთავარი განსხვავება: დახრჩობა vs. ახველება</h2>

<p>ბავშვები ხშირად ახველებენ კვებისას — <strong>ეს ნორმალურია</strong>. ახველება ნიშნავს, რომ სასუნთქი გზები მუშაობენ და სხეული თვითონ ასუფთავებს. <strong>ნამდვილი დახრჩობისას</strong> კი:</p>

<ul>
  <li>ბავშვი <strong>ხმას ვერ იღებს</strong></li>
  <li>პირი <strong>ღია</strong> აქვს და ამოსუნთქვა არ ხდება</li>
  <li>სახე <strong>წითლდება ან ლურჯდება</strong></li>
</ul>

<p>ასეთ შემთხვევაში — <strong>5 ზურგის დარტყმა, შემდეგ 5 მუცლის ქვედა ნაწილზე ზეწოლა</strong> — სასწრაფოდ. <a href="https://www.redcross.org/take-a-class/infant-first-aid" target="_blank" rel="noopener noreferrer">Red Cross-ის სასწავლო კურსები</a> ამ მანევრს ასწავლიან.</p>

<h2>სახიფათო საკვები 1 წლამდე</h2>

<ul>
  <li><strong>მტკიცე, მრგვალი ხილი</strong> — ყურძენი, ალუბალი (მხოლოდ გახლეჩილი ან დაჭრილი)</li>
  <li><strong>ნაჭრებად დაუჭრელი ხორცი</strong> ან სოსისი</li>
  <li><strong>ბოლოყი ან სიმინდი</strong> ნაჭრებად</li>
  <li><strong>მთლიანი კაკალი</strong>, ფიჩვი, თხილი</li>
  <li><strong>ბლინი ან პური</strong>, თუ ბავშვს ბევრი ნაჭერი ერთდროულად ხელში ექნება</li>
</ul>

<h2>სახიფათო საკვები 1–3 წელი</h2>

<ul>
  <li><strong>ყურძენი</strong> — ყოველთვის გახლეჩეთ მეოთხედებად</li>
  <li><strong>სტაფილო</strong> — მხოლოდ შემდუღარე ან გახეხილი</li>
  <li><strong>ატამი, ქლიავი</strong> — კერკლის გარეშე</li>
  <li><strong>პოპკორნი</strong> — კატეგორიულად არ შეიძლება 4 წლამდე</li>
  <li><strong>სოსისი</strong> — მხოლოდ ვერტიკალურად გახლეჩილი</li>
</ul>

<h2>უსაფრთხო კვების წესები</h2>

<ul>
  <li>ბავშვი <strong>ყოველთვის მჯდომარე პოზაში</strong> ჭამდეს</li>
  <li><strong>არასოდეს</strong> დაუტოვოთ ბავშვი მარტო კვებისას</li>
  <li>მრგვალი ხილი ყოველთვის <strong>გახლეჩეთ ან მოხარშეთ</strong></li>
  <li>საკვები <strong>პატარა ნაჭრებად</strong> დაჭერით — 1 სმ × 1 სმ</li>
  <li>ნუ გამოიყენებთ საკვებს <strong>სვლაში ან სათამაშოდ</strong></li>
</ul>

<h2>Heimlich-ის მანევრი — ისწავლეთ!</h2>

<p>ყველა მშობელს ვურჩევთ <strong>ბავშვის სასწრაფო სამედიცინო დახმარების კურსის გავლას</strong> — CPR და Heimlich. <a href="https://www.sja.org.uk/get-trained/baby-and-child-first-aid/" target="_blank" rel="noopener noreferrer">ბავშვთა პირველი დახმარების კურსები</a> ხელმისაწვდომია ონლაინ ფორმატითაც. საქართველოში ეს კურსები ხელმისაწვდომია სხვადასხვა კლინიკასა და სასწავლო ცენტრში.</p>`,

    contentEn: `<p>Choking is one of the most common accidents involving children, and it causes great anxiety for parents. <strong>Having the right information</strong> significantly reduces this risk — and can save a life.</p>

<h2>The Key Difference: Choking vs. Gagging</h2>

<p>Babies often gag during feeding — <strong>this is completely normal</strong>. Gagging means the airway defense mechanism is working. <strong>True choking</strong> looks different:</p>

<ul>
  <li>Baby <strong>makes no sound</strong></li>
  <li>Mouth is <strong>open</strong> but no air moves</li>
  <li>Face turns <strong>red or blue</strong></li>
</ul>

<p>In this case — <strong>5 back blows followed by 5 abdominal thrusts</strong> immediately. <a href="https://www.redcross.org/take-a-class/infant-first-aid" target="_blank" rel="noopener noreferrer">Red Cross infant first aid courses</a> teach this maneuver step-by-step.</p>

<h2>Dangerous Foods Under Age 1</h2>

<ul>
  <li><strong>Whole round fruits</strong> — grapes, cherries (only cut into quarters)</li>
  <li><strong>Uncut meat</strong> or hot dogs</li>
  <li><strong>Raw vegetables</strong> — whole carrot sticks or corn on the cob</li>
  <li><strong>Whole nuts</strong> — any variety</li>
  <li><strong>Crackers or bread</strong> if baby gets a large handful at once</li>
</ul>

<h2>Dangerous Foods Ages 1–3</h2>

<ul>
  <li><strong>Grapes</strong> — always cut into quarters</li>
  <li><strong>Raw carrots</strong> — only grated or cooked soft</li>
  <li><strong>Stone fruits</strong> — peaches, plums — always remove the pit</li>
  <li><strong>Popcorn</strong> — absolutely not before age 4</li>
  <li><strong>Hot dogs</strong> — only slice lengthwise, then into small pieces</li>
</ul>

<h2>Safe Eating Rules</h2>

<ul>
  <li>Baby should always eat <strong>sitting upright</strong></li>
  <li><strong>Never leave</strong> baby alone while eating</li>
  <li>Cut round fruits into <strong>small pieces</strong> or cook until soft</li>
  <li>Cut all foods into <strong>1cm × 1cm pieces</strong> for toddlers</li>
  <li>Don't use food to distract while <strong>walking or playing</strong></li>
</ul>

<h2>Learn the Heimlich Maneuver</h2>

<p>We strongly recommend all parents take an <strong>infant CPR and choking response course</strong>. <a href="https://www.sja.org.uk/get-trained/baby-and-child-first-aid/" target="_blank" rel="noopener noreferrer">Baby and child first aid courses</a> are available online and in-person. This knowledge can save your child's life.</p>`,
  },

  {
    slug: 'rkinit-mdidari-sakvebi-chvilebistvis',
    contentKa: `<p>რკინის დეფიციტი ბავშვობაში ერთ-ერთი ყველაზე გავრცელებული კვებითი პრობლემაა მსოფლიოში. <strong>6 თვის შემდეგ</strong> დედის რძეში რკინა აღარ კმარა ბავშვის საჭიროებისთვის, ამიტომ მყარი საკვებიდან მიღება განსაკუთრებით მნიშვნელოვანია.</p>

<h2>რატომ არის რკინა ასე მნიშვნელოვანი?</h2>

<p>რკინა აუცილებელია <strong>ჰემოგლობინის</strong> წარმოქმნისთვის — ცილა, რომელიც ჟანგბადს ატარებს სხეულში. ასევე, <strong>ტვინის განვითარებისთვის</strong> გადამწყვეტი როლი აქვს. <a href="https://www.who.int/publications/i/item/9789241596664" target="_blank" rel="noopener noreferrer">WHO-ს კვლევების</a> თანახმად, რკინის დეფიციტი ბავშვობაში შეიძლება გამოიხატოს:</p>

<ul>
  <li>სისუსტით და ფერმკრთალობით</li>
  <li>ზრდის შეფერხებით</li>
  <li>კოგნიტური განვითარების გამოუსწორებელი პრობლემებით</li>
</ul>

<h2>სად ვიპოვოთ ყველაზე მეტი რკინა?</h2>

<h3>ჰემ-რკინა (ჰემოგლობინიდან — უკეთ შეიწოვება)</h3>
<ul>
  <li><strong>ძროხის ხორცი</strong> — განსაკუთრებით ღვიძლი (100 გ-ში 6.5 მგ)</li>
  <li><strong>ქათმის ხორცი</strong></li>
  <li><strong>თევზი</strong> — ლოსოსი, ტუნა, ტილაპია</li>
  <li><strong>კვერცხის გული</strong></li>
</ul>

<h3>არა-ჰემ-რკინა (მცენარეული წარმოშობის)</h3>
<ul>
  <li><strong>ოსპი და ლობიო</strong></li>
  <li><strong>ისპანახი, ბროკოლი</strong></li>
  <li><strong>ქიშმიში</strong></li>
  <li><strong>რკინით გამდიდრებული მარცვლეული</strong></li>
</ul>

<h2>მნიშვნელოვანი ტრიუკი: C ვიტამინი ერთად</h2>

<p>არა-ჰემ-რკინის შეწოვა <strong>3-ჯერ უმჯობესდება</strong>, თუ <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3999603/" target="_blank" rel="noopener noreferrer">C ვიტამინი ერთად მიირთმევთ</a>. სწორი კომბინაციები:</p>

<ul>
  <li>ისპანახის პიური + <strong>ატმის პიური</strong></li>
  <li>ოსპის წვნიანი + <strong>პომიდვრის ნაჭრები</strong></li>
  <li>რკინით გამდიდრებული ფაფა + <strong>ნარინჯის წვენი</strong></li>
</ul>

<p><a href="/">moMeals-ის კვების გეგმა</a> ავტომატურად ითვალისწინებს ამ კომბინაციებს ყოველდღიურ მენიუში.</p>

<h2>კვებითი ნორმა ასაკის მიხედვით</h2>

<ul>
  <li><strong>7–12 თვის ბავშვს</strong> სჭირდება 11 მგ რკინა დღეში</li>
  <li><strong>1–3 წლის ბავშვს</strong> — 7 მგ დღეში</li>
</ul>

<p>ეს ნორმა ეფექტურად დაფარდება, თუ <strong>კვირაში 3–4 ჯერ</strong> ჩავრთავთ რკინით მდიდარ საკვებს.</p>

<h2>დეფიციტის სიმპტომები — ყურადღება!</h2>

<ul>
  <li>ბავშვი ძალიან <strong>ღლება, ნაკლებად</strong> აქტიურია</li>
  <li>ფერი <strong>ფერმკრთალია</strong>, განსაკუთრებით ტუჩები</li>
  <li>ნაკლებად ჭამს ან გიჩვენებს <strong>არა-საკვებ ნივთებზე ინტერეს</strong> (pica)</li>
</ul>

<p>ამ სიმპტომების შემჩნევისას — <strong>სისხლის ანალიზი ექიმის დანიშნულებით</strong>. ადრეული გამოვლენა სრულიად განკურნებადია.</p>`,

    contentEn: `<p>Iron deficiency is one of the most common nutritional problems in childhood worldwide. After <strong>6 months</strong>, breast milk alone no longer provides enough iron, making iron-rich solid foods critically important for healthy development.</p>

<h2>Why Is Iron So Essential?</h2>

<p>Iron is necessary for <strong>hemoglobin production</strong> — the protein that carries oxygen in the blood. It's also crucial for <strong>brain development</strong>. According to <a href="https://www.who.int/publications/i/item/9789241596664" target="_blank" rel="noopener noreferrer">WHO research</a>, iron deficiency in infancy can cause:</p>

<ul>
  <li>Weakness and pale appearance</li>
  <li>Growth delays</li>
  <li>Irreversible cognitive development problems</li>
</ul>

<h2>Best Iron-Rich Foods</h2>

<h3>Heme Iron (from animal sources — better absorbed)</h3>
<ul>
  <li><strong>Beef</strong> — especially liver (6.5mg per 100g)</li>
  <li><strong>Chicken</strong></li>
  <li><strong>Fish</strong> — salmon, tuna, tilapia</li>
  <li><strong>Egg yolks</strong></li>
</ul>

<h3>Non-Heme Iron (plant-based sources)</h3>
<ul>
  <li><strong>Lentils and beans</strong></li>
  <li><strong>Spinach and broccoli</strong></li>
  <li><strong>Raisins</strong></li>
  <li><strong>Iron-fortified cereals</strong></li>
</ul>

<h2>Key Trick — Combine with Vitamin C</h2>

<p>Non-heme iron absorption <strong>triples</strong> when eaten alongside <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3999603/" target="_blank" rel="noopener noreferrer">vitamin C-rich foods</a>. Optimal combinations:</p>

<ul>
  <li>Spinach puree + <strong>peach puree</strong></li>
  <li>Lentil soup + <strong>tomato pieces</strong></li>
  <li>Iron-fortified porridge + <strong>orange juice</strong></li>
</ul>

<p><a href="/">moMeals meal plans</a> automatically include these optimal iron + vitamin C combinations every day.</p>

<h2>Daily Iron Requirements by Age</h2>

<ul>
  <li><strong>7–12 months:</strong> 11mg per day</li>
  <li><strong>1–3 years:</strong> 7mg per day</li>
</ul>

<p>Including iron-rich foods <strong>3–4 times per week</strong> effectively meets these requirements for most children.</p>

<h2>Signs of Iron Deficiency</h2>

<ul>
  <li>Child <strong>tires easily</strong> and is less active than usual</li>
  <li><strong>Pale appearance</strong>, especially around the lips</li>
  <li>Reduced appetite or interest in <strong>non-food items</strong> (pica)</li>
</ul>

<p>If you notice these signs — <strong>ask your doctor for a blood test</strong>. Iron-deficiency anemia caught early is completely treatable.</p>`,
  },

  {
    slug: 'akhirebuli-mchameeli-8-strategia',
    contentKa: `<p>"ჩემი ბავშვი არაფერს ჭამს" — ეს ჩივილი ყველაზე ხშირია 1–5 წლამდე ბავშვების მშობლებში. <strong>კარგი სიახლე:</strong> ახირებული კვება ამ ასაკში ნორმაა. <strong>ცუდი სიახლე:</strong> მცდარი რეაქცია ამ ქცევას სამუდამოდ გამოამყარებს.</p>

<h2>სტრატეგია 1: "პასუხისმგებლობის განაწილება"</h2>

<p><a href="https://www.ellynsatterinstitute.org/how-to-feed/the-division-of-responsibility-in-feeding/" target="_blank" rel="noopener noreferrer">ელინ სატერის მეთოდი</a> — ყველაზე კარგად დოკუმენტირებული მიდგომა ახირებული მჭამელებისთვის:</p>

<ul>
  <li><strong>მშობელი წყვეტს:</strong> რა მიართვას, სად და როდის</li>
  <li><strong>ბავშვი წყვეტს:</strong> ჭამს თუ არა და რამდენს</li>
</ul>

<p>ეს ამცირებს კვებაზე კონფლიქტს და ბავშვს ანიჭებს ავტონომიას — ძალდატანება კი პირიქით, ახირებას ამყარებს.</p>

<h2>სტრატეგია 2: ახალი საკვები 10–15-ჯერ გაეცანით</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/17181294/" target="_blank" rel="noopener noreferrer">კვლევები გვიჩვენებს</a>, რომ ბავშვს ახალი საკვების გასაცნობად საჭიროა <strong>8–15 შეხება</strong>. პირველ ხუთ ჯერ ბავშვმა შეიძლება <strong>უარი თქვას — ეს ნორმაა</strong>, მოქნეულად განაგრძეთ.</p>

<h2>სტრატეგია 3: ახალი საკვები + ცნობილი საკვები</h2>

<p>ყოველ კვებაში <strong>ერთი ახალი პროდუქტი + ერთი უკვე საყვარელი</strong>. ახალი კი ყოველთვის "სტუმარია" — ბავშვი ვალდებული არ არის, ჭამოს, მაგრამ "დამეგობრება" სავალდებულოა.</p>

<h2>სტრატეგია 4: ჭამა ოჯახთან ერთად</h2>

<p>სოციალური კვება ამცირებს სტრესს. ბავშვი ხედავს, რომ <strong>სხვებიც ჭამენ ამ საკვებს</strong>. <strong>მიმბაძველობის ინსტინქტი</strong> — ყველაზე ძლიერი იარაღი, რაც მშობელს აქვს.</p>

<h2>სტრატეგია 5: დამოუკიდებლობა ჭამის პროცესში</h2>

<p>მიეცით ბავშვს, <strong>დამოუკიდებლად ჭამოს</strong> — თუნდაც ყველაფერი გადაყაროს. ფუნქია = ჭამაზე ინტერეს. გამოიყენეთ კოვზი, ჩანგალი, თითები — <strong>ყველა ინსტრუმენტი ერთნაირად კარგია</strong>.</p>

<h2>სტრატეგია 6: კვების ჩქარობის თავიდან აცილება</h2>

<p>ყოველ კვებას დაუთმეთ <strong>სულ მცირე 20 წუთი</strong>. ჩქარობა და ფიზიკური ზეწოლა — ყველაზე დიდი შეცდომა. <strong>ბავშვი სტრესსა და საკვებს ასოციაციაში ყრის</strong>, რაც გრძელვადიან პრობლემებს ქმნის.</p>

<h2>სტრატეგია 7: ვიზუალური მოტივაცია</h2>

<p>2–3 წლის ბავშვებისთვის: <strong>ვიზუალური მოტივაცია</strong> — ყოველი ახალი საკვების გაგემოვნებაზე ნახატი, სტიკერი ან ვარსკვლავი. ეს <strong>გამოწვევად</strong> და სახალისოდ გახდის კვებას — ყოველგვარი ზეწოლის გარეშე.</p>

<h2>სტრატეგია 8: ჩართეთ ბავშვი სამზარეულოში</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/25294560/" target="_blank" rel="noopener noreferrer">კვლევები ადასტურებს</a>, რომ ბავშვი, ვინც <strong>ყვავილობს სამზარეულოში</strong>, 3-ჯერ უფრო მეტ მრავალფეროვნებას ჭამს. ასაკის შესაბამისი ამოცანები: ამოღება, ჩაყრა, შეზელა. <em>"ჩემმა ხელებმა გააკეთა"</em> — ამ გრძნობა ამცირებს ახალ საკვებთან სიფრთხილეს.</p>

<p><a href="/">moMeals-ის დღიური გეგმები</a> ეხმარება მშობლებს <strong>ვარიანტობის</strong> შენარჩუნებაში — ყოველ კვებაში ახალი + ნაცნობი კომბინაციის პრინციპის დაცვით.</p>`,

    contentEn: `<p>"My child won't eat anything" — this is the most common complaint from parents of children aged 1–5. <strong>Good news:</strong> picky eating at this age is developmentally normal. <strong>Bad news:</strong> the wrong response can make it permanent.</p>

<h2>Strategy 1: The Division of Responsibility</h2>

<p>The <a href="https://www.ellynsatterinstitute.org/how-to-feed/the-division-of-responsibility-in-feeding/" target="_blank" rel="noopener noreferrer">Ellyn Satter method</a> — the most research-backed approach for picky eaters:</p>

<ul>
  <li><strong>Parent decides:</strong> what to serve, where, and when</li>
  <li><strong>Child decides:</strong> whether to eat and how much</li>
</ul>

<p>This reduces mealtime conflict and gives children appropriate autonomy — pressure and force-feeding reinforce pickiness.</p>

<h2>Strategy 2: Expose New Foods 10–15 Times</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/17181294/" target="_blank" rel="noopener noreferrer">Research shows</a> children need <strong>8–15 exposures</strong> to a new food before accepting it. Refusal in the first five attempts is <strong>completely normal</strong> — keep offering calmly without pressure.</p>

<h2>Strategy 3: New Food + Familiar Food</h2>

<p>Every meal includes <strong>one new item alongside something already liked</strong>. The new food is a "guest" — child doesn't have to eat it, but must get acquainted with it at the table.</p>

<h2>Strategy 4: Family Meals Together</h2>

<p>Social eating reduces food anxiety. Children see that <strong>others eat these foods too</strong>. <strong>Imitation instinct</strong> is the most powerful tool available — more effective than any coaxing.</p>

<h2>Strategy 5: Encourage Independence at the Table</h2>

<p>Let children <strong>self-feed</strong> even if it's messy. Engagement = interest in food. Spoons, forks, and fingers — <strong>all tools are equally valid</strong> for toddlers.</p>

<h2>Strategy 6: Avoid Mealtime Rushing</h2>

<p>Allow at least <strong>20 minutes per meal</strong>. Rushing and pressure are the biggest mistakes. <strong>Children associate stress with food</strong>, creating negative eating relationships that can last decades.</p>

<h2>Strategy 7: Reward Curiosity, Not Consumption</h2>

<p>For 2–3 year olds: <strong>visual rewards</strong> like stickers or drawings for trying (not finishing) new foods. This gamifies eating in a healthy way — no pressure, just curiosity rewarded.</p>

<h2>Strategy 8: Involve Children in Cooking</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/25294560/" target="_blank" rel="noopener noreferrer">Research confirms</a> children who <strong>help in the kitchen</strong> eat 3× more variety. Age-appropriate tasks: stirring, pouring, washing vegetables. <em>"My hands made this"</em> reduces wariness of unfamiliar foods.</p>

<p><a href="/">moMeals daily plans</a> help parents maintain <strong>variety</strong> — automatically combining new and familiar foods at every meal.</p>`,
  },

  {
    slug: 'baby-led-weaning-sruli-saxelmdzghvanelo',
    contentKa: `<p><strong>Baby-Led Weaning (BLW)</strong> — ეს მიდგომა უკვე 15 წელია მსოფლიოში პოპულარულია, მაგრამ საქართველოში ჯერ ბევრი მშობელი არ იცნობს. BLW ნიშნავს, რომ ბავშვი მყარ კვებაზე გადადის <strong>პიურეების გარეშე</strong> — პირდაპირ "ნამდვილ" საკვებზე, ოღონდ ასაკის შესაბამის ზომებში.</p>

<h2>BLW-ის ძირითადი პრინციპები</h2>

<p>6 თვის ასაკიდან, <a href="/blog/myar-sakvelze-gadasvla-6-tvidan">მზაობის ნიშნების</a> შემდეგ, ბავშვს ვთავაზობთ <strong>ლმობიერ ან მოხარშულ საკვებს ნაჭრებად</strong> — არა გახეხილს. ზომა:</p>

<ul>
  <li><strong>7–8 თვემდე</strong> (პინცეტის ხელი ჯერ არ განვითარებულა): ჩვილის მკლავის სიგრძის ნაჭრები — 7–8 სმ</li>
  <li><strong>8 თვის შემდეგ:</strong> პატარა ნაჭრები 1–2 სმ ზომის</li>
</ul>

<h2>BLW-ის უპირატესობები</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/22003441/" target="_blank" rel="noopener noreferrer">კვლევები გვიჩვენებს</a>:</p>

<ul>
  <li>BLW-ის ბავშვები <strong>უფრო ნაკლებად ახირებული მჭამელები</strong> ხდებიან</li>
  <li>ადრე ვითარდება <strong>ხელის მოტორიკა</strong></li>
  <li>ბავშვი სწავლობს <strong>სიმძღნარისა და შიმშილის სიგნალებს</strong> — ნაკლები სიმსუქნე მოზრდილ ასაკში</li>
  <li>ოჯახური სუფრა <strong>უფრო ადვილი</strong> ხდება — ბავშვი ოჯახის კვებას ჭამს</li>
</ul>

<h2>BLW-ის გამოწვევები — გულწრფელად</h2>

<ul>
  <li><strong>ბევრი ჭუჭყი</strong> — ეს ნორმაა, ეს სწავლაა</li>
  <li><strong>ბევრი გაგდება</strong> — პირველ კვირებში ბავშვი "ითამაშოს" ვიდრე ჭამოს</li>
  <li><strong>დახრჩობის შიში</strong> — <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">ახველება სხვა რამეა</a>, BLW-ით ბავშვი ნათლად სწავლობს საკვების გადანაყრებას</li>
</ul>

<h2>BLW-ისთვის შესაფერი პირველი საკვები</h2>

<ul>
  <li><strong>ბრინჯი ან შვრია</strong> — ოდნავ სქელი, კოვზიდან</li>
  <li><strong>ბოლოქი</strong> — კარგად მოხარშული, ნაჭრებად</li>
  <li><strong>ბანანი</strong> — სამ ნაჭრად გახლეჩილი (კანი ოდნავ დაუტოვეთ — ადვილად ეჭირება)</li>
  <li><strong>ბრინჯის ბლინი</strong> — მარილის გარეშე</li>
  <li><strong>ქათმის ნაჭერი</strong> — მარილის გარეშე, ლმობიერი</li>
  <li><strong>სუჭი</strong> — ჩვილის ზომის ნაჭრებად, კარგად შემდუღარე</li>
</ul>

<h2>BLW vs ტრადიციული პიურე — ვინ "იგებს"?</h2>

<p>სიმართლე: <strong>არ არსებობს ერთი სწორი გზა</strong>. ბევრი მშობელი <em>"კომბინირებულ"</em> მეთოდს იყენებს — ზოგ კვებაში პიურე, ზოგ კვებაში BLW. <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5438437/" target="_blank" rel="noopener noreferrer">კვლევები ადასტურებს</a>, რომ ორივე მეთოდს კარგი შედეგი აქვს, თუ ბავშვის ინტერესს მივყვებით.</p>`,

    contentEn: `<p><strong>Baby-Led Weaning (BLW)</strong> has been popular worldwide for 15 years, but many parents are still unfamiliar with this approach. BLW means transitioning to solid foods <strong>without purees</strong> — going directly to "real" food in age-appropriate sizes and textures.</p>

<h2>Core BLW Principles</h2>

<p>Starting at 6 months with <a href="/blog/myar-sakvelze-gadasvla-6-tvidan">readiness signs</a>, offer <strong>soft or cooked foods in pieces</strong> — not mashed. Size guidelines:</p>

<ul>
  <li><strong>Until 7–8 months</strong> (before pincer grasp develops): finger-length sticks — 7–8cm long</li>
  <li><strong>After 8 months:</strong> smaller pieces, 1–2cm in size</li>
</ul>

<h2>Benefits of BLW</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/22003441/" target="_blank" rel="noopener noreferrer">Research shows</a>:</p>

<ul>
  <li>BLW babies become <strong>significantly less picky eaters</strong></li>
  <li><strong>Fine motor skills</strong> develop earlier</li>
  <li>Babies learn natural <strong>hunger and fullness cues</strong> — associated with lower obesity rates later</li>
  <li>Family mealtimes become <strong>easier</strong> — baby eats what the family eats</li>
</ul>

<h2>BLW Challenges — Honestly</h2>

<ul>
  <li><strong>Lots of mess</strong> — this is normal, this is learning</li>
  <li><strong>Lots of food on the floor</strong> — in the first weeks, baby may "play" more than eat</li>
  <li><strong>Choking fear</strong> — <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">gagging is different from choking</a>; BLW babies learn to manage food texture through gagging</li>
</ul>

<h2>Good First BLW Foods</h2>

<ul>
  <li><strong>Rice or oat porridge</strong> — slightly thick, offered on a spoon or preloaded</li>
  <li><strong>Broccoli florets</strong> — well cooked, soft enough to squish</li>
  <li><strong>Banana</strong> — cut into three strips (leave a little peel for grip)</li>
  <li><strong>Rice pancakes</strong> — no added salt</li>
  <li><strong>Chicken strips</strong> — unsalted, tender</li>
  <li><strong>Zucchini</strong> — finger-sized pieces, well cooked</li>
</ul>

<h2>BLW vs Traditional Purees — Who "Wins"?</h2>

<p>Honestly: <strong>there's no single right approach</strong>. Many parents use a <em>combined method</em> — purees for some meals, BLW for others. <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5438437/" target="_blank" rel="noopener noreferrer">Research confirms</a> both approaches have good outcomes when you follow the baby's lead and interest.</p>`,
  },

  {
    slug: 'akrdzaluli-sakvebi-ertwlamde-ataswlamde',
    contentKa: `<p>1 წლამდე ბავშვის კუჭ-ნაწლავი ჯერ არ არის საკმარისად ჩამოყალიბებული გარკვეული საკვებისა და ნივთიერებების გადასამუშავებლად. <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">WHO-ს</a> და <a href="https://www.healthychildren.org/" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics-ის</a> რეკომენდაციებზე დაყრდნობით — <strong>10 საკვები, რომელიც ამ ასაკამდე კატეგორიულად არ შეიძლება</strong>.</p>

<h2>1. თაფლი — ყველაზე მნიშვნელოვანი!</h2>

<p>თაფლი შეიძლება შეიცავდეს <em>Clostridium botulinum</em> სპორებს, რომელიც ჩვილებში <strong>ინფანტილური ბოტულიზმის</strong> გამომწვევია. <strong>1 წლამდე — კატეგორიულად არ შეიძლება</strong> ნებისმიერ ფორმაში — ნედლი, გათბობილი, ცხობაში გამოყენებული.</p>

<h2>2. მარილი</h2>

<p>ჩვილის თირკმელები ჯერ <strong>ვერ ამუშავებს ბევრ ნატრიუმს</strong>. დღიური ნორმა: 6–12 თვის ბავშვისთვის — <strong>1 გ-ზე ნაკლები</strong>. ფრთხილად: ბრინჯის ბლინები, სოფლის პური, ყველი ხშირად ბევრ მარილს შეიცავს.</p>

<h2>3. შაქარი და ტკბილეული</h2>

<p>ადრეული შაქარი <strong>ყალიბებს ტკბილზე დამოკიდებულებას</strong> და ავითარებს კარიესს (პირველი კბილებიდანვე). <strong>ხილის შაქარი ბუნებრივ ხილში</strong> — ნორმალურია. <strong>დამატებული შაქარი</strong> — არა.</p>

<h2>4. მთლიანი ძროხის რძე (სასმელად)</h2>

<p>ძირითად სასმელად 1 წლამდე — <strong>არარეკომენდებულია</strong> (ფარდობით ბევრ ცილასა და ნატრიუმს შეიცავს, რაც ჩვილის თირკმელებს ამძიმებს). <em>სამზარეულოში, ფაფაში</em> — მცირე რაოდენობა <strong>ნებადართულია 6 თვის შემდეგ</strong>.</p>

<h2>5. მთლიანი კაკალი</h2>

<p><strong>დახრჩობის რისკი</strong>. 1 წლამდე — კაკალი მხოლოდ <strong>პასტის სახით</strong> (არაქისის პასტა, ნუშის პასტა) მცირე რაოდენობით, წყლით განზავებული. <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">დახრჩობის პრევენციის შესახებ</a> მეტი ინფორმაცია.</p>

<h2>6. ზღვის პროდუქტები მაღალი ვერცხლისწყლით</h2>

<p><strong>ზვიგენი, მახვილთევზი, სკუმბრია</strong> — ეს სახეობები ამ ასაკამდე არარეკომენდებულია. <strong>ლოსოსი, ტუნა (კვირაში ერთხელ), ტილაპია</strong> — ნორმალურია.</p>

<h2>7. ალერგენური საკვები — ახლა ადრეული გაცნობა რეკომენდებულია!</h2>

<p><a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1414850" target="_blank" rel="noopener noreferrer">LEAP კვლევამ</a> (2015) დაადასტურა: <strong>ადრეულმა გაცნობამ (4–6 თვიდან) შეიძლება შეამციროს ალერგია</strong>. მაგრამ <strong>ალერგიული ოჯახის ისტორიის</strong> დროს — <em>ექიმის კონსულტაცია ვალდებულია</em>.</p>

<h2>8. ახალი ხახვი და ნიორი</h2>

<p>სერიოზულ საფრთხეს არ წარმოადგენს, მაგრამ ამ ასაკის კუჭს <strong>უჭირს გადამუშავება</strong>. 8–9 თვის შემდეგ — მცირე რაოდენობა <strong>შემწვარ სახით</strong>.</p>

<h2>9. ციტრუსი (6–8 თვემდე)</h2>

<p><strong>მჟავიანობა</strong> ხშირად იწვევს კანის გამონაყარს ტუჩებსა და ნიკაპზე. 6–8 თვის შემდეგ — <strong>ნელ-ნელა შეიყვანეთ</strong>.</p>

<h2>10. სასმელი წვენები</h2>

<p>1 წლამდე — <strong>კომლის წვენი 120 მლ-ზე მეტი</strong>, ხილის ნებისმიერი ტიპის წვენი — არარეკომენდებულია. მიზეზი: <strong>ბევრი შაქარი, ნაკლები ბოჭკო</strong> — ვიდრე მთლიანი ხილი. <a href="https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Fruit-Juice-and-Your-Childs-Diet.aspx" target="_blank" rel="noopener noreferrer">AAP-ის 2017 წლის განახლებული რეკომენდაციები</a> ამას ადასტურებს.</p>`,

    contentEn: `<p>Until age 1, a baby's digestive system is not fully developed enough to process certain foods and substances. Based on <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">WHO</a> and <a href="https://www.healthychildren.org/" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics</a> guidelines — here are <strong>10 foods to strictly avoid in the first year</strong>.</p>

<h2>1. Honey — Most Critical!</h2>

<p>Honey may contain <em>Clostridium botulinum</em> spores causing <strong>infant botulism</strong>. <strong>Absolutely no honey before age 1</strong> in any form — raw, heated, or baked into foods.</p>

<h2>2. Salt</h2>

<p>Infant kidneys <strong>cannot process large amounts of sodium</strong>. Daily limit: under <strong>1g</strong> for 6–12 month olds. Watch out: rice crackers, bread, and cheese often contain significant hidden salt.</p>

<h2>3. Sugar and Sweets</h2>

<p>Early sugar exposure <strong>creates a preference for sweet tastes</strong> and promotes tooth decay from first teeth. <strong>Natural sugar in whole fruit</strong> is fine. <strong>Added sugar</strong> is not.</p>

<h2>4. Whole Cow's Milk as Main Drink</h2>

<p>Not recommended as primary drink before 1 year — <strong>too high in protein and sodium</strong> for infant kidneys. <em>Small amounts in porridge or cooking</em> are <strong>fine after 6 months</strong>.</p>

<h2>5. Whole Nuts</h2>

<p><strong>Choking hazard</strong>. Before 1 year, nuts only as <strong>paste</strong> (peanut butter, almond butter) in small amounts, thinned with water. More info on <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">choking prevention here</a>.</p>

<h2>6. High-Mercury Seafood</h2>

<p><strong>Shark, swordfish, king mackerel</strong> — not recommended at this age. <strong>Salmon, canned tuna (once weekly), tilapia</strong> are all fine.</p>

<h2>7. Allergens — Early Introduction Now Recommended!</h2>

<p>The <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1414850" target="_blank" rel="noopener noreferrer">LEAP study</a> (2015) showed: <strong>early introduction (4–6 months) may REDUCE allergy risk</strong>. However, with <strong>family history of allergies</strong>, <em>doctor consultation is mandatory</em>.</p>

<h2>8. Raw Onion and Garlic</h2>

<p>Not seriously dangerous but <strong>hard on infant digestion</strong>. Small amounts <strong>cooked</strong> are fine after 8–9 months.</p>

<h2>9. Citrus Fruits (before 6–8 months)</h2>

<p><strong>Acidity</strong> often causes skin rash around lips and chin. <strong>Introduce gradually</strong> after 6–8 months.</p>

<h2>10. Fruit Juices</h2>

<p>Under 1 year, <strong>no juice exceeding 120ml</strong> — ideally none at all. Reason: <strong>high sugar, low fiber</strong> compared to whole fruit. The <a href="https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Fruit-Juice-and-Your-Childs-Diet.aspx" target="_blank" rel="noopener noreferrer">AAP's updated 2017 guidelines</a> confirmed this recommendation.</p>`,
  },

  {
    slug: 'jasnsakeli-snekebi-mcire-bavshvistvis',
    contentKa: `<p>სნექი 1–3 წლის ბავშვისთვის კვების <strong>განუყოფელი ნაწილია</strong> — მათი მცირე კუჭი ვერ ინახავს საკმარის ენერგიას ძირითად კვებებს შორის. სწორი სნექი კი ამავდროულად <strong>ვიტამინების, მინერალებისა და ბოჭკოს</strong> მნიშვნელოვანი წყაროა.</p>

<h2>რატომ არის სნექი ასე მნიშვნელოვანი?</h2>

<ul>
  <li>1–3 წლის ბავშვს სჭირდება <strong>1000–1400 kcal</strong> დღეში</li>
  <li>3 ძირითადი კვება ხშირად <strong>არ ფარავს</strong> ამ საჭიროებას</li>
  <li><strong>2 ჯანსაღი სნექი</strong> დღეში — ოპტიმალური სქემა</li>
  <li>სნექი კვებამდე <strong>მინიმუმ 1 საათით ადრე</strong> — ბავშვი ძირითადი კვებისთვის მშიერი დარჩება</li>
</ul>

<h2>ხილი და ბოსტნეული — საუკეთესო არჩევანი</h2>

<ul>
  <li><strong>ბანანი</strong> — ენერგიის სწრაფი წყარო, <a href="/blog/rkinit-mdidari-sakvebi-chvilebistvis">კალიუმი</a></li>
  <li><strong>ავოკადო</strong> (ნახევარი) — ჯანსაღი ცხიმი, ბოჭკო</li>
  <li><strong>ყვითელი, წითელი ბულგარული წიწაკა</strong> — C ვიტამინი, ტკბილი გემო</li>
  <li><strong>ბლუბერი</strong> — ანტიოქსიდანტები, ადვილი ხელში ჭერა</li>
  <li><strong>სტაფილო</strong> — მოხარშული ან გახეხილი, ბოჭკო</li>
</ul>

<h2>რძის პროდუქტები — კალციუმი და ცილა</h2>

<ul>
  <li><strong>ბუნებრივი იოგურტი</strong> (შაქრის გარეშე) + ახალი ხილი</li>
  <li><strong>ყველი ნაჭრებად</strong> (სულუგუნი, ბრინზა — მარილი უნდა ვაკონტროლოთ)</li>
  <li><strong>კოტეჯ ჩიზი</strong> ბოსტნეულის გვერდით</li>
</ul>

<h2>მარცვლეული — ნელი ენერგია</h2>

<ul>
  <li><strong>შვრიის ბისკვიტი</strong> — შაქრის გარეშე, სახლში გამომცხვარი</li>
  <li><strong>ბრინჯის ბლინი</strong> ავოკადოთი</li>
  <li><strong>ხორბლის ტოსტი</strong> არაქისის პასტით (1 წლის შემდეგ)</li>
</ul>

<h2>ცილა — ძირითადი სამშენებლო მასალა</h2>

<ul>
  <li><strong>მოხარშული კვერცხი</strong> — მთლიანი ან ნაჭრებად</li>
  <li><strong>ქათმის კუბიკები</strong></li>
  <li><strong>ჰუმუსი</strong> ბოსტნეულით — ნუტი, ლიმონი, ოლივის ზეთი</li>
  <li><strong>ოსპის ბლინი</strong></li>
</ul>

<h2>20 სნექ-იდეა, რომელიც ბავშვებს უყვართ</h2>

<ol>
  <li>ბანანი + არაქისის პასტა</li>
  <li>იოგურტი + ბლუბერი</li>
  <li>ავოკადო + ტოსტი</li>
  <li>სტაფილო + ჰუმუსი</li>
  <li>ყველი + ვაშლი</li>
  <li>მოხარშული კვერცხი + ტომატი</li>
  <li>ბრინჯის ბლინი + ქათამი</li>
  <li>ბოლოქი + ჰუმუსი</li>
  <li>ბუნებრივი იოგურტი + მარწყვი</li>
  <li>მოხარშული სიმინდი (ლმობიერი)</li>
  <li>ყვითელი წიწაკა + ჰუმუსი</li>
  <li>ბრინზა + ყურძენი (გახლეჩილი მეოთხედებად)</li>
  <li>ბრინჯის კრეკერი + ავოკადო</li>
  <li>ხახვ-ქათმის ბლინი</li>
  <li>ატამი + კოტეჯ ჩიზი</li>
  <li>გამყინული მწვანე ბარდა (გალღობილი)</li>
  <li>ბანანი + შვრია (ბლინი)</li>
  <li>ნ.პომიდვრი ნახევრებად</li>
  <li>ხილის სალათი</li>
  <li>ლმობიერი მოხარშული კარტოფილი</li>
</ol>

<p><a href="/">moMeals-ის გეგმა</a> ყოველდღე <strong>ავტომატურად ირჩევს ასაკის შესაბამის სნექს</strong> — სეზონის, გემოვნებისა და კვებითი საჭიროებების მიხედვით.</p>`,

    contentEn: `<p>Snacks are an <strong>essential part of nutrition</strong> for toddlers 1–3 years old — their small stomachs can't store enough energy between main meals. The right snack also provides important <strong>vitamins, minerals, and fiber</strong>.</p>

<h2>Why Snacks Matter</h2>

<ul>
  <li>Toddlers need <strong>1000–1400 kcal</strong> daily</li>
  <li>Three main meals often <strong>don't cover</strong> this requirement</li>
  <li><strong>Two healthy snacks</strong> per day is the optimal pattern</li>
  <li>Offer snacks at least <strong>1 hour before</strong> the next main meal so appetite isn't affected</li>
</ul>

<h2>Fruits and Vegetables — The Best Choice</h2>

<ul>
  <li><strong>Banana</strong> — quick energy, <a href="/blog/rkinit-mdidari-sakvebi-chvilebistvis">potassium</a></li>
  <li><strong>Avocado</strong> (half) — healthy fats, fiber</li>
  <li><strong>Yellow or red bell pepper strips</strong> — vitamin C, naturally sweet</li>
  <li><strong>Blueberries</strong> — antioxidants, easy for small hands</li>
  <li><strong>Carrot</strong> — grated or cooked, great fiber source</li>
</ul>

<h2>Dairy — Calcium and Protein</h2>

<ul>
  <li><strong>Plain yogurt</strong> (no added sugar) + fresh fruit</li>
  <li><strong>Cheese cubes</strong> — watch sodium content</li>
  <li><strong>Cottage cheese</strong> alongside vegetables</li>
</ul>

<h2>Grains — Slow-Release Energy</h2>

<ul>
  <li><strong>Oat biscuit</strong> — no sugar, homemade is best</li>
  <li><strong>Rice pancake</strong> with avocado</li>
  <li><strong>Wheat toast</strong> with peanut butter (after age 1)</li>
</ul>

<h2>Protein — Essential Building Blocks</h2>

<ul>
  <li><strong>Hard-boiled egg</strong> — whole or in pieces</li>
  <li><strong>Chicken cubes</strong></li>
  <li><strong>Hummus</strong> with vegetables — chickpeas, lemon, olive oil</li>
  <li><strong>Lentil pancakes</strong></li>
</ul>

<h2>20 Snack Ideas Toddlers Love</h2>

<ol>
  <li>Banana + peanut butter</li>
  <li>Yogurt + blueberries</li>
  <li>Avocado toast</li>
  <li>Carrot + hummus</li>
  <li>Cheese + apple slices</li>
  <li>Boiled egg + tomato</li>
  <li>Rice pancake + chicken</li>
  <li>Radish + hummus</li>
  <li>Plain yogurt + strawberries</li>
  <li>Soft corn on the cob</li>
  <li>Bell pepper + hummus</li>
  <li>Bryndza + quartered grapes</li>
  <li>Rice cracker + avocado</li>
  <li>Chicken-onion pancake</li>
  <li>Peach + cottage cheese</li>
  <li>Frozen green peas (thawed)</li>
  <li>Banana oat pancake</li>
  <li>Cherry tomato halves</li>
  <li>Fruit salad</li>
  <li>Soft cooked potato</li>
</ol>

<p><a href="/">moMeals</a> automatically selects <strong>age-appropriate daily snacks</strong> based on season, taste preferences, and nutritional needs — every single day.</p>`,
  },
];

async function main() {
  console.log('🔄 Updating blog posts with rich HTML content...\n');

  for (const update of updates) {
    const existing = await prisma.blog.findUnique({ where: { slug: update.slug } });
    if (!existing) {
      console.log(`  ⚠️  Not found: ${update.slug}`);
      continue;
    }
    await prisma.blog.update({
      where: { slug: update.slug },
      data: { contentKa: update.contentKa, contentEn: update.contentEn },
    });
    console.log(`  ✅  Updated: ${existing.titleKa}`);
  }

  console.log('\n✅ All blog posts updated with rich HTML!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
