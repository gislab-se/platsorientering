import { mountPlaceSearch } from '../src/ui/placeSearch.ts';
import { createPlaceSearch } from '../src/state/placeSearch.ts';
import type { GeocodeResult } from '../src/providers/geocode.ts';
import { parseGeocodeResponse } from '../src/domain/validation.ts';

const form = document.querySelector<HTMLFormElement>('#form')!;
const input = document.querySelector<HTMLInputElement>('#query')!;
const filter = document.querySelector<HTMLSelectElement>('#filter')!;
const results = document.querySelector<HTMLUListElement>('#results')!;
const status = document.querySelector<HTMLElement>('#status')!;
const attribution = document.querySelector<HTMLElement>('#attribution')!;
const report = document.querySelector<HTMLElement>('#test-report')!;
const selected: string[] = [];
let resolve!: (result: GeocodeResult) => void;
let currentSignal: AbortSignal;
let currentFilter: string | undefined;
const search = createPlaceSearch(async (request, signal) => {
  currentSignal = signal;
  currentFilter = request.kommunkod;
  return new Promise<GeocodeResult>(done => { resolve = done; });
});
const component = mountPlaceSearch({ form, input, filter, results, status, attribution,
  search, onSelectMunicipality: code => { selected.push(code); component.clearResults(); } });
const assert = (ok: boolean, message: string) => { if (!ok) throw new Error(message); };
const passed: string[] = [];
const test = (name: string, run: () => void) => { run(); passed.push(name); };
const flush = () => new Promise(done => setTimeout(done, 0));
const data = parseGeocodeResponse({ query: 'Prov', antal: 6, attribution: ['SYNTETISK <img src=x>'],
  spridning: { traffar: 50, kommuner: 10, entydig: false }, results: [
    { namn: '<b>Prov</b>', lat: 60, lon: 17, tier: 'place', kalla: 'syntetisk', kommunkod: '0380' },
    { namn: '<b>Prov</b>', lat: 60.01, lon: 17.01, tier: 'place', kalla: 'syntetisk', kommunkod: '0380' },
    { namn: '<b>Prov</b>', lat: 60.02, lon: 17.02, tier: 'place', kalla: 'syntetisk', kommunkod: '0380' },
    { namn: '<b>Prov</b>', lat: 60.03, lon: 17.03, tier: 'place', kalla: 'syntetisk', kommunkod: '0380' },
    { namn: 'Prov', lat: 61, lon: 18, tier: 'place', kalla: 'syntetisk', kommunkod: '1280' },
    { namn: 'Prov', lat: 62, lon: 19, tier: 'place', kalla: 'syntetisk', kommunkod: null },
  ] });
const completeness = { status: 'unknown' as const, scope: 'Prov', reason: 'Begränsat' };
const ready: GeocodeResult = { status: 'ready', data, completeness };
try {
  test('Kommunfilter innehåller alla 290 koder och bevarar inledande nollor', () => {
    assert(filter.options.length === 291, 'Fel antal kommuner');
    assert(Boolean(filter.querySelector('option[value="0380"]')), 'Kod saknas');
  });
  input.value = 'Prov';
  form.requestSubmit();
  test('Laddning väljer inte kommun', () => {
    assert(status.getAttribute('aria-busy') === 'true', 'Laddningsstatus saknas');
    assert(selected.length === 0, 'Kommun valdes automatiskt');
  });
  resolve(ready);
  await flush();
  test('Flera kommuner, omatchad kod, begränsning och säker attribution visas', () => {
    assert(results.querySelectorAll('li').length === 3, 'Grupper saknas');
    assert(results.querySelectorAll('button').length === 2, 'Omatchad kod får inte väljas');
    assert(status.textContent!.includes('50 exakta namnträffar i 10 kommuner'), 'Spridning saknas');
    assert(status.textContent!.includes('inte fullständig'), 'Begränsning saknas');
    assert(!results.querySelector('b') && !attribution.querySelector('img'), 'API-text blev HTML');
    assert(attribution.textContent === data.attribution[0], 'Attribution ändrades');
    assert(selected.length === 0, 'Träff valdes automatiskt');
  });
  test('Fyra likadana namn i samma kommun ger en grupp med fyra visade träffar', () => {
    const groups = [...results.querySelectorAll('li')];
    const uppsala = groups.filter(group => group.querySelector('strong')?.textContent === 'Uppsala (0380)');
    assert(uppsala.length === 1, 'Samma kommun visas som flera grupper');
    assert(uppsala[0].querySelector('p')?.textContent === '<b>Prov</b> — 4 visade träffar',
      'Fyra poster ska räknas även när deras textetikett är identisk');
    assert(uppsala[0].querySelectorAll('button').length === 1, 'Kommungruppen ska ha en valknapp');
    assert(status.textContent!.includes('6 platsträffar visas'), 'Totalt antal visade poster är fel');
    assert(status.textContent!.includes('Högst 20 träffar'), 'Träffgränsen ska visas');
    assert(selected.length === 0, 'Grupperingen får inte välja kommun automatiskt');
  });
  results.querySelector<HTMLButtonElement>('button')!.click();
  test('Uttryckligt val skickar endast kommunkod och återför fokus', () => {
    assert(selected.join() === '0380', 'Fel kommunval');
    assert(document.activeElement === input, 'Fokus tappades');
    assert(!results.children.length && !attribution.textContent, 'Gamla träffar kvar');
  });
  filter.value = '1280';
  form.requestSubmit();
  test('Kommunfilter skickas, ändrad text avbryter och sent svar ignoreras', () => {
    assert(currentFilter === '1280', 'Filter saknas');
    input.dispatchEvent(new Event('input'));
    assert(currentSignal.aborted, 'Anrop avbröts inte');
  });
  resolve(ready);
  await flush();
  assert(!results.children.length, 'Sent svar visades');
  form.requestSubmit();
  resolve({ status: 'empty', data: { ...data, antal: 0, results: [] },
    completeness, sources: [], reason: 'Inga träffar i detta svar.' });
  await flush();
  test('Tomt svar bevarar attribution och ändrar inte valt kommunnummer', () => {
    assert(status.textContent === 'Inga träffar i detta svar.', 'Tomt svar saknas');
    assert(Boolean(attribution.textContent), 'Attribution saknas');
    assert(selected.join() === '0380', 'Tomt svar ändrade valet');
  });
  form.requestSubmit();
  resolve({ status: 'error', error: { kind: 'network', httpStatus: null, message: 'Nätverksfel.' } });
  await flush();
  test('Fel visas utan gamla träffar eller attribution', () => {
    assert(status.textContent === 'Nätverksfel.', 'Fel saknas');
    assert(!results.children.length && !attribution.textContent, 'Gammalt resultat kvar');
  });
  report.textContent = `PASS ${passed.length}/${passed.length}\n${passed.join('\n')}`;
  document.title = 'PASS – platsökning';
} catch (error) {
  report.textContent = `FAIL\n${error instanceof Error ? error.stack : String(error)}`;
  document.title = 'FAIL – platsökning';
}
