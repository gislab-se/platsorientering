import type { MunicipalityStatistics } from '../domain/contracts.ts';
import type { AreaSelectionState } from './areaSelection.ts';
import { fetchTab628Statistics } from '../providers/scbTab628.ts';

type Municipality = { name: string; code: string };
export type MunicipalityStatisticsState =
  | { status: 'idle' }
  | { status: 'loading'; municipality: Municipality }
  | { status: 'ready'; municipality: Municipality; statistics: MunicipalityStatistics }
  | { status: 'error'; municipality: Municipality; message: string };

// Följer P3:s bekräftade val. Äger statistikens anrop, aldrig kommunvalet.
export function createMunicipalityStatistics(fetchStatistics = fetchTab628Statistics) {
  let state: MunicipalityStatisticsState = { status: 'idle' };
  let requestId = 0;
  let controller: AbortController | undefined;
  const listeners = new Set<(state: MunicipalityStatisticsState) => void>();
  const publish = (next: MunicipalityStatisticsState) => {
    state = next;
    for (const listener of listeners) listener(state);
  };
  async function updateSelection(selection: AreaSelectionState) {
    const current = ++requestId;
    controller?.abort();
    controller = undefined;
    if (selection.status !== 'ready' || selection.area.selection.kind !== 'municipality') {
      publish({ status: 'idle' });
      return;
    }
    const municipality = { name: selection.area.name, code: selection.area.selection.municipalityCode };
    controller = new AbortController();
    const { signal } = controller;
    publish({ status: 'loading', municipality });
    try {
      const statistics = await fetchStatistics(municipality.code, signal);
      if (current !== requestId || signal.aborted) return;
      if (statistics.municipalityCode !== municipality.code) throw new Error('SCB-svaret gäller en annan kommun.');
      publish({ status: 'ready', municipality, statistics });
    } catch (error) {
      if (current !== requestId || signal.aborted) return;
      publish({ status: 'error', municipality,
        message: error instanceof Error ? error.message : 'Kommunstatistiken kunde inte hämtas.' });
    }
  }
  return {
    updateSelection,
    getState: () => state,
    subscribe(listener: (state: MunicipalityStatisticsState) => void) {
      listeners.add(listener);
      listener(state);
      return () => { listeners.delete(listener); };
    },
  };
}
