# Beslut och öppna frågor

## Beslutade ramar den 15 oktober 2026

| Beslut | Motiv |
| --- | --- |
| Sverige i version 1 | Beställarens uttryckliga avgränsning |
| Gabriela ansvarar för hela produktionen | Beställarens ansvarsfördelning; Henrik handleder och granskar |
| Separat privat repo under gislab-se | Tydlig projektgräns och gemensam GitHub-åtkomst |
| Publik app på gislab.se som slutmål | Beställarens publiceringsmål; repots synlighet ändras inte automatiskt |
| TypeScript, Vite och Leaflet som startarkitektur | Liten statisk klient som bygger på Gabrielas erfarenhet |
| API-adaptrar med egna datatyper | Isolerar leverantörsförändringar från kartan och analysen |
| Först kommunöversikt, sedan platsökning och rutanalys | Gör första resultatet litet och demonstrerbart |
| Havsnivåanalys efter version 1 | Kräver separat datakontroll och metodval |

Teknikvalen kan ändras av Gabriela när ett konkret behov visas. Dokumentera orsak och konsekvens innan större omtag.

## Öppna frågor och ansvar

| Fråga | Nästa steg | Ansvarig |
| --- | --- | --- |
| Slutliga API:er, villkor, CORS och nyckelbehov | P2, verifiera mot riktiga svar | Gabriela |
| Gemensam statistikårgång och gränsindelning | P2, kontrollera källmetadata | Gabriela |
| Ritbibliotek och geometrioperationer | P1/P5, välj underhållna verktyg med lämpliga licenser | Gabriela |
| Serveradapter behövs? | Beslut efter P2, före beroende implementation | Gabriela med Henrik |
| Exakt URL och åtkomst till webbhotell | Före P8 | Henrik tillhandahåller, Gabriela verifierar |
| Visuellt uttryck och eventuell GISLAB-profil | Före användartest i P7 | Gabriela med Henrik |
| Öppen källkodslicens för projektet | Beslut före eventuell publik källkod | Henrik |
| Förvaltning efter LIA-perioden | Fyll HANDOVER före avslut | Gabriela och Henrik |

## Arkitekturbeslut

### P1 – bakgrundskarta för lokal utveckling, 15 oktober 2026

