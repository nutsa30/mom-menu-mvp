const assert = require('node:assert/strict');
const origin = 'http://localhost:3001';

async function review(email, locale) {
  const login = await fetch(origin + '/api/auth/login', {
    method: 'POST', headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'Review-only-2026!' }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
  const headers = { origin, cookie, 'content-type': 'application/json' };
  const preference = await fetch(origin + '/api/preferences', {
    method: 'POST', headers, body: JSON.stringify({ locale, units: 'metric' }),
  });
  assert.equal(preference.status, 200);
  const me = await (await fetch(origin + '/api/auth/me', { headers })).json();
  const children = await (await fetch(origin + '/api/children?userId=' + me.id, { headers })).json();
  const child = children.find(c => c.name === 'Alex');
  assert(child);
  const result = await fetch(origin + '/api/shopping-list?childId=' + child.id + '&lang=' + locale, { headers });
  assert.equal(result.status, 200);
  const { ingredients } = await result.json();
  assert(ingredients.length > 0);
  const names = ingredients.map(i => i.display.toLowerCase());
  assert.equal(new Set(names).size, names.length);
  for (const { display, amount } of ingredients) {
    assert(!/^(water|წყალი)$/i.test(display), display);
    assert(!/^(egg yolks?|egg whites?|კვერცხის გული|კვერცხის ცილა)$/i.test(display), display);
    assert(!/(მოხარშული|შემწვარი|გაფცქვნილი|გამომცხვარი|მოთუშული|\b(?:cooked|boiled|fried|roasted|peeled|baked)\b)/i.test(display), display);
    if (locale === 'en') assert(!/[\u10a0-\u10ff]/i.test(display + amount), display + amount);
  }
  console.log(`PASS: ${locale} shopping API returns ${ingredients.length} unique ingredient names without preparation labels`);
}

(async () => {
  await review('parent@review.local', 'en');
  await review('georgian@review.local', 'ka');
})().catch(error => { console.error(error); process.exitCode = 1; });
