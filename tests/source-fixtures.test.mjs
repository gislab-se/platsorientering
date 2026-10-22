// Offlinekontroller av dokumenterade DELSCHEMAN, inte produktionsvalidatorer.
// Ingen normalisering, transformation eller nätverksadapter implementeras här.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseMunicipalityCode, parseMunicipalityStatistics, parsePopulationGridCell,
  parseWgs84AreaGeometry, ValidationError,
} from '../src/domain/validation.ts';

const fixtures = Object.fromEntries([
  'kart-api-geocode', 'kart-api-lookup', 'scb-tab628', 'scb-wfs',
].map(name => [name, JSON.parse(readFileSync(new URL(`./fixtures/${name}.synthetic.json`, import.meta.url), 'utf8'))]));
function scenario(source, id) {
  const entry = fixtures[source].cases.find(value => value.id === id);
  assert.ok(entry, `Fixturfall saknas: ${source}/${id}`);
  return entry;
}
function strings(value) {
  assert.ok(Array.isArray(value));
  for (const item of value) assert.equal(typeof item, 'string');
}
function geocodeSubset(body) {
  assert.equal(typeof body.query, 'string');
  assert.ok(Number.isInteger(body.antal) && body.antal >= 0);
  assert.ok(Array.isArray(body.results), 'results måste vara en lista');
  assert.equal(body.antal, body.results.length);
  strings(body.attribution);
  for (const hit of body.results) {
    for (const field of ['lat', 'lon', 'namn', 'tier', 'kalla']) assert.ok(Object.hasOwn(hit, field), `GeoTraff saknar ${field}`);
    assert.ok(Number.isFinite(hit.lat));
    assert.ok(Number.isFinite(hit.lon));
    assert.equal(typeof hit.namn, 'string');
    // tier/kalla: endast närvaro belagd. Ingen typ eller enum antas.
  }
  assert.ok(Number.isInteger(body.spridning.traffar));
  assert.ok(Number.isInteger(body.spridning.kommuner));
  assert.ok([true, false, null].includes(body.spridning.entydig));
}
function lookupSubset(body) {
  parseMunicipalityCode(body.kommunkod);
  for (const field of ['kommunnamn', 'lanskod', 'lansnamn']) assert.equal(typeof body[field], 'string');
  strings(body.attribution);
}
function tabValuesSubset(body) {
  assert.deepEqual(body.id, ['Region', 'Kon', 'ContentsCode', 'Tid']);
  assert.equal(body.size.length, body.id.length);
  assert.ok(body.size.every(n => Number.isInteger(n) && n >= 0));
  assert.ok(Array.isArray(body.value));
  assert.equal(body.value.length, body.size.reduce((a, b) => a * b, 1), 'Antalet datapositioner stämmer inte med dimensionerna');
  for (const value of body.value) assert.ok(value === null || Number.isFinite(value));
  // Endast fixturens täta arrayformat, inte alla JSON-stat2-representationer.
}
function wfsSubset(body) {
  assert.equal(body.type, 'FeatureCollection');
  assert.ok(Array.isArray(body.features));
  assert.ok(Number.isInteger(body.numberMatched) && body.numberMatched >= 0);
  assert.equal(body.numberReturned, body.features.length);
  assert.ok(body.numberReturned <= body.numberMatched);
  for (const feature of body.features) {
    assert.equal(feature.type, 'Feature');
    assert.ok(feature.properties.beftotalt === null || Number.isFinite(feature.properties.beftotalt), 'beftotalt har fel typ');
    for (const field of ['objectid', 'rutid_inspire', 'rutid_scb', 'rutstorl', 'referenstid']) assert.ok(Object.hasOwn(feature.properties, field), `Rutobjekt saknar ${field}`);
    assert.equal(feature.geometry?.type, 'Polygon');
    assert.ok(Array.isArray(feature.geometry.coordinates));
  }
  // Gäller bara det undersökta delschemat; inga generella WFS-garantier.
}

