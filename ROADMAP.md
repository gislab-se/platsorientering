# Arbetsplan

Alla produktionsuppgifter ägs av Gabriela. Henrik ger kravstöd och återkoppling. Arbetet ska ge både lärande och en användbar geografisk tittfunktion. Rubrikerna P1–P9 används även för GitHub-issues; aktuell detaljstatus följs där.

**Aktuellt P3, 3 november 2026:** kommunvalets funktionalitet och avgränsade P3-kontroller är klara på `feat/3-3-felmeddelanden`. Gabriela har även godkänt Kiruna `2584` på localhost. P3 är redo för PR-granskning; tilläggen är ännu inte sammanslagna till `main` eller publicerade. Gränsårgång och lookup-CRS förblir obekräftade. Se P3-bedömningen nedan.

**Historisk status 2 november 2026:** P1 är sammanslaget genom PR #10. P2:s slutkontroller är godkända: 65/65 tester, typkontrakt, TypeScript och produktionsbygge. Kompletteringarna är pushade till `feat/2-slutfor-datakallor` och ingår i PR #14; merge inväntar Gabrielas godkännande. Delar av P3 (klick/kodval och polygonvisning) ingår redan i PR #12 på `main` och den tidigare publicerade kartan; P3 är inte avslutat. P4–P8 är kommande arbete och P9 en senare utredning. Aktuell funktionsstatus finns i README.

Första funktionsmål: P1–P4 ger en kommunöversikt med befolkning. Regioner och sammansatta områden införs därefter i avgränsade steg. En stabil, granskad förhandsversion ska först publiceras via `yakimovskagabriela-ctrl`; exakt tidpunkt, repo och metod beslutas före publicering. Slutpublicering på gislab.se ingår i P8.

## P1 – Skapa och förstå en körbar projektgrund

Status: **implementerad och sammanslagen till `main` genom PR #10**. De daterade manuella kontrollerna finns i P1-guiden. Gabrielas fortsatta genomgång av hur delarna hänger ihop och test på fysisk mobil är lärande-/kvalitetsuppföljning och ändrar inte Git-historiken.

Ansvarig: Gabriela. Beroenden: inga.

Skapa TypeScript/Vite/Leaflet-grunden och dokumentera lokal installation. Välj och lås aktuella stödda versioner. Skapa bara den struktur som behövs för första delmålet.

Klart när:

- En ny klon kan installeras och startas med dokumenterade kommandon.
- En karta visas och anpassas till skärmstorleken.
- Typkontroll och produktionsbygge passerar.
- Node-version och låsfil finns; Gabriela kan förklara hur HTML, TypeScript, CSS och kartbibliotek hänger ihop.
- CI kör typkontroll och bygge vid pull requests.

## P2 – Verifiera datakällor och skriv datakontrakt

### Avslutsbedömning 2 november 2026

**Slutkontroller godkända och godkänd push genomförd; PR #14 inväntar merge-godkännande.** `npm.cmd test` gav 65/65 godkända runtime-tester samt godkända typkontrakt. `npm.cmd run build` passerade med TypeScript-kontroll och produktionsbygge. Arbetskopian var ren efter kontrollerna och GitHub-grenens commit verifierades mot lokal HEAD efter push. Följande bedömning gäller godkänt, avgränsat källval och befintliga P2-kontrakt, inte färdig SCB-integration. Den ersätter de historiska statusformuleringarna nedan utan att göra obekräftad metadata till fakta.

