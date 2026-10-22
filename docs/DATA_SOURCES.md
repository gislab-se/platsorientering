# Datakällor och API-utvärdering

Sammanställt 22 oktober 2026 för P2. Underlaget är Gabrielas redovisade externa tester i Codex-konversationen, det bifogade utkastet ”P2 – Datakällor: verifierade fynd och öppna punkter” (sammanställt 2026-10-22) samt dokumentationsgenomgångar i samma konversation. Inga nya anrop har gjorts vid denna dokumentationsändring.

- **Observation:** ett redovisat externt testresultat, inte ett test som upprepats i projektet eller oberoende verifierats av AI.
- **Dokumentation:** leverantörsuppgift, inte uppmätt beteende.
- **Öppet:** underlag eller beslut saknas. Sammanställningsdatum är inte automatiskt hämtningsdatum.

De fem interna datakontrakten och gemensamma stödtyper finns i [contracts.ts](../src/domain/contracts.ts), med runtime-validering i [validation.ts](../src/domain/validation.ts). [Typkontroller](../tests/contracts.types.ts) och [domäntester](../tests/validation.test.mjs) finns; den tidigare redovisade körningen gav 29 passerade runtime-tester samt godkända typkontroller. Tester har inte körts om vid denna statussynkronisering.

Fyra tydligt märkta syntetiska API-fixturfiler och deras [README](../tests/fixtures/README.md) finns under `tests/fixtures/`. Inga verkliga API-svar har sparats som fixturer. Fixturerna används ännu inte av domäntesterna; källspecifik normalisering och integrationstester mot dem saknas. Inga API-adaptrar eller liveintegrationer är byggda. GitHub Issue #2 har inte kunnat läsas i genomgången; kravjämförelsen utgår från P2 i [ROADMAP](../ROADMAP.md) och [ARCHITECTURE](../ARCHITECTURE.md). Slutliga källval och serverbehov är inte avgjorda.

## kart-api: dokumentation och gemensamma villkor

