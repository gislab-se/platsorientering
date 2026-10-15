# Platsorientering Sverige

GISLABs webbapp för en första geografisk orientering av en okänd plats i Sverige. Målgruppen är kollegor på Lablab som vill välja ett område, förstå befolkningsfördelningen och få en begriplig överblick utan att behöva arbeta i ett GIS-program.

**Gabriela ansvarar för hela produktionen:** utveckling, datahantering, analys, tester, dokumentation, publicering och överlämning. Henrik är beställare och GIS-stöd och granskar resultat tillsammans med Gabriela.

## Status

Projektet startades 15 oktober 2026. Repot innehåller projektunderlag, arbetsflöde och uppgifter. Det finns ännu ingen körbar app eller publicerad projektversion. Arkitekturen nedan är utgångspunkt för Gabrielas implementation.

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
