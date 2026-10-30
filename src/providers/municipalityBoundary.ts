import { parseMunicipalityLookupResponse, parseWgs84AreaGeometry } from '../domain/validation.ts';

// KommunFeature.geometry beskrivs uttryckligen som WGS84 i leverantörens OpenAPI.
export function parseMunicipalityBoundary(value: unknown, expectedCode: string) {
  if (!value || typeof value !== 'object') throw new Error('Ogiltigt kommunsvar.');
  const feature = value as Record<string, unknown>;
  if (feature.type !== 'Feature' || !feature.properties || typeof feature.properties !== 'object') {
    throw new Error('Kommunens GeoJSON saknar egenskaper.');
  }
  const municipality = parseMunicipalityLookupResponse({
    ...feature.properties, attribution: feature.attribution,
  });
  if (municipality.kommunkod !== expectedCode) throw new Error('Svaret gäller en annan kommun.');
  const geometry = parseWgs84AreaGeometry(feature.geometry, {
    status: 'known', identifier: 'EPSG:4326', axisOrder: 'longitude-latitude',
  });
  return { municipality, geometry };
}

export async function fetchMunicipalityBoundary(code: string, signal: AbortSignal) {
  if (!/^\d{4}$/.test(code)) throw new Error('Ange en fyrsiffrig kommunkod.');
  const response = await fetch(`https://api.kart-api.se/v1/kommun/${code}`, { signal });
  if (response.status === 404) throw new Error('Ingen kommun hittades med den koden.');
  if (!response.ok) throw new Error(`Kommungränsen kunde inte hämtas (HTTP ${response.status}).`);
  return parseMunicipalityBoundary(await response.json(), code);
}
