'use client';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Currency, Locale, Market, Units } from '@/lib/market';

export type Experience = { market: Market; currency: Currency; locale: Locale; units: Units; timeZone: string; preview: Market | null; isAdmin: boolean };
const Context = createContext<Experience>({ market: 'GE', currency: 'GEL', locale: 'ka', units: 'metric', timeZone: 'Asia/Tbilisi', preview: null, isAdmin: false });
export function useExperience() { return useContext(Context); }
export default function ExperienceProvider({ value, children }: { value: Experience; children: ReactNode }) {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (value.market === 'INTL' && timeZone && timeZone !== value.timeZone && !value.preview) {
      fetch('/api/preferences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timeZone }) }).catch(() => {});
    }
  }, [value.market, value.timeZone, value.preview]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
