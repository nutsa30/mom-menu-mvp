import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'შეავსე ყველა ველი' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'ელ-ფოსტა არასწორია' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: 'MomMenu <info@mommenu.ge>',
      to: 'info@mommenu.ge',
      replyTo: email,
      subject: `📩 ახალი შეტყობინება — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#465940">
          <h2 style="background:#465940;color:#FDFBF0;padding:20px 24px;border-radius:12px 12px 0 0;margin:0">
            📩 ახალი შეტყობინება საიტიდან
          </h2>
          <div style="background:#FDFBF0;border:1px solid rgba(70,89,64,.15);border-top:none;border-radius:0 0 12px 12px;padding:24px">
            <p style="margin:0 0 8px"><strong>სახელი:</strong> ${name}</p>
            <p style="margin:0 0 8px"><strong>ელ-ფოსტა:</strong> <a href="mailto:${email}">${email}</a></p>
            <hr style="border:none;border-top:1px solid rgba(70,89,64,.12);margin:16px 0">
            <p style="margin:0 0 6px"><strong>შეტყობინება:</strong></p>
            <p style="margin:0;white-space:pre-wrap;line-height:1.7">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'გაგზავნა ვერ მოხერხდა' }, { status: 500 });
  }
}
