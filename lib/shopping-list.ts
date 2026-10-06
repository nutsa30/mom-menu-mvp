// ── Ingredient aggregation ─────────────────────────────────────────────────
const GEO_NUMS: [string, number][] = [
  ['ნახევარი', 0.5], ['მეოთხედი', 0.25], ['ერთი', 1], ['ორი', 2],
  ['სამი', 3], ['ოთხი', 4], ['ხუთი', 5], ['ექვსი', 6], ['შვიდი', 7],
  ['რვა', 8], ['ცხრა', 9], ['ათი', 10],
];
const FRAC: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1/3, '⅔': 2/3 };

// Maps raw unit strings → canonical key
const UNIT_CANON: Record<string, string> = {
  g: 'გ', kg: 'კგ', ml: 'მლ', l: 'ლ', tsp: 'ჩკ', tbsp: 'სკ', cup: 'ჭ', cups: 'ჭ', pc: 'ც', pcs: 'ც', pieces: 'ც',
  gram: 'გ', grams: 'გ', milliliter: 'მლ', milliliters: 'მლ', teaspoon: 'ჩკ', teaspoons: 'ჩკ',
  tablespoon: 'სკ', tablespoons: 'სკ', pinch: 'მწიკვი', 'მწიკვი': 'მწიკვი',
  'ჩკ': 'ჩკ', 'სკ': 'სკ', slice: 'ნაჭ', slices: 'ნაჭ',
  'გ': 'გ', 'გრ': 'გ', 'გრამი': 'გ', 'გ.': 'გ',
  'კგ': 'კგ', 'კილოგრამი': 'კგ', 'კილო': 'კგ',
  'მლ': 'მლ', 'მილილიტრი': 'მლ',
  'ლ': 'ლ', 'ლიტრი': 'ლ',
  'ჭიქა': 'ჭ', 'ჭ': 'ჭ',
  'სუფ.კ': 'სკ', 'სუფ/კ': 'სკ', 'სტბ': 'სკ', 'ს/კ': 'სკ', 'ს.კ': 'სკ',
  'ჩ.კ': 'ჩკ', 'ჩ/კ': 'ჩკ', 'ჩ': 'ჩკ',
  'ცალი': 'ც', 'ც': 'ც', 'ც.': 'ც',
  'ნაჭერი': 'ნაჭ', 'ნაჭ': 'ნაჭ',
};
const UNIT_DISPLAY: Record<string, string> = {
  'გ': 'გ', 'კგ': 'კგ', 'მლ': 'მლ', 'ლ': 'ლ',
  'ჭ': 'ჭიქა', 'სკ': 'სუფ.კ', 'ჩკ': 'ჩ.კ', 'ც': 'ც', 'ნაჭ': 'ნაჭერი',
};

// Descriptive words that precede an ingredient name but aren't part of its identity
// e.g. "მწიფე ბანანი" (ripe banana) should still be grouped with plain "ბანანი".
// Prep-state words (boiled/lean/peeled) don't change what you'd buy at the store
// either, so they're stripped the same way for shopping-list purposes — the
// recipe's own ingredient display keeps them, only this aggregation drops them.
const PREPARATION_WORDS = new Set([
  'მწიფე', 'რბილი', 'მოხარშული', 'შემწვარი', 'გამომცხვარი', 'მოთუშული', 'მოშუშული',
  'შებრაწული', 'მობრაწული', 'დაორთქლილი', 'დაფქული',
  'ორთქლზე', 'კარგად', 'გაფცქვნილი', 'გასუფთავებული', 'დაჭრილი', 'დაქუცმაცებული',
  'გახეხილი', 'გატარებული', 'დაბლენდერებული', 'გაბლენდერებული',
  'დაბლენდებული', 'გაბლენდებული', 'გალღობილი', 'გარეცხილი', 'მშრალი', 'უმი',
  'boiled', 'cooked', 'fried', 'baked', 'roasted', 'steamed', 'grilled', 'sauteed',
  'sautéed', 'peeled', 'chopped', 'diced', 'sliced', 'grated', 'shredded', 'crushed',
  'mashed', 'pureed', 'puréed', 'blended', 'rinsed', 'washed', 'drained', 'thawed',
  'dry', 'raw', 'ripe', 'soft', 'finely', 'roughly', 'freshly', 'well', 'fully',
]);

