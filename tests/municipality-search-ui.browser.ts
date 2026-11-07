// Körs i riktig browser via Vite: /tests/municipality-search-ui.html.
// Ingen nätverksåtkomst till kart-api och inga nya testberoenden behövs.
import { mountMunicipalitySearch } from '../src/ui/municipalitySearch';
import { municipalityDirectory } from '../src/data/municipalities';
import { renderMunicipalityOverview } from '../src/ui/municipalityOverview';
import { parseTab628Statistics } from '../src/providers/scbTab628';
import type { SourceMetadata } from '../src/domain/contracts';

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
  test('Statistiken finns en gång direkt under vald kommun utan synlig översiktsrubrik', () => {
    const areaSection = appDocument.querySelector('[aria-labelledby="area-heading"]');
    const analysisSection = appDocument.querySelector('[aria-labelledby="analysis-heading"]');
    assert(analysisSection?.querySelector('h2')?.textContent === 'Resultat och analys', 'Rubriken Resultat och analys saknas');
    assert(Boolean(analysisSection?.querySelector('#analysis-status')), 'P3:s statusfält saknas');
    const overview = areaSection?.querySelector('[role="region"][aria-label="Kommunstatistik för vald kommun"]');
    assert(overview?.previousElementSibling?.id === 'selection-status', 'Statistiken ligger inte direkt under vald kommun');
    assert(Boolean(overview?.querySelector('#municipality-overview-content')), 'Statistikbehållaren saknas');
    assert(appDocument.querySelectorAll('#municipality-overview-content').length === 1, 'Statistikbehållaren är duplicerad');
    assert(!analysisSection?.querySelector('#municipality-overview-content'), 'Statistik finns kvar under analys');
    assert(!appDocument.querySelector('#municipality-overview-heading'), 'Synlig översiktsrubrik finns kvar');
    assert(overview?.querySelector('p')?.textContent === 'Kommunstatistiken har ännu inte lästs in.', 'Tydligt oladdat tillstånd saknas');
    assert(!/\d/.test(overview?.textContent ?? ''), 'Översikten innehåller statistikvärden');
  });
  const fixture = await (await fetch('/tests/fixtures/scb-tab628.real.json')).json();
  const statistics = parseTab628Statistics(fixture.body, '0380', {
    provider: 'SCB', dataset: 'TAB628', sourceUrl: fixture.source.url,
    license: { status: 'unknown', reason: 'Prov' }, attribution: { status: 'known', value: ['Källa: SCB'] },
    referenceTime: { status: 'known', value: { kind: 'year', year: 2025 } },
    retrievedAt: { status: 'unknown', reason: 'Prov' }, sourceCrs: { status: 'not-applicable' },
    geographicCoverage: { status: 'known', value: { description: 'Sparat SCB-prov', limitations: fixture.body.note } },
  });
  const overviewContent = document.createElement('div');
  const municipality = { name: 'Uppsala', code: '0380' };
  test('Kommunöversikt visar källvärden med enheter, referensdagar och begränsningar', () => {
    renderMunicipalityOverview(overviewContent, { status: 'ready', municipality, statistics });
    const text = overviewContent.textContent!.replace(/\s/g, ' ');
    assert(overviewContent.firstElementChild?.tagName === 'DL', 'Resultatet börjar inte direkt med måtten');
    assert(overviewContent.querySelectorAll('.municipality-metrics > .municipality-metric').length === 3, 'De tre måtten är inte grupperade för layouten');
    assert(!text.includes('Uppsala (0380)'), 'Kommunnamnet upprepas i statistikvisningen');
    for (const expected of ['249 726 invånare', '2 193,84 km²', '113,8 invånare/km²',
      '2025-12-31', '2026-01-01', 'SCB TAB628', 'Kartgränsens årgång är okänd', 'CKM']) {
      assert(text.includes(expected), `Saknar ${expected}`);
    }
    assert(overviewContent.querySelector('a')?.href === fixture.source.url, 'Källänken är fel');
  });
  test('Två korta källor, en stängd detaljsektion och alla originalnoter bevaras', () => {
    const credit = '©Lantmäteriet · Administrativ indelning · CC BY 4.0';
    const boundarySource: SourceMetadata = {
      ...statistics.source, provider: 'kart-api', dataset: 'Kommungräns för visning',
      attribution: { status: 'known', value: [credit] },
    };
    renderMunicipalityOverview(overviewContent, { status: 'ready', municipality, statistics }, boundarySource);
    const sources = overviewContent.querySelector('.municipality-sources')!;
    assert(sources.children.length === 2, 'Två källor saknas');
    assert(sources.children[0].textContent === 'Källa: SCB', 'SCB-källans korta etikett är fel');
    assert(sources.previousElementSibling?.tagName === 'DL', 'Källorna ligger inte direkt under måtten');
    assert(sources.querySelectorAll('a')[0].href === fixture.source.url, 'Dynamisk SCB-länk förlorad');
    assert(sources.querySelectorAll('a')[1].href === 'https://kart-api.se/docs/attribution/', 'Attributionslänk förlorad');
    const details = overviewContent.querySelector('details')!;
    assert(overviewContent.querySelectorAll('details').length === 1 && !details.open, 'Detaljer ska vara en enda stängd sektion');
    assert(details.querySelector('summary')?.textContent === 'Källor och begränsningar', 'Fel detaljrubrik');
    assert(!overviewContent.querySelector('dd')?.textContent?.includes('2025-12-31'), 'Datum upprepas vid huvudresultatet');
    assert(details.textContent!.includes('2025-12-31') && details.textContent!.includes('2026-01-01'), 'Referensdagar saknas');
    assert(details.textContent!.includes(credit), 'Gränsattribution saknas');
    for (const note of fixture.body.note) {
      assert([...details.querySelectorAll('p')].some(p => p.textContent === note), 'Originalnot från SCB har ändrats eller försvunnit');
    }
    const helperId = appDocument.querySelector('#municipality-query')?.getAttribute('aria-describedby');
    assert(helperId === 'municipality-search-help', 'Sökhjälpens tillgängliga koppling har försvunnit');
    assert(Boolean(appDocument.getElementById(helperId!)?.classList.contains('sr-only')), 'Sökhjälpen är inte dold enbart visuellt');
    renderMunicipalityOverview(overviewContent, { status: 'loading', municipality }, boundarySource);
    assert(!overviewContent.querySelector('.municipality-sources, details, dl'), 'Källor, detaljer eller gamla mått blinkar till under laddning');
    assert(overviewContent.getAttribute('aria-busy') === 'true' && overviewContent.textContent!.includes('Hämtar kommunstatistik'), 'Tillgänglig laddningsinformation saknas');
    renderMunicipalityOverview(overviewContent, { status: 'ready', municipality, statistics }, boundarySource);
    assert(overviewContent.querySelectorAll('.municipality-sources a').length === 2 && Boolean(overviewContent.querySelector('dl')), 'Resultat och båda källor återställs inte efter laddning');
    renderMunicipalityOverview(overviewContent, { status: 'error', municipality, message: 'SCB-fel' }, boundarySource);
    assert(Boolean(overviewContent.querySelector('a[href="https://kart-api.se/docs/attribution/"]')), 'Gränskällan försvinner vid SCB-fel');
    assert(!overviewContent.querySelector('dl'), 'Gamla mått finns kvar vid fel');
  });
  test('Kommunöversikt skiljer noll, saknat och sekretess och rensar vid laddning/fel', () => {
    const data = structuredClone(statistics);
    data.population.value = { status: 'available', value: 0 };
    data.landArea.value = { status: 'missing', reason: 'Test saknat' };
    data.density.value = { status: 'suppressed', reason: 'Test sekretess' };
    renderMunicipalityOverview(overviewContent, { status: 'ready', municipality, statistics: data });
    assert(overviewContent.textContent!.includes('0 invånare'), 'Noll saknas');
    assert(overviewContent.textContent!.includes('Uppgift saknas: Test saknat'), 'Saknat saknas');
    assert(overviewContent.textContent!.includes('Sekretessmarkerat: Test sekretess'), 'Sekretess saknas');
    renderMunicipalityOverview(overviewContent, { status: 'loading', municipality });
    assert(!overviewContent.querySelector('dl') && overviewContent.getAttribute('aria-busy') === 'true', 'Gammal statistik vid laddning');
    renderMunicipalityOverview(overviewContent, { status: 'error', municipality, message: 'SCB-fel' });
    assert(!overviewContent.querySelector('dl') && overviewContent.textContent!.includes('SCB-fel'), 'Fel blandas med statistik');
    renderMunicipalityOverview(overviewContent, { status: 'idle' });
    assert(!overviewContent.textContent!.includes('Uppsala'), 'Gammal kommun finns kvar');
  });
  test('en enda namn- eller kodträff väljs direkt efter skickad sökning', () => {
    for (const [query, code] of [['Kiruna', '2584'], ['2584', '2584'], ['0380', '0380']]) {
      search('upp');
      const previousCount = selected.length;
      search(query);
      assert(selected.length === previousCount + 1 && selected.at(-1) === code, 'Exakt ett val med rätt kod förväntades');
      assert(document.activeElement === input && buttons().length === 0, 'Fokus eller gamla resultat återställdes inte');
      assert(status.textContent === '', 'En uppmaning att välja träff finns kvar');
    }
  });
  test('flera träffar visar namn och kod och väljer rätt kommun', () => {
    const previousCount = selected.length;
    search('upp');
    assert(buttons().length === 4, 'Förväntade fyra träffar');
    assert(selected.length === previousCount, 'Flera träffar får inte väljas automatiskt');
    assert(buttons().every(button => button.type === 'button'), 'Träffarna får inte skicka formuläret');
    const button = buttons().find(b => b.textContent === 'Upplands Väsby (0114)');
    assert(Boolean(button), 'Saknad träff'); button!.click();
    assert(selected.length === previousCount + 1 && selected.at(-1) === '0114', 'Fel kod från flervalsresultat');
    assert(input.value === 'upp', 'Valet får inte skriva över sökfrågan');
  });
  test('svenska namn väljer rätt kommun', () => {
    for (const [query, code] of [['LULEÅ', '2580'], ['ÄLMHULT', '0765'], ['ÖREBRO', '1880']]) {
      const previousCount = selected.length;
      search(query);
      assert(selected.length === previousCount + 1 && selected.at(-1) === code && buttons().length === 0, 'Fel svensk namnträff');
    }
  });
  test('ingen träff och tom fråga har olika meddelanden', () => {
    const previousCount = selected.length;
    for (const query of ['zzzxqvnonexistent', '9999']) {
      search(query);
      assert(buttons().length === 0 && status.textContent === 'Ingen kommun hittades.', 'Fel tomresultatmeddelande');
    }
    search(' ');
    assert(buttons().length === 0 && status.textContent!.includes('Ange kommunnamn'), 'Saknad instruktion');
    assert(selected.length === previousCount, 'Tom eller okänd fråga får inte ändra valet');
  });
  test('ändrad fråga och kartval kan rensa gamla resultat', () => {
    const previousCount = selected.length;
    search('upp'); input.value = 'Kiruna'; input.dispatchEvent(new Event('input'));
    assert(buttons().length === 0 && status.textContent === '', 'Gamla träffar finns kvar');
    assert(selected.length === previousCount, 'Enbart skrivande får inte ändra valet');
    search('upp'); component.clearResults();
    assert(buttons().length === 0, 'Kartval kunde inte rensa träffar');
    assert(selected.length === previousCount, 'Rensning av träffar får inte ändra valet');
  });
  test('alla 290 koder lämnas direkt till samma valfunktion', () => {
    for (const municipality of municipalityDirectory) {
      const previousCount = selected.length;
      search(municipality.code);
      assert(buttons().length === 0, 'En ensam kodträff ska inte visa en resultatknapp');
      assert(selected.length === previousCount + 1 && selected.at(-1) === municipality.code, 'Fel kod skickades');
    }
  });
  // Lämna flera träffar för verkligt Tab/Enter/Space-prov med browserns tangentbordsinmatning.
  search('upp'); input.focus();
  report.dataset.result = 'passed';
  report.textContent = `${passed.length}/${passed.length} browsertester godkända\n${passed.join('\n')}`;
  // Tangentbordsprovet kan observera callback utan att läsa implementationens internvariabler.
  Object.defineProperty(window, 'municipalityUiTestSelected', { get: () => [...selected] });
} catch (error) {
  report.dataset.result = 'failed';
  report.textContent = error instanceof Error ? error.message : String(error);
  throw error;
}
