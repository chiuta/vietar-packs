# Változásnapló

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · **Magyar**

Formátum: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Kiadatlan]

## [0.2.0] - 2026-11-17

### Hozzáadva
- Az oldal: a „Böngészés”, „Csomagok”, „Készítés” és „Útmutató” lap nyolc nyelven, mindig látható piros biztonsági kerettel, billentyűparancsokkal és képernyőolvasó-támogatással.
- A megjelenítő: keresés bármely nyelven (a kis- és nagybetű és az ékezetek figyelmen kívül hagyva), szűrés csoportra és mérgezőségi jelzésre, fajoldalak nevekkel, mérgezőségi jelzéssel és megjegyzéssel, megjegyzésekkel, forrással, hasonmásokkal (hivatkozásként), fényképekkel és hanghivatkozásokkal; a „Nincs mérgezőnek jelölve” soha nem jelenik meg zölden, és mindig figyelmeztetés kíséri.
- Csomagok: importálás (beillesztve vagy fájlból, teljes egészében ellenőrizve, mielőtt bármi hozzáadódna), letöltés, törlés és csere azonosító szerint; fajszám csoportonként; őszinte állapotjelvények („Váz”, „Vázlat”, „Átnézett”) a jelentésükkel.
- A készítő: csomagűrlap, fajűrlap több nyelvű nevekkel, mérgezőségi jelzéssel és megjegyzésekkel, mindkét irányban összekötött hasonmásokkal, JSON-szerkesztő a fényképekhez és hangokhoz, ellenőrzés, letöltés és a böngészőben tárolt vázlat (figyelmeztetéssel, ha a böngészőben elfogy a hely).
- A csomagformátum: `schema.json` (egy faj), `pack.schema.json` (egy jegyzék), a `data/dist/` mappában összeállított csomagok (`vietar-pack` formátum, 1-es verzió) és a `data/dist/example.json` formátumpéldaként.
- Öt beépített kezdőcsomag 71 fajjal: Románia (19 növény és gomba, 17 madár, 15 emlős) és vázak Bulgáriához és Moldovához (mindkettő ugyanaz a 10 faj); MI-asszisztenssel írt, csak részben ellenőrzött vázlatok, fényképek és hanghivatkozások nélkül.
- `scripts/pack.mjs` (összeállítás, `--check`, `--split`), `scripts/validate.py` (ugyanazok a szabályok, mint az oldalon, minden fájlra és minden összeállított csomagra), `scripts/optimize.py` (fényképek) és `scripts/check_licences.mjs` (a fényképek licence és szerzője; a `--online` a Wikimedia Commonst kérdezi).
- Útmutatók angolul és románul: `docs/pack-format.md`, `docs/school-class-guide.md`, `docs/contributor-guide.md` és `docs/review-guide.md`.
- `src/` és `scripts/build.mjs`: az egyetlen `index.html` mostantól forrásokból épül, beágyazott `data/dist/` csomagokkal, és a `--check` ellenőrzi.
- Tesztek: `npm test` és böngészőtesztek a hubban.
- Az ISSUES_GOOD_FIRST és a CODE_OF_CONDUCT lefordítva mind a nyolc nyelvre.
- README angolul, románul, franciául, olaszul, spanyolul, portugálul, németül és magyarul: állapot- és tervezett terjedelem-szakaszok (az `ISSUES_GOOD_FIRST.md` alapján).
- Telepíthető (PWA): a `manifest.webmanifest`, az `sw.js` és az ikonok a közös kitből (`fff-kit/pwa`) készülnek; az oldal az első HTTPS-látogatás után offline is működik.

### Módosítva
- A munkafolyamat Ubuntu 26.04 és Node.js 26 alatt fut, és a csomagellenőrzést, az érvényesítőt, a teszteket és a build-ellenőrzést is futtatja.
- Az adatok mostantól fajonként egy fájl és csomagonként egy jegyzék (`data/species/`, `data/packs/`), a `data/dist/` mappába összeállítva; a `data/species/example.json` helyét a `data/dist/example.json` veszi át, és a `scripts/validate.py`, a README lépései és a sablonok ennek megfelelően módosultak.
- A „good first issues” lista most azt tartalmazza, ami még hátravan (több faj, szakértői átnézés, fényképek, hangok, fordítások); a formátumleírás, a hasonmás-mező, a fényképoptimalizáló, a licencellenőrző és az osztályoknak szóló útmutató, amelyeket korábban felsorolt, már léteznek.

## [0.1.0] - 2026-11-13

### Hozzáadva
- Kezdeti váz: szerkezet, adatséma vagy első példák, hozzájárulási útmutatók nyolc nyelven.
