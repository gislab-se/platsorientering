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

## Arkitekturbeslut

### P1 – bakgrundskarta för lokal utveckling, 15 oktober 2026

- Leaflet visar OpenStreetMaps standardraster via `https://tile.openstreetmap.org/{z}/{x}/{y}.png` med synlig attribution. Kartbilder laddas för aktuell vy; ingen egen offlinecache eller masshämtning införs.
- Villkor lästa: https://operations.osmfoundation.org/policies/tiles/ . Tjänsten har ingen tillgänglighetsgaranti. Lämpligheten för publik drift ska bedömas före P8.
- Node.js 24.20.0 LTS och npm 11.19.0 är installerade. Exakta installerade versioner: Leaflet 1.9.4, TypeScript 7.0.2, Vite 8.3.4 och @types/leaflet 1.9.22. Låsfil finns. Ren installation med `npm ci`, typkontroll, bygge och serverstart har verifierats i en separat kopia av arbetsfilerna. Gabriela har bekräftat kartvisning, zoom, panorering, återställning och layout på dator och i simulerat mobilformat med smal skärm. Faktisk ny klon och test på fysisk mobil återstår.
- Musrullszoom är aktiverad för att underlätta utforskning på dator. Gabriela har bekräftat funktionen med musens scrollhjul. Kartan använder rullningen för zoom när pekaren är över kartan; sidrullningen påverkas där. Zoomknapparna finns kvar. Typkontroll och produktionsbygge passerade med inställningen aktiverad.
- Grundfilerna håller kartstarten separat från sidans uppstart. Vites relativa bas tillåter framtida publicering i underkatalog.
- Startvyns koordinater ligger i `src/config/mapConfig.ts` och läses av kartmodulen. De behåller Leaflets ordning [latitud, longitud] och är en visningsutbredning, inte en administrativ gräns. Flytten ändrar inte kartans startvy och inför inga nya beroenden.
- Gabriela identifierade [issue #1 – Skapa och förstå en körbar projektgrund](https://github.com/gislab-se/platsorientering/issues/1) manuellt på GitHub. AI:n har inte läst issue-innehållet; genomförandet kontrolleras mot P1 i ROADMAP.md. Ingen ändring på GitHub, commit, push, PR eller publicering är genomförd.

## Mall för nya arkitekturbeslut

Lägg till ett kort numrerat beslut när en fråga blir avgjord:

- Datum och status.
- Problem och observerade begränsningar.
- Vald lösning och varför.
- Alternativ som faktiskt övervägdes.
- Konsekvenser för användare, data, drift och tester.
- Länk till issue eller pull request.
