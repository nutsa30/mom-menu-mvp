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
    subject: "MomMenu — პაროლის აღდგენა 🔐",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">პაროლის აღდგენა 🔐</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">მიიღეთ პაროლის აღდგენის მოთხოვნა თქვენი MomMenu ანგარიშისთვის.</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.7;">დააჭირეთ ღილაკს ახალი პაროლის დასაყენებლად. ბმული მოქმედებს <strong>30 წუთის</strong> განმავლობაში.</p>
<div style="text-align:center;margin:28px 0;"><a href="{{resetUrl}}" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">პაროლის შეცვლა →</a></div>
<p style="margin:0 0 8px;font-size:13px;color:#888;text-align:center;">თუ ეს მოთხოვნა თქვენი არ არის, უბრალოდ უგულებელყავით ეს მეილი.</p>
<p style="margin:0;font-size:12px;color:#bbb;text-align:center;word-break:break-all;">{{resetUrl}}</p>`,
  },

  password_changed: {
    subject: "თქვენი MomMenu პაროლი შეიცვალა",
    body: `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">პაროლი შეიცვალა ✔</h2>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">გამარჯობა, <strong>{{name}}</strong>!</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.7;">თქვენი MomMenu ანგარიშის პაროლი წარმატებით შეიცვალა.</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#c0392b;">⚠️ თუ ეს თქვენ არ გაგიკეთებიათ, დაუყოვნებლივ დაგვიკავშირდით: <a href="mailto:info@mommenu.ge" style="color:#465940;font-weight:bold;">info@mommenu.ge</a></p>
<div style="text-align:center;margin:28px 0;"><a href="https://mommenu.ge/dashboard" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;font-family:Arial,sans-serif;">ანგარიშის ნახვა →</a></div>`,
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

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { subject, body } = await getTemplate("password_reset");
  const html = layout(body.replace(/\{\{resetUrl\}\}/g, resetUrl));
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Password Changed Notification ───────────────────────────────────────────

export async function sendPasswordChangedEmail(to: string, name: string) {
  const { subject, body } = await getTemplate("password_changed");
  const html = layout(body.replace(/\{\{name\}\}/g, name));
  await resend.emails.send({ from: FROM, to, subject, html });
}
