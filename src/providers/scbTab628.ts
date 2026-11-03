import type { MunicipalityStatistics, NumericValue, SourceMetadata } from '../domain/contracts';
import { municipalityDirectory } from '../data/municipalities.ts';
import { parseMunicipalityCode, parseMunicipalityStatistics, parseSourceMetadata, ValidationError } from '../domain/validation.ts';

function invalid(message: string): never {
  throw new ValidationError('TAB628', message);
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid('Förväntade ett objekt.');
  return value as Record<string, unknown>;
}

// Ren omvandling av det dokumenterade JSON-stat2-urvalet för 2025.
// Inga anrop, geometriska kopplingar eller egna täthetsberäkningar görs här.
export function parseTab628Statistics(
  body: unknown, code: string, source: SourceMetadata,
): MunicipalityStatistics {
  const municipalityCode = parseMunicipalityCode(code);
  if (!municipalityDirectory.some(item => item.code === code)) invalid('Okänd kommunkod i den lokala SCB-kodlistan.');
  const metadata = parseSourceMetadata(source);
  if (metadata.provider !== 'SCB' || metadata.dataset !== 'TAB628') {
    invalid('Källmetadata måste ange provider SCB och dataset TAB628.');
  }
  let sourceUrl: URL;
  try {
    sourceUrl = new URL(metadata.sourceUrl);
  } catch {
    return invalid('Källmetadata måste ha en giltig SCB-URL för TAB628.');
  }
  if (sourceUrl.origin !== 'https://statistikdatabasen.scb.se'
    || sourceUrl.pathname !== '/api/v2/tables/TAB628/data'
    || sourceUrl.username !== '' || sourceUrl.password !== '') {
    invalid('Källmetadata måste hänvisa till SCB:s TAB628-dataendpoint.');
  }
  // Statistikår, inte hämtningstid. Måttens skilda referensdagar sätts nedan.
  if (metadata.referenceTime.status !== 'known'
    || metadata.referenceTime.value.kind !== 'year'
    || metadata.referenceTime.value.year !== 2025) {
    invalid('Källmetadata måste ange känt referensår 2025.');
  }
  const data = record(body);
  if (data.class !== 'dataset' || data.version !== '2.0') invalid('Förväntade JSON-stat2.');
  if (record(record(data.extension).px).tableid !== 'TAB628') invalid('Fel SCB-tabell.');
  // Statuskoder behöver verifieras innan de kan tolkas som sekretess eller annat.
  if (data.status !== undefined) invalid('Statusfält stöds ännu inte; inga statuskoder tolkas automatiskt.');
  const ids = data.id;
  const sizes = data.size;
  const values = data.value;
  const expected = ['Region', 'Kon', 'ContentsCode', 'Tid'];
  if (!Array.isArray(ids) || ids.length !== 4 || new Set(ids).size !== 4
    || !expected.every(id => ids.includes(id))) invalid('Felaktiga eller duplicerade dimensioner.');
  if (!Array.isArray(sizes) || sizes.length !== 4
    || !sizes.every(n => Number.isSafeInteger(n) && n > 0)) invalid('Ogiltiga dimensionsstorlekar.');
  const count = sizes.reduce((a: number, b: number) => a * b, 1);
  if (!Array.isArray(values) || values.length !== count) invalid('Ofullständigt värdeutdrag.');
  const dimensionIds = [...ids];
  const dimensionSizes = [...sizes];
  const dataValues = [...values];
  const dimensions = record(data.dimension);
  const indices: Record<string, Record<string, unknown>> = {};
  for (const [position, id] of ids.entries()) {
    const index = record(record(record(dimensions[id]).category).index);
    const entries = Object.values(index);
    if (entries.length !== sizes[position] || new Set(entries).size !== entries.length
      || !entries.every(n => Number.isInteger(n) && Number(n) >= 0 && Number(n) < sizes[position])) {
      invalid('Duplicerade eller ogiltiga kategoriindex.');
    }
    indices[id] = index;
  }
  if (!Object.hasOwn(indices.Region, code)) invalid('Kommunen saknas i SCB-svaret.');
  for (const region of Object.keys(indices.Region)) {
    if (!municipalityDirectory.some(item => item.code === region)) invalid('Svaret innehåller okänd kommunkod.');
  }
  if (Object.keys(indices.Kon).length !== 1 || indices.Kon['1+2'] !== 0
    || Object.keys(indices.Tid).length !== 1 || indices.Tid['2025'] !== 0
    || Object.keys(indices.ContentsCode).length !== 3
    || !['BE0101U1', 'BE0101U2', 'BE0101U3'].every(key => Object.hasOwn(indices.ContentsCode, key))) {
    invalid('Förväntade totalt kön, år 2025 och de tre dokumenterade måtten.');
  }
  function read(measureCode: string): NumericValue {
    const selection: Record<string, string> = { Region: code, Kon: '1+2', ContentsCode: measureCode, Tid: '2025' };
    let offset = 0;
    for (const [i, id] of dimensionIds.entries()) offset = offset * dimensionSizes[i] + Number(indices[id][selection[id]]);
    const value: unknown = dataValues[offset];
    if (value === null) return { status: 'missing', reason: 'SCB returnerade null; orsaken är inte verifierad.' };
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0
      || (measureCode === 'BE0101U2' && !Number.isInteger(value))) invalid('Ogiltigt statistikvärde.');
    return { status: 'available', value };
  }
  const population = read('BE0101U2');
  const landArea = read('BE0101U3');
  const publishedDensity = read('BE0101U1');
  const density: NumericValue = landArea.status !== 'available' || landArea.value <= 0
    ? { status: 'missing', reason: 'Täthet visas inte när positiv landareal saknas.' }
    : publishedDensity;
  const date = (value: string) => ({ status: 'known' as const, value: { kind: 'date' as const, date: value } });
  return parseMunicipalityStatistics({
    municipalityCode,
    divisionVintage: { status: 'unknown', reason: 'Indelningsår och kompatibilitet med kartgränsen är inte verifierade.' },
    population: { value: population, unit: 'persons', referenceTime: date('2025-12-31') },
    landArea: { value: landArea, unit: 'km2', referenceTime: date('2026-01-01') },
    density: { value: density, unit: 'persons/km2', referenceTime: {
      status: 'known', value: { kind: 'period', start: '2025-12-31', end: '2026-01-01' },
    } },
    source: metadata,
  });
}
