import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchMunicipalityBoundary, parseMunicipalityBoundary } from '../src/providers/municipalityBoundary.ts';

// Syntetiskt kontraktsprov, inga återpublicerade kart-api-data.
const feature = () => ({
  type: 'Feature', properties: { kommunkod: '0380', kommunnamn: 'Testkommun', lanskod: '03' },
  attribution: ['Syntetisk testkälla'],
  geometry: { type: 'MultiPolygon', coordinates: [[[[17, 59], [18, 59], [18, 60], [17, 59]]]] },
});
test('bevarar kommunkod, geometri och attribution', () => {
  const result = parseMunicipalityBoundary(feature(), '0380');
  assert.equal(result.municipality.kommunkod, '0380');
  assert.deepEqual(result.municipality.attribution, ['Syntetisk testkälla']);
  assert.equal(result.geometry.type, 'MultiPolygon');
});
test('avvisar fel kommun, saknad attribution och ogiltig geometri', () => {
  assert.throws(() => parseMunicipalityBoundary(feature(), '0180'));
  const missing = feature(); delete missing.attribution;
  assert.throws(() => parseMunicipalityBoundary(missing, '0380'));
  const invalid = feature(); invalid.geometry.coordinates[0][0][0] = [500000, 6500000];
  assert.throws(() => parseMunicipalityBoundary(invalid, '0380'));
});

test('nätverksfel vid gränshämtning ger ett begripligt svenskt meddelande', async t => {
  const signal = new AbortController().signal;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.kart-api.se/v1/kommun/0380');
    assert.equal(options.signal, signal);
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(fetchMunicipalityBoundary('0380', signal), {
    message: 'Kommungränsen kunde inte hämtas. Kontrollera internetanslutningen och försök igen.',
  });
});

test('ogiltig JSON vid gränshämtning ger ett begripligt svenskt meddelande', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('{', { status: 200 }));
  await assert.rejects(fetchMunicipalityBoundary('0380', new AbortController().signal), {
    message: 'Svaret med kommungränsen kunde inte läsas. Försök igen senare.',
  });
});

test('avbruten gränshämtning behåller avbrottsfelet vid både anrop och läsning', async t => {
  for (const phase of ['fetch', 'json']) {
    const controller = new AbortController();
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    const abort = () => { controller.abort(); throw abortError; };
    t.mock.method(globalThis, 'fetch', phase === 'fetch' ? async () => abort()
      : async () => ({ ok: true, status: 200, json: async () => abort() }));
    await assert.rejects(fetchMunicipalityBoundary('0380', controller.signal), error => error === abortError);
    t.mock.restoreAll();
  }
});
