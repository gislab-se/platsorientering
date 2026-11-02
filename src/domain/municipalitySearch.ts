import { municipalityDirectory } from '../data/municipalities.ts';
import type { MunicipalityCode } from './contracts.ts';
import { parseMunicipalityCode } from './validation.ts';

export interface MunicipalitySearchResult {
  readonly code: MunicipalityCode;
  readonly name: string;
}

const normalize = (text: string) => text.normalize('NFC').trim().toLocaleLowerCase('sv-SE');
const collator = new Intl.Collator('sv-SE');
const municipalities: readonly MunicipalitySearchResult[] = municipalityDirectory
  .map(({ code, name }) => ({ code: parseMunicipalityCode(code), name }))
  .sort((a, b) => collator.compare(a.name, b.name) || a.code.localeCompare(b.code));

/** Lokal sökning utan nätverk eller kartändringar. Inget resultat väljs automatiskt.
 * Sifferfrågor kräver exakt fyra siffror; namn matchas som delsträng.
 * Svenska bokstäver behålls: a, å och ä är olika tecken.
 */
export function searchMunicipalities(query: string): MunicipalitySearchResult[] {
  const term = normalize(query);
  if (!term) return [];
  const matches = /^\d+$/.test(term)
    ? municipalities.filter(item => /^\d{4}$/.test(term) && item.code === term)
    : municipalities.filter(item => normalize(item.name).includes(term));
  // Nya objekt gör att anroparen inte kan ändra registret via ett sökresultat.
  return matches.map(item => ({ ...item }));
}
