import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

const FROM = process.env.EMAIL_FROM ?? "MomMenu <info@mommenu.ge>";

const MONTHS_KA = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];

function formatDateKa(date: Date): string {
  return `${date.getDate()} ${MONTHS_KA[date.getMonth()]}, ${date.getFullYear()}`;
}

export function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="ka">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td style="background:#465940;padding:28px 40px;border-radius:20px 20px 0 0;text-align:center;">
            <span style="color:#FDFBF0;font-size:24px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:-0.5px;">MomMenu 🍃</span>
          </td>
        </tr>
        <tr>
          <td style="background:#FDFBF0;padding:40px;font-family:Arial,sans-serif;color:#465940;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#FDFBF0;border-top:1px solid #e4e0d4;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#999;font-size:12px;font-family:Arial,sans-serif;">
              კითხვა? <a href="mailto:info@mommenu.ge" style="color:#465940;font-weight:bold;">info@mommenu.ge</a>
              &nbsp;|&nbsp;
              <a href="https://mommenu.ge" style="color:#465940;">mommenu.ge</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Default template bodies (fallback if DB has no override) ─────────────────

export const TEMPLATE_DEFAULTS: Record<string, { subject: string; body: string }> = {
  welcome: {
    subject: "კეთილი იყოს თქვენი მობრძანება MomMenu-ში 💚",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">გამარჯობა, {{name}}! 👋</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">კეთილი იყოს თქვენი მობრძანება <strong>MomMenu</strong>-ში! 💚</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">ჩვენ ვხარობთ, რომ გვირჩიეთ. MomMenu დაგეხმარებათ თქვენი ბავშვის კვების სწორად დაგეგმვაში — ასაკის, ალერგიებისა და გემოვნების გათვალისწინებით.</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.7;">შეიქმენით ბავშვის პროფილი, მიიღეთ კვირის კვების გეგმა და ისარგებლეთ ასობით შემუშავებული რეცეპტით. 🥗</p>
<div style="text-align:center;margin:28px 0;"><a href="https://mommenu.ge/dashboard" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">პირადი კაბინეტი →</a></div>
<p style="margin:24px 0 0;font-size:13px;color:#888;text-align:center;">გისურვებთ სასიამოვნო კვების გეგმვას!<br><strong style="color:#465940;">MomMenu გუნდი</strong></p>`,
  },

  subscription_confirmed: {
    subject: "თქვენი MomMenu პაკეტი გააქტიურდა ✅",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">თქვენი პაკეტი გააქტიურდა ✅</h2>
<p style="margin:0 0 20px;font-size:15px;line-height:1.7;">გამარჯობა, <strong>{{name}}</strong>! თქვენი MomMenu პაკეტი წარმატებით გააქტიურდა.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ea;border-radius:12px;margin:0 0 24px;"><tr><td style="padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:5px 0;font-size:14px;color:#888;">პაკეტი</td><td style="padding:5px 0;font-size:14px;font-weight:700;text-align:right;">{{planName}}</td></tr><tr><td style="padding:5px 0;font-size:14px;color:#888;">გადახდილი</td><td style="padding:5px 0;font-size:14px;font-weight:700;text-align:right;">{{amount}}</td></tr><tr><td style="padding:5px 0;font-size:14px;color:#888;">დაწყება</td><td style="padding:5px 0;font-size:14px;font-weight:700;text-align:right;">{{startDate}}</td></tr><tr><td style="padding:5px 0;font-size:14px;color:#888;">განახლება</td><td style="padding:5px 0;font-size:14px;font-weight:700;text-align:right;">{{endDate}}</td></tr></table></td></tr></table>
<p style="margin:0 0 4px;font-size:15px;line-height:1.7;">ახლა შეგიძლიათ სრულად ისარგებლოთ MomMenu-ს ყველა შესაძლებლობით. 🎉</p>
<div style="text-align:center;margin:28px 0;"><a href="https://mommenu.ge/dashboard" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">გეგმის ნახვა →</a></div>
<p style="margin:0;font-size:13px;color:#888;text-align:center;">გასაუქმებლად: <a href="mailto:info@mommenu.ge" style="color:#465940;">info@mommenu.ge</a></p>`,
  },

  password_reset: {
    subject: "MomMenu — პაროლის აღდგენის კოდი 🔐",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">პაროლის აღდგენა 🔐</h2>
<p style="margin:0 0 20px;font-size:15px;line-height:1.7;">მოითხოვეთ MomMenu ანგარიშის პაროლის აღდგენა. გამოიყენეთ ქვემოთ მოცემული კოდი:</p>
<div style="text-align:center;margin:28px 0;">
  <div style="display:inline-block;background:#f5f2ea;border-radius:16px;padding:20px 40px;">
    <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#465940;font-family:monospace;">{{code}}</div>
  </div>
</div>
<p style="margin:0 0 8px;font-size:13px;color:#888;text-align:center;">კოდი მოქმედებს <strong>5 წუთის</strong> განმავლობაში.</p>
<p style="margin:0;font-size:13px;color:#bbb;text-align:center;">თუ ეს მოთხოვნა თქვენი არ არის, უბრალოდ უგულებელყავით ეს მეილი.</p>`,
  },

  password_changed: {
    subject: "თქვენი MomMenu პაროლი შეიცვალა",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">პაროლი შეიცვალა ✔</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">გამარჯობა, <strong>{{name}}</strong>!</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">თქვენი MomMenu ანგარიშის პაროლი წარმატებით შეიცვალა.</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#c0392b;">⚠️ თუ ეს თქვენ არ გაგიკეთებიათ, დაუყოვნებლივ დაგვიკავშირდით: <a href="mailto:info@mommenu.ge" style="color:#465940;font-weight:bold;">info@mommenu.ge</a></p>
<div style="text-align:center;margin:28px 0;"><a href="https://mommenu.ge/dashboard" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">ანგარიშის ნახვა →</a></div>`,
  },

  subscription_expiring: {
    subject: "თქვენი MomMenu პაკეტი იწურება ⏰",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">პაკეტი იწურება ⏰</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">გამარჯობა, <strong>{{name}}</strong>!</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">შეგახსენებთ, რომ თქვენი MomMenu პაკეტი მალე გასდის. გააგრძელეთ გამოწერა, რათა არ შეგიწყდეთ წვდომა კვების გეგმებსა და რეცეპტებზე.</p>
<div style="text-align:center;margin:28px 0;"><a href="https://mommenu.ge/dashboard" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">გამოწერის განახლება →</a></div>`,
  },

  weekly_menu: {
    subject: "🗓 თქვენი კვირის კვების გეგმა მზადაა!",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">🗓 კვირის კვების გეგმა მზადაა!</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">გამარჯობა, <strong>{{name}}</strong>! ახალი კვირა დაიწყო და თქვენი ბავშვის კვების გეგმა განახლდა.</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.7;">შედით პირად კაბინეტში, რომ ნახოთ კვირის სრული მენიუ, რეცეპტები და საყიდლების სია.</p>
<div style="text-align:center;margin:28px 0;"><a href="https://mommenu.ge/dashboard" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">კვების გეგმის ნახვა →</a></div>`,
  },

  email_verify: {
    subject: "MomMenu — დაადასტურეთ თქვენი ელფოსტა 📧",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">გამარჯობა, {{name}}! 👋</h2>
<p style="margin:0 0 20px;font-size:15px;line-height:1.7;">გმადლობთ MomMenu-ში რეგისტრაციისთვის! გამოიყენეთ ქვემოთ მოცემული კოდი ელფოსტის დასადასტურებლად:</p>
<div style="text-align:center;margin:28px 0;">
  <div style="display:inline-block;background:#f5f2ea;border-radius:16px;padding:20px 40px;">
    <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#465940;font-family:monospace;">{{code}}</div>
  </div>
</div>
<p style="margin:0 0 8px;font-size:13px;color:#888;text-align:center;">კოდი მოქმედებს <strong>15 წუთის</strong> განმავლობაში.</p>
<p style="margin:0;font-size:13px;color:#bbb;text-align:center;">თუ ეს მოთხოვნა თქვენი არ არის, უბრალოდ უგულებელყავით ეს მეილი.</p>`,
  },

  email_change: {
    subject: "MomMenu — დაადასტურეთ ახალი ელფოსტა 📧",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">გამარჯობა, {{name}}! 👋</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">მიღებულია მოთხოვნა თქვენი MomMenu ანგარიშის ელფოსტის ამ მისამართზე შესაცვლელად. დასადასტურებლად დააჭირეთ ღილაკს — შეცვლა ძალაში შევა მხოლოდ დადასტურების შემდეგ.</p>
<div style="text-align:center;margin:28px 0;"><a href="{{link}}" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">ელფოსტის დადასტურება →</a></div>
<p style="margin:0;font-size:13px;color:#888;text-align:center;">თუ ეს მოთხოვნა თქვენი არ არის, უბრალოდ უგულებელყავით ეს მეილი — თქვენი ძველი ელფოსტა უცვლელი დარჩება.</p>`,
  },

  new_blog: {
    subject: "📝 MomMenu-ზე ახალი სტატია გამოქვეყნდა",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">📝 ახალი სტატია გამოქვეყნდა</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">გამარჯობა, <strong>{{name}}</strong>!</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">MomMenu-ზე გამოქვეყნდა ახალი სტატია: <strong>{{blogTitle}}</strong></p>
<div style="text-align:center;margin:28px 0;"><a href="{{blogUrl}}" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">სტატიის წაკითხვა →</a></div>`,
  },
};

