import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseTab628Statistics } from '../src/providers/scbTab628.ts';
import { ValidationError } from '../src/domain/validation.ts';

function rejectsValidation(run, description, path = 'TAB628') {
  assert.throws(run, error => {
    assert.ok(error instanceof ValidationError, 'Förväntade ValidationError');
    assert.equal(error.path, path);
    assert.equal(error.message, `${path}: ${description}`);
    return true;
  });
}

const fixture = JSON.parse(readFileSync(new URL('./fixtures/scb-tab628.real.json', import.meta.url), 'utf8'));
const known = value => ({ status: 'known', value });
const source = {
  provider: 'SCB', dataset: 'TAB628', sourceUrl: fixture.source.url,
  license: known({ name: fixture.source.license, url: fixture.source.licenseUrl }),
  attribution: known([fixture.source.attribution]),
  referenceTime: known({ kind: 'year', year: 2025 }), retrievedAt: known(fixture.source.retrievedAt),
  sourceCrs: fixture.source.crs,
  geographicCoverage: known({ description: 'Tre kommuner i sparat provsvar', limitations: [
    'Gränsårgångens kompatibilitet är inte verifierad.',
    ...fixture.body.note,
  ] }),
};
const parse = (body = structuredClone(fixture.body), code = '0380') => parseTab628Statistics(body, code, source);

test('TAB628-källmetadata: fel leverantör eller dataset avvisas', () => {
  for (const patch of [{ provider: 'Annan källa' }, { dataset: 'TAB999' }]) {
    rejectsValidation(() => parseTab628Statistics(fixture.body, '0380', { ...source, ...patch }),
      'Källmetadata måste ange provider SCB och dataset TAB628.');
  }
});

test('TAB628-källmetadata: felaktig eller främmande käll-URL avvisas', () => {
  for (const sourceUrl of [
    'inte en URL', 'https://example.com/api/v2/tables/TAB628/data',
    'http://statistikdatabasen.scb.se/api/v2/tables/TAB628/data',
    'https://statistikdatabasen.scb.se/api/v2/tables/TAB999/data',
    'https://statistikdatabasen.scb.se.example.com/api/v2/tables/TAB628/data',
  ]) {
    rejectsValidation(() => parseTab628Statistics(fixture.body, '0380', { ...source, sourceUrl }),
      sourceUrl === 'inte en URL'
        ? 'Källmetadata måste ha en giltig SCB-URL för TAB628.'
        : 'Källmetadata måste hänvisa till SCB:s TAB628-dataendpoint.');
  }
});

test('TAB628-källmetadata: endast känt statistikår 2025 godtas, inte hämtningens år', () => {
  for (const referenceTime of [
    known({ kind: 'year', year: 2024 }), known({ kind: 'year', year: 2026 }),
    { status: 'unknown', reason: 'Året saknas' },
    known({ kind: 'date', date: '2025-12-31' }),
    known({ kind: 'period', start: '2025-01-01', end: '2025-12-31' }),
  ]) {
    rejectsValidation(() => parseTab628Statistics(fixture.body, '0380', { ...source, referenceTime }),
      'Källmetadata måste ange känt referensår 2025.');
  }
  const before = structuredClone(source);
  const result = parseTab628Statistics(fixture.body, '0380', source);
  assert.deepEqual(result.source.referenceTime, known({ kind: 'year', year: 2025 }));
  assert.equal(result.source.retrievedAt.value, fixture.source.retrievedAt);
  assert.deepEqual(source, before);
});

test('TAB628-adapter: tre kommuner mot sparat källsvar, datum och metadata', () => {
  const before = structuredClone(fixture.body);
  for (const [code, population, area, density] of [
    ['0380', 249726, 2193.84, 113.8], ['1280', 367924, 157.45, 2336.8], ['2584', 22402, 19307, 1.2],
  ]) {
    const result = parse(fixture.body, code);
    assert.equal(result.population.value.value, population);
    assert.equal(result.landArea.value.value, area);
    assert.equal(result.density.value.value, density);
    assert.ok(Math.abs(population / area - density) <= 0.05);
    assert.equal(result.population.referenceTime.value.date, '2025-12-31');
    assert.equal(result.landArea.referenceTime.value.date, '2026-01-01');
    assert.equal(result.divisionVintage.status, 'unknown');
    assert.deepEqual(result.source, source);
  }
  assert.deepEqual(fixture.body, before);
});

test('TAB628-adapter: ändrad dimensionsordning och måttindex läses korrekt', () => {
  const body = structuredClone(fixture.body);
  body.id = ['ContentsCode', 'Tid', 'Kon', 'Region'];
  body.size = [3, 1, 1, 3];
  body.dimension.ContentsCode.category.index = { BE0101U3: 0, BE0101U1: 1, BE0101U2: 2 };
  body.value = [2193.84, 157.45, 19307, 113.8, 2336.8, 1.2, 249726, 367924, 22402];
  assert.equal(parse(body).population.value.value, 249726);
  assert.equal(parse(body, '1280').landArea.value.value, 157.45);
});

test('TAB628-adapter: null blir saknat, noll förblir noll', () => {
  const body = structuredClone(fixture.body);
  body.value[1] = null;
  assert.equal(parse(body).population.value.status, 'missing');
  body.value[1] = 0;
  assert.deepEqual(parse(body).population.value, { status: 'available', value: 0 });
  for (const area of [0, null]) {
    body.value[2] = area;
    assert.equal(parse(body).density.value.status, 'missing');
  }
});

test('TAB628-adapter: okänd, felaktig och saknad kommunkod avvisas', () => {
  rejectsValidation(() => parse(undefined, '9999'), 'Okänd kommunkod i den lokala SCB-kodlistan.');
  rejectsValidation(() => parse(undefined, '380'),
    'kommunkod måste vara en sträng med exakt fyra siffror', 'municipalityCode');
  rejectsValidation(() => parse(undefined, '0114'), 'Kommunen saknas i SCB-svaret.');
});

test('TAB628-adapter: felaktiga värden, dubblettindex och ofullständighet avvisas', () => {
  for (const [mutate, description] of [
    [b => { b.value[2] = -1; }, 'Ogiltigt statistikvärde.'],
    [b => { b.value[2] = Infinity; }, 'Ogiltigt statistikvärde.'],
    [b => { b.value[1] = 1.5; }, 'Ogiltigt statistikvärde.'],
    [b => { b.value[0] = '113.8'; }, 'Ogiltigt statistikvärde.'],
    [b => { b.value.pop(); }, 'Ofullständigt värdeutdrag.'],
    [b => { delete b.value[1]; }, 'Ogiltigt statistikvärde.'],
    [b => { b.dimension.Region.category.index['1280'] = 0; }, 'Duplicerade eller ogiltiga kategoriindex.'],
    [b => { b.dimension.ContentsCode.category.index.BE0101U2 = 0; }, 'Duplicerade eller ogiltiga kategoriindex.'],
    [b => { b.id[1] = 'Region'; }, 'Felaktiga eller duplicerade dimensioner.'],
    [b => { b.status = { 0: 'x' }; }, 'Statusfält stöds ännu inte; inga statuskoder tolkas automatiskt.'],
    [b => { b.dimension.Tid.category.index = { '2024': 0 }; }, 'Förväntade totalt kön, år 2025 och de tre dokumenterade måtten.'],
    [b => { b.extension.px.tableid = 'OTHER'; }, 'Fel SCB-tabell.'],
  ]) {
    const body = structuredClone(fixture.body);
    mutate(body);
    rejectsValidation(() => parse(body), description);
  }
});
