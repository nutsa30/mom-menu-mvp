import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendNewBlogEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blogId } = await req.json();
  if (!blogId) return NextResponse.json({ error: "blogId required" }, { status: 400 });

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

  const blogUrl = `https://mommenu.ge/blog/${blog.slug ?? blog.id}`;
  const blogTitle = blog.titleKa;

  const users = await prisma.user.findMany({
    select: { email: true, name: true, locale: true },
  });

  let sent = 0;
  let failed = 0;
  for (const user of users) {
    try {
      const english = user.locale === 'en';
      if (english && (!blog.titleEn?.trim() || /[\u10A0-\u10FF]/.test(blog.titleEn))) { failed++; continue; }
      await sendNewBlogEmail(user.email, user.name, english ? blog.titleEn : blogTitle, blogUrl + (english ? '?lang=en' : '?lang=ka'));
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: users.length });
}
