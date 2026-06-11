'use client';

import { useEffect } from 'react';
import { ga } from '@/lib/gtag';

export default function BlogViewTracker({ title }: { title: string }) {
  useEffect(() => {
    ga.viewBlog(title);
  }, [title]);
  return null;
}
