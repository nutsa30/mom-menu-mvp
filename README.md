# Mom Menu MVP

Next.js + Prisma + Neon + Cloudinary-ready MVP for a daily child meal planner subscription product.

## Features
- Georgian/English language switcher.
- Auth with JWT cookie, bcrypt password hashing.
- Roles: `USER`, `ADMIN`.
- Admin panel: dishes, meal plans, plan items, subscribers, children overview.
- User dashboard: child profile, daily menu, next 2 days preview, ingredients, meal photos, mock subscription activate/cancel.
- Prisma schema for Neon/PostgreSQL.
- Cloudinary-ready image URL fields. MVP stores image URLs in DB.
- Seed data.

## Environment
Create `.env` from `.env.example`.

## Run locally
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

## Seed logins
Admin: `admin@mommenu.test` / `Admin123!`
User: `nino@mommenu.test` / `User123!`

## Notes
Subscription payment is mocked. Clicking activate marks the user as paid.
