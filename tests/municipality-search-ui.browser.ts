// Körs i riktig browser via Vite: /tests/municipality-search-ui.html.
// Ingen nätverksåtkomst till kart-api och inga nya testberoenden behövs.
import { mountMunicipalitySearch } from '../src/ui/municipalitySearch';
import { municipalityDirectory } from '../src/data/municipalities';

const form = document.querySelector<HTMLFormElement>('#form')!;
const input = document.querySelector<HTMLInputElement>('#query')!;
const results = document.querySelector<HTMLUListElement>('#results')!;
const status = document.querySelector<HTMLElement>('#status')!;
const report = document.querySelector<HTMLElement>('#test-report')!;
const selected: string[] = [];
const component = mountMunicipalitySearch({ form, input, results, status, onSelect: code => selected.push(code) });
const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
const search = (query: string) => { input.value = query; form.requestSubmit(); };
const buttons = () => [...results.querySelectorAll<HTMLButtonElement>('button')];
const passed: string[] = [];
const test = (name: string, run: () => void) => { run(); passed.push(name); };

try {
  const appResponse = await fetch('/index.html');
  assert(appResponse.ok, 'Kunde inte läsa appens HTML');
  const appDocument = new DOMParser().parseFromString(await appResponse.text(), 'text/html');
  test('Kommunöversikt finns i steg 3 som separat del utan statistikvärden', () => {
    const analysisSection = appDocument.querySelector('[aria-labelledby="analysis-heading"]');
    assert(analysisSection?.querySelector('h2')?.textContent === 'Analys', 'P3-rubriken Analys saknas');
    assert(Boolean(analysisSection?.querySelector('#analysis-status')), 'P3:s statusfält saknas');
    const overview = analysisSection?.querySelector('[role="region"][aria-labelledby="municipality-overview-heading"]');
    assert(overview?.querySelector('h3')?.textContent === 'Kommunöversikt', 'Översikten ligger inte under Analys');
    assert(overview?.querySelector('p')?.textContent === 'Kommunstatistiken har ännu inte lästs in.', 'Tydligt oladdat tillstånd saknas');
    assert(!/\d/.test(overview?.textContent ?? ''), 'Översikten innehåller statistikvärden');
  });
  test('0380 visar Uppsala utan automatiskt val', () => {
    search('0380');
    assert(buttons().length === 1 && buttons()[0].textContent === 'Uppsala (0380)', 'Fel kodträff');
    assert(selected.length === 0, 'Val gjordes utan användaråtgärd');
    assert(buttons()[0].type === 'button', 'Träffen får inte skicka formuläret');
    buttons()[0].click();
    assert(selected[0] === '0380', 'Fel kod till valfunktionen');
    assert(document.activeElement === input && buttons().length === 0, 'Fokus/resultat återställdes inte');
  });
  test('flera träffar visar namn och kod och väljer rätt kommun', () => {
    search('upp');
    assert(buttons().length === 4, 'Förväntade fyra träffar');
    const button = buttons().find(b => b.textContent === 'Upplands Väsby (0114)');
    assert(Boolean(button), 'Saknad träff'); button!.click();
    assert(selected.at(-1) === '0114', 'Fel kod från flervalsresultat');
    assert(input.value === 'upp', 'Valet får inte skriva över sökfrågan');
  });
  test('svenska namn visas korrekt', () => {
    for (const [query, expected] of [['LULEÅ', 'Luleå (2580)'], ['ÄLMHULT', 'Älmhult (0765)'], ['ÖREBRO', 'Örebro (1880)']]) {
      search(query); assert(buttons()[0]?.textContent === expected, 'Fel svensk namnträff');
    }
  });
  test('ingen träff och tom fråga har olika meddelanden', () => {
    search('zzzxqvnonexistent');
    assert(buttons().length === 0 && status.textContent!.includes('Ingen kommun'), 'Saknat tomresultatmeddelande');
    search(' ');
    assert(buttons().length === 0 && status.textContent!.includes('Ange kommunnamn'), 'Saknad instruktion');
  });
  test('ändrad fråga och kartval kan rensa gamla resultat', () => {
    search('upp'); input.value = 'ö'; input.dispatchEvent(new Event('input'));
    assert(buttons().length === 0 && status.textContent === '', 'Gamla träffar finns kvar');
    search('upp'); component.clearResults();
    assert(buttons().length === 0, 'Kartval kunde inte rensa träffar');
  });
  test('alla 290 koder kan visas och lämnas till samma valfunktion', () => {
    for (const municipality of municipalityDirectory) {
      search(municipality.code);
      assert(buttons().length === 1 && buttons()[0].textContent === `${municipality.name} (${municipality.code})`, 'Fel registerträff');
      buttons()[0].click();
      assert(selected.at(-1) === municipality.code, 'Fel kod skickades');
    }
  });
  // Lämna en träff för verkligt Tab/Enter/Space-prov med browserns tangentbordsinmatning.
  search('0380'); input.focus();
  report.dataset.result = 'passed';
  report.textContent = `${passed.length}/${passed.length} browsertester godkända\n${passed.join('\n')}`;
  // Tangentbordsprovet kan observera callback utan att läsa implementationens internvariabler.
  Object.defineProperty(window, 'municipalityUiTestSelected', { get: () => [...selected] });
} catch (error) {
  report.dataset.result = 'failed';
  report.textContent = error instanceof Error ? error.message : String(error);
  throw error;
}
