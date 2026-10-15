# Projektbeskrivning

## Syfte och användare

En kollega på Lablab ska kunna undersöka en svensk plats som hen inte känner till och snabbt förstå var den ligger, hur området är avgränsat och hur befolkningen är fördelad. Appen ska stödja första orientering och fortsatt analys.

Exempel: användaren söker en plats i en tidigare okänd kommun, väljer rätt träff, ser kommunens folkmängd och befolkningstäthet, tänder befolkningsrutor och ritar ett eget studieområde. Resultatet förklarar vilken geografisk yta och vilken tidpunkt uppgifterna gäller.

## Ansvar

| Område | Ansvar |
| --- | --- |
| Hela produktionen och samordningen | Gabriela |
| Kod, dataflöden, GIS-analys och tester | Gabriela |
| Dokumentation, demo, publicering och driftunderlag | Gabriela |
| Krav, prioritering och tillgång till gislab.se | Henrik |
| GIS-stöd, granskning och återkoppling | Henrik tillsammans med Gabriela |

Gabriela driver varje etapp till ett demonstrerbart resultat. Henrik ska inte behöva färdigställa implementationen mellan etapperna.

## Omfattning för version 1

1. Sveriges kommuner kan väljas med namn eller kommunkod. Platsökning hanterar flera träffar utan att automatiskt välja fel ort.
2. Användaren kan rita, redigera och ta bort ett polygonområde. Ogiltig geometri får ett begripligt fel.
3. Befolkningsdata för kommuner visas med officiell landareal och täthet från en sammanhängande SCB-tabell/årgång när det är möjligt.
4. Befolkningsrutor kan hämtas för ett begränsat utsnitt i Sverige och visas med en förklarad färgskala.
5. Ett eget område ger en sammanställning av helt inkluderade rutor och separat redovisade gränsrutor. Resultatet påstår inte att gränsrutornas invånare bor inom polygonen.
6. Källa, år, metod, enheter och saknade data framgår. Ett geografiskt tomt resultat skiljs från ett misslyckat API-anrop.
7. Appen går att använda med tangentbord och på mobil. Kartval har textalternativ, och laddning/fel visas begripligt.
8. En reproducerbar byggversion kan publiceras på gislab.se och återställas till föregående version.

Sverigeomfattning betyder att samma arbetsflöde och datakällor kan användas på olika håll i landet. Det betyder inte att hela landets rutdata ska hämtas till webbläsaren på en gång.

## Senare etapper

Havsnivå, andra administrativa indelningar, markanvändning och exporter utvärderas efter första leveransen. Ett höjdvärde i en punkt räcker inte för att beräkna översvämmad yta. Havsnivåetappen behöver höjdmodell, höjdsystem, scenario, havskontakt och dokumenterad metod.

Inloggning, lagrade användarprojekt, egen databas och global täckning ingår inte i version 1.

## Leveranskontroll

Gabriela demonstrerar samma flöde i Uppsala, Malmö och Kiruna, samt med en ritad polygon. Därmed kontrolleras inland, kust och norra Sverige utan att testplatser blir fasta appinställningar. Henrik och minst en kollega på Lablab provar huvudflödet. Utfallet, återstående fel och releasebeslut dokumenteras i GitHub.
