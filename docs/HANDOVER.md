# Drift och överlämning

Detta är en mall som Gabriela fyller i under projektet och färdigställer i P8. Tomma fält betyder att uppgiften ännu inte är fastställd, inte att funktionen är verifierad.

## Leverans

- Slutlig produktions-URL på gislab.se: inte fastställd eller publicerad.
- GitHub-förhandsversion: https://yakimovskagabriela-ctrl.github.io/platsorientering/ – P4 och efterföljande UI-förbättringar från PR #17 är publicerade.
- Verifierad förhandsversion: källcommit `d7e63eb`, publik byggcommit `094e0773f6362987c32d9f0b89b3d36ddd7d6c0a`. Slutversion i P8 är inte fastställd.
- Kontroll: 7 november 2026, AI-assisterad GitHub-/HTTP-kontroll på Gabrielas uppdrag. Publicering via GitHub Actions; belägg och kontrollens begränsningar finns i [DEPLOYMENT](DEPLOYMENT.md#verifierad-publicering-av-p4-och-pr-17-7-november-2026).
- Produktionsansvarig under projektet: Gabriela.
- Beställare och kontakt efter överlämning: Henrik; förvaltningsupplägg fastställs före avslut.

## Installation och bygge

Fyll i Node-version, installationskommando, startkommando, kontroller, bygge och konfiguration. Beskriv hur en kollega kommer från en ny klon till en fungerande lokal app utan lokala specialfiler.

## Data och metod

Lista faktiskt använda källor, referenstider, indelningar och uppdateringsförfarande. Länka till DATA_SOURCES och ANALYSIS_METHODS och dokumentera hur nya årgångar valideras före publicering.

## Publicering och återställning

Fyll i både GitHub-förhandsversion och slutmiljö på gislab.se: artefakt, målplats, överföringsmetod, kontroll efter release och provad återställning. Beskriv var hemligheter hanteras utan att ange deras värden.

## Vanliga fel

Dokumentera hur man identifierar och hanterar API-avbrott, kvotfel, ändrade fält, bristande täckning och resursfel under underkatalog. Ange vad användaren ser och vad förvaltaren behöver kontrollera.

## Kända begränsningar och återstående arbete

Länka öppna issues. Beskriv statistikårgångar, gränsrutor, prestandagränser och eventuella ej stödda områden tydligt. Havsnivåanalys är inte del av ursprunglig version 1.

## Överlämningskontroll

- En kollega kan klona, installera, köra kontroller och bygga enligt dokumentationen.
- Produktionsflödet har demonstrerats på mobil och dator.
- Källor, attribution och metoder motsvarar implementationen.
- Nästa förvaltare har rätt åtkomst utan delade personliga lösenord.
- Återställning är provad eller en konkret kvarstående brist dokumenterad.
