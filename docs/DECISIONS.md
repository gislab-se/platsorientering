# Beslut och öppna frågor

## P4 – accepterad metadataosäkerhet och godkänd demonstration, 6 november 2026

Gabriela uppger efter dagens samtal med Henrik att de använder det senaste dokumenterade underlaget för kommungränserna och går vidare med P4 även om gränsårgången inte kan beläggas där. Hon bekräftar också att hon visat den fungerande Kommunöversikt för Henrik och fått hans godkännande. Detta är Gabrielas återrapportering, inte en separat granskning eller leverantörsbekräftelse inhämtad av AI.

För P4:s kommunöversikt accepteras därför okänd kart-api-gränsårgång som en uttrycklig begränsning. Det tidigare kravet på verifierad geografisk överensstämmelse är inte ett kvarstående avslutshinder för denna avgränsade leverans. Statistikens kommunkod, SCB-källa, referenstider och officiella landareal behålls, liksom den synliga upplysningen om okänd gränsårgång och obekräftad överensstämmelse. Ingen årgång får anges som verifierad utan belägg.

Beslutet gäller visning av SCB:s publicerade kommunstatistik tillsammans med en förenklad visningsgräns. Det godkänner inte geografisk analys med okänd indelning, omfördelning av befolkning till ritade områden eller ändringar av GIS-reglerna för senare etapper. Nytt officiellt underlag ska bedömas och dokumenteras när det finns. P4 kan bedömas klart enligt denna ändrade avgränsning och den godkända demonstrationen; GitHub-granskning, merge och uppdatering av Issue #4 hanteras separat.

## Aktuell P2-beslutsstatus, 2 november 2026

Gabriela har godkänt kart-api för kommunval/visningsgränser, SCB TAB628 för kommunstatistik 2025 via direkt browseråtkomst utan separat server och SCB WFS `stat:befolkning_1km_2025` för 1 km-rutor med direktåtkomst som inledande riktning. De daterade besluten nedan är styrande inom denna omfattning och ersätter äldre förslagsstatus för samma frågor. Historiska formuleringar innebär inte att besluten saknas i dag. Separat Henrik-godkännande påstås inte för besluten den 2 november.