// Ground flour is made from the whole grain you'd buy anyway — don't list it separately
const FLOUR_MERGE: Record<string, string> = {
  'შვრიის ფქვილი': 'შვრია',
  'წიწიბურას ფქვილი': 'წიწიბურა',
};

// Same ingredient named differently across recipes (different cut/spelling/case) —
// merge to one canonical shopping-list item
const SYNONYM_MERGE: Record<string, string> = {
  'eggs': 'egg', 'whole egg': 'egg', 'whole eggs': 'egg', 'კვერცხები': 'კვერცხი',
  'კვერცხის გული': 'კვერცხი', 'კვერცხის გულები': 'კვერცხი',
  'კვერცხის ცილა': 'კვერცხი', 'კვერცხის ცილები': 'კვერცხი',
  'egg yolk': 'egg', 'egg yolks': 'egg', 'egg white': 'egg', 'egg whites': 'egg',
  'ქათმის ფილე': 'ქათამი', 'ქათმის ხორცი': 'ქათამი', 'ქათმის უძვლო ხორცი': 'ქათამი',
  'ქათმის მკერდი': 'ქათამი', 'ქათმის მკერდის ფილე': 'ქათამი',
  'ქათმის მკერდის ხორცი': 'ქათამი', 'ქათმის ფილეები': 'ქათამი',
  'chicken fillet': 'chicken', 'chicken breast': 'chicken', 'chicken meat': 'chicken',
  'chicken fillets': 'chicken', 'chicken breasts': 'chicken', 'whole chicken': 'chicken',
  'boneless chicken': 'chicken', 'boneless chicken breast': 'chicken',
  'skinless chicken breast': 'chicken', 'boneless skinless chicken breast': 'chicken',
  'ინდაურის ფილე': 'ინდაური', 'ინდაურის ხორცი': 'ინდაური',
  'turkey fillet': 'turkey', 'turkey breast': 'turkey', 'turkey meat': 'turkey',
  'ორაგულის ფილე': 'ორაგული', 'salmon fillet': 'salmon', 'salmon fillets': 'salmon',
  'მჭლე საქონლის ხორცი': 'საქონლის ხორცი', 'საქონლის უცხიმო ფარში': 'საქონლის ხორცი',
  'საქონლის ფარში': 'საქონლის ხორცი', 'lean beef': 'beef', 'lean ground beef': 'beef',
  'ground beef': 'beef', 'minced beef': 'beef',
  'შვრიის ფანტელი': 'შვრია', 'შვრიის ფანტელები': 'შვრია', 'rolled oats': 'oats', 'oat flakes': 'oats',
  'oat flour': 'oats', 'buckwheat flour': 'buckwheat',
  'საბავშვო მაკარონი': 'მაკარონი', 'პატარა ზომის მაკარონი': 'მაკარონი',
  'baby pasta': 'pasta', 'small pasta': 'pasta',
  'ბუნებრივი იოგურტი': 'უშაქრო იოგურტი', 'ნატურალური უშაქრო იოგურტი': 'უშაქრო იოგურტი',
  'სრულცხიმიანი უშაქრო იოგურტი': 'უშაქრო იოგურტი',
  'natural yogurt': 'plain yogurt', 'plain unsweetened yogurt': 'plain yogurt',
  'full-fat plain yogurt': 'plain yogurt',
  'ნატურალური უშაქრო ბერძნული იოგურტი': 'ბერძნული იოგურტი',
  'plain unsweetened greek yogurt': 'greek yogurt',
  'სრულცხიმიანი რძე': 'რძე', 'whole milk': 'milk',
  'კარაქი': 'უმარილო კარაქი', 'butter': 'unsalted butter',
  'პასტერიზებული ყველი': 'ყველი', 'pasteurized cheese': 'cheese',
  '100% სეზამის ტაჰინი': 'სეზამის ტაჰინი', '100% sesame tahini': 'sesame tahini',
  'ტომატი': 'პომიდორი', 'ტომატები': 'პომიდორი', 'tomatoes': 'tomato',
  'პომიდორი მარილისა და შაქრის გარეშე': 'პომიდორი',
  'tomatoes with no added salt or sugar': 'tomato',
  'strawberries': 'strawberry', 'blueberries': 'blueberry',
  'apples': 'apple', 'pears': 'pear', 'bananas': 'banana', 'carrots': 'carrot',
  'potatoes': 'potato', 'sweet potatoes': 'sweet potato', 'peaches': 'peach',
  'მთლიანი მარცვლის ტოსტი': 'მთლიანი მარცვლის პური',
  'whole grain toast': 'whole grain bread', 'whole-grain bread': 'whole grain bread',
  'ტოსტის პური': 'პური', 'toast bread': 'bread',
  'პომიდვრი': 'პომიდორი',
  'ლაზანიას ფირფიტები': 'ლაზანიის ფირფიტები',
};

