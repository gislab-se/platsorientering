import type { Measure, ReferenceTime } from '../domain/contracts.ts';
import type { MunicipalityStatisticsState } from '../state/municipalityStatistics.ts';

function referenceTime(time: ReferenceTime): string {
  if (time.kind === 'date') return time.date;
  if (time.kind === 'year') return `Statistikår ${time.year}`;
  return `${time.start}–${time.end}`;
}

export function renderMunicipalityOverview(container: HTMLElement, state: MunicipalityStatisticsState) {
  container.replaceChildren();
  container.setAttribute('aria-busy', String(state.status === 'loading'));
  const paragraph = (text: string, parent: HTMLElement = container) => {
    const element = document.createElement('p');
    element.textContent = text;
    parent.append(element);
    return element;
  };
  if (state.status === 'idle') {
    paragraph('Välj en kommun i steg 1 för att läsa kommunstatistik.');
    return;
  }
  paragraph(`${state.municipality.name} (${state.municipality.code})`);
  if (state.status === 'loading') {
    paragraph('Hämtar kommunstatistik…');
    return;
  }
  if (state.status === 'error') {
    paragraph(`Statistiken kunde inte visas. ${state.message}`);
    return;
  }
  const { statistics } = state;
  const list = document.createElement('dl');
  container.append(list);
  const measure = (label: string, data: Measure<'persons' | 'km2' | 'persons/km2'>, decimals: number, unit: string) => {
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    const value = data.value;
    description.textContent = value.status === 'available'
      ? `${new Intl.NumberFormat('sv-SE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value.value)} ${unit}`
      : `${value.status === 'suppressed' ? 'Sekretessmarkerat' : 'Uppgift saknas'}: ${value.reason} (${unit})`;
    const time = data.referenceTime.status === 'known'
      ? referenceTime(data.referenceTime.value) : 'Referenstid okänd';
    description.append(document.createTextNode(` · ${time}`));
    list.append(term, description);
  };
  measure('Folkmängd', statistics.population, 0, 'invånare');
  measure('Landareal', statistics.landArea, 2, 'km²');
  measure('Befolkningstäthet', statistics.density, 1, 'invånare/km²');
  const source = paragraph('Källa: ');
  const link = document.createElement('a');
  link.textContent = 'SCB, TAB628';
  const url = new URL(statistics.source.sourceUrl);
  // Begränsa även länken till samma offentliga SCB-källa som adaptern.
  if (url.origin === 'https://statistikdatabasen.scb.se' && url.pathname === '/api/v2/tables/TAB628/data') link.href = url.href;
  source.append(link);
  paragraph('Folkmängden 31 december 2025 relateras till officiell landareal 1 januari 2026. Tätheten är SCB:s publicerade värde.');
  paragraph('Kartgränsens årgång är okänd. Statistikens geografiska överensstämmelse med den visade gränsen är inte verifierad.');
  paragraph('SCB använder röjandeskydd (CKM). Summerade delvärden kan avvika från publicerade totaler.');
  if (statistics.source.geographicCoverage.status === 'known') {
    const notes = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Källans noter och begränsningar';
    notes.append(summary);
    for (const note of statistics.source.geographicCoverage.value.limitations) paragraph(note, notes);
    container.append(notes);
  }
}
