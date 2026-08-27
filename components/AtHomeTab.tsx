'use client';

import { useEffect, useMemo, useState } from 'react';
import RecipeModal from './RecipeModal';

const MEAL_LABEL: Record<string, string> = { BREAKFAST: 'საუზმე', SNACK: 'სნექი', LUNCH: 'სადილი', DINNER: 'ვახშამი' };
const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

type Unit = 'g' | 'ml' | 'pcs';
const UNIT_LABEL: Record<Unit, string> = { g: 'გ', ml: 'მლ', pcs: 'ცალი' };
const UNITS: Unit[] = ['g', 'ml', 'pcs'];

type PantryItem = { id: string; name: string; amount: number; unit: Unit };
type ParsedIngredient = { name: string; amount: number | null; unit: Unit | null };

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function nameMatches(a: string, b: string): boolean {
  const na = norm(a), nb = norm(b);
  return na.length > 0 && nb.length > 0 && (na.includes(nb) || nb.includes(na));
}

function normalizeUnit(raw: string): Unit | null {
  const u = raw.trim().toLowerCase();
  if (u === 'გ' || u === 'g' || u === 'kg' || u === 'კგ') return 'g';
  if (u === 'მლ' || u === 'ml' || u === 'ლ' || u === 'l') return 'ml';
  if (u === 'ცალი' || u === 'ც' || u === 'pcs' || u === 'pc') return 'pcs';
  return null;
}

// Recipe ingredient strings look like "ქათმის ფილე - 55 გ", "ბანანი - 1 მწიფე (60 გ)",
// or "კვერცხი - 1 ცალი" — free text, not structured data. Pull out a name and, where
// possible, a comparable amount/unit: prefer a parenthetical gram/ml equivalent (the
// "(60 გ)" in "1 მწიფე (60 გ)") since that's the precise figure; otherwise take the
// leading "number unit". When neither parses cleanly, amount/unit come back null and
// matching falls back to name-only for that ingredient rather than blocking on it.
function parseIngredient(raw: string): ParsedIngredient {
  const dashIdx = raw.lastIndexOf(' - ');
  if (dashIdx === -1) return { name: raw.trim(), amount: null, unit: null };
  const name = raw.slice(0, dashIdx).trim();
  const qtyPart = raw.slice(dashIdx + 3).trim();

  const parenMatch = qtyPart.match(/\(([\d.,]+)\s*(გ|მლ|ლ|კგ|kg|g|ml|l)\)/i);
  if (parenMatch) {
    return { name, amount: parseFloat(parenMatch[1].replace(',', '.')), unit: normalizeUnit(parenMatch[2]) };
  }
  const plain = qtyPart.match(/^([\d.,]+)\s*(გ|მლ|ლ|კგ|ცალი|ც|kg|g|ml|l|pcs)/i);
  if (plain) {
    return { name, amount: parseFloat(plain[1].replace(',', '.')), unit: normalizeUnit(plain[2]) };
  }
  return { name, amount: null, unit: null };
}

// g and ml are treated as roughly interchangeable (fine for a home-cooking estimate);
// pcs only compares against pcs.
function unitsComparable(a: Unit | null, b: Unit | null): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  return (a === 'g' && b === 'ml') || (a === 'ml' && b === 'g');
}

type IngredientCheck = ParsedIngredient & { have: number | null; haveUnit: Unit | null; status: 'ok' | 'not_enough' | 'missing' | 'unknown' };

function checkCoverage(dish: any, pantry: PantryItem[]): { checks: IngredientCheck[]; fullyMakeable: boolean; matchedCount: number } {
  const reqs = ((dish.ingredientsKa || []) as string[]).map(parseIngredient);
  const checks: IngredientCheck[] = reqs.map((req) => {
    const have = pantry.find((p) => nameMatches(p.name, req.name));
    if (!have) return { ...req, have: null, haveUnit: null, status: 'missing' };
    if (req.amount == null || !unitsComparable(req.unit, have.unit)) {
      // Name matches but we can't compare quantities reliably — don't block the user
      // over messy source data, just flag it as unverified rather than confirmed.
      return { ...req, have: have.amount, haveUnit: have.unit, status: 'unknown' };
    }
    return { ...req, have: have.amount, haveUnit: have.unit, status: have.amount >= req.amount ? 'ok' : 'not_enough' };
  });
  const matchedCount = checks.filter((c) => c.status !== 'missing').length;
  const fullyMakeable = checks.length > 0 && checks.every((c) => c.status === 'ok' || c.status === 'unknown');
  return { checks, fullyMakeable, matchedCount };
}

