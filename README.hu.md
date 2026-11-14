# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · **Magyar**

Verzió: 0.1.0 · Utolsó frissítés: 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Regionális fajcsomagok a VietAR-hoz: helyi állatok és növények nevei, fotói és hangjai.

Trade-free: nincs követés, nincs reklám, nincs fiók, offline is működik.

## Állapot

Alfa: a tároló a szerkezetet, az adatsémát vagy az első példákat és a közreműködési útmutatókat tartalmazza. Az alábbi terjedelem a terv, nem a ma működő állapot.

## Tervezett terjedelem

- Csomagformátum-leírás: `pack.json` jegyzék régióval, verzióval és fajszámmal.
- Fajcsomagok Romániához: kb. 30 kárpáti emlős en/ro/hu/de nevekkel, kb. 50 gyakori madár hanghivatkozásokkal (Xeno-canto, CC-BY), és kb. 40 vadon élő növény és gomba `toxic` jelzővel.
- Csomagvázak Bulgáriához és Moldovához, egyenként 20 fajjal.
- `look-alike` mező, amely a veszélyes fajpárokat köti össze.
- Eszközök: fényképlicenc-ellenőrző a Wikimedia Commons API-val, képoptimalizáló (WebP, legfeljebb 640 px) és útmutató, hogyan adhat hozzá egy iskolai osztály helyi csomagot.

Ezek közül még semmi sincs megvalósítva: minden pont kész feladat az `ISSUES_GOOD_FIRST.md` fájlban.

## Járulj hozzá 5 perc alatt

1. Forkold ezt a tárolót.
2. Másold a `data/species/example.json` fájlt a `data/species/` mappába, és szerkeszd.
3. Futtasd: `python scripts/validate.py`.
4. Nyiss egy pull requestet – adatokhoz nem kell programozni.

## Jó első feladatok

Kész feladatok: `ISSUES_GOOD_FIRST.md`.

## Licenc

Kód: MIT. A beküldött adatoknál add meg a forrást; azonos licenc alatt jelennek meg, ha a fájl mást nem mond.

## Támogatás

Ha hasznos a projekt, [meghívhatsz egy kávéra](https://buymeacoffee.com/echo.of.the.strings).
