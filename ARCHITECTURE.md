# Arkitektur

Status 7 november 2026: P1–P4 är implementerade och sammanslagna till `main`. P4:s kommunstatistik levererades genom PR #16 (`50fe0e3`); PR #17 (`d7e63eb`) förenklade panelen och kommunens sökval. Båda ingår i den publicerade GitHub Pages-versionen. Gränssnittet har delarna Välj område, Välj data och Resultat och analys. Platsökning i UI, fler områdestyper, befolkningsrutlager och rumslig analys är fortsatt planerade. Aktuell funktionsstatus finns i README och beslut dokumenteras i docs/DECISIONS.md.

## Grundval

Lokal modellkomplettering 8 november 2026: varje `PlaceMunicipalityGroup` har en `hits`-lista med alla fullständiga `GeocodeHit`-poster, även vid identiskt namn, kommun och övriga fält. Ingen deduplicering av poster eller härledning av ID görs. `places` är fortsatt en lista med unika visningsetiketter för befintligt UI; den ska inte användas som källa för individuella platsval. Gränssnitt, kommunstatistik och användning av koordinater ändras inte i detta steg.

Lokalt P5.1-tillägg 7 november 2026: `src/state/placeSearch.ts` äger sökladdning och API-resultat, med egen AbortController och requestId. `src/ui/placeSearch.ts` visar attribution, kommunfilter och grupper från den rena funktionen `groupPlacesByMunicipality()` i `src/domain/placeSearch.ts`. Kommunnamn matchas mot SCB-kodlistan. Endast uttryckligt kommunval skickar en kommunkod till P3:s `selectMunicipality()`; sökning ensam ändrar inte valt område eller statistik. P5.1 använder inga geocode-koordinater eller bbox och innebär ingen geometrisk matchning. Ett nytt kommunval rensar sökträffar och avbryter sökning via befintligt laddningstillstånd. Inga nya beroenden införs. Exakt platsval och övriga P5-områdestyper återstår.

P4:s levererade statistikkoppling: `main.ts` kopplar samma `areaSelection.subscribe()` till `createMunicipalityStatistics()` i `src/state/municipalityStatistics.ts`. Statistikmodulen äger endast statistikens `AbortController`, requestId och laddnings-/resultat-/feltillstånd; P3:s kommunval förblir oförändrat. Hämtning börjar efter bekräftat kommunval, och varje nytt områdestillstånd rensar föregående resultat. `src/ui/municipalityOverview.ts` renderar tillståndet med svenskt talformat, referenstider, SCB-källa och GIS-begränsningar. PR #17 ändrar presentationen och väljer en ensam sökträff direkt efter Sök kommun eller Enter; flera träffar kräver fortsatt val. Referenstider, licenser och noter finns i Källor och begränsningar, och gränssvarets attribution visas även i Leaflet. Datakällor och API-anrop är oförändrade. Detta är kodkopplad kommunstatistik, inte en verifierad geografisk join eller analys av visningspolygonen.

P3:s levererade kommunval: vänsterpanelen har områdesval och platser för dataval och analys. Kartklick använder kommunuppslaget och hämtar sedan endast vald kommun via `municipalityBoundary.ts`. GeoJSON valideras före rendering. Nya val avbryter tidigare anrop och ett löpnummer hindrar sena svar från att ändra valet. Namn, kod, attribution och geometri kommer från API:t. Dataval och rumslig analys är ännu planerade; gränsgeometrin används endast för visning.

En statisk webbklient byggs med TypeScript, Vite och Leaflet. Ingen server eller databas behövs innan ett verifierat behov finns. Valet bygger vidare på Gabrielas erfarenhet av Leaflet, HTML, CSS och JavaScript och lämpar sig för en första GitHub-publicering samt senare drift på gislab.se.

Välj aktuella stödda biblioteksversioner när projektgrunden skapas, ange Node-version och checka in package-lock.json. Rita-funktionen behöver ett Leaflet-kompatibelt verktyg; välj efter kontroll av underhåll, licens, mobilstöd och redigering. Biblioteket är ännu inte valt.

## Dataflöde

```mermaid
flowchart LR
    User[Kommun, region, sammansatt eller ritat område] --> State[Gemensamt apptillstånd]
    State --> Providers[Datakällornas adaptrar]
    Providers --> APIs[Verifierade API:er]
    APIs --> Validate[Validering och normalisering]
    Validate --> Analysis[Analys i avgränsat utsnitt]
    Analysis --> UI[Karta och resultat med källmetadata]
    State --> UI
```

