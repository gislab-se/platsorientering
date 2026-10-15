# Datakällor och API-utvärdering

Kontrollerat mot leverantörernas dokumentation 15 oktober 2026. Endpoints och tjänster är kandidater tills Gabriela har verifierat dem i P2. Inga liveintegrationer är byggda eller kontraktstestade i detta repo.

## kart-api

[Dokumentation](https://kart-api.se/docs/) beskriver svensk platsökning, kommunuppslag och befolkningsrutor. Det gör tjänsten relevant att utvärdera för platsval och områdesbaserad hämtning.

[Villkoren](https://kart-api.se/villkor/) beskriver en betatjänst utan garanterad servicenivå. Visning och rimlig cache tillåts med attribution; vidare distribution som egen databas/bulknedladdning tillåts inte. Ett användbart API är därför inte automatiskt en källa för incheckade datafiler.

Gabriela ska verifiera aktuella kvoter, browseråtkomst, fullständig rutleverans för ett utsnitt, referensår, fältnamn, CRS och hur attribution följer med svaret. Dokumentera OpenAPI-version eller hämtningstid innan adapter skrivs. Basera inte havsnivåanalys på höjdvärden från enstaka punktfrågor.

## SCB: kommunstatistik

[Befolkningstäthet, folkmängd och landareal](https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__BE__BE0101__BE0101C/BefArealTathetKon/) samlar relevanta kommunmått. Referenstiderna för befolkning och landareal behöver läsas tillsammans; använd tabellens definition av täthet och dess redovisade avrundning.

Välj en gemensam publicerad årgång. Koppla med kommunkod som text och kontrollera gränsindelningen. P2 fastställer den aktuella API-versionen och ett reproducerbart uttag; inget gissat PxWeb-anrop ska checkas in som fungerande integration.

## SCB: befolkningsrutor

[Statistik på rutor](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/) beskriver befolkningsdata på kilometerrutor samt åtkomst via geodatatjänster och nedladdningar. Data finns i olika referenssystem och med röjandeskydd som behöver beaktas.

Utred direkt SCB-åtkomst som alternativ om kart-api inte uppfyller behovet. Kontrollera lagernamn, årgång, CRS, filter, paginering och distributionsvillkor i den faktiska tjänsten. Välj samma datavariant i hämtning, test och analys.

## Kommungränser och bakgrundskarta

Välj en dokumenterad gränskälla med rätt årgång och lämplig förenkling. En kommunpolygon härledd genom dissolve från DeSO ska redovisas som härledd geometri med ursprung, bearbetning och datum. Tidigare projektdata är referensmaterial, inte automatiskt fastställd produktionskälla.

Bakgrundskarta väljs separat med kontroll av visningsvillkor, attribution och användningsvolym. Ett öppet kartbibliotek ger inte obegränsad rätt att använda någon annans kartserver.

## Källregister som fylls i i P2

Skapa en rad för varje faktiskt vald källa. Okänt ska stå som okänt tills det är utrett.

| Fält | Vad som ska dokumenteras |
| --- | --- |
| Källa och åtkomst | Leverantör, dokumentationslänk, exakt endpoint och metod |
| Uttag | Parametrar, områdesfilter, paginering och hämtningsdatum |
| Täckning | Sverigeomfattning, luckor och storleksgränser |
| Tid | Statistikens referenstid och geometriernas årgång |
| Rum | CRS, axelordning, upplösning och geografisk referens |
| Värden | Enheter, saknade/sekretessmarkerade värden och röjandeskydd |
| Drift | CORS, nyckelbehov, kvoter, cache och felkoder |
| Rättigheter | Licens, attribution, lagring och återdistribution |
| Kontroll | Ett provsvar och hur det jämförts med källan |

Förvara inga hemliga nycklar i detta register. Små testfiler får bara innehålla data som får distribueras i repot. Syntetiska geometrier är lämpliga för gränsfall men måste märkas som testdata.
