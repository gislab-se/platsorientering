import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAreaSelection } from '../src/state/areaSelection.ts';
import { parseMunicipalityBoundary } from '../src/providers/municipalityBoundary.ts';
import { parseAreaOfInterest } from '../src/domain/validation.ts';

// Syntetiska svar; inga liveanrop eller återpublicerade kart-api-geometrier.
const boundary = (code, name = `Test ${code}`) => parseMunicipalityBoundary({
  type: 'Feature', properties: { kommunkod: code, kommunnamn: name, lanskod: '03' },
  attribution: ['Syntetisk polygonkälla'],
  geometry: { type: 'Polygon', coordinates: [[[17, 59], [18, 59], [18, 60], [17, 59]]] },
}, code);
const readyLookup = code => ({ status: 'ready', data: {
  ...boundary(code).municipality, attribution: ['Syntetisk uppslagskälla'],
}, completeness: { status: 'complete', scope: 'syntetiskt prov' } });
const emptyLookup = () => ({ status: 'empty', reason: 'Ingen träff', sources: [],
  completeness: { status: 'unknown', scope: 'syntetiskt prov', reason: 'test' } });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const create = (overrides = {}) => createAreaSelection({
  lookup: async () => readyLookup('0380'),
  boundary: async code => boundary(code), ...overrides,
});

test('gemensamt kommunval bevarar 0380, validerad geometri, källa och okänd årgång', async () => {
  const store = create();
  const states = [];
  store.subscribe(state => states.push(state));
  await store.selectMunicipality('0380');
  assert.deepEqual(states.map(s => s.status), ['idle', 'loading', 'ready']);
  const { area } = store.getState();
  assert.equal(area.selection.municipalityCode, '0380');
  assert.equal(area.id, 'municipality:0380');
  assert.equal(area.geometryVintage.status, 'unknown');
  assert.equal(area.geometrySource.referenceTime.status, 'unknown');
  assert.equal(area.geometrySource.sourceUrl, 'https://api.kart-api.se/v1/kommun/0380');
  assert.deepEqual(parseAreaOfInterest(area, area.geometrySource.sourceCrs), area);
});

test('kodval och kartklick uppdaterar samma valkanal och bevarar attribution', async () => {
  const store = create({ lookup: async point => {
    assert.deepEqual(point, { lat: 59, lon: 18 });
    return readyLookup('0180');
  } });
  await store.selectMunicipality('0380');
  await store.selectMunicipality({ lat: 59, lon: 18 });
  const { area } = store.getState();
  assert.equal(area.selection.municipalityCode, '0180');
  assert.deepEqual(area.geometrySource.attribution.value,
    ['Syntetisk uppslagskälla', 'Syntetisk polygonkälla']);
});

test('nytt val tar omedelbart bort föregående område medan svaret väntar', async () => {
  const wait = deferred();
  const store = create({ boundary: code => code === '0380' ? Promise.resolve(boundary(code)) : wait.promise });
  await store.selectMunicipality('0380');
  const next = store.selectMunicipality('0180');
  assert.deepEqual(store.getState(), { status: 'loading' });
  wait.resolve(boundary('0180'));
  await next;
  assert.equal(store.getState().area.selection.municipalityCode, '0180');
});

test('tomt kartuppslag tömmer tidigare område och hämtar ingen ny polygon', async () => {
  const calls = [];
  const store = create({ lookup: async () => emptyLookup(), boundary: async code => {
    calls.push(code); return boundary(code);
  } });
  await store.selectMunicipality('0380');
  await store.selectMunicipality({ lat: 0, lon: 0 });
  assert.equal(store.getState().status, 'empty');
  assert.equal('area' in store.getState(), false);
  assert.deepEqual(calls, ['0380']);
});

test('polygonfel tömmer tidigare område och visar felet', async () => {
  const store = create({ boundary: async code => {
    if (code === '0180') throw new Error('Syntetiskt nätverksfel');
    return boundary(code);
  } });
  await store.selectMunicipality('0380');
  await store.selectMunicipality('0180');
  assert.deepEqual(store.getState(), { status: 'error', message: 'Syntetiskt nätverksfel' });
});

test('uppslagsfel lämnar inget valt område', async () => {
  const store = create({ lookup: async () => ({ status: 'error', error: {
    kind: 'network', message: 'Uppslag misslyckades', httpStatus: null,
  } }) });
  await store.selectMunicipality('0380');
  await store.selectMunicipality({ lat: 59, lon: 18 });
  assert.deepEqual(store.getState(), { status: 'error', message: 'Uppslag misslyckades' });
});

test('nytt val avbryter föregående signal; sent polygonsvar kan inte ersätta senaste valet', async () => {
  const wait = deferred();
  let firstSignal;
  const store = create({ boundary: async (code, signal) => {
    if (code === '0380') { firstSignal = signal; return wait.promise; }
    return boundary(code);
  } });
  const old = store.selectMunicipality('0380');
  await store.selectMunicipality('0180');
  assert.equal(firstSignal.aborted, true);
  const latest = store.getState();
  wait.resolve(boundary('0380')); // Simulerar en leverantör som ignorerar abort.
  await old;
  assert.equal(store.getState(), latest);
});

test('sent polygonfel kan inte ersätta ett nyare val eller dess laddningsstatus', async () => {
  const oldResponse = deferred(), newResponse = deferred();
  const store = create({ boundary: code => code === '0380' ? oldResponse.promise : newResponse.promise });
  const old = store.selectMunicipality('0380');
  const current = store.selectMunicipality('0180');
  oldResponse.reject(new Error('Sent fel'));
  await old;
  assert.deepEqual(store.getState(), { status: 'loading' });
  newResponse.resolve(boundary('0180'));
  await current;
  assert.equal(store.getState().area.selection.municipalityCode, '0180');
});

for (const [name, response] of [
  ['träff', () => readyLookup('0180')],
  ['tomt', emptyLookup],
  ['fel', () => ({ status: 'error', error: { message: 'Sent fel' } })],
]) {
  test(`sent kartuppslag (${name}) får inte starta en gammal polygonhämtning eller ändra valet`, async () => {
    const wait = deferred();
    const calls = [];
    const store = create({ lookup: () => wait.promise, boundary: async code => {
      calls.push(code); return boundary(code);
    } });
    const old = store.selectMunicipality({ lat: 59, lon: 18 });
    await store.selectMunicipality('0380');
    const latest = store.getState();
    wait.resolve(response());
    await old;
    assert.equal(store.getState(), latest);
    assert.deepEqual(calls, ['0380']);
  });
}

test('avslutad prenumeration får inga fler uppdateringar', async () => {
  const store = create();
  const states = [];
  const unsubscribe = store.subscribe(state => states.push(state.status));
  unsubscribe();
  await store.selectMunicipality('0380');
  assert.deepEqual(states, ['idle']);
});
