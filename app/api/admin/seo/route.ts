import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

async function adminGuard() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seo = await prisma.seoSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", googleVerification: "", gaId: "", gtmId: "" },
    update: {},
  });

  const [publishedBlogs, totalBlogs] = await Promise.all([
    prisma.blog.count({ where: { isPublished: true } }),
    prisma.blog.count(),
  ]);

  return NextResponse.json({ seo, stats: { publishedBlogs, totalBlogs } });
}

export async function PUT(req: Request) {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { googleVerification, gaId, gtmId } = await req.json();

  const seo = await prisma.seoSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", googleVerification: googleVerification ?? "", gaId: gaId ?? "", gtmId: gtmId ?? "" },
    update: { googleVerification: googleVerification ?? "", gaId: gaId ?? "", gtmId: gtmId ?? "" },
  });

  return NextResponse.json(seo);
}
