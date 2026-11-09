import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaceSearch } from '../src/state/placeSearch.ts';
import { groupPlacesByMunicipality } from '../src/domain/placeSearch.ts';
import { geocode } from '../src/providers/geocode.ts';

const hit = (code, name = 'Testplats') => ({ lat: 60, lon: 17, namn: name,
  tier: 'place', kalla: 'SYNTETISK', kommunkod: code });
const ready = (name = 'Testplats') => ({ status: 'ready',
  data: { query: name, antal: 1, results: [hit('0380', name)], attribution: ['SYNTETISK'] },
  completeness: { status: 'unknown', scope: 'Prov', reason: 'Begränsat' } });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('Platsgrupper: ledande nollor, flera namn i samma kommun och omatchade koder', () => {
  const hits = [hit('0380'), hit('0380'), hit('1280'), hit(null), hit('0001'), hit('0380', 'Annan plats')];
  const snapshot = structuredClone(hits);
  const groups = groupPlacesByMunicipality(hits);
  assert.deepEqual(groups.map(g => [g.code, g.count]), [['0380', 3], ['1280', 1], [null, 2]]);
  assert.equal(groups[0].municipalityName, 'Uppsala');
  assert.deepEqual(groups[0].places, ['Testplats', 'Annan plats']);
  assert.deepEqual(hits, snapshot);
  assert.deepEqual(groupPlacesByMunicipality([]), []);
});

test('Platsgrupper: fyra likadana namn i samma kommun behåller varje fullständig träff', () => {
  // Påhittade koordinater och metadata, inte sparade kart-api-svar eller CRS-belägg.
  const hits = Array.from({ length: 4 }, (_, index) => Object.freeze({
    ...hit('0115', 'Syntetisk Fridhem'), typ: 'bebyggelse', lanskod: '01',
    lat: 60 + index / 1000, lon: 17 + index / 1000, bbox: null,
  }));
  Object.freeze(hits);
  const groups = groupPlacesByMunicipality(hits);
  assert.equal(groups.length, 1);
  const group = groups[0];
  assert.equal(group.code, '0115');
  assert.equal(group.municipalityName, 'Vallentuna');
  assert.equal(group.count, 4);
  assert.equal(group.hits.length, 4);
  assert.deepEqual(group.hits, hits);
  assert.notEqual(group.hits, hits);
  // Den tidigare UI-sammanfattningen är oförändrad; endast modellen får alla poster.
  assert.deepEqual(group.places, ['Syntetisk Fridhem (bebyggelse)']);
});

test('Platsgrupper: även identiska poster bevaras utan härledda ID:n', () => {
  const hits = Array.from({ length: 4 }, () => Object.freeze(hit('0115', 'Syntetisk Fridhem')));
  const group = groupPlacesByMunicipality(hits)[0];
  assert.equal(group.hits.length, 4);
  assert.equal(group.count, 4);
  assert.deepEqual(group.hits, hits);
  for (let index = 0; index < hits.length; index++) {
    assert.equal(group.hits[index], hits[index]);
    assert.deepEqual(Object.keys(group.hits[index]), Object.keys(hits[index]));
  }
  assert.notEqual(group.hits[0], group.hits[1]);
});

test('Platsökning: uttrycklig sökning, trimning och frivilligt kommunfilter', async () => {
  let calls = 0;
  const state = createPlaceSearch(async (input, signal) => {
    calls++;
    assert.deepEqual(input, { q: 'Å & Ö', limit: 20, kommunkod: '0380' });
    assert.equal(signal.aborted, false);
    return ready();
  });
  assert.equal(state.getState().status, 'idle');
  await state.submit('  ');
  assert.equal(state.getState().status, 'error');
  assert.equal(calls, 0);
  await state.submit(' Å & Ö ', '0380');
  assert.equal(calls, 1);
  assert.equal(state.getState().status, 'ready');
});

test('Platsökning: nytt anrop avbryter föregående; sent svar kan inte ersätta det nya', async () => {
  const first = deferred();
  let firstSignal;
  const state = createPlaceSearch((input, signal) => {
    if (input.q === 'Första') { firstSignal = signal; return first.promise; }
    return Promise.resolve(ready('Andra'));
  });
  const old = state.submit('Första');
  assert.equal(state.getState().status, 'loading');
  await state.submit('Andra');
  assert.equal(firstSignal.aborted, true);
  first.resolve(ready('Första'));
  await old;
  assert.equal(state.getState().data.query, 'Andra');
});

test('Platsökning: rensning vid ändrad fråga stoppar även sent fel', async () => {
  const late = deferred();
  let signal;
  const state = createPlaceSearch((_input, s) => { signal = s; return late.promise; });
  const pending = state.submit('Första');
  state.clear();
  assert.equal(signal.aborted, true);
  late.reject(new Error('Sent fel'));
  await pending;
  assert.equal(state.getState().status, 'idle');
});

test('Platsökning: tomt och HTTP-fel behålls som olika tillstånd med attribution', async () => {
  const empty = { status: 'empty', data: { ...ready().data, antal: 0, results: [] },
    completeness: ready().completeness, sources: [], reason: 'Inga träffar i svaret.' };
  const error = { status: 'error', error: { kind: 'http', httpStatus: 429, message: 'Vänta.' } };
  for (const result of [empty, error]) {
    const state = createPlaceSearch(async () => result);
    await state.submit('Prov');
    assert.deepEqual(state.getState(), result);
  }
});

test('Geocode: AbortSignal når fetch och 429 ger användbart meddelande', async () => {
  const controller = new AbortController();
  const result = await geocode({ q: 'Prov' }, async (_url, options) => {
    assert.equal(options.signal, controller.signal);
    return new Response('', { status: 429 });
  }, controller.signal);
  assert.equal(result.error.httpStatus, 429);
  assert.match(result.error.message, /Vänta/);
});
