# Arkitektur

Status: beslutad utgångspunkt för implementation, 15 oktober 2026. P1-grundfiler finns. Ren installation, typkontroll, bygge och serverstart har verifierats i en separat kopia. Gabriela har bekräftat kartvisning, zoom, panorering, återställningsknapp och layout på dator och i simulerat mobilformat med smal skärm, samt musrullszoom på dator. Typkontroll och bygge passerar med musrullszoom aktiverad. Installation från en faktisk ny klon, Gabrielas genomgång och CI-körning återstår för P1. Fysisk mobil är ännu inte testad. Ändringar dokumenteras i docs/DECISIONS.md.

## Grundval

En statisk webbklient byggs med TypeScript, Vite och Leaflet. Ingen server eller databas behövs innan ett verifierat behov finns. Valet bygger vidare på Gabrielas erfarenhet av Leaflet, HTML, CSS och JavaScript och ger en liten driftsättning på gislab.se.

Välj aktuella stödda biblioteksversioner när projektgrunden skapas, ange Node-version och checka in package-lock.json. Rita-funktionen behöver ett Leaflet-kompatibelt verktyg; välj efter kontroll av underhåll, licens, mobilstöd och redigering. Biblioteket är ännu inte valt.

## Dataflöde

```mermaid
flowchart LR
    User[Platsval eller ritat område] --> State[Gemensamt apptillstånd]
    State --> Providers[Datakällornas adaptrar]
    Providers --> APIs[Verifierade API:er]
    APIs --> Validate[Validering och normalisering]
    Validate --> Analysis[Analys i avgränsat utsnitt]
    Analysis --> UI[Karta och resultat med källmetadata]
    State --> UI
```

Adaptrarna kapslar in leverantörernas svar och fel. UI och analys får interna, validerade datatyper. Byte av leverantör ska inte kräva ändringar i varje kartkomponent.

## Planerad struktur

Skapas successivt av Gabriela i P1–P7; trädet är inte en lista över redan befintliga filer.

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

Gabriela konkretiserar typerna i P2 och sparar små lagligt delbara provsvar. Följande behöver finnas:

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

Vite ska stödja den slutliga underkatalogen med korrekt bas-URL. Kartor, dataanrop och resurser måste fungera även när appen ligger under en sökväg på gislab.se. Startversionen behöver ingen klientrouter eller SPA-omskrivning.

Gabriela inför typkontroll, enhetstester för analys och integrationstester med sparade provsvar. Ett webbläsartest ska täcka platsval → resultat → rita → sammanställning. Live-API-kontroll hålls separat så att kvoter och externa driftfel inte gör vanliga tester instabila.