function fmtNum(n: number): string {
  if (Number.isInteger(n)) return `${n}`;
  const whole = Math.floor(n);
  const frac = n - whole;
  if (![0.5, 0.25, 0.75].includes(frac)) return `${Number(n.toFixed(2))}`;
  const fracStr = frac === 0.5 ? '½' : frac === 0.25 ? '¼' : '¾';
  return whole > 0 ? `${whole}${fracStr}` : fracStr;
}

function parseNum(token: string): number {
  if (FRAC[token] !== undefined) return FRAC[token];
  const mixed = token.match(/^(\d+)([½¼¾⅓⅔])$/);
  if (mixed) return Number(mixed[1]) + FRAC[mixed[2]];
  if (token.includes('/')) {
    const [n, d] = token.split('/').map((t) => parseFloat(t));
    return d ? n / d : (n || 0);
  }
  return parseFloat(token) || 0;
}

const NUM_TOKEN = '[\\d.\\/½¼¾⅓⅔]+';

export function normalizeName(name: string): string {
  // Token boundaries work for Georgian as well as English (JS \b does not).
  let n = name.normalize('NFKC').toLowerCase().split(',')[0]
    .replace(/\([^)]*\)/g, '').replace(/[–—]/g, '-').trim();
  n = n.replace(/\s*-\s*(optional|as needed|as required|to taste|a small amount|სურვილისამებრ|საჭიროებისამებრ|საჭიროების მიხედვით|მცირე რაოდენობა)\.?$/, '')
    .replace(/\b(?:well-cooked|stir-fried|pan-fried|oven-baked)\b/g, '');
  n = n.replace(/[-:;\.\s]+$/, '').split(/\s+/)
    .filter(word => !PREPARATION_WORDS.has(word)).join(' ').trim();
  // "წყალი ან რძე" (water or milk) — water is free, list the actual thing to buy
  if (n.startsWith('წყალი ან ')) n = n.slice('წყალი ან '.length).trim();
  if (n.startsWith('water or ')) n = n.slice('water or '.length).trim();
  if (FLOUR_MERGE[n]) n = FLOUR_MERGE[n];
  if (SYNONYM_MERGE[n]) n = SYNONYM_MERGE[n];
  return n;
}

