import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMunicipalityBoundary } from '../src/providers/municipalityBoundary.ts';

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
