# Platsorientering Sverige

GISLABs webbapp för en första geografisk orientering av en plats i Sverige. Kollegor på LABLAB ska kunna välja en kommun, en region eller ett område sammansatt av flera kommuner eller regioner och få en begriplig överblick utan att arbeta i ett GIS-program.

Projektet har två lika viktiga mål: Gabriela ska lära sig bygga kartor och program med AI i Codex, och resultatet ska bli användbart för LABLAB. Gabriela deltar därför själv i utveckling, test och publicering. Henrik är beställare, handledare och GIS-stöd.

## Status

| Del | Status |
| --- | --- |
| P1 – projektgrund | Implementerad och sammanslagen till `main` genom PR #10. Kartan visar OpenStreetMap och har zoom, panorering och återställning. |
| P2 – datakällor och kontrakt | Pågår. Adaptrar, kontrakt, testfixturer och källunderlag är committade på `feat/3-kommunval-panel`; metadatafrågor återstår. |
| P3 – kommunval | Lokalt implementerat på `feat/3-kommunval-panel`: tre steg i vänsterpanelen, kommunval genom kartklick eller kommunkod och markerad kommunpolygon. Webbläsarkontroll återstår. |
| Senare funktioner | Befolkningslager och analys visas som planerade. Regioner, sammansatta och ritade områden är ännu inte implementerade. |
| Publicering | P1 är publicerad på [GitHub Pages](https://yakimovskagabriela-ctrl.github.io/platsorientering/) (HTTP 200, verifierat 30 oktober 2026). Uppdateringen med kommunval förbereds via pull request till privata `main`; se [releasekontroll](docs/DEPLOYMENT.md). |

Källkodsrepot är privat och ligger på `gislab-se/platsorientering`. En godkänd push till dess `main` ska automatiskt bygga appen och överföra endast `dist/` till det publika repot `yakimovskagabriela-ctrl/platsorientering`. GitHub Pages-adressen är verifierad för P1; den nya versionen kontrolleras separat efter publicering. Slutpublicering på **gislab.se** sker i projektets slutskede.

## Planerad första version

### Prova det lokala kommunvalet

Starta med `npm.cmd run dev`. Vänsterpanelen visar **1. Välj område**, **2. Välj data** och **3. Analys**. Klicka inom en svensk kommun: kommunens namn och kod visas och polygonen markeras grönt. Klicka på en annan kommun för att byta. Alternativt ange en fyrsiffrig kommunkod (exempelvis 0380, 1280 eller 2584) och välj med knappen eller Enter. Prova också snabba byten, en okänd kod och en punkt utanför Sverige. Ett äldre svar ska inte ersätta det senaste valet.

Kommungränsen hämtas via kart-api och är förenklad för visning; gränsårgången är okänd. Ingen befolkningsstatistik eller analys utförs ännu. Typkontroll, produktionsbygge och 65 tester passerade den 30 oktober 2026. Visuell kontroll, kartklick och mobilkontroll i webbläsare återstår; ändringen är inte publicerad.

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
