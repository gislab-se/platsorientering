# Publicering på gislab.se

Ansvarig för genomförandet: Gabriela. Henrik tillhandahåller tillgång till GISLABs webbmiljö och beslutar var tjänsten ska ligga. Ingen app är publicerad från detta repo ännu.

## Målmiljö att fastställa

| Uppgift | Status vid projektstart |
| --- | --- |
| Domän | gislab.se |
| Föreslagen sökväg | /platsorientering/ – förslag, inte etablerad URL |
| Webbhotell och rätt katalog | Inte verifierade |
| Överföring via SFTP, CI eller annat | Inte verifierad |
| Preview/testmiljö | Inte verifierad |
| Servermiljö vid eventuellt adapterbehov | Utreds i P2 |
| HTTPS och resurs-/API-policy | Verifieras på målmiljön |

Gabriela begär de konkreta driftsuppgifterna från Henrik när publiceringsarbetet behöver dem. Kontouppgifter och nycklar ska delas genom lämplig hemlighetshantering, inte skrivas i repo eller issues.

## Planerad releaseprocess

1. Välj en färdig, granskad commit på main och skapa en versionsetikett enligt projektets då införda rutin.
2. Installera med låsfil, kör typkontroll, relevanta tester och produktionsbygge. Exakta provade kommandon ska införas här i P1/P8.
3. Konfigurera Vites bas-URL för den bekräftade målplatsen. Byggresultatet ska kunna fungera under en underkatalog.
4. Publicera till testmiljö om den finns. Kontrollera huvudflödet, mobil, attribution, resursvägar och API-anrop från den riktiga domänen.
5. Spara föregående fungerande byggartefakt med commit/tagg och publicera den nya artefakten med webbhotellets verifierade metod.
6. Kontrollera produktions-URL, karta, platsval, ritning, resultat och felhantering. Skriv releaseanteckning med URL, commit och datum.

Publicera inte källkod, .git, .env-filer, privata dokument eller rådatacache till webbhotellets publika katalog. Endast de avsedda byggfilerna och eventuella separat beslutade serverkomponenter hör dit.

## Återställning

Behåll föregående fungerande artefakt och dess konfiguration. Vid misslyckad release återpubliceras den artefakten med samma verifierade överföringsmetod. Kontrollera därefter resurser och huvudflöde på produktions-URL:en och dokumentera orsaken.

Exakt destinationskatalog, verktygskommandon och återställningssteg fylls i när webbmiljön är känd. Hitta inte på SFTP-sökvägar, CI-hemligheter eller leverantörsspecifika kommandon.

## Efter publicering

Gabriela fyller i HANDOVER och dokumenterar hur källförändringar, API-fel och datastatistik uppdateras. En ny apprelease och en ny statistikårgång ska kunna identifieras var för sig.