// ─── DB template fetcher with hardcoded fallback ──────────────────────────────

async function getTemplate(key: string): Promise<{ subject: string; body: string }> {
  try {
    const t = await prisma.emailTemplate.findUnique({ where: { key } });
    if (t?.subjectKa && t?.bodyKa) return { subject: t.subjectKa, body: t.bodyKa };
  } catch {}
  return TEMPLATE_DEFAULTS[key] ?? { subject: key, body: "" };
}

// ─── Email Verification ───────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const { subject, body } = await getTemplate('email_verify');
  const html = layout(body.replace(/\{\{name\}\}/g, name).replace(/\{\{code\}\}/g, code));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Email Change Confirmation ────────────────────────────────────────────────

export async function sendEmailChangeConfirmation(to: string, name: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/confirm-email-change?token=${token}`;
  const { subject, body } = await getTemplate('email_change');
  const html = layout(body.replace(/\{\{name\}\}/g, name).replace(/\{\{link\}\}/g, link));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, body } = await getTemplate("welcome");
  const html = layout(body.replace(/\{\{name\}\}/g, name));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Subscription Confirmation ────────────────────────────────────────────────

export async function sendSubscriptionConfirmationEmail(
  to: string,
  name: string,
  planName: string,
  amount: number,
  startDate: Date,
  endDate: Date,
) {
  const { subject, body } = await getTemplate("subscription_confirmed");
  const html = layout(
    body
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{planName\}\}/g, planName)
      .replace(/\{\{amount\}\}/g, `${amount}₾`)
      .replace(/\{\{startDate\}\}/g, formatDateKa(startDate))
      .replace(/\{\{endDate\}\}/g, formatDateKa(endDate)),
  );
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, code: string) {
  const { subject, body } = await getTemplate("password_reset");
  const html = layout(body.replace(/\{\{code\}\}/g, code));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Password Changed Notification ───────────────────────────────────────────

export async function sendPasswordChangedEmail(to: string, name: string) {
  const { subject, body } = await getTemplate("password_changed");
  const html = layout(body.replace(/\{\{name\}\}/g, name));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Subscription Expiring ────────────────────────────────────────────────────

export async function sendSubscriptionExpiringEmail(to: string, name: string) {
  const { subject, body } = await getTemplate("subscription_expiring");
  const html = layout(body.replace(/\{\{name\}\}/g, name));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Weekly Menu ──────────────────────────────────────────────────────────────

export async function sendWeeklyMenuEmail(to: string, name: string) {
  const { subject, body } = await getTemplate("weekly_menu");
  const html = layout(body.replace(/\{\{name\}\}/g, name));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Admin: new user registered ────────────────────────────────────────────────
// Internal ops ping, not admin-editable content — no DB template, just a fixed layout.

export async function sendAdminNewUserNotification(name: string, email: string) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? "nutsarogava30@gmail.com";
  const html = layout(`<h2 style="margin:0 0 16px;font-size:20px;font-weight:800;">🆕 ახალი მომხმარებელი დარეგისტრირდა</h2>
<p style="margin:0 0 6px;font-size:15px;"><strong>სახელი:</strong> ${name}</p>
<p style="margin:0;font-size:15px;"><strong>ელფოსტა:</strong> ${email}</p>`);
  await resend.emails.send({ from: FROM, to, subject: `MomMenu — ახალი რეგისტრაცია: ${name}`, html }).catch(() => {});
}

// ─── New Blog ─────────────────────────────────────────────────────────────────

export async function sendNewBlogEmail(
  to: string,
  name: string,
  blogTitle: string,
  blogUrl: string,
) {
  const { subject, body } = await getTemplate("new_blog");
  const html = layout(
    body
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{blogTitle\}\}/g, blogTitle)
      .replace(/\{\{blogUrl\}\}/g, blogUrl),
  );
  await resend.emails.send({ from: FROM, to, subject, html });
}