Gabriela kontrollerade [OpenAPI](https://api.kart-api.se/openapi.json), [villkor](https://kart-api.se/villkor/) och [attribution](https://kart-api.se/docs/attribution/) **22 oktober 2026**. Dokumentation hade även granskats 15 oktober enligt den tidigare projekttexten. I konversationen kunde OpenAPI läsas tidigare i genomgången men inte vid senaste försöket; ingen lokal kontraktskopia finns.

Dokumenterade uppgifter:

- API-sökväg `/v1`, kontraktets `info.version=1.0.0`, specifikationsformat OpenAPI 3.1.0.
- 200 anrop/dygn/IP utan nyckel; 10 000 anrop/månad med nyckel under betan. Den nyckellösa kvoten och attributionskravet stöds även av Gabrielas nu redovisade kontroll av [Kom igång](https://kart-api.se/docs/). Datum för just den kontrollen är inte angivet. Kvottillämpning och nyckelbaserad åtkomst är inte browsertestade; kvoten är en teknisk begränsning, attributionskravet ett användningsvillkor.
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

422-provet belägger ett strukturerat felsvar för saknad `q`. Koordinatförklaringen i `skal` är inte specifik för detta fel. Proven verifierar API-beteende, inte projektets källspecifika felhantering eller gränssnitt. Separat runtime-validering och tester av de interna datakontrakten finns enligt statusen ovan.

### Öppet för kart-api

Metadataavgränsning utifrån befintligt underlag: `lat`/`lon` och observerade koordinater belägger inte ett visst geodetiskt datum eller en CRS-definition. Källhänvisningen till Lantmäteriet/OSM fastställer inte vilken dataversion kart-api använder. Kontrolldatumet 22 oktober 2026 och API-versionen `/v1` är inte datats referenstid eller uppdateringsfrekvens. Dessa uppgifter förblir obekräftade; inga metadata om CRS eller uppdatering har härletts från testvärdena.

- Uttryckligt CRS/datum och axelordning för koordinaterna. Rimliga talvärden bevisar inte EPSG:4326.
- Källdatats referenstid/version, uppdateringsfrekvens hos kart-api och fördröjning gentemot Lantmäteriet/OSM.
- Geografiska luckor och sökbegränsningar samt gränskälla och geometriårgång för kommunuppslag och geocodes kommunfilter.
- Närmare cachevillkor, inklusive lagringstid. Visnings- och cacherätt avgör inte automatiskt rätt till versionshantering av verkliga provsvar.
- Verkliga provsvar i **privat GitHub-repo: öppet**. Villkoren nämner inte testfixturer eller privat versionshantering; privat repo är inte automatiskt lokal cache.
- Verkliga provsvar i **offentligt GitHub-repo: öppet**. Villkoren tillåter uppslagssvar men klargör inte uttryckligen publicerade testfixturer. Varken generellt tillstånd eller förbud mot varje litet svar är fastställt. Leverantörens klargörande behövs för båda fallen; attribution ska bevaras.
- Fullständig rutleverans via kart-api är inte verifierad här. Direkt SCB WFS har undersökts som alternativ.
- Serverbehov är inte avgjort. Lokala browserprov belägger bara testade anrop. Hemliga nycklar ska inte läggas i klientkod.

Bedömning av kvarstående osäkerheter för kart-api:

| Osäkerhet | Påverkan och motivering |
| --- | --- |
| CRS/datum och axelordning | Blockerar beroende koordinatimplementation, men inte fortsatt P2-bedömning som kandidat. [OpenAPI](https://api.kart-api.se/openapi.json) är kontraktskällan; dokumenterade `lat`/`lon` är inte i sig uttrycklig CRS-bekräftelse. Utred före användning som validerad WGS84. |
| Dataårgång, uppdateringsfrekvens och kommunindelning | Behöver utredas före beroende implementation och årgångskoppling. Källvalet förblir föreslaget tills användbarheten kan bedömas; API-version eller testdatum får inte ersätta dessa uppgifter. |
| Exakt cachetid och rätt till verkliga testfixturer | Dokumenteras som öppet utan att hindra kandidatbedömning med syntetiska fixturer. Långvarig lagring eller återpublicering av verkliga svar förutsätter klarlagd rätt för just den användningen. |
| Luckor och sökbegränsningar | Kända begränsningar dokumenteras i P2; ingen fullständig täckning utlovas. Nytt användningskrav som kräver alla träffar kan påverka senare källval, eftersom paginering inte är dokumenterad. |

## SCB TAB628: kommunstatistik

### Observationer

Leverantör SCB, PxWeb API v2. Redovisade adresser:

```text
Metadata: https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv
Data: GET https://statistikdatabasen.scb.se/api/v2/tables/TAB628/data
```

Äldre redovisat urval (den fullständiga URL-kodade adressen för just det äldre anropet saknas):

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

Äldre browserprov från `http://127.0.0.1:5173`: HTTP 200, `type=cors`, `Access-Control-Allow-Origin: *`, `Content-Type: application/json; charset=UTF-8`. Observerade headers: `X-Rate-Limit-Remaining: 29`, `X-Rate-Limit-Limit: 10s`. Headers ensamma fastställer inte hela kvotregeln. Individuellt test-/hämtningsdatum saknas; resultaten ingick i utkastet sammanställt 2026-10-22.

#### Ny datakontroll 22 oktober 2026

Gabriela redovisar ett nytt dataanrop den **22 oktober 2026** med följande exakta reproducerbara GET-URL:

```text
https://statistikdatabasen.scb.se/api/v2/tables/TAB628/data?lang=sv&outputFormat=json-stat2&codelist%5BRegion%5D=vs_RegionKommun07EjAggr&valueCodes%5BRegion%5D=*&valueCodes%5BKon%5D=1%2B2&valueCodes%5BContentsCode%5D=BE0101U1%2CBE0101U2%2CBE0101U3&valueCodes%5BTid%5D=2025
```

Observerat resultat: ett läsbart JSON-stat2-svar med `version="2.0"`, `class="dataset"`, `id=[Region,Kon,ContentsCode,Tid]` och `size=[290,1,3,1]`. `value` innehöll 870 numeriska datapositioner. Urvalet var `Kon=1+2`, `Tid=2025` och måtten `BE0101U1`, `BE0101U2`, `BE0101U3`. I URL:en är plustecknet i `1+2` kodat som `%2B`.

Detta är en separat datakontroll från det äldre browserprovet. Ingen specifik HTTP-status, CORS-header eller annan response-header har redovisats för det nya anropet; sådana uppgifter tillskrivs det inte.

### Dokumentationsuppgifter och öppet

#### Metadatakontroll 22 oktober 2026

Gabriela redovisar kontroll av [TAB628-metadata](https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv) den **22 oktober 2026**. Följande är metadatauppgifter, inte nya browserobservationer av datauttaget ovan:

- Tabell `TAB628`, PxWeb API v2. Titel: ”Befolkningstäthet (invånare per kvadratkilometer), folkmängd och landareal efter region och kön. År 1991–2025.” Den tidigare projekttextens [tabellreferens](https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__BE__BE0101__BE0101C/BefArealTathetKon/) behålls för spårbarhet.
- Metadatafältet `updated` är `2026-02-24T07:00:00Z`. Det är metadatauppgiften om uppdatering, inte kontroll-/hämtningsdatum, statistikens referenstid eller belägg för uppdateringsfrekvens.
- `BE0101U1`: befolkningstäthet, invånare per km², en decimal.
- `BE0101U2`: folkmängd, personer, noll decimaler.
- `BE0101U3`: landareal, km², två decimaler.
- `Kon=1+2` betyder totalt. Kodlistan `vs_RegionKommun07EjAggr` anges för kommunurval.
- Befolkningens referenstid är 31 december respektive år. Landarealens referenstid är 1 januari följande år. För uttaget 2025 motsvarar detta 2025-12-31 respektive 2026-01-01 enligt tabellen ovan.
- Från referensåret 2025 tillämpar SCB Cell Key Method (CKM), vilket kan påverka summerbarheten. Summeringar får därför inte automatiskt förutsättas motsvara publicerade totaler.

Kontrollen kompletterar måttdefinitioner och redovisad precision. Ett metadatautdrag behöver fortfarande bevaras för reproducerbarhet. Datumet ovan gäller metadatakontrollen; tidigare datauttags- och browserdatum förblir okända.

- Enligt Gabrielas nu redovisade kontroll av [SCB:s PxWeb API-dokumentation](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/) tillåter API v2 högst **150 000 dataceller per uttag och 30 anrop per 10 sekunder och IP-adress**. Datum för just dokumentationskontrollen är inte angivet. Detta är dokumenterade tekniska gränser, inte licensvillkor eller en ny uppmätning av kvottillämpningen.
- Exakt URL med kodning av `1+2` finns nu för den nya datakontrollen ovan. Adress och individuellt datum för det äldre anropet är fortfarande okända.
- Praktiska cache-/uppdateringsvillkor, nyckelbehov och felkontrakt behöver fortfarande beläggas. Licensunderlaget för statistikdata framgår separat nedan.
- Statistikens gränsindelning måste kontrolleras mot kommungeometrierna. Källval och eventuellt serverbehov är öppna.

Rättighetsstatus för TAB628: enligt Gabrielas nu redovisade kontroll av [SCB:s användningsvillkor](https://www.scb.se/om-scb/om-scb.se-och-anvandningsvillkor/) omfattas öppna statistikdata i Statistikdatabasen av **CC0 1.0**. Detta ger licensstöd för användning/visning, lagring och återpublicering av dessa data, inklusive provsvar; bedömningen bygger på statistikdatats egna villkor, inte på kommungränsernas licens. Datum för just villkorskontrollen är inte angivet. Tekniska anropsgränser och praktisk cachehantering är separata frågor. CKM är en statistisk metodbegränsning, inte ett licensvillkor.

Bedömning: befintlig dokumentation av **referenstider, licens och API-begränsningar är tillräcklig för nuvarande P2-källbedömning av TAB628**. Dessa punkter behöver inte behandlas som obelagda hinder för källvalet. Praktisk cache-/uppdateringsstrategi och felkontrakt hör till senare beroende implementation; okänt datum för den separata villkorskontrollen dokumenteras utan att något datum antas. Kontroll av indelning mot vald geometri återstår före join, men ändrar inte de belagda egenskaperna hos statistikprodukten. Bedömningen avgör inte serverbehovet.

## SCB WFS: befolkningsrutor

### Observationer

- Endpoint: `https://geodata.scb.se/geoserver/stat/wfs`; WFS 1.1.0; lager `stat:befolkning_1km_2025`.
- `GetCapabilities`, `DescribeFeatureType` och begränsat `GetFeature` i GeoJSON uppges kontrollerade. Ursprungliga fullständiga anrops-URL:er och exakt formatparameter saknas i tillgängligt underlag. Rekonstruerade GetFeature-URL:er anges separat nedan och är ännu inte återtestade.
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

#### Rekonstruerade GetFeature-anrop – ännu inte återtestade

URL:erna nedan rekonstruerades 23 oktober 2026 från redovisade parametrar och är inte bevarade originalanrop. Ingen nätverkskontroll har gjorts av dem. Benämningen `stat` i kompletteringsuppgiften tolkas som namnrymd; det tidigare dokumenterade fullständiga lagernamnet är `stat:befolkning_1km_2025`, vilket används i `typeName`.

Rekonstruktionen använder WFS 1.1.0, `request=GetFeature`, `outputFormat=application/json` för GeoJSON och `srsName=EPSG:3006`. Formatsträngen är ett rekonstruktionsval, inte en bevarad uppgift om det ursprungliga anropet. Kolon, kommatecken och snedstreck i parametervärdena är procentkodade:

```text
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=0
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=5
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=10
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=15
```

Tidigare observerad sidindelning är **5 + 5 + 5 + 2 = 17 objekt**, med 17 olika objectid enligt redovisningen ovan. Detta resultat tillskrivs inte de rekonstruerade URL:erna förrän de har återtestats. Ingen HTTP-status, CORS-header eller ny hämtningsdag har verifierats genom rekonstruktionen.

Gabriela redovisar totalt **17 olika objectid**, i överensstämmelse med `numberMatched=17`. Luckan för sidan med startIndex 10 är därmed stängd i redovisningen. Detta stöder paginering och fullständighet i just BBOX-testet, inte nationell fullständighet eller obegränsad kapacitet. Individuella test-/hämtningsdatum för de tidigare testerna är fortfarande okända. Ursprungliga tester ingick i utkastet sammanställt 2026-10-22.

### Dokumentationsuppgifter och öppet

[SCB:s Statistik på rutor](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/) är tidigare dokumentationsreferens. Enligt redovisningen anger WFS GetCapabilities CC0 1.0, utan avgift eller åtkomstbegränsning på servicenivå. Det är inte ett löfte om obegränsad teknisk kapacitet. Metadatautdrag och datum behöver bevaras. `Källa: SCB` rekommenderas för spårbarhet enligt underlaget.

- `beftotalt` får inte ersättas av `man + kvinna`; observerade värden kan avvika. Noll, saknat/sekretess och röjandeskydd behöver dokumenterad tolkning för vald datavariant.
- Stabilitet/unikhet för avsett rut-ID, exakta anrop, fel-/tomsvar, tekniska maxgränser, kvoter, nyckelbehov, cache och uppdatering behöver beläggas.
- Licensstödet för användning, lagring och återpublicering framgår nedan. WFS-specifika tekniska uttags- och cachevillkor är fortfarande obekräftade; bulkbegränsning är inte konstaterad.
- EPSG:3006 måste valideras före omprojektion till projektets webbgräns: GeoJSON/WGS 84, longitud före latitud. Ingen transformation är implementerad eller testad i projektet; CRS får inte bara etiketteras om.
- Valet mellan direkt SCB-åtkomst och kart-api för rutor samt serverbehov är öppet.

Dokumentationskomplettering enligt Gabrielas nu lämnade underlag: [SCB:s produktsida Statistik på rutor](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/) anger **årlig uppdatering av befolkningsregistret och tillgänglighet via WFS**. Datum för just denna dokumentationskontroll är inte angivet. Detta är en leverantörsuppgift, inte ett nytt API-prov eller belägg för exakt publiceringsdatum/uppdateringstid i det testade WFS-lagret.

Samlad WFS-status: sidindelning är belagd genom redovisningen av det begränsade BBOX-testet, men ursprunglig exakt GetFeature-URL saknas fortfarande. Rekonstruerade URL:er finns ovan, tydligt märkta som ännu inte återtestade. Gabrielas nu redovisade kontroll av [SCB:s användningsvillkor](https://www.scb.se/om-scb/om-scb.se-och-anvandningsvillkor/) anger **CC0 1.0 för öppna geodata i geodataplattformen**, vilket kompletterar lagrets redovisade CC0-uppgift med generellt stöd för användning/visning, lagring och återpublicering. Datum för just villkorskontrollen är inte angivet; metadatautdrag för lagret behöver fortfarande bevaras. Licensstödet kommer från villkoren, inte från lyckad browseråtkomst. Varken särskilt cacheförbud, viss cachetid, WFS-specifik numerisk kvot eller obegränsad anropskapacitet är belagt. PxWebs tekniska gränser ovan får inte överföras till WFS.

Bedömning av kvarstående WFS-osäkerheter:

| Osäkerhet | Påverkan och motivering |
| --- | --- |
| Ursprunglig GetFeature-URL saknas; rekonstruktion är inte återtestad | Hindrar att det rekonstruerade anropet markeras som färdigverifierat i P2. Lagret kan fortsatt bedömas som kandidat utifrån redovisade prov. Ett daterat återprov av URL:erna ovan behövs för att stänga reproducerbarhetsluckan; inget historiskt anrop antas. |
| Tjänstespecifika kvoter, maxgränser och cachevillkor | Förblir obekräftade och dokumenteras som begränsning i källbedömningen, inte som påhittade tillstånd eller kvoter. Blockerar inte kandidatval i sig; måste utredas före uttags-/cachelösning som förutsätter viss kapacitet eller lagringstid. |
| Lagrets exakta uppdateringstid och äldre testdatum | Dokumenteras som okända; blockerar inte bedömningen av den uttryckliga referenstiden 20251231. Årlig registeruppdatering fastställer inte tjänstens publiceringstid. |
| Stabilt rut-ID, saknatillstånd och fullständiga fälttyper | Behöver beläggas före beroende normalisering och avduplicering. Kandidatbedömningen kan fortsätta, men dessa egenskaper får ännu inte påstås verifierade. |

## Uppföljning av kvarvarande källmetadata

Detta är uppföljning, inte nya testresultat eller ett påstående att samtliga punkter blockerar P2-källvalet. Påverkan anges i respektive källavsnitt. Inga nätverksanrop gjordes vid denna komplettering. Serverbeslutet kvarstår separat.

1. **kart-api – källmetadata:** kontrollera [OpenAPI](https://api.kart-api.se/openapi.json) och [attributionsdokumentationen](https://kart-api.se/docs/attribution/) för uttryckligt CRS/datum, axelordning, dataversion/referenstid och uppdateringsfrekvens för geocode/kommunuppslag. Om uppgifterna saknas, begär klargörande från leverantörens tidigare dokumenterade kontakt `api@autonomousmedia.io`; inget meddelande har skickats. Bevara dokumentationshänvisning och kontrolldatum, även om svaret blir att uppgiften inte publiceras.
2. **SCB TAB628 – senare driftuppföljning:** referenstider, licens och numeriska API-gränser är tillräckligt belagda för nuvarande P2-källbedömning. Inför beroende implementation följs kvarvarande cache-/uppdateringsstrategi, nyckelbehov och felkontrakt upp via [PxWeb API-dokumentationen](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/) och [TAB628-metadata](https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv).
3. **SCB WFS – reproducerbarhet och tekniska villkor:** utgå från tjänsten `https://geodata.scb.se/geoserver/stat/wfs` och [SCB:s Statistik på rutor](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/). Bevara exakta GetCapabilities-/DescribeFeatureType-/GetFeature-URL:er och metadata för `stat:befolkning_1km_2025`, inklusive testets BBOX och sidparametrar ovan. Licensstödet är dokumenterat ovan; kontrollera kvarvarande WFS-specifika kvoter, maxstorlek och cachevillkor, eller dokumentera att sådana gränser inte publiceras. Ett litet daterat återprov räcker för att komplettera reproducerbarheten; nationell nedladdning eller belastningstest ingår inte.

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

Gabriela redovisar kontroll av [SCB:s officiella sida för digitala gränser](https://www.scb.se/hitta-statistik/regional-statistik-och-kartor/regionala-indelningar/digitala-granser/) den **22 oktober 2026**. Följande är dokumentationsuppgifter, inte nya kontroller av den tidigare nedladdade ZIP-filens innehåll:

- SCB:s öppna digitala kommungränser har licensen **CC0**. Data får användas, delas och tillgängliggöras utan krav på källangivelse. SCB rekommenderar ändå `Källa: SCB`.
- Koordinatsystemet anges som **SWEREF99 TM**. Detta kompletterar CRS-underlaget, men ersätter inte kontroll av den faktiska ZIP-filens `.prj` inför omprojektion.
- Gränserna är förenklade och avsedda för tematisering av statistik. **SCB anger uttryckligen att gränserna inte är lämpliga för analyser.** För exakta gränser hänvisar SCB till Lantmäteriet.

Val av geometri för framtida analyser är därför fortsatt öppet och kan behöva diskuteras med Henrik. Denna dokumentationskomplettering fastställer inte ett sådant källval och ändrar inte DECISIONS.md. Kontrolldatumet för webbsidan är inte den tidigare ZIP-filens hämtningsdatum eller geometriårgång.

Bedömning: SCB:s förenklade kommungränser rekommenderas som **kandidat för visualisering, inte för geografisk analys**. Detta är en rekommendation inom P2, inte ett fastställt geometribeslut. Okänd exakt geometriårgång hindrar inte kandidatbedömningen, men behöver klarläggas före årgångsberoende join eller presentation som en bestämd gränsårgång. Framtida analysgeometri är en öppen metod-/källfråga att stämma av med Henrik före geografisk analys; SCB:s angivna olämplighet får inte kringgås genom att kalla visualiseringsgeometrin analysunderlag. Saknade äldre hämtningsdatum och praktisk uppdateringsstrategi dokumenteras som sådana och gör inte CC0- eller visualiseringsbedömningen obekräftad.

- **Geografisk årgång är okänd.** `260225` i filnamnet fastställer inte indelningsår eller referensår.
- Bevara `.prj`-definition, geometriårgång, förenklings-/bearbetningsuppgifter och reproducerbar kontrollmetod. Omprojektion har inte testats i projektet.
- Uppdateringsfrekvens och praktisk cache-/lagringsstrategi återstår att fastställa. CC0 och SCB:s rekommenderade, inte obligatoriska, källangivelse är dokumenterade ovan; geometriårgång och bearbetning behöver fortfarande följas för spårbarhet.
- Lokal browserleverans av vald gränsprodukt, storleksgränser och eventuellt server-/bearbetningsbehov är inte avgjorda.
- Tidigare DeSO-data är referensmaterial, inte fastställd produktionskälla. Härledda kommunpolygoner måste i så fall beskrivas med ursprung, bearbetning och datum.

## Bakgrundskarta

Bakgrundskarta väljs separat med kontroll av visningsvillkor, attribution och användningsvolym. Ett öppet kartbibliotek ger inte obegränsad rätt till någon annans kartserver. P1:s befintliga beslut ändras inte av detta dokumentationssteg.

## Återstående P2-dokumentation och beslut

| Krav i P2 | Status efter denna sammanställning |
| --- | --- |
| Endpoints, parametrar, täckning, referenstider, CRS, rättigheter, kvoter och hämtningsdatum | Kända uppgifter dokumenterade ovan; saknade datum, metadata och rättighetsbelägg står öppna per källa. Källorna är undersökta, inte slutligt valda. |
| Lokala browserprov, nycklar, CORS, paginering och storleksgränser | Redovisade prov dokumenterade med avgränsningar. WFS-paginering gäller ett BBOX; storleks-/åtkomstvillkor är inte helt utredda. |
| Små tillåtna provsvar, interna typer, hantering av tomma/felaktiga/begränsade svar | Fem interna kontrakt, runtime-validering, typkontroller, 29 tidigare passerade domäntester och syntetiska API-fixturer finns. Källspecifik normalisering och integrationstester med fixturerna återstår; inga verkliga svar har sparats som fixturer. |
| Återpublicering bedömd separat från visning | Skillnaden dokumenterad. kart-api-fixturer i privat/offentligt repo är öppna. SCB:s CC0 1.0 för öppna statistikdata och geodata har nu officiellt villkorsunderlag; tekniska gränser/cachefrågor kvarstår enligt respektive avsnitt. |
| Serverbehov avgjort i DECISIONS före beroende funktioner | Inte avgjort. DECISIONS innehåller föreslagen arbetsinriktning för källval och åtkomst, inte slutliga beslut. Källval, årgångar och åtkomstlösning behöver fortfarande avgöras. |

Källregistret ska per faktiskt vald källa innehålla leverantör, dokumentationslänk, exakt endpoint/metod, parametrar, områdesfilter, paginering, hämtningsdatum, täckning/luckor, storleksgränser, referenstid/geometriårgång, CRS/axelordning/upplösning, enheter/saknatillstånd/röjandeskydd, CORS/nycklar/kvoter/cache/fel, licens/attribution/lagring/återdistribution och hur provsvaret jämförts med källan. Okänt ska förbli okänt tills underlag finns.

Lägg inga hemligheter i registret. Små testfiler får bara innehålla data som får distribueras i repot. Syntetiska testdata ska märkas och ersätter inte kontroll mot verkliga svar. Produktionsfunktioner för kommunval, statistikvisning, ritning och rutanalys ingår inte i denna ändring.
