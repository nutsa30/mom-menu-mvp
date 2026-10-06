const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function offlineWorker(partition, stored) {
  const context = {
    URL, Response,
    self: { location: { origin: 'https://mommenu.example' }, addEventListener() {} },
    fetch: async () => { throw new Error('offline'); },
    caches: { open: async name => ({ match: async request => {
      if (name === 'mommenu-pages-v7-international' && request === '/__mommenu_offline_context') return new Response(partition);
      const value = stored[name]?.[typeof request === 'string' ? request : request.url];
      return value ? new Response(value, { headers: { 'Content-Type': 'text/html' } }) : undefined;
    } }) },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf8'), context);
  return context;
}
test('offline explicit language selects the same account and market language cache', async () => {
  const url = 'https://mommenu.example/dashboard?lang=ka';
  const worker = offlineWorker('parent-INTL-en', {
    'mommenu-pages-v7-international-parent-INTL-ka': { [url]: 'ქართული სატესტო გვერდი' },
    'mommenu-pages-v7-international-other-GE-ka': { [url]: 'wrong account' },
  });
  const response = await worker.networkFirst({ url }, 'mommenu-pages-v7-international');
  assert.equal(await response.text(), 'ქართული სატესტო გვერდი');
});
test('offline language changes show the chosen offline screen if no matching snapshot exists', async () => {
  const worker = offlineWorker('parent-INTL-en', {});
  const georgian = await worker.networkFirst({ url: 'https://mommenu.example/dashboard?lang=ka' }, 'mommenu-pages-v7-international');
  assert.equal(georgian.status, 503);
  assert.match(await georgian.text(), /<html lang="ka">/);
  const english = await worker.networkFirst({ url: 'https://mommenu.example/dashboard?lang=en' }, 'mommenu-pages-v7-international');
  assert.match(await english.text(), /<html lang="en">/);
});
