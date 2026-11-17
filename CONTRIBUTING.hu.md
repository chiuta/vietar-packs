# Közreműködés — VietAR Packs

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · **Magyar**

Verzió: 0.2.0 · Utolsó frissítés: 2026-11-17

1. Forkold ezt a tárolót.
2. Készíts vagy bővíts egy csomagot: az oldalon használd a „Készítés” lapot, és töltsd le a fájlt, vagy írj kézzel `data/species/<latin-nev>.json` fájlokat (lásd `docs/pack-format.md`).
3. Alakíts egy letöltött csomagot fájlokká a `node scripts/pack.mjs --split vietar-pack-<id>.json` paranccsal, vagy vedd fel az új fajok azonosítóit a csomag jegyzékébe a `data/packs/` mappában.
4. Futtasd a `node scripts/pack.mjs`, a `python3 scripts/validate.py`, az `npm test` és a `node scripts/build.mjs` parancsot.
5. Nyiss egy pull requestet – az adathozzájárulásokhoz nem kell programozni. Minden névhez, megjegyzéshez és mérgezőségi jelzéshez adj forrást, és soha ne jelölj meg magad egy csomagot átnézettnek (lásd `docs/review-guide.md`).

## Szabályok

- Egy faj = egy fájl a `data/species/` mappában, az azonosítójáról elnevezve (a latin név kisbetűkkel, kötőjelekkel).
- Mindig add meg a forrást.
- Csak olyan anyagot küldj, amelyet jogszerűen megoszthatsz (nincs másolt, védett szöveg).
- Légy kedves: lásd az Etikai kódexet.

## Fajok és csomagok hozzáadása

1. Olyan forrásból indulj ki, amelyet használhatsz: a saját tudásodból és megfigyeléseidből, vagy olyan nyilvános oldalakból, amelyek licence engedi az újrafelhasználást (jegyezd fel a címet és a dátumot). Ne másolj szöveget terepi határozókból, alkalmazásokból vagy weboldalakról, hacsak a licenc nem engedi: a megjegyzést a saját szavaiddal írd meg, és mondd ki ezt a `source` mezőben.
2. Nevet csak olyan nyelven írj, amelyet ismersz, vagy amelyet anyanyelvi beszélővel vagy megbízható szótárral ellenőrizni tudsz. Az angol kötelező; az oldal először az olvasó nyelvét mutatja, tartalékként az angolt.
3. Növényeknél és gombáknál a `toxic` kötelező. `true`-t írj, ha a faj valamely része ismerten mérgező, és írj olyan mérgezőségi megjegyzést, amely megmondja, mi a veszély. A `false` csak annyit jelent, hogy itt senki nem jelölte mérgezőnek a fajt: soha nem jelenti, hogy ehető. Kétség esetén kérdezz meg egy helyi szakértőt, mielőtt `false`-t írsz.
4. Egy veszélyes hasonmáspárt mindkét fajnál tüntess fel, olyan figyelmeztető megjegyzéssel, mint „A levelek összetéveszthetők; az összetévesztés súlyos mérgezéseket okozott”. Azt írd, hogy összetévesztik őket, soha azt, hogyan lehet megkülönböztetni: egy téves tanács halálos lehet.
5. Fényképek: saját, közkincs vagy a `docs/pack-format.md` listájában szereplő licencű képek, mindegyik a szerzőjével, licencével és a forrásra mutató hivatkozással; kicsinyítsd őket a `python3 scripts/optimize.py` paranccsal (WebP, legfeljebb 640 px, helyadatok nélkül), és a Wikimedia Commons-képeket ellenőrizd a `node scripts/check_licences.mjs --online` paranccsal. Hangok: csak olyan xeno-canto.org hivatkozások, amelyeket meghallgattál, a felvevő és a licenc megadásával.
6. Egy új csomag `draft` (vagy `skeleton`, ha csak a formátumot mutatja). Csak az állíthatja `reviewed`-re, aki minden fajt ellenőrzött, a nevével és a dátummal: lásd `docs/review-guide.md`.
7. Továbbiak: `docs/contributor-guide.md` (parancsok, fájlok, ellenőrzések), `docs/school-class-guide.md` (egy osztály vagy kör csomagot készít) és `docs/pack-format.md` (minden mező és korlát).
