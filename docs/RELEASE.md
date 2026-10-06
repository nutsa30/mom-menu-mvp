# საერთაშორისო ვერსიის გამოქვეყნება

ადგილობრივი ტესტების წარმატება რეალურ საბანკო ჩამოჭრას, Google OAuth-ს ან წერილის გაგზავნას ვერ ადასტურებს. მოქმედი ბაზა, ბანკი და Vercel ამ შემოწმებებით არ შეცვლილა. Neon-ში შექმნილია ცალკე სარეზერვო branch და cron-job.org-ში დამატებულია გამორთული საერთაშორისო დავალება.

## ჯერ გადასამოწმებელი

1. Neon-ის სარეზერვო ასლი შექმნილია: პროექტი `baby-food` (`plain-voice-24503191`), branch `mommenu-before-international-2026-10-07` (`br-raspy-sound-ank3wx86`), parent `production` (`br-shiny-bird-andkwxu6`), auto-delete Never. ეს ასლი არ განახლებულა. გასაშვები SQL მოქმედ production ბაზას უნდა მიუთითებდეს; backup-ის კავშირი საიტზე არ გადაიტანო. აღდგენისას ჯერ ამ ასლისგან ცალკე აღსადგენი branch მოამზადე და შეამოწმე; სრულად უკან დაბრუნება ასლის შემდეგ შესრულებულ ნამდვილ გადახდებს დაკარგავს, ამიტომ ეს ავტომატური rollback ბრძანება არ არის.
2. Vercel → mom-menu-mvp → Settings → Environment Variables → Production: არსებული DATABASE_URL, JWT_SECRET, CRON_SECRET, GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET (კოდში გამოყენებული სახელები იხილე ქვემოთ), BOG_CLIENT_ID/BOG_CLIENT_SECRET, RESEND_API_KEY და NEXT_PUBLIC_APP_URL გადაამოწმე. არ გადმოიტანო სამუშაო ასლის `.env`: ის მხოლოდ ადგილობრივ სატესტო ბაზას იყენებს. MOMMENU_SANDBOX პროდაქშენში არ უნდა იყოს 1. JWT_SECRET-ის არსებული სწორი მნიშვნელობა არ შეცვალო.
3. Hobby-ზე საათობრივი დავალების მონახაზი cron-job.org-ში უკვე შენახულია, ID 8593882, გამორთული. GET `https://www.mommenu.ge/api/cron/international-communications`, `7 * * * *`, Header `Authorization: Bearer <CRON_SECRET>`. საიდუმლო URL-ში არ ჩაწერო. არსებული ხუთი გარე დავალების დეტალები იხილე `docs/EXTERNAL_CRON_REVIEW.md`. კოდში ნაგულისხმევი საიდუმლო ამოღებულია, მაგრამ თუ Vercel-ში ძველი სუსტი მნიშვნელობა დარჩა, კონფიგურირებული მნიშვნელობა მაინც მიიღება: ამიტომ გამოქვეყნებამდე მფლობელმა უნდა მოამზადოს ძლიერი ახალი CRON_SECRET, ხოლო გამოქვეყნებისას გარე ხუთი დავალების Header იმავე მნიშვნელობაზე გადაიყვანოს. Vercel-ის environment-ის შენახვის შემდეგ ცალკე Redeploy არ გაუშვა; ცვლილება ახალი საერთაშორისო კოდის გამოქვეყნებასთან ერთად უნდა ამოქმედდეს. ძველი მოქმედი კოდი მხოლოდ query-secret-ს იღებს, ახალი კი Bearer Header-საც; scheduler-ის საბოლოო გადართვა ახალი deployment-ის Ready მდგომარეობას უნდა დაემთხვეს. მანამდე ხუთი მოქმედი დავალების ცვლილებები არ შეინახო. საერთაშორისო დავალება მხოლოდ ამ გადართვის შემდეგ ჩაირთოს. Vercel-ის ორი ყოველდღიური დავალება ახალ კოდში CRON_SECRET Header-ს ავტომატურად იყენებს.
4. არსებული ანგარიშებით შესვლა და უცხოური checkout რეალურ სერვისებზე ჯერ არ შემოწმებულა. გამოქვეყნების შემდეგ რეკლამის ჩართვამდე მცირე რეალური გადახდით გადაამოწმე ჩამოჭრა, callback, სწორი ვალუტა და პაკეტის ვადა; ასევე Google შესვლა, სატესტო წერილი და push.

პარამეტრების ზუსტი სახელების სანახავად (ეს ბრძანება საიდუმლო მნიშვნელობებს არ აჩვენებს):

```powershell
rg -n 'process.env.(GOOGLE|BOG|NEXT_PUBLIC_APP_URL|JWT_SECRET|CRON_SECRET|RESEND)' app/api/auth/google lib/bog.ts lib/auth.ts lib/resend.ts
```

## ტერმინალის ბრძანებები

ეს ბრძანებები მხოლოდ ზემოთ ჩამოთვლილი მოწყობისა და სარეზერვო ასლის შემდეგ გაუშვი. ყოველი ჩავარდნილი ნაბიჯის შემდეგ გაჩერდი; ბოლო push ავტომატურად Vercel-ის გამოქვეყნებას იწყებს, თუ main-ზე ავტომატური deploy ჩართულია.

```powershell
Set-Location 'C:\Users\gstore\OneDrive\Desktop\mom-menu-mvp'
if (git status --porcelain) { throw 'პროექტში ადგილობრივი ცვლილებებია — ჯერ მათი შენახვაა საჭირო.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'main-ზე გადასვლა ვერ შესრულდა.' }
git merge --ff-only codex/international-version
if ($LASTEXITCODE -ne 0) { throw 'შეერთება ვერ შესრულდა — push არ გააკეთო.' }
npm ci
if ($LASTEXITCODE -ne 0) { throw 'დამოკიდებულებების დაყენება ვერ შესრულდა.' }
npx --no-install prisma db execute --file docs/international-schema-review.sql --schema prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw 'ბაზის განახლება ვერ შესრულდა — push არ გააკეთო.' }
npx --no-install prisma db execute --file docs/international-content-review.sql --schema prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw 'ინგლისური შინაარსის განახლება ვერ შესრულდა — push არ გააკეთო.' }
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'Push ვერ შესრულდა.' }
```

SQL იყენებს ამ ორ ფაილში ჩაწერილ ტრანზაქციებს. სქემის SQL-ის წარმატებით გაშვების შემდეგ იგივე სქემის SQL მეორედ არ გაუშვა. თუ მხოლოდ content ან push ჩავარდა, იმ ჩავარდნილი ნაბიჯიდან გააგრძელე. `prisma db push`, `migrate reset` და seed პროდაქშენზე არ გამოიყენო.

ბაზის კავშირი უნდა იყოს ამ საწყისი პროექტის მოქმედი ბაზის `.env`-იდან; ჯერ გადაამოწმე, რომ ის Vercel Production-ის DATABASE_URL-ის შესაბამის ბაზას უკავშირდება. ბრძანებები თავისით ვერ ადასტურებს, რომ სწორ ბაზას მიუთითე.
