import type { MunicipalityCode } from '../domain/contracts.ts';
import { geocode } from '../providers/geocode.ts';
import { parseMunicipalityCode } from '../domain/validation.ts';
import type { GeocodeResult } from '../providers/geocode.ts';

export type PlaceSearchState = { status: 'idle' } | { status: 'loading' } | GeocodeResult;
type Search = (input: { q: string; limit: number; kommunkod?: MunicipalityCode },
  signal: AbortSignal) => Promise<GeocodeResult>;

// Sökträffar ändrar aldrig kommunval eller statistik utan ett uttryckligt kommunval.
export function createPlaceSearch(search: Search = (input, signal) => geocode(input, globalThis.fetch, signal)) {
  let state: PlaceSearchState = { status: 'idle' };
  let requestId = 0;
  let controller: AbortController | undefined;
  const listeners = new Set<(state: PlaceSearchState) => void>();
  const publish = (next: PlaceSearchState) => {
    state = next;
    for (const listener of listeners) listener(state);
  };
  function clear() {
    requestId++;
    controller?.abort();
    controller = undefined;
    publish({ status: 'idle' });
  }
  async function submit(q: string, municipalityFilter?: string) {
    clear();
    const current = requestId;
    if (!q.trim()) {
      publish({ status: 'error', error: {
        kind: 'invalid-data', message: 'Ange ett ortnamn eller en plats.', httpStatus: null,
      } });
      return;
    }
    let kommunkod: MunicipalityCode | undefined;
    try {
      kommunkod = municipalityFilter === undefined ? undefined : parseMunicipalityCode(municipalityFilter);
    } catch {
      publish({ status: 'error', error: {
        kind: 'invalid-data', message: 'Välj en giltig kommun i filtret.', httpStatus: null,
      } });
      return;
    }
    controller = new AbortController();
    const { signal } = controller;
    publish({ status: 'loading' });
    try {
      const result = await search({ q: q.trim(), limit: 20, kommunkod }, signal);
      if (current === requestId && !signal.aborted) publish(result);
    } catch {
      if (current === requestId && !signal.aborted) publish({ status: 'error', error: {
        kind: 'network', message: 'Platsökningen kunde inte nås. Försök igen.', httpStatus: null,
      } });
    }
  }
  return {
    submit, clear, getState: () => state,
    subscribe(listener: (state: PlaceSearchState) => void) {
      listeners.add(listener);
      listener(state);
      return () => { listeners.delete(listener); };
    },
  };
}
