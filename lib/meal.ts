import { AgeGroup, MealType } from '@prisma/client';

export function getAgeGroup(birthDate: Date): AgeGroup {
  const months = Math.max(0, (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
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

export function mealLabel(type: MealType, locale: 'ka' | 'en') {
  const map = {
    BREAKFAST: { ka: 'საუზმე', en: 'Breakfast' },
    LUNCH: { ka: 'სადილი', en: 'Lunch' },
    DINNER: { ka: 'ვახშამი', en: 'Dinner' },
    SNACK: { ka: 'სნექი', en: 'Snack' }
  } as const;
  return map[type][locale];
}