- Leaflet visar OpenStreetMaps standardraster via `https://tile.openstreetmap.org/{z}/{x}/{y}.png` med synlig attribution. Kartbilder laddas för aktuell vy; ingen egen offlinecache eller masshämtning införs.
- Villkor lästa: https://operations.osmfoundation.org/policies/tiles/ . Tjänsten har ingen tillgänglighetsgaranti. Lämpligheten för publik drift ska bedömas före P8.
- Node.js 24.20.0 LTS och npm 11.19.0 är installerade. Exakta installerade versioner: Leaflet 1.9.4, TypeScript 7.0.2, Vite 8.3.4 och @types/leaflet 1.9.22. Låsfil finns. Ren installation med `npm ci`, typkontroll, bygge och serverstart har verifierats i en separat kopia av arbetsfilerna. Gabriela har bekräftat kartvisning, zoom, panorering, återställning och layout på dator och i simulerat mobilformat med smal skärm. Faktisk ny klon och test på fysisk mobil återstår.
- Musrullszoom är aktiverad för att underlätta utforskning på dator. Gabriela har bekräftat funktionen med musens scrollhjul. Kartan använder rullningen för zoom när pekaren är över kartan; sidrullningen påverkas där. Zoomknapparna finns kvar. Typkontroll och produktionsbygge passerade med inställningen aktiverad.
- Grundfilerna håller kartstarten separat från sidans uppstart. Vites relativa bas tillåter framtida publicering i underkatalog.
- Startvyns koordinater ligger i `src/config/mapConfig.ts` och läses av kartmodulen. De behåller Leaflets ordning [latitud, longitud] och är en visningsutbredning, inte en administrativ gräns. Flytten ändrar inte kartans startvy och inför inga nya beroenden.
- Gabriela identifierade [issue #1 – Skapa och förstå en körbar projektgrund](https://github.com/gislab-se/platsorientering/issues/1) manuellt på GitHub. AI:n har inte läst issue-innehållet; genomförandet kontrolleras mot P1 i ROADMAP.md. Ingen ändring på GitHub, commit, push, PR eller publicering är genomförd.

## P2 – beslutsunderlag för källval och åtkomst, 22 oktober 2026

**Status: föreslagen arbetsinriktning, inte slutligt fastställda beslut.** Inga godkännanden eller nya verifieringar dokumenteras här. Tidigare beslut gäller fortsatt. Underlag: [DATA_SOURCES.md](DATA_SOURCES.md), [P2 i ROADMAP](../ROADMAP.md#p2--verifiera-datakällor-och-skriv-datakontrakt) och [ARCHITECTURE.md](../ARCHITECTURE.md). [Issue #2](https://github.com/gislab-se/platsorientering/issues/2) har inte kunnat läsas i genomgången.

### Föreslagna källor och deras underlag

Observationerna nedan är Gabrielas redovisade externa tester enligt DATA_SOURCES, inte färdiga eller kontraktstestade projektintegrationer. Dokumenterade villkor hålls åtskilda från observationerna.

Implementationsstatus för P2: [contracts.ts](../src/domain/contracts.ts) innehåller de fem interna datakontrakten och gemensamma stödtyper; [validation.ts](../src/domain/validation.ts) innehåller runtime-validering. [Typkontroller](../tests/contracts.types.ts) och [domäntester](../tests/validation.test.mjs) finns, med 29 passerade runtime-tester samt godkända typkontroller vid tidigare redovisad körning. Fyra syntetiska API-fixturfiler och deras [README](../tests/fixtures/README.md) finns. Domäntesterna använder ännu inte dessa fixturer. Inga verkliga svar har sparats som fixturer och inga API-adaptrar, källspecifika normaliserare eller liveintegrationer har implementerats. Tester har inte körts om vid denna statussynkronisering. Detta ändrar inte arbetsinriktningens föreslagna status eller öppna frågor om serverbehov, geometriårgång, rättigheter och API-begränsningar.

| Behov och föreslagen arbetsinriktning | Redovisat underlag och motiv | Kända risker och öppna frågor |
| --- | --- | --- |
| Platsökning: kart-api `/v1/geocode` | Lokal browseråtkomst med HTTP 200 och CORS, strukturerat 422-svar, kommunfilter och begränsning med `limit` är redovisade. Ger ett konkret kontraktsunderlag för svensk platsökning. | Resultatlistan är begränsad; kontraktet anger högst 20 träffar och ingen dokumenterad paginering. Tomt filtrerat svar betyder inte att platsen saknas. CRS/axelordning, referenstid, uppdatering och geografiska luckor återstår att belägga. |
| Kommunuppslag: kart-api `/v1/kommun/lookup` | Redovisade 200-, 404- och 422-svar samt lokal browseråtkomst stöder fortsatt verifiering av koordinat till kommun. | Gränskälla, geometriårgång och CRS är inte fastställda. CORS-header är uttryckligen redovisad för 422, inte alla statuskoder. Indelningen måste jämföras med vald kommungeometri. |
| Kommunstatistik: SCB TAB628, PxWeb API v2 | Redovisat browseruttag med 290 kommuner och 870 datapositioner samlar folkmängd, landareal och täthet. Uttaget för 2025 är föreslagen utgångspunkt. | Exakt kodad anropsadress, metadata, rättigheter, cache och felkontrakt behöver kompletteras. Folkmängd 2025-12-31 och landareal 2026-01-01 ska bevaras som skilda referensdagar. Kopplingen till gränsindelningen återstår. |
| Befolkningsrutor: SCB WFS `stat:befolkning_1km_2025` | Lokal browseråtkomst och paginerat BBOX-test med 17 unika objekt är redovisade; kompletteringen med startIndex 10 kontrollerades 22 oktober 2026. Starkare verifieringsunderlag finns här än för kart-api:s rutleverans. | Hela Sveriges lager är inte hämtat eller verifierat. Exakta anrop, tekniska maxgränser, stabilt rut-ID, saknatillstånd och cache behöver beläggas. Observerat EPSG:3006 behöver valideras och omprojekteras vid webbgränsen. |
| Kommungeometri: SCB:s förenklade kommungränser som kandidat | Redovisningen omfattar 290 objekt, unika kommunkoder och kodmatchning mot statistikuttaget. Kandidat för tematisk kommungeometri. | Geometriårgång är okänd; filnamnet fastställer den inte. Kodmatchning bevisar inte samma indelning. CRS-definition, förenkling, uppdatering, distributionsrätt och browserleverans behöver beläggas. Inte underlag för precisionsbestämning av gränser. |

### Rättigheter, attribution och cache

- **kart-api, dokumenterade villkor:** visning och rimlig cache med korrekt attribution; 200 anrop/dygn/IP utan nyckel och 10 000/månad med nyckel under betan. Beta utan garanterad servicenivå. Egen databas/bulkdistribution tillåts inte. Faktiska svarets attribution ska bevaras. Exakt cachetid och rätt att spara verkliga provsvar i privat respektive offentligt repo är öppna frågor.
- **TAB628:** licens, attribution, cache och rätt till lagring/återdistribution av provsvar behöver beläggas särskilt. Villkor för SCB-geodata får inte automatiskt överföras till tabellen.
- **WFS:** CC0 1.0 anges enligt redovisad GetCapabilities; metadatautdrag behöver bevaras. `Källa: SCB` rekommenderas för spårbarhet enligt underlaget. Cache, tekniska gränser och eventuella kompletterande distributionsvillkor återstår att kontrollera; bulkbegränsning är inte konstaterad.
- **Kommungränser:** CC0 är redovisat men behöver knytas till den faktiska produkten. Källa, geometriårgång och eventuell bearbetning behöver följa ett tillåtet utdrag. Cache-/uppdateringsperiod är inte fastställd.

### Föreslagen åtkomst och ännu öppet serverbeslut

**Direkt browseråtkomst är förstahandsalternativ för de API-anrop som har redovisade lokala browserprov. Ingen obligatorisk serveradapter är hittills belagd, men slutligt beslut om serverbehov är inte fattat.** Lokal åtkomst för begränsade prov är inte en garanti för alla anrop, storlekar eller framtida driftförhållanden.

- kart-api föreslås provas vidare direkt utan nyckel inom dokumenterad kvot. Kvotens lämplighet för avsedd användning behöver bedömas. Om hemlig nyckel krävs hör den hemma i en serveradapter, inte i webbläsarkod.
- TAB628 och begränsade, paginerade WFS-uttag föreslås nås direkt. Åtkomstvillkor, tekniska gränser och fel-/fullständighetskontroller måste kompletteras innan lösningen fastställs.
- För kommungränser är ett tillåtet, förberett och versionsbestämt GeoJSON-utdrag ett möjligt alternativ till direkt källåtkomst. Detta är ett förslag, inte verifierad leverans eller avgjord distributionsrätt. Förbearbetning eller omprojektion innebär inte i sig en server som körs i drift.

En serveradapter löser inte oklar licens, okänd geometriårgång eller leverantörens kapacitetsgränser. Enligt arkitekturen kan även annan tillåten källa eller ett tillåtet förberett utdrag väljas om direktåtkomst inte räcker.

### Återstående beslut och ansvar

Gabriela ansvarar för fortsatt källverifiering, metadata, datakontrakt, tester och dokumentation. Källvalen behöver slutligt fastställas med belägg för CRS, referenstider, kompatibel gränsindelning, rättigheter, cache och åtkomstgränser. Detta avsnitt avslutar inte P2 och inför inga funktioner från P3–P6.

**Serverfrågan ska bedömas av Gabriela tillsammans med Henrik**, enligt befintlig ansvarsfördelning, och avgöras innan beroende funktioner byggs. Relevanta avstämningar med Henrik är om kart-api:s kvot och betaegenskaper motsvarar avsedd användning, om konstaterade begränsningar i gränser/indelning är acceptabla för syftet och vilka driftkonsekvenser en eventuell serveradapter får. Detta är befintligt krav-/GIS-stöd och gemensam granskning, inte nya formella godkännandekrav.

## Mall för nya arkitekturbeslut

Lägg till ett kort numrerat beslut när en fråga blir avgjord:

- Datum och status.
- Problem och observerade begränsningar.
- Vald lösning och varför.
- Alternativ som faktiskt övervägdes.
- Konsekvenser för användare, data, drift och tester.
- Länk till issue eller pull request.
