import { municipalityDirectory } from '../data/municipalities.ts';
import type { GeocodeHit } from './contracts.ts';

export interface PlaceMunicipalityGroup {
  code: string | null;
  municipalityName: string;
  // Alla ursprungliga träffposter, även när samtliga fält är identiska. Inget ID skapas.
  hits: GeocodeHit[];
  // Unika textetiketter för det befintliga sökgränssnittet, inte en lista över platsposter.
  places: string[];
  count: number;
}

// Grupper av visade träffar, aldrig en fullständig ortlista eller koordinatbaserad join.
export function groupPlacesByMunicipality(hits: readonly GeocodeHit[]): PlaceMunicipalityGroup[] {
  const groups = new Map<string, PlaceMunicipalityGroup>();
  for (const hit of hits) {
    const municipality = municipalityDirectory.find(entry => entry.code === hit.kommunkod);
    const key = municipality?.code ?? 'unknown';
    let group = groups.get(key);
    if (!group) {
      group = { code: municipality?.code ?? null,
        municipalityName: municipality?.name ?? 'Kommun saknas eller kan inte matchas', hits: [], places: [], count: 0 };
      groups.set(key, group);
    }
    group.hits.push(hit);
    group.count++;
    const label = hit.typ ? `${hit.namn} (${hit.typ})` : hit.namn;
    if (!group.places.includes(label)) group.places.push(label);
  }
  return [...groups.values()];
}
