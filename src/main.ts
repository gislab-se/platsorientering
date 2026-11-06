import 'leaflet/dist/leaflet.css';
import './style.css';
import { createMap } from './map/createMap';
import { geoJSON } from 'leaflet';
import type { GeoJSON } from 'leaflet';
import { createAreaSelection } from './state/areaSelection';
import { mountMunicipalitySearch } from './ui/municipalitySearch';
import { createMunicipalityStatistics } from './state/municipalityStatistics';
import { renderMunicipalityOverview } from './ui/municipalityOverview';

const mapElement = document.querySelector<HTMLElement>('#map');
const statusElement = document.querySelector<HTMLElement>('#map-status');
const resetButton = document.querySelector<HTMLButtonElement>('#reset-map');

if (!mapElement || !statusElement || !resetButton) {
  throw new Error('Sidans kartbehållare, status eller knapp saknas.');
}

const { resetView, leafletMap } = createMap(mapElement, statusElement);
resetButton.addEventListener('click', resetView);

const selectionStatus = document.querySelector<HTMLElement>('#selection-status')!;
const source = document.querySelector<HTMLElement>('#boundary-source')!;
const analysis = document.querySelector<HTMLElement>('#analysis-status')!;
const form = document.querySelector<HTMLFormElement>('#municipality-form')!;
const queryInput = document.querySelector<HTMLInputElement>('#municipality-query')!;
const areaSelection = createAreaSelection();
const statistics = createMunicipalityStatistics();
const overview = document.querySelector<HTMLElement>('#municipality-overview-content')!;
statistics.subscribe(state => renderMunicipalityOverview(overview, state));
areaSelection.subscribe(state => { void statistics.updateSelection(state); });
const { selectMunicipality } = areaSelection;
const municipalitySearch = mountMunicipalitySearch({
  form,
  input: queryInput,
  results: document.querySelector<HTMLUListElement>('#municipality-results')!,
  status: document.querySelector<HTMLElement>('#municipality-search-status')!,
  onSelect: code => { void selectMunicipality(code); },
});
let boundary: GeoJSON | undefined;

// Kartan och panelen läser samma bekräftade val. Söktexten är en separat fråga.
areaSelection.subscribe(state => {
  if (state.status === 'loading') municipalitySearch.clearResults();
  if (boundary) { boundary.remove(); boundary = undefined; }
  source.textContent = '';
  selectionStatus.removeAttribute('aria-busy');
  analysis.textContent = 'Analysfunktioner är planerade och ännu inte tillgängliga.';
  if (state.status === 'ready') {
    const { area } = state;
    const code = area.selection.kind === 'municipality' ? area.selection.municipalityCode : '';
    boundary = geoJSON(area.geometry, {
      style: { color: '#17594c', weight: 3, fillColor: '#48b99a', fillOpacity: 0.3 },
      interactive: false,
    }).addTo(leafletMap);
    leafletMap.fitBounds(boundary.getBounds(), { padding: [24, 24], maxZoom: 11 });
    selectionStatus.textContent = `Vald kommun: ${area.name} (${code}).`;
    const attribution = area.geometrySource?.attribution;
    const attributionText = attribution?.status === 'known' ? attribution.value.join(' · ') : '';
    source.textContent = `Grön yta: vald kommun. Källa: kart-api. ${attributionText}. Gränsårgång: okänd. Förenklad för visning; används inte för analys.`;
    analysis.textContent = `Område: ${area.name}. Kommunstatistiken visas i Kommunöversikt. Analys av befolkningsrutor kommer senare.`;
  } else if (state.status === 'loading') {
    selectionStatus.textContent = 'Hämtar kommun…';
    selectionStatus.setAttribute('aria-busy', 'true');
  } else if (state.status === 'idle') {
    selectionStatus.textContent = 'Ingen kommun vald.';
  } else {
    selectionStatus.textContent = state.message;
  }
});

leafletMap.on('click', event => {
  void selectMunicipality({ lat: event.latlng.lat, lon: event.latlng.lng });
});