// A prepared dish is not a separate grocery product. Expand recognized oat/fruit
// combinations into their shopping ingredients, without assigning the whole
// dish's weight to either ingredient or inventing a split between them.
function expandPreparedCombination(raw: string): string[] {
  const name = normalizeName(raw.replace(/\s*[-–—:]\s*[\d½¼¾⅓⅔].*$/, ''));
  const combinations: Record<string, string[]> = {
    'შვრია ბანანით': ['შვრია', 'ბანანი'],
    'შვრია ბანაით': ['შვრია', 'ბანანი'],
    'შვრიის ფაფა ბანანით': ['შვრია', 'ბანანი'],
    'შვრია ვაშლით': ['შვრია', 'ვაშლი'],
    'შვრიის ფაფა ვაშლით': ['შვრია', 'ვაშლი'],
    'შვრია მსხლით': ['შვრია', 'მსხალი'],
    'შვრიის ფაფა': ['შვრია'],
    'oats with banana': ['oats', 'banana'],
    'oatmeal with banana': ['oats', 'banana'],
    'oat porridge with banana': ['oats', 'banana'],
    'oats with apple': ['oats', 'apple'],
    'oatmeal with apple': ['oats', 'apple'],
    'oats with pear': ['oats', 'pear'],
    'oat porridge': ['oats'],
    'oatmeal': ['oats'],
  };
  return combinations[name] ?? [raw];
}

// A generic label with a comma-separated list of the actual items in parens
// (e.g. "ბოსტნეული (ყაბაყი, სტაფილო) - 60 გ" / "vegetables (zucchini, carrot)")
// isn't itself something you can buy — expand it into the specific items instead.
// Guarded on "," specifically so this doesn't fire on the other parenthetical
// uses in this data: a weight clarification like "1 მწიფე (60 გ)" (no comma),
// or "/"-separated alternatives like "თესლები (სეზამი/ჩია/სელი)" (pick one,
// not "buy all three") — both fall through unchanged.
export function expandParenthetical(raw: string): string[] {
  const m = raw.match(/^(.+?)\s*\(([^)]+)\)\s*(?:-.*)?$/);
  if (!m) return [raw];
  const items = m[2].split(',').map((s) => s.trim()).filter(Boolean);
  if (items.length < 2) return [raw];
  return items; // bare — no per-item quantity to split, just need it on the list
}

// Data format is consistently "სახელი - რაოდენობა", e.g. "ბანანი - 1/2 ცალი",
// "ბროკოლი - 80-100 გ", "ბანანი - 1 მწიფე". Quantity comes AFTER the name, not before.
function parseIng(raw: string): { key: string; display: string; qty: number; unit: string } {
  // Strip parenthetical notes  e.g. "(სურვილისამებრ)"
  const s = raw.trim().replace(/\s*\([^)]*\)/g, '').trim();

  const separator = s.match(/\s*[-–—:]\s*(?=[\d½¼¾⅓⅔])/);
  const dashIdx = separator?.index ?? -1;
  let rawNamePart: string;
  let amountPart: string;
  if (dashIdx !== -1) {
    rawNamePart = s.slice(0, dashIdx);
    amountPart = s.slice(dashIdx + (separator?.[0].length ?? 3)).trim();
  } else {
    // No " - " separator — some recipes write the quantity without it
    // ("ბანანი 89 გ", "ბანანი: 118 გრამი"). Split at the first digit instead of
    // treating the whole string as the name, so these still merge with the same
    // ingredient written the usual way ("ბანანი - 89 გ") instead of showing up as
    // a separate "different" item on the shopping list.
    // A percentage such as "100% sesame tahini" belongs to the product name.
    const digitIdx = s.search(/(?<!\S)[\d½¼¾⅓⅔]+(?![\d.]|%)/);
    if (digitIdx === -1) {
      rawNamePart = s;
      amountPart = '';
    } else {
      rawNamePart = s.slice(0, digitIdx).replace(/[-:–—\s]+$/, '');
      amountPart = s.slice(digitIdx).trim();
    }
  }
  const namePart = normalizeName(rawNamePart);
  amountPart = amountPart.replace(/ჩაის\s+კოვზი/g, 'ჩკ').replace(/სუფრის\s+კოვზი/g, 'სკ');

  const key = namePart.toLowerCase();
  const display = /^[a-z]/.test(namePart) ? namePart[0].toUpperCase() + namePart.slice(1) : namePart;

  if (!amountPart) return { key, display, qty: 0, unit: '' };

  const rangeRe = new RegExp(`^(${NUM_TOKEN})\\s*[-–—]\\s*(${NUM_TOKEN})\\s*(\\S*)(?:\\s+.*)?$`);
  const singleRe = new RegExp(`^(${NUM_TOKEN})\\s*(\\S*)(?:\\s+.*)?$`);

  let m = amountPart.match(rangeRe);
  if (m) {
    const qty = (parseNum(m[1]) + parseNum(m[2])) / 2;
    const unitTok = m[3].toLowerCase().replace(/\.+$/, '');
    const unit = unitTok ? (UNIT_CANON[unitTok] ?? 'ც') : 'ც';
    return { key, display, qty, unit };
  }

  m = amountPart.match(singleRe);
  if (m) {
    const qty = parseNum(m[1]);
    const unitTok = m[2].toLowerCase().replace(/\.+$/, '');
    const unit = unitTok ? (UNIT_CANON[unitTok] ?? 'ც') : 'ც';
    return { key, display, qty, unit };
  }

  if (amountPart.toLowerCase().startsWith('ნახევარი')) return { key, display, qty: 0.5, unit: 'ც' };

  // Try Georgian number words at start (legacy free-text ingredients)
  const lc = amountPart.toLowerCase();
  for (const [word, val] of GEO_NUMS) {
    if (lc === word || lc.startsWith(word + ' ')) return { key, display, qty: val, unit: 'ც' };
  }

  // No parseable quantity (e.g. "საჭიროებისამებრ" / "სურვილისამებრ")
  return { key, display, qty: 0, unit: '' };
}

