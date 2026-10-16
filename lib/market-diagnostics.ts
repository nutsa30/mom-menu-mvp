import { marketForCountry } from './market';

function country(value: string | null) {
  return value && /^[A-Z]{2}$/.test(value) && value !== 'XX' && value !== 'ZZ' ? value : null;
}

// Diagnostic only: Cloudflare headers are not used to authorize a market change.
export function marketDiagnostics(requestHeaders: Pick<Headers, 'get'>) {
  const vercelCountry = country(requestHeaders.get('x-vercel-ip-country'));
  const cloudflareCountry = country(requestHeaders.get('cf-ipcountry'));
  return {
    vercelCountry,
    cloudflareCountry,
    countriesDisagree: Boolean(vercelCountry && cloudflareCountry && vercelCountry !== cloudflareCountry),
    geoMarket: marketForCountry(vercelCountry),
    cloudflarePresent: Boolean(requestHeaders.get('cf-ray')),
  };
}
