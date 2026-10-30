# Stegvis publicering

Gabriela ansvarar för genomförandet. P1 finns på den verifierade adressen https://yakimovskagabriela-ctrl.github.io/platsorientering/ (HTTP 200, kontrollerat 30 oktober 2026). Kommunvalet och panelens tre steg är nu publicerade på samma adress på användarens uppdrag och HTTP-/resurskontrollerade. Publicering sker i två steg: först en förhandsversion via Gabrielas GitHub-konto och senare slutpublicering på gislab.se.

## Aktuellt läge

| Del | Status |
| --- | --- |
| Källkodsrepo | Privat: `gislab-se/platsorientering` |
| Första publiceringskonto | `yakimovskagabriela-ctrl` |
| Publikt byggrepo | `yakimovskagabriela-ctrl/platsorientering`, innehåller den publicerade P1-versionen |
| GitHub Pages-URL | https://yakimovskagabriela-ctrl.github.io/platsorientering/ – kommunval och tre panelsteg verifierade 30 oktober 2026 |
| Publiceringskälla | Godkända commits på privata `gislab-se/platsorientering`, grenen `main` |
| Automatik | Workflow finns på privata `main`, men push till byggrepot nekades med HTTP 403. `PAGES_DEPLOY_TOKEN` finns men dess skrivbehörighet behöver rättas; värdet har inte lästs eller visats. |
| Senast verifierat produktionsbygge | 30 oktober 2026: typkontroll, bygge med `/platsorientering/` och 65 tester passerar |
| Slutmål | gislab.se; exakt URL och överföringsmetod är inte verifierade |

P1-grunden är sammanslagen till `main`. Kommunval och dess P2-beroenden är committade och pushade på `feat/3-kommunval-panel`. Publiceringsuppdraget gäller denna förhandsversion; P2:s öppna metadatafrågor och P3:s återstående namnval kvarstår. Publiceringen utgår därför endast från en commit som har nått privata `main`, aldrig direkt från den lokala arbetsmappen eller en feature-gren.

## Steg 1 – förhandsversion via GitHub

Målet är en liten, reproducerbar förhandsversion i `yakimovskagabriela-ctrl/platsorientering`. När ett godkänt arbete pushas eller mergas till privata `main` ska GitHub Actions:

1. checka ut exakt den commit som finns på `main`;
2. installera från låsfil och köra typkontroll samt produktionsbygge med bas-URL `/platsorientering/`;
3. stoppa publiceringen om `dist/` saknar `index.html`, innehåller symboliska länkar eller kända privata käll-/arbetsfiler;
4. lägga till Pages-markören `.nojekyll` i `dist/` och spegla endast denna artefakt till det publika byggrepot i en vanlig commit utan force push;
5. låta GitHub Pages publicera från det publika repots `main` och rotkatalog;
6. verifiera den verkliga URL:en på dator och mobil efter första publiceringen.

Det privata repots vanliga `GITHUB_TOKEN` kan inte skriva till ett annat repo. En fine-grained personal access token ska därför begränsas till `yakimovskagabriela-ctrl/platsorientering` med `Contents: Read and write` och sparas som repository secret `PAGES_DEPLOY_TOKEN` i det privata repot. Token får aldrig skrivas i kod, dokumentation eller loggar. Om Gabriela saknar rättighet att skapa hemligheten behöver Henrik eller en repo-administratör lägga in den. GitHub Pages ska konfigureras från `main` och `/ (root)` efter att första publiceringscommiten har skapats.

Varje senare push till privata `main` kör samma byggning och publicering automatiskt när bygget lyckas. Feature-grenar och lokala P2-filer publiceras inte. Den föreslagna adressen `https://yakimovskagabriela-ctrl.github.io/platsorientering/` får inte beskrivas som fungerande förrän den har kontrollerats.

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

## Verifierat publiceringsresultat, 30 oktober 2026

- Privat release: `94a237dd88eba1d3f76c9d55d42b9c85e14d14cb`, squash merge av PR #12.
- Publik artefaktcommit: `8be8a30c48237533942a47d282a7d315a7df2ce7`. Föregående publika commit: `890ac9fdef84c58396de0dfe5021aefaeb8271f4`. Ingen historik har skrivits om.
- Privat Actions-körning `41046287107` byggde och kontrollerade artefakten, men push nekades med 403. Reservpublicering utfördes med befintlig Git-inloggning från lokalt Pages-bygge vars källträd verifierades identiskt med privata `main` genom `git diff --exit-code HEAD origin/main`.
- Endast `dist/` och `.nojekyll` ersatte det publika repots aktuella innehåll. Tidigare källkod och dokument fanns i byggrepot och ingår inte längre i dess senaste träd; äldre historik finns kvar. Ingen rådata hämtades eller lades till.
- Pages ändrades från workflow-bygge till publicering från `main` och `/` enligt projektets avsedda upplägg. Pages byggde artefaktcommiten.
- Publik URL gav HTTP 200 och innehöll `area-heading`, `data-heading` och `analysis-heading`. JS och CSS under `/platsorientering/assets/` gav HTTP 200 med rätt innehållstyper och SHA-256 identiskt med releasefilerna.
- Visuellt kartflöde och fysisk mobil har inte kontrollerats i webbläsare. Namnval, befolkningslager, analys och visning av alla kommungränser är inte införda.

### Kvar för automatisk överföring

Rätta `PAGES_DEPLOY_TOKEN` så att tokenägaren har skrivåtkomst till `yakimovskagabriela-ctrl/platsorientering` och token är begränsad till det repot med `Contents: Read and write`. Kontrollera därefter en ny Actions-körning. Inga breda lokala Git-inloggningsuppgifter har kopierats till Actions. Reservpubliceringen är ett dokumenterat undantag för detta användarbeställda släpp, inte ett belägg för fungerande automatik.
