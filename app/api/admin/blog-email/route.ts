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
    select: { email: true, name: true },
  });

  let sent = 0;
  let failed = 0;
  for (const user of users) {
    try {
      await sendNewBlogEmail(user.email, user.name, blogTitle, blogUrl);
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: users.length });
}
