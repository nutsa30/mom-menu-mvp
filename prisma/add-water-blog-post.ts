import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// One-time script to add the new blog post about giving water to babies
// (content supplied by the site owner, cleaned up for grammar and with all
// dashes normalized to a short hyphen "-" per her instruction). Mirrors how
// app/admin/blogs/actions.ts's createBlog() writes a Blog row, just run
// directly instead of through the admin UI.
//
// Run once: npx tsx prisma/add-water-blog-post.ts

const titleKa = 'წყალი ბავშვის კვებაში: როდის დავიწყოთ, რამდენი მივცეთ და რა უნდა ვიცოდეთ';
const titleEn = 'Water in Baby Feeding: When to Start, How Much to Give, and What to Know';
const slug = 'water-in-baby-feeding';

const contentKa = `
<p>ბავშვისთვის წყლის მიცემა ერთ-ერთი საკითხია, რომელზეც მშობლებს ხშირად უჩნდებათ კითხვები: როდის შეიძლება წყლის შეთავაზება? რამდენი უნდა დალიოს? თუ წყალს ცოტას სვამს, უნდა ვინერვიულოთ? შეიძლება თუ არა წყლის ნაცვლად წვენის მიცემა?</p>
<p>მთავარი პასუხი ასაკზეა დამოკიდებული. ბავშვის ცხოვრების პირველ თვეებში წყლის საჭიროება განსხვავდება იმ პერიოდისგან, როცა დამატებითი კვება უკვე დაწყებულია.</p>
<h2>6 თვემდე - საჭიროა თუ არა წყალი?</h2>
<p>ჯანმრთელ, ექსკლუზიურად ძუძუთი კვებაზე მყოფ ჩვილს სიცოცხლის პირველ 6 თვეში დამატებითი წყალი არ სჭირდება. მისი სითხისა და საკვები ნივთიერებების ძირითადი წყარო დედის რძეა.</p>
<p>იგივე პრინციპი მოქმედებს ჩვილის ფორმულაზე მყოფ ბავშვზეც - დამატებითი წყალი რუტინულად არ უნდა მიეცეს მხოლოდ იმიტომ, რომ გარეთ ცხელა ან ბავშვს ხშირად სწყურია. ასეთ შემთხვევაში, პირველ რიგში, უნდა გაგრძელდეს ბავშვის ჩვეულებრივი კვება.</p>
<p>დამატებითი წყლის მიცემა ძალიან პატარა ჩვილისთვის ექიმის რეკომენდაციის გარეშე საჭირო არ არის. ზედმეტმა წყალმა შეიძლება შეამციროს ის რაოდენობა, რასაც ბავშვი დედის რძიდან ან ფორმულიდან იღებს.</p>
<h2>დაახლოებით 6 თვიდან - წყალი უკვე შეიძლება შევთავაზოთ</h2>
<p>როდესაც ბავშვი დამატებით კვებას იწყებს, დაახლოებით 6 თვიდან, შესაძლებელია წყლის შეთავაზებაც.</p>
<p>ამ ეტაპზე წყალი ჯერ კიდევ არ ანაცვლებს დედის რძეს ან ჩვილის ფორმულას. პირველი წლის განმავლობაში ბავშვის ძირითადი სასმელი კვლავ დედის რძე ან ჩვილის ფორმულაა, ხოლო წყალი დამატებით სითხედ შემოდის.</p>
<p>წყლის შეთავაზება განსაკუთრებით მოსახერხებელია ჭამის დროს - რამდენიმე პატარა ყლუპი საკმარისია დასაწყისისთვის. ამასთან ერთად, ბავშვი სწავლობს ჭიქიდან დალევასაც. NHS დაახლოებით 6 თვიდან ღია ან თავისუფალი დინების ჭიქის გამოყენებას ურჩევს.</p>
<h2>რამდენი წყალი უნდა დალიოს 6-12 თვის ბავშვმა?</h2>
<p>აქ ერთი კონკრეტული რიცხვის დასახელება ყოველთვის სწორი არ არის, რადგან ბავშვის სითხის საჭიროება ინდივიდუალურია და დღის განმავლობაში მიღებული სხვა სითხეებიც უნდა იყოს გათვალისწინებული.</p>
<p>ამერიკის პედიატრიის აკადემიის რეკომენდაციებში 6-12 თვის ასაკისთვის დაახლოებით 120-240 მლ წყალი დღეში არის მითითებული, თუმცა ამ ასაკში ბავშვის სითხის მნიშვნელოვანი ნაწილი კვლავ დედის რძიდან ან ფორმულიდან მოდის.</p>
<p>ეს არ ნიშნავს, რომ ბავშვმა აუცილებლად ყოველდღე ზუსტად 120 ან 240 მლ უნდა დალიოს. ზოგ დღეს შეიძლება ნაკლები წყალი დალიოს, ზოგ დღეს - მეტი. მნიშვნელობა აქვს ასევე ამინდს, აქტივობას, საკვების ტიპს და იმას, რამდენ სითხეს იღებს სხვა წყაროებიდან.</p>
<h2>წყალი და საკვები - რატომ არის ჭამის დროს შეთავაზება კარგი იდეა?</h2>
<p>დამატებითი კვების დაწყების შემდეგ წყლის შეთავაზება ჭამის დროს რამდენიმე მიზანს ემსახურება:</p>
<ul>
<li>ბავშვი ეჩვევა წყლის გემოს;</li>
<li>სწავლობს ჭიქიდან დალევას;</li>
<li>წყალი ხდება ყოველდღიური სასმელი და არა მხოლოდ მაშინ, როცა ძალიან სწყურია;</li>
<li>ბავშვი არ ეჩვევა ტკბილ სასმელებს წყლის ნაცვლად.</li>
</ul>
<p>წყლის შეთავაზება შესაძლებელია პატარა ყლუპებით. თუ ბავშვი თავიდან ცოტას სვამს ან ჭიქიდან დალევა უჭირს, ეს სრულიად მოსალოდნელია - დალევა ახალი უნარია და მისი სწავლაც ეტაპობრივად ხდება.</p>
<h2>თუ ბავშვი წყალს ცოტას სვამს?</h2>
<p>ყველა ბავშვი ერთნაირი რაოდენობის წყალს არ სვამს.</p>
<p>თუ ბავშვი აქტიურია, ჩვეულებრივად ჭამს, იღებს დედის რძეს ან ფორმულას და გაუწყლოების ნიშნები არ აქვს, მხოლოდ ის ფაქტი, რომ ჭიქაში ბევრი წყალი რჩება, ავტომატურად პრობლემას არ ნიშნავს.</p>
<p>შეგვიძლია წყალი ხშირად, მცირე რაოდენობით შევთავაზოთ, განსაკუთრებით ჭამის დროს, მაგრამ დალევა ძალით არ უნდა ვაიძულოთ.</p>
<p>წყლის მიღება ასევე დამოკიდებულია საკვებზე. ხილი, ბოსტნეული და სხვა წყლის შემცველი საკვები ორგანიზმს გარკვეულ რაოდენობის სითხეს აწვდის.</p>
<h2>რა ხდება სიცხეში?</h2>
<p>ცხელ ამინდში ბავშვს სითხის მოთხოვნილება შეიძლება გაეზარდოს.</p>
<p>6 თვემდე ძუძუთი კვებაზე მყოფ ბავშვს წყლის ნაცვლად ჩვეულებრივ უფრო ხშირად ძუძუს შეთავაზება სჭირდება. NHS აღნიშნავს, რომ ცხელ ამინდში სრულად ძუძუთი კვებაზე მყოფ ჩვილს შეიძლება ჩვეულებრივზე ხშირად მოუნდეს ძუძუს მიღება.</p>
<p>6 თვის შემდეგ კი, როცა ბავშვი უკვე დამატებით საკვებს იღებს, წყლის შეთავაზება შეიძლება უფრო ხშირადაც დაგვჭირდეს.</p>
<p>თუ ბავშვი ძალიან ცხელ ამინდშია, უჩვეულოდ მოდუნებულია, ნაკლებად შარდავს ან სხვა საეჭვო ნიშნები აქვს, მხოლოდ წყლის მიცემით პრობლემის მოგვარება არ უნდა ვცადოთ - საჭიროა ექიმთან დაკავშირება.</p>
<h2>რა შეიძლება მივცეთ წყლის ნაცვლად?</h2>
<p>პირველ წლებში ყოველდღიური სასმელის არჩევანი საკმაოდ მარტივია: წყალი და ბავშვის ასაკისთვის შესაბამისი რძე.</p>
<p>წვენი წყლის შემცვლელი არ არის. 12 თვემდე ხილის წვენი და სმუზი ბავშვისთვის აუცილებელი არ არის. ხილისგან სარგებლის მიღება უმჯობესია თავად ხილის სახით, რადგან მთლიანი ხილი სხვა სასარგებლო ნივთიერებებთან და ბოჭკოსთან ერთად მიირთმევა. NHS ასევე აფრთხილებს, რომ წვენებისა და სხვა ტკბილი სასმელების შაქარმა შეიძლება კბილების დაზიანების რისკი გაზარდოს.</p>
<p>არ არის კარგი არჩევანი:</p>
<ul>
<li>გაზიანი სასმელები;</li>
<li>ტკბილი წვენები და ხილის სასმელები;</li>
<li>ტკბილი ჩაი;</li>
<li>არომატიზებული რძის სასმელები;</li>
<li>ე.წ. „ბავშვის" ან მცენარეული სასმელები, თუ ისინი შაქარს შეიცავს.</li>
</ul>
<p>ბავშვისთვის „ბავშვური" ან „6+" წარწერა ავტომატურად არ ნიშნავს, რომ სასმელი ყოველდღიური გამოყენებისთვის საუკეთესო არჩევანია. ეტიკეტის შემოწმება აქაც მნიშვნელოვანია.</p>
<h2>რა ჭიქა შევარჩიოთ?</h2>
<p>დაახლოებით 6 თვიდან ბავშვს შეგვიძლია დავიწყოთ ჭიქიდან დალევის სწავლება.</p>
<p>ღია ან თავისუფალი დინების ჭიქა კარგი არჩევანია, რადგან ბავშვი სწავლობს ყლუპის გაკეთებას და არა მხოლოდ საწოვარასავით წოვას. NHS ასევე აღნიშნავს, რომ ღია ან თავისუფალი დინების ჭიქა კბილებისთვის უკეთესი არჩევანია, ვიდრე საწოვარიანი ჭიქა.</p>
<p>დასაწყისში შეიძლება ბევრი წყალი დაიღვაროს - ეს სწავლის ჩვეულებრივი ნაწილია.</p>
<h2>1 წლის შემდეგ</h2>
<p>12 თვის შემდეგ ბავშვის სასმელების არჩევანი თანდათან ფართოვდება, მაგრამ წყალი კვლავ ერთ-ერთი საუკეთესო ყოველდღიური სასმელია.</p>
<p>ამ ასაკში ბავშვი უკვე უფრო აქტიურად გადადის ოჯახურ კვებაზე და სითხის საჭიროებაც იზრდება. ამერიკის პედიატრიის აკადემიის მიერ გამოქვეყნებულ რეკომენდაციებში 12-24 თვის ბავშვებისთვის წყლის დაახლოებით 240-960 მლ დღიური დიაპაზონია მითითებული, თუმცა ეს რაოდენობა მოიცავს ინდივიდუალურ განსხვავებებს და არ ნიშნავს, რომ ყველა ბავშვმა ყოველდღე ზუსტად კონკრეტული რაოდენობა უნდა დალიოს.</p>
<p>ამ ასაკში განსაკუთრებით მნიშვნელოვანია, რომ წყალი ბავშვისთვის ხელმისაწვდომი იყოს დღის განმავლობაში და ტკბილმა სასმელებმა წყლის ადგილი არ დაიკავონ.</p>
<h2>როგორ მივხვდეთ, რომ ბავშვს შეიძლება საკმარისი სითხე არ აქვს?</h2>
<p>გაუწყლოებაზე შეიძლება მიანიშნებდეს:</p>
<ul>
<li>ჩვეულებრივზე ნაკლები შარდვა;</li>
<li>ნაკლები სველი საფენი ჩვილში;</li>
<li>უჩვეულო ძილიანობა ან მოდუნება;</li>
<li>პირისა და ტუჩების სიმშრალე;</li>
<li>ტირილისას ნაკლები ან საერთოდ არარსებული ცრემლები;</li>
<li>უფრო მუქი ფერის შარდი.</li>
</ul>
<p>ჩვილებში განსაკუთრებით მნიშვნელოვანია შარდვის რაოდენობის ცვლილება და ბავშვის საერთო მდგომარეობა.</p>
<p>თუ ბავშვს აქვს განმეორებითი ღებინება ან დიარეა, მაღალი სიცხე, აშკარა მოდუნება, მნიშვნელოვნად შემცირებული შარდვა ან გაუწყლოების სხვა ნიშნები, საჭიროა პედიატრთან დაკავშირება. ასეთ სიტუაციაში მხოლოდ ჩვეულებრივი წყლის დამატებითი მიცემა ყოველთვის საკმარისი არ არის.</p>
<h2>ერთი მნიშვნელოვანი წესი ფორმულაზე</h2>
<p>თუ ბავშვი ჩვილის ფორმულას იღებს, ფორმულის მოსამზადებლად წყლისა და ფხვნილის თანაფარდობა თვითნებურად არასდროს უნდა შეიცვალოს.</p>
<p>ფორმულის ზედმეტმა განზავებამ შეიძლება გამოიწვიოს ის, რომ ბავშვი საკმარის საკვებ ნივთიერებებს ვერ მიიღებს, ხოლო ზედმეტად კონცენტრირებულმა ფორმულამ შეიძლება ორგანიზმზე, მათ შორის თირკმელებზე, ზედმეტი დატვირთვა შექმნას. ფორმულა ყოველთვის უნდა მომზადდეს შეფუთვაზე მითითებული ინსტრუქციის მიხედვით.</p>
<h2>მოკლედ - რა უნდა გახსოვდეთ?</h2>
<ul>
<li><strong>0-6 თვე:</strong> ჯანმრთელ ჩვილს დამატებითი წყალი ჩვეულებრივ არ სჭირდება - მთავარი სითხე დედის რძე ან ჩვილის ფორმულაა.</li>
<li><strong>დაახლოებით 6 თვიდან:</strong> დამატებითი კვების დაწყებასთან ერთად შეგვიძლია წყლის შეთავაზებაც, უმჯობესია მცირე ყლუპებით და ჭამის დროს.</li>
<li><strong>6-12 თვე:</strong> წყალი დამატებითი სითხეა და არ ანაცვლებს დედის რძეს ან ჩვილის ფორმულას.</li>
<li><strong>12 თვის შემდეგ:</strong> წყალი კვლავ ყოველდღიური სასმელის ერთ-ერთი საუკეთესო არჩევანია.</li>
</ul>
<p>და ყველაზე მთავარი - ბავშვის წყლის მიღება მხოლოდ ერთი ციფრით არ განისაზღვრება. ასაკთან ერთად მნიშვნელოვანია კვება, რძის მიღება, ამინდი, აქტივობა და ბავშვის საერთო მდგომარეობაც.</p>
<p>თუ ბავშვი წყალს ცოტას სვამს, პირველ რიგში მისი ასაკი და მთელი დღის სითხის მიღება უნდა გავითვალისწინოთ და არა მხოლოდ ის, რამდენი მილილიტრი დარჩა ჭიქაში.</p>
`.trim();

