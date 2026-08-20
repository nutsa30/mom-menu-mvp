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
- `RECIPE_PLAN` (env `BOG_RECIPE_PLAN_AMOUNT_GEL`, currently 15₾) — can view full recipes
- `FULL_PLAN` (env `BOG_FULL_PLAN_AMOUNT_GEL`, currently 21₾) — can generate daily meal plans via `/api/meal-plan/generate`

Paid plans are purchased through **Bank of Georgia's Payment Manager API** (`lib/bog.ts`) — this is the live, current processor. Lemon Squeezy (`lib/lemonsqueezy.ts`, `/api/webhooks/lemonsqueezy`) and Quickpay (`lib/quickpay.ts`) are earlier integrations, now **unreachable from the UI** but left in place; don't extend them for new work.

**Trial mechanism — preauthorization, not charge+refund.** A first-ever purchase on an account (`User.bogTrialUsed === false`) goes through `createTrialOrder`, which creates the BOG order with `capture: "manual"` (a preauthorization hold, not a real charge) and enables card-saving on it. The webhook releases the hold (`cancelPreauthorization`) the instant it sees `order_status: "blocked"`, so the customer is never actually charged during the 7-day trial — no charge+refund pair ever appears on their statement, and (as importantly) it doesn't depend on our merchant account having enough *settled* balance to issue a refund, which real charge+refund does and which can fail (BOG error 163, "Not enough funds available"). Repeat purchases on an account that already has `bogTrialUsed: true` go through `createDirectOrder` instead — `capture: "automatic"`, real charge, no trial.

**Capture mode is inherited by `/subscribe`.** BOG's renewal endpoint (`POST .../orders/:parent_order_id/subscribe`, used by `chargeSavedCard`) always inherits amount, currency, buyer info, *and capture mode* from the parent order — confirmed empirically, not documented anywhere by BOG. Since the parent (trial) order is `capture: "manual"`, every renewal charge also lands as a preauthorization hold first (`order_status: "blocked"`) and needs an explicit `approvePreauthorization` call to actually collect the money — the webhook does this automatically on the `"blocked"` status for renewal orders, then records the `Payment` row once the follow-up `"completed"` callback confirms the capture. Don't "simplify" this into a single charge call — the two-step hold→approve is required by how BOG's API actually behaves, not an accident.

- `/api/subscription/bog-checkout` — creates the order (trial or direct, per `bogTrialUsed`) and returns the redirect URL (called from `app/subscription/page.tsx` and the pricing section in `app/HomeClient.tsx`)
- `/api/webhooks/bog` — the whole state machine: `order_status` of `"blocked"` / `"completed"` / `"rejected"`, crossed with whether the order is a first-purchase (`external_order_id` decodes via `decodeOrderId`) or a renewal (`decodeRenewalOrderId`). Idempotent per `bogOrderId` via a `Payment` row existence check.
- `/api/cron/bog-renew` — `?secret=` gated; finds accounts with `subscriptionRenewsAt <= now` and calls `chargeSavedCard`. **Must be registered in `vercel.json`'s `crons` array** — it was missing there once already (silently means renewals never fire; caught via "zero hits in Vercel logs ever" during a live test, not via any error).
- `/api/subscription/portal` / `/api/subscription/update` — Lemon-Squeezy-era endpoints (portal URL, promo-code-only grants); still live but irrelevant to BOG subscribers.

**Gotchas that have each caused a real production bug:**
- `NEXT_PUBLIC_APP_URL` **must be the exact non-redirecting domain** (`https://www.mommenu.ge`, not the apex `mommenu.ge`) — BOG's callback POST doesn't follow the apex→www 308 redirect Vercel serves, so webhooks silently never arrive if this is wrong, even though everything looks fine in a browser (which does follow the redirect).
- The webhook must explicitly set `isGifted: false` whenever it grants access from a real payment. If a stale `isGifted: true` is ever left on a paying account (e.g. from earlier promo/gift testing), it silently excludes that user from `admin/users`' MRR/revenue calculations — `isGifted` is a real input to those sums, not just a UI label. Admin can also clear it by hand (`GiftSubscriptionButton`'s "✕ მოხსნა" option) without touching subscription dates.
- Recurring Payments and Preauthorization both had to be manually activated by BOG support on the merchant account (manager.bog.ge → application → additional services) before any of this worked — if BOG payments start failing account-wide with an auth-declined code and no 3DS prompt, check whether one of these got deactivated.

Required env vars: `BOG_CLIENT_ID`, `BOG_CLIENT_SECRET`, `BOG_PUBLIC_KEY` (base64 of the PEM), `BOG_RECIPE_PLAN_AMOUNT_GEL`, `BOG_FULL_PLAN_AMOUNT_GEL`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`.
