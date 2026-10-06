// Verify HS256 cookies in the Edge runtime without importing Node crypto.
export async function verifiedPayload(token: string | undefined, audience?: string): Promise<Record<string, any> | null> {
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const [head, body, signature, extra] = token.split('.');
    if (extra || !signature) return null;
    const decode = (value: string) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const header = JSON.parse(new TextDecoder().decode(decode(head)));
    if (header.alg !== 'HS256') return null;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(process.env.JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    if (!await crypto.subtle.verify('HMAC', key, decode(signature), new TextEncoder().encode(`${head}.${body}`))) return null;
    const payload = JSON.parse(new TextDecoder().decode(decode(body)));
    if (!payload.exp || payload.exp * 1000 <= Date.now() || (audience && payload.aud !== audience)) return null;
    return payload;
  } catch { return null; }
}
