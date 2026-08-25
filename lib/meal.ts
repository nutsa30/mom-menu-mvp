import { AgeGroup, MealType } from '@prisma/client';

// Exact calendar-month count, not a 30.44-day average — a child born on the 26th turns
// each new month precisely on the 26th, not a day or two early/late depending on how many
// days that particular month happened to have.
export function ageInMonths(birthDate: Date, now: Date = new Date()): number {
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  if (now.getDate() < birthDate.getDate()) months--;
  return Math.max(0, months);
}

export function getAgeGroup(birthDate: Date): AgeGroup {
  const months = ageInMonths(birthDate);
  if (months >= 24) return 'FROM_24';
  if (months >= 12) return 'FROM_12';
  if (months >= 9)  return 'FROM_9';
  return 'FROM_6';
}

// Returns all age groups suitable for a child of this group
// (a child FROM_12 can eat FROM_6, FROM_9, and FROM_12 recipes)
export const AGE_GROUP_ORDER: AgeGroup[] = ['FROM_6', 'FROM_9', 'FROM_12', 'FROM_24'];

export function getSuitableAgeGroups(childAgeGroup: AgeGroup): AgeGroup[] {
  const idx = AGE_GROUP_ORDER.indexOf(childAgeGroup);
  return AGE_GROUP_ORDER.slice(0, idx + 1);
}

export const mealOrder: MealType[] = ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'];

/**
 * Returns the appropriate meal slots based on child's age in months.
 *
 * 6–8 months  (FROM_6):  2 meals  — საუზმე + სადილი
 * 9–11 months (FROM_9):  3 meals  — საუზმე + სადილი + ვახშამი
 * 12+ months  (FROM_12, FROM_24): 4 meals — სრული + სნექი
 */
export function getMealTypesForAge(birthDate: Date | null | undefined): MealType[] {
  if (!birthDate) return ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'];
  const months = ageInMonths(new Date(birthDate));
  if (months < 9)  return ['BREAKFAST', 'LUNCH'];
  if (months < 12) return ['BREAKFAST', 'LUNCH', 'DINNER'];
  return ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'];
}

export function mealLabel(type: MealType, locale: 'ka' | 'en') {
  const map = {
    BREAKFAST: { ka: 'საუზმე', en: 'Breakfast' },
    LUNCH: { ka: 'სადილი', en: 'Lunch' },
    DINNER: { ka: 'ვახშამი', en: 'Dinner' },
    SNACK: { ka: 'სნექი', en: 'Snack' }
  } as const;
  return map[type][locale];
}
