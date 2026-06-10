import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates: { slug: string; contentKa: string; contentEn: string }[] = [
  {
    slug: 'myar-sakvelze-gadasvla-6-tvidan',
    contentKa: `<p>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ áƒ™áƒ•áƒ”áƒ‘áƒáƒ¨áƒ˜ áƒ”áƒ áƒ—-áƒ”áƒ áƒ—áƒ˜ áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜ áƒ”áƒ¢áƒáƒžáƒ˜ áƒáƒ áƒ˜áƒ¡ áƒ›áƒ§áƒáƒ  áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ–áƒ” áƒ’áƒáƒ“áƒáƒ¡áƒ•áƒšáƒ. <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">áƒ¯áƒáƒœáƒ“áƒáƒªáƒ•áƒ˜áƒ¡ áƒ›áƒ¡áƒáƒ¤áƒšáƒ˜áƒ áƒáƒ áƒ’áƒáƒœáƒ˜áƒ–áƒáƒªáƒ˜áƒ (WHO)</a> áƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒáƒªáƒ˜áƒáƒ¡ áƒ˜áƒ«áƒšáƒ”áƒ•áƒ, áƒ áƒáƒ› áƒ”áƒ¡ áƒžáƒ áƒáƒªáƒ”áƒ¡áƒ˜ <strong>6 áƒ—áƒ•áƒ˜áƒ¡ áƒáƒ¡áƒáƒ™áƒ˜áƒ“áƒáƒœ</strong> áƒ“áƒáƒ˜áƒ¬áƒ§áƒáƒ¡, áƒ¡áƒáƒœáƒáƒ› áƒ“áƒ”áƒ“áƒ˜áƒ¡ áƒ áƒ«áƒ” áƒáƒœ áƒáƒ“áƒáƒžáƒ¢áƒ˜áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒœáƒáƒ áƒ”áƒ•áƒ˜ áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“ áƒ™áƒ•áƒ”áƒ‘áƒáƒ“ áƒ áƒ©áƒ”áƒ‘áƒ.</p>

<h2>áƒ áƒáƒ’áƒáƒ  áƒ•áƒ˜áƒªáƒ˜áƒ—, áƒ›áƒ–áƒáƒ“áƒáƒ áƒ—áƒ£ áƒáƒ áƒ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜?</h2>

<p>áƒáƒ áƒ¡áƒ”áƒ‘áƒáƒ‘áƒ¡ áƒ¡áƒáƒ›áƒ˜ áƒ›áƒ—áƒáƒ•áƒáƒ áƒ˜ áƒœáƒ˜áƒ¨áƒáƒœáƒ˜, áƒ áƒáƒ›áƒšáƒ”áƒ‘áƒ–áƒ”áƒª áƒ§áƒ•áƒ”áƒšáƒ áƒžáƒ”áƒ“áƒ˜áƒáƒ¢áƒ áƒ˜ áƒ§áƒ£áƒ áƒáƒ“áƒ¦áƒ”áƒ‘áƒáƒ¡ áƒáƒ›áƒáƒ®áƒ•áƒ˜áƒšáƒ”áƒ‘áƒ¡:</p>

<ul>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ¨áƒ”áƒ£áƒ«áƒšáƒ˜áƒ <strong>áƒ—áƒáƒ•áƒ˜áƒ¡ áƒ’áƒáƒ›áƒáƒ áƒ—áƒ•áƒ</strong> áƒ“áƒ áƒ›áƒ¯áƒ“áƒáƒ›áƒáƒ áƒ” áƒžáƒáƒ–áƒáƒ¨áƒ˜ áƒ§áƒáƒ¤áƒœáƒ áƒ›áƒ®áƒáƒ áƒ“áƒáƒ­áƒ”áƒ áƒ˜áƒ—</li>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡ áƒ’áƒáƒ¥áƒ áƒ <strong>"áƒ’áƒáƒ›áƒáƒ“áƒ”áƒ•áƒœáƒ”áƒ‘áƒ˜áƒ¡ áƒ áƒ”áƒ¤áƒšáƒ”áƒ¥áƒ¡áƒ˜"</strong> (tongue thrust) â€” áƒ”áƒœáƒ áƒáƒ•áƒ¢áƒáƒ›áƒáƒ¢áƒ£áƒ áƒáƒ“ áƒáƒ  áƒ’áƒáƒ›áƒáƒ£áƒ“áƒ˜áƒ¡ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ¨áƒ”áƒ®áƒ”áƒ‘áƒáƒ–áƒ”</li>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ˜áƒ©áƒ”áƒœáƒ¡ <strong>áƒ˜áƒœáƒ¢áƒ”áƒ áƒ”áƒ¡áƒ¡ áƒ­áƒáƒ›áƒáƒ¡áƒ—áƒáƒœ</strong> â€” áƒ®áƒ”áƒšáƒ¡ áƒ¬áƒ•áƒ“áƒ”áƒ‘áƒ, áƒžáƒ˜áƒ áƒ¡ áƒ¦áƒ”áƒ‘áƒáƒ•áƒ¡, áƒ¡áƒ®áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ­áƒáƒ›áƒáƒ¡ áƒáƒ“áƒ”áƒ•áƒœáƒ”áƒ‘áƒ¡ áƒ—áƒ•áƒáƒšáƒ¡</li>
</ul>

<h2>áƒžáƒ˜áƒ áƒ•áƒ”áƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ â€” áƒ¡áƒ˜áƒ“áƒáƒœ áƒ“áƒáƒ•áƒ˜áƒ¬áƒ§áƒáƒ—?</h2>

<p>áƒžáƒ˜áƒ áƒ•áƒ”áƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ áƒ˜áƒ§áƒáƒ¡ <strong>áƒ”áƒ áƒ—-áƒ™áƒáƒ›áƒžáƒáƒœáƒ”áƒœáƒ¢áƒ˜áƒáƒœáƒ˜ áƒžáƒ˜áƒ£áƒ áƒ”</strong> â€” áƒœáƒ”áƒš-áƒœáƒ”áƒšáƒ áƒ§áƒáƒ•áƒ”áƒšáƒ˜ áƒáƒ®áƒáƒšáƒ˜ áƒžáƒ áƒáƒ“áƒ£áƒ¥áƒ¢áƒ˜ áƒªáƒáƒš-áƒªáƒáƒšáƒ™áƒ”:</p>

<ul>
  <li><strong>áƒ‘áƒáƒ¡áƒ¢áƒœáƒ”áƒ£áƒšáƒ˜:</strong> áƒ’áƒáƒ’áƒ áƒ, áƒ™áƒáƒ áƒ¢áƒáƒ¤áƒ˜áƒšáƒ˜, áƒ¡áƒ¢áƒáƒ¤áƒ˜áƒšáƒ, áƒ‘áƒáƒšáƒáƒ¥áƒ˜</li>
  <li><strong>áƒ®áƒ˜áƒšáƒ˜:</strong> áƒ•áƒáƒ¨áƒšáƒ˜, áƒ›áƒ¡áƒ®áƒáƒšáƒ˜, áƒ‘áƒáƒœáƒáƒœáƒ˜</li>
  <li><strong>áƒ›áƒáƒ áƒªáƒ•áƒšáƒ”áƒ£áƒšáƒ˜:</strong> áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜áƒ¡ áƒ¤áƒáƒ¤áƒ áƒáƒœ áƒ¨áƒ•áƒ áƒ˜áƒ</li>
</ul>

<p>áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜áƒ áƒáƒ®áƒáƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ <strong>3-4 áƒ“áƒ¦áƒ˜áƒ¡ áƒ˜áƒœáƒ¢áƒ”áƒ áƒ•áƒáƒšáƒ˜áƒ—</strong> áƒ¨áƒ”áƒ˜áƒ§áƒ•áƒáƒœáƒáƒ—, áƒ áƒáƒ—áƒ áƒáƒšáƒ”áƒ áƒ’áƒ˜áƒ£áƒšáƒ˜ áƒ áƒ”áƒáƒ¥áƒªáƒ˜áƒ áƒ“áƒ áƒáƒ£áƒšáƒáƒ“ áƒ’áƒáƒ›áƒáƒáƒ•áƒšáƒ˜áƒœáƒáƒ—. <a href="https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/Starting-Solid-Foods.aspx" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics-áƒ˜áƒ¡</a> áƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒáƒªáƒ˜áƒ”áƒ‘áƒ˜áƒª áƒáƒ› áƒžáƒ áƒ˜áƒœáƒªáƒ˜áƒžáƒ¡ áƒáƒ“áƒáƒ¡áƒ¢áƒ£áƒ áƒ”áƒ‘áƒ¡.</p>

<h2>áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ¡áƒ˜áƒ®áƒ¨áƒ˜áƒ áƒ” áƒ“áƒ áƒ áƒáƒáƒ“áƒ”áƒœáƒáƒ‘áƒ áƒáƒ¡áƒáƒ™áƒ˜áƒ¡ áƒ›áƒ˜áƒ®áƒ”áƒ“áƒ•áƒ˜áƒ—</h2>

<ul>
  <li><strong>6â€“7 áƒ—áƒ•áƒ”:</strong> 1â€“2 áƒ¯áƒ”áƒ  áƒ™áƒ•áƒ”áƒ‘áƒ áƒ“áƒ¦áƒ”áƒ¨áƒ˜, 2â€“3 áƒ¡áƒ£áƒ¤áƒ áƒ˜áƒ¡ áƒ™áƒáƒ•áƒ–áƒ˜</li>
  <li><strong>8â€“9 áƒ—áƒ•áƒ”:</strong> 2â€“3 áƒ¯áƒ”áƒ  áƒ™áƒ•áƒ”áƒ‘áƒ, 100â€“150 áƒ›áƒš</li>
  <li><strong>10â€“12 áƒ—áƒ•áƒ”:</strong> 3 áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“áƒ˜ áƒ™áƒ•áƒ”áƒ‘áƒ + 1â€“2 áƒ¡áƒœáƒ”áƒ¥áƒ˜</li>
</ul>

<p>áƒ’áƒáƒ®áƒ¡áƒáƒ•áƒ“áƒ”áƒ—: <strong>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ—áƒ•áƒ˜áƒ—áƒáƒœ áƒáƒ›áƒ‘áƒáƒ‘áƒ¡, áƒ áƒáƒ“áƒ˜áƒ¡ áƒ’áƒáƒ›áƒ«áƒáƒ«áƒ“áƒ</strong> â€” áƒáƒ˜áƒ«áƒ£áƒšáƒ”áƒ‘áƒ áƒáƒ  áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ. áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ¡áƒ¢áƒ áƒ”áƒ¡áƒ˜ áƒ›áƒáƒ’áƒ•áƒ˜áƒáƒœáƒ”áƒ‘áƒ˜áƒ— áƒáƒ®áƒ˜áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ›áƒ­áƒáƒ›áƒ”áƒšáƒ˜áƒ¡ áƒ’áƒáƒœáƒ•áƒ˜áƒ—áƒáƒ áƒ”áƒ‘áƒ˜áƒ¡ áƒ›áƒ˜áƒ–áƒ”áƒ–áƒ˜ áƒ®áƒ“áƒ”áƒ‘áƒ.</p>

<h2>áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ’áƒáƒ•áƒ áƒªáƒ”áƒšáƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ¨áƒ”áƒªáƒ“áƒáƒ›áƒ”áƒ‘áƒ˜</h2>

<ul>
  <li>áƒ«áƒáƒšáƒ˜áƒáƒœ <strong>áƒáƒ“áƒ áƒ” áƒáƒœ áƒ«áƒáƒšáƒ˜áƒáƒœ áƒ’áƒ•áƒ˜áƒáƒœ</strong> áƒ“áƒáƒ¬áƒ§áƒ”áƒ‘áƒ (4 áƒ—áƒ•áƒ”áƒ›áƒ“áƒ” áƒáƒœ 7 áƒ—áƒ•áƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’)</li>
  <li><strong>áƒ¨áƒáƒ¥áƒ áƒ˜áƒ¡áƒ áƒ“áƒ áƒ›áƒáƒ áƒ˜áƒšáƒ˜áƒ¡</strong> áƒ“áƒáƒ›áƒáƒ¢áƒ”áƒ‘áƒ â€” áƒ™áƒáƒ¢áƒ”áƒ’áƒáƒ áƒ˜áƒ£áƒšáƒáƒ“ áƒáƒ  áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ 1 áƒ¬áƒšáƒáƒ›áƒ“áƒ”</li>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ <strong>áƒšáƒ˜áƒ›áƒ˜áƒ¢áƒ˜áƒ áƒ”áƒ‘áƒ</strong> áƒ”áƒ áƒ—-áƒáƒ  áƒžáƒ áƒáƒ“áƒ£áƒ¥áƒ¢áƒ–áƒ” â€” áƒáƒ“áƒ áƒ”áƒ£áƒšáƒ˜ áƒ›áƒ áƒáƒ•áƒáƒšáƒ¤áƒ”áƒ áƒáƒ•áƒœáƒ”áƒ‘áƒ áƒáƒ›áƒªáƒ˜áƒ áƒ”áƒ‘áƒ¡ áƒáƒ®áƒ˜áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ›áƒ­áƒáƒ›áƒ”áƒšáƒ˜áƒ¡ áƒ’áƒáƒœáƒ•áƒ˜áƒ—áƒáƒ áƒ”áƒ‘áƒ˜áƒ¡ áƒ áƒ˜áƒ¡áƒ™áƒ¡</li>
  <li><strong>áƒ«áƒáƒšáƒ“áƒáƒ¢áƒáƒœáƒ”áƒ‘áƒ</strong> â€” áƒœáƒ”áƒ‘áƒ˜áƒ¡áƒ›áƒ˜áƒ”áƒ áƒ˜ áƒ¤áƒáƒ áƒ›áƒ˜áƒ—</li>
</ul>

<p><a href="/">mom menu áƒžáƒšáƒáƒ¢áƒ¤áƒáƒ áƒ›áƒ</a> áƒ’áƒ—áƒáƒ•áƒáƒ–áƒáƒ‘áƒ— <strong>áƒáƒ¡áƒáƒ™áƒ˜áƒ¡ áƒ›áƒ˜áƒ®áƒ”áƒ“áƒ•áƒ˜áƒ— áƒ¨áƒ”áƒ“áƒ’áƒ”áƒœáƒ˜áƒš áƒ“áƒ¦áƒ˜áƒ£áƒ  áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒ”áƒ’áƒ›áƒ”áƒ‘áƒ¡</strong>, áƒ áƒáƒ›áƒšáƒ”áƒ‘áƒ˜áƒª áƒ§áƒ•áƒ”áƒšáƒ áƒáƒ› áƒžáƒ áƒ˜áƒœáƒªáƒ˜áƒžáƒ¡ áƒ˜áƒ—áƒ•áƒáƒšáƒ˜áƒ¡áƒ¬áƒ˜áƒœáƒ”áƒ‘áƒ¡ â€” áƒáƒ•áƒ¢áƒáƒ›áƒáƒ¢áƒ£áƒ áƒáƒ“, áƒ§áƒáƒ•áƒ”áƒšáƒ˜ áƒ“áƒ¦áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡.</p>`,

    contentEn: `<p>Starting solid foods is one of the most important milestones in your baby's development. The <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">World Health Organization (WHO)</a> recommends introducing solids at around <strong>6 months</strong>, while breast milk or formula remains the primary source of nutrition.</p>

<h2>Signs Your Baby Is Ready</h2>

<p>There are three key readiness signs that every pediatrician looks for:</p>

<ul>
  <li>Baby can <strong>sit up with minimal support</strong> and hold their head steady</li>
  <li>The <strong>tongue-thrust reflex has diminished</strong> â€” baby no longer automatically pushes food out</li>
  <li>Baby shows <strong>interest in food</strong> by reaching for it, opening their mouth, and watching others eat</li>
</ul>

<h2>First Foods â€” Where to Begin?</h2>

<p>Start with <strong>single-ingredient purees</strong>, introducing each new food separately:</p>

<ul>
  <li><strong>Vegetables:</strong> pumpkin, sweet potato, carrot, zucchini</li>
  <li><strong>Fruits:</strong> apple, pear, banana</li>
  <li><strong>Grains:</strong> rice cereal or oatmeal porridge</li>
</ul>

<p>Introduce one new food every <strong>3â€“4 days</strong> to watch for allergic reactions. The <a href="https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/Starting-Solid-Foods.aspx" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics</a> confirms this approach as the gold standard.</p>

<h2>Feeding Frequency by Age</h2>

<ul>
  <li><strong>6â€“7 months:</strong> 1â€“2 times daily, 2â€“3 tablespoons</li>
  <li><strong>8â€“9 months:</strong> 2â€“3 times daily, 100â€“150ml portions</li>
  <li><strong>10â€“12 months:</strong> 3 main meals plus 1â€“2 snacks</li>
</ul>

<p>Always <strong>follow your baby's hunger and fullness cues</strong> â€” never force-feed. Mealtime pressure creates negative associations with food that can persist for years.</p>

<h2>Common Mistakes to Avoid</h2>

<ul>
  <li>Starting <strong>too early or too late</strong> (before 4 months or after 7 months)</li>
  <li>Adding <strong>salt or sugar</strong> â€” strictly off-limits before age 1</li>
  <li><strong>Limiting variety</strong> â€” early exposure to diverse flavors reduces picky eating later in childhood</li>
  <li><strong>Force-feeding</strong> in any form</li>
</ul>

<p><a href="/">mom menu</a> creates <strong>personalized daily meal plans</strong> based on your child's exact age and nutritional needs â€” automatically, for every single day.</p>`,
  },

  {
    slug: 'dakhrchovis-prevencia-bavshvebistvic',
    contentKa: `<p>áƒ“áƒáƒ®áƒ áƒ©áƒáƒ‘áƒ áƒ”áƒ áƒ—-áƒ”áƒ áƒ—áƒ˜ áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ’áƒáƒ•áƒ áƒªáƒ”áƒšáƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ£áƒ‘áƒ”áƒ“áƒ£áƒ áƒ˜ áƒ¨áƒ”áƒ›áƒ—áƒ®áƒ•áƒ”áƒ•áƒáƒ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ”áƒ‘áƒ¨áƒ˜ áƒ“áƒ áƒ›áƒ¨áƒáƒ‘áƒšáƒ”áƒ‘áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡ áƒ”áƒ¡ áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ“áƒ˜áƒ“ áƒ¨áƒ˜áƒ¨áƒ¡ áƒ˜áƒ¬áƒ•áƒ”áƒ•áƒ¡. <strong>áƒ¡áƒ¬áƒáƒ áƒ˜ áƒ˜áƒœáƒ¤áƒáƒ áƒ›áƒáƒªáƒ˜áƒ</strong> áƒ™áƒ˜ áƒáƒ› áƒ áƒ˜áƒ¡áƒ™áƒ¡ áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒœáƒáƒ“ áƒáƒ›áƒªáƒ˜áƒ áƒ”áƒ‘áƒ¡.</p>

<h2>áƒ›áƒ—áƒáƒ•áƒáƒ áƒ˜ áƒ’áƒáƒœáƒ¡áƒ®áƒ•áƒáƒ•áƒ”áƒ‘áƒ: áƒ“áƒáƒ®áƒ áƒ©áƒáƒ‘áƒ vs. áƒáƒ®áƒ•áƒ”áƒšáƒ”áƒ‘áƒ</h2>

<p>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ”áƒ‘áƒ˜ áƒ®áƒ¨áƒ˜áƒ áƒáƒ“ áƒáƒ®áƒ•áƒ”áƒšáƒ”áƒ‘áƒ”áƒœ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡áƒáƒ¡ â€” <strong>áƒ”áƒ¡ áƒœáƒáƒ áƒ›áƒáƒšáƒ£áƒ áƒ˜áƒ</strong>. áƒáƒ®áƒ•áƒ”áƒšáƒ”áƒ‘áƒ áƒœáƒ˜áƒ¨áƒœáƒáƒ•áƒ¡, áƒ áƒáƒ› áƒ¡áƒáƒ¡áƒ£áƒœáƒ—áƒ¥áƒ˜ áƒ’áƒ–áƒ”áƒ‘áƒ˜ áƒ›áƒ£áƒ¨áƒáƒáƒ‘áƒ”áƒœ áƒ“áƒ áƒ¡áƒ®áƒ”áƒ£áƒšáƒ˜ áƒ—áƒ•áƒ˜áƒ—áƒáƒœ áƒáƒ¡áƒ£áƒ¤áƒ—áƒáƒ•áƒ”áƒ‘áƒ¡. <strong>áƒœáƒáƒ›áƒ“áƒ•áƒ˜áƒšáƒ˜ áƒ“áƒáƒ®áƒ áƒ©áƒáƒ‘áƒ˜áƒ¡áƒáƒ¡</strong> áƒ™áƒ˜:</p>

<ul>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ <strong>áƒ®áƒ›áƒáƒ¡ áƒ•áƒ”áƒ  áƒ˜áƒ¦áƒ”áƒ‘áƒ¡</strong></li>
  <li>áƒžáƒ˜áƒ áƒ˜ <strong>áƒ¦áƒ˜áƒ</strong> áƒáƒ¥áƒ•áƒ¡ áƒ“áƒ áƒáƒ›áƒáƒ¡áƒ£áƒœáƒ—áƒ¥áƒ•áƒ áƒáƒ  áƒ®áƒ“áƒ”áƒ‘áƒ</li>
  <li>áƒ¡áƒáƒ®áƒ” <strong>áƒ¬áƒ˜áƒ—áƒšáƒ“áƒ”áƒ‘áƒ áƒáƒœ áƒšáƒ£áƒ áƒ¯áƒ“áƒ”áƒ‘áƒ</strong></li>
</ul>

<p>áƒáƒ¡áƒ”áƒ— áƒ¨áƒ”áƒ›áƒ—áƒ®áƒ•áƒ”áƒ•áƒáƒ¨áƒ˜ â€” <strong>5 áƒ–áƒ£áƒ áƒ’áƒ˜áƒ¡ áƒ“áƒáƒ áƒ¢áƒ§áƒ›áƒ, áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’ 5 áƒ›áƒ£áƒªáƒšáƒ˜áƒ¡ áƒ¥áƒ•áƒ”áƒ“áƒ áƒœáƒáƒ¬áƒ˜áƒšáƒ–áƒ” áƒ–áƒ”áƒ¬áƒáƒšáƒ</strong> â€” áƒ¡áƒáƒ¡áƒ¬áƒ áƒáƒ¤áƒáƒ“. <a href="https://www.redcross.org/take-a-class/infant-first-aid" target="_blank" rel="noopener noreferrer">Red Cross-áƒ˜áƒ¡ áƒ¡áƒáƒ¡áƒ¬áƒáƒ•áƒšáƒ áƒ™áƒ£áƒ áƒ¡áƒ”áƒ‘áƒ˜</a> áƒáƒ› áƒ›áƒáƒœáƒ”áƒ•áƒ áƒ¡ áƒáƒ¡áƒ¬áƒáƒ•áƒšáƒ˜áƒáƒœ.</p>

<h2>áƒ¡áƒáƒ®áƒ˜áƒ¤áƒáƒ—áƒ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ 1 áƒ¬áƒšáƒáƒ›áƒ“áƒ”</h2>

<ul>
  <li><strong>áƒ›áƒ¢áƒ™áƒ˜áƒªáƒ”, áƒ›áƒ áƒ’áƒ•áƒáƒšáƒ˜ áƒ®áƒ˜áƒšáƒ˜</strong> â€” áƒ§áƒ£áƒ áƒ«áƒ”áƒœáƒ˜, áƒáƒšáƒ£áƒ‘áƒáƒšáƒ˜ (áƒ›áƒ®áƒáƒšáƒáƒ“ áƒ’áƒáƒ®áƒšáƒ”áƒ©áƒ˜áƒšáƒ˜ áƒáƒœ áƒ“áƒáƒ­áƒ áƒ˜áƒšáƒ˜)</li>
  <li><strong>áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“ áƒ“áƒáƒ£áƒ­áƒ áƒ”áƒšáƒ˜ áƒ®áƒáƒ áƒªáƒ˜</strong> áƒáƒœ áƒ¡áƒáƒ¡áƒ˜áƒ¡áƒ˜</li>
  <li><strong>áƒ‘áƒáƒšáƒáƒ§áƒ˜ áƒáƒœ áƒ¡áƒ˜áƒ›áƒ˜áƒœáƒ“áƒ˜</strong> áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“</li>
  <li><strong>áƒ›áƒ—áƒšáƒ˜áƒáƒœáƒ˜ áƒ™áƒáƒ™áƒáƒšáƒ˜</strong>, áƒ¤áƒ˜áƒ©áƒ•áƒ˜, áƒ—áƒ®áƒ˜áƒšáƒ˜</li>
  <li><strong>áƒ‘áƒšáƒ˜áƒœáƒ˜ áƒáƒœ áƒžáƒ£áƒ áƒ˜</strong>, áƒ—áƒ£ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡ áƒ‘áƒ”áƒ•áƒ áƒ˜ áƒœáƒáƒ­áƒ”áƒ áƒ˜ áƒ”áƒ áƒ—áƒ“áƒ áƒáƒ£áƒšáƒáƒ“ áƒ®áƒ”áƒšáƒ¨áƒ˜ áƒ”áƒ¥áƒœáƒ”áƒ‘áƒ</li>
</ul>

<h2>áƒ¡áƒáƒ®áƒ˜áƒ¤áƒáƒ—áƒ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ 1â€“3 áƒ¬áƒ”áƒšáƒ˜</h2>

<ul>
  <li><strong>áƒ§áƒ£áƒ áƒ«áƒ”áƒœáƒ˜</strong> â€” áƒ§áƒáƒ•áƒ”áƒšáƒ—áƒ•áƒ˜áƒ¡ áƒ’áƒáƒ®áƒšáƒ”áƒ©áƒ”áƒ— áƒ›áƒ”áƒáƒ—áƒ®áƒ”áƒ“áƒ”áƒ‘áƒáƒ“</li>
  <li><strong>áƒ¡áƒ¢áƒáƒ¤áƒ˜áƒšáƒ</strong> â€” áƒ›áƒ®áƒáƒšáƒáƒ“ áƒ¨áƒ”áƒ›áƒ“áƒ£áƒ¦áƒáƒ áƒ” áƒáƒœ áƒ’áƒáƒ®áƒ”áƒ®áƒ˜áƒšáƒ˜</li>
  <li><strong>áƒáƒ¢áƒáƒ›áƒ˜, áƒ¥áƒšáƒ˜áƒáƒ•áƒ˜</strong> â€” áƒ™áƒ”áƒ áƒ™áƒšáƒ˜áƒ¡ áƒ’áƒáƒ áƒ”áƒ¨áƒ”</li>
  <li><strong>áƒžáƒáƒžáƒ™áƒáƒ áƒœáƒ˜</strong> â€” áƒ™áƒáƒ¢áƒ”áƒ’áƒáƒ áƒ˜áƒ£áƒšáƒáƒ“ áƒáƒ  áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ 4 áƒ¬áƒšáƒáƒ›áƒ“áƒ”</li>
  <li><strong>áƒ¡áƒáƒ¡áƒ˜áƒ¡áƒ˜</strong> â€” áƒ›áƒ®áƒáƒšáƒáƒ“ áƒ•áƒ”áƒ áƒ¢áƒ˜áƒ™áƒáƒšáƒ£áƒ áƒáƒ“ áƒ’áƒáƒ®áƒšáƒ”áƒ©áƒ˜áƒšáƒ˜</li>
</ul>

<h2>áƒ£áƒ¡áƒáƒ¤áƒ áƒ—áƒ®áƒ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ¬áƒ”áƒ¡áƒ”áƒ‘áƒ˜</h2>

<ul>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ <strong>áƒ§áƒáƒ•áƒ”áƒšáƒ—áƒ•áƒ˜áƒ¡ áƒ›áƒ¯áƒ“áƒáƒ›áƒáƒ áƒ” áƒžáƒáƒ–áƒáƒ¨áƒ˜</strong> áƒ­áƒáƒ›áƒ“áƒ”áƒ¡</li>
  <li><strong>áƒáƒ áƒáƒ¡áƒáƒ“áƒ”áƒ¡</strong> áƒ“áƒáƒ£áƒ¢áƒáƒ•áƒáƒ— áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ›áƒáƒ áƒ¢áƒ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡áƒáƒ¡</li>
  <li>áƒ›áƒ áƒ’áƒ•áƒáƒšáƒ˜ áƒ®áƒ˜áƒšáƒ˜ áƒ§áƒáƒ•áƒ”áƒšáƒ—áƒ•áƒ˜áƒ¡ <strong>áƒ’áƒáƒ®áƒšáƒ”áƒ©áƒ”áƒ— áƒáƒœ áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ”áƒ—</strong></li>
  <li>áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ <strong>áƒžáƒáƒ¢áƒáƒ áƒ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“</strong> áƒ“áƒáƒ­áƒ”áƒ áƒ˜áƒ— â€” 1 áƒ¡áƒ› Ã— 1 áƒ¡áƒ›</li>
  <li>áƒœáƒ£ áƒ’áƒáƒ›áƒáƒ˜áƒ§áƒ”áƒœáƒ”áƒ‘áƒ— áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ¡ <strong>áƒ¡áƒ•áƒšáƒáƒ¨áƒ˜ áƒáƒœ áƒ¡áƒáƒ—áƒáƒ›áƒáƒ¨áƒáƒ“</strong></li>
</ul>

<h2>Heimlich-áƒ˜áƒ¡ áƒ›áƒáƒœáƒ”áƒ•áƒ áƒ˜ â€” áƒ˜áƒ¡áƒ¬áƒáƒ•áƒšáƒ”áƒ—!</h2>

<p>áƒ§áƒ•áƒ”áƒšáƒ áƒ›áƒ¨áƒáƒ‘áƒ”áƒšáƒ¡ áƒ•áƒ£áƒ áƒ©áƒ”áƒ•áƒ— <strong>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ áƒ¡áƒáƒ¡áƒ¬áƒ áƒáƒ¤áƒ áƒ¡áƒáƒ›áƒ”áƒ“áƒ˜áƒªáƒ˜áƒœáƒ áƒ“áƒáƒ®áƒ›áƒáƒ áƒ”áƒ‘áƒ˜áƒ¡ áƒ™áƒ£áƒ áƒ¡áƒ˜áƒ¡ áƒ’áƒáƒ•áƒšáƒáƒ¡</strong> â€” CPR áƒ“áƒ Heimlich. <a href="https://www.sja.org.uk/get-trained/baby-and-child-first-aid/" target="_blank" rel="noopener noreferrer">áƒ‘áƒáƒ•áƒ¨áƒ•áƒ—áƒ áƒžáƒ˜áƒ áƒ•áƒ”áƒšáƒ˜ áƒ“áƒáƒ®áƒ›áƒáƒ áƒ”áƒ‘áƒ˜áƒ¡ áƒ™áƒ£áƒ áƒ¡áƒ”áƒ‘áƒ˜</a> áƒ®áƒ”áƒšáƒ›áƒ˜áƒ¡áƒáƒ¬áƒ•áƒ“áƒáƒ›áƒ˜áƒ áƒáƒœáƒšáƒáƒ˜áƒœ áƒ¤áƒáƒ áƒ›áƒáƒ¢áƒ˜áƒ—áƒáƒª. áƒ¡áƒáƒ¥áƒáƒ áƒ—áƒ•áƒ”áƒšáƒáƒ¨áƒ˜ áƒ”áƒ¡ áƒ™áƒ£áƒ áƒ¡áƒ”áƒ‘áƒ˜ áƒ®áƒ”áƒšáƒ›áƒ˜áƒ¡áƒáƒ¬áƒ•áƒ“áƒáƒ›áƒ˜áƒ áƒ¡áƒ®áƒ•áƒáƒ“áƒáƒ¡áƒ®áƒ•áƒ áƒ™áƒšáƒ˜áƒœáƒ˜áƒ™áƒáƒ¡áƒ áƒ“áƒ áƒ¡áƒáƒ¡áƒ¬áƒáƒ•áƒšáƒ áƒªáƒ”áƒœáƒ¢áƒ áƒ¨áƒ˜.</p>`,

    contentEn: `<p>Choking is one of the most common accidents involving children, and it causes great anxiety for parents. <strong>Having the right information</strong> significantly reduces this risk â€” and can save a life.</p>

<h2>The Key Difference: Choking vs. Gagging</h2>

<p>Babies often gag during feeding â€” <strong>this is completely normal</strong>. Gagging means the airway defense mechanism is working. <strong>True choking</strong> looks different:</p>

<ul>
  <li>Baby <strong>makes no sound</strong></li>
  <li>Mouth is <strong>open</strong> but no air moves</li>
  <li>Face turns <strong>red or blue</strong></li>
</ul>

<p>In this case â€” <strong>5 back blows followed by 5 abdominal thrusts</strong> immediately. <a href="https://www.redcross.org/take-a-class/infant-first-aid" target="_blank" rel="noopener noreferrer">Red Cross infant first aid courses</a> teach this maneuver step-by-step.</p>

<h2>Dangerous Foods Under Age 1</h2>

<ul>
  <li><strong>Whole round fruits</strong> â€” grapes, cherries (only cut into quarters)</li>
  <li><strong>Uncut meat</strong> or hot dogs</li>
  <li><strong>Raw vegetables</strong> â€” whole carrot sticks or corn on the cob</li>
  <li><strong>Whole nuts</strong> â€” any variety</li>
  <li><strong>Crackers or bread</strong> if baby gets a large handful at once</li>
</ul>

<h2>Dangerous Foods Ages 1â€“3</h2>

<ul>
  <li><strong>Grapes</strong> â€” always cut into quarters</li>
  <li><strong>Raw carrots</strong> â€” only grated or cooked soft</li>
  <li><strong>Stone fruits</strong> â€” peaches, plums â€” always remove the pit</li>
  <li><strong>Popcorn</strong> â€” absolutely not before age 4</li>
  <li><strong>Hot dogs</strong> â€” only slice lengthwise, then into small pieces</li>
</ul>

<h2>Safe Eating Rules</h2>

<ul>
  <li>Baby should always eat <strong>sitting upright</strong></li>
  <li><strong>Never leave</strong> baby alone while eating</li>
  <li>Cut round fruits into <strong>small pieces</strong> or cook until soft</li>
  <li>Cut all foods into <strong>1cm Ã— 1cm pieces</strong> for toddlers</li>
  <li>Don't use food to distract while <strong>walking or playing</strong></li>
</ul>

<h2>Learn the Heimlich Maneuver</h2>

<p>We strongly recommend all parents take an <strong>infant CPR and choking response course</strong>. <a href="https://www.sja.org.uk/get-trained/baby-and-child-first-aid/" target="_blank" rel="noopener noreferrer">Baby and child first aid courses</a> are available online and in-person. This knowledge can save your child's life.</p>`,
  },

  {
    slug: 'rkinit-mdidari-sakvebi-chvilebistvis',
    contentKa: `<p>áƒ áƒ™áƒ˜áƒœáƒ˜áƒ¡ áƒ“áƒ”áƒ¤áƒ˜áƒªáƒ˜áƒ¢áƒ˜ áƒ‘áƒáƒ•áƒ¨áƒ•áƒáƒ‘áƒáƒ¨áƒ˜ áƒ”áƒ áƒ—-áƒ”áƒ áƒ—áƒ˜ áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ’áƒáƒ•áƒ áƒªáƒ”áƒšáƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ—áƒ˜ áƒžáƒ áƒáƒ‘áƒšáƒ”áƒ›áƒáƒ áƒ›áƒ¡áƒáƒ¤áƒšáƒ˜áƒáƒ¨áƒ˜. <strong>6 áƒ—áƒ•áƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’</strong> áƒ“áƒ”áƒ“áƒ˜áƒ¡ áƒ áƒ«áƒ”áƒ¨áƒ˜ áƒ áƒ™áƒ˜áƒœáƒ áƒáƒ¦áƒáƒ  áƒ™áƒ›áƒáƒ áƒ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ áƒ¡áƒáƒ­áƒ˜áƒ áƒáƒ”áƒ‘áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡, áƒáƒ›áƒ˜áƒ¢áƒáƒ› áƒ›áƒ§áƒáƒ áƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ“áƒáƒœ áƒ›áƒ˜áƒ¦áƒ”áƒ‘áƒ áƒ’áƒáƒœáƒ¡áƒáƒ™áƒ£áƒ—áƒ áƒ”áƒ‘áƒ˜áƒ— áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜áƒ.</p>

<h2>áƒ áƒáƒ¢áƒáƒ› áƒáƒ áƒ˜áƒ¡ áƒ áƒ™áƒ˜áƒœáƒ áƒáƒ¡áƒ” áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜?</h2>

<p>áƒ áƒ™áƒ˜áƒœáƒ áƒáƒ£áƒªáƒ˜áƒšáƒ”áƒ‘áƒ”áƒšáƒ˜áƒ <strong>áƒ°áƒ”áƒ›áƒáƒ’áƒšáƒáƒ‘áƒ˜áƒœáƒ˜áƒ¡</strong> áƒ¬áƒáƒ áƒ›áƒáƒ¥áƒ›áƒœáƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡ â€” áƒªáƒ˜áƒšáƒ, áƒ áƒáƒ›áƒ”áƒšáƒ˜áƒª áƒŸáƒáƒœáƒ’áƒ‘áƒáƒ“áƒ¡ áƒáƒ¢áƒáƒ áƒ”áƒ‘áƒ¡ áƒ¡áƒ®áƒ”áƒ£áƒšáƒ¨áƒ˜. áƒáƒ¡áƒ”áƒ•áƒ”, <strong>áƒ¢áƒ•áƒ˜áƒœáƒ˜áƒ¡ áƒ’áƒáƒœáƒ•áƒ˜áƒ—áƒáƒ áƒ”áƒ‘áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡</strong> áƒ’áƒáƒ“áƒáƒ›áƒ¬áƒ§áƒ•áƒ”áƒ¢áƒ˜ áƒ áƒáƒšáƒ˜ áƒáƒ¥áƒ•áƒ¡. <a href="https://www.who.int/publications/i/item/9789241596664" target="_blank" rel="noopener noreferrer">WHO-áƒ¡ áƒ™áƒ•áƒšáƒ”áƒ•áƒ”áƒ‘áƒ˜áƒ¡</a> áƒ—áƒáƒœáƒáƒ®áƒ›áƒáƒ“, áƒ áƒ™áƒ˜áƒœáƒ˜áƒ¡ áƒ“áƒ”áƒ¤áƒ˜áƒªáƒ˜áƒ¢áƒ˜ áƒ‘áƒáƒ•áƒ¨áƒ•áƒáƒ‘áƒáƒ¨áƒ˜ áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ áƒ’áƒáƒ›áƒáƒ˜áƒ®áƒáƒ¢áƒáƒ¡:</p>

<ul>
  <li>áƒ¡áƒ˜áƒ¡áƒ£áƒ¡áƒ¢áƒ˜áƒ— áƒ“áƒ áƒ¤áƒ”áƒ áƒ›áƒ™áƒ áƒ—áƒáƒšáƒáƒ‘áƒ˜áƒ—</li>
  <li>áƒ–áƒ áƒ“áƒ˜áƒ¡ áƒ¨áƒ”áƒ¤áƒ”áƒ áƒ®áƒ”áƒ‘áƒ˜áƒ—</li>
  <li>áƒ™áƒáƒ’áƒœáƒ˜áƒ¢áƒ£áƒ áƒ˜ áƒ’áƒáƒœáƒ•áƒ˜áƒ—áƒáƒ áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒáƒ›áƒáƒ£áƒ¡áƒ¬áƒáƒ áƒ”áƒ‘áƒ”áƒšáƒ˜ áƒžáƒ áƒáƒ‘áƒšáƒ”áƒ›áƒ”áƒ‘áƒ˜áƒ—</li>
</ul>

<h2>áƒ¡áƒáƒ“ áƒ•áƒ˜áƒžáƒáƒ•áƒáƒ— áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ›áƒ”áƒ¢áƒ˜ áƒ áƒ™áƒ˜áƒœáƒ?</h2>

<h3>áƒ°áƒ”áƒ›-áƒ áƒ™áƒ˜áƒœáƒ (áƒ°áƒ”áƒ›áƒáƒ’áƒšáƒáƒ‘áƒ˜áƒœáƒ˜áƒ“áƒáƒœ â€” áƒ£áƒ™áƒ”áƒ— áƒ¨áƒ”áƒ˜áƒ¬áƒáƒ•áƒ”áƒ‘áƒ)</h3>
<ul>
  <li><strong>áƒ«áƒ áƒáƒ®áƒ˜áƒ¡ áƒ®áƒáƒ áƒªáƒ˜</strong> â€” áƒ’áƒáƒœáƒ¡áƒáƒ™áƒ£áƒ—áƒ áƒ”áƒ‘áƒ˜áƒ— áƒ¦áƒ•áƒ˜áƒ«áƒšáƒ˜ (100 áƒ’-áƒ¨áƒ˜ 6.5 áƒ›áƒ’)</li>
  <li><strong>áƒ¥áƒáƒ—áƒ›áƒ˜áƒ¡ áƒ®áƒáƒ áƒªáƒ˜</strong></li>
  <li><strong>áƒ—áƒ”áƒ•áƒ–áƒ˜</strong> â€” áƒšáƒáƒ¡áƒáƒ¡áƒ˜, áƒ¢áƒ£áƒœáƒ, áƒ¢áƒ˜áƒšáƒáƒžáƒ˜áƒ</li>
  <li><strong>áƒ™áƒ•áƒ”áƒ áƒªáƒ®áƒ˜áƒ¡ áƒ’áƒ£áƒšáƒ˜</strong></li>
</ul>

<h3>áƒáƒ áƒ-áƒ°áƒ”áƒ›-áƒ áƒ™áƒ˜áƒœáƒ (áƒ›áƒªáƒ”áƒœáƒáƒ áƒ”áƒ£áƒšáƒ˜ áƒ¬áƒáƒ áƒ›áƒáƒ¨áƒáƒ‘áƒ˜áƒ¡)</h3>
<ul>
  <li><strong>áƒáƒ¡áƒžáƒ˜ áƒ“áƒ áƒšáƒáƒ‘áƒ˜áƒ</strong></li>
  <li><strong>áƒ˜áƒ¡áƒžáƒáƒœáƒáƒ®áƒ˜, áƒ‘áƒ áƒáƒ™áƒáƒšáƒ˜</strong></li>
  <li><strong>áƒ¥áƒ˜áƒ¨áƒ›áƒ˜áƒ¨áƒ˜</strong></li>
  <li><strong>áƒ áƒ™áƒ˜áƒœáƒ˜áƒ— áƒ’áƒáƒ›áƒ“áƒ˜áƒ“áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ›áƒáƒ áƒªáƒ•áƒšáƒ”áƒ£áƒšáƒ˜</strong></li>
</ul>

<h2>áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜ áƒ¢áƒ áƒ˜áƒ£áƒ™áƒ˜: C áƒ•áƒ˜áƒ¢áƒáƒ›áƒ˜áƒœáƒ˜ áƒ”áƒ áƒ—áƒáƒ“</h2>

<p>áƒáƒ áƒ-áƒ°áƒ”áƒ›-áƒ áƒ™áƒ˜áƒœáƒ˜áƒ¡ áƒ¨áƒ”áƒ¬áƒáƒ•áƒ <strong>3-áƒ¯áƒ”áƒ  áƒ£áƒ›áƒ¯áƒáƒ‘áƒ”áƒ¡áƒ“áƒ”áƒ‘áƒ</strong>, áƒ—áƒ£ <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3999603/" target="_blank" rel="noopener noreferrer">C áƒ•áƒ˜áƒ¢áƒáƒ›áƒ˜áƒœáƒ˜ áƒ”áƒ áƒ—áƒáƒ“ áƒ›áƒ˜áƒ˜áƒ áƒ—áƒ›áƒ”áƒ•áƒ—</a>. áƒ¡áƒ¬áƒáƒ áƒ˜ áƒ™áƒáƒ›áƒ‘áƒ˜áƒœáƒáƒªáƒ˜áƒ”áƒ‘áƒ˜:</p>

<ul>
  <li>áƒ˜áƒ¡áƒžáƒáƒœáƒáƒ®áƒ˜áƒ¡ áƒžáƒ˜áƒ£áƒ áƒ˜ + <strong>áƒáƒ¢áƒ›áƒ˜áƒ¡ áƒžáƒ˜áƒ£áƒ áƒ˜</strong></li>
  <li>áƒáƒ¡áƒžáƒ˜áƒ¡ áƒ¬áƒ•áƒœáƒ˜áƒáƒœáƒ˜ + <strong>áƒžáƒáƒ›áƒ˜áƒ“áƒ•áƒ áƒ˜áƒ¡ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒ˜</strong></li>
  <li>áƒ áƒ™áƒ˜áƒœáƒ˜áƒ— áƒ’áƒáƒ›áƒ“áƒ˜áƒ“áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ¤áƒáƒ¤áƒ + <strong>áƒœáƒáƒ áƒ˜áƒœáƒ¯áƒ˜áƒ¡ áƒ¬áƒ•áƒ”áƒœáƒ˜</strong></li>
</ul>

<p><a href="/">mom menu-áƒ˜áƒ¡ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒ”áƒ’áƒ›áƒ</a> áƒáƒ•áƒ¢áƒáƒ›áƒáƒ¢áƒ£áƒ áƒáƒ“ áƒ˜áƒ—áƒ•áƒáƒšáƒ˜áƒ¡áƒ¬áƒ˜áƒœáƒ”áƒ‘áƒ¡ áƒáƒ› áƒ™áƒáƒ›áƒ‘áƒ˜áƒœáƒáƒªáƒ˜áƒ”áƒ‘áƒ¡ áƒ§áƒáƒ•áƒ”áƒšáƒ“áƒ¦áƒ˜áƒ£áƒ  áƒ›áƒ”áƒœáƒ˜áƒ£áƒ¨áƒ˜.</p>

<h2>áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ—áƒ˜ áƒœáƒáƒ áƒ›áƒ áƒáƒ¡áƒáƒ™áƒ˜áƒ¡ áƒ›áƒ˜áƒ®áƒ”áƒ“áƒ•áƒ˜áƒ—</h2>

<ul>
  <li><strong>7â€“12 áƒ—áƒ•áƒ˜áƒ¡ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡</strong> áƒ¡áƒ­áƒ˜áƒ áƒ“áƒ”áƒ‘áƒ 11 áƒ›áƒ’ áƒ áƒ™áƒ˜áƒœáƒ áƒ“áƒ¦áƒ”áƒ¨áƒ˜</li>
  <li><strong>1â€“3 áƒ¬áƒšáƒ˜áƒ¡ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡</strong> â€” 7 áƒ›áƒ’ áƒ“áƒ¦áƒ”áƒ¨áƒ˜</li>
</ul>

<p>áƒ”áƒ¡ áƒœáƒáƒ áƒ›áƒ áƒ”áƒ¤áƒ”áƒ¥áƒ¢áƒ£áƒ áƒáƒ“ áƒ“áƒáƒ¤áƒáƒ áƒ“áƒ”áƒ‘áƒ, áƒ—áƒ£ <strong>áƒ™áƒ•áƒ˜áƒ áƒáƒ¨áƒ˜ 3â€“4 áƒ¯áƒ”áƒ </strong> áƒ©áƒáƒ•áƒ áƒ—áƒáƒ•áƒ— áƒ áƒ™áƒ˜áƒœáƒ˜áƒ— áƒ›áƒ“áƒ˜áƒ“áƒáƒ  áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ¡.</p>

<h2>áƒ“áƒ”áƒ¤áƒ˜áƒªáƒ˜áƒ¢áƒ˜áƒ¡ áƒ¡áƒ˜áƒ›áƒžáƒ¢áƒáƒ›áƒ”áƒ‘áƒ˜ â€” áƒ§áƒ£áƒ áƒáƒ“áƒ¦áƒ”áƒ‘áƒ!</h2>

<ul>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ«áƒáƒšáƒ˜áƒáƒœ <strong>áƒ¦áƒšáƒ”áƒ‘áƒ, áƒœáƒáƒ™áƒšáƒ”áƒ‘áƒáƒ“</strong> áƒáƒ¥áƒ¢áƒ˜áƒ£áƒ áƒ˜áƒ</li>
  <li>áƒ¤áƒ”áƒ áƒ˜ <strong>áƒ¤áƒ”áƒ áƒ›áƒ™áƒ áƒ—áƒáƒšáƒ˜áƒ</strong>, áƒ’áƒáƒœáƒ¡áƒáƒ™áƒ£áƒ—áƒ áƒ”áƒ‘áƒ˜áƒ— áƒ¢áƒ£áƒ©áƒ”áƒ‘áƒ˜</li>
  <li>áƒœáƒáƒ™áƒšáƒ”áƒ‘áƒáƒ“ áƒ­áƒáƒ›áƒ¡ áƒáƒœ áƒ’áƒ˜áƒ©áƒ•áƒ”áƒœáƒ”áƒ‘áƒ¡ <strong>áƒáƒ áƒ-áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘ áƒœáƒ˜áƒ•áƒ—áƒ”áƒ‘áƒ–áƒ” áƒ˜áƒœáƒ¢áƒ”áƒ áƒ”áƒ¡</strong> (pica)</li>
</ul>

<p>áƒáƒ› áƒ¡áƒ˜áƒ›áƒžáƒ¢áƒáƒ›áƒ”áƒ‘áƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ©áƒœáƒ”áƒ•áƒ˜áƒ¡áƒáƒ¡ â€” <strong>áƒ¡áƒ˜áƒ¡áƒ®áƒšáƒ˜áƒ¡ áƒáƒœáƒáƒšáƒ˜áƒ–áƒ˜ áƒ”áƒ¥áƒ˜áƒ›áƒ˜áƒ¡ áƒ“áƒáƒœáƒ˜áƒ¨áƒœáƒ£áƒšáƒ”áƒ‘áƒ˜áƒ—</strong>. áƒáƒ“áƒ áƒ”áƒ£áƒšáƒ˜ áƒ’áƒáƒ›áƒáƒ•áƒšáƒ”áƒœáƒ áƒ¡áƒ áƒ£áƒšáƒ˜áƒáƒ“ áƒ’áƒáƒœáƒ™áƒ£áƒ áƒœáƒ”áƒ‘áƒáƒ“áƒ˜áƒ.</p>`,

    contentEn: `<p>Iron deficiency is one of the most common nutritional problems in childhood worldwide. After <strong>6 months</strong>, breast milk alone no longer provides enough iron, making iron-rich solid foods critically important for healthy development.</p>

<h2>Why Is Iron So Essential?</h2>

<p>Iron is necessary for <strong>hemoglobin production</strong> â€” the protein that carries oxygen in the blood. It's also crucial for <strong>brain development</strong>. According to <a href="https://www.who.int/publications/i/item/9789241596664" target="_blank" rel="noopener noreferrer">WHO research</a>, iron deficiency in infancy can cause:</p>

<ul>
  <li>Weakness and pale appearance</li>
  <li>Growth delays</li>
  <li>Irreversible cognitive development problems</li>
</ul>

<h2>Best Iron-Rich Foods</h2>

<h3>Heme Iron (from animal sources â€” better absorbed)</h3>
<ul>
  <li><strong>Beef</strong> â€” especially liver (6.5mg per 100g)</li>
  <li><strong>Chicken</strong></li>
  <li><strong>Fish</strong> â€” salmon, tuna, tilapia</li>
  <li><strong>Egg yolks</strong></li>
</ul>

<h3>Non-Heme Iron (plant-based sources)</h3>
<ul>
  <li><strong>Lentils and beans</strong></li>
  <li><strong>Spinach and broccoli</strong></li>
  <li><strong>Raisins</strong></li>
  <li><strong>Iron-fortified cereals</strong></li>
</ul>

<h2>Key Trick â€” Combine with Vitamin C</h2>

<p>Non-heme iron absorption <strong>triples</strong> when eaten alongside <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3999603/" target="_blank" rel="noopener noreferrer">vitamin C-rich foods</a>. Optimal combinations:</p>

<ul>
  <li>Spinach puree + <strong>peach puree</strong></li>
  <li>Lentil soup + <strong>tomato pieces</strong></li>
  <li>Iron-fortified porridge + <strong>orange juice</strong></li>
</ul>

<p><a href="/">mom menu meal plans</a> automatically include these optimal iron + vitamin C combinations every day.</p>

<h2>Daily Iron Requirements by Age</h2>

<ul>
  <li><strong>7â€“12 months:</strong> 11mg per day</li>
  <li><strong>1â€“3 years:</strong> 7mg per day</li>
</ul>

<p>Including iron-rich foods <strong>3â€“4 times per week</strong> effectively meets these requirements for most children.</p>

<h2>Signs of Iron Deficiency</h2>

<ul>
  <li>Child <strong>tires easily</strong> and is less active than usual</li>
  <li><strong>Pale appearance</strong>, especially around the lips</li>
  <li>Reduced appetite or interest in <strong>non-food items</strong> (pica)</li>
</ul>

<p>If you notice these signs â€” <strong>ask your doctor for a blood test</strong>. Iron-deficiency anemia caught early is completely treatable.</p>`,
  },

  {
    slug: 'akhirebuli-mchameeli-8-strategia',
    contentKa: `<p>"áƒ©áƒ”áƒ›áƒ˜ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒáƒ áƒáƒ¤áƒ”áƒ áƒ¡ áƒ­áƒáƒ›áƒ¡" â€” áƒ”áƒ¡ áƒ©áƒ˜áƒ•áƒ˜áƒšáƒ˜ áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ®áƒ¨áƒ˜áƒ áƒ˜áƒ 1â€“5 áƒ¬áƒšáƒáƒ›áƒ“áƒ” áƒ‘áƒáƒ•áƒ¨áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ›áƒ¨áƒáƒ‘áƒšáƒ”áƒ‘áƒ¨áƒ˜. <strong>áƒ™áƒáƒ áƒ’áƒ˜ áƒ¡áƒ˜áƒáƒ®áƒšáƒ”:</strong> áƒáƒ®áƒ˜áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ™áƒ•áƒ”áƒ‘áƒ áƒáƒ› áƒáƒ¡áƒáƒ™áƒ¨áƒ˜ áƒœáƒáƒ áƒ›áƒáƒ. <strong>áƒªáƒ£áƒ“áƒ˜ áƒ¡áƒ˜áƒáƒ®áƒšáƒ”:</strong> áƒ›áƒªáƒ“áƒáƒ áƒ˜ áƒ áƒ”áƒáƒ¥áƒªáƒ˜áƒ áƒáƒ› áƒ¥áƒªáƒ”áƒ•áƒáƒ¡ áƒ¡áƒáƒ›áƒ£áƒ“áƒáƒ›áƒáƒ“ áƒ’áƒáƒ›áƒáƒáƒ›áƒ§áƒáƒ áƒ”áƒ‘áƒ¡.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 1: "áƒžáƒáƒ¡áƒ£áƒ®áƒ˜áƒ¡áƒ›áƒ’áƒ”áƒ‘áƒšáƒáƒ‘áƒ˜áƒ¡ áƒ’áƒáƒœáƒáƒ¬áƒ˜áƒšáƒ”áƒ‘áƒ"</h2>

<p><a href="https://www.ellynsatterinstitute.org/how-to-feed/the-division-of-responsibility-in-feeding/" target="_blank" rel="noopener noreferrer">áƒ”áƒšáƒ˜áƒœ áƒ¡áƒáƒ¢áƒ”áƒ áƒ˜áƒ¡ áƒ›áƒ”áƒ—áƒáƒ“áƒ˜</a> â€” áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ™áƒáƒ áƒ’áƒáƒ“ áƒ“áƒáƒ™áƒ£áƒ›áƒ”áƒœáƒ¢áƒ˜áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ›áƒ˜áƒ“áƒ’áƒáƒ›áƒ áƒáƒ®áƒ˜áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ›áƒ­áƒáƒ›áƒ”áƒšáƒ”áƒ‘áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡:</p>

<ul>
  <li><strong>áƒ›áƒ¨áƒáƒ‘áƒ”áƒšáƒ˜ áƒ¬áƒ§áƒ•áƒ”áƒ¢áƒ¡:</strong> áƒ áƒ áƒ›áƒ˜áƒáƒ áƒ—áƒ•áƒáƒ¡, áƒ¡áƒáƒ“ áƒ“áƒ áƒ áƒáƒ“áƒ˜áƒ¡</li>
  <li><strong>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ¬áƒ§áƒ•áƒ”áƒ¢áƒ¡:</strong> áƒ­áƒáƒ›áƒ¡ áƒ—áƒ£ áƒáƒ áƒ áƒ“áƒ áƒ áƒáƒ›áƒ“áƒ”áƒœáƒ¡</li>
</ul>

<p>áƒ”áƒ¡ áƒáƒ›áƒªáƒ˜áƒ áƒ”áƒ‘áƒ¡ áƒ™áƒ•áƒ”áƒ‘áƒáƒ–áƒ” áƒ™áƒáƒœáƒ¤áƒšáƒ˜áƒ¥áƒ¢áƒ¡ áƒ“áƒ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡ áƒáƒœáƒ˜áƒ­áƒ”áƒ‘áƒ¡ áƒáƒ•áƒ¢áƒáƒœáƒáƒ›áƒ˜áƒáƒ¡ â€” áƒ«áƒáƒšáƒ“áƒáƒ¢áƒáƒœáƒ”áƒ‘áƒ áƒ™áƒ˜ áƒžáƒ˜áƒ áƒ˜áƒ¥áƒ˜áƒ—, áƒáƒ®áƒ˜áƒ áƒ”áƒ‘áƒáƒ¡ áƒáƒ›áƒ§áƒáƒ áƒ”áƒ‘áƒ¡.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 2: áƒáƒ®áƒáƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ 10â€“15-áƒ¯áƒ”áƒ  áƒ’áƒáƒ”áƒªáƒáƒœáƒ˜áƒ—</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/17181294/" target="_blank" rel="noopener noreferrer">áƒ™áƒ•áƒšáƒ”áƒ•áƒ”áƒ‘áƒ˜ áƒ’áƒ•áƒ˜áƒ©áƒ•áƒ”áƒœáƒ”áƒ‘áƒ¡</a>, áƒ áƒáƒ› áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡ áƒáƒ®áƒáƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒáƒ¡áƒáƒªáƒœáƒáƒ‘áƒáƒ“ áƒ¡áƒáƒ­áƒ˜áƒ áƒáƒ <strong>8â€“15 áƒ¨áƒ”áƒ®áƒ”áƒ‘áƒ</strong>. áƒžáƒ˜áƒ áƒ•áƒ”áƒš áƒ®áƒ£áƒ— áƒ¯áƒ”áƒ  áƒ‘áƒáƒ•áƒ¨áƒ•áƒ›áƒ áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ <strong>áƒ£áƒáƒ áƒ˜ áƒ—áƒ¥áƒ•áƒáƒ¡ â€” áƒ”áƒ¡ áƒœáƒáƒ áƒ›áƒáƒ</strong>, áƒ›áƒáƒ¥áƒœáƒ”áƒ£áƒšáƒáƒ“ áƒ’áƒáƒœáƒáƒ’áƒ áƒ«áƒ”áƒ—.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 3: áƒáƒ®áƒáƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ + áƒªáƒœáƒáƒ‘áƒ˜áƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜</h2>

<p>áƒ§áƒáƒ•áƒ”áƒš áƒ™áƒ•áƒ”áƒ‘áƒáƒ¨áƒ˜ <strong>áƒ”áƒ áƒ—áƒ˜ áƒáƒ®áƒáƒšáƒ˜ áƒžáƒ áƒáƒ“áƒ£áƒ¥áƒ¢áƒ˜ + áƒ”áƒ áƒ—áƒ˜ áƒ£áƒ™áƒ•áƒ” áƒ¡áƒáƒ§áƒ•áƒáƒ áƒ”áƒšáƒ˜</strong>. áƒáƒ®áƒáƒšáƒ˜ áƒ™áƒ˜ áƒ§áƒáƒ•áƒ”áƒšáƒ—áƒ•áƒ˜áƒ¡ "áƒ¡áƒ¢áƒ£áƒ›áƒáƒ áƒ˜áƒ" â€” áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ•áƒáƒšáƒ“áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒáƒ  áƒáƒ áƒ˜áƒ¡, áƒ­áƒáƒ›áƒáƒ¡, áƒ›áƒáƒ’áƒ áƒáƒ› "áƒ“áƒáƒ›áƒ”áƒ’áƒáƒ‘áƒ áƒ”áƒ‘áƒ" áƒ¡áƒáƒ•áƒáƒšáƒ“áƒ”áƒ‘áƒ£áƒšáƒáƒ.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 4: áƒ­áƒáƒ›áƒ áƒáƒ¯áƒáƒ®áƒ—áƒáƒœ áƒ”áƒ áƒ—áƒáƒ“</h2>

<p>áƒ¡áƒáƒªáƒ˜áƒáƒšáƒ£áƒ áƒ˜ áƒ™áƒ•áƒ”áƒ‘áƒ áƒáƒ›áƒªáƒ˜áƒ áƒ”áƒ‘áƒ¡ áƒ¡áƒ¢áƒ áƒ”áƒ¡áƒ¡. áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ®áƒ”áƒ“áƒáƒ•áƒ¡, áƒ áƒáƒ› <strong>áƒ¡áƒ®áƒ•áƒ”áƒ‘áƒ˜áƒª áƒ­áƒáƒ›áƒ”áƒœ áƒáƒ› áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ¡</strong>. <strong>áƒ›áƒ˜áƒ›áƒ‘áƒáƒ«áƒ•áƒ”áƒšáƒáƒ‘áƒ˜áƒ¡ áƒ˜áƒœáƒ¡áƒ¢áƒ˜áƒœáƒ¥áƒ¢áƒ˜</strong> â€” áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ«áƒšáƒ˜áƒ”áƒ áƒ˜ áƒ˜áƒáƒ áƒáƒ¦áƒ˜, áƒ áƒáƒª áƒ›áƒ¨áƒáƒ‘áƒ”áƒšáƒ¡ áƒáƒ¥áƒ•áƒ¡.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 5: áƒ“áƒáƒ›áƒáƒ£áƒ™áƒ˜áƒ“áƒ”áƒ‘áƒšáƒáƒ‘áƒ áƒ­áƒáƒ›áƒ˜áƒ¡ áƒžáƒ áƒáƒªáƒ”áƒ¡áƒ¨áƒ˜</h2>

<p>áƒ›áƒ˜áƒ”áƒªáƒ˜áƒ— áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡, <strong>áƒ“áƒáƒ›áƒáƒ£áƒ™áƒ˜áƒ“áƒ”áƒ‘áƒšáƒáƒ“ áƒ­áƒáƒ›áƒáƒ¡</strong> â€” áƒ—áƒ£áƒœáƒ“áƒáƒª áƒ§áƒ•áƒ”áƒšáƒáƒ¤áƒ”áƒ áƒ˜ áƒ’áƒáƒ“áƒáƒ§áƒáƒ áƒáƒ¡. áƒ¤áƒ£áƒœáƒ¥áƒ˜áƒ = áƒ­áƒáƒ›áƒáƒ–áƒ” áƒ˜áƒœáƒ¢áƒ”áƒ áƒ”áƒ¡. áƒ’áƒáƒ›áƒáƒ˜áƒ§áƒ”áƒœáƒ”áƒ— áƒ™áƒáƒ•áƒ–áƒ˜, áƒ©áƒáƒœáƒ’áƒáƒšáƒ˜, áƒ—áƒ˜áƒ—áƒ”áƒ‘áƒ˜ â€” <strong>áƒ§áƒ•áƒ”áƒšáƒ áƒ˜áƒœáƒ¡áƒ¢áƒ áƒ£áƒ›áƒ”áƒœáƒ¢áƒ˜ áƒ”áƒ áƒ—áƒœáƒáƒ˜áƒ áƒáƒ“ áƒ™áƒáƒ áƒ’áƒ˜áƒ</strong>.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 6: áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ©áƒ¥áƒáƒ áƒáƒ‘áƒ˜áƒ¡ áƒ—áƒáƒ•áƒ˜áƒ“áƒáƒœ áƒáƒªáƒ˜áƒšáƒ”áƒ‘áƒ</h2>

<p>áƒ§áƒáƒ•áƒ”áƒš áƒ™áƒ•áƒ”áƒ‘áƒáƒ¡ áƒ“áƒáƒ£áƒ—áƒ›áƒ”áƒ— <strong>áƒ¡áƒ£áƒš áƒ›áƒªáƒ˜áƒ áƒ” 20 áƒ¬áƒ£áƒ—áƒ˜</strong>. áƒ©áƒ¥áƒáƒ áƒáƒ‘áƒ áƒ“áƒ áƒ¤áƒ˜áƒ–áƒ˜áƒ™áƒ£áƒ áƒ˜ áƒ–áƒ”áƒ¬áƒáƒšáƒ â€” áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ“áƒ˜áƒ“áƒ˜ áƒ¨áƒ”áƒªáƒ“áƒáƒ›áƒ. <strong>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ¡áƒ¢áƒ áƒ”áƒ¡áƒ¡áƒ áƒ“áƒ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ¡ áƒáƒ¡áƒáƒªáƒ˜áƒáƒªáƒ˜áƒáƒ¨áƒ˜ áƒ§áƒ áƒ˜áƒ¡</strong>, áƒ áƒáƒª áƒ’áƒ áƒ«áƒ”áƒšáƒ•áƒáƒ“áƒ˜áƒáƒœ áƒžáƒ áƒáƒ‘áƒšáƒ”áƒ›áƒ”áƒ‘áƒ¡ áƒ¥áƒ›áƒœáƒ˜áƒ¡.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 7: áƒ•áƒ˜áƒ–áƒ£áƒáƒšáƒ£áƒ áƒ˜ áƒ›áƒáƒ¢áƒ˜áƒ•áƒáƒªáƒ˜áƒ</h2>

<p>2â€“3 áƒ¬áƒšáƒ˜áƒ¡ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ”áƒ‘áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡: <strong>áƒ•áƒ˜áƒ–áƒ£áƒáƒšáƒ£áƒ áƒ˜ áƒ›áƒáƒ¢áƒ˜áƒ•áƒáƒªáƒ˜áƒ</strong> â€” áƒ§áƒáƒ•áƒ”áƒšáƒ˜ áƒáƒ®áƒáƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒáƒ’áƒ”áƒ›áƒáƒ•áƒœáƒ”áƒ‘áƒáƒ–áƒ” áƒœáƒáƒ®áƒáƒ¢áƒ˜, áƒ¡áƒ¢áƒ˜áƒ™áƒ”áƒ áƒ˜ áƒáƒœ áƒ•áƒáƒ áƒ¡áƒ™áƒ•áƒšáƒáƒ•áƒ˜. áƒ”áƒ¡ <strong>áƒ’áƒáƒ›áƒáƒ¬áƒ•áƒ”áƒ•áƒáƒ“</strong> áƒ“áƒ áƒ¡áƒáƒ®áƒáƒšáƒ˜áƒ¡áƒáƒ“ áƒ’áƒáƒ®áƒ“áƒ˜áƒ¡ áƒ™áƒ•áƒ”áƒ‘áƒáƒ¡ â€” áƒ§áƒáƒ•áƒ”áƒšáƒ’áƒ•áƒáƒ áƒ˜ áƒ–áƒ”áƒ¬áƒáƒšáƒ˜áƒ¡ áƒ’áƒáƒ áƒ”áƒ¨áƒ”.</p>

<h2>áƒ¡áƒ¢áƒ áƒáƒ¢áƒ”áƒ’áƒ˜áƒ 8: áƒ©áƒáƒ áƒ—áƒ”áƒ— áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ¡áƒáƒ›áƒ–áƒáƒ áƒ”áƒ£áƒšáƒáƒ¨áƒ˜</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/25294560/" target="_blank" rel="noopener noreferrer">áƒ™áƒ•áƒšáƒ”áƒ•áƒ”áƒ‘áƒ˜ áƒáƒ“áƒáƒ¡áƒ¢áƒ£áƒ áƒ”áƒ‘áƒ¡</a>, áƒ áƒáƒ› áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜, áƒ•áƒ˜áƒœáƒª <strong>áƒ§áƒ•áƒáƒ•áƒ˜áƒšáƒáƒ‘áƒ¡ áƒ¡áƒáƒ›áƒ–áƒáƒ áƒ”áƒ£áƒšáƒáƒ¨áƒ˜</strong>, 3-áƒ¯áƒ”áƒ  áƒ£áƒ¤áƒ áƒ áƒ›áƒ”áƒ¢ áƒ›áƒ áƒáƒ•áƒáƒšáƒ¤áƒ”áƒ áƒáƒ•áƒœáƒ”áƒ‘áƒáƒ¡ áƒ­áƒáƒ›áƒ¡. áƒáƒ¡áƒáƒ™áƒ˜áƒ¡ áƒ¨áƒ”áƒ¡áƒáƒ‘áƒáƒ›áƒ˜áƒ¡áƒ˜ áƒáƒ›áƒáƒªáƒáƒœáƒ”áƒ‘áƒ˜: áƒáƒ›áƒáƒ¦áƒ”áƒ‘áƒ, áƒ©áƒáƒ§áƒ áƒ, áƒ¨áƒ”áƒ–áƒ”áƒšáƒ. <em>"áƒ©áƒ”áƒ›áƒ›áƒ áƒ®áƒ”áƒšáƒ”áƒ‘áƒ›áƒ áƒ’áƒáƒáƒ™áƒ”áƒ—áƒ"</em> â€” áƒáƒ› áƒ’áƒ áƒ«áƒœáƒáƒ‘áƒ áƒáƒ›áƒªáƒ˜áƒ áƒ”áƒ‘áƒ¡ áƒáƒ®áƒáƒš áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ—áƒáƒœ áƒ¡áƒ˜áƒ¤áƒ áƒ—áƒ®áƒ˜áƒšáƒ”áƒ¡.</p>

<p><a href="/">mom menu-áƒ˜áƒ¡ áƒ“áƒ¦áƒ˜áƒ£áƒ áƒ˜ áƒ’áƒ”áƒ’áƒ›áƒ”áƒ‘áƒ˜</a> áƒ”áƒ®áƒ›áƒáƒ áƒ”áƒ‘áƒ áƒ›áƒ¨áƒáƒ‘áƒšáƒ”áƒ‘áƒ¡ <strong>áƒ•áƒáƒ áƒ˜áƒáƒœáƒ¢áƒáƒ‘áƒ˜áƒ¡</strong> áƒ¨áƒ”áƒœáƒáƒ áƒ©áƒ£áƒœáƒ”áƒ‘áƒáƒ¨áƒ˜ â€” áƒ§áƒáƒ•áƒ”áƒš áƒ™áƒ•áƒ”áƒ‘áƒáƒ¨áƒ˜ áƒáƒ®áƒáƒšáƒ˜ + áƒœáƒáƒªáƒœáƒáƒ‘áƒ˜ áƒ™áƒáƒ›áƒ‘áƒ˜áƒœáƒáƒªáƒ˜áƒ˜áƒ¡ áƒžáƒ áƒ˜áƒœáƒªáƒ˜áƒžáƒ˜áƒ¡ áƒ“áƒáƒªáƒ•áƒ˜áƒ—.</p>`,

    contentEn: `<p>"My child won't eat anything" â€” this is the most common complaint from parents of children aged 1â€“5. <strong>Good news:</strong> picky eating at this age is developmentally normal. <strong>Bad news:</strong> the wrong response can make it permanent.</p>

<h2>Strategy 1: The Division of Responsibility</h2>

<p>The <a href="https://www.ellynsatterinstitute.org/how-to-feed/the-division-of-responsibility-in-feeding/" target="_blank" rel="noopener noreferrer">Ellyn Satter method</a> â€” the most research-backed approach for picky eaters:</p>

<ul>
  <li><strong>Parent decides:</strong> what to serve, where, and when</li>
  <li><strong>Child decides:</strong> whether to eat and how much</li>
</ul>

<p>This reduces mealtime conflict and gives children appropriate autonomy â€” pressure and force-feeding reinforce pickiness.</p>

<h2>Strategy 2: Expose New Foods 10â€“15 Times</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/17181294/" target="_blank" rel="noopener noreferrer">Research shows</a> children need <strong>8â€“15 exposures</strong> to a new food before accepting it. Refusal in the first five attempts is <strong>completely normal</strong> â€” keep offering calmly without pressure.</p>

<h2>Strategy 3: New Food + Familiar Food</h2>

<p>Every meal includes <strong>one new item alongside something already liked</strong>. The new food is a "guest" â€” child doesn't have to eat it, but must get acquainted with it at the table.</p>

<h2>Strategy 4: Family Meals Together</h2>

<p>Social eating reduces food anxiety. Children see that <strong>others eat these foods too</strong>. <strong>Imitation instinct</strong> is the most powerful tool available â€” more effective than any coaxing.</p>

<h2>Strategy 5: Encourage Independence at the Table</h2>

<p>Let children <strong>self-feed</strong> even if it's messy. Engagement = interest in food. Spoons, forks, and fingers â€” <strong>all tools are equally valid</strong> for toddlers.</p>

<h2>Strategy 6: Avoid Mealtime Rushing</h2>

<p>Allow at least <strong>20 minutes per meal</strong>. Rushing and pressure are the biggest mistakes. <strong>Children associate stress with food</strong>, creating negative eating relationships that can last decades.</p>

<h2>Strategy 7: Reward Curiosity, Not Consumption</h2>

<p>For 2â€“3 year olds: <strong>visual rewards</strong> like stickers or drawings for trying (not finishing) new foods. This gamifies eating in a healthy way â€” no pressure, just curiosity rewarded.</p>

<h2>Strategy 8: Involve Children in Cooking</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/25294560/" target="_blank" rel="noopener noreferrer">Research confirms</a> children who <strong>help in the kitchen</strong> eat 3Ã— more variety. Age-appropriate tasks: stirring, pouring, washing vegetables. <em>"My hands made this"</em> reduces wariness of unfamiliar foods.</p>

<p><a href="/">mom menu daily plans</a> help parents maintain <strong>variety</strong> â€” automatically combining new and familiar foods at every meal.</p>`,
  },

  {
    slug: 'baby-led-weaning-sruli-saxelmdzghvanelo',
    contentKa: `<p><strong>Baby-Led Weaning (BLW)</strong> â€” áƒ”áƒ¡ áƒ›áƒ˜áƒ“áƒ’áƒáƒ›áƒ áƒ£áƒ™áƒ•áƒ” 15 áƒ¬áƒ”áƒšáƒ˜áƒ áƒ›áƒ¡áƒáƒ¤áƒšáƒ˜áƒáƒ¨áƒ˜ áƒžáƒáƒžáƒ£áƒšáƒáƒ áƒ£áƒšáƒ˜áƒ, áƒ›áƒáƒ’áƒ áƒáƒ› áƒ¡áƒáƒ¥áƒáƒ áƒ—áƒ•áƒ”áƒšáƒáƒ¨áƒ˜ áƒ¯áƒ”áƒ  áƒ‘áƒ”áƒ•áƒ áƒ˜ áƒ›áƒ¨áƒáƒ‘áƒ”áƒšáƒ˜ áƒáƒ  áƒ˜áƒªáƒœáƒáƒ‘áƒ¡. BLW áƒœáƒ˜áƒ¨áƒœáƒáƒ•áƒ¡, áƒ áƒáƒ› áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ›áƒ§áƒáƒ  áƒ™áƒ•áƒ”áƒ‘áƒáƒ–áƒ” áƒ’áƒáƒ“áƒáƒ“áƒ˜áƒ¡ <strong>áƒžáƒ˜áƒ£áƒ áƒ”áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒáƒ áƒ”áƒ¨áƒ”</strong> â€” áƒžáƒ˜áƒ áƒ“áƒáƒžáƒ˜áƒ  "áƒœáƒáƒ›áƒ“áƒ•áƒ˜áƒš" áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ–áƒ”, áƒáƒ¦áƒáƒœáƒ“ áƒáƒ¡áƒáƒ™áƒ˜áƒ¡ áƒ¨áƒ”áƒ¡áƒáƒ‘áƒáƒ›áƒ˜áƒ¡ áƒ–áƒáƒ›áƒ”áƒ‘áƒ¨áƒ˜.</p>

<h2>BLW-áƒ˜áƒ¡ áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“áƒ˜ áƒžáƒ áƒ˜áƒœáƒªáƒ˜áƒžáƒ”áƒ‘áƒ˜</h2>

<p>6 áƒ—áƒ•áƒ˜áƒ¡ áƒáƒ¡áƒáƒ™áƒ˜áƒ“áƒáƒœ, <a href="/blog/myar-sakvelze-gadasvla-6-tvidan">áƒ›áƒ–áƒáƒáƒ‘áƒ˜áƒ¡ áƒœáƒ˜áƒ¨áƒœáƒ”áƒ‘áƒ˜áƒ¡</a> áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’, áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡ áƒ•áƒ—áƒáƒ•áƒáƒ–áƒáƒ‘áƒ— <strong>áƒšáƒ›áƒáƒ‘áƒ˜áƒ”áƒ  áƒáƒœ áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ£áƒš áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ¡ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“</strong> â€” áƒáƒ áƒ áƒ’áƒáƒ®áƒ”áƒ®áƒ˜áƒšáƒ¡. áƒ–áƒáƒ›áƒ:</p>

<ul>
  <li><strong>7â€“8 áƒ—áƒ•áƒ”áƒ›áƒ“áƒ”</strong> (áƒžáƒ˜áƒœáƒªáƒ”áƒ¢áƒ˜áƒ¡ áƒ®áƒ”áƒšáƒ˜ áƒ¯áƒ”áƒ  áƒáƒ  áƒ’áƒáƒœáƒ•áƒ˜áƒ—áƒáƒ áƒ”áƒ‘áƒ£áƒšáƒ): áƒ©áƒ•áƒ˜áƒšáƒ˜áƒ¡ áƒ›áƒ™áƒšáƒáƒ•áƒ˜áƒ¡ áƒ¡áƒ˜áƒ’áƒ áƒ«áƒ˜áƒ¡ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒ˜ â€” 7â€“8 áƒ¡áƒ›</li>
  <li><strong>8 áƒ—áƒ•áƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’:</strong> áƒžáƒáƒ¢áƒáƒ áƒ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒ˜ 1â€“2 áƒ¡áƒ› áƒ–áƒáƒ›áƒ˜áƒ¡</li>
</ul>

<h2>BLW-áƒ˜áƒ¡ áƒ£áƒžáƒ˜áƒ áƒáƒ¢áƒ”áƒ¡áƒáƒ‘áƒ”áƒ‘áƒ˜</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/22003441/" target="_blank" rel="noopener noreferrer">áƒ™áƒ•áƒšáƒ”áƒ•áƒ”áƒ‘áƒ˜ áƒ’áƒ•áƒ˜áƒ©áƒ•áƒ”áƒœáƒ”áƒ‘áƒ¡</a>:</p>

<ul>
  <li>BLW-áƒ˜áƒ¡ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ”áƒ‘áƒ˜ <strong>áƒ£áƒ¤áƒ áƒ áƒœáƒáƒ™áƒšáƒ”áƒ‘áƒáƒ“ áƒáƒ®áƒ˜áƒ áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ›áƒ­áƒáƒ›áƒ”áƒšáƒ”áƒ‘áƒ˜</strong> áƒ®áƒ“áƒ”áƒ‘áƒ˜áƒáƒœ</li>
  <li>áƒáƒ“áƒ áƒ” áƒ•áƒ˜áƒ—áƒáƒ áƒ“áƒ”áƒ‘áƒ <strong>áƒ®áƒ”áƒšáƒ˜áƒ¡ áƒ›áƒáƒ¢áƒáƒ áƒ˜áƒ™áƒ</strong></li>
  <li>áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ¡áƒ¬áƒáƒ•áƒšáƒáƒ‘áƒ¡ <strong>áƒ¡áƒ˜áƒ›áƒ«áƒ¦áƒœáƒáƒ áƒ˜áƒ¡áƒ áƒ“áƒ áƒ¨áƒ˜áƒ›áƒ¨áƒ˜áƒšáƒ˜áƒ¡ áƒ¡áƒ˜áƒ’áƒœáƒáƒšáƒ”áƒ‘áƒ¡</strong> â€” áƒœáƒáƒ™áƒšáƒ”áƒ‘áƒ˜ áƒ¡áƒ˜áƒ›áƒ¡áƒ£áƒ¥áƒœáƒ” áƒ›áƒáƒ–áƒ áƒ“áƒ˜áƒš áƒáƒ¡áƒáƒ™áƒ¨áƒ˜</li>
  <li>áƒáƒ¯áƒáƒ®áƒ£áƒ áƒ˜ áƒ¡áƒ£áƒ¤áƒ áƒ <strong>áƒ£áƒ¤áƒ áƒ áƒáƒ“áƒ•áƒ˜áƒšáƒ˜</strong> áƒ®áƒ“áƒ”áƒ‘áƒ â€” áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒáƒ¯áƒáƒ®áƒ˜áƒ¡ áƒ™áƒ•áƒ”áƒ‘áƒáƒ¡ áƒ­áƒáƒ›áƒ¡</li>
</ul>

<h2>BLW-áƒ˜áƒ¡ áƒ’áƒáƒ›áƒáƒ¬áƒ•áƒ”áƒ•áƒ”áƒ‘áƒ˜ â€” áƒ’áƒ£áƒšáƒ¬áƒ áƒ¤áƒ”áƒšáƒáƒ“</h2>

<ul>
  <li><strong>áƒ‘áƒ”áƒ•áƒ áƒ˜ áƒ­áƒ£áƒ­áƒ§áƒ˜</strong> â€” áƒ”áƒ¡ áƒœáƒáƒ áƒ›áƒáƒ, áƒ”áƒ¡ áƒ¡áƒ¬áƒáƒ•áƒšáƒáƒ</li>
  <li><strong>áƒ‘áƒ”áƒ•áƒ áƒ˜ áƒ’áƒáƒ’áƒ“áƒ”áƒ‘áƒ</strong> â€” áƒžáƒ˜áƒ áƒ•áƒ”áƒš áƒ™áƒ•áƒ˜áƒ áƒ”áƒ‘áƒ¨áƒ˜ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ "áƒ˜áƒ—áƒáƒ›áƒáƒ¨áƒáƒ¡" áƒ•áƒ˜áƒ“áƒ áƒ” áƒ­áƒáƒ›áƒáƒ¡</li>
  <li><strong>áƒ“áƒáƒ®áƒ áƒ©áƒáƒ‘áƒ˜áƒ¡ áƒ¨áƒ˜áƒ¨áƒ˜</strong> â€” <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">áƒáƒ®áƒ•áƒ”áƒšáƒ”áƒ‘áƒ áƒ¡áƒ®áƒ•áƒ áƒ áƒáƒ›áƒ”áƒ</a>, BLW-áƒ˜áƒ— áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒœáƒáƒ—áƒšáƒáƒ“ áƒ¡áƒ¬áƒáƒ•áƒšáƒáƒ‘áƒ¡ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒáƒ“áƒáƒœáƒáƒ§áƒ áƒ”áƒ‘áƒáƒ¡</li>
</ul>

<h2>BLW-áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡ áƒ¨áƒ”áƒ¡áƒáƒ¤áƒ”áƒ áƒ˜ áƒžáƒ˜áƒ áƒ•áƒ”áƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜</h2>

<ul>
  <li><strong>áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜ áƒáƒœ áƒ¨áƒ•áƒ áƒ˜áƒ</strong> â€” áƒáƒ“áƒœáƒáƒ• áƒ¡áƒ¥áƒ”áƒšáƒ˜, áƒ™áƒáƒ•áƒ–áƒ˜áƒ“áƒáƒœ</li>
  <li><strong>áƒ‘áƒáƒšáƒáƒ¥áƒ˜</strong> â€” áƒ™áƒáƒ áƒ’áƒáƒ“ áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ£áƒšáƒ˜, áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“</li>
  <li><strong>áƒ‘áƒáƒœáƒáƒœáƒ˜</strong> â€” áƒ¡áƒáƒ› áƒœáƒáƒ­áƒ áƒáƒ“ áƒ’áƒáƒ®áƒšáƒ”áƒ©áƒ˜áƒšáƒ˜ (áƒ™áƒáƒœáƒ˜ áƒáƒ“áƒœáƒáƒ• áƒ“áƒáƒ£áƒ¢áƒáƒ•áƒ”áƒ— â€” áƒáƒ“áƒ•áƒ˜áƒšáƒáƒ“ áƒ”áƒ­áƒ˜áƒ áƒ”áƒ‘áƒ)</li>
  <li><strong>áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜áƒ¡ áƒ‘áƒšáƒ˜áƒœáƒ˜</strong> â€” áƒ›áƒáƒ áƒ˜áƒšáƒ˜áƒ¡ áƒ’áƒáƒ áƒ”áƒ¨áƒ”</li>
  <li><strong>áƒ¥áƒáƒ—áƒ›áƒ˜áƒ¡ áƒœáƒáƒ­áƒ”áƒ áƒ˜</strong> â€” áƒ›áƒáƒ áƒ˜áƒšáƒ˜áƒ¡ áƒ’áƒáƒ áƒ”áƒ¨áƒ”, áƒšáƒ›áƒáƒ‘áƒ˜áƒ”áƒ áƒ˜</li>
  <li><strong>áƒ¡áƒ£áƒ­áƒ˜</strong> â€” áƒ©áƒ•áƒ˜áƒšáƒ˜áƒ¡ áƒ–áƒáƒ›áƒ˜áƒ¡ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“, áƒ™áƒáƒ áƒ’áƒáƒ“ áƒ¨áƒ”áƒ›áƒ“áƒ£áƒ¦áƒáƒ áƒ”</li>
</ul>

<h2>BLW vs áƒ¢áƒ áƒáƒ“áƒ˜áƒªáƒ˜áƒ£áƒšáƒ˜ áƒžáƒ˜áƒ£áƒ áƒ” â€” áƒ•áƒ˜áƒœ "áƒ˜áƒ’áƒ”áƒ‘áƒ¡"?</h2>

<p>áƒ¡áƒ˜áƒ›áƒáƒ áƒ—áƒšáƒ”: <strong>áƒáƒ  áƒáƒ áƒ¡áƒ”áƒ‘áƒáƒ‘áƒ¡ áƒ”áƒ áƒ—áƒ˜ áƒ¡áƒ¬áƒáƒ áƒ˜ áƒ’áƒ–áƒ</strong>. áƒ‘áƒ”áƒ•áƒ áƒ˜ áƒ›áƒ¨áƒáƒ‘áƒ”áƒšáƒ˜ <em>"áƒ™áƒáƒ›áƒ‘áƒ˜áƒœáƒ˜áƒ áƒ”áƒ‘áƒ£áƒš"</em> áƒ›áƒ”áƒ—áƒáƒ“áƒ¡ áƒ˜áƒ§áƒ”áƒœáƒ”áƒ‘áƒ¡ â€” áƒ–áƒáƒ’ áƒ™áƒ•áƒ”áƒ‘áƒáƒ¨áƒ˜ áƒžáƒ˜áƒ£áƒ áƒ”, áƒ–áƒáƒ’ áƒ™áƒ•áƒ”áƒ‘áƒáƒ¨áƒ˜ BLW. <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5438437/" target="_blank" rel="noopener noreferrer">áƒ™áƒ•áƒšáƒ”áƒ•áƒ”áƒ‘áƒ˜ áƒáƒ“áƒáƒ¡áƒ¢áƒ£áƒ áƒ”áƒ‘áƒ¡</a>, áƒ áƒáƒ› áƒáƒ áƒ˜áƒ•áƒ” áƒ›áƒ”áƒ—áƒáƒ“áƒ¡ áƒ™áƒáƒ áƒ’áƒ˜ áƒ¨áƒ”áƒ“áƒ”áƒ’áƒ˜ áƒáƒ¥áƒ•áƒ¡, áƒ—áƒ£ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ áƒ˜áƒœáƒ¢áƒ”áƒ áƒ”áƒ¡áƒ¡ áƒ›áƒ˜áƒ•áƒ§áƒ•áƒ”áƒ‘áƒ˜áƒ—.</p>`,

    contentEn: `<p><strong>Baby-Led Weaning (BLW)</strong> has been popular worldwide for 15 years, but many parents are still unfamiliar with this approach. BLW means transitioning to solid foods <strong>without purees</strong> â€” going directly to "real" food in age-appropriate sizes and textures.</p>

<h2>Core BLW Principles</h2>

<p>Starting at 6 months with <a href="/blog/myar-sakvelze-gadasvla-6-tvidan">readiness signs</a>, offer <strong>soft or cooked foods in pieces</strong> â€” not mashed. Size guidelines:</p>

<ul>
  <li><strong>Until 7â€“8 months</strong> (before pincer grasp develops): finger-length sticks â€” 7â€“8cm long</li>
  <li><strong>After 8 months:</strong> smaller pieces, 1â€“2cm in size</li>
</ul>

<h2>Benefits of BLW</h2>

<p><a href="https://pubmed.ncbi.nlm.nih.gov/22003441/" target="_blank" rel="noopener noreferrer">Research shows</a>:</p>

<ul>
  <li>BLW babies become <strong>significantly less picky eaters</strong></li>
  <li><strong>Fine motor skills</strong> develop earlier</li>
  <li>Babies learn natural <strong>hunger and fullness cues</strong> â€” associated with lower obesity rates later</li>
  <li>Family mealtimes become <strong>easier</strong> â€” baby eats what the family eats</li>
</ul>

<h2>BLW Challenges â€” Honestly</h2>

<ul>
  <li><strong>Lots of mess</strong> â€” this is normal, this is learning</li>
  <li><strong>Lots of food on the floor</strong> â€” in the first weeks, baby may "play" more than eat</li>
  <li><strong>Choking fear</strong> â€” <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">gagging is different from choking</a>; BLW babies learn to manage food texture through gagging</li>
</ul>

<h2>Good First BLW Foods</h2>

<ul>
  <li><strong>Rice or oat porridge</strong> â€” slightly thick, offered on a spoon or preloaded</li>
  <li><strong>Broccoli florets</strong> â€” well cooked, soft enough to squish</li>
  <li><strong>Banana</strong> â€” cut into three strips (leave a little peel for grip)</li>
  <li><strong>Rice pancakes</strong> â€” no added salt</li>
  <li><strong>Chicken strips</strong> â€” unsalted, tender</li>
  <li><strong>Zucchini</strong> â€” finger-sized pieces, well cooked</li>
</ul>

<h2>BLW vs Traditional Purees â€” Who "Wins"?</h2>

<p>Honestly: <strong>there's no single right approach</strong>. Many parents use a <em>combined method</em> â€” purees for some meals, BLW for others. <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5438437/" target="_blank" rel="noopener noreferrer">Research confirms</a> both approaches have good outcomes when you follow the baby's lead and interest.</p>`,
  },

  {
    slug: 'akrdzaluli-sakvebi-ertwlamde-ataswlamde',
    contentKa: `<p>1 áƒ¬áƒšáƒáƒ›áƒ“áƒ” áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡ áƒ™áƒ£áƒ­-áƒœáƒáƒ¬áƒšáƒáƒ•áƒ˜ áƒ¯áƒ”áƒ  áƒáƒ  áƒáƒ áƒ˜áƒ¡ áƒ¡áƒáƒ™áƒ›áƒáƒ áƒ˜áƒ¡áƒáƒ“ áƒ©áƒáƒ›áƒáƒ§áƒáƒšáƒ˜áƒ‘áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ’áƒáƒ áƒ™áƒ•áƒ”áƒ£áƒšáƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡áƒ áƒ“áƒ áƒœáƒ˜áƒ•áƒ—áƒ˜áƒ”áƒ áƒ”áƒ‘áƒ”áƒ‘áƒ˜áƒ¡ áƒ’áƒáƒ“áƒáƒ¡áƒáƒ›áƒ£áƒ¨áƒáƒ•áƒ”áƒ‘áƒšáƒáƒ“. <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">WHO-áƒ¡</a> áƒ“áƒ <a href="https://www.healthychildren.org/" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics-áƒ˜áƒ¡</a> áƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒáƒªáƒ˜áƒ”áƒ‘áƒ–áƒ” áƒ“áƒáƒ§áƒ áƒ“áƒœáƒáƒ‘áƒ˜áƒ— â€” <strong>10 áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜, áƒ áƒáƒ›áƒ”áƒšáƒ˜áƒª áƒáƒ› áƒáƒ¡áƒáƒ™áƒáƒ›áƒ“áƒ” áƒ™áƒáƒ¢áƒ”áƒ’áƒáƒ áƒ˜áƒ£áƒšáƒáƒ“ áƒáƒ  áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ</strong>.</p>

<h2>1. áƒ—áƒáƒ¤áƒšáƒ˜ â€” áƒ§áƒ•áƒ”áƒšáƒáƒ–áƒ” áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜!</h2>

<p>áƒ—áƒáƒ¤áƒšáƒ˜ áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ áƒ¨áƒ”áƒ˜áƒªáƒáƒ•áƒ“áƒ”áƒ¡ <em>Clostridium botulinum</em> áƒ¡áƒžáƒáƒ áƒ”áƒ‘áƒ¡, áƒ áƒáƒ›áƒ”áƒšáƒ˜áƒª áƒ©áƒ•áƒ˜áƒšáƒ”áƒ‘áƒ¨áƒ˜ <strong>áƒ˜áƒœáƒ¤áƒáƒœáƒ¢áƒ˜áƒšáƒ£áƒ áƒ˜ áƒ‘áƒáƒ¢áƒ£áƒšáƒ˜áƒ–áƒ›áƒ˜áƒ¡</strong> áƒ’áƒáƒ›áƒáƒ›áƒ¬áƒ•áƒ”áƒ•áƒ˜áƒ. <strong>1 áƒ¬áƒšáƒáƒ›áƒ“áƒ” â€” áƒ™áƒáƒ¢áƒ”áƒ’áƒáƒ áƒ˜áƒ£áƒšáƒáƒ“ áƒáƒ  áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ</strong> áƒœáƒ”áƒ‘áƒ˜áƒ¡áƒ›áƒ˜áƒ”áƒ  áƒ¤áƒáƒ áƒ›áƒáƒ¨áƒ˜ â€” áƒœáƒ”áƒ“áƒšáƒ˜, áƒ’áƒáƒ—áƒ‘áƒáƒ‘áƒ˜áƒšáƒ˜, áƒªáƒ®áƒáƒ‘áƒáƒ¨áƒ˜ áƒ’áƒáƒ›áƒáƒ§áƒ”áƒœáƒ”áƒ‘áƒ£áƒšáƒ˜.</p>

<h2>2. áƒ›áƒáƒ áƒ˜áƒšáƒ˜</h2>

<p>áƒ©áƒ•áƒ˜áƒšáƒ˜áƒ¡ áƒ—áƒ˜áƒ áƒ™áƒ›áƒ”áƒšáƒ”áƒ‘áƒ˜ áƒ¯áƒ”áƒ  <strong>áƒ•áƒ”áƒ  áƒáƒ›áƒ£áƒ¨áƒáƒ•áƒ”áƒ‘áƒ¡ áƒ‘áƒ”áƒ•áƒ  áƒœáƒáƒ¢áƒ áƒ˜áƒ£áƒ›áƒ¡</strong>. áƒ“áƒ¦áƒ˜áƒ£áƒ áƒ˜ áƒœáƒáƒ áƒ›áƒ: 6â€“12 áƒ—áƒ•áƒ˜áƒ¡ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡ â€” <strong>1 áƒ’-áƒ–áƒ” áƒœáƒáƒ™áƒšáƒ”áƒ‘áƒ˜</strong>. áƒ¤áƒ áƒ—áƒ®áƒ˜áƒšáƒáƒ“: áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜áƒ¡ áƒ‘áƒšáƒ˜áƒœáƒ”áƒ‘áƒ˜, áƒ¡áƒáƒ¤áƒšáƒ˜áƒ¡ áƒžáƒ£áƒ áƒ˜, áƒ§áƒ•áƒ”áƒšáƒ˜ áƒ®áƒ¨áƒ˜áƒ áƒáƒ“ áƒ‘áƒ”áƒ•áƒ  áƒ›áƒáƒ áƒ˜áƒšáƒ¡ áƒ¨áƒ”áƒ˜áƒªáƒáƒ•áƒ¡.</p>

<h2>3. áƒ¨áƒáƒ¥áƒáƒ áƒ˜ áƒ“áƒ áƒ¢áƒ™áƒ‘áƒ˜áƒšáƒ”áƒ£áƒšáƒ˜</h2>

<p>áƒáƒ“áƒ áƒ”áƒ£áƒšáƒ˜ áƒ¨áƒáƒ¥áƒáƒ áƒ˜ <strong>áƒ§áƒáƒšáƒ˜áƒ‘áƒ”áƒ‘áƒ¡ áƒ¢áƒ™áƒ‘áƒ˜áƒšáƒ–áƒ” áƒ“áƒáƒ›áƒáƒ™áƒ˜áƒ“áƒ”áƒ‘áƒ£áƒšáƒ”áƒ‘áƒáƒ¡</strong> áƒ“áƒ áƒáƒ•áƒ˜áƒ—áƒáƒ áƒ”áƒ‘áƒ¡ áƒ™áƒáƒ áƒ˜áƒ”áƒ¡áƒ¡ (áƒžáƒ˜áƒ áƒ•áƒ”áƒšáƒ˜ áƒ™áƒ‘áƒ˜áƒšáƒ”áƒ‘áƒ˜áƒ“áƒáƒœáƒ•áƒ”). <strong>áƒ®áƒ˜áƒšáƒ˜áƒ¡ áƒ¨áƒáƒ¥áƒáƒ áƒ˜ áƒ‘áƒ£áƒœáƒ”áƒ‘áƒ áƒ˜áƒ• áƒ®áƒ˜áƒšáƒ¨áƒ˜</strong> â€” áƒœáƒáƒ áƒ›áƒáƒšáƒ£áƒ áƒ˜áƒ. <strong>áƒ“áƒáƒ›áƒáƒ¢áƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ¨áƒáƒ¥áƒáƒ áƒ˜</strong> â€” áƒáƒ áƒ.</p>

<h2>4. áƒ›áƒ—áƒšáƒ˜áƒáƒœáƒ˜ áƒ«áƒ áƒáƒ®áƒ˜áƒ¡ áƒ áƒ«áƒ” (áƒ¡áƒáƒ¡áƒ›áƒ”áƒšáƒáƒ“)</h2>

<p>áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“ áƒ¡áƒáƒ¡áƒ›áƒ”áƒšáƒáƒ“ 1 áƒ¬áƒšáƒáƒ›áƒ“áƒ” â€” <strong>áƒáƒ áƒáƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒ”áƒ‘áƒ£áƒšáƒ˜áƒ</strong> (áƒ¤áƒáƒ áƒ“áƒáƒ‘áƒ˜áƒ— áƒ‘áƒ”áƒ•áƒ  áƒªáƒ˜áƒšáƒáƒ¡áƒ áƒ“áƒ áƒœáƒáƒ¢áƒ áƒ˜áƒ£áƒ›áƒ¡ áƒ¨áƒ”áƒ˜áƒªáƒáƒ•áƒ¡, áƒ áƒáƒª áƒ©áƒ•áƒ˜áƒšáƒ˜áƒ¡ áƒ—áƒ˜áƒ áƒ™áƒ›áƒ”áƒšáƒ”áƒ‘áƒ¡ áƒáƒ›áƒ«áƒ˜áƒ›áƒ”áƒ‘áƒ¡). <em>áƒ¡áƒáƒ›áƒ–áƒáƒ áƒ”áƒ£áƒšáƒáƒ¨áƒ˜, áƒ¤áƒáƒ¤áƒáƒ¨áƒ˜</em> â€” áƒ›áƒªáƒ˜áƒ áƒ” áƒ áƒáƒáƒ“áƒ”áƒœáƒáƒ‘áƒ <strong>áƒœáƒ”áƒ‘áƒáƒ“áƒáƒ áƒ—áƒ£áƒšáƒ˜áƒ 6 áƒ—áƒ•áƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’</strong>.</p>

<h2>5. áƒ›áƒ—áƒšáƒ˜áƒáƒœáƒ˜ áƒ™áƒáƒ™áƒáƒšáƒ˜</h2>

<p><strong>áƒ“áƒáƒ®áƒ áƒ©áƒáƒ‘áƒ˜áƒ¡ áƒ áƒ˜áƒ¡áƒ™áƒ˜</strong>. 1 áƒ¬áƒšáƒáƒ›áƒ“áƒ” â€” áƒ™áƒáƒ™áƒáƒšáƒ˜ áƒ›áƒ®áƒáƒšáƒáƒ“ <strong>áƒžáƒáƒ¡áƒ¢áƒ˜áƒ¡ áƒ¡áƒáƒ®áƒ˜áƒ—</strong> (áƒáƒ áƒáƒ¥áƒ˜áƒ¡áƒ˜áƒ¡ áƒžáƒáƒ¡áƒ¢áƒ, áƒœáƒ£áƒ¨áƒ˜áƒ¡ áƒžáƒáƒ¡áƒ¢áƒ) áƒ›áƒªáƒ˜áƒ áƒ” áƒ áƒáƒáƒ“áƒ”áƒœáƒáƒ‘áƒ˜áƒ—, áƒ¬áƒ§áƒšáƒ˜áƒ— áƒ’áƒáƒœáƒ–áƒáƒ•áƒ”áƒ‘áƒ£áƒšáƒ˜. <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">áƒ“áƒáƒ®áƒ áƒ©áƒáƒ‘áƒ˜áƒ¡ áƒžáƒ áƒ”áƒ•áƒ”áƒœáƒªáƒ˜áƒ˜áƒ¡ áƒ¨áƒ”áƒ¡áƒáƒ®áƒ”áƒ‘</a> áƒ›áƒ”áƒ¢áƒ˜ áƒ˜áƒœáƒ¤áƒáƒ áƒ›áƒáƒªáƒ˜áƒ.</p>

<h2>6. áƒ–áƒ¦áƒ•áƒ˜áƒ¡ áƒžáƒ áƒáƒ“áƒ£áƒ¥áƒ¢áƒ”áƒ‘áƒ˜ áƒ›áƒáƒ¦áƒáƒšáƒ˜ áƒ•áƒ”áƒ áƒªáƒ®áƒšáƒ˜áƒ¡áƒ¬áƒ§áƒšáƒ˜áƒ—</h2>

<p><strong>áƒ–áƒ•áƒ˜áƒ’áƒ”áƒœáƒ˜, áƒ›áƒáƒ®áƒ•áƒ˜áƒšáƒ—áƒ”áƒ•áƒ–áƒ˜, áƒ¡áƒ™áƒ£áƒ›áƒ‘áƒ áƒ˜áƒ</strong> â€” áƒ”áƒ¡ áƒ¡áƒáƒ®áƒ”áƒáƒ‘áƒ”áƒ‘áƒ˜ áƒáƒ› áƒáƒ¡áƒáƒ™áƒáƒ›áƒ“áƒ” áƒáƒ áƒáƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒ”áƒ‘áƒ£áƒšáƒ˜áƒ. <strong>áƒšáƒáƒ¡áƒáƒ¡áƒ˜, áƒ¢áƒ£áƒœáƒ (áƒ™áƒ•áƒ˜áƒ áƒáƒ¨áƒ˜ áƒ”áƒ áƒ—áƒ®áƒ”áƒš), áƒ¢áƒ˜áƒšáƒáƒžáƒ˜áƒ</strong> â€” áƒœáƒáƒ áƒ›áƒáƒšáƒ£áƒ áƒ˜áƒ.</p>

<h2>7. áƒáƒšáƒ”áƒ áƒ’áƒ”áƒœáƒ£áƒ áƒ˜ áƒ¡áƒáƒ™áƒ•áƒ”áƒ‘áƒ˜ â€” áƒáƒ®áƒšáƒ áƒáƒ“áƒ áƒ”áƒ£áƒšáƒ˜ áƒ’áƒáƒªáƒœáƒáƒ‘áƒ áƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒ”áƒ‘áƒ£áƒšáƒ˜áƒ!</h2>

<p><a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1414850" target="_blank" rel="noopener noreferrer">LEAP áƒ™áƒ•áƒšáƒ”áƒ•áƒáƒ›</a> (2015) áƒ“áƒáƒáƒ“áƒáƒ¡áƒ¢áƒ£áƒ áƒ: <strong>áƒáƒ“áƒ áƒ”áƒ£áƒšáƒ›áƒ áƒ’áƒáƒªáƒœáƒáƒ‘áƒáƒ› (4â€“6 áƒ—áƒ•áƒ˜áƒ“áƒáƒœ) áƒ¨áƒ”áƒ˜áƒ«áƒšáƒ”áƒ‘áƒ áƒ¨áƒ”áƒáƒ›áƒªáƒ˜áƒ áƒáƒ¡ áƒáƒšáƒ”áƒ áƒ’áƒ˜áƒ</strong>. áƒ›áƒáƒ’áƒ áƒáƒ› <strong>áƒáƒšáƒ”áƒ áƒ’áƒ˜áƒ£áƒšáƒ˜ áƒáƒ¯áƒáƒ®áƒ˜áƒ¡ áƒ˜áƒ¡áƒ¢áƒáƒ áƒ˜áƒ˜áƒ¡</strong> áƒ“áƒ áƒáƒ¡ â€” <em>áƒ”áƒ¥áƒ˜áƒ›áƒ˜áƒ¡ áƒ™áƒáƒœáƒ¡áƒ£áƒšáƒ¢áƒáƒªáƒ˜áƒ áƒ•áƒáƒšáƒ“áƒ”áƒ‘áƒ£áƒšáƒ˜áƒ</em>.</p>

<h2>8. áƒáƒ®áƒáƒšáƒ˜ áƒ®áƒáƒ®áƒ•áƒ˜ áƒ“áƒ áƒœáƒ˜áƒáƒ áƒ˜</h2>

<p>áƒ¡áƒ”áƒ áƒ˜áƒáƒ–áƒ£áƒš áƒ¡áƒáƒ¤áƒ áƒ—áƒ®áƒ”áƒ¡ áƒáƒ  áƒ¬áƒáƒ áƒ›áƒáƒáƒ“áƒ’áƒ”áƒœáƒ¡, áƒ›áƒáƒ’áƒ áƒáƒ› áƒáƒ› áƒáƒ¡áƒáƒ™áƒ˜áƒ¡ áƒ™áƒ£áƒ­áƒ¡ <strong>áƒ£áƒ­áƒ˜áƒ áƒ¡ áƒ’áƒáƒ“áƒáƒ›áƒ£áƒ¨áƒáƒ•áƒ”áƒ‘áƒ</strong>. 8â€“9 áƒ—áƒ•áƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’ â€” áƒ›áƒªáƒ˜áƒ áƒ” áƒ áƒáƒáƒ“áƒ”áƒœáƒáƒ‘áƒ <strong>áƒ¨áƒ”áƒ›áƒ¬áƒ•áƒáƒ  áƒ¡áƒáƒ®áƒ˜áƒ—</strong>.</p>

<h2>9. áƒªáƒ˜áƒ¢áƒ áƒ£áƒ¡áƒ˜ (6â€“8 áƒ—áƒ•áƒ”áƒ›áƒ“áƒ”)</h2>

<p><strong>áƒ›áƒŸáƒáƒ•áƒ˜áƒáƒœáƒáƒ‘áƒ</strong> áƒ®áƒ¨áƒ˜áƒ áƒáƒ“ áƒ˜áƒ¬áƒ•áƒ”áƒ•áƒ¡ áƒ™áƒáƒœáƒ˜áƒ¡ áƒ’áƒáƒ›áƒáƒœáƒáƒ§áƒáƒ áƒ¡ áƒ¢áƒ£áƒ©áƒ”áƒ‘áƒ¡áƒ áƒ“áƒ áƒœáƒ˜áƒ™áƒáƒžáƒ–áƒ”. 6â€“8 áƒ—áƒ•áƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’ â€” <strong>áƒœáƒ”áƒš-áƒœáƒ”áƒšáƒ áƒ¨áƒ”áƒ˜áƒ§áƒ•áƒáƒœáƒ”áƒ—</strong>.</p>

<h2>10. áƒ¡áƒáƒ¡áƒ›áƒ”áƒšáƒ˜ áƒ¬áƒ•áƒ”áƒœáƒ”áƒ‘áƒ˜</h2>

<p>1 áƒ¬áƒšáƒáƒ›áƒ“áƒ” â€” <strong>áƒ™áƒáƒ›áƒšáƒ˜áƒ¡ áƒ¬áƒ•áƒ”áƒœáƒ˜ 120 áƒ›áƒš-áƒ–áƒ” áƒ›áƒ”áƒ¢áƒ˜</strong>, áƒ®áƒ˜áƒšáƒ˜áƒ¡ áƒœáƒ”áƒ‘áƒ˜áƒ¡áƒ›áƒ˜áƒ”áƒ áƒ˜ áƒ¢áƒ˜áƒžáƒ˜áƒ¡ áƒ¬áƒ•áƒ”áƒœáƒ˜ â€” áƒáƒ áƒáƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒ”áƒ‘áƒ£áƒšáƒ˜áƒ. áƒ›áƒ˜áƒ–áƒ”áƒ–áƒ˜: <strong>áƒ‘áƒ”áƒ•áƒ áƒ˜ áƒ¨áƒáƒ¥áƒáƒ áƒ˜, áƒœáƒáƒ™áƒšáƒ”áƒ‘áƒ˜ áƒ‘áƒáƒ­áƒ™áƒ</strong> â€” áƒ•áƒ˜áƒ“áƒ áƒ” áƒ›áƒ—áƒšáƒ˜áƒáƒœáƒ˜ áƒ®áƒ˜áƒšáƒ˜. <a href="https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Fruit-Juice-and-Your-Childs-Diet.aspx" target="_blank" rel="noopener noreferrer">AAP-áƒ˜áƒ¡ 2017 áƒ¬áƒšáƒ˜áƒ¡ áƒ’áƒáƒœáƒáƒ®áƒšáƒ”áƒ‘áƒ£áƒšáƒ˜ áƒ áƒ”áƒ™áƒáƒ›áƒ”áƒœáƒ“áƒáƒªáƒ˜áƒ”áƒ‘áƒ˜</a> áƒáƒ›áƒáƒ¡ áƒáƒ“áƒáƒ¡áƒ¢áƒ£áƒ áƒ”áƒ‘áƒ¡.</p>`,

    contentEn: `<p>Until age 1, a baby's digestive system is not fully developed enough to process certain foods and substances. Based on <a href="https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" target="_blank" rel="noopener noreferrer">WHO</a> and <a href="https://www.healthychildren.org/" target="_blank" rel="noopener noreferrer">American Academy of Pediatrics</a> guidelines â€” here are <strong>10 foods to strictly avoid in the first year</strong>.</p>

<h2>1. Honey â€” Most Critical!</h2>

<p>Honey may contain <em>Clostridium botulinum</em> spores causing <strong>infant botulism</strong>. <strong>Absolutely no honey before age 1</strong> in any form â€” raw, heated, or baked into foods.</p>

<h2>2. Salt</h2>

<p>Infant kidneys <strong>cannot process large amounts of sodium</strong>. Daily limit: under <strong>1g</strong> for 6â€“12 month olds. Watch out: rice crackers, bread, and cheese often contain significant hidden salt.</p>

<h2>3. Sugar and Sweets</h2>

<p>Early sugar exposure <strong>creates a preference for sweet tastes</strong> and promotes tooth decay from first teeth. <strong>Natural sugar in whole fruit</strong> is fine. <strong>Added sugar</strong> is not.</p>

<h2>4. Whole Cow's Milk as Main Drink</h2>

<p>Not recommended as primary drink before 1 year â€” <strong>too high in protein and sodium</strong> for infant kidneys. <em>Small amounts in porridge or cooking</em> are <strong>fine after 6 months</strong>.</p>

<h2>5. Whole Nuts</h2>

<p><strong>Choking hazard</strong>. Before 1 year, nuts only as <strong>paste</strong> (peanut butter, almond butter) in small amounts, thinned with water. More info on <a href="/blog/dakhrchovis-prevencia-bavshvebistvic">choking prevention here</a>.</p>

<h2>6. High-Mercury Seafood</h2>

<p><strong>Shark, swordfish, king mackerel</strong> â€” not recommended at this age. <strong>Salmon, canned tuna (once weekly), tilapia</strong> are all fine.</p>

<h2>7. Allergens â€” Early Introduction Now Recommended!</h2>

<p>The <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1414850" target="_blank" rel="noopener noreferrer">LEAP study</a> (2015) showed: <strong>early introduction (4â€“6 months) may REDUCE allergy risk</strong>. However, with <strong>family history of allergies</strong>, <em>doctor consultation is mandatory</em>.</p>

<h2>8. Raw Onion and Garlic</h2>

<p>Not seriously dangerous but <strong>hard on infant digestion</strong>. Small amounts <strong>cooked</strong> are fine after 8â€“9 months.</p>

<h2>9. Citrus Fruits (before 6â€“8 months)</h2>

<p><strong>Acidity</strong> often causes skin rash around lips and chin. <strong>Introduce gradually</strong> after 6â€“8 months.</p>

<h2>10. Fruit Juices</h2>

<p>Under 1 year, <strong>no juice exceeding 120ml</strong> â€” ideally none at all. Reason: <strong>high sugar, low fiber</strong> compared to whole fruit. The <a href="https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Fruit-Juice-and-Your-Childs-Diet.aspx" target="_blank" rel="noopener noreferrer">AAP's updated 2017 guidelines</a> confirmed this recommendation.</p>`,
  },

  {
    slug: 'jasnsakeli-snekebi-mcire-bavshvistvis',
    contentKa: `<p>áƒ¡áƒœáƒ”áƒ¥áƒ˜ 1â€“3 áƒ¬áƒšáƒ˜áƒ¡ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡ <strong>áƒ’áƒáƒœáƒ£áƒ§áƒáƒ¤áƒ”áƒšáƒ˜ áƒœáƒáƒ¬áƒ˜áƒšáƒ˜áƒ</strong> â€” áƒ›áƒáƒ—áƒ˜ áƒ›áƒªáƒ˜áƒ áƒ” áƒ™áƒ£áƒ­áƒ˜ áƒ•áƒ”áƒ  áƒ˜áƒœáƒáƒ®áƒáƒ•áƒ¡ áƒ¡áƒáƒ™áƒ›áƒáƒ áƒ˜áƒ¡ áƒ”áƒœáƒ”áƒ áƒ’áƒ˜áƒáƒ¡ áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“ áƒ™áƒ•áƒ”áƒ‘áƒ”áƒ‘áƒ¡ áƒ¨áƒáƒ áƒ˜áƒ¡. áƒ¡áƒ¬áƒáƒ áƒ˜ áƒ¡áƒœáƒ”áƒ¥áƒ˜ áƒ™áƒ˜ áƒáƒ›áƒáƒ•áƒ“áƒ áƒáƒ£áƒšáƒáƒ“ <strong>áƒ•áƒ˜áƒ¢áƒáƒ›áƒ˜áƒœáƒ”áƒ‘áƒ˜áƒ¡, áƒ›áƒ˜áƒœáƒ”áƒ áƒáƒšáƒ”áƒ‘áƒ˜áƒ¡áƒ áƒ“áƒ áƒ‘áƒáƒ­áƒ™áƒáƒ¡</strong> áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜ áƒ¬áƒ§áƒáƒ áƒáƒ.</p>

<h2>áƒ áƒáƒ¢áƒáƒ› áƒáƒ áƒ˜áƒ¡ áƒ¡áƒœáƒ”áƒ¥áƒ˜ áƒáƒ¡áƒ” áƒ›áƒœáƒ˜áƒ¨áƒ•áƒœáƒ”áƒšáƒáƒ•áƒáƒœáƒ˜?</h2>

<ul>
  <li>1â€“3 áƒ¬áƒšáƒ˜áƒ¡ áƒ‘áƒáƒ•áƒ¨áƒ•áƒ¡ áƒ¡áƒ­áƒ˜áƒ áƒ“áƒ”áƒ‘áƒ <strong>1000â€“1400 kcal</strong> áƒ“áƒ¦áƒ”áƒ¨áƒ˜</li>
  <li>3 áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“áƒ˜ áƒ™áƒ•áƒ”áƒ‘áƒ áƒ®áƒ¨áƒ˜áƒ áƒáƒ“ <strong>áƒáƒ  áƒ¤áƒáƒ áƒáƒ•áƒ¡</strong> áƒáƒ› áƒ¡áƒáƒ­áƒ˜áƒ áƒáƒ”áƒ‘áƒáƒ¡</li>
  <li><strong>2 áƒ¯áƒáƒœáƒ¡áƒáƒ¦áƒ˜ áƒ¡áƒœáƒ”áƒ¥áƒ˜</strong> áƒ“áƒ¦áƒ”áƒ¨áƒ˜ â€” áƒáƒžáƒ¢áƒ˜áƒ›áƒáƒšáƒ£áƒ áƒ˜ áƒ¡áƒ¥áƒ”áƒ›áƒ</li>
  <li>áƒ¡áƒœáƒ”áƒ¥áƒ˜ áƒ™áƒ•áƒ”áƒ‘áƒáƒ›áƒ“áƒ” <strong>áƒ›áƒ˜áƒœáƒ˜áƒ›áƒ£áƒ› 1 áƒ¡áƒáƒáƒ—áƒ˜áƒ— áƒáƒ“áƒ áƒ”</strong> â€” áƒ‘áƒáƒ•áƒ¨áƒ•áƒ˜ áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“áƒ˜ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ¡áƒ—áƒ•áƒ˜áƒ¡ áƒ›áƒ¨áƒ˜áƒ”áƒ áƒ˜ áƒ“áƒáƒ áƒ©áƒ”áƒ‘áƒ</li>
</ul>

<h2>áƒ®áƒ˜áƒšáƒ˜ áƒ“áƒ áƒ‘áƒáƒ¡áƒ¢áƒœáƒ”áƒ£áƒšáƒ˜ â€” áƒ¡áƒáƒ£áƒ™áƒ”áƒ—áƒ”áƒ¡áƒ áƒáƒ áƒ©áƒ”áƒ•áƒáƒœáƒ˜</h2>

<ul>
  <li><strong>áƒ‘áƒáƒœáƒáƒœáƒ˜</strong> â€” áƒ”áƒœáƒ”áƒ áƒ’áƒ˜áƒ˜áƒ¡ áƒ¡áƒ¬áƒ áƒáƒ¤áƒ˜ áƒ¬áƒ§áƒáƒ áƒ, <a href="/blog/rkinit-mdidari-sakvebi-chvilebistvis">áƒ™áƒáƒšáƒ˜áƒ£áƒ›áƒ˜</a></li>
  <li><strong>áƒáƒ•áƒáƒ™áƒáƒ“áƒ</strong> (áƒœáƒáƒ®áƒ”áƒ•áƒáƒ áƒ˜) â€” áƒ¯áƒáƒœáƒ¡áƒáƒ¦áƒ˜ áƒªáƒ®áƒ˜áƒ›áƒ˜, áƒ‘áƒáƒ­áƒ™áƒ</li>
  <li><strong>áƒ§áƒ•áƒ˜áƒ—áƒ”áƒšáƒ˜, áƒ¬áƒ˜áƒ—áƒ”áƒšáƒ˜ áƒ‘áƒ£áƒšáƒ’áƒáƒ áƒ£áƒšáƒ˜ áƒ¬áƒ˜áƒ¬áƒáƒ™áƒ</strong> â€” C áƒ•áƒ˜áƒ¢áƒáƒ›áƒ˜áƒœáƒ˜, áƒ¢áƒ™áƒ‘áƒ˜áƒšáƒ˜ áƒ’áƒ”áƒ›áƒ</li>
  <li><strong>áƒ‘áƒšáƒ£áƒ‘áƒ”áƒ áƒ˜</strong> â€” áƒáƒœáƒ¢áƒ˜áƒáƒ¥áƒ¡áƒ˜áƒ“áƒáƒœáƒ¢áƒ”áƒ‘áƒ˜, áƒáƒ“áƒ•áƒ˜áƒšáƒ˜ áƒ®áƒ”áƒšáƒ¨áƒ˜ áƒ­áƒ”áƒ áƒ</li>
  <li><strong>áƒ¡áƒ¢áƒáƒ¤áƒ˜áƒšáƒ</strong> â€” áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ£áƒšáƒ˜ áƒáƒœ áƒ’áƒáƒ®áƒ”áƒ®áƒ˜áƒšáƒ˜, áƒ‘áƒáƒ­áƒ™áƒ</li>
</ul>

<h2>áƒ áƒ«áƒ˜áƒ¡ áƒžáƒ áƒáƒ“áƒ£áƒ¥áƒ¢áƒ”áƒ‘áƒ˜ â€” áƒ™áƒáƒšáƒªáƒ˜áƒ£áƒ›áƒ˜ áƒ“áƒ áƒªáƒ˜áƒšáƒ</h2>

<ul>
  <li><strong>áƒ‘áƒ£áƒœáƒ”áƒ‘áƒ áƒ˜áƒ•áƒ˜ áƒ˜áƒáƒ’áƒ£áƒ áƒ¢áƒ˜</strong> (áƒ¨áƒáƒ¥áƒ áƒ˜áƒ¡ áƒ’áƒáƒ áƒ”áƒ¨áƒ”) + áƒáƒ®áƒáƒšáƒ˜ áƒ®áƒ˜áƒšáƒ˜</li>
  <li><strong>áƒ§áƒ•áƒ”áƒšáƒ˜ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“</strong> (áƒ¡áƒ£áƒšáƒ£áƒ’áƒ£áƒœáƒ˜, áƒ‘áƒ áƒ˜áƒœáƒ–áƒ â€” áƒ›áƒáƒ áƒ˜áƒšáƒ˜ áƒ£áƒœáƒ“áƒ áƒ•áƒáƒ™áƒáƒœáƒ¢áƒ áƒáƒšáƒáƒ—)</li>
  <li><strong>áƒ™áƒáƒ¢áƒ”áƒ¯ áƒ©áƒ˜áƒ–áƒ˜</strong> áƒ‘áƒáƒ¡áƒ¢áƒœáƒ”áƒ£áƒšáƒ˜áƒ¡ áƒ’áƒ•áƒ”áƒ áƒ“áƒ˜áƒ—</li>
</ul>

<h2>áƒ›áƒáƒ áƒªáƒ•áƒšáƒ”áƒ£áƒšáƒ˜ â€” áƒœáƒ”áƒšáƒ˜ áƒ”áƒœáƒ”áƒ áƒ’áƒ˜áƒ</h2>

<ul>
  <li><strong>áƒ¨áƒ•áƒ áƒ˜áƒ˜áƒ¡ áƒ‘áƒ˜áƒ¡áƒ™áƒ•áƒ˜áƒ¢áƒ˜</strong> â€” áƒ¨áƒáƒ¥áƒ áƒ˜áƒ¡ áƒ’áƒáƒ áƒ”áƒ¨áƒ”, áƒ¡áƒáƒ®áƒšáƒ¨áƒ˜ áƒ’áƒáƒ›áƒáƒ›áƒªáƒ®áƒ•áƒáƒ áƒ˜</li>
  <li><strong>áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜áƒ¡ áƒ‘áƒšáƒ˜áƒœáƒ˜</strong> áƒáƒ•áƒáƒ™áƒáƒ“áƒáƒ—áƒ˜</li>
  <li><strong>áƒ®áƒáƒ áƒ‘áƒšáƒ˜áƒ¡ áƒ¢áƒáƒ¡áƒ¢áƒ˜</strong> áƒáƒ áƒáƒ¥áƒ˜áƒ¡áƒ˜áƒ¡ áƒžáƒáƒ¡áƒ¢áƒ˜áƒ— (1 áƒ¬áƒšáƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’)</li>
</ul>

<h2>áƒªáƒ˜áƒšáƒ â€” áƒ«áƒ˜áƒ áƒ˜áƒ—áƒáƒ“áƒ˜ áƒ¡áƒáƒ›áƒ¨áƒ”áƒœáƒ”áƒ‘áƒšáƒ áƒ›áƒáƒ¡áƒáƒšáƒ</h2>

<ul>
  <li><strong>áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ£áƒšáƒ˜ áƒ™áƒ•áƒ”áƒ áƒªáƒ®áƒ˜</strong> â€” áƒ›áƒ—áƒšáƒ˜áƒáƒœáƒ˜ áƒáƒœ áƒœáƒáƒ­áƒ áƒ”áƒ‘áƒáƒ“</li>
  <li><strong>áƒ¥áƒáƒ—áƒ›áƒ˜áƒ¡ áƒ™áƒ£áƒ‘áƒ˜áƒ™áƒ”áƒ‘áƒ˜</strong></li>
  <li><strong>áƒ°áƒ£áƒ›áƒ£áƒ¡áƒ˜</strong> áƒ‘áƒáƒ¡áƒ¢áƒœáƒ”áƒ£áƒšáƒ˜áƒ— â€” áƒœáƒ£áƒ¢áƒ˜, áƒšáƒ˜áƒ›áƒáƒœáƒ˜, áƒáƒšáƒ˜áƒ•áƒ˜áƒ¡ áƒ–áƒ”áƒ—áƒ˜</li>
  <li><strong>áƒáƒ¡áƒžáƒ˜áƒ¡ áƒ‘áƒšáƒ˜áƒœáƒ˜</strong></li>
</ul>

<h2>20 áƒ¡áƒœáƒ”áƒ¥-áƒ˜áƒ“áƒ”áƒ, áƒ áƒáƒ›áƒ”áƒšáƒ˜áƒª áƒ‘áƒáƒ•áƒ¨áƒ•áƒ”áƒ‘áƒ¡ áƒ£áƒ§áƒ•áƒáƒ áƒ—</h2>

<ol>
  <li>áƒ‘áƒáƒœáƒáƒœáƒ˜ + áƒáƒ áƒáƒ¥áƒ˜áƒ¡áƒ˜áƒ¡ áƒžáƒáƒ¡áƒ¢áƒ</li>
  <li>áƒ˜áƒáƒ’áƒ£áƒ áƒ¢áƒ˜ + áƒ‘áƒšáƒ£áƒ‘áƒ”áƒ áƒ˜</li>
  <li>áƒáƒ•áƒáƒ™áƒáƒ“áƒ + áƒ¢áƒáƒ¡áƒ¢áƒ˜</li>
  <li>áƒ¡áƒ¢áƒáƒ¤áƒ˜áƒšáƒ + áƒ°áƒ£áƒ›áƒ£áƒ¡áƒ˜</li>
  <li>áƒ§áƒ•áƒ”áƒšáƒ˜ + áƒ•áƒáƒ¨áƒšáƒ˜</li>
  <li>áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ£áƒšáƒ˜ áƒ™áƒ•áƒ”áƒ áƒªáƒ®áƒ˜ + áƒ¢áƒáƒ›áƒáƒ¢áƒ˜</li>
  <li>áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜áƒ¡ áƒ‘áƒšáƒ˜áƒœáƒ˜ + áƒ¥áƒáƒ—áƒáƒ›áƒ˜</li>
  <li>áƒ‘áƒáƒšáƒáƒ¥áƒ˜ + áƒ°áƒ£áƒ›áƒ£áƒ¡áƒ˜</li>
  <li>áƒ‘áƒ£áƒœáƒ”áƒ‘áƒ áƒ˜áƒ•áƒ˜ áƒ˜áƒáƒ’áƒ£áƒ áƒ¢áƒ˜ + áƒ›áƒáƒ áƒ¬áƒ§áƒ•áƒ˜</li>
  <li>áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ£áƒšáƒ˜ áƒ¡áƒ˜áƒ›áƒ˜áƒœáƒ“áƒ˜ (áƒšáƒ›áƒáƒ‘áƒ˜áƒ”áƒ áƒ˜)</li>
  <li>áƒ§áƒ•áƒ˜áƒ—áƒ”áƒšáƒ˜ áƒ¬áƒ˜áƒ¬áƒáƒ™áƒ + áƒ°áƒ£áƒ›áƒ£áƒ¡áƒ˜</li>
  <li>áƒ‘áƒ áƒ˜áƒœáƒ–áƒ + áƒ§áƒ£áƒ áƒ«áƒ”áƒœáƒ˜ (áƒ’áƒáƒ®áƒšáƒ”áƒ©áƒ˜áƒšáƒ˜ áƒ›áƒ”áƒáƒ—áƒ®áƒ”áƒ“áƒ”áƒ‘áƒáƒ“)</li>
  <li>áƒ‘áƒ áƒ˜áƒœáƒ¯áƒ˜áƒ¡ áƒ™áƒ áƒ”áƒ™áƒ”áƒ áƒ˜ + áƒáƒ•áƒáƒ™áƒáƒ“áƒ</li>
  <li>áƒ®áƒáƒ®áƒ•-áƒ¥áƒáƒ—áƒ›áƒ˜áƒ¡ áƒ‘áƒšáƒ˜áƒœáƒ˜</li>
  <li>áƒáƒ¢áƒáƒ›áƒ˜ + áƒ™áƒáƒ¢áƒ”áƒ¯ áƒ©áƒ˜áƒ–áƒ˜</li>
  <li>áƒ’áƒáƒ›áƒ§áƒ˜áƒœáƒ£áƒšáƒ˜ áƒ›áƒ¬áƒ•áƒáƒœáƒ” áƒ‘áƒáƒ áƒ“áƒ (áƒ’áƒáƒšáƒ¦áƒáƒ‘áƒ˜áƒšáƒ˜)</li>
  <li>áƒ‘áƒáƒœáƒáƒœáƒ˜ + áƒ¨áƒ•áƒ áƒ˜áƒ (áƒ‘áƒšáƒ˜áƒœáƒ˜)</li>
  <li>áƒœ.áƒžáƒáƒ›áƒ˜áƒ“áƒ•áƒ áƒ˜ áƒœáƒáƒ®áƒ”áƒ•áƒ áƒ”áƒ‘áƒáƒ“</li>
  <li>áƒ®áƒ˜áƒšáƒ˜áƒ¡ áƒ¡áƒáƒšáƒáƒ—áƒ˜</li>
  <li>áƒšáƒ›áƒáƒ‘áƒ˜áƒ”áƒ áƒ˜ áƒ›áƒáƒ®áƒáƒ áƒ¨áƒ£áƒšáƒ˜ áƒ™áƒáƒ áƒ¢áƒáƒ¤áƒ˜áƒšáƒ˜</li>
</ol>

<p><a href="/">mom menu-áƒ˜áƒ¡ áƒ’áƒ”áƒ’áƒ›áƒ</a> áƒ§áƒáƒ•áƒ”áƒšáƒ“áƒ¦áƒ” <strong>áƒáƒ•áƒ¢áƒáƒ›áƒáƒ¢áƒ£áƒ áƒáƒ“ áƒ˜áƒ áƒ©áƒ”áƒ•áƒ¡ áƒáƒ¡áƒáƒ™áƒ˜áƒ¡ áƒ¨áƒ”áƒ¡áƒáƒ‘áƒáƒ›áƒ˜áƒ¡ áƒ¡áƒœáƒ”áƒ¥áƒ¡</strong> â€” áƒ¡áƒ”áƒ–áƒáƒœáƒ˜áƒ¡, áƒ’áƒ”áƒ›áƒáƒ•áƒœáƒ”áƒ‘áƒ˜áƒ¡áƒ áƒ“áƒ áƒ™áƒ•áƒ”áƒ‘áƒ˜áƒ—áƒ˜ áƒ¡áƒáƒ­áƒ˜áƒ áƒáƒ”áƒ‘áƒ”áƒ‘áƒ˜áƒ¡ áƒ›áƒ˜áƒ®áƒ”áƒ“áƒ•áƒ˜áƒ—.</p>`,

    contentEn: `<p>Snacks are an <strong>essential part of nutrition</strong> for toddlers 1â€“3 years old â€” their small stomachs can't store enough energy between main meals. The right snack also provides important <strong>vitamins, minerals, and fiber</strong>.</p>

<h2>Why Snacks Matter</h2>

<ul>
  <li>Toddlers need <strong>1000â€“1400 kcal</strong> daily</li>
  <li>Three main meals often <strong>don't cover</strong> this requirement</li>
  <li><strong>Two healthy snacks</strong> per day is the optimal pattern</li>
  <li>Offer snacks at least <strong>1 hour before</strong> the next main meal so appetite isn't affected</li>
</ul>

<h2>Fruits and Vegetables â€” The Best Choice</h2>

<ul>
  <li><strong>Banana</strong> â€” quick energy, <a href="/blog/rkinit-mdidari-sakvebi-chvilebistvis">potassium</a></li>
  <li><strong>Avocado</strong> (half) â€” healthy fats, fiber</li>
  <li><strong>Yellow or red bell pepper strips</strong> â€” vitamin C, naturally sweet</li>
  <li><strong>Blueberries</strong> â€” antioxidants, easy for small hands</li>
  <li><strong>Carrot</strong> â€” grated or cooked, great fiber source</li>
</ul>

<h2>Dairy â€” Calcium and Protein</h2>

<ul>
  <li><strong>Plain yogurt</strong> (no added sugar) + fresh fruit</li>
  <li><strong>Cheese cubes</strong> â€” watch sodium content</li>
  <li><strong>Cottage cheese</strong> alongside vegetables</li>
</ul>

<h2>Grains â€” Slow-Release Energy</h2>

<ul>
  <li><strong>Oat biscuit</strong> â€” no sugar, homemade is best</li>
  <li><strong>Rice pancake</strong> with avocado</li>
  <li><strong>Wheat toast</strong> with peanut butter (after age 1)</li>
</ul>

<h2>Protein â€” Essential Building Blocks</h2>

<ul>
  <li><strong>Hard-boiled egg</strong> â€” whole or in pieces</li>
  <li><strong>Chicken cubes</strong></li>
  <li><strong>Hummus</strong> with vegetables â€” chickpeas, lemon, olive oil</li>
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

<p><a href="/">mom menu</a> automatically selects <strong>age-appropriate daily snacks</strong> based on season, taste preferences, and nutritional needs â€” every single day.</p>`,
  },
];

async function main() {
  console.log('ðŸ”„ Updating blog posts with rich HTML content...\n');

  for (const update of updates) {
    const existing = await prisma.blog.findUnique({ where: { slug: update.slug } });
    if (!existing) {
      console.log(`  âš ï¸  Not found: ${update.slug}`);
      continue;
    }
    await prisma.blog.update({
      where: { slug: update.slug },
      data: { contentKa: update.contentKa, contentEn: update.contentEn },
    });
    console.log(`  âœ…  Updated: ${existing.titleKa}`);
  }

  console.log('\nâœ… All blog posts updated with rich HTML!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

