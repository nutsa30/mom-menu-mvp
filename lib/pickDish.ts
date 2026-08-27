import { AGE_GROUP_ORDER } from './meal';

// Shared with app/api/daily-log/route.ts's auto-fill (pickDish) AND
// app/api/daily-log/[id]/replacements/route.ts's "შემიცვალე" suggestions — ONE scoring
// algorithm behind both "what should today's plan default to" and "what's a good
// alternative to this dish", so a replacement suggestion is never weaker reasoning than
// the plan that put the original dish there in the first place.

export function dishMatchesText(dish: any, terms: string[]): boolean {
  const text = [
    dish.titleKa, dish.titleEn,
    ...(dish.ingredientsKa || []),
    ...(dish.ingredientsEn || []),
    ...(dish.allergens || []),
  ].join(' ').toLowerCase();
  return terms.some((t) => text.includes(t.toLowerCase()));
}

export function nutritionScore(dish: any): number {
  return (
    (dish.ironMg || 0) * 4 +
    (dish.calciumMg || 0) / 30 +
    (dish.vitaminCmg || 0) / 5 +
    (dish.vitaminAmcg || 0) / 80 +
    (dish.proteinGrams || 0) / 3 +
    (dish.vitaminDmcg || 0) * 2 +
    (dish.fiberGrams || 0) / 2
  );
}

// Same age-appropriateness narrowing pickDish's caller applies before scoring: a dish
// also tagged for a group younger than this child's is a "simpler" dish suited to an
// earlier stage, so it's excluded from the pool unless that would leave nothing.
export function narrowToStage(candidates: any[], childAgeGroup: string, opts: { randomize?: boolean } = {}): any[] {
  const childAgeIdx = AGE_GROUP_ORDER.indexOf(childAgeGroup as any);
  if (childAgeIdx <= 0) return candidates;
  const stageMatched = candidates.filter(
    (d) => !d.ageGroups.some((ag: string) => AGE_GROUP_ORDER.indexOf(ag as any) < childAgeIdx)
  );
  if (stageMatched.length === 0) return candidates;
  if (opts.randomize && Math.random() <= 0.15) return candidates;
  return stageMatched;
}

// Ranks every candidate the same way pickDish() does — nutrition + likes/dislikes text
// signal + a small random nudge for variety — but returns the full sorted list instead
// of collapsing straight to one random pick. pickDish() (below) still does that
// collapsing for auto-fill; the replacements endpoint uses this directly so a parent can
// choose from a ranked list rather than getting a single silent pick.
export function scoreCandidates(
  candidates: any[],
  likes: string[],
  dislikes: string[],
  recentIds: Set<string>,
  todayIds: Set<string>,
  hardExcludeIds: Set<string> = new Set(),
): { d: any; score: number }[] {
  if (!candidates.length) return [];

  const notExcluded = candidates.filter((d) => !hardExcludeIds.has(d.id));
  const pool0 = notExcluded.length > 0 ? notExcluded : candidates;

  // Prefer dishes not used today; fall back to full pool only if nothing else
  const notToday = pool0.filter((d) => !todayIds.has(d.id));
  const pool1 = notToday.length > 0 ? notToday : pool0;

  // Hard-exclude dishes used in the last 7 days (not just a score penalty) — a dish with
  // a genuinely higher nutrition score than its neighbors could outscore a soft penalty
  // every day and keep winning regardless of recency. Only fall back to the recently-used
  // pool if excluding them would leave nothing (thin catalog for this age/allergy combo).
  const notRecent = pool1.filter((d) => !recentIds.has(d.id));
  const pool = notRecent.length > 0 ? notRecent : pool1;

  return pool
    .map((d) => {
      let score = nutritionScore(d);
      if (likes.length && dishMatchesText(d, likes)) score += 2;
      if (dislikes.length && dishMatchesText(d, dislikes)) score -= 6;
      score += Math.random() * 0.5; // small nudge so identical-score dishes vary
      return { d, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function pickDish(
  candidates: any[],
  likes: string[],
  dislikes: string[],
  recentIds: Set<string>,
  todayIds: Set<string>,
): any | null {
  const scored = scoreCandidates(candidates, likes, dislikes, recentIds, todayIds);
  if (!scored.length) return null;
  // Pick from top 3 for variety
  const top = scored.slice(0, Math.min(3, scored.length));
  return top[Math.floor(Math.random() * top.length)].d;
}