P2:s fem kriterier är bedömda som uppfyllda inom dokumenterad avgränsning i [ROADMAP](../ROADMAP.md#avslutsbedömning-2-november-2026); slutkontroller och Gabrielas avslutsgodkännande återstår. [DATA_SOURCES](DATA_SOURCES.md#aktuell-p2-sammanställning-2-november-2026) skiljer faktiskt browserprov från Node-kontroll: TAB628 har ett precist Edge-prov 1 november, medan WFS har ett äldre redovisat browserprov med begränsad proveniens och senare Node-paginering. Inget nytt test genomförs genom denna statusuppdatering.

Lookup/geocode-CRS, kommungränsernas version/giltighet och kompatibilitet med SCB-statistik är fortsatt öppna. Källvalet godkänner inte koordinatantaganden eller geografisk join. Cache-/kvotstrategi, fullständighet, WFS-ID/null-/XML-hantering, produktionens browseråtkomst och transformation till WGS84 kvarstår inför beroende P3–P6-implementation. Serverinriktningen omprövas vid belagda hinder. Oklara rättigheter till verkliga kart-api-fixturer ger inget lagringstillstånd; befintliga syntetiska fixturer används. Inga nya funktioner, implementation, push, merge eller publicering godkänns av dokumentsynken.

## Beslutade ramar den 15 oktober 2026

| Beslut | Motiv |
| --- | --- |
| Sverige i version 1 | Beställarens uttryckliga avgränsning |
| Gabriela ansvarar för hela produktionen | Beställarens ansvarsfördelning; Henrik handleder och granskar |
| Lärande och användning är likvärdiga mål | Gabriela ska förstå och själv kunna förvalta det som byggs samtidigt som LABLAB får ett användbart tittfönster |
| Separat privat repo under gislab-se | Tydlig projektgräns och gemensam GitHub-åtkomst |
| Första publicering via `yakimovskagabriela-ctrl` | Ger en stegvis förhandsversion; exakt repo, metod och URL verifieras före publicering |
| Publik app på gislab.se som slutmål | Beställarens slutliga publiceringsmål; den privata källkodens synlighet ändras inte automatiskt |
| TypeScript, Vite och Leaflet som startarkitektur | Liten statisk klient som bygger på Gabrielas erfarenhet |
| API-adaptrar med egna datatyper | Isolerar leverantörsförändringar från kartan och analysen |
| Först kommunöversikt, sedan platsökning och rutanalys | Gör första resultatet litet och demonstrerbart |
| Havsnivåanalys efter version 1 | Kräver separat datakontroll och metodval |

Teknikvalen kan ändras av Gabriela när ett konkret behov visas. Dokumentera orsak och konsekvens innan större omtag.

## Öppna frågor och ansvar

| Fråga | Nästa steg | Ansvarig |
| --- | --- | --- |
| Uppföljning av valda API:er, villkor, CORS och nyckelbehov | Källval godkända; följ dokumenterade villkor inför beroende P3–P6-arbete | Gabriela |
| Gemensam statistikårgång och gränsindelning | Öppet leverantörsunderlag; krävs före verifierad geografisk koppling | Gabriela |
| Ritbibliotek och geometrioperationer | P1/P5, välj underhållna verktyg med lämpliga licenser | Gabriela |
| Uppföljning av åtkomstlösningar | kart-api/TAB628 beslutade; WFS har godkänd inledande direktåtkomst. Ompröva vid verifierade hinder före beroende implementation. | Gabriela med Henrik |
| Repo, metod och URL för första GitHub-publiceringen | Välj en stabil commit och verifiera åtkomst, bygge och Pages-stöd | Gabriela |
| Exakt URL och åtkomst till webbhotell | Före P8 och efter GitHub-förhandsversionen | Henrik tillhandahåller, Gabriela verifierar |
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

**Status den 22 oktober: föreslagen arbetsinriktning, inte slutligt fastställda beslut.** Underlaget har därefter kompletterats med kontroller och det avgränsade kart-api-beslutet nedan. Underlag: [DATA_SOURCES.md](DATA_SOURCES.md), [P2 i ROADMAP](../ROADMAP.md#p2--verifiera-datakällor-och-skriv-datakontrakt) och [ARCHITECTURE.md](../ARCHITECTURE.md). Gabriela har tillhandahållit de fem klartkriterierna från [Issue #2](https://github.com/gislab-se/platsorientering/issues/2); de motsvarar ROADMAP. Direkt läsning av issuen och PR #11 på GitHub har inte verifierats.


Statusuppdatering 28 oktober 2026: För kart-api ersätts den föreslagna åtkomsten av beslutet i samråd med Henrik nedan. För SCB och kommungränser finns verifieringsunderlag och ett åtkomstförslag, men inget bekräftat slutligt åtkomstbeslut. P2 är därför fortsatt delvis uppfyllt. Denna dokumentsynkronisering inför inga nya beslut eller testresultat.

### Föreslagna källor och deras underlag

Underlaget nedan omfattar både Gabrielas tidigare redovisade browserprov och projektets senare live-/fixturkontroller enligt DATA_SOURCES. Dokumenterade villkor hålls åtskilda från observerade svar. Färdiga gränssnittsfunktioner ingår inte i P2.

Implementationsstatus uppdaterad 28 oktober 2026: [contracts.ts](../src/domain/contracts.ts) och [validation.ts](../src/domain/validation.ts) innehåller fem interna kontrakt och runtime-validering. Senaste `npm.cmd test` passerade med typkontrakt och **63 runtime-tester**; även `npm.cmd run typecheck` passerade. Fyra syntetiska och tre verkliga SCB-fixturer används av [käll-/adaptertesterna](../tests/source-fixtures.test.mjs). SCB-fixturerna omfattar nio TAB628-värden för tre kommuner, en hel WFS-ruta och ett tomt WFS-svar, med källa, hämtningsdatum, referenstid och CC0-underlag; se [fixturernas README](../tests/fixtures/README.md). Inga verkliga kart-api-fixturer har sparats. [municipalityLookup.ts](../src/providers/municipalityLookup.ts) och [geocode.ts](../src/providers/geocode.ts) är implementerade och liveprovade via Node men ännu inte inkopplade i gränssnittet. SCB kontrolleras med delscheman och semantiska tester; färdiga SCB-adaptrar är inte ett extra P2-krav. [DATA_SOURCES](DATA_SOURCES.md) redovisar exakta anrop, utfall och kvarvarande begränsningar. Tester har inte körts om vid denna dokumentsynkronisering.

| Behov och föreslagen arbetsinriktning | Redovisat underlag och motiv | Kända risker och öppna frågor |
| --- | --- | --- |
| Platsökning: kart-api `/v1/geocode` | Lokal browseråtkomst med HTTP 200 och CORS, strukturerat 422-svar, kommunfilter och begränsning med `limit` är redovisade. Ger ett konkret kontraktsunderlag för svensk platsökning. | Resultatlistan är begränsad; kontraktet anger högst 20 träffar och ingen dokumenterad paginering. Tomt filtrerat svar betyder inte att platsen saknas. CRS/axelordning, referenstid, uppdatering och geografiska luckor återstår att belägga. |
| Kommunuppslag: kart-api `/v1/kommun/lookup` | Tidigare browserprov och projektets liveprov med 200/404/422 finns. Rätt koder kontrollerades för Finspång, Uppsala, Malmö och Kiruna. Kommunguiden anger Lantmäteriet som gränskälla. | Uttryckligt CRS för lookup-indata och gränsårgång återstår. Indelningen måste jämföras med vald kommungeometri. Node-provens CORS-headers ersätter inte browserprov. |
| Kommunstatistik: SCB TAB628, PxWeb API v2 | Tidigare uttag med 290 kommuner/870 värden, officiell metadata och ett sparat verkligt prov med tre kommuner finns. Referensdagarna 2025-12-31 respektive 2026-01-01 och CC0 är belagda. | Praktisk cache-/uppdateringsstrategi och exakt felhantering följs upp inför beroende implementation. Koppling till vald gränsårgång återstår. |
| Befolkningsrutor: SCB WFS `stat:befolkning_1km_2025` | Fyra exakta URL:er återtestade 28 oktober: 5+5+5+2 objekt, 17 unika ID:n. Tom-/felprov och schema finns. EPSG:3006 och referenstid 20251231 är bekräftade. Små verkliga CC0-fixturer finns. | Ingen nationell nedladdning behövs för P2. Numerisk anropskvot, hård maxgräns och exakt cachetid hittades inte i granskade källor. ID-stabilitet vid uppdateringar, variabelspecifika saknatillstånd och testad omprojektion återstår inför beroende implementation. |
| Kommungeometri: SCB:s förenklade kommungränser som kandidat | Tidigare kontroll av 290 objekt och kodmatchning finns. Ny `.prj`-kontroll tillsammans med officiella produktuppgifter stöder EPSG:3006. CC0 är bekräftat. | Gränsårgång är okänd; filnamn och arkivtidsstämplar fastställer den inte. Kodmatchning bevisar inte samma indelning. Statisk GeoJSON-leverans och omprojektion är föreslagna, inte genomförda. SCB anger att produkten är avsedd för tematisering, inte analys. |

### Rättigheter, attribution och cache

- **kart-api, dokumenterade villkor:** visning och rimlig cache med korrekt attribution; 200 anrop/dygn/IP utan nyckel och 10 000/månad med nyckel under betan. Beta utan garanterad servicenivå. Egen databas/bulkdistribution tillåts inte. Faktiska svarets attribution ska bevaras. Exakt cachetid och rätt att spara verkliga provsvar i privat respektive offentligt repo är öppna frågor.
- **TAB628 och WFS:** SCB:s officiella villkor anger CC0 1.0 för öppna statistikdata och geodata; små verkliga provsvar är nu sparade med proveniens. `Källa: SCB` bevaras för projektets spårbarhet. PxWeb:s dokumenterade gränser är 150 000 dataceller/uttag och 30 anrop/10 sekunder/IP; dessa överförs inte till WFS. WFS 2.0.0 annonserar CountDefault=1000000, vilket inte är en uppmätt hård maxgräns. Exakt cachetid är inte belagd.
- **Kommungränser:** SCB:s produktsida anger CC0 för den aktuella produkten. Lokal konvertering och statisk leverans har därför licensstöd, men är inte genomförda. Källa, okänd/bekräftad geometriårgång och bearbetning ska redovisas; cache-/uppdateringsstrategi är inte fastställd.

### Åtkomst: beslutad för kart-api, föreslagen för övriga källor

**För kart-api är direkt browseråtkomst utan API-nyckel beslutad den 28 oktober 2026; serveradapter behövs inte i nuläget. För övriga källor är direkt browseråtkomst fortsatt ett förslag och åtkomstlösningen inte slutligt avgjord.** Lokal åtkomst för begränsade prov är inte en garanti för alla anrop, storlekar eller framtida driftförhållanden.

- kart-api ska enligt beslutet den 28 oktober användas direkt utan nyckel inom dokumenterad kvot. Kvotens lämplighet för avsedd användning behöver följas upp. Om hemlig nyckel krävs hör den hemma i en serveradapter, inte i webbläsarkod.
- TAB628 och begränsade, paginerade WFS-uttag föreslås nås direkt. Åtkomstvillkor, tekniska gränser och fel-/fullständighetskontroller måste kompletteras innan lösningen fastställs.
- För kommungränser föreslås lokal förberedelse av SCB:s förenklade gränser till GeoJSON/WGS84 och statisk leverans med appen för visualisering. CC0 ger distributionsstöd; gränsårgång, konvertering och leverans är ännu inte verifierade. Förbearbetning innebär inte i sig en server i drift.

En serveradapter löser inte oklar licens, okänd geometriårgång eller leverantörens kapacitetsgränser. Enligt arkitekturen kan även annan tillåten källa eller ett tillåtet förberett utdrag väljas om direktåtkomst inte räcker.

### Återstående beslut och ansvar

Gabriela ansvarar för fortsatt källverifiering, metadata, datakontrakt, tester och dokumentation. Källvalen behöver slutligt fastställas med belägg för CRS, referenstider, kompatibel gränsindelning, rättigheter, cache och åtkomstgränser. Detta avsnitt avslutar inte P2 och inför inga funktioner från P3–P6.

**Serverfrågan för kart-api är avgjord i samråd med Henrik den 28 oktober: ingen serveradapter behövs i nuläget.** Gabriela tillsammans med Henrik bedömer återstående åtkomstlösningar för SCB och kommungränser före beroende implementation. Lösningen för kart-api omprövas om nya behov eller begränsningar uppstår. Relevanta avstämningar med Henrik är om kart-api:s kvot och betaegenskaper motsvarar avsedd användning, om konstaterade begränsningar i gränser/indelning är acceptabla för syftet och vilka driftkonsekvenser en eventuell serveradapter får. Detta är befintligt krav-/GIS-stöd och gemensam granskning, inte nya formella godkännandekrav.


### P2 – API-åtkomst, 28 oktober 2026

**Status: Beslut fattat i samråd med Henrik.**

- **Beslut:** Använda kart-api direkt från webbläsaren utan API-nyckel.
- **Motivering:** API- och CORS-tester har fungerat.
- **Serveradapter:** Behövs inte i nuläget.
- **Genomfört 28 oktober:** Båda kart-api-adaptrarna finns och har passerat syntetiska tester och liveprov via Node. Kommunkoder, attribution, begränsade/tomma söksvar och HTTP 404/422 kontrollerades; inga fel konstaterades i de verifierade fallen. Inget nytt browsertest eller gränssnittsprov gjordes.
- **Nästa steg för P2:** Komplettera återstående källmetadata och SCB-verifiering samt fastställ åtkomst för SCB och kommungränser enligt [DATA_SOURCES](DATA_SOURCES.md#återstående-p2-dokumentation-och-beslut). Inkoppling i gränssnittet hör till kommande funktionsetapper.
- **Uppföljning:** Ompröva lösningen om nya behov eller begränsningar uppstår.


## P2 – beslutsförslag: direkt TAB628-åtkomst för kommunstatistik, 1 november 2026

**Historisk status 1 november: förslag för granskning, inte slutligt godkänd arkitektur.** Det avgränsade käll- och åtkomstvalet har därefter godkänts av Gabriela den 2 november 2026 enligt beslutet nedan. Förslagets underlag och begränsningar bevaras; godkännandet omfattar inte implementation eller verifierad geografisk överensstämmelse.

### Föreslagen lösning och motiv

Låt webbläsaren hämta kommunstatistik direkt från SCB:s PxWeb API v2, tabell TAB628, utan separat server eller API-nyckel. Hämta ett begränsat urval för den valda kommunen och ett uttryckligt statistikår. TAB628 innehåller folkmängd, officiell landareal och publicerad befolkningstäthet i samma tabell. Direktåtkomst passar den statiska Vite-/Leaflet-appen på GitHub Pages och undviker en server med separat driftbehov när ingen hemlig nyckel eller CORS-proxy behövs för de testade anropen. Bedömningen gäller kommunstatistik, inte befolkningsrutor, eget ritat område eller analysgeometri.

### Underlag: dokumenterat respektive praktiskt verifierat

- SCB:s [API-översikt](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/) och [v2-dokumentation](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/pxwebapi-v2/) beskriver GET-uttag. Aktuella referenser, exakta testadresser, värden och datum finns i [TAB628-kontrollerna i DATA_SOURCES](DATA_SOURCES.md#scb-tab628-kommunstatistik). Dessa kontroller är beslutsunderlag, inte en generell tillgänglighetsgaranti.
- Node-provet den 1 november 2026 gav HTTP 200 och `Access-Control-Allow-Origin: *` för metadata och ett litet datauttag utan nyckel eller autentisering. Dimensionsordning, kommunkoder och nio numeriska värden kontrollerades med assertions.
- Det separata, lyckade browserprovet samma dag kördes från `http://127.0.0.1:53896` i Microsoft Edge 156 headless med normal CORS-säkerhet, isolerad profil och `credentials: 'omit'`. Metadata och tre kommuners data gav läsbart JSON, HTTP 200 och `Response.type = 'cors'`, utan registrerade nätverks- eller konsolfel. Assertions och efterkontroll av server-/processavslutning passerade. Provet omfattade Uppsala `0380`, Malmö `1280` och Kiruna `2584`, totalt kön, statistikåret 2025 och tre mått; det bevisar inte alla kommunvärden eller färdig appfunktion.
- Sparade SCB-fixturer och befintliga kontraktstester ger underlag för validering och koppling av mått. De ersätter inte browserprovet. Ingen ny körning av hela testsviten gjordes för detta beslutsförslag.

### Ansvarsfördelning mellan kart-api och SCB

kart-api används för kommunval: `/v1/kommun/lookup` kopplar en kartpunkt till kommunkod och `/v1/kommun/{kod}` ger visningsgeometrin. SCB TAB628 föreslås ge statistik via samma fyrsiffriga kommunkod, bevarad som sträng med eventuella inledande nollor. Ingen namnmatchning, beräkning från polygonens yta eller fördelning av kommunbefolkning till mindre områden ska göras. Uppgifterna från kart-api är inte SCB-statistik och ska behålla sin egen källa/attribution. SCB-värden ska visas med `Källa: SCB`, mått, enhet och referensdatum. Gemensamma koder bevisar inte att gränsindelning och statistikårgång överensstämmer; det ska kontrolleras före join. CRS för lookup-indata och kommungränsernas årgång förblir öppna enligt DATA_SOURCES.

### Risker, begränsningar och villkor före implementation

- **Tillgänglighet och CORS:** förslaget innebär ett direkt beroende av SCB:s API och framtida CORS-konfiguration. Fel, timeout och kvotbegränsning ska visas begripligt; gammal statistik får inte bli statistik för ett nytt kommunval. Ingen tjänstegaranti har belagts. Produktionsdomänens åtkomst/CSP och andra browsers är inte provade här.
- **Anropsgränser:** SCB dokumenterar högst 150 000 dataceller per uttag och 30 anrop per 10 sekunder och IP-adress. En arbetsplats kan dela IP och därmed kvot. Begränsa uttag, undvik upprepade identiska anrop och planera återanvändning, avbrytning samt kontrollerad återhämtning. Exakt cache-/uppdateringsstrategi och hantering av exempelvis HTTP 429 återstår inför implementation. De här gränserna gäller PxWeb, inte automatiskt SCB WFS.
- **Tid och mått:** provat statistikår är 2025 och var senaste tillgängliga år vid kontrollen. Folkmängden avser **2025-12-31**, landarealen **2026-01-01** och tätheten relaterar dessa mått enligt tabellmetadata. Referensdagarna får inte ersättas med hämtningsdatum eller tabellens `updated`. Landareal är inte kommunpolygonens totala geometriska yta. Val av nästa statistikår kräver ny metadatakontroll och kontroll av indelningen.
- **Datakvalitet:** saknat, sekretess och noll ska hållas åtskilda. CKM-röjandeskydd kan göra att summerade delvärden avviker från publicerade totaler. Dimensionsindex, enheter och metadata behöver valideras i en framtida SCB-adapter; någon sådan färdig adapter införs inte genom detta förslag.
- **Omprövning:** om senare krav innebär hemlig nyckel, otillräcklig CORS-åtkomst eller behov av gemensam cache/kapacitet ska alternativ utredas. En serveradapter kan vara ett alternativ men löser inte okänd årgång, datarättigheter eller leverantörens begränsningar av sig själv.

### Historisk beslutsstatus den 1 november 2026

Gabriela och Henrik behöver ta ställning till detta avgränsade förslag om källa och direktåtkomst för kommunstatistik innan beroende implementation startar. Ett godkännande ska dokumenteras separat med datum, omfattning och accepterade begränsningar. WFS-åtkomst, analysgeometri och övriga öppna P2-frågor är inte avgjorda av förslaget. P2 markeras därför inte som avslutat här.

### Godkänt avgränsat P2-beslut, 2 november 2026

**Status: godkänt av Gabriela i projektkonversationen.** Ett separat godkännande från Henrik dokumenteras inte här. Beslutet gäller källval och åtkomst för kommunval, visningsgränser och kommunstatistik. Det ersätter tidigare förslagsstatus för just dessa delar, inte övriga öppna P2-frågor.

- **kart-api:** används för kommunval genom `/v1/kommun/lookup` och för visningsgränser genom `/v1/kommun/{kod}`. Befintliga P3-funktioner ändras inte av beslutet.
- **SCB TAB628:** väljs för folkmängd, officiell landareal och publicerad befolkningstäthet för statistikåret **2025**, via direkt GET-åtkomst från webbläsaren utan separat server eller API-nyckel. Källa, enhet och referensdatum ska följa statistiken. Skälet är att den statiska appen kan använda den verifierade åtkomsten utan ytterligare serverdrift.
- **Underlag:** Node- och browserproven den 1 november samt [kontrollen av alla 290 kommuner den 2 november](DATA_SOURCES.md#fullständigt-kommunurval-för-2025-kontrollerat-2-november-2026): 290 unika fyrsiffriga koder och 870 numeriska värden, utan observerade saknade värden eller statusfält i just det uttaget. Det är inte en färdig appintegration eller en garanti om framtida svar.
- **Begränsningar som kvarstår:** samtliga risker i avsnittet ovan gäller fortsatt, inklusive beroendet av SCB:s tillgänglighet/CORS, oprövad produktionsorigin/CSP, högst 150 000 dataceller per uttag och 30 anrop per 10 sekunder/IP, delad arbetsplatskvot, fel-/timeout-/cachehantering inför implementation samt CKM-röjandeskydd. Frånvaro av statusmarkeringar innebär inte statistisk exakthet eller garanterad summerbarhet. Folkmängden gäller **2025-12-31**, landarealen **2026-01-01**, och tätheten relaterar dessa mått. Ingen polygonarea får ersätta SCB:s landareal.
- **Uttryckligen öppet:** CRS för lookup-indata och kart-api-gränsernas giltighetsdatum/indelningsår. WGS84-beskedet för polygongeometrin bekräftar inte lookup-indatats CRS. **Geografisk kompatibilitet med TAB628 2025 är inte bekräftad eller godkänd genom beslutet.** Den fyrsiffriga kommunkoden ger en teknisk kopplingsnyckel men bevisar inte samma geografiska indelning. Se [årgångskontrollen](DATA_SOURCES.md#kontroll-av-kommunpolygonernas-årgång-och-tab628-koppling-2-november-2026).
- **Utanför godkännandet:** ingen implementation, geografisk join, merge, push eller publicering är beställd genom detta beslut. Befolkningsrutor/WFS, analysgeometri och övriga P2-frågor är fortsatt separata. P2 markeras inte som färdigt. Direktåtkomsten omprövas om nya krav eller verifierade hinder uppkommer.

## P2 – avgränsat källval för befolkningsrutor, 2 november 2026

**Status: godkänt av Gabriela i projektkonversationen.** SCB:s WFS vid `https://geodata.scb.se/geoserver/stat/wfs`, lager **`stat:befolkning_1km_2025`**, väljs som källa för befolkningsrutor på **1 km** med referenstid **2025-12-31**. Detta ersätter tidigare kandidat-/förslagsstatus för just källvalet. Det innebär inte godkännande av implementation eller att produktionens funktionalitet är verifierad.

**Åtkomstinriktning:** direkt åtkomst från webbläsaren utan separat server är den inledande lösningen att utgå från inför senare implementation. Begränsade uttag har fungerat utan API-nyckel eller autentisering. Något verifierat behov av en server är inte belagt i dessa prov; det är inte en garanti att serverstöd aldrig behövs. Åtkomsten ska omprövas om browser/CORS, kapacitet eller andra krav ger belagda hinder.

**Befintligt underlag:** [WFS-kontrollerna i DATA_SOURCES](DATA_SOURCES.md#scb-wfs-befolkningsrutor) dokumenterar schemakontroll och Node-prov den 28 oktober: fyra sidor med 5+5+5+2 objekt, 17 unika ID:n, referenstid och EPSG:3006, samt tomma svar och felaktigt lager. Observerade CORS-huvuden är inte ett nytt browserprov. Små verkliga SCB-fixturer och SCB:s dokumenterade CC0-stöd finns. Inga tester upprepades för detta beslut och ingen nationell rutdatabas laddades ned.

### Öppna villkor inför beroende implementation

- **Browser/CORS och drift:** direkt åtkomst från verklig browser och produktionsorigin är inte fullständigt verifierad för WFS genom Node-proven. Produktionsfunktionalitet, andra browsers och tillgänglighet får inte beskrivas som bekräftade. Inget tillgänglighetslöfte har belagts.
- **Kvoter och cache:** numerisk WFS-anropskvot, hård servermaxgräns och exakt cachetid är obekräftade. `CountDefault=1000000` i WFS 2.0.0 är inte en kapacitetsgaranti eller automatiskt maxgräns för WFS 1.1.0. TAB628:s PxWeb-kvoter får inte överföras till WFS. Uttag ska begränsas geografiskt; storleks- och återhämtningsstrategi behöver bestämmas inför implementation.
- **Paginering och fullständighet:** det lyckade 17-objektsprovet gäller ett enda utsnitt. Stabila ID:n över uppdateringar, avduplicering och oföränderlighet mellan sidor är inte garanterade. WFS 2.0.0 annonserar `PagingIsTransactionSafe=FALSE`. Ofullständigt uttag får inte presenteras som fullständig täckning eller total.
- **Nullable-fält och värden:** schemat tillåter null eller frånvaro för flera ID-, referenstids-, befolknings- och geometrifält. Tolkning per variabel ska fastställas före normalisering; noll, saknat och sekretess får inte blandas. Produkten omfattar befolkade rutor; noll får inte automatiskt beskrivas som obebodd yta. Köns-/åldersdelar får inte förutsättas summera till publicerad total.
- **XML-fel:** ett verifierat felprov gav HTTP 200 med XML `ows:ExceptionReport`. Innehållstyp och felkropp måste kontrolleras; status 200 betyder inte ensamt giltiga data. Provet fastställer inte formatet för alla felvarianter eller när JSON uttryckligen begärs.
- **Koordinater:** källagrets CRS är **EPSG:3006**. Korrekt koordinattransformation och validering till **GeoJSON/WGS84 med longitud före latitud** krävs före webbvisning. Att byta CRS-etikett räcker inte. Transformationen är inte implementerad eller testad genom beslutet.
- **Geografisk tolkning:** rutvärdet gäller hela rutan, inte den del som överlappar ett godtyckligt ritat område. Helt inkluderade rutor och gränsrutor ska hållas isär enligt [ANALYSIS_METHODS](ANALYSIS_METHODS.md). Ingen areaviktad fördelning införs och inga exakta befolkningstal för ett ritat område utlovas. Röjandeskyddets summeringsbegränsningar ska följa analysresultatet.

**Avgränsning och nästa beslut:** källvalet och den inledande åtkomstinriktningen är fastställda för P2; ovanstående villkor kvarstår inför beroende uttags-/normaliserings-/analysarbete. Lookup-CRS, kommungränsernas årgång och deras kompatibilitet med SCB-statistik avgörs inte här. Befintliga P3-funktioner ändras inte. Ingen implementation, push, merge eller publicering är beställd genom beslutet, och P2 markeras inte som helt avslutat här.

## Mall för nya arkitekturbeslut

Lägg till ett kort numrerat beslut när en fråga blir avgjord:

- Datum och status.
- Problem och observerade begränsningar.
- Vald lösning och varför.
- Alternativ som faktiskt övervägdes.
- Konsekvenser för användare, data, drift och tester.
- Länk till issue eller pull request.
# Lokalt P3-beslut – kommunval, 30 oktober 2026

På uppdrag införs tre panelsteg och val av en kommun genom kartklick. Befolkning och analys markeras som planerade. Kommunpolygonen hämtas direkt från kart-api:s `/v1/kommun/{kod}` efter punktuppslag; inga nationella rådatafiler lagras eller återpubliceras. Detta väljer kart-api för denna avgränsade visualisering och ändrar inte öppna beslut om analysgeometri eller SCB. Gränsårgången visas som okänd. Kommunkod är tangentbordsalternativ. Flera kommuner, regioner och ritade områden implementeras senare.
