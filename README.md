# Platsorientering Sverige

GISLABs webbapp för en första geografisk orientering av en plats i Sverige. Kollegor på LABLAB ska kunna välja en kommun, en region eller ett område sammansatt av flera kommuner eller regioner och få en begriplig överblick utan att arbeta i ett GIS-program.

Projektet har två lika viktiga mål: Gabriela ska lära sig bygga kartor och program med AI i Codex, och resultatet ska bli användbart för LABLAB. Gabriela deltar därför själv i utveckling, test och publicering. Henrik är beställare, handledare och GIS-stöd.

## Status

| Del | Status |
| --- | --- |
| P1 – projektgrund | Implementerad och sammanslagen till `main` genom PR #10. Kartan visar OpenStreetMap och har zoom, panorering och återställning. |
| P2 – datakällor och kontrakt | Fem kriterier är bedömda som uppfyllda inom dokumenterad avgränsning. Slutkontroller 2 november 2026: 65/65 tester, typkontrakt, TypeScript och produktionsbygge godkända. Push till `feat/2-slutfor-datakallor` är genomförd och verifierad; [PR #14](https://github.com/gislab-se/platsorientering/pull/14) inväntar merge-godkännande. Se [P2-checklistan](ROADMAP.md#p2--verifiera-datakällor-och-skriv-datakontrakt). |
| P3 – kommunval | Kartklick/kodval, markerad kommunpolygon och panelens tre steg är implementerade och ingår i PR #12 på `main`. Namnval och fullständig interaktiv browser-/mobilkontroll återstår; P3 är inte avslutat. |
| P3.1a – lokal kommunförteckning | SCB-lista med 290 namn/koder och testbar namn-/kodsökning finns i commit `174df1b`, pushad på `feat/3-1a-kommunregister`. |
| P3.1b – sökning i panelen | Lokalt på `feat/3-1b-kommunval-sokning`, från `174df1b`: namn-/kodsökning och val av träff i Välj område. Återanvänder befintligt kommunval; ej committat eller pushat. 75 runtime-tester, 6 browser-UI-tester, verkligt tangentbordsval och typkontroll/bygge passerade. Gabrielas manuella granskning återstår. |
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

För panelens separata offline-browserprov: öppna `/tests/municipality-search-ui.html` på samma dev-server. Sidan kör sex tester i riktig browser, inklusive att alla 290 koder kan visas och skickas till valcallbacken. Den kräver inget kart-api-anrop och ingår inte i produktionsbygget. `npm.cmd test` typkontrollerar även browser-testkoden men kör inte browserproven. Den 2 november 2026 passerade sidan i isolerad Edge tillsammans med separat styrning av verkliga Tab/Enter/Space-nedtryckningar. Ett begränsat liveprov i appen verifierade sökval och ritad gräns för Uppsala och Upplands Väsby; det är inte ett prov av alla kommunpolygoner eller ett nytt belägg för deras årgång.

Kommungränsen hämtas via kart-api och är förenklad för visning; gränsårgången är okänd. Ingen befolkningsstatistik eller analys utförs ännu. Slutkontrollerna för P2 den 2 november 2026 gav 65/65 godkända tester samt godkänd typkontroll och produktionsbygge; de upprepas inte för denna statusrättelse. Fullständig interaktiv browser- och mobilkontroll återstår. Kommunvalet är publicerat enligt den daterade statusen ovan. P2-kompletteringarna är pushade på P2-grenen och ingår i PR #14, men är ännu inte mergade eller publicerade.

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