| Ursprungligt P2-kriterium | Bedömning och belägg | Kvarstående avgränsning |
| --- | --- | --- |
| Källregister och metadata | Uppfyllt inom dokumenterad avgränsning: endpoints, urval, referensdagar, CRS-underlag, licenser och kontroller finns i DATA_SOURCES. | Lookup/geocode-CRS, gränsårgång och vissa WFS-gränser är uttryckligen okända; ingen geografisk kompatibilitet utlovas. |
| Lokala browserprov och åtkomstgränser | Uppfyllt med begränsningar: TAB628 har nytt Edge-prov 1 november; WFS ett äldre redovisat localhost-browserprov och Node-paginering 28 oktober. | WFS-browserprovets exakta datum/original-URL saknas. Produktionsåtkomst, full kapacitet och alla felvägar är inte verifierade. |
| Provsvar, interna typer, tomt/fel/begränsat | Uppfyllt för P2: fem kontrakt, runtime-validering, fyra syntetiska och tre verkliga SCB-fixturer samt senast 65 godkända runtime-tester. | Färdiga SCB-adaptrar och rumslig analys hör till senare implementation, inte nya P2-krav. |
| Återpublicering separat bedömd | Uppfyllt för aktuell användning: SCB:s CC0 och kart-api:s visnings-/distributionsvillkor är åtskilda. | Inga verkliga kart-api-fixturer får införas utan klarlagd rätt för sådan lagring/publicering. |
| Käll-/serverbeslut dokumenterat | Uppfyllt inom godkänd omfattning: kart-api och direkt TAB628; SCB WFS valt med direktåtkomst som inledande riktning. Se DECISIONS. | Omprövning vid belagda hinder; WFS är inte verifierad produktionsfunktionalitet. |

**Överlämning till P3–P6:** leverantörsbesked behövs före beroende användning av obekräftat koordinatsystem eller geografisk årgångsmatchning. Cache-/kvot-/timeoutstrategi, WFS-browser-/produktionsåtkomst, ID-stabilitet, nullable-värden, XML-fel och korrekt EPSG:3006 → WGS84-transformation ska hanteras inför respektive implementation. Hela gränsrutor får inte bli exakt befolkning för ett ritat område. Ingen sådan implementation eller dispens från GIS-reglerna godkänns genom P2-avslutet.

**Kvar för avslut:** granska PR #14 och invänta Gabrielas uttryckliga merge-godkännande. Sluttester och push är redan genomförda; lyckade tester och live-/browserprov upprepas inte för denna statusrättelse. Ingen merge, publicering, ändring av GitHub-issue eller backup genomförs av statusrättelsen.

### Historisk status 28 oktober 2026

Status 28 oktober 2026: **delvis uppfyllt, inte avslutat**. De fem klartkriterierna nedan motsvarar Issue #2 enligt kravtexten från Gabriela. Fem interna kontrakt, runtime-validering, fyra syntetiska och tre verkliga SCB-fixturer finns. Senaste typkontrakt, 63 runtime-tester och typkontroll passerade. kart-api-adaptrarna har liveprovats; SCB WFS-paginering har återtestats med 17 unika objekt samt tom-/felprov. Källor och rättighetsbedömning finns i [DATA_SOURCES](docs/DATA_SOURCES.md).

Direkt kart-api-åtkomst utan nyckel/server är beslutad i samråd med Henrik. Åtkomst för SCB och kommungränser är fortsatt ett förslag, se [DECISIONS](docs/DECISIONS.md). Kvar för P2-bedömningen är att fastställa dessa käll-/åtkomstval och hantera öppna metadatafrågor, särskilt kart-api:s CRS/referenstid och kommungränsernas årgång. Dokumentationen skiljer dem från senare implementation: P3-gränssnitt och färdiga SCB-adaptrar införs inte för att avsluta P2. Ingen ny testkörning eller ändring av GitHub-status har gjorts vid denna dokumentsynkronisering.

Ansvarig: Gabriela. Beroenden: P1.

Kontrollera kart-api och SCB mot riktiga svar och leverantörernas dokumentation. Utred de datakällor som behövs för kommunval, platsökning, kommunstatistik och befolkningsrutor i Sverige.

Klart när:

- DATA_SOURCES har endpoints, parametrar, täckning, referenstider, CRS, licens, attribution, kvoter och hämtningsdatum för valda källor.
- Browseranrop från lokal miljö har provats; krav på nyckel, CORS, paginering och storleksgränser är utredda.
- Små tillåtna provsvar och interna typer finns. Tomt, felaktigt och begränsat svar hanteras.
- Återpublicering av data har bedömts separat från rätt att visa data.
- Eventuellt serverbehov är avgjort i DECISIONS innan beroende funktioner byggs.

## P3 – Välj kommun och visa rätt område

### Slutbedömning 3 november 2026

**Funktionalitet och P3-kontroller klara; redo för PR-granskning.** P3.1a, P3.1b, P3.2 och P3.3 ingår i commitkedjan till `2382d4b`, pushad på `feat/3-3-felmeddelanden`. Ingen PR, merge eller publicering har genomförts genom dokumentationsuppdateringen.

