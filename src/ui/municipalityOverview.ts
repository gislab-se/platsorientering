import type { Measure, MunicipalityStatistics, ReferenceTime, SourceMetadata } from '../domain/contracts.ts';
import type { MunicipalityStatisticsState } from '../state/municipalityStatistics.ts';

function referenceTime(time: ReferenceTime): string {
  if (time.kind === 'date') return time.date;
  if (time.kind === 'year') return `Statistikår ${time.year}`;
  return `${time.start}–${time.end}`;
}

export function renderMunicipalityOverview(
  container: HTMLElement, state: MunicipalityStatisticsState, boundarySource: SourceMetadata | null = null,
) {
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
  if (state.status !== 'ready') paragraph(`${state.municipality.name} (${state.municipality.code})`);
  if (state.status === 'loading') {
    paragraph('Hämtar kommunstatistik…');
    return;
  }
  if (state.status === 'error') {
    paragraph(`Statistiken kunde inte visas. ${state.message}`);
    appendSources(null);
    return;
  }
  const { statistics } = state;
  const list = document.createElement('dl');
  list.className = 'municipality-metrics';
  container.append(list);
  const measure = (label: string, data: Measure<'persons' | 'km2' | 'persons/km2'>, decimals: number, unit: string) => {
    const group = document.createElement('div');
    group.className = 'municipality-metric';
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    const value = data.value;
    if (value.status === 'available') {
      const number = document.createElement('span');
      number.className = 'metric-number';
      number.textContent = new Intl.NumberFormat('sv-SE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value.value);
      const unitElement = document.createElement('span');
      unitElement.className = 'metric-unit';
      unitElement.textContent = unit;
      description.append(number, document.createTextNode(' '), unitElement);
    } else {
      description.textContent = `${value.status === 'suppressed' ? 'Sekretessmarkerat' : 'Uppgift saknas'}: ${value.reason} (${unit})`;
    }
    group.append(term, description);
    list.append(group);
  };
  measure('Folkmängd', statistics.population, 0, 'invånare');
  measure('Landareal', statistics.landArea, 2, 'km²');
  measure('Befolkningstäthet', statistics.density, 1, 'invånare/km²');
  appendSources(statistics);

  function appendSources(data: MunicipalityStatistics | null) {
    if (!data && !boundarySource) return;
    const sources = document.createElement('div');
    sources.className = 'municipality-sources';
    container.append(sources);
    if (data) {
      const source = paragraph('Källa: ', sources);
      const link = document.createElement('a');
      link.textContent = 'SCB';
      const url = new URL(data.source.sourceUrl);
      if (url.origin === 'https://statistikdatabasen.scb.se' && url.pathname === '/api/v2/tables/TAB628/data') link.href = url.href;
      source.append(link);
    }
    if (boundarySource) {
      const source = paragraph('Kartgränser: ', sources);
      const link = document.createElement('a');
      link.textContent = 'kart-api / Lantmäteriet';
      link.href = 'https://kart-api.se/docs/attribution/';
      source.append(link);
    }
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Källor och begränsningar';
    details.append(summary);
    container.append(details);
    paragraph('Kommunnamn och koder: SCB. Gränser: kart-api.', details);
    paragraph('Kartgränsens årgång är okänd. Statistikens geografiska överensstämmelse med den visade gränsen är inte verifierad.', details);
    if (boundarySource) {
      paragraph('Grön yta: vald kommun. Förenklad för visning; används inte för analys.', details);
      if (boundarySource.attribution.status === 'known') {
        for (const credit of boundarySource.attribution.value) paragraph(credit, details);
      }
      const license = paragraph('Kartgränsernas licens: ', details);
      const link = document.createElement('a');
      link.textContent = 'CC BY 4.0';
      link.href = 'https://creativecommons.org/licenses/by/4.0/';
      license.append(link);
    }
    if (data) {
      paragraph('Statistiktabell: SCB TAB628.', details);
      for (const [label, measure] of [
        ['Folkmängd', data.population], ['Landareal', data.landArea], ['Befolkningstäthet', data.density],
      ] as const) {
        paragraph(`${label}: ${measure.referenceTime.status === 'known' ? referenceTime(measure.referenceTime.value) : 'Referenstid okänd'}.`, details);
      }
      paragraph('Tätheten är SCB:s publicerade värde och relaterar folkmängden till den officiella landarealen.', details);
      paragraph('SCB använder röjandeskydd (CKM). Summerade delvärden kan avvika från publicerade totaler.', details);
      const license = data.source.license;
      if (license.status === 'known') {
        const text = paragraph('SCB:s licens: ', details);
        const link = document.createElement('a');
        link.textContent = license.value.name;
        const url = new URL(license.value.url);
        if (url.protocol === 'https:') link.href = url.href;
        text.append(link);
      } else paragraph(`SCB:s licensuppgift är okänd: ${license.reason}`, details);
      if (data.source.attribution.status === 'known') {
        for (const credit of data.source.attribution.value) paragraph(credit, details);
      }
      if (data.source.geographicCoverage.status === 'known') {
        const heading = document.createElement('h4');
        heading.textContent = 'Källnoter';
        details.append(heading);
        for (const note of data.source.geographicCoverage.value.limitations) paragraph(note, details);
      }
    }
  }
}
