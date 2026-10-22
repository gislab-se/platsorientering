# Platsorientering Sverige

GISLABs webbapp för en första geografisk orientering av en okänd plats i Sverige. Målgruppen är kollegor på Lablab som vill välja ett område, förstå befolkningsfördelningen och få en begriplig överblick utan att behöva arbeta i ett GIS-program.

**Gabriela ansvarar för hela produktionen:** utveckling, datahantering, analys, tester, dokumentation, publicering och överlämning. Henrik är beställare och GIS-stöd och granskar resultat tillsammans med Gabriela.

## Status

Projektet startades 15 oktober 2026. P1-grunden finns: en svensk kartsida, TypeScript-konfiguration och CI för byggkontroller. Gabriela har bekräftat kartvisning, zoom, panorering, återställningsknappen och layouten på dator och i simulerat mobilformat med smal skärm. Musrullszoom fungerar. Ren installation, typkontroll, bygge och serverstart har kontrollerats i en separat kopia. Typkontroll och bygge passerar även med musrullszoom aktiverad. Installation från en faktisk ny klon, Gabrielas genomgång och CI-körning på GitHub återstår för P1. Test på fysisk mobil är ännu inte gjort. Ingen projektversion är publicerad.

Repot är privat. Slutmålet är en publik app på **gislab.se**. Exakt URL och hur GISLABs webbhotell tar emot filer behöver fastställas innan publicering.

## Första versionen

- Täcker Sverige och fungerar för olika platser utan kodändringar.
- Låter användaren söka plats, välja kommun eller rita ett eget område.
- Visar befolkning och befolkningstäthet för kommuner samt ett lager med befolkningsrutor.
- Ger en enkel och metodmässigt tydlig sammanställning för ett ritat område.
- Visar källa, referensår, enhet och begränsningar nära resultatet.
- Fungerar på dator och mobil och förklarar saknade data och tillfälliga API-fel.

Havsnivåanalys ingår i en senare etapp. Det första fungerande delmålet är mindre: välj en kommun och se befolkning och täthet med källa och år.

## Kom igång

P1 använder Node.js 24 (exakt version i `.nvmrc`) och npm. På Windows kan Node.js LTS installeras med `winget install --id OpenJS.NodeJS.LTS --exact`. Öppna en ny terminal efter installationen och kontrollera `node --version` och `npm.cmd --version`.

Följ [P1-guiden](docs/P1_STEG_FOR_STEG.md). P1 hör till [issue #1](https://github.com/gislab-se/platsorientering/issues/1), identifierad av Gabriela. Beroendena är låsta i `package-lock.json`. Efter kloning och byte till grenen med P1-filerna:

```powershell
npm.cmd ci
npm.cmd run dev
# I en separat terminal:
npm.cmd run typecheck
npm.cmd run build
```

`npm.cmd run dev` visar en lokal adress i terminalen. Öppna den i webbläsaren; stoppa servern med Ctrl+C. `npm.cmd run build` kör också typkontroll och skapar `dist/`. `npm.cmd run preview` visar byggresultatet lokalt. `npm.cmd` undviker att PowerShell försöker köra npm som ett blockerat PowerShell-skript.

Verifierat på Windows med Node.js 24.20.0 och npm 11.19.0: `npm ci`, typkontroll, produktionsbygge och serverstart i en separat ren kopia av arbetsfilerna, utan befintlig `node_modules`. Servern svarade med HTTP 200. Detta var inte en ny Git-klon, eftersom P1-filerna ännu inte är committade. Efter koordinatflytten passerade typkontroll och produktionsbygge även på den aktuella arbetsversionen. I Codex behövde Vites bygge och serverstart köras utanför sandlådan eftersom den blockerade underprocesser (`spawn EPERM`). Se P1-guiden för manuella testresultat och återstående kontroller.

```powershell
git clone https://github.com/gislab-se/platsorientering.git
cd platsorientering
git switch -c feat/1-projektgrund
```

Du behöver GitHub-behörighet till det privata repot. En eventuell inbjudan måste accepteras före kloning. Se [startguiden](docs/GETTING_STARTED.md) och börja med P1 i [arbetsplanen](ROADMAP.md).

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
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Plan för gislab.se, publicering och återställning |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Beslut, antaganden och öppna frågor |
| [docs/HANDOVER.md](docs/HANDOVER.md) | Mall för drift och överlämning |

## Teknik och tidigare arbete

Startförslaget är TypeScript, Vite och Leaflet med en statisk webbklient. API:er nås via egna adaptrar. Om data kräver hemliga nycklar eller saknar stöd för webbläsaranrop utvärderas en liten serverdel separat. Ingen infrastruktur behöver beställas för dokumentationsfasen.

Tidigare [DeSO- och befolkningskarta](https://github.com/yakimovskagabriela-ctrl/deso-karta) är referensmaterial. Kod och data återanvänds först efter kontroll av ursprung, metod och licens. Gabrielas [arbetsanteckningar i Drive](https://docs.google.com/document/d/1TzR5KzWUZ3Y8RgUgbUhuKB2iizMhvl8vjXnUid1qgpY/edit) ger praktikbakgrund och kan kräva separat åtkomst.

Ingen öppen källkodslicens är beslutad. Datakällornas respektive villkor gäller oberoende av repots synlighet.
