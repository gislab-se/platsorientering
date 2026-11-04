import test from 'node:test';
import assert from 'node:assert/strict';
import { createMunicipalityStatistics } from '../src/state/municipalityStatistics.ts';
import { createAreaSelection } from '../src/state/areaSelection.ts';

const selection = (code = '0380') => ({ status: 'ready', area: {
  name: `Kommun ${code}`, selection: { kind: 'municipality', municipalityCode: code },
} });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('statistik följer bekräftad kod och laddar, utan eget kommunval', async () => {
  const states = [];
  const store = createMunicipalityStatistics(async (code, signal) => {
    assert.equal(code, '0380');
    assert.equal(signal.aborted, false);
    return { municipalityCode: code };
  });
  store.subscribe(state => states.push(state.status));
  await store.updateSelection(selection());
  assert.deepEqual(states, ['idle', 'loading', 'ready']);
  assert.equal(store.getState().municipality.code, '0380');
});

test('laddning, tomt, fel och idle i P3 rensar statistik utan nya SCB-anrop', async () => {
  let calls = 0;
  const store = createMunicipalityStatistics(async code => { calls++; return { municipalityCode: code }; });
  for (const state of [{ status: 'loading' }, { status: 'empty', message: 'Ingen kommun' },
    { status: 'error', message: 'Gränsfel' }, { status: 'idle' }]) {
    await store.updateSelection(selection());
    await store.updateSelection(state);
    assert.deepEqual(store.getState(), { status: 'idle' });
  }
  assert.equal(calls, 4);
});

test('nytt val avbryter statistik och rensar föregående resultat omedelbart', async () => {
  let previousSignal;
  const wait = deferred();
  const store = createMunicipalityStatistics((code, signal) => {
    if (code === '0380') { previousSignal = signal; return Promise.resolve({ municipalityCode: code }); }
    return wait.promise;
  });
  await store.updateSelection(selection());
  const next = store.updateSelection(selection('1280'));
  assert.equal(previousSignal.aborted, true);
  assert.equal(store.getState().status, 'loading');
  assert.equal(store.getState().municipality.code, '1280');
  assert.equal('statistics' in store.getState(), false);
  wait.resolve({ municipalityCode: '1280' });
  await next;
});

for (const outcome of ['resolve', 'reject']) {
  test(`sent SCB-${outcome} kan inte ersätta nyare kommun eller rensat val`, async () => {
    for (const nextSelection of [selection('1280'), { status: 'loading' }]) {
      const old = deferred();
      const store = createMunicipalityStatistics(code => code === '0380' ? old.promise : Promise.resolve({ municipalityCode: code }));
      const first = store.updateSelection(selection());
      await store.updateSelection(nextSelection);
      const expected = store.getState();
      if (outcome === 'resolve') old.resolve({ municipalityCode: '0380' });
      else old.reject(new Error('Gammalt fel'));
      await first;
      assert.deepEqual(store.getState(), expected);
    }
  });
}

test('fel visas utan gammal statistik, fel kommunkod avvisas och nytt val kan återhämta', async () => {
  let mode = 'network';
  const store = createMunicipalityStatistics(async code => {
    if (mode === 'network') throw new Error('SCB kunde inte nås.');
    return { municipalityCode: mode === 'wrong' ? '1280' : code };
  });
  await store.updateSelection(selection());
  assert.equal(store.getState().message, 'SCB kunde inte nås.');
  assert.equal('statistics' in store.getState(), false);
  mode = 'wrong';
  await store.updateSelection(selection());
  assert.equal(store.getState().message, 'SCB-svaret gäller en annan kommun.');
  mode = 'ready';
  await store.updateSelection(selection());
  assert.equal(store.getState().status, 'ready');
});

test('samma P3-prenumeration ger statistik efter sökval och kartval; SCB-fel ändrar inte P3', async () => {
  const codes = [];
  const area = createAreaSelection({
    lookup: async () => ({ status: 'ready', data: { kommunkod: '1280', attribution: [] } }),
    boundary: async code => ({ municipality: { kommunkod: code, kommunnamn: `Kommun ${code}`, attribution: [] },
      geometry: { type: 'Polygon', coordinates: [] } }),
  });
  const statistics = createMunicipalityStatistics(async code => { codes.push(code); throw new Error('SCB-fel'); });
  const tasks = [];
  const unsubscribe = area.subscribe(state => tasks.push(statistics.updateSelection(state)));
  await area.selectMunicipality('0380');
  await Promise.all(tasks);
  assert.equal(area.getState().status, 'ready');
  assert.equal(statistics.getState().status, 'error');
  await area.selectMunicipality({ lat: 59, lon: 18 });
  await Promise.all(tasks);
  assert.deepEqual(codes, ['0380', '1280']);
  assert.equal(area.getState().area.selection.municipalityCode, '1280');
  unsubscribe();
});
