import 'server-only';
import { headers } from 'next/headers';
import { marketDiagnostics } from './market-diagnostics';

export async function logRegistrationMarket(
  flow: 'email_pending' | 'email_verified' | 'google' | 'legacy_signup',
  selectedMarket: string,
  ids: { registrationId?: string; userId?: string },
) {
  try {
    console.info('[registration-market]', JSON.stringify({
      at: new Date().toISOString(), flow, ...ids,
      ...marketDiagnostics(await headers()), selectedMarket,
    }));
  } catch {
    // Diagnostics must never block signup. Do not log request headers or credentials.
  }
}