interface IngredientItem {
  display: string;  // ingredient name
  amount: string;   // e.g. "3 ც", "150 გ", "×3", ""
}

export function aggregateIngredients(
  all: string[],
  seasonalFruits: Map<string, Set<string>>,
  currentSeason: string,
): IngredientItem[] {
  const groups = new Map<string, { display: string; sums: Map<string, number>; bare: number }>();

  for (const raw of all.flatMap(expandPreparedCombination)) {
    const p = parseIng(raw);
    if (!p.key || ['წყალი', 'water', 'ძალიან მცირე რაოდენობით', 'a very small amount'].includes(p.key)) continue;
    // Only known fruits get season-gated — vegetables and everything else always show
    const fruitSeasons = seasonalFruits.get(p.key);
    if (fruitSeasons && !fruitSeasons.has(currentSeason)) continue;
    if (!groups.has(p.key)) groups.set(p.key, { display: p.display, sums: new Map(), bare: 0 });
    const g = groups.get(p.key)!;
    if (p.qty > 0) {
      // Combine compatible metric units, never convert volume into weight.
      const unit = p.unit === 'კგ' ? 'გ' : p.unit === 'ლ' ? 'მლ' : p.unit;
      const qty = p.unit === 'კგ' || p.unit === 'ლ' ? p.qty * 1000 : p.qty;
      g.sums.set(unit, (g.sums.get(unit) || 0) + qty);
    } else {
      g.bare++;
    }
  }

  const result: IngredientItem[] = [];
  Array.from(groups.values()).forEach((g) => {
    if (g.sums.size === 0) {
      result.push({ display: g.display, amount: '' });
    } else {
      const parts: string[] = Array.from(g.sums.entries()).map(([unitKey, total]) => {
        const n = fmtNum(total);
        const u = unitKey ? (UNIT_DISPLAY[unitKey] || unitKey) : 'ც';
        return `${n} ${u}`;
      });
      result.push({ display: g.display, amount: parts.join(' + ') });
    }
  });

  return result.sort((a, b) => a.display.localeCompare(b.display, 'ka'));
}