| Ursprungligt P3-kriterium | Bedömning och belägg |
| --- | --- |
| Kommunval i Uppsala, Malmö och Kiruna utan särskild kod | Uppfyllt: samma sök-/valflöde använder SCB-listans 290 namn/koder. Gabriela har godkänt localhost-flödet i Uppsala, Malmö och Kiruna `2584`; Kiruna var den sista manuella kontrollen. Register-/söktester och browser-UI-prov omfattar alla 290 kodval, men inte alla verkliga kommunpolygoner. |
| Centrering och gemensamt apptillstånd | Uppfyllt: kartklick och vald sökträff använder samma `AreaOfInterest`-baserade tillstånd. Gräns, centrering och panel följer samma val; söktexten är separat. Tillståndstester och Gabrielas fyra manuella P3.2-kontroller är godkända. |
| Ett gammalt nätverkssvar kan inte ersätta ett nyare val | Uppfyllt: `AbortController` och `requestId` bevaras. Automatiska tester täcker sena polygon-/uppslagssvar och sena fel; ett syntetiskt browserprov verifierade att ett sent svar inte ändrar vyn. |
| Tydlig laddning, tomt resultat och fel; tangentbordsval | Uppfyllt: separata tillstånd/meddelanden och rensning av gammal gräns. Sex browser-UI-prov och verkligt Tab/Enter/Space-val är godkända. Gabriela har godkänt klick utanför Sverige, svenskt Offline-fel och återhämtning efter No throttling med nytt val av Uppsala. Ogiltig JSON och bevarade avbrott är automatiskt testade. |

Senaste automatiska kontroller: **90/90 runtime-tester samt godkänt TypeScript och produktionsbygge**. Tidigare lyckade tester upprepas inte för denna dokumentationsändring. De separata browserproven ingår inte i `npm test`; PR-konflikter och GitHub-CI har ännu inte bedömts för en P3-PR.

**Kvarstående begränsningar:** gränsen är förenklad för visning och årgången är okänd; detta visas uttryckligen i appen och lagras som `unknown`. Lookup-indatas CRS är fortfarande inte officiellt bekräftat. Ingen geografisk kompatibilitet med SCB-årgångar eller analysnoggrannhet utlovas. Befolkningsdata/analys hör till P4–P6 och bredare browser-/mobil-/helflödeskontroller till fortsatt kvalitetsarbete, bland annat P7. Dessa funktioner eller metadatafrågor blir inte bekräftade genom P3-bedömningen. Kvar i GitHub-flödet är att, efter godkännande, öppna/granska PR och kontrollera CI före separat merge-beslut.

### Historiska delstatusar före slutbedömningen

P3.2, 3 november 2026 på `feat/3-2-gemensamt-tillstand`, från `0926f33`: gemensamt kommunval med befintligt `AreaOfInterest`, separat söktext och samma tillstånd som underlag för karta/panel. Nya val, tomma uppslag och fel lämnar ingen gammal gräns. `AbortController` och `requestId` bevaras; gränsårgång förblir okänd. 87/87 runtime-tester inklusive 12 nya tillstånds-/svarsracetester samt TypeScript/bygge passerade. Sex browser-UI-tester, tangentbord och ett syntetiskt browserprov av kart-/sökval och felvägar passerade; inget nytt live-API-prov gjordes. Gabriela har godkänt alla fyra manuella localhost-kontroller den 3 november: byte mellan Uppsala och Malmö med gräns/centrering/panel, söktext utan nytt val, kartval med bevarad söktext och klick utanför Sverige utan kvarvarande gammal gräns. P3.2 är därmed manuellt godkänt; P3 är inte slutligt avslutat.

P3.1b är därefter committat och pushat som `0926f33` på `feat/3-1b-kommunval-sokning`. Följande stycke bevarar statusen före den committen.

