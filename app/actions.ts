'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { clearAuthCookie, hashPassword, setAuthCookie, verifyPassword } from '@/lib/auth';
import { getAgeGroup } from '@/lib/meal';
import { sendWelcomeEmail } from '@/lib/email';

function str(form: FormData, key: string) { return String(form.get(key) || '').trim(); }
function list(form: FormData, key: string) { return str(form, key).split(',').map(x => x.trim()).filter(Boolean); }

export async function registerAction(form: FormData) {
  const name = str(form, 'name');
  const email = str(form, 'email').toLowerCase();
  const password = str(form, 'password');
  const childName = str(form, 'childName');
  const birthDate = new Date(str(form, 'birthDate'));

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect('/register?error=exists');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name, email, passwordHash,
      children: {
        create: {
          name: childName,
          birthDate,
          ageGroup: getAgeGroup(birthDate),
          allergies: list(form, 'allergies'),
        },
      },
    },
  });
  await setAuthCookie({ id: user.id, email: user.email, name: user.name, role: user.role });
  try { await sendWelcomeEmail(email, name); } catch {}
  redirect('/dashboard?lang=ka');
}

export async function loginAction(form: FormData) {
  const email = str(form, 'email').toLowerCase();
  const password = str(form, 'password');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) redirect('/login?error=1');
  if (user!.isBlocked) redirect('/login?error=blocked');
  await setAuthCookie({ id: user!.id, email: user!.email, name: user!.name, role: user!.role });
  redirect(user!.role === 'ADMIN' ? '/admin?lang=ka' : '/dashboard?lang=ka');
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect('/?lang=ka');
}

export async function saveChildAction(form: FormData) {
  const { requireUser } = await import('@/lib/auth');
  const s = await requireUser();
  const childId = str(form, 'childId');
  const birthDate = new Date(str(form, 'birthDate'));
  await prisma.child.updateMany({
    where: { id: childId, userId: s.id },
    data: {
      name: str(form, 'childName'),
      birthDate,
      ageGroup: getAgeGroup(birthDate),
      allergies: list(form, 'allergies'),
      dislikes: list(form, 'dislikes'),
    },
  });
  redirect('/dashboard?lang=ka');
}

export async function createDishAction(form: FormData) {
  const { requireAdmin } = await import('@/lib/auth');
  await requireAdmin();
  await prisma.dish.create({
    data: {
      titleKa: str(form, 'titleKa'), titleEn: str(form, 'titleEn'),
      descriptionKa: str(form, 'descriptionKa'), descriptionEn: str(form, 'descriptionEn'),
      imageUrl: str(form, 'imageUrl'),
      ingredientsKa: list(form, 'ingredientsKa'),
      ingredientsEn: list(form, 'ingredientsEn'),
      calories: Number(form.get('calories') || 0),
      proteinGrams: Number(form.get('proteinGrams') || 0),
      ageGroups: list(form, 'ageGroups') as any,
      allergens: list(form, 'allergens'),
    },
  });
  redirect('/admin?lang=ka');
}

export async function createPlanAction(form: FormData) {
  const { requireAdmin } = await import('@/lib/auth');
  await requireAdmin();
  await prisma.mealPlan.create({
    data: {
      titleKa: str(form, 'titleKa'),
      titleEn: str(form, 'titleEn'),
      ageGroup: str(form, 'ageGroup') as any,
      dayOffset: Number(form.get('dayOffset') || 0),
    },
  });
  redirect('/admin/plans');
}

export async function addPlanItemAction(form: FormData) {
  const { requireAdmin } = await import('@/lib/auth');
  await requireAdmin();
  await prisma.mealPlanItem.create({
    data: {
      mealPlanId: str(form, 'mealPlanId'),
      dishId: str(form, 'dishId'),
      mealType: str(form, 'mealType') as any,
      sortOrder: Number(form.get('sortOrder') || 0),
      notesKa: str(form, 'notesKa'),
      notesEn: str(form, 'notesEn'),
    },
  });
  redirect('/admin/plans');
}
