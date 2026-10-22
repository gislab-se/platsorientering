# Syntetiska P2-fixturer

Alla värden, namn, identifierare, texter och koordinater är påhittade testdata. Filerna är skrivna för projektet och innehåller inga sparade verkliga API-svar, leverantörstexter eller hämtade geometrier. Leverantörsnamn, endpoint-/lageridentifierare och fältnamn anger enbart vilket kontrakt som undersöks. Syntetiska attributioner är teststrängar, inte verkliga licensuppgifter.

Underlag: fält och observationer i [DATA_SOURCES.md](../../docs/DATA_SOURCES.md), P2 i [ROADMAP.md](../../ROADMAP.md) samt [ARCHITECTURE.md](../../ARCHITECTURE.md). Sammanställt 22 oktober 2026. Detta är skapandedatum, inte hämtningsdatum. Inga data hämtades för fixturerna. Geocode kompletteras utifrån användarens redovisade OpenAPI-underlag för GeoTraff: obligatoriska fält `lat`, `lon`, `namn`, `tier`, `kalla`. OpenAPI-adressen kunde inte läsas vid kompletteringen; ingen ny oberoende schemaverifiering påstås.

## Format och användning

Varje JSON-fil är en **testbehållare**, inte ett leverantörssvar. `synthetic`, `description`, `endpoint`/`table`/`layer`, `cases`, `id`, `purpose`, `httpStatus`, `bodySubset`, `omittedFields`, `expectedResultsLength` och `limitation` är projektets testmetadata.

- `body` innehåller en syntetisk svarskropp med kända fält. Detta är inte en certifiering av fullständigt leverantörsschema.
- `bodySubset` är uttryckligen ett fältutdrag. Det får inte användas som komplett giltigt svar eller passera en framtida fullständig svarvalidator utan komplettering.
- `httpStatus` är ett simulerat testvillkor, inte en mätning. Inga CORS-headers simuleras; JSON-filer belägger inte browseråtkomst.
- Alla filer är syntaktiskt giltig JSON. Felaktiga fall bryter avsiktligt mot datakontrakt, inte JSON-syntax.
- Fixturerna är underlag för framtida adaptertester. De är inte kopplade till befintliga domäntester; inga adaptrar eller nätverksanrop införs. Råa källsvar är inte samma sak som projektets normaliserade interna kontrakt.

## Urval

| Fil | Fall och syfte |
| --- | --- |
| `kart-api-geocode.synthetic.json` | Begränsad lyckad sökning med ett påhittat träffobjekt och samtliga fem redovisade obligatoriska GeoTraff-fält, tomt efter kommunfilter, strukturerat 422-fel och felaktig resultattyp. Resultatlistans antal hålls åtskilt från spridningen. |
| `kart-api-lookup.synthetic.json` | Normalt uppslag, 404 utan träff och felaktig numerisk kommunkod. `0001` är en syntetisk kod för formatkontroll, inte en verklig kommun. |
| `scb-tab628.synthetic.json` | Minimalt JSON-stat2-dataset med de dokumenterade dimensionerna/måttkoderna samt ett ofullständigt och därmed felaktigt värdeutdrag. Testar noll, null och antal datapositioner. |
| `scb-wfs.synthetic.json` | Normal men begränsad sida med hel syntetisk ruta i EPSG:3006, tomt uttag och felaktigt objektutdrag. Serverns antal får inte likställas med hämtad fullständighet. |

## Begränsningar och öppna kontraktsfrågor

- Geocodes begränsade fall innehåller nu `results` med `lat`, `lon`, `namn`, `tier` och `kalla` enligt redovisat GeoTraff-underlag. `antal` och listlängd är båda 1 medan spridningen är större. Alla träffvärden är syntetiska. Fälttyper och eventuella värdemängder för `tier` och `kalla` framgår inte av kompletteringen; deras strängvärden är testantaganden, inte fastställda giltiga leverantörsvärden. Full schemaöverensstämmelse behöver kontrolleras innan fixturen används som positivt adaptertest. Koordinaterna belägger inte källans CRS.
- TAB628-exemplet är inte SCB:s fullständiga metadata, dimensionstexter eller ett verkligt uttag. Det syntetiska året 2000 påstår inte att tabellen erbjuder den årgången. Ingen normal tom TAB628-svarstruktur eller SCB-felkropp är belagd här; sådana svar har inte uppfunnits. Dimensionsbortfall är ogiltigt data, inte ett dokumenterat pagineringsprotokoll.
- WFS-exemplet använder GeoJSON-liknande källstruktur med uttryckligt EPSG:3006 enligt redovisningen. Det är **inte färdig GeoJSON/WGS84 vid webbgränsen** och får inte bara etiketteras om. Datum och rut-ID är syntetiska. Tillåtna ID-format och fullständiga fälttyper måste bekräftas före adapterimplementation.
- `null` är inte automatiskt noll eller sekretess. Ingen leverantörsspecifik sekretesskod är belagd och ingen sådan kod har hittats på. Skillnaden mellan noll, saknat och sekretess testas redan separat i domäntesterna.
- För att undvika dubbletter finns strukturerat 422-fel bara i geocode-filen. Lookup har sitt särskilda 404-fall. HTTP-/nätverksfel för SCB behöver framtida transporttester; någon påhittad officiell felstruktur har inte skapats.
- Rättigheter för verkliga svar, serverbehov, källa och CRS-uppgifter som är öppna i DATA_SOURCES/DECISIONS förblir öppna. Syntetiska fixturer verifierar varken leverantörsbeteende eller färdig P2-integration.

## Kontroll

JSON-syntax kan kontrolleras från reporoten utan nätverk eller filändringar:

```powershell
node --input-type=module -e "import {readdirSync,readFileSync} from 'node:fs'; for (const name of readdirSync('tests/fixtures').filter(n=>n.endsWith('.json'))) { JSON.parse(readFileSync('tests/fixtures/'+name,'utf8')); console.log(name); }"
git diff --check
```
