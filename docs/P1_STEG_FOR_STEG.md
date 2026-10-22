# P1 – steg för steg

Målet är att förstå och kunna köra en liten kartsida. Kommunval, statistik och ritverktyg kommer senare.

## 1. Verktyg och arbetsgren

Projektet är klonat till `C:\LIA2-GISLAB-praktik\platsorientering`. Arbetsgrenen heter `feat/1-projektgrund`. Uppgiften är [issue #1 – Skapa och förstå en körbar projektgrund](https://github.com/gislab-se/platsorientering/issues/1), identifierad av Gabriela på GitHub. Issue-innehållet har inte lästs av AI:n; kontrollen utgår från P1 i ROADMAP.md.

Node.js kör utvecklingsverktygen och npm installerar biblioteken. Node.js 24.20.0 och npm 11.19.0 är installerade och kontrollerade.

Öppna en ny PowerShell-terminal efter installationen:

```powershell
cd C:\LIA2-GISLAB-praktik\platsorientering
node --version
npm.cmd --version
git branch --show-current
```

## 2. Förstå filerna

| Fil | Uppgift |
| --- | --- |
| `index.html` | Sidans rubriker, kartbehållare och knapp. |
| `src/main.ts` | Startar kartan och kopplar knappen till kartvyn. |
| `src/map/createMap.ts` | Skapar Leaflet-kartan och bakgrundslagret. |
| `src/config/mapConfig.ts` | Innehåller Sveriges startvy som koordinatdata, separat från kartlogiken. |
| `src/style.css` | Utseende, mobilanpassning och synligt tangentbordsfokus. |
| `package.json` | Projektets kommandon och exakta biblioteksversioner. |
| `package-lock.json` | Låser även bibliotekens beroenden för reproducerbar installation. |
| `tsconfig.json` | Regler för TypeScripts typkontroll. |
| `vite.config.ts` | Vites inställningar för utveckling och bygge. |
| `.github/workflows/ci.yml` | Installerar och bygger projektet vid en pull request. |

Webbläsaren läser HTML-filen. Den laddar `main.ts` via Vite. TypeScript-koden startar Leaflet, som hämtar kartbilder. CSS ger både kartan och sidan deras utseende.

## 3. Installera beroenden

Biblioteken är redan installerade i denna arbetsmapp. I en ny klon med P1-filerna kör du:

```powershell
npm.cmd ci
```

Projektet använder Leaflet 1.9.4, TypeScript 7.0.2, Vite 8.3.4 och Leaflet-typer 1.9.22. Versionerna är registrerade i `package.json` och låsta i `package-lock.json`. `npm.cmd ci` installerar från låsfilen och används även av CI. Kör inte nya installationer av senaste versioner vid varje start.

## 4. Starta och titta

```powershell
npm.cmd run dev
```

Öppna adressen terminalen visar. Terminalen behöver vara igång medan du arbetar. Stoppa med Ctrl+C.

Kontrollera att Sverige visas, att zoom och knappen ”Visa Sverige” fungerar och att källhänvisningen syns. Prova en smal webbläsarvy och navigera med Tab. Kartbilder kräver internet. Kontrollera också med internet avstängt att felmeddelandet är begripligt.

Musrullszoom är aktiverad med `scrollWheelZoom: true` för att göra det enkelt att utforska kartan på dator utan att behöva klicka på zoomknapparna. När pekaren är över kartan används musrullen för zoom i stället för sidrullning. Zoomknapparna finns också kvar.

## 5. Kontrollera koden och bygg

I en andra terminal i projektmappen:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run preview
```

Typkontrollen hittar typfel. Bygget skapar webbplatsfiler i `dist/`. Preview visar byggresultatet lokalt; det publicerar inget.

## 6. Visa resultatet för Henrik

Jämför resultatet med acceptanskriterierna i issue #1 före commit och pull request. Dokumentera vilka kontroller som faktiskt passerade. En ny klon ska kunna installeras med `npm.cmd ci` och byggas enligt README.

Verifierat 15 oktober 2026:

- Gabriela har testat webbappen manuellt på dator och i ett simulerat mobilformat med smal skärm. Kartan visas korrekt, zoomning och panorering fungerar, knappen ”Visa Sverige” återställer kartan och layouten fungerar på smal skärm.
- Gabriela har också bekräftat att `scrollWheelZoom: true` fungerar med musens scrollhjul. Testet i simulerat mobilformat verifierar layouten; användning på fysisk mobil och pekgester är ännu inte verifierade.
- En separat ren kopia av arbetsfilerna utan befintlig `node_modules` kunde installeras med `npm ci`, typkontrolleras, byggas och startas med `npm run dev`. Servern svarade med HTTP 200. Detta var inte en faktisk ny Git-klon; ändringarna är ännu inte committade.
- Den tidigare beroendeinstallationen med `npm install` rapporterade inga kända sårbarheter. Ingen ny säkerhetsgranskning ingick i kontrollen av den rena kopian.
- Vite behövde köras utanför Codex-sandlådan på grund av blockerade underprocesser (`spawn EPERM`).
- Efter flytten av startkoordinaterna till konfigurationen kördes `npm.cmd run typecheck` och `npm.cmd run build` igen på den aktuella arbetsversionen. Båda passerade. Produktionsbygget inkluderar den nya konfigurationsmodulen.
- Typkontroll och produktionsbygge passerade även efter ändringen till `scrollWheelZoom: true`.

### Avstämning mot P1 i ROADMAP.md

| Acceptanskriterium | Verifierat och återstående |
| --- | --- |
| Ny klon kan installeras och startas med dokumenterade kommandon. | Installation och start är verifierade i en ren kopia. En faktisk ny klon återstår efter commit. |
| Karta visas och anpassas till skärmstorleken. | Gabriela har bekräftat kartvisning och fungerande layout på dator och i simulerat mobilformat med smal skärm. |
| Typkontroll och produktionsbygge passerar. | Båda passerar, även med musrullszoom aktiverad. |
| Node-version och låsfil finns; Gabriela kan förklara delarna. | `.nvmrc` och `package-lock.json` finns. Sambandet mellan HTML, TypeScript, CSS och Leaflet beskrivs ovan; Gabrielas egen genomgång återstår. |
| CI kör typkontroll och bygge vid pull requests. | Arbetsflödet finns och `npm run build` inkluderar typkontroll. En körning på GitHub återstår när en pull request har godkänts för skapande. |

P1 är inte helt verifierad förrän återstående delar i tabellen är kontrollerade. Kompletterande kontroller av fysisk mobil/pekgester, tangentbord och nätverksfel återstår också; dessa är inte separata acceptanskriterier i P1. Ingen pull request har skapats.

Startkoordinaterna ligger i `src/config/mapConfig.ts` och importeras av `src/map/createMap.ts`. Ingen commit, push eller PR har gjorts. Inga GitHub-uppgifter eller åtkomsttoken behöver hanteras för den manuellt identifierade issue-hänvisningen.
