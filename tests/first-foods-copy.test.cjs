const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
function load(relative, mocks = {}) {
  const filename = path.join(root, relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(id => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id === './ui-en.json') return require('../lib/ui-en.json');
    return require(id);
  }, module, module.exports);
  return module.exports;
}
const { translateCopy } = load('lib/ui-copy.ts');
const ingredients = ['vegetable', 'fruit', 'protein', 'dairy', 'grain', 'allergen'].map((category, index) => ({
  id: 'fixture-' + index, nameKa: 'პროდუქტი', nameEn: 'Food', category,
  minAgeMonths: 6, isAllergen: category === 'allergen',
  status: index < 2 ? { id: 'status-' + index, tried: true, allergic: index === 0, liked: index === 1, comment: '' } : null,
}));

function render(locale, { full = true, blw = false, category = 'all', openCards = false } = {}) {
  let hook = 0;
  const states = [ingredients, false, category, blw];
  const react = { ...React,
    useState(initial) {
      const index = hook++;
      const value = index < states.length ? states[index]
        : openCards && (index - states.length) % 5 === 0 ? true
        : typeof initial === 'function' ? initial() : initial;
      return [value, () => {}];
    },
    useEffect() {}, useCallback(fn) { return fn; }, useRef() { return { current: null }; },
  };
  const experience = { useExperience: () => ({ locale }) };
  const copy = load('components/Copy.tsx', {
    './ExperienceProvider': experience, '@/lib/ui-copy': { translateCopy },
  });
  const component = load('components/FirstFoodsTab.tsx', {
    react, './ExperienceProvider': experience, '@/components/Copy': copy,
    '@/lib/content': { localizedField: (item, field, language) => item[field + (language === 'en' ? 'En' : 'Ka')] },
  }).default;
  const birthDate = new Date(); birthDate.setMonth(birthDate.getMonth() - 8);
  return renderToStaticMarkup(component({ child: { id: 'review-child', name: 'Review child', birthDate }, isFullPlan: full }));
}

test('first foods renders translated labels and evaluated controls in both languages', () => {
  for (const locale of ['ka', 'en']) {
    for (const blw of [false, true]) for (const openCards of [false, true]) {
      const html = render(locale, { blw, openCards });
      assert.doesNotMatch(html, /CATEGORY_LABELS|blwMode|cat ===|\{&quot;|<Copy>/);
      assert.ok(html.includes(locale === 'en' ? 'First foods' : 'პირველი საკვები'));
      assert.ok(html.includes(locale === 'en' ? 'Vegetables' : 'ბოსტნეული'));
      assert.ok(html.includes(translateCopy(blw ? 'ჩართულია — ნაჭრებად, პიურეს გარეშე' : 'გამორთულია — პიურე რეჟიმი', locale)));
      if (locale === 'en') assert.doesNotMatch(html, /[\u10a0-\u10ff]/);
    }
    const locked = render(locale, { full: false });
    assert.ok(locked.includes(translateCopy('პირველი საკვები დაბლოკილია', locale)));
    assert.doesNotMatch(locked, /\{&quot;/);
    const filtered = render(locale, { category: 'fruit' });
    assert.equal((filtered.match(/>Food<|>პროდუქტი</g) || []).length, 1);
  }
});

test('authored UI does not wrap executable JSX in translated string literals', () => {
  const failures = [];
  function visitDirectory(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) { visitDirectory(filename); continue; }
      if (!filename.endsWith('.tsx')) continue;
      const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function visit(node) {
        if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)
          && /^\{[\s\S]*\}$/.test(node.expression.text)) {
          failures.push(path.relative(root, filename) + ':' + (source.getLineAndCharacterOfPosition(node.pos).line + 1));
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  visitDirectory(path.join(root, 'app'));
  visitDirectory(path.join(root, 'components'));
  assert.deepEqual(failures, []);
});
