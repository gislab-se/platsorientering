# Platsorientering Sverige

GISLABs webbapp för en första geografisk orientering av en plats i Sverige. Kollegor på LABLAB ska kunna välja en kommun, en region eller ett område sammansatt av flera kommuner eller regioner och få en begriplig överblick utan att arbeta i ett GIS-program.

Projektet har två lika viktiga mål: Gabriela ska lära sig bygga kartor och program med AI i Codex, och resultatet ska bli användbart för LABLAB. Gabriela deltar därför själv i utveckling, test och publicering. Henrik är beställare, handledare och GIS-stöd.

## Status

| Del | Status |
| --- | --- |
| P1 – projektgrund | Implementerad och sammanslagen till `main` genom PR #10. Kartan visar OpenStreetMap och har zoom, panorering och återställning. |
| P2 – datakällor och kontrakt | Fem kriterier är bedömda som uppfyllda inom dokumenterad avgränsning. Slutkontroller 2 november 2026: 65/65 tester, typkontrakt, TypeScript och produktionsbygge godkända. Push till `feat/2-slutfor-datakallor` är genomförd och verifierad; [PR #14](https://github.com/gislab-se/platsorientering/pull/14) är squash-mergad till `main` i commit `9f93cc7`. Se [P2-checklistan](ROADMAP.md#p2--verifiera-datakällor-och-skriv-datakontrakt). |
| P3 – kommunval | Funktionalitet och avgränsade P3-kontroller är klara på P3-grenen: namn-/kodsökning för 290 kommuner, kartval, gemensamt tillstånd, markerad gräns/centrering och tydliga laddnings-/felmeddelanden. Gabriela har godkänt localhost-flödet i Uppsala, Malmö och Kiruna (2584). Senast 90/90 runtime-tester samt TypeScript/bygge godkända. Redo för PR-granskning; P3-tilläggen är ännu inte sammanslagna till `main` eller publicerade. Gränsårgång och lookup-CRS förblir obekräftade. |
| P3.1a – lokal kommunförteckning | SCB-lista med 290 namn/koder och testbar namn-/kodsökning finns i commit `174df1b`, pushad på `feat/3-1a-kommunregister`. |
| P3.1b – sökning i panelen | Namn-/kodsökning och val av träff i Välj område finns i commit `0926f33`, pushad på `feat/3-1b-kommunval-sokning`. Återanvänder samma kommunval som kartklick. |
| P3.2 – gemensamt tillstånd | På `feat/3-2-gemensamt-tillstand`, från `0926f33`: ett gemensamt val med `AreaOfInterest` styr karta och panel. Söktext hålls separat. 87/87 runtime-tester, TypeScript och bygge passerade 3 november 2026. Sex browser-UI-tester, tangentbord och syntetiska browserprov av valbyten/fel passerade. Gabriela har den 3 november godkänt alla fyra manuella localhost-kontroller: byte mellan Uppsala och Malmö med gräns/centrering/panel, söktext utan nytt val, kartval med bevarad söktext samt klick utanför Sverige som tar bort den gamla gränsen. |
| P3.3 – felmeddelanden | Svenska meddelanden för nätverksfel och ogiltig JSON vid gränshämtning finns i commit `2382d4b`, pushad på `feat/3-3-felmeddelanden`. Gabriela har godkänt Offline-felet och återhämtning med nytt val av Uppsala efter No throttling. |
| Senare funktioner | Befolkningslager och analys visas som planerade. Regioner, sammansatta och ritade områden är ännu inte implementerade. |
| Publicering | Kommunvalet publicerades på [GitHub Pages](https://yakimovskagabriela-ctrl.github.io/platsorientering/) och HTTP-/resurskontrollerades 30 oktober 2026. Automatisk överföring fick 403; reservpublicering användes. Ingen ny publicering eller URL-kontroll har gjorts vid P2-dokumentsynken. |

Källkodsrepot är privat och ligger på `gislab-se/platsorientering`. En godkänd push till dess `main` ska automatiskt bygga appen och överföra endast `dist/` till det publika repot `yakimovskagabriela-ctrl/platsorientering`. Automatiken behöver fortfarande rättade behörigheter efter det dokumenterade 403-felet; detta är en separat driftfråga, inte belägg för fel i P2:s datakontrakt. Slutpublicering på **gislab.se** sker i projektets slutskede.

### P2 – godkänt källval och faktisk funktion, 2 november 2026

kart-api är vald för kommunval och visningsgränser; SCB TAB628 för folkmängd, landareal och täthet för 2025 med direkt browseråtkomst; SCB WFS `stat:befolkning_1km_2025` för 1 km-befolkningsrutor med direktåtkomst som inledande riktning. Se [beslut och villkor](docs/DECISIONS.md).

**Implementerat:** kart-api-uppslag och polygonvisning. **Förberett:** platsökningsadapter utan gränssnitt, fem datakontrakt, runtime-validering och testfixturer. **Inte implementerat:** SCB-adaptrar i appen, befolkningslager, statistikvisning och analys. Ett godkänt källval är inte en fungerande SCB-integration.

TAB628 har ett verkligt Edge-prov från localhost den 1 november och ett Node-uttag för 290 kommuner/870 värden den 2 november. WFS har ett äldre redovisat browserprov med tre features (exakt datum/original-URL saknas) och Node-prov av 17 paginerade objekt den 28 oktober. Node genomdriver inte browser-CORS. Lookup/geocode-CRS, gränsårgång och geografisk kompatibilitet är inte verifierade; WFS-kvoter, ID-/nullhantering, koordinattransformation och produktionsåtkomst kvarstår inför beroende P3–P6-arbete. Se [källunderlaget](docs/DATA_SOURCES.md).

## Planerad första version

### Prova det lokala kommunvalet

Starta med `npm.cmd run dev`. Vänsterpanelen visar **1. Välj område**, **2. Välj data** och **3. Analys**. Klicka inom en svensk kommun: kommunens namn och kod visas och polygonen markeras grönt. Klicka på en annan kommun för att byta. Alternativt skriv kommunnamn eller exakt fyrsiffrig kod, tryck **Sök kommun** eller Enter och välj en träff med namn och kod. Tab flyttar mellan sökfält, sökknapp och resultatknappar; Enter eller mellanslag aktiverar en resultatknapp. Ingen träff väljs automatiskt. Prova `Uppsala`, `0380`, `upp` (flera träffar), `Luleå`, `Älmhult`, `Örebro` och ett påhittat namn. Prova också snabba byten, en okänd kod och en punkt utanför Sverige. Ett äldre svar ska inte ersätta det senaste valet.

**P3-slutbedömning 3 november 2026:** Gabriela har bekräftat fungerande kommunval, gränsvisning, centrering och panel i Uppsala, Malmö och nu även Kiruna `2584` på localhost. Hon har också godkänt separat söktext, byte genom kartklick, rensning efter klick utanför Sverige samt Offline-fel och återhämtning efter No throttling. De senaste automatiska kontrollerna gav 90/90 runtime-tester och godkänt TypeScript/produktionsbygge; sex separata browser-UI-prov och verkligt tangentbordsval är tidigare godkända. Ingen kontroll har upprepats för denna dokumentationsuppdatering. Det är inte en livekontroll av alla 290 kommungränser. Bredare browser-/mobil- och helflödeskontroller hör till fortsatt kvalitetsarbete, bland annat P7. Se [P3-bedömningen i ROADMAP](ROADMAP.md#p3--välj-kommun-och-visa-rätt-område).

För panelens separata offline-browserprov: öppna `/tests/municipality-search-ui.html` på samma dev-server. Sidan kör sex tester i riktig browser, inklusive att alla 290 koder kan visas och skickas till valcallbacken. Den kräver inget kart-api-anrop och ingår inte i produktionsbygget. `npm.cmd test` typkontrollerar även browser-testkoden men kör inte browserproven. Den 2 november 2026 passerade sidan i isolerad Edge tillsammans med separat styrning av verkliga Tab/Enter/Space-nedtryckningar. Ett begränsat liveprov i appen verifierade sökval och ritad gräns för Uppsala och Upplands Väsby; det är inte ett prov av alla kommunpolygoner eller ett nytt belägg för deras årgång.

P3.2, lokalt 3 november 2026: både sökträffar och kartklick går via `src/state/areaSelection.ts`. Tillstånden är inget val, laddning, bekräftat område, tomt uppslag och fel. Ett bekräftat område använder befintligt `AreaOfInterest` med validerad geometri, källa, hämtningstid och uttryckligen okänd gränsårgång/referenstid. Nytt val tömmer föregående område direkt; karta, panel och områdestext uppdateras från samma tillstånd. `AbortController` och `requestId` skyddar fortfarande mot sena svar och fel. Sökfältets text är en separat fråga och skrivs inte över av kommunvalet. Att skriva eller söka utan att välja en träff ändrar inte det bekräftade området, även om sökningen saknar träffar.

Prova P3.2: välj Uppsala, skriv `Malmö` utan att välja och kontrollera att Uppsala fortfarande är markerad. Välj sedan Malmö och kontrollera att både panel och gräns byts och kartan centreras. Klicka därefter på en annan kommun: söktexten ska ligga kvar, men bekräftat namn/kod och gräns ska följa kartvalet. Prova snabba byten och ett kartklick utanför Sverige; under laddning och efter tomt uppslag/fel ska ingen gammal gräns eller områdesinformation visas.

P3.2-kontroller: 12 nya offline-tester täcker tillståndsbyten, abort, sena polygon-/uppslagssvar och sena fel; totalt 87/87 runtime-tester passerade tillsammans med typkontroll/bygge. I isolerad Edge passerade de sex UI-proven och verkligt Tab/Enter/Space-val igen efter ändrad sökfälthantering. Ett separat tillfälligt browserprov med syntetiska API-svar verifierade kart-/sökval, oberoende söktext, rensning vid laddning/tomt/fel och skydd mot sent svar. Det provet gjorde inga liveanrop till kart-api och är inte ett nytt belägg för API-tillgänglighet, CRS eller gränsårgång; testverktyget ligger utanför Git i `.local`.

Kommungränsen hämtas via kart-api och är förenklad för visning; gränsårgången är okänd. Lookup-indatas CRS är fortfarande inte officiellt bekräftat; P3-kontrollerna bekräftar varken detta CRS eller geografisk årgångsmatchning med SCB. Ingen befolkningsstatistik eller analys utförs ännu. De nya P3-funktionerna finns på arbetsgrenen; den tidigare publiceringen innebär inte att dessa tillägg är publicerade.

Historisk P2-/publiceringsstatus före merge av PR #14: slutkontrollerna den 2 november 2026 gav 65/65 godkända tester samt godkänd typkontroll och produktionsbygge. P2-kompletteringarna var pushade på P2-grenen och ingick i PR #14, men var vid den statusnoteringen ännu inte mergade eller publicerade. Kontrollerna upprepas inte för denna P3-dokumentationsuppdatering.

P3.3, 3 november 2026 på `feat/3-3-felmeddelanden`, från `5b21ea5`: nätverksfel vid kommungränshämtning visas som ”Kommungränsen kunde inte hämtas. Kontrollera internetanslutningen och försök igen.” Ogiltig JSON visas som ”Svaret med kommungränsen kunde inte läsas. Försök igen senare.” Avbrott, HTTP-fel och befintlig datavalidering behåller sin tidigare hantering. Tre nya offline-tester täcker nätverksfel, ogiltig JSON och bevarat avbrott under anrop/läsning; totalt 90/90 runtime-tester samt typkontroll/bygge passerade. Gabriela har godkänt den manuella localhost-kontrollen: Offline-läget gav rätt svenskt nätverksmeddelande; efter återgång till No throttling och nytt val av Uppsala visades kommungränsen korrekt. Ogiltig JSON har verifierats automatiskt, inte manuellt i browsern.

### Mål för kommande etapper

- Täcker Sverige och fungerar för olika platser utan kodändringar.
- Låter användaren söka plats och välja kommun. Regioner, sammansatta områden och ett eget ritat område införs stegvis.
- Visar befolkning och befolkningstäthet för kommuner samt ett lager med befolkningsrutor.
- Ger en enkel och metodmässigt tydlig sammanställning för ett ritat område.
- Visar källa, referensår, enhet och begränsningar nära resultatet.
- Fungerar på dator och mobil och förklarar saknade data och tillfälliga API-fel.

Havsnivåanalys ingår i en senare etapp. Det första fungerande delmålet är mindre: välj en kommun och se befolkning och täthet med källa och år.

## Kom igång

Projektet använder Node.js 24 (exakt version i `.nvmrc`) och npm. På Windows kan Node.js LTS installeras med `winget install --id OpenJS.NodeJS.LTS --exact`. Öppna en ny terminal efter installationen och kontrollera `node --version` och `npm.cmd --version`.

Följ [startguiden](docs/GETTING_STARTED.md). Beroendena är låsta i `package-lock.json`. Efter kloning:

```powershell
npm.cmd ci
npm.cmd run dev
# I en separat terminal:
npm.cmd run typecheck
npm.cmd run build
```

`npm.cmd run dev` visar en lokal adress i terminalen. Öppna den i webbläsaren; stoppa servern med Ctrl+C. `npm.cmd run build` kör också typkontroll och skapar `dist/`. `npm.cmd run preview` visar byggresultatet lokalt. `npm.cmd` undviker att PowerShell försöker köra npm som ett blockerat PowerShell-skript.

Historiskt verifierat för P1 på Windows med Node.js 24.20.0 och npm 11.19.0: ren installation i en separat kopia, typkontroll, produktionsbygge, serverstart och HTTP 200. Gabriela har kontrollerat kartvisning, zoom, panorering, återställning och smal layout. P1 är senare sammanslaget till `main`. Se [P1-guiden](docs/P1_STEG_FOR_STEG.md) för de daterade kontrollerna och [ROADMAP](ROADMAP.md) för aktuell status. Fysisk mobil är ännu inte dokumenterat testad.

```powershell
git clone https://github.com/gislab-se/platsorientering.git
cd platsorientering
git status
```

Du behöver GitHub-behörighet till det privata repot. En eventuell inbjudan måste accepteras före kloning. Kontrollera alltid aktuell gren och lokala ändringar med `git status` innan du fortsätter.

## Läsordning

| Fil | Innehåll |
| --- | --- |
| [PROJECT_BRIEF.md](PROJECT_BRIEF.md) | Användare, ansvar, omfattning och leveranskrav |
| [AGENTS.md](AGENTS.md) | Instruktioner till AI-agenter och språkregler |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Teknik, modulgränser, dataflöde och GIS-principer |
| [ROADMAP.md](ROADMAP.md) | Uppgifter i genomförandeordning och acceptanskriterier |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Grenar, pull requests och klartkriterier |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | Datakällor, API-utvärdering och källregister |
| [docs/ANALYSIS_METHODS.md](docs/ANALYSIS_METHODS.md) | Befolkning, täthet och gränsrutor |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Stegvis publicering via GitHub och senare gislab.se |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Beslut, antaganden och öppna frågor |
| [docs/HANDOVER.md](docs/HANDOVER.md) | Mall för drift och överlämning |

## Teknik och tidigare arbete

Startförslaget är TypeScript, Vite och Leaflet med en statisk webbklient. API:er nås via egna adaptrar. Om data kräver hemliga nycklar eller saknar stöd för webbläsaranrop utvärderas en liten serverdel separat. Ingen infrastruktur behöver beställas för dokumentationsfasen.

Tidigare [DeSO- och befolkningskarta](https://github.com/yakimovskagabriela-ctrl/deso-karta) är referensmaterial. Kod och data återanvänds först efter kontroll av ursprung, metod och licens. Gabrielas [arbetsanteckningar i Drive](https://docs.google.com/document/d/1TzR5KzWUZ3Y8RgUgbUhuKB2iizMhvl8vjXnUid1qgpY/edit) ger praktikbakgrund och kan kräva separat åtkomst.

Ingen öppen källkodslicens är beslutad. Datakällornas respektive villkor gäller oberoende av repots synlighet.