P3.1b, lokalt 2 november 2026: grenen `feat/3-1b-kommunval-sokning` bygger på P3.1a-commit `174df1b`. Panelen kopplar namn-/kodsökning till befintlig `selectMunicipality()` genom vald fyrsiffrig kod; kartklick använder fortsatt samma valflöde. SCB-registret och sökalgoritmen är oförändrade. 75 runtime-tester, sex separata browser-UI-tester inklusive alla 290 kodval, verklig Tab/Enter/Space-styrning samt TypeScript/bygge passerade. Liveval av Uppsala och Upplands Väsby ritade gränsen. Gabrielas manuella kontroll återstår före commit/push; P3 är inte slutligt avslutat och gränsårgång/lookup-CRS förblir öppna.

Lokalt påbörjat 30 oktober 2026 på `feat/3-kommunval-panel`: panel i tre steg och kommunval med kartklick eller kod är implementerade. Bygge och 65 tester passerar. Webbläsarverifiering och namnval återstår; P3 är inte avslutat. Befolkningsdata och analys är fortsatt planerade. GitHub Issue #3 kunde inte läsas från miljön; uppgiften följer användarens avgränsning och kriterierna nedan. Grenen bygger på aktuell P2-arbetskopia med befintliga lokala ändringar bevarade; dessa behöver hållas åtskilda vid senare commit/PR.

Ansvarig: Gabriela. Beroenden: P2.

Bygg val av kommun med namn och kod. Behåll inledande nollor i kommunkoder och visa vald gräns med årgång.

Klart när:

- Kommunval fungerar i Uppsala, Malmö och Kiruna utan särskild kod per plats.
- Valet centrerar kartan och uppdaterar gemensamt apptillstånd.
- Ett gammalt nätverkssvar kan inte ersätta ett nyare områdesval.
- Laddning, tomt resultat och fel är tydliga. Valet fungerar med tangentbord.

## P4 – Visa befolkning och täthet för kommuner

### Avslutsbedömning 6 november 2026

