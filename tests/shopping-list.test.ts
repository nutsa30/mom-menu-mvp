import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateIngredients, normalizeName, expandParenthetical } from '../lib/shopping-list';

const aggregate = (rows: string[]) => aggregateIngredients(rows, new Map(), 'AUTUMN');

test('Georgian preparation and chicken names produce one item with the total quantity', () => {
  assert.deepEqual(aggregate([
    'ქათამი - 100 გ', 'შემწვარი ქათმის ფილე — 50გ',
    'მოხარშული ქათმის ხორცი - 0.2 კგ', 'ქათმის უძვლო ხორცი - 25 გ',
    'ორთქლზე კარგად მოხარშული ქათმის მკერდი - 25 გ',
  ]), [{ display: 'ქათამი', amount: '400 გ' }]);
});

test('English preparation, casing and chicken cuts merge without losing quantities', () => {
  assert.deepEqual(aggregate([
    'Chicken - 100 g', 'Fried chicken fillet — 50g', 'BOILED CHICKEN MEAT - 0.2 kg',
    'Boneless chicken breast - 25 grams', 'well-cooked chicken breast - 25 g',
  ]), [{ display: 'Chicken', amount: '400 გ' }]);
});

test('catalog synonyms and stacked preparation words are canonical in both languages', () => {
  const groups = [
    ['ორაგული', 'ორაგულის ფილე', 'გამომცხვარი ორაგულის ფილე'],
    ['Egg', 'eggs', 'whole eggs', 'egg yolks', 'egg whites'],
    ['Chicken', 'chicken fillets', 'chicken breasts', 'whole chicken'],
    ['Salmon', 'salmon fillet', 'roasted salmon fillets'],
    ['შვრია', 'შვრიის ფანტელი', 'შვრიის ფქვილი'],
    ['oats', 'oat flakes', 'rolled oats', 'oat flour'],
    ['მაკარონი', 'მოხარშული საბავშვო მაკარონი', 'პატარა ზომის მშრალი მაკარონი'],
    ['pasta', 'cooked baby pasta', 'small dry pasta'],
    ['პომიდორი', 'პომიდვრი', 'ტომატი', 'დაქუცმაცებული პომიდორი მარილისა და შაქრის გარეშე'],
    ['tomato', 'crushed tomatoes with no added salt or sugar'],
    ['მსხალი', 'გაფცქვნილი მწიფე მსხალი'], ['pear', 'peeled ripe pear'],
    ['carrot', 'carrots', 'steamed carrots'],
  ];
  for (const group of groups) {
    assert.equal(new Set(group.map(normalizeName)).size, 1, group.join(' / '));
    assert.equal(aggregate(group).length, 1);
  }
});

test('different products stay separate, including allergens and meaningful varieties', () => {
  const names = ['Butter', 'Peanut butter', 'Milk', 'Yogurt', 'Greek yogurt',
    'Lentils', 'Red lentils', 'Beans', 'White beans', 'Egg'];
  assert.equal(aggregate(names).length, names.length);
});

test('egg parts become eggs to buy in both languages while counts add up', () => {
  assert.deepEqual(aggregate(['Egg - 2 pcs', 'egg yolk - 1 large yolk', 'egg whites - 2 pcs']),
    [{ display: 'Egg', amount: '5 ც' }]);
  assert.deepEqual(aggregate(['კვერცხი - 2 ცალი', 'კვერცხის გული - 1 ცალი', 'კვერცხის ცილა - 2 ცალი']),
    [{ display: 'კვერცხი', amount: '5 ც' }]);
});

test('water is excluded in both languages, including prepared water, while milk remains', () => {
  assert.deepEqual(aggregate(['Water - 100 ml', 'boiled water - 200 ml', 'water-as needed',
    'წყალი - 100 მლ', 'მოხარშული წყალი - 200 მლ', 'წყალი - საჭიროებისამებრ',
    'Water or milk - 50 ml', 'წყალი ან რძე - 50 მლ']), [
    { display: 'Milk', amount: '50 მლ' }, { display: 'რძე', amount: '50 მლ' },
  ].sort((a, b) => a.display.localeCompare(b.display, 'ka')));
});

test('oat and fruit preparations become grocery ingredients without duplicated names or invented weights', () => {
  assert.deepEqual(aggregate(['Oats - 50 g', 'Cooked oats - 20 g',
    'Oats with banana - 120 g', 'Banana - 1 pcs']), [
    { display: 'Banana', amount: '1 ც' }, { display: 'Oats', amount: '70 გ' },
  ]);
  const ge = aggregate(['შვრია - 50 გ', 'მოხარშული შვრია - 20 გ',
    'შვრია ბანანით - 120 გ', 'ბანანი - 1 ცალი']);
  assert.deepEqual(ge, [
    { display: 'ბანანი', amount: '1 ც' }, { display: 'შვრია', amount: '70 გ' },
  ]);
});

test('weight and volume remain separate, ranges, fractions and metric units aggregate', () => {
  assert.deepEqual(aggregate(['Milk - 1 l', 'milk — 50 ml', 'milk - 10 g']),
    [{ display: 'Milk', amount: '1050 მლ + 10 გ' }]);
  assert.deepEqual(aggregate(['Carrot-30g', 'steamed carrot — 40–60 g']),
    [{ display: 'Carrot', amount: '80 გ' }]);
  assert.deepEqual(aggregate(['cinnamon-¼ tsp', 'cinnamon - ¼ teaspoon']),
    [{ display: 'Cinnamon', amount: '½ ჩ.კ' }]);
  assert.deepEqual(aggregate(['დარიჩინი - ¼ ჩაის კოვზი', 'დარიჩინი - მცირე რაოდენობა']),
    [{ display: 'დარიჩინი', amount: '¼ ჩ.კ' }]);
  assert.deepEqual(aggregate(['Bread - 1½ slices', 'bread - 1 slice']),
    [{ display: 'Bread', amount: '2½ ნაჭერი' }]);
});

test('the API expansion combines vegetable lists with individual ingredient entries', () => {
  assert.deepEqual(aggregate([
    'Vegetables (carrot, zucchini) - 60 g', 'cooked carrot — 30 g', 'zucchini - 20 g',
  ].flatMap(expandParenthetical)), [
    { display: 'Carrot', amount: '30 გ' }, { display: 'Zucchini', amount: '20 გ' },
  ]);
});

test('percentage product labels, optional ingredients and standalone notes parse safely', () => {
  const rows = aggregate(['100% sesame tahini — 10 g', 'Vanilla-optional',
    'vanilla', 'a very small amount.', 'ძალიან მცირე რაოდენობით.']);
  assert.deepEqual(rows, [
    { display: 'Sesame tahini', amount: '10 გ' },
    { display: 'Vanilla', amount: '' },
  ]);
});
