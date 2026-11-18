# Jurnal de modificări

[English](CHANGELOG.md) · **Română** · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Nelansat]

### Adăugat
- `scripts/check_licences.mjs --api URL`: alt punct de acces MediaWiki în locul Commons; testul CLI „fără rețea” folosește acum un port local închis, deci nu mai depinde de faptul că mașina are sau nu internet.

## [0.2.0] - 2026-11-17

### Adăugat
- Pagina: filele «Răsfoire», «Pachete», «Creare» și «Ghid» în opt limbi, cu o casetă roșie de siguranță mereu vizibilă, comenzi de la tastatură și suport pentru cititoare de ecran.
- Vizualizatorul: căutare în orice limbă (majusculele și diacriticele ignorate), filtre după grup și după marcajul de toxicitate, pagini de specii cu nume, marcaj și notă despre toxicitate, note, sursă, sosii (ca legături), fotografii și legături către sunete; «Nemarcată toxică» nu apare niciodată în verde și are mereu un avertisment.
- Pachete: import (lipit sau fișier, verificat integral înainte de a adăuga ceva), descărcare, ștergere și înlocuire după id; număr de specii pe grupe; insigne sincere de stare («Schelet», «Ciornă», «Verificat») cu ce înseamnă fiecare.
- Creatorul: formular de pachet, formular de specie cu nume în mai multe limbi, marcaj și note de toxicitate, sosii legate în ambele sensuri, editor JSON pentru fotografii și sunete, verificare, descărcare și o ciornă păstrată în browser (cu avertisment când browserul nu mai are loc).
- Formatul pachetelor: `schema.json` (o specie), `pack.schema.json` (un manifest), pachete asamblate în `data/dist/` (format `vietar-pack`, versiunea 1) și `data/dist/example.json` ca exemplu de format.
- Cinci pachete de pornire incluse, cu 71 de specii: România (19 plante și ciuperci, 17 păsări, 15 mamifere) și schelete pentru Bulgaria și Moldova (aceleași 10 specii fiecare); ciorne scrise cu un asistent IA și verificate doar în parte, fără fotografii și fără legături către sunete.
- `scripts/pack.mjs` (asamblare, `--check`, `--split`), `scripts/validate.py` (aceleași reguli ca pagina, pentru fiecare fișier și fiecare pachet asamblat), `scripts/optimize.py` (fotografii) și `scripts/check_licences.mjs` (licența și autorul fotografiilor; `--online` întreabă Wikimedia Commons).
- Ghiduri în engleză și română: `docs/pack-format.md`, `docs/school-class-guide.md`, `docs/contributor-guide.md` și `docs/review-guide.md`.
- `src/` și `scripts/build.mjs`: singurul `index.html` se construiește acum din surse, cu pachetele din `data/dist/` încorporate, iar `--check` îl verifică.
- Teste: `npm test` și teste de browser în hub.
- ISSUES_GOOD_FIRST și CODE_OF_CONDUCT traduse în toate cele opt limbi.
- README în engleză, română, franceză, italiană, spaniolă, portugheză, germană și maghiară: secțiuni de stare și de domeniu planificat (derivate din `ISSUES_GOOD_FIRST.md`).
- Instalabilă (PWA): `manifest.webmanifest`, `sw.js` și pictogramele sunt generate de kitul comun (`fff-kit/pwa`); pagina funcționează offline după prima vizită prin HTTPS.

### Modificat
- Fluxul de lucru rulează pe Ubuntu 26.04 și Node.js 26 și rulează verificarea pachetelor, validatorul, testele și verificarea construcției.
- Datele sunt acum un fișier pe specie și un manifest pe pachet (`data/species/`, `data/packs/`), asamblate în `data/dist/`; `data/species/example.json` este înlocuit de `data/dist/example.json`, iar `scripts/validate.py`, pașii din README și șabloanele s-au schimbat odată cu el.
- Lista „good first issues” cuprinde acum ce mai e de făcut (mai multe specii, revizuire de specialiști, fotografii, sunete, traduceri); specificația formatului, câmpul de sosii, optimizatorul de fotografii, verificatorul de licențe și ghidul pentru clase, pe care le enumera înainte, există.

## [0.1.0] - 2026-11-13

### Adăugat
- Schelet inițial: structură, schema de date sau primele exemple, ghiduri de contribuție în opt limbi.
