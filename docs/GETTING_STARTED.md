# Startguide för Gabriela

Du ansvarar för hela projektets produktion. Börja med en liten fungerande del och bygg vidare efter varje demo. Henrik hjälper dig med krav, GIS-frågor och granskning.

## Första arbetspasset

1. Logga in på ditt GitHub-konto och acceptera inbjudan till repot om den visas. Repot är privat.
2. Klona `https://github.com/gislab-se/platsorientering.git` till en egen lokal mapp och öppna den i VS Code.
3. Läs README, PROJECT_BRIEF, AGENTS, ARCHITECTURE och P1 i ROADMAP.
4. Öppna GitHub-issuen för P1 och kontrollera dess acceptanskriterier.
5. Skapa en gren, exempelvis `feat/1-projektgrund`. Bygg projektgrunden där.
6. Kontrollera installation från en ny klon, typkontroll och produktionsbygge. Skriv kommandona i README när de finns och har provats.
7. Öppna en pull request och visa resultatet för Henrik.

Det finns inga `npm install`- eller startkommandon att köra i den ursprungliga dokumentationsversionen, eftersom package.json och appen skapas i P1.

## Arbeta med AI

Ge AI:n en tydlig uppgift med aktuellt issue-nummer och be den läsa AGENTS.md. Be om förklaringar till kod och metod du inte förstår. Testa resultatet själv och fråga varför vid oväntade utfall.

Exempel på första uppdrag:

> Läs AGENTS.md och uppgiften P1. Hjälp mig skapa en minimal TypeScript-, Vite- och Leaflet-app. Genomför bara P1, förklara hur filerna hänger ihop och visa hur jag själv kontrollerar installation, typkontroll och bygge. Uppdatera README med provade kommandon.

Om du skriver på makedonska ska AI:n svara på makedonska och svenska enligt AGENTS.md, så att Henrik också kan följa arbetet.

## När du fastnar

Beskriv vad du försökte göra, vad du förväntade dig, vad som faktiskt hände och exakt felmeddelande. Skriv det i aktuell issue. Lägg aldrig in token, lösenord eller andra hemligheter i felrapporter.

## Nästa arbetsdag

Kontrollera `git status` innan du byter gren. Spara färdiga egna ändringar i rätt gren. Uppdatera `main` med `git pull --ff-only` före en ny uppgift. En ny arbetsmapp och en ny gren löser olika behov; skapa inte nya repon för varje etapp.
