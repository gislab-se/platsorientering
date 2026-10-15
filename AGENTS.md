# Instruktioner för AI-agenter

Gäller hela detta repo. Läs README.md, PROJECT_BRIEF.md, ARCHITECTURE.md och den aktuella uppgiften innan du ändrar något. Närliggande dokumentation ska uppdateras om beteende eller beslut ändras.

## Människor och ansvar

- Gabriela studerar GIS på Ocellus och gör LIA på GISLAB. Hon ansvarar för hela produktionen, från planering och implementation till test, publicering och överlämning.
- Henrik Aldén är beställare, GIS-expert och handledare på GISLAB. Han hjälper till med krav, GIS-metod och granskning.
- AI är stöd i Gabrielas arbete. Förklara ändringar så att hon kan förstå, testa och själv förvalta dem. Skriv tydliga start- och kontrollsteg; undvik en stor ogenomskinlig implementation över flera etapper.

## Språk

- När Henrik skriver på svenska: svara på svenska.
- När Gabriela skriver på makedonska: svara på både makedonska och svenska, i tydligt åtskilda delar. Den svenska delen ska innehålla samma väsentliga information, beslut, resultat och frågor.
- Detta gäller även löpande uppdateringar och frågor.
- Projektdokumentation och gränssnitt skrivs på svenska. Kodidentifierare kan vara på engelska.

## Arbetssätt

1. Bedöm om uppgiften behöver förtydligas. Synliggör viktiga antaganden. Fråga bara när oklarheten påverkar resultatet; en tydlig uppgift ska genomföras direkt.
2. Arbeta mot en avgränsad GitHub-issue i en egen gren. Blanda inte olika etapper i samma pull request.
3. Håll implementationen enkel och modulerna begripliga. Inför nya bibliotek och tjänster bara när de löser ett konkret behov.
4. Kontrollera aktuella API-kontrakt i primärkällorna. Hitta inte på endpoints, kolumnnamn, licenser eller täckning. Dokumentera observerade svar och hämtningsdatum.
5. Kör kontroller som är relevanta för ändringen. Matematik, urval, gränsfall och datakontrakt behöver meningsfulla tester. Små textändringar behöver inte nya enhetstester.
6. Redovisa vad som ändrades, hur det kontrollerades och vad som återstår. Påstå inte att något fungerar, är testat eller är publicerat utan belägg.

## GIS och data

- Version 1 gäller Sverige. Platsnamn, kommunnummer och koordinater ska vara data, inte hårdkodad applikationslogik.
- Använd GeoJSON med WGS 84, longitud före latitud, vid webbgränsen. Beräkna inte ytor i kvadratgrader. Validera referenssystem före omprojektion; ett nytt CRS får inte bara etiketteras på okända koordinater.
- Kommunkoder är fyrsiffriga strängar, även med inledande nollor. Kontrollera årgångar och dubbletter före join.
- Saknat värde, sekretessmarkerat värde och noll är olika tillstånd. Summor från röjandeskyddad statistik kan avvika från publicerade totaler.
- Följ docs/ANALYSIS_METHODS.md. Kommunbefolkning får inte fördelas till ritade områden eller DeSO utifrån andel polygonarea.
- Hela befolkningsrutor som korsar en områdesgräns får inte beskrivas som exakt befolkning inom området.
- Källa, referenstid, enhet, metod och attribution ska följa med varje analysresultat.
- Återpublicera inte kart-api-data som en egen nedladdningsdatabas. Läs och följ respektive leverantörs villkor innan rådata distribueras.

## Drift och säker hantering

- Lägg aldrig token, API-nyckel, lösenord eller privata anslutningsuppgifter i Git, webbläsarkod, loggar eller exempel.
- Vite-variabler som skickas till klienten är publika. Hemliga nycklar hör hemma i en servermiljö.
- Dokumentera hämtningar och bearbetningar. Håll stora rådata, cache och byggresultat utanför Git.
- Publiceringsmålet är gislab.se. Repo- och dokumentationsarbete innebär inte att en app redan är klar att driftsätta. Följ beställarens aktuella publiceringsuppdrag och docs/DEPLOYMENT.md; inför inga extra generella godkännandesteg.
- Bevara andra personers lokala ändringar. Radera inte historik och använd inte force push på gemensamma grenar.