// "რა მაქვს სახლში?" — finds dishes from the SAME catalog "დღის გეგმა" already loaded
// (allDishes, fetched once in DashboardClient from /api/meals — no separate product/
// recipe list is introduced here), matched against products the parent has on hand,
// respecting the QUANTITY the parent actually has — a recipe only counts as makeable
// when what's on hand doesn't fall short of what the recipe needs. Opening a match uses
// the shared RecipeModal, and marking one "ჭამა" replaces a slot in TODAY's real plan
// through the exact same PATCH /api/daily-log/[id] endpoint the existing "სხვა"
// substitute action already uses — so the plan, the vote, and the vitamin/nutrient
// totals (/api/nutrition, which just sums wasEaten DailyLog rows) all update through
// the one pathway that already exists, nothing parallel.
export default function AtHomeTab({ child, allDishes }: { child: any; allDishes: any[] }) {
  const todayStr = localToday();

  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [unitInput, setUnitInput] = useState<Unit>('g');

  const [recipeModal, setRecipeModal] = useState<any | null>(null);
  const [replacing, setReplacing] = useState<any | null>(null);
  const [confirmedMsg, setConfirmedMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!child) return;
    setLoadingLogs(true);
    const res = await fetch(`/api/daily-log?childId=${child.id}&date=${todayStr}`);
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoadingLogs(false);
  };

  useEffect(() => { fetchLogs(); }, [child?.id]);

  const addPantryItem = () => {
    const name = nameInput.trim();
    const amount = parseFloat(amountInput.replace(',', '.'));
    if (!name || !amount || amount <= 0) return;
    setPantry((prev) => [
      ...prev.filter((p) => norm(p.name) !== norm(name)),
      { id: `${Date.now()}_${name}`, name, amount, unit: unitInput },
    ]);
    setNameInput('');
    setAmountInput('');
  };
  const removePantryItem = (id: string) => setPantry((prev) => prev.filter((p) => p.id !== id));

  // Same age/allergy gate the existing "სხვა" substitute list applies (subCandidates in
  // TodayTab), plus the same likes/dislikes signal pickDish() (the server auto-fill
  // algorithm) already scores on — not a second, independent preference source.
  const results = useMemo(() => {
    if (!child || pantry.length === 0) return [];

    const scored = allDishes
      .filter((d: any) =>
        d.ageGroups?.includes(child.ageGroup) &&
        !d.allergens?.some((a: string) => child.allergies?.includes(a))
      )
      .map((d: any) => {
        const { checks, fullyMakeable, matchedCount } = checkCoverage(d, pantry);
        if (matchedCount === 0) return null;

        let bonus = 0;
        const text = [d.titleKa, ...(d.ingredientsKa || [])].join(' ').toLowerCase();
        if (child.likes?.length && child.likes.some((l: string) => text.includes(l.toLowerCase()))) bonus += 0.15;
        if (child.dislikes?.length && child.dislikes.some((l: string) => text.includes(l.toLowerCase()))) bonus -= 0.3;

        const score = (fullyMakeable ? 10 : 0) + matchedCount / checks.length + bonus;
        return { dish: d, checks, fullyMakeable, matchedCount, score };
      })
      .filter(Boolean) as { dish: any; checks: IngredientCheck[]; fullyMakeable: boolean; matchedCount: number; score: number }[];

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 20);
  }, [allDishes, pantry, child]);

  const makeable = results.filter((r) => r.fullyMakeable);
  const partial = results.filter((r) => !r.fullyMakeable);

  // Only today's slots whose meal type matches the dish — the same same-mealType rule
  // the existing "სხვა" substitute list enforces, so a breakfast dish can't land in dinner.
  const slotsForDish = (dish: any) => logs.filter((l) => l.mealType === dish.mealType);

  const markEatenInSlot = async (logId: string, dishId: string) => {
    const res = await fetch(`/api/daily-log/${logId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishId, wasEaten: true }),
    });
    const updated = await res.json();
    setLogs((prev) => prev.map((l) => (l.id === logId ? updated : l)));
    // Same cache-invalidation the existing substitute() does — shopping list must reflect
    // the new dish's ingredients too.
    localStorage.removeItem(`shopping_${child?.id}`);
    setReplacing(null);
    setConfirmedMsg(`დღის გეგმა განახლდა — ${MEAL_LABEL[updated.mealType]} ახლა არის „${updated.dish?.titleKa}“`);
    window.setTimeout(() => setConfirmedMsg(null), 4500);
  };

  const toggleDislike = async (dishId: string) => {
    await fetch('/api/dish-votes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: child.id, dishId, liked: false }),
    });
    setConfirmedMsg('აღინიშნა როგორც არ მოწონებული — მომავალში ნაკლებად შემოგთავაზდება');
    window.setTimeout(() => setConfirmedMsg(null), 4500);
  };

  if (!child) {
    return (
      <div className={`${card} p-10 text-center`}>
        <p className="text-[#465940]/60 text-sm">შვილის მიმატება „შვილი“ ჩანართში.</p>
      </div>
    );
  }

  const renderDishCard = (r: { dish: any; checks: IngredientCheck[]; fullyMakeable: boolean }) => {
    const { dish, checks, fullyMakeable } = r;
    return (
      <div key={dish.id} className={`${card} p-4`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setRecipeModal(dish)}
            className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-[#f0f8ee] hover:ring-2 hover:ring-[#465940]/40 transition">
            {dish.imageUrl ? <img src={dish.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#465940]/10 text-[#465940]">
                {MEAL_LABEL[dish.mealType]}
              </span>
              {fullyMakeable ? (
                <span className="text-[10px] font-bold text-green-700">✓ სრულად შეგიძლია მოამზადო</span>
              ) : (
                <span className="text-[10px] font-bold text-[#465940]/60">ნაწილობრივ გაქვს</span>
              )}
            </div>
            <p className="font-bold text-[#465940] text-sm truncate">{dish.titleKa}</p>
          </div>
        </div>

        <ul className="mt-2.5 space-y-1">
          {checks.map((c, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px]">
              <span className={
                c.status === 'ok' ? 'text-green-600' :
                c.status === 'unknown' ? 'text-[#465940]/50' :
                c.status === 'not_enough' ? 'text-amber-600' : 'text-[#465940]/35'
              }>
                {c.status === 'ok' ? '✓' : c.status === 'unknown' ? '•' : c.status === 'not_enough' ? '!' : '✗'}
              </span>
              <span className="text-[#465940]/80">
                {c.name}
                {c.amount != null && c.unit ? ` (საჭირო: ${c.amount}${UNIT_LABEL[c.unit]})` : ''}
              </span>
              {c.status === 'not_enough' && (
                <span className="text-amber-600 font-semibold">— გაქვს მხოლოდ {c.have}{c.haveUnit ? UNIT_LABEL[c.haveUnit] : ''}</span>
              )}
              {c.status === 'missing' && <span className="text-[#465940]/40">— არ გაქვს</span>}
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mt-3">
          <button onClick={() => setReplacing(dish)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]/80 transition">
            ჭამა
          </button>
          <button onClick={() => toggleDislike(dish.id)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-red-500 hover:text-white transition">
            არ მოეწონა
          </button>
          <button onClick={() => setRecipeModal(dish)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition">
            რეცეპტი
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className={`${card} p-5`}>
        <h2 className="font-black text-[#465940] text-lg mb-1">რა მაქვს სახლში?</h2>
        <p className="text-sm text-[#465940]/60 mb-4">
          ჩამოწერე რა პროდუქტები გაქვს და რამდენი — და {child.name}-სთვის შესაფერის, რეალურად მოსამზადებელ კერძებს გიპოვით.
        </p>

        {/* Name + amount + unit, added together as one pantry entry — matching then checks
            actual quantity, not just whether the ingredient name appears somewhere. */}
        <div className="flex flex-wrap gap-2 items-start">
          <div className="flex-1 min-w-[160px]">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPantryItem(); } }}
              placeholder="მაგ: ბრინჯი, ქათმის ფილე..."
              className="w-full border border-[#465940]/15 rounded-2xl px-3.5 py-2.5 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] transition"
            />
          </div>
          <input
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value.replace(/[^\d.,]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPantryItem(); } }}
            placeholder="რაოდენობა"
            inputMode="decimal"
            className="w-24 border border-[#465940]/15 rounded-2xl px-3.5 py-2.5 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] transition"
          />
          <select
            value={unitInput}
            onChange={(e) => setUnitInput(e.target.value as Unit)}
            className="border border-[#465940]/15 rounded-2xl px-3 py-2.5 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] transition"
          >
            {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
          </select>
          <button onClick={addPantryItem}
            className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]/80 transition">
            დამატება
          </button>
        </div>

        {pantry.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {pantry.map((item) => (
              <span key={item.id} className="flex items-center gap-1.5 bg-[#465940]/10 text-[#465940] text-sm font-semibold px-3 py-1.5 rounded-full">
                {item.name} — {item.amount}{UNIT_LABEL[item.unit]}
                <button onClick={() => removePantryItem(item.id)} className="text-[#465940]/50 hover:text-[#465940] leading-none">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {confirmedMsg && (
        <div className="rounded-2xl bg-[#465940] text-[#FDFBF0] px-4 py-3 text-sm font-semibold text-center">
          {confirmedMsg}
        </div>
      )}

      {pantry.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="text-[#465940]/60 text-sm">დაამატე პროდუქტები და რაოდენობა, რომ დაგინახო რისი მომზადება შეგიძლია.</p>
        </div>
      ) : results.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="text-[#465940]/60 text-sm">ამ პროდუქტებით შესაფერისი კერძი ვერ მოიძებნა.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {makeable.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#465940]/50">შეგიძლია ახლავე მოამზადო</h3>
              {makeable.map((r) => renderDishCard(r))}
            </div>
          )}
          {partial.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#465940]/50">ნაწილობრივ გაქვს — აკლია რაღაც</h3>
              {partial.map((r) => renderDishCard(r))}
            </div>
          )}
        </div>
      )}

      {/* Slot picker — replaces today's matching-mealType meal with this dish, through the
          exact same PATCH endpoint (and therefore the exact same eaten/vote/vitamin side
          effects) as the existing "სხვა" substitute action. */}
      {replacing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setReplacing(null)}>
          <div className="bg-[#FDFBF0] rounded-3xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#465940]/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-[#465940]">„{replacing.titleKa}“ — რომელი მიღება ჩანაცვლდეს?</h3>
                <button onClick={() => setReplacing(null)} className="text-[#465940]/60 hover:text-[#465940]/80 text-2xl leading-none">×</button>
              </div>
              <p className="text-[11px] text-[#465940]/60">დღევანდელი გეგმიდან ჩანაცვლდება არჩეული მიღება ამ კერძით</p>
            </div>
            <div className="p-4 space-y-2">
              {loadingLogs ? (
                <p className="text-center text-sm text-[#465940]/60 py-6">იტვირთება...</p>
              ) : slotsForDish(replacing).length === 0 ? (
                <p className="text-center text-sm text-[#465940]/60 py-6">
                  დღეს {child.name}-ის გეგმაში {MEAL_LABEL[replacing.mealType]} არ გვხვდება.
                </p>
              ) : (
                slotsForDish(replacing).map((log) => (
                  <button key={log.id} onClick={() => markEatenInSlot(log.id, replacing.id)}
                    className="group w-full flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-[#465940] transition text-left border border-transparent hover:border-[#465940]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#465940]/60 group-hover:text-[#FDFBF0]/70">
                        {MEAL_LABEL[log.mealType]}
                      </span>
                      <p className="font-bold text-[#465940] group-hover:text-[#FDFBF0] text-sm transition-colors">
                        {log.dish ? `ახლა: ${log.dish.titleKa}` : 'ჯერ არაფერია დაგეგმილი'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#465940] group-hover:text-[#FDFBF0]">აირჩიე →</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} />
    </div>
  );
}
