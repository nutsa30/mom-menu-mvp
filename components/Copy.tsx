'use client';
import type { ReactNode } from 'react';
import { useExperience } from './ExperienceProvider';
import { translateCopy } from '@/lib/ui-copy';

export function useCopy() {
  const { locale } = useExperience();
  return (text: string) => translateCopy(text, locale);
}

/** Translate authored UI copy only. Callers keep names and canonical food IDs intact. */
export default function Copy({ children }: { children: ReactNode }) {
  const copy = useCopy();
  return <>{typeof children === 'string' ? copy(children) : children}</>;
}