const contentEn = `
<p>Giving water to a baby is one of those topics parents often have questions about: When can water be offered? How much should they drink? Should I worry if my baby drinks very little water? Can juice be given instead of water?</p>
<p>The main answer depends on age. A baby's need for water in the first months of life is different from the period after solid foods have already been introduced.</p>
<h2>Under 6 months - is water necessary?</h2>
<p>A healthy baby who is exclusively breastfed does not need extra water during the first 6 months of life. Their main source of fluids and nutrients is breast milk.</p>
<p>The same principle applies to a formula-fed baby - extra water should not be given routinely just because it is hot outside or the baby seems thirsty often. In such cases, the priority is simply to continue the baby's usual feeding.</p>
<p>Giving additional water to a very young infant without a doctor's recommendation is not necessary. Too much water can reduce the amount the baby takes in from breast milk or formula.</p>
<h2>From around 6 months - water can now be offered</h2>
<p>Once a baby starts eating solid foods, at around 6 months, water can also be offered.</p>
<p>At this stage, water still does not replace breast milk or formula. Throughout the first year, the baby's main drink remains breast milk or formula, while water is introduced as an additional fluid.</p>
<p>Offering water is especially convenient during meals - a few small sips are enough to start. At the same time, the baby learns to drink from a cup. The NHS recommends introducing an open cup or a free-flow cup from around 6 months.</p>
<h2>How much water should a 6-12 month old drink?</h2>
<p>Naming one exact number is not always accurate here, since a baby's fluid needs are individual, and other fluids taken during the day should also be taken into account.</p>
<p>The American Academy of Pediatrics' guidelines indicate about 120-240 ml of water per day for babies aged 6-12 months, though at this age a significant part of the baby's fluids still comes from breast milk or formula.</p>
<p>This doesn't mean a baby must drink exactly 120 or 240 ml every single day. Some days they may drink less water, other days more. Weather, activity level, the type of food, and how much fluid comes from other sources all matter too.</p>
<h2>Water and food - why offering it at mealtimes is a good idea</h2>
<p>Once solid foods have started, offering water at mealtimes serves several purposes:</p>
<ul>
<li>the baby gets used to the taste of water;</li>
<li>learns to drink from a cup;</li>
<li>water becomes an everyday drink, not only something offered when very thirsty;</li>
<li>the baby doesn't develop a habit of sweet drinks instead of water.</li>
</ul>
<p>Water can be offered in small sips. If the baby drinks very little at first or has trouble drinking from a cup, that is completely expected - drinking is a new skill, and learning it happens gradually.</p>
<h2>What if the baby drinks very little water?</h2>
<p>Not every baby drinks the same amount of water.</p>
<p>If the baby is active, eats normally, takes breast milk or formula, and shows no signs of dehydration, the simple fact that a lot of water is left in the cup does not automatically mean there is a problem.</p>
<p>We can offer water often, in small amounts, especially during meals, but drinking should never be forced.</p>
<p>Water intake also depends on food. Fruits, vegetables, and other water-rich foods provide the body with a certain amount of fluid.</p>
<h2>What happens in hot weather?</h2>
<p>In hot weather, a baby's fluid needs may increase.</p>
<p>A breastfed baby under 6 months usually needs to be offered the breast more often rather than water. The NHS notes that in hot weather, a fully breastfed baby may want to feed more often than usual.</p>
<p>After 6 months, once the baby is already eating solid foods, water may need to be offered more frequently as well.</p>
<p>If the baby is in very hot weather, unusually lethargic, urinating less, or shows other concerning signs, the problem should not be addressed with water alone - a doctor should be contacted.</p>
<h2>What can be given instead of water?</h2>
<p>In the early years, the choice of everyday drinks is fairly simple: water and age-appropriate milk.</p>
<p>Juice is not a substitute for water. Fruit juice and smoothies are not necessary for a baby under 12 months. It is better to get the benefits of fruit from the fruit itself, since whole fruit comes with other beneficial nutrients and fiber. The NHS also warns that the sugar in juices and other sweet drinks can increase the risk of tooth decay.</p>
<p>Not good choices:</p>
<ul>
<li>fizzy drinks;</li>
<li>sweet juices and fruit drinks;</li>
<li>sweetened tea;</li>
<li>flavored milk drinks;</li>
<li>so-called "baby" or plant-based drinks, if they contain sugar.</li>
</ul>
<p>A "baby" or "6+" label on a drink does not automatically mean it is the best choice for everyday use. Checking the label matters here too.</p>
<h2>Which cup should we choose?</h2>
<p>From around 6 months, we can start teaching the baby to drink from a cup.</p>
<p>An open cup or free-flow cup is a good choice, because the baby learns to take a sip rather than just suck as with a bottle. The NHS also notes that an open or free-flow cup is a better choice for teeth than a spouted cup.</p>
<p>At the start, quite a lot of water may spill - this is a normal part of learning.</p>
<h2>After 1 year</h2>
<p>After 12 months, the range of drinks a baby can have gradually widens, but water remains one of the best everyday drinks.</p>
<p>At this age, the baby is transitioning more actively to family meals, and fluid needs increase. The American Academy of Pediatrics' published guidelines indicate a daily range of about 240-960 ml of water for children aged 12-24 months, though this range accounts for individual differences and does not mean every child must drink an exact amount each day.</p>
<p>At this age, it is especially important that water is available to the baby throughout the day, and that sweet drinks do not take the place of water.</p>
<h2>How can we tell if a baby may not be getting enough fluids?</h2>
<p>Signs that may point to dehydration include:</p>
<ul>
<li>urinating less than usual;</li>
<li>fewer wet diapers in an infant;</li>
<li>unusual sleepiness or lethargy;</li>
<li>dry mouth and lips;</li>
<li>fewer tears or no tears when crying;</li>
<li>darker-colored urine.</li>
</ul>
<p>In infants, changes in the amount of urination and the baby's overall condition are especially important to watch.</p>
<p>If the baby has repeated vomiting or diarrhea, a high fever, obvious lethargy, significantly reduced urination, or other signs of dehydration, a pediatrician should be contacted. In such situations, simply giving extra water is not always enough on its own.</p>
<h2>One important rule about formula</h2>
<p>If the baby is on formula, the ratio of water to powder used to prepare it should never be changed on your own.</p>
<p>Over-diluting formula can mean the baby doesn't get enough nutrients, while formula that is too concentrated can place extra strain on the body, including the kidneys. Formula should always be prepared exactly according to the instructions on the packaging.</p>
<h2>In short - what to remember</h2>
<ul>
<li><strong>0-6 months:</strong> a healthy baby usually doesn't need extra water - the main fluid is breast milk or formula.</li>
<li><strong>From around 6 months:</strong> once solid foods start, water can also be offered, ideally in small sips and at mealtimes.</li>
<li><strong>6-12 months:</strong> water is an additional fluid and does not replace breast milk or formula.</li>
<li><strong>After 12 months:</strong> water remains one of the best everyday drink choices.</li>
</ul>
<p>And most importantly - a baby's water intake is not defined by a single number. Along with age, feeding, milk intake, weather, activity, and the baby's overall condition all matter.</p>
<p>If a baby drinks very little water, the first things to consider are their age and their total fluid intake throughout the day - not just how many milliliters are left in the cup.</p>
`.trim();

async function main() {
  const existing = await p.blog.findUnique({ where: { slug } });
  if (existing) {
    console.log(`— ეს ბლოგი უკვე არსებობს (slug: ${slug}), ახალს არ ვქმნი.`);
    await p.$disconnect();
    return;
  }

  const blog = await p.blog.create({
    data: {
      titleKa,
      titleEn,
      contentKa,
      contentEn,
      slug,
      imageUrl: null,
      images: [],
      isPublished: true,
    },
  });

  console.log(`✓ ბლოგი დაემატა: "${blog.titleKa}" — /blog/${blog.slug}`);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
