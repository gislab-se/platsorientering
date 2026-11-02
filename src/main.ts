import 'leaflet/dist/leaflet.css';
import './style.css';
import { createMap } from './map/createMap';
import { geoJSON } from 'leaflet';
import type { GeoJSON } from 'leaflet';
import { lookupMunicipality } from './providers/municipalityLookup';
import { fetchMunicipalityBoundary } from './providers/municipalityBoundary';
import { mountMunicipalitySearch } from './ui/municipalitySearch';

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
const codeInput = document.querySelector<HTMLInputElement>('#municipality-query')!;
const municipalitySearch = mountMunicipalitySearch({
  form,
  input: codeInput,
  results: document.querySelector<HTMLUListElement>('#municipality-results')!,
  status: document.querySelector<HTMLElement>('#municipality-search-status')!,
  onSelect: code => { void selectMunicipality(code); },
});
let boundary: GeoJSON | undefined;
let requestId = 0;
let controller: AbortController | undefined;

async function selectMunicipality(selection: string | { lat: number; lon: number }) {
  municipalitySearch.clearResults();
  const currentRequest = ++requestId;
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  if (boundary) { boundary.remove(); boundary = undefined; }
  source.textContent = '';
  selectionStatus.textContent = 'Hämtar kommun…';
  selectionStatus.setAttribute('aria-busy', 'true');
  analysis.textContent = 'Analysfunktioner är planerade och ännu inte tillgängliga.';
  try {
    let code: string;
    let lookupAttribution: readonly string[] = [];
    if (typeof selection === 'string') {
      code = selection;
    } else {
      const result = await lookupMunicipality(selection,
        (input, init) => fetch(input, { ...init, signal }));
      if (currentRequest !== requestId) return;
      if (result.status === 'empty') throw new Error('Ingen kommun hittades vid den punkten. Klicka inom Sverige.');
      if (result.status === 'error') throw new Error(result.error.message);
      if (result.status !== 'ready') return;
      code = result.data.kommunkod;
      lookupAttribution = result.data.attribution;
    }
    const result = await fetchMunicipalityBoundary(code, signal);
    if (currentRequest !== requestId) return;
    boundary = geoJSON(result.geometry, {
      style: { color: '#17594c', weight: 3, fillColor: '#48b99a', fillOpacity: 0.3 },
      interactive: false,
    }).addTo(leafletMap);
    leafletMap.fitBounds(boundary.getBounds(), { padding: [24, 24], maxZoom: 11 });
    codeInput.value = code;
    selectionStatus.textContent = `Vald kommun: ${result.municipality.kommunnamn} (${code}).`;
    const attribution = [...new Set([...lookupAttribution, ...result.municipality.attribution])];
    source.textContent = `Grön yta: vald kommun. Källa: kart-api. ${attribution.join(' · ')}. Gränsårgång: okänd. Förenklad för visning; används inte för analys.`;
    analysis.textContent = `Område: ${result.municipality.kommunnamn}. Analys blir tillgänglig när ett datalager och dess analysfunktioner har införts.`;
  } catch (error) {
    if (currentRequest !== requestId) return;
    selectionStatus.textContent = error instanceof Error ? error.message : 'Kommunen kunde inte hämtas. Försök igen.';
  } finally {
    if (currentRequest === requestId) selectionStatus.removeAttribute('aria-busy');
  }
}

leafletMap.on('click', event => {
  void selectMunicipality({ lat: event.latlng.lat, lon: event.latlng.lng });
});
