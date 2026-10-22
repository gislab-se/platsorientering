# Datakällor och API-utvärdering

Sammanställt 22 oktober 2026 för P2. Underlaget är Gabrielas redovisade externa tester i Codex-konversationen, det bifogade utkastet ”P2 – Datakällor: verifierade fynd och öppna punkter” (sammanställt 2026-10-22) samt dokumentationsgenomgångar i samma konversation. Inga nya anrop har gjorts vid denna dokumentationsändring.

- **Observation:** ett redovisat externt testresultat, inte ett test som upprepats i projektet eller oberoende verifierats av AI.
- **Dokumentation:** leverantörsuppgift, inte uppmätt beteende.
- **Öppet:** underlag eller beslut saknas. Sammanställningsdatum är inte automatiskt hämtningsdatum.

Inga liveintegrationer eller kontraktstester är byggda i detta repo. Inga separata provsvar/testfixturer har sparats. GitHub Issue #2 har inte kunnat läsas i genomgången; kravjämförelsen utgår från P2 i [ROADMAP](../ROADMAP.md) och [ARCHITECTURE](../ARCHITECTURE.md). Slutliga källval och serverbehov är inte avgjorda.

## kart-api: dokumentation och gemensamma villkor

Gabriela kontrollerade [OpenAPI](https://api.kart-api.se/openapi.json), [villkor](https://kart-api.se/villkor/) och [attribution](https://kart-api.se/docs/attribution/) **22 oktober 2026**. Dokumentation hade även granskats 15 oktober enligt den tidigare projekttexten. I konversationen kunde OpenAPI läsas tidigare i genomgången men inte vid senaste försöket; ingen lokal kontraktskopia finns.

Dokumenterade uppgifter:

- API-sökväg `/v1`, kontraktets `info.version=1.0.0`, specifikationsformat OpenAPI 3.1.0.
- 200 anrop/dygn/IP utan nyckel; 10 000 anrop/månad med nyckel under betan. Kvottillämpning och nyckelbaserad åtkomst är inte browsertestade.
- Visning, uppslag och rimlig cache tillåts med korrekt attribution. Egen databas för vidare distribution som dataprodukt eller bulk tillåts inte.
- Beta utan garanterad servicenivå. Dokumentationen avgränsar tjänsten till Sverige; det belägger inte fullständighet för alla svenska platser.
- Attribution ska följa med där data visas. Faktiska svarets lista har företräde framför attributionssidans sammanställning. För geocode anger sidan Lantmäteriet / Ortnamn / CC BY 4.0 / Bearbetad, med OpenStreetMap när träffen är en adress.

### Kommunuppslag: observationer

Exakta GET-anrop och redovisade svar:

| Anrop | Resultat |
| --- | --- |
| `https://api.kart-api.se/v1/kommun/lookup?lat=58.705&lon=15.77` | HTTP 200; `kommunkod="0562"`, `kommunnamn="Finspång"`, `lanskod="05"`, `lansnamn="Östergötland"`. Attribution: Lantmäteriet / Administrativ indelning / CC BY 4.0. |
| `https://api.kart-api.se/v1/kommun/lookup?lat=999&lon=15.77` | HTTP 422; fälten `detail`, `skal`, `fel`; `fel[0].falt="lat"`. |
| `https://api.kart-api.se/v1/kommun/lookup?lat=58.0&lon=20.0` | HTTP 404; `detail="utanför Sveriges kommuner"`. |

GET från lokal Vite-origin uppges ge läsbart JSON. `Access-Control-Allow-Origin: *` observerades uttryckligen för 422-anropet; detta fastställer inte headern för samtliga statuskoder. Exakt lokal origin och individuella test-/hämtningsdatum saknas; resultaten ingick i utkastet sammanställt 2026-10-22.

Parametrarna anges i geografiska grader. Ett felmeddelande angav ungefärligt Sverige-fönster latitud 55–69,5 och longitud 10–24,5. Detta är en observerad valideringsgräns, inte belägg för CRS, gränsårgång eller full geografisk täckning.

### Platsökning: dokumenterat kontrakt

[Kom igång](https://kart-api.se/docs/) och det granskade OpenAPI-kontraktet beskriver `/v1/geocode` med obligatorisk `q`, valfri `kommunkod` och `limit` 1–20, standard 5. Ingen offset- eller pagineringsparameter är dokumenterad. Kontraktet anger ortnamn/kommunnamn från Lantmäteriet och gatuadresser från OpenStreetMap. Detta är dokumentationsuppgifter, inte observationer om varje träff.

### Platsökning: observationer

Testerna redovisades som genomförda **22 oktober 2026** i Microsoft Edge från lokal Vite-miljö. För felprovet anges exakt origin `http://127.0.0.1:5173/`; samma exakta origin är inte separat angiven för varje övrigt prov.

| Exakt GET-anrop | Observerat resultat |
| --- | --- |
| `https://api.kart-api.se/v1/geocode?q=Fridhem&limit=3` | HTTP 200; `antal=3`, `results.length=3`, resultat med koordinater. `spridning.traffar=1198`, `spridning.kommuner=217`, `spridning.entydig=false`. För Fridhem-provet redovisas läsbart svar och `Access-Control-Allow-Origin: *`. |
| `https://api.kart-api.se/v1/geocode?q=Fridhem&limit=5` | HTTP 200; `antal=5`, `results.length=5`; samma spridningsvärden: 1198 träffar, 217 kommuner, `entydig=false`. CORS-header inte separat redovisad. |
| `https://api.kart-api.se/v1/geocode?q=Stockholm&limit=3&kommunkod=0562` | `query="Stockholm"`, `antal=0`, `results=[]`, `kommunfilter.begard="0562"`, `kommunfilter.bortfiltrerade=1`. `spridning.traffar=63`, `spridning.kommuner=48`, `spridning.entydig=false`. Statuskod och CORS-header inte separat redovisade. |
| `https://api.kart-api.se/v1/geocode?limit=3` | HTTP 422 Unprocessable Content; `detail="parametern q ligger utanför tillåtet intervall"`, `fel[0].falt="q"`, `fel[0].varfor="Field required"`. `skal` innehåller en generell förklaring om Sveriges koordinatfönster. |

Kommunfiltrets `skal` var: ”1 träff(ar) låg i en annan kommun och togs bort. Noll kvar betyder att ingen träff låg i 0562, inte att platsen inte finns.” Tomt filtrerat svar betyder inte att Stockholm saknas. Testet belägger bortfiltrering av den redovisade träffen, inte att alla tänkbara matchningar i kommunen genomsökts.

Fridhem-proven visar att resultatlistan begränsas av `limit` medan spridningsuppgifterna är oförändrade. Tre eller fem resultat är inte alla matchningar. Spridningsuppgifter ska hållas åtskilda från resultatlistans antal och kommunfiltrets utfall. Limit-gränserna 1 och 20 har inte testats; de är kontraktsuppgifter.

422-provet belägger ett strukturerat felsvar för saknad `q`. Koordinatförklaringen i `skal` är inte specifik för detta fel. Proven verifierar API-beteende, inte projektets framtida validering, felhantering eller gränssnitt.

### Öppet för kart-api

- Uttryckligt CRS/datum och axelordning för koordinaterna. Rimliga talvärden bevisar inte EPSG:4326.
- Källdatats referenstid/version, uppdateringsfrekvens hos kart-api och fördröjning gentemot Lantmäteriet/OSM.
- Geografiska luckor och sökbegränsningar samt gränskälla och geometriårgång för kommunuppslag och geocodes kommunfilter.
- Närmare cachevillkor, inklusive lagringstid. Visnings- och cacherätt avgör inte automatiskt rätt till versionshantering av verkliga provsvar.
- Verkliga provsvar i **privat GitHub-repo: öppet**. Villkoren nämner inte testfixturer eller privat versionshantering; privat repo är inte automatiskt lokal cache.
- Verkliga provsvar i **offentligt GitHub-repo: öppet**. Villkoren tillåter uppslagssvar men klargör inte uttryckligen publicerade testfixturer. Varken generellt tillstånd eller förbud mot varje litet svar är fastställt. Leverantörens klargörande behövs för båda fallen; attribution ska bevaras.
- Fullständig rutleverans via kart-api är inte verifierad här. Direkt SCB WFS har undersökts som alternativ.
- Serverbehov är inte avgjort. Lokala browserprov belägger bara testade anrop. Hemliga nycklar ska inte läggas i klientkod.

## SCB TAB628: kommunstatistik

### Observationer

Leverantör SCB, PxWeb API v2. Redovisade adresser:

```text
Metadata: https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv
Data: GET https://statistikdatabasen.scb.se/api/v2/tables/TAB628/data
```

Redovisat urval (den fullständiga URL-kodade anropsadressen saknas):

```text
lang=sv
outputFormat=json-stat2
codelist[Region]=vs_RegionKommun07EjAggr
valueCodes[Region]=*
valueCodes[Kon]=1+2
valueCodes[ContentsCode]=BE0101U1,BE0101U2,BE0101U3
valueCodes[Tid]=2025
```

Uttaget gav 290 kommuner och 870 datapositioner. JSON-stat2: `id=[Region,Kon,ContentsCode,Tid]`, `size=[290,1,3,1]`. Inga nullvärden redovisades i kontrollerat uttag; detta bevisar inte att alla andra saknatillstånd/statusmarkeringar saknas.

| Kod | Mått enligt underlaget | Enhet/referenstid |
| --- | --- | --- |
| `BE0101U1` | Befolkningstäthet | Invånare/km²; tabellens definition och avrundning ska följas. |
| `BE0101U2` | Folkmängd | Personer, 2025-12-31. |
| `BE0101U3` | Landareal | km², 2026-01-01. |

Båda referensdagarna ska bevaras; olika dagar betyder inte automatiskt fel årgång. Röjandeskydd kan ge differenser vid summering enligt underlaget. Tabellen saknar geometri; CRS är inte tillämpligt på statistiksvaret.

Från `http://127.0.0.1:5173`: HTTP 200, `type=cors`, `Access-Control-Allow-Origin: *`, `Content-Type: application/json; charset=UTF-8`. Observerade headers: `X-Rate-Limit-Remaining: 29`, `X-Rate-Limit-Limit: 10s`. Headers ensamma fastställer inte hela kvotregeln. Individuellt test-/hämtningsdatum saknas; resultaten ingick i utkastet sammanställt 2026-10-22.

### Dokumentationsuppgifter och öppet

Den tidigare projekttexten länkar [Befolkningstäthet, folkmängd och landareal](https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__BE__BE0101__BE0101C/BefArealTathetKon/). Metadata som binder denna tabell till TAB628, måttdefinitioner och avrundning behöver bevaras.

- Tidigare dokumentationsuppgift i underlaget: 150 000 celler/anrop och 30 anrop/10 s/IP. Exakt officiell hänvisning och kontrolltid behöver kompletteras; långsiktig produktionskvot är inte testad.
- Bevara exakt anrops-URL, särskilt korrekt kodning av värdet `1+2`; konstruera inte ett historiskt anrop som om det vore bevarat.
- Licens, attribution, cache, rätt till lagring/återdistribution av provsvar, nyckelbehov, uppdateringsfrekvens och felkontrakt behöver beläggas. Geodatakällornas rättigheter får inte automatiskt tilldelas tabellsvaret.
- Statistikens gränsindelning måste kontrolleras mot kommungeometrierna. Källval och eventuellt serverbehov är öppna.

## SCB WFS: befolkningsrutor

### Observationer

- Endpoint: `https://geodata.scb.se/geoserver/stat/wfs`; WFS 1.1.0; lager `stat:befolkning_1km_2025`.
- `GetCapabilities`, `DescribeFeatureType` och begränsat `GetFeature` i GeoJSON uppges kontrollerade. Fullständiga anrops-URL:er och exakt formatparameter saknas i tillgängligt underlag och konstrueras inte här.
- Fält omfattar `objectid`, `rutid_inspire`, `rutid_scb`, `rutstorl`, `beftotalt`, `man`, `kvinna`, åldersfält, `referenstid`, `sp_geometry`. Flera fält är nillable.
- Observerade geometrier: Polygon, EPSG:3006, `rutstorl=1000` m, `referenstid="20251231"`.
- Servern rapporterade `numberMatched=115118` för lagret i ett begränsat exempeluttag. **Hela Sveriges lager har inte hämtats eller verifierats.**
- Separat browserprov från `http://127.0.0.1:5173`: HTTP 200, `type=cors`, tre GeoJSON-features, `Access-Control-Allow-Origin: http://127.0.0.1:5173`, `Access-Control-Allow-Credentials: true`. Det belägger inte samtliga sidors headers.

### BBOX och paginering: observationer

Redovisade parametrar: `BBOX=825000,7328000,828000,7332000,EPSG:3006`, `maxFeatures=5`, `sortBy=objectid`. Servern rapporterade `numberMatched=17` för utsnittet. Enstaka objekt kan tangera BBOX-gränsen; uttaget är inte en exakt befolkningsberäkning inom utsnittet.

| startIndex | Returnerade objekt | Underlag |
| --- | --- | --- |
| 0 | 5 | Ursprunglig redovisning. |
| 5 | 5 | Ursprunglig redovisning; skilda ordnade objekt. |
| 10 | 5 | Komplettering, kontroll-/hämtningsdatum 22 oktober 2026: `numberMatched=17`, `numberReturned=5`, objectid 456198, 456199, 456200, 456658, 456659. EPSG:3006 och referenstid 20251231. |
| 15 | 2 | Ursprunglig redovisning. |

Gabriela redovisar totalt **17 olika objectid**, i överensstämmelse med `numberMatched=17`. Luckan för sidan med startIndex 10 är därmed stängd i redovisningen. Detta stöder paginering och fullständighet i just BBOX-testet, inte nationell fullständighet eller obegränsad kapacitet. Individuella test-/hämtningsdatum för de tidigare testerna är fortfarande okända. Ursprungliga tester ingick i utkastet sammanställt 2026-10-22.

### Dokumentationsuppgifter och öppet

[SCB:s Statistik på rutor](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/) är tidigare dokumentationsreferens. Enligt redovisningen anger WFS GetCapabilities CC0 1.0, utan avgift eller åtkomstbegränsning på servicenivå. Det är inte ett löfte om obegränsad teknisk kapacitet. Metadatautdrag och datum behöver bevaras. `Källa: SCB` rekommenderas för spårbarhet enligt underlaget.

- `beftotalt` får inte ersättas av `man + kvinna`; observerade värden kan avvika. Noll, saknat/sekretess och röjandeskydd behöver dokumenterad tolkning för vald datavariant.
- Stabilitet/unikhet för avsett rut-ID, exakta anrop, fel-/tomsvar, tekniska maxgränser, kvoter, nyckelbehov, cache och uppdatering behöver beläggas.
- Eventuella ytterligare distributionsvillkor behöver kontrolleras; bulkbegränsning är inte konstaterad.
- EPSG:3006 måste valideras före omprojektion till projektets webbgräns: GeoJSON/WGS 84, longitud före latitud. Ingen transformation är implementerad eller testad i projektet; CRS får inte bara etiketteras om.
- Valet mellan direkt SCB-åtkomst och kart-api för rutor samt serverbehov är öppet.

## SCB: förenklade kommungränser

### Observationer

Redovisad nedladdningsadress:

```text
https://www.scb.se/contentassets/3443fea3fa6640f7a57ea15d9a372d33/shape_svenska_260225.zip
```

Observerad fil: `Kommun_Sweref99TM.shp`, med `KnKod`, `KnNamn` och geometri. Underlaget redovisar 290 kommunobjekt, 290 unika kommunkoder, inga saknade koder/namn, 277 Polygon och 13 MultiPolygon samt inga ogiltiga geometrier i kontrollen.

290 av 290 fyrsiffriga `KnKod` matchade PxWebs `Region`. Inledande nollor ska bevaras. Kodmatchningen bevisar inte att gränsårgång och statistikindelning är desamma.

SWEREF 99 TM identifierades utifrån `.prj`. EPSG:3006 är en uppgift i underlaget som behöver stöd av den faktiska CRS-definitionen; filnamnet räcker inte. `.prj` är primärt stöd om auktoritetskod saknas. Exakt hämtnings-/kontrolldatum och verktyg/metod för geometri- och kodkontrollen saknas; resultatet ingick i utkastet sammanställt 2026-10-22.

### Dokumentationsuppgifter och öppet

Enligt underlaget tillhandahålls SCB:s öppna digitala gränser under CC0 och är förenklade för tematisk visning, inte precisionsbestämning av administrativa gränser. Officiell villkors-/produkthänvisning och kontrolltid behöver kompletteras för just filen.

- **Geografisk årgång är okänd.** `260225` i filnamnet fastställer inte indelningsår eller referensår.
- Bevara `.prj`-definition, geometriårgång, förenklings-/bearbetningsuppgifter och reproducerbar kontrollmetod. Omprojektion har inte testats i projektet.
- Belägg uppdateringsfrekvens, cache/lagring, attribution och återdistributionsrätt för eventuellt bearbetat utdrag eller provsvar.
- Lokal browserleverans av vald gränsprodukt, storleksgränser och eventuellt server-/bearbetningsbehov är inte avgjorda.
- Tidigare DeSO-data är referensmaterial, inte fastställd produktionskälla. Härledda kommunpolygoner måste i så fall beskrivas med ursprung, bearbetning och datum.

## Bakgrundskarta

Bakgrundskarta väljs separat med kontroll av visningsvillkor, attribution och användningsvolym. Ett öppet kartbibliotek ger inte obegränsad rätt till någon annans kartserver. P1:s befintliga beslut ändras inte av detta dokumentationssteg.

## Återstående P2-dokumentation och beslut

| Krav i P2 | Status efter denna sammanställning |
| --- | --- |
| Endpoints, parametrar, täckning, referenstider, CRS, rättigheter, kvoter och hämtningsdatum | Kända uppgifter dokumenterade ovan; saknade datum, metadata och rättighetsbelägg står öppna per källa. Källorna är undersökta, inte slutligt valda. |
| Lokala browserprov, nycklar, CORS, paginering och storleksgränser | Redovisade prov dokumenterade med avgränsningar. WFS-paginering gäller ett BBOX; storleks-/åtkomstvillkor är inte helt utredda. |
| Små tillåtna provsvar, interna typer, hantering av tomma/felaktiga/begränsade svar | API-observationer finns, men inga fixturer, interna kontrakt eller projektkontroller har tillkommit. |
| Återpublicering bedömd separat från visning | Skillnaden dokumenterad. kart-api-fixturer i privat/offentligt repo är öppna; SCB-rättigheter behöver belägg enligt respektive avsnitt. |
| Serverbehov avgjort i DECISIONS före beroende funktioner | Inte avgjort. Källval, årgångar och åtkomstlösning behöver dokumenteras där i ett senare steg. DECISIONS ändras inte nu. |

Källregistret ska per faktiskt vald källa innehålla leverantör, dokumentationslänk, exakt endpoint/metod, parametrar, områdesfilter, paginering, hämtningsdatum, täckning/luckor, storleksgränser, referenstid/geometriårgång, CRS/axelordning/upplösning, enheter/saknatillstånd/röjandeskydd, CORS/nycklar/kvoter/cache/fel, licens/attribution/lagring/återdistribution och hur provsvaret jämförts med källan. Okänt ska förbli okänt tills underlag finns.

Lägg inga hemligheter i registret. Små testfiler får bara innehålla data som får distribueras i repot. Syntetiska testdata ska märkas och ersätter inte kontroll mot verkliga svar. Produktionsfunktioner för kommunval, statistikvisning, ritning och rutanalys ingår inte i denna ändring.