for (const [name, fixture] of Object.entries(fixtures)) {
  test(`${name}: JSON kan läsas, är syntetiskt märkt och har unika fall`, () => {
    assert.equal(fixture.synthetic, true);
    assert.equal(typeof fixture.description, 'string');
    assert.ok(fixture.cases.length > 0);
    assert.equal(new Set(fixture.cases.map(c => c.id)).size, fixture.cases.length);
    for (const entry of fixture.cases) {
      assert.equal(typeof entry.purpose, 'string');
      assert.ok(Number.isInteger(entry.httpStatus));
      assert.notEqual(Object.hasOwn(entry, 'body'), Object.hasOwn(entry, 'bodySubset'));
    }
  });
}
test('Geocode: kända träfffält och antal är konsekventa i begränsat svar', () => {
  const entry = scenario('kart-api-geocode', 'limited-results');
  assert.equal(entry.httpStatus, 200);
  geocodeSubset(entry.body);
  assert.equal(entry.body.results.length, entry.expectedResultsLength);
  assert.ok(entry.body.spridning.traffar > entry.body.antal);
  assert.equal(entry.body.spridning.entydig, false);
});
test('Geocode: varje redovisat obligatoriskt GeoTraff-fält krävs av delschemat', () => {
  for (const field of ['lat', 'lon', 'namn', 'tier', 'kalla']) {
    const body = structuredClone(scenario('kart-api-geocode', 'limited-results').body);
    delete body.results[0][field];
    assert.throws(() => geocodeSubset(body), /GeoTraff saknar/);
  }
});
test('Geocode: tomt efter filter hålls åtskilt från namnets spridning', () => {
  const body = scenario('kart-api-geocode', 'filtered-empty').body;
  geocodeSubset(body);
  assert.deepEqual(body.results, []);
  assert.equal(parseMunicipalityCode(body.kommunfilter.begard), '0001');
  assert.ok(body.kommunfilter.bortfiltrerade > 0);
  assert.equal(typeof body.kommunfilter.skal, 'string');
  assert.ok(body.spridning.traffar > 0);
});
test('Geocode: strukturerat 422-fel är inte en tom lyckad resultatlista', () => {
  const entry = scenario('kart-api-geocode', 'required-query-error');
  assert.equal(entry.httpStatus, 422);
  assert.equal(typeof entry.body.detail, 'string');
  assert.equal(typeof entry.body.skal, 'string');
  assert.ok(entry.body.fel.length > 0);
  assert.equal(entry.body.fel[0].falt, 'q');
  assert.equal(typeof entry.body.fel[0].varfor, 'string');
  assert.throws(() => geocodeSubset(entry.body));
});
test('Geocode: felaktig resultattyp avvisas av delschemat', () => {
  assert.throws(() => geocodeSubset(scenario('kart-api-geocode', 'invalid-results-type').body), /results måste/);
});
test('Lookup: kända fält, strängkod och attribution bevaras i råsvaret', () => {
  const body = scenario('kart-api-lookup', 'municipality-found').body;
  lookupSubset(body);
  assert.equal(body.kommunkod, '0001');
  assert.ok(body.attribution.length > 0);
});
test('Lookup: 404 utan träff är ett eget råsvar, inte ett lyckat kommunobjekt', () => {
  const entry = scenario('kart-api-lookup', 'outside-municipalities');
  assert.equal(entry.httpStatus, 404);
  assert.equal(typeof entry.body.detail, 'string');
  assert.throws(() => lookupSubset(entry.body), ValidationError);
});
test('Lookup: numerisk kommunkod avvisas utan utfyllnad', () => {
  assert.throws(() => lookupSubset(scenario('kart-api-lookup', 'invalid-municipality-code').body), ValidationError);
});
test('TAB628: JSON-stat2-dimensioner, måttkoder, noll och null kan granskas offline', () => {
  const body = scenario('scb-tab628', 'three-measures-zero-and-missing').body;
  assert.equal(body.version, '2.0');
  assert.equal(body.class, 'dataset');
  tabValuesSubset(body);
  for (const [i, id] of body.id.entries()) {
    const indexes = Object.values(body.dimension[id].category.index);
    assert.equal(indexes.length, body.size[i]);
    assert.deepEqual([...indexes].sort((a, b) => a - b), Array.from({ length: body.size[i] }, (_, n) => n));
  }
  assert.equal(parseMunicipalityCode(Object.keys(body.dimension.Region.category.index)[0]), '0001');
  assert.deepEqual(Object.keys(body.dimension.ContentsCode.category.index), ['BE0101U1', 'BE0101U2', 'BE0101U3']);
  assert.ok(Object.hasOwn(body.dimension.Kon.category.index, '1+2'));
  assert.equal(body.value[0], 0);
  assert.equal(body.value[2], null); // Ingen gissad klassificering som sekretess.
});
test('TAB628: ofullständigt värdeutdrag kan inte räknas som komplett dataset', () => {
  const entry = scenario('scb-tab628', 'incomplete-values');
  assert.ok(!Object.hasOwn(entry, 'body'));
  assert.throws(() => tabValuesSubset(entry.bodySubset), /Antalet datapositioner/);
});
test('WFS: antal skiljer en giltig begränsad sida från ett komplett uttag', () => {
  const body = scenario('scb-wfs', 'limited-page-projected-geometry').body;
  wfsSubset(body);
  assert.ok(body.numberMatched > body.numberReturned);
  const properties = body.features[0].properties;
  assert.equal(properties.beftotalt, 0);
  assert.equal(properties.man, null);
  assert.equal(properties.kvinna, null);
});
test('WFS: tom FeatureCollection godtas som tomt uttag i delschemat', () => {
  const body = scenario('scb-wfs', 'empty-selection').body;
  wfsSubset(body);
  assert.equal(body.numberMatched, 0);
  assert.deepEqual(body.features, []);
});
test('WFS: felaktigt befolkningsfält avvisas, inte omvandlas till noll', () => {
  const body = scenario('scb-wfs', 'invalid-population-type').bodySubset;
  assert.throws(() => wfsSubset(body), /beftotalt har fel typ/);
});
test('WFS: källgeometrin i EPSG:3006 får inte bli färdig WGS84', () => {
  const body = scenario('scb-wfs', 'limited-page-projected-geometry').body;
  assert.equal(body.crs.properties.name, 'urn:ogc:def:crs:EPSG::3006');
  assert.throws(() => parseWgs84AreaGeometry(body.features[0].geometry, {
    status: 'known', identifier: 'EPSG:3006', axisOrder: 'easting-northing',
  }), ValidationError);
});
test('Råa TAB628- och WFS-svar är inte interna domänobjekt', () => {
  assert.throws(() => parseMunicipalityStatistics(scenario('scb-tab628', 'three-measures-zero-and-missing').body), ValidationError);
  assert.throws(() => parsePopulationGridCell(scenario('scb-wfs', 'limited-page-projected-geometry').body.features[0], {
    status: 'known', identifier: 'EPSG:3006', axisOrder: 'easting-northing',
  }), ValidationError);
});

// Dokumenterade luckor, inga gissade normaliserare eller schemafält:
// - GeoTraff tier/kalla: typ/enum inte belagda, bara fältnärvaro testas.
// - TAB628: ingen leverantörsspecifik sekretesskod eller fel-/tomsvarsstruktur belagd.
// - WFS: stabilt ID-format och fullständiga fälttyper inte belagda.
// - Fixturernas simulerade HTTP-status säger inget om verklig transport eller CORS.
// - Fullständig normalisering, CRS-transformation och adapterintegration testas inte.