Adaptrarna kapslar in leverantörernas svar och fel. UI och analys får interna, validerade datatyper. Byte av leverantör ska inte kräva ändringar i varje kartkomponent.

## Planerad struktur

Strukturen skapas successivt av Gabriela i P1–P7. Alla kataloger nedan finns inte ännu.

```text
src/
  main.ts                 start och komposition
  config/                 startvyns koordinater som konfigurationsdata
  map/                    kartlager, urval och ritverktyg
  ui/                     formulär, resultat, legend och status
  state/                  valt område, laddning och resultat
  providers/              kart-api, SCB och normalisering
  analysis/               rena beräkningar och rumsliga urval
  domain/                 gemensamma typer och validering
public/                    små tillåtna statiska resurser
scripts/                   reproducerbara data- och byggverktyg
tests/                     kontrakt, analys och användarflöden
docs/                      metoder, beslut och drift
```

## Interna kontrakt

P2 innehåller de fem typerna nedan samt runtime-validering och små lagligt delbara provsvar. Det nuvarande områdeskontraktet täcker kommun och ritat område; regioner och sammansatta områden kräver en senare, separat utvidgning.

| Objekt | Minsta information |
| --- | --- |
| AreaOfInterest | ID, namn, urvalstyp, geometri och geometriårgång |
| SourceMetadata | Leverantör, käll-URL, licens/attribution, referenstid, hämtningstid, CRS och geografisk täckning |
| MunicipalityStatistics | Kommunkod som text, folkmängd, landareal, täthet, enheter och saknatillstånd |
| PopulationGridCell | Stabilt rut-ID, hel rutgeometri, populationsvärde/saknatillstånd och källmetadata |
| AnalysisResult | Mått, värde, enhet, geografisk referens, metod, källmetadata, fullständighet och begränsningar |

Skilj mellan `loading`, `ready`, `empty` och `error`. Ett lyckat svar kan vara ofullständigt eller begränsat av ett API-tak. Det får inte visas som fullständig täckning.

## Koordinater och beräkningar

- Webbgeometrier: GeoJSON i WGS 84, EPSG:4326, med [longitud, latitud]. Leaflets egna koordinatpar följer bibliotekets kontrakt och måste konverteras uttryckligt vid gränsen.
- Källdata kan ha SWEREF 99 TM, EPSG:3006, eller andra CRS. Kontrollera metadata före omprojektion.
- Arealer: använd publicerad SCB-landareal för kommunstatistik. Geometrisk yta beräknas med dokumenterad geodetisk metod eller projektion avsedd för beräkningen; ytan är inte automatiskt landareal.
- Analysfunktioner ska kunna testas utan kartbibliotek eller nätverk.

## Nätverk och prestanda

Hämta ett begränsat utsnitt efter bekräftat områdesval. Avbryt inaktuella anrop, fördröj sökning under pågående skrivning och återanvänd identiska svar. Matcha varje svar mot det områdesval som startade anropet så att ett sent svar inte ersätter aktuell vy.

P2 ska verifiera CORS, paginering, maxstorlek, felkoder, geografiskt filter och villkor för cache. En godkänd dokumentationslänk är inte ett godkänt integrationstest. Nationella rådata får inte lastas in vid varje sidvisning.

Om datakällan inte kan användas direkt från webbläsaren väljs antingen en annan tillåten källa, ett tillåtet förberett utdrag eller en liten serveradapter. Hemliga nycklar kräver serveradapter. Det beslutet tas före implementation av beroende funktioner.

## Publicering och kvalitet

Vite ska stödja en underkatalog med korrekt bas-URL. En GitHub Actions-körning efter push till privata `gislab-se/platsorientering` på `main` ska bygga med bas-URL `/platsorientering/` och överföra endast den kontrollerade `dist/`-artefakten till det publika repot `yakimovskagabriela-ctrl/platsorientering`. Åtkomst sker med en separat, minimalt behörig Actions-hemlighet; privat källkod och P2-arbetsfiler ska inte kopieras. Den verkliga Pages-URL:en ska verifieras efter första publiceringen. Slutversionens resurser och dataanrop ska även fungera under den bekräftade sökvägen på gislab.se. Startversionen behöver ingen klientrouter eller SPA-omskrivning.

Gabriela inför typkontroll, enhetstester för analys och integrationstester med sparade provsvar. Ett webbläsartest ska täcka platsval → resultat → rita → sammanställning. Live-API-kontroll hålls separat så att kvoter och externa driftfel inte gör vanliga tester instabila.
