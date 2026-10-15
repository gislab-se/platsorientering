# Beslut och öppna frågor

## Beslutade ramar den 15 oktober 2026

| Beslut | Motiv |
| --- | --- |
| Sverige i version 1 | Beställarens uttryckliga avgränsning |
| Gabriela ansvarar för hela produktionen | Beställarens ansvarsfördelning; Henrik handleder och granskar |
| Separat privat repo under gislab-se | Tydlig projektgräns och gemensam GitHub-åtkomst |
| Publik app på gislab.se som slutmål | Beställarens publiceringsmål; repots synlighet ändras inte automatiskt |
| TypeScript, Vite och Leaflet som startarkitektur | Liten statisk klient som bygger på Gabrielas erfarenhet |
| API-adaptrar med egna datatyper | Isolerar leverantörsförändringar från kartan och analysen |
| Först kommunöversikt, sedan platsökning och rutanalys | Gör första resultatet litet och demonstrerbart |
| Havsnivåanalys efter version 1 | Kräver separat datakontroll och metodval |

Teknikvalen kan ändras av Gabriela när ett konkret behov visas. Dokumentera orsak och konsekvens innan större omtag.

## Öppna frågor och ansvar

| Fråga | Nästa steg | Ansvarig |
| --- | --- | --- |
| Slutliga API:er, villkor, CORS och nyckelbehov | P2, verifiera mot riktiga svar | Gabriela |
| Gemensam statistikårgång och gränsindelning | P2, kontrollera källmetadata | Gabriela |
| Ritbibliotek och geometrioperationer | P1/P5, välj underhållna verktyg med lämpliga licenser | Gabriela |
| Serveradapter behövs? | Beslut efter P2, före beroende implementation | Gabriela med Henrik |
| Exakt URL och åtkomst till webbhotell | Före P8 | Henrik tillhandahåller, Gabriela verifierar |
| Visuellt uttryck och eventuell GISLAB-profil | Före användartest i P7 | Gabriela med Henrik |
| Öppen källkodslicens för projektet | Beslut före eventuell publik källkod | Henrik |
| Förvaltning efter LIA-perioden | Fyll HANDOVER före avslut | Gabriela och Henrik |

## Mall för nya arkitekturbeslut

Lägg till ett kort numrerat beslut när en fråga blir avgjord:

- Datum och status.
- Problem och observerade begränsningar.
- Vald lösning och varför.
- Alternativ som faktiskt övervägdes.
- Konsekvenser för användare, data, drift och tester.
- Länk till issue eller pull request.