**P4:s leverans är klar enligt avgränsningen som Gabriela återrapporterat efter samtal med Henrik.** Gabriela bekräftar att hon visat den fungerande Kommunöversikt för Henrik och fått hans godkännande. Okänd gränsårgång accepteras som dokumenterad begränsning för kommunöversikten, enligt [beslutet](docs/DECISIONS.md#p4--accepterad-metadataosäkerhet-och-godkänd-demonstration-6-november-2026). Detta ersätter verifierad geografisk överensstämmelse som avslutshinder för just P4; det är ingen bekräftelse av gränsårgången.

| Kriterium | Bedömning |
| --- | --- |
| Folkmängd, officiell landareal och publicerad täthet med år, enhet och källa | Implementerat i Kommunöversikt för valt kommunnummer, med SCB-källänk och skilda referenstider. |
| Testkommuner och avrundning | Uppsala, Malmö och Kiruna jämförs med sparade SCB-värden; publicerad täthet visas och kontrolltoleransen är dokumenterad. |
| Dubbletter, okända koder, saknade värden och ogiltiga nämnare | Duplicerade JSON-stat-index och ogiltiga svar avvisas; okända koder, null, noll och ogiltig landareal hanteras utan påhittade statistikvärden. |
| Meningsfulla tester utan nätverk | Senaste kodkontroller gav 110/110 runtime-tester, typkontrakt och produktionsbygge. Nio separata browserprov och dokumenterade liveprov finns. Inga tester har körts om för denna statusändring. |
| Demonstration för Henrik | Gabriela har den 6 november bekräftat genomförd demonstration och Henriks godkännande. |

Den offentliga P4-förhandsversionen är verifierad enligt README och DEPLOYMENT. PR #16 och Issue #4 har inte ändrats genom denna dokumentationsuppdatering; ingen ny commit, merge eller publicering ingår. De ursprungliga kriterierna nedan bevaras som historiskt kravunderlag och läses tillsammans med beslutet ovan.

Ansvarig: Gabriela. Beroenden: P3.

Koppla kommunstatistik via kod och verifierad indelning. Använd sammanhängande årgångar för befolkning, officiell landareal och täthet.

Klart när:

- Folkmängd, landareal och täthet visas med år, enhet och källa.
- Resultat för testkommunerna stämmer mot källtabellen med dokumenterad avrundning.
- Dubbletter, okända koder, saknade värden och felaktiga nämnare ger begriplig hantering.
- Analysen har meningsfulla tester och kan köras utan nätverk.
- Gabriela visar den första fungerande kommunöversikten för Henrik.

## P5 – Sök plats och hantera fler områdesval

Ansvarig: Gabriela. Beroenden: P3; kan genomföras efter P4.

Inför platsökning. Utvidga områdesvalet stegvis med regioner, områden sammansatta av flera kommuner eller regioner och ett ritverktyg för polygoner. Avgränsa varje områdestyp i en egen liten uppgift och håll dess statistik skild från kommunstatistiken.

Klart när:

- Flera orter med samma namn presenteras så att användaren kan välja rätt.
- Regioner och sammansatta områden har tydliga identifierare, geometriårgångar och källor innan de visas som valbara.
- Polygoner kan ritas, redigeras och tas bort. Ogiltig eller tom geometri avvisas begripligt.
- Gammal kommunstatistik visas inte som statistik för ett nytt ritat område.
- Områdesvalet och geometrin kan testas oberoende av kartans utseende.
- Ritning och kompletterande kontroller har provats på mobil och med dokumenterad tangentbordshantering.

## P6 – Visa och analysera befolkningsrutor

Ansvarig: Gabriela. Beroenden: P2 och P5.

Hämta rutdata för det valda utsnittet och följ ANALYSIS_METHODS. Behåll hela rutornas geometri och geografiska referens.

Klart när:

- Samma hämtning fungerar för flera svenska områden, med kontrollerad paginering och fullständighet.
- Teckenförklaring, statistikår och noll/saknatillstånd är tydliga.
- Helt inkluderade rutor och gränsrutor redovisas separat utan dubbelräkning.
- Varken totalen för överlappande rutor eller areaviktad uppskattning presenteras som exakt befolkning i polygonen.
- Tester täcker en hel ruta, en delvis överlappande ruta, hål i polygon, MultiPolygon, tomt urval och ofullständigt svar.
- Rimliga storleksgränser har uppmätts och dokumenterats för mobil och dator.

## P7 – Testa hela användarflödet och förbättra begripligheten

Ansvarig: Gabriela. Beroenden: P4–P6.

Sammanför funktionerna till en sammanhängande app och låt en kollega på Lablab prova den.

Klart när:

- Platsval → kommunresultat → rutlager → ritat område fungerar i ett webbläsartest.
- Mobil, tangentbord, fokus, läsbarhet och färglegend har kontrollerats.
- Timeout, kvotfel, avbrutna anrop och saknade data ger användbara meddelanden.
- Ingen resultatruta blandar olika områdesval eller årgångar utan förklaring.
- Gabriela har dokumenterat användartest, åtgärder och kvarstående kända fel.

## P8 – Slutpublicera version 1 på gislab.se och lämna över

Ansvarig: Gabriela. Beroenden: P7 och driftsuppgifter från Henrik.

Utgå från erfarenheten från den tidigare GitHub-förhandsversionen. Fyll i DEPLOYMENT med faktisk målmiljö och genomför en reproducerbar slutrelease. Henrik ordnar tillgång till domän/webbhotell; Gabriela ansvarar för genomförandet.

Klart när:

- Slutlig URL, publiceringssätt och eventuell serverdel är dokumenterade.
- Appen fungerar på mål-URL:en med HTTPS, korrekta resurssökvägar, attribution och riktiga dataanrop.
- En angiven commit/tagg kan byggas om och föregående version kan återställas.
- Byggkontroller, analyskontroller och releasekontroll passerar.
- HANDOVER är ifylld med drift, datakällor, uppdatering, felhantering och kända begränsningar.
- Henrik har provat leveransen och Gabriela har demonstrerat och dokumenterat resultatet.

## P9 – Utred en senare havsnivåanalys

Ansvarig: Gabriela. Beroenden: färdig version 1 och prioritering med Henrik.

Utred datatillgång och metod innan ny analys byggs. Leveransen är först ett metodförslag.

Klart när:

- Höjdmodell, upplösning, licens, vertikalt referenssystem och vald havsnivå är dokumenterade.
- Det framgår hur kontakt med havet och lågt belägna inlandssänkor hanteras.
- En enkel höjdtröskel skiljs från en modell för kustöversvämning; ingen punktfråga används som ytmodell.
- Antaganden, osäkerheter, testområde och behov av serverberäkning är beskrivna.
- Henrik och Gabriela har valt om och hur implementationen ska fortsätta.
