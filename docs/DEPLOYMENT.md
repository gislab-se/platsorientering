# Stegvis publicering

Gabriela ansvarar för genomförandet. Ingen version är publicerad och ingen publik URL är verifierad. Publicering sker i två steg: först en förhandsversion via Gabrielas GitHub-konto och senare slutpublicering på gislab.se.

## Aktuellt läge

| Del | Status |
| --- | --- |
| Källkodsrepo | Privat: `gislab-se/platsorientering` |
| Första publiceringskonto | `yakimovskagabriela-ctrl` |
| Publikt byggrepo | Skapat och tomt: `yakimovskagabriela-ctrl/platsorientering` |
| GitHub Pages-URL | Inte publicerad eller verifierad |
| Publiceringskälla | Godkända commits på privata `gislab-se/platsorientering`, grenen `main` |
| Automatik | GitHub Actions-workflow förberett; aktiveras först på privata `main` när nödvändig hemlighet finns |
| Senast verifierat produktionsbygge | Historiskt verifierat för P1; nytt releasebygge återstår |
| Slutmål | gislab.se; exakt URL och överföringsmetod är inte verifierade |

P1-grunden är sammanslagen till `main`. P2 pågår och har både pushade commits och lokala, ännu inte committade ändringar. Publiceringen utgår därför endast från en commit som har nått privata `main`, aldrig direkt från den lokala arbetsmappen eller en feature-gren.

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
