# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npx prisma generate         # must run after schema changes
npx prisma migrate dev --name <name>
npm run seed                 # tsx prisma/seed.ts — seed admin + test user
npm run dev                  # Next.js dev server
npm run build                # runs prisma generate then next build
npm run lint
npx prisma studio            # GUI for the database
```

Seed credentials: `admin@mommenu.test` / `Admin123!` and `nino@mommenu.test` / `User123!`

## Environment

Copy `.env.example` to `.env`. Required vars: `DATABASE_URL` (Neon/PostgreSQL connection string), `JWT_SECRET`.

## Architecture

**Stack:** Next.js 14 (App Router), Prisma + Neon PostgreSQL, Tailwind CSS, bcryptjs + jsonwebtoken.

### Two auth/data-fetching systems — be aware

This codebase has two parallel patterns that were built at different times and are not yet unified:

| Pattern | Files | Session storage |
|---|---|---|
| **Server actions** | `app/actions.ts`, `app/register/page.tsx`, `app/login/page.tsx` | httpOnly JWT cookie (`mom_menu_token`) |
| **REST API + client components** | `app/api/**`, `app/dashboard/page.tsx`, `app/signup/page.tsx` | `localStorage.user` |

The server action pattern (`lib/auth.ts`) is the secure, canonical approach. The REST API auth (`app/api/auth/login/route.ts`) **does not use bcrypt** — it compares plaintext passwords against the hash, which is a bug. New features should follow the server action pattern.

### Auth (server action pattern)

`lib/auth.ts` exports:
- `getSession()` — reads and verifies the JWT cookie; returns `SessionUser | null`
- `requireUser()` / `requireAdmin()` — call from server components/actions; redirect if unauthorized
- `setAuthCookie()` / `clearAuthCookie()` — set/delete the cookie
- `currentDbUser()` — fetch full user row with children

### Data model (Prisma)

Core relations: `User → Child[]`, `User → MealPlan[]`, `Child → MealPlan[]`, `MealPlan → MealPlanItem[] → Dish`.

Key enums: `Role` (USER, ADMIN), `SubscriptionStatus` (FREE, RECIPE_PLAN, FULL_PLAN, CANCELED), `AgeGroup` (BABY, TODDLER, PRESCHOOL, SCHOOL), `MealType` (BREAKFAST, LUNCH, DINNER, SNACK).

`lib/meal.ts` — `getAgeGroup(birthDate)` maps a birthdate to an `AgeGroup`.

### Localization

`lib/i18n.ts` exports a `dict` object with `ka` (Georgian) and `en` keys. Pages accept `?lang=ka|en` via `searchParams`. Default locale is `ka`. Pass `locale` down to `dict[locale]` for all UI strings.

### Styling

Global CSS classes defined in `app/globals.css`: `.input`, `.label`, `.btn`, `.btn-primary`, `.btn-ghost`, `.card`, `.badge`. Use these before writing inline Tailwind for form elements and cards. Brand color: `#ff7f50` (coral/orange).

### Admin

`app/admin/page.tsx` — protected by `requireAdmin()`. Manages dishes, meal plans, plan items, users, children.

### Subscription tiers

- `FREE` — can see dish titles; recipes locked
- `RECIPE_PLAN` (15₾) — can view full recipes
- `FULL_PLAN` (30₾) — can generate daily meal plans via `/api/meal-plan/generate`

Subscription activation is mocked (no real payment); `activateSubscriptionAction` / `cancelSubscriptionAction` in `app/actions.ts` toggle the status directly.
