'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface BlogFields {
  titleKa: string;
  titleEn: string;
  contentKa: string;
  contentEn: string;
  imageUrl: string;
  images: string[];
  slug: string;
  isPublished: boolean;
}

export async function createBlog(data: BlogFields) {
  await requireAdmin();
  const blog = await prisma.blog.create({
    data: {
      titleKa: data.titleKa,
      titleEn: data.titleEn,
      contentKa: data.contentKa,
      contentEn: data.contentEn,
      imageUrl: data.imageUrl.trim() || null,
      images: data.images,
      slug: data.slug.trim() || null,
      isPublished: data.isPublished,
    },
  });
  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  return blog;
}

export async function updateBlog(id: string, data: BlogFields) {
  await requireAdmin();
  const blog = await prisma.blog.update({
    where: { id },
    data: {
      titleKa: data.titleKa,
      titleEn: data.titleEn,
      contentKa: data.contentKa,
      contentEn: data.contentEn,
      imageUrl: data.imageUrl.trim() || null,
      images: data.images,
      slug: data.slug.trim() || null,
      isPublished: data.isPublished,
    },
  });
  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
  return blog;
}

export async function deleteBlog(id: string) {
  await requireAdmin();
  await prisma.blog.delete({ where: { id } });
  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
}

export async function togglePublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.blog.update({ where: { id }, data: { isPublished } });
  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
}
