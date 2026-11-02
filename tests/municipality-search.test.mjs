import { test } from 'node:test';
import assert from 'node:assert/strict';
import { municipalityDirectory, municipalityDirectorySource } from '../src/data/municipalities.ts';
import { searchMunicipalities } from '../src/domain/municipalitySearch.ts';

test('lokalt SCB-register: 290 unika fyrsiffriga koder, namn och proveniens', () => {
  assert.equal(municipalityDirectory.length, 290);
  assert.equal(new Set(municipalityDirectory.map(m => m.code)).size, 290);
  assert.ok(municipalityDirectory.every(m => /^\d{4}$/.test(m.code) && m.name.trim()));
  assert.equal(municipalityDirectorySource.sourceUrl,
    'https://statistikdatabasen.scb.se/api/v2/codeLists/vs_RegionKommun07EjAggr?lang=sv');
  assert.equal(municipalityDirectorySource.checkedOn, '2026-11-02');
  assert.ok(Number.isFinite(Date.parse(municipalityDirectorySource.retrievedAt)));
  assert.equal(municipalityDirectorySource.license.name, 'CC0-1.0');
  assert.equal(municipalityDirectorySource.attribution, 'Källa: SCB');
  assert.equal(municipalityDirectorySource.provider, 'Statistiska centralbyrån (SCB)');
});

test('0380 väljer Uppsala och behåller inledande nolla', () => {
  assert.deepEqual(searchMunicipalities('0380'), [{ code: '0380', name: 'Uppsala' }]);
  assert.deepEqual(searchMunicipalities(' 0380 '), [{ code: '0380', name: 'Uppsala' }]);
  for (const query of ['380', '03', '00380', '9999']) assert.deepEqual(searchMunicipalities(query), []);
});

test('namnsökning ignorerar skiftläge och omgivande blanksteg', () => {
  assert.deepEqual(searchMunicipalities('  uPpSaLa  '), [{ code: '0380', name: 'Uppsala' }]);
});

for (const [query, expected] of [
  ['LULEÅ', { code: '2580', name: 'Luleå' }],
  ['ÄLMHULT', { code: '0765', name: 'Älmhult' }],
  ['ÖREBRO', { code: '1880', name: 'Örebro' }],
]) {
  test(`svenska bokstäver bevaras: ${query}`, () => {
    assert.deepEqual(searchMunicipalities(query), [expected]);
  });
}

test('Unicode i uppdelad form matchar samma svenska namn', () => {
  assert.deepEqual(searchMunicipalities('Lulea\u030a'), [{ code: '2580', name: 'Luleå' }]);
  assert.deepEqual(searchMunicipalities('A\u0308lmhult'), [{ code: '0765', name: 'Älmhult' }]);
  assert.deepEqual(searchMunicipalities('O\u0308rebro'), [{ code: '1880', name: 'Örebro' }]);
  assert.deepEqual(searchMunicipalities('Lulea'), []);
});

test('delnamn ger flera träffar i svensk namnordning utan automatiskt val', () => {
  assert.deepEqual(searchMunicipalities('upp'), [
    { code: '0380', name: 'Uppsala' },
    { code: '0114', name: 'Upplands Väsby' },
    { code: '0139', name: 'Upplands-Bro' },
    { code: '0760', name: 'Uppvidinge' },
  ].sort((a, b) => a.name.localeCompare(b.name, 'sv-SE')));
});

test('tom fråga eller ingen träff ger tom lista', () => {
  for (const query of ['', '   ', 'zzzxqvnonexistent', '0380 Uppsala']) {
    assert.deepEqual(searchMunicipalities(query), []);
  }
});

test('ett ändrat sökresultat påverkar inte framtida sökningar', () => {
  const result = searchMunicipalities('0380');
  result[0].name = 'Ändrat'; result.pop();
  assert.deepEqual(searchMunicipalities('0380'), [{ code: '0380', name: 'Uppsala' }]);
});
