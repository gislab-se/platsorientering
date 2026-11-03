import type { AreaOfInterest } from '../domain/contracts.ts';
import { lookupMunicipality } from '../providers/municipalityLookup.ts';
import { fetchMunicipalityBoundary } from '../providers/municipalityBoundary.ts';

export type MunicipalitySelection = string | { lat: number; lon: number };
export type AreaSelectionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; area: AreaOfInterest }
  | { status: 'empty'; message: string }
  | { status: 'error'; message: string };

interface Providers {
  lookup: typeof lookupMunicipality;
  boundary: typeof fetchMunicipalityBoundary;
}

/** En gemensam valkanal för kartklick och sökträffar, oberoende av DOM/Leaflet. */
export function createAreaSelection(providers: Providers = {
  lookup: lookupMunicipality, boundary: fetchMunicipalityBoundary,
}) {
  let state: AreaSelectionState = { status: 'idle' };
  let requestId = 0;
  let controller: AbortController | undefined;
  const listeners = new Set<(state: AreaSelectionState) => void>();
  const publish = (next: AreaSelectionState) => {
    state = next;
    for (const listener of listeners) listener(state);
  };

  async function selectMunicipality(selection: MunicipalitySelection) {
    const currentRequest = ++requestId;
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    publish({ status: 'loading' });
    try {
      let code: string;
      let lookupAttribution: readonly string[] = [];
      if (typeof selection === 'string') {
        code = selection;
      } else {
        const result = await providers.lookup(selection,
          (input, init) => fetch(input, { ...init, signal }));
        if (currentRequest !== requestId) return;
        if (result.status === 'empty') {
          publish({ status: 'empty', message: 'Ingen kommun hittades vid den punkten. Klicka inom Sverige.' });
          return;
        }
        if (result.status === 'error') throw new Error(result.error.message);
        if (result.status !== 'ready') throw new Error('Kommunuppslaget gav inget färdigt svar.');
        code = result.data.kommunkod;
        lookupAttribution = result.data.attribution;
      }
      const result = await providers.boundary(code, signal);
      if (currentRequest !== requestId) return;
      const area: AreaOfInterest = {
        id: `municipality:${result.municipality.kommunkod}`,
        name: result.municipality.kommunnamn,
        selection: { kind: 'municipality', municipalityCode: result.municipality.kommunkod },
        geometry: result.geometry,
        geometryVintage: { status: 'unknown', reason: 'kart-api anger ingen bekräftad gränsårgång.' },
        geometrySource: {
          provider: 'kart-api', dataset: 'Kommungräns för visning',
          sourceUrl: `https://api.kart-api.se/v1/kommun/${code}`,
          license: { status: 'unknown', reason: 'Ingen namngiven licens bekräftad; leverantörens visningsvillkor gäller.' },
          attribution: { status: 'known', value: [...new Set([...lookupAttribution, ...result.municipality.attribution])] },
          referenceTime: { status: 'unknown', reason: 'Kommungränsens referenstid är inte bekräftad.' },
          retrievedAt: { status: 'known', value: new Date().toISOString() },
          // Gäller polygonendpointen, inte lookup-koordinaternas obekräftade CRS.
          sourceCrs: { status: 'known', identifier: 'EPSG:4326', axisOrder: 'longitude-latitude' },
          geographicCoverage: { status: 'known', value: {
            description: `Visningsgräns för ${result.municipality.kommunnamn} (${code})`,
            limitations: ['Förenklad för visning; används inte för analys.', 'Gränsårgång och geografisk årgångsmatchning är inte bekräftade.'],
          } },
        },
      };
      publish({ status: 'ready', area });
    } catch (error) {
      if (currentRequest !== requestId) return;
      publish({ status: 'error', message: error instanceof Error ? error.message : 'Kommunen kunde inte hämtas. Försök igen.' });
    }
  }

  return {
    getState: () => state,
    selectMunicipality,
    subscribe(listener: (state: AreaSelectionState) => void) {
      listeners.add(listener);
      listener(state);
      return () => { listeners.delete(listener); };
    },
  };
}
