'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { clearAuthCookie, hashPassword, setAuthCookie, verifyPassword } from '@/lib/auth';
import { getAgeGroup } from '@/lib/meal';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

function str(form: FormData, key: string) { return String(form.get(key) || '').trim(); }
function list(form: FormData, key: string) { return str(form, key).split(',').map(x => x.trim()).filter(Boolean); }

export async function registerAction(form: FormData) {
  const name = str(form, 'name');
  const email = str(form, 'email').toLowerCase();
  const password = str(form, 'password');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect('/register?error=exists');

  const passwordHash = await hashPassword(password);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = crypto.createHash('sha256').update(email + ':' + code).digest('hex');

  // No User row is created yet — just a pending registration keyed by email. It only
  // becomes a real account once the emailed code is confirmed (see verify-email-code
  // route). Re-submitting the form with the same email before confirming just replaces
  // the pending attempt with a fresh code, rather than erroring.
  await prisma.pendingRegistration.upsert({
    where: { email },
    create: { email, name, passwordHash, codeHash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    update: { name, passwordHash, codeHash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });

  try { await sendVerificationEmail(email, name, code); } catch {}
  redirect('/verify-email?email=' + encodeURIComponent(email));
}

export async function loginAction(form: FormData) {
  const email = str(form, 'email').toLowerCase();
  const password = str(form, 'password');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) redirect('/login?error=1');
  if (user!.isBlocked) redirect('/login?error=blocked');
  // Every User row that exists was either created already-verified (new code-confirmed
  // registration flow) or predates that flow entirely — this only still matters for
  // old-style accounts stuck on the legacy link-based emailVerifyToken.
  if (!user!.emailVerified && user!.emailVerifyToken) redirect('/login?error=unverified&email=' + encodeURIComponent(email));
  await setAuthCookie({ id: user!.id, email: user!.email, name: user!.name, role: user!.role });
  redirect(user!.role === 'ADMIN' ? '/admin?lang=ka' : '/dashboard?lang=ka&in=1');
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
