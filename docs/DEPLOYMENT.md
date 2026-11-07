# Stegvis publicering

## Verifierad publicering av P4 och PR #17, 7 november 2026

P4 är sammanslaget till privata `main` genom [PR #16](https://github.com/gislab-se/platsorientering/pull/16), commit `50fe0e321006bc8f45a073dd80f46926fdea62b8`, den 6 november kl. 23:31 svensk tid. [Projektkontrollerna](https://github.com/gislab-se/platsorientering/actions/runs/42305308648) och [den automatiska publiceringen](https://github.com/gislab-se/platsorientering/actions/runs/42305308582) lyckades. Det äldre 403-felet är därmed inte ett aktuellt publiceringshinder för denna leverans.

Efterföljande [PR #17](https://github.com/gislab-se/platsorientering/pull/17) med förenklad panel, källpresentation och direktval vid en enda kommunträff är sammanslaget i `d7e63ebaa385f2a523da289288116a670d6275d6`. Även dess [projektkontroller](https://github.com/gislab-se/platsorientering/actions/runs/42321515767) och [automatiska publicering](https://github.com/gislab-se/platsorientering/actions/runs/42321515766) lyckades. Den publika byggcommitten är `094e0773f6362987c32d9f0b89b3d36ddd7d6c0a`, med meddelandet `Publicera d7e63ebaa385f2a523da289288116a670d6275d6`.

Nuvarande adress är https://yakimovskagabriela-ctrl.github.io/platsorientering/ . Den 7 november gav sidan och dess refererade `assets/index-BTZtgWyR.js` och `assets/index-B3QUwAtg.css` HTTP 200. JavaScript innehöll kommunstatistik och TAB628-referens. Detta är en HTTP-/resurskontroll tillsammans med GitHub-belägg för publicering, inte ett nytt interaktivt browserprov, en bytejämförelse mot lokalt bygge eller en ny verifiering av SCB-anrop i produktion. Äldre browserprov nedan gäller den dåvarande förhandsversionen. Gränsårgång och geografisk kompatibilitet förblir obekräftade.

Publicering sker med befintligt workflow från privata `main`, med bas-URL `/platsorientering/` och endast den kontrollerade `dist/`-artefakten till det publika byggrepot. Ingen publicering eller ändring av workflow görs genom denna dokumentationsuppdatering. Issue #4 var öppet vid GitHub-kontrollen och stängs inte här.

## P4-förhandsversion för Henrik, 6 november 2026

Historiskt underlag: detta var den separata förhandsversionen före merge av PR #16. `/p4/` är inte den nuvarande huvudadressen; dess fortsatta tillgänglighet har inte kontrollerats den 7 november. Den ordinarie publiceringen speglar `dist/` med borttagning av äldre filer, så den tidigare underkatalogen bevaras inte av det ordinarie workflowet.

På Gabrielas uttryckliga uppdrag publicerades en separat offentlig förhandsversion från den pushade P4-committen `9cfc0db804f03e9c9702be2cdcaf7d571f3ab856`, utan merge av PR #16. Detta är ett avgränsat undantag från den ordinarie regeln om publicering endast från privata `main`; den ordinarie automatiken ändras inte. Issue #4 förblir öppet. Gränsårgång/geografisk kompatibilitet är fortfarande obekräftad. Demonstrationen är genomförd och Henrik har godkänt Kommunöversikt enligt Gabrielas bekräftelse.

Bygg med `npm.cmd run build -- --base=/platsorientering/p4/`. Endast kontrollerade filer från `dist/` samt `.nojekyll` publiceras under `p4/` i `yakimovskagabriela-ctrl/platsorientering` på dess `main`. Befintliga rotfiler bevaras. Privat källkod, dokumentation, testfixturer, rådata och credentials publiceras inte. Föregående publika commit är `5c6275ed081f49db6d45a5e1836756fe16aa123e` och sparas som återställningsreferens. Publiceringen görs genom en vanlig ny commit utan force; en senare återställning ska också bevara historiken.

Verifierad adress: https://yakimovskagabriela-ctrl.github.io/platsorientering/p4/ . Publik byggcommit: `fa53a92b273a3fa246aeaeb4aa2f8c68de7db810`. HTTP 200 samt identiskt HTML och identiska SHA-256 för JS/CSS mot lokalt kontrollerad `dist/` verifierades den 6 november 2026. Ett verkligt browserprov i isolerad Edge `156.0.4314.50` på den publika sidan verifierade namn-/kodsökning, gränsval och kommunstatistik för Uppsala `0380` och därefter Malmö `1280`, med SCB-källänk och referenstider. En emulerad mobilbredd på 390 px gav dokumentbredd 390 px utan horisontell överströmning. Fysisk mobil, alla kommuner och alla felvägar är inte verifierade genom detta avgränsade prov. Tidigare rotversion bevarades.

Gabriela ansvarar för genomförandet. GitHub-förhandsversionen innehåller nu P4 och PR #17 enligt kontrollen ovan. Slutpublicering på gislab.se är en senare etapp.

## Aktuellt läge

| Del | Status |
| --- | --- |
| Källkodsrepo | Privat: `gislab-se/platsorientering` |
| Första publiceringskonto | `yakimovskagabriela-ctrl` |
| Publikt byggrepo | `yakimovskagabriela-ctrl/platsorientering`, byggartefakt från `d7e63eb` med P4 och PR #17 |
| GitHub Pages-URL | https://yakimovskagabriela-ctrl.github.io/platsorientering/ – HTTP-/resurskontrollerad 7 november 2026 |
| Publiceringskälla | Godkända commits på privata `gislab-se/platsorientering`, grenen `main` |
| Automatik | Lyckade körningar för P4 och PR #17. Endast kontrollerad `dist/` speglas från privata `main`; hemligheters värden har inte lästs eller visats. |
| Senast verifierat produktionsbygge | GitHub-workflow för `d7e63eb` lyckades; innehåller typkontroll och bygge med `/platsorientering/`. Ingen ny lokal test-/byggkörning för dokumentationsändringen. |
| Slutmål | gislab.se; exakt URL och överföringsmetod är inte verifierade |

P1–P4 och PR #17 är sammanslagna till `main`. Det ordinarie workflowet publicerar från privata `main`, inte från den lokala arbetsmappen eller en feature-gren. Den separata P4-förhandsversionen ovan var ett tidigare dokumenterat undantag.

## Steg 1 – förhandsversion via GitHub

Målet är en liten, reproducerbar förhandsversion i `yakimovskagabriela-ctrl/platsorientering`. När ett godkänt arbete pushas eller mergas till privata `main` ska GitHub Actions:

1. checka ut exakt den commit som finns på `main`;
2. installera från låsfil och köra typkontroll samt produktionsbygge med bas-URL `/platsorientering/`;
3. stoppa publiceringen om `dist/` saknar `index.html`, innehåller symboliska länkar eller kända privata käll-/arbetsfiler;
4. lägga till Pages-markören `.nojekyll` i `dist/` och spegla endast denna artefakt till det publika byggrepot i en vanlig commit utan force push;
5. låta GitHub Pages publicera från det publika repots `main` och rotkatalog;
6. verifiera den verkliga URL:en på dator och mobil efter första publiceringen.

Det privata repots vanliga `GITHUB_TOKEN` kan inte skriva till ett annat repo. En fine-grained personal access token ska därför begränsas till `yakimovskagabriela-ctrl/platsorientering` med `Contents: Read and write` och sparas som repository secret `PAGES_DEPLOY_TOKEN` i det privata repot. Token får aldrig skrivas i kod, dokumentation eller loggar. Om Gabriela saknar rättighet att skapa hemligheten behöver Henrik eller en repo-administratör lägga in den. GitHub Pages ska konfigureras från `main` och `/ (root)` efter att första publiceringscommiten har skapats.

Varje senare push till privata `main` kör samma byggning och publicering automatiskt när bygget lyckas. Feature-grenar och lokala arbetsfiler publiceras inte. Den verifierade huvudadressen anges ovan; nya versioner kontrolleras efter publicering.

## Steg 2 – slutpublicering på gislab.se

Henrik tillhandahåller tillgång och beslutar var tjänsten ska ligga. Följande återstår att fastställa:

| Uppgift | Status |
| --- | --- |
| Exakt domän eller sökväg | `/platsorientering/` är bara ett förslag |
| Webbhotell och destinationskatalog | Inte verifierade |
| Överföring via SFTP, CI eller annat | Inte verifierad |
| Testmiljö | Inte verifierad |
| HTTPS och resurs-/API-policy | Verifieras i målmiljön |
| Servermiljö vid eventuellt adapterbehov | Avgörs först när ett verifierat behov finns |

Slutreleasen ska byggas från en granskad commit eller tagg. Kontrollera huvudflöde, mobil, attribution, resursvägar och riktiga dataanrop från den verkliga domänen. Dokumentera URL, commit, datum och kända begränsningar.

## Säker hantering och återställning

Publicera inte `.git`, `.env`, privata dokument, rådatacache eller hemligheter. Kart-api-data får inte göras till en egen nedladdningsdatabas. Rättigheter och attribution i DATA_SOURCES gäller även för en publik förhandsversion.

Spara identiteten på föregående fungerande artefakt. Vid fel återpubliceras den artefakten med samma verifierade metod. Kontrollera därefter resurser och huvudflöde och dokumentera orsaken. HANDOVER fylls med verkliga kommandon och adresser först när de har provats.

## Releasekontroll 30 oktober 2026

Användaren har beställt publicering av panelens tre steg och kommunvalet. Release via pull request till privata `main` och befintligt dist-workflow. Föregående offentliga P1-version svarar HTTP 200 men saknar `area-heading` och `analysis-heading`. Efter releasen kontrolleras dessa markörer samt HTTP-status och innehåll för samtliga refererade JS/CSS-resurser under `/platsorientering/`. Interaktiv webbläsarkontroll och fysisk mobil är ännu inte verifierade. Endast byggartefakten får föras till det publika repot; inga kart-api-råsvar eller privata dokument.
