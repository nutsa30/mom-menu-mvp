import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSuitableAgeGroups } from '@/lib/meal';

const MEAL_TYPES = ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'] as const;

// ── Ingredient aggregation ─────────────────────────────────────────────────
const GEO_NUMS: [string, number][] = [
  ['ნახევარი', 0.5], ['მეოთხედი', 0.25], ['ერთი', 1], ['ორი', 2],
  ['სამი', 3], ['ოთხი', 4], ['ხუთი', 5], ['ექვსი', 6], ['შვიდი', 7],
  ['რვა', 8], ['ცხრა', 9], ['ათი', 10],
];
const FRAC: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1/3, '⅔': 2/3 };

// Maps raw unit strings → canonical key
const UNIT_CANON: Record<string, string> = {
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
// e.g. "მწიფე ბანანი" (ripe banana) should still be grouped with plain "ბანანი"
const LEADING_DESCRIPTORS = ['მწიფე', 'რბილი'];

// Ground flour is made from the whole grain you'd buy anyway — don't list it separately
const FLOUR_MERGE: Record<string, string> = {
  'შვრიის ფქვილი': 'შვრია',
  'წიწიბურას ფქვილი': 'წიწიბურა',
};

function fmtNum(n: number): string {
  if (Number.isInteger(n)) return `${n}`;
  const whole = Math.floor(n);
  const frac = n - whole;
  const fracStr = frac === 0.5 ? '½' : frac === 0.25 ? '¼' : frac === 0.75 ? '¾' : frac.toFixed(1).slice(1);
  return whole > 0 ? `${whole}${fracStr}` : fracStr;
}

function parseNum(token: string): number {
  if (FRAC[token] !== undefined) return FRAC[token];
  if (token.includes('/')) {
    const [n, d] = token.split('/').map((t) => parseFloat(t));
    return d ? n / d : (n || 0);
  }
  return parseFloat(token) || 0;
}

const NUM_TOKEN = '[\\d.\\/½¼¾⅓⅔]+';

function normalizeName(name: string): string {
  // Drop trailing clarifications like "ვაშლი, გაფცქვნილი"
  let n = name.split(',')[0].trim();
  for (const d of LEADING_DESCRIPTORS) {
    if (n.startsWith(d + ' ')) { n = n.slice(d.length + 1).trim(); break; }
  }
  // "წყალი ან რძე" (water or milk) — water is free, list the actual thing to buy
  if (n.startsWith('წყალი ან ')) n = n.slice('წყალი ან '.length).trim();
  if (FLOUR_MERGE[n]) n = FLOUR_MERGE[n];
  return n;
}

// Data format is consistently "სახელი - რაოდენობა", e.g. "ბანანი - 1/2 ცალი",
// "ბროკოლი - 80-100 გ", "ბანანი - 1 მწიფე". Quantity comes AFTER the name, not before.
function parseIng(raw: string): { key: string; display: string; qty: number; unit: string } {
  // Strip parenthetical notes  e.g. "(სურვილისამებრ)"
  const s = raw.trim().replace(/\s*\([^)]*\)/g, '').trim();

  const dashIdx = s.indexOf(' - ');
  const namePart = normalizeName(dashIdx === -1 ? s : s.slice(0, dashIdx));
  const amountPart = dashIdx === -1 ? '' : s.slice(dashIdx + 3).trim();

  const key = namePart.toLowerCase();
  const display = namePart;

  if (!amountPart) return { key, display, qty: 0, unit: '' };

  const rangeRe = new RegExp(`^(${NUM_TOKEN})\\s*-\\s*(${NUM_TOKEN})\\s*(\\S*)$`);
  const singleRe = new RegExp(`^(${NUM_TOKEN})\\s*(\\S*)$`);

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

function aggregateIngredients(
  all: string[],
  seasonalFruits: Map<string, Set<string>>,
  currentSeason: string,
): IngredientItem[] {
  const groups = new Map<string, { display: string; sums: Map<string, number>; bare: number }>();

  for (const raw of all) {
    const p = parseIng(raw);
    // Only known fruits get season-gated — vegetables and everything else always show
    const fruitSeasons = seasonalFruits.get(p.key);
    if (fruitSeasons && !fruitSeasons.has(currentSeason)) continue;
    if (!groups.has(p.key)) groups.set(p.key, { display: p.display, sums: new Map(), bare: 0 });
    const g = groups.get(p.key)!;
    if (p.qty > 0) {
      g.sums.set(p.unit, (g.sums.get(p.unit) || 0) + p.qty);
    } else {
      g.bare++;
    }
  }

  const result: IngredientItem[] = [];
  Array.from(groups.values()).forEach((g) => {
    if (g.sums.size === 0) {
      result.push({ display: g.display, amount: g.bare > 1 ? `×${g.bare}` : '' });
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

function planDays(startDate: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate + 'T12:00:00');
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function pickDish(dishes: any[], likes: string[], dislikes: string[]) {
  if (!dishes.length) return null;
  const scored = dishes.map((d) => {
    const text = `${d.titleKa} ${d.titleEn} ${d.ingredientsKa.join(' ')} ${d.ingredientsEn.join(' ')}`.toLowerCase();
    const likeScore = likes.filter((l) => text.includes(l.toLowerCase())).length;
    const dislikeScore = dislikes.filter((dl) => text.includes(dl.toLowerCase())).length;
    return { d, score: likeScore - dislikeScore };
  });
  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const top = scored.filter((s) => s.score === topScore);
  return top[Math.floor(Math.random() * top.length)].d;
}

// GET /api/shopping-list?childId=X
// Generates 7 days of meal plans and returns deduplicated ingredient list
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: session.id }, select: { subscriptionStatus: true } });
  if (dbUser?.subscriptionStatus !== 'FULL_PLAN') {
    return NextResponse.json({ error: 'FULL_PLAN required' }, { status: 403 });
  }

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const today = new Date().toISOString().split('T')[0];
  const planStart = req.nextUrl.searchParams.get('planStart') ?? today;
  const dates = planDays(planStart);

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const month = new Date().getMonth();
  const currentSeason = month <= 1 || month === 11 ? 'WINTER'
    : month <= 4 ? 'SPRING'
    : month <= 7 ? 'SUMMER'
    : 'AUTUMN';

  const fruitRows = await prisma.ingredient.findMany({ where: { type: 'FRUIT' }, select: { titleKa: true, seasons: true } });
  const seasonalFruits = new Map(fruitRows.map((f) => [f.titleKa.toLowerCase(), new Set(f.seasons)]));

  const allIngredients: string[] = [];
  const days: { date: string; dishes: string[] }[] = [];

  for (const date of dates) {

    let logs = await prisma.dailyLog.findMany({
      where: { childId, date },
      include: { dish: true, ingredient: true },
    });

    const existing = new Set(
      logs.filter((l) => l.dishId !== null || l.ingredientId !== null).map((l) => l.mealType)
    );
    const missing = MEAL_TYPES.filter((m) => !existing.has(m));

    for (const mealType of missing) {
      let logData: any = { childId, date, mealType, wasEaten: false };

      if (mealType === 'SNACK') {
        const suitableAges = getSuitableAgeGroups(child.ageGroup);
        const ingCandidates = await prisma.ingredient.findMany({
          where: { ageGroups: { hasSome: suitableAges }, seasons: { has: currentSeason as any } },
        });
        if (ingCandidates.length && Math.random() < 0.5) {
          const picked = ingCandidates[Math.floor(Math.random() * ingCandidates.length)];
          await prisma.dailyLog.upsert({
            where: { childId_date_mealType: { childId, date, mealType } },
            update: { ingredientId: picked.id, dishId: null },
            create: { ...logData, ingredientId: picked.id, dishId: null },
          });
          continue;
        }
      }

      const where: any = { mealType, ageGroups: { hasSome: getSuitableAgeGroups(child.ageGroup) } };
      if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };
      const candidates = await prisma.dish.findMany({ where });
      const picked = pickDish(candidates, child.likes, child.dislikes);

      await prisma.dailyLog.upsert({
        where: { childId_date_mealType: { childId, date, mealType } },
        update: { dishId: picked?.id ?? null, ingredientId: null },
        create: { ...logData, dishId: picked?.id ?? null },
      });
    }

    logs = await prisma.dailyLog.findMany({
      where: { childId, date },
      include: { dish: true, ingredient: true },
    });

    const dayDishes: string[] = [];
    for (const log of logs) {
      if (log.dish?.ingredientsKa?.length) {
        allIngredients.push(...log.dish.ingredientsKa);
        dayDishes.push(log.dish.titleKa);
      }
      if (log.ingredient?.titleKa) {
        allIngredients.push(log.ingredient.titleKa);
        dayDishes.push(log.ingredient.titleKa);
      }
    }
    days.push({ date, dishes: dayDishes });
  }

  const ingredients = aggregateIngredients(allIngredients, seasonalFruits, currentSeason);
  return NextResponse.json({ ingredients, days });
}
