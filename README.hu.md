# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · **Magyar**

Verzió: 0.2.0 · Utolsó frissítés: 2026-11-17

🌐 https://vietar-packs.chiuta.ro

> Regionális fajcsomagok a VietAR-hoz: helyi állatok és növények nevei, fotói és hangjai.

Trade-free: nincs követés, nincs reklám, nincs fiók, offline is működik.

## Állapot

Alfa, használható: az egyetlen `index.html` regionális fajcsomagokat böngész, importál, ellenőriz és hoz létre: neveket több nyelven, mérgezőségi jelzést, veszélyes hasonmásokat, licencelt fényképeket és hivatkozásokat az xeno-canto hangjaira. Öt beépített kezdőcsomagot tartalmaz, összesen 71 fajjal (Románia: 19 növény és gomba, 17 madár és 15 emlős; Bulgária és Moldova: mindkettő ugyanaz a 10 elterjedt faj, vázként). Minden beépített csomag vázlat vagy váz: a neveket és a megjegyzéseket MI-asszisztenssel írták, és csak részben ellenőrizték, sem biológus, sem gombaszakértő, sem anyanyelvi beszélő nem nézte át őket, és még nincs bennük fénykép és hanghivatkozás. Az oldal nem határoz meg fajokat, és nem terepi határozó: a „Nincs mérgezőnek jelölve” jelölés soha nem jelenti, hogy biztonságosan megehető vagy megérinthető. A VietAR alkalmazás még nem tudja importálni ezeket a csomagokat.

## Mit tud

- „Böngészés”: válassz egy csomagot, keress bármely nyelvű névre vagy a latin névre (a kis- és nagybetű és az ékezetek nem számítanak), szűrj csoportra és mérgezőségi jelzésre, és nyiss meg egy fajt: a nevei (az oldal nyelvén, tartalékként angolul), a mérgezőségi jelzés és megjegyzés, a megjegyzések, a forrás, azok a fajok, amelyekkel gyakran összetévesztik (mindegyik hivatkozás), a fényképek és a hanghivatkozások. Egy piros biztonsági keret minden lapon látható marad, és megmondja, mi nem az oldal.
- „Csomagok”: a beépített csomagok és az általad importáltak (illeszd be a JSON-t vagy válassz egy fájlt; egyszerre legfeljebb 12), mindegyik a régiójával, verziójával, licencével, szerzőivel, egy őszinte állapotjelvénnyel („Váz”, „Vázlat”, „Átnézett”) és a fajok számával csoportonként; tölts le bármelyik csomagot, vagy töröld az importáltakat. Egy csomagot teljes egészében ellenőriz a rendszer, mielőtt hozzáadná: ha valami hibás, semmi sem importálódik, és látod, mit kell javítani.
- „Készítés”: készíts csomagot egy osztálynak, egy természetjáró körnek vagy egy régiónak: töltsd ki a csomagot, add hozzá egyenként a fajokat (legfeljebb 400-at), kösd össze a hasonmásokat mindkét irányban, ellenőrizd a csomagot ugyanazokkal a szabályokkal, mint a tároló, és töltsd le a fájlt. A vázlat a böngészőben marad, amíg dolgozol. Az itt készített csomagot soha nem lehet átnézettnek jelölni; a fényképeket és a hangokat a faj JSON-ján keresztül lehet hozzáadni.
- „Útmutató”: hogyan használd az oldalt, és egy példa egy fajra fényképpel és hanggal.
- Formátum: fajonként egy JSON-fájl a `data/species/` mappában, csomagonként egy jegyzék a `data/packs/` mappában, teljes csomagokká (`vietar-pack` formátum) összeállítva a `data/dist/` mappában; a `schema.json` és a `pack.schema.json` írja le, a `docs/pack-format.md` magyarázza.
- Eszközök közreműködőknek: `scripts/pack.mjs` (összeállítja a csomagokat, és fájlokra bontja a letöltöttet), `scripts/validate.py`, `scripts/optimize.py` (egy fénykép legfeljebb 640 px-es WebP-be, metaadatok nélkül), `scripts/check_licences.mjs` (a fényképek licencei, online a `--online` kapcsolóval). A felület nyolc nyelven érhető el, és használható billentyűzettel és képernyőolvasóval.
- Alkalmazásként telepíthető, és az első látogatás után offline is elérhető, ha HTTPS-en keresztül szolgálják ki (egy service worker megőrzi az oldalt; semmi mást nem tárol és nem küld). Letöltött fájlból megnyitva ugyanígy működik, telepítés nélkül.

## Hogyan működik

- Egy fajfájlból és egy jegyzékből (a fajazonosítók listája és a számuk) teljes csomag lesz: a `node scripts/pack.mjs` a `data/dist/<id>.json` fájlba írja. Az oldal beágyazza a `data/dist/` mappát, így amit böngészel, az pontosan az, amit letöltesz.
- A `schema.json` és a `pack.schema.json` leírja a fájlokat; a `scripts/validate.py` alkalmazza őket, és azokat a szabályokat is, amelyeket egy séma nem tud kimondani: a fájlnév, az azonosító és a latin név egyezik, a csoport illik a rendszertani országhoz, a növények és a gombák megmondják, mérgezők-e, a mérgező fajnak van mérgezőségi megjegyzése, a hasonmások kölcsönösen egymásra mutatnak, a fényképek együtt legfeljebb 3 MB-nyiak, az átnézett csomag megnevezi az átnézőt és a dátumot. A `src/engine.mjs` ugyanezeket a szabályokat alkalmazza az oldalon; a tesztek összehasonlítják a kettőt.
- Biztonságos már a felépítésében: a csomag szövegét az oldal mindig szövegként mutatja, soha nem HTML-ként; a hivatkozások csak `https://` címeket nyitnak meg; az oldal nem indít hálózati kérést (a fényképek be vannak ágyazva, a hangok olyan hivatkozások, amelyek az xeno-canto.org-ot új lapon nyitják meg); az importált csomagot és a mentett állapotot az oldal betöltésekor újra ellenőrzi, így a sérült vagy ellenséges állapotot elutasítja, nem hiszi el.
- A `src/ui.js`, a `src/i18n.mjs` és a `src/app.css` a felület; a `scripts/build.mjs` a `src/` mappából építi az egyetlen `index.html` fájlt, és beágyazza a `data/dist/` csomagjait; a `node scripts/build.mjs --check` hibával áll meg, ha az oldal elavult.
- Tesztek: `npm test` (motor, egyezés az érvényesítővel, szkriptek, licencellenőrző, fényképoptimalizáló, dokumentáció) és böngészőtesztek a hubban (nyolc nyelv, akadálymentesség, ellenséges importok, korlátok, megtelt tároló). A fejlesztéshez Node.js 24 vagy újabb és Python 3 kell a `jsonschema` csomaggal (a Pillow csak a fényképoptimalizálóhoz); maga az oldal olyan böngészőt kér, amely ismeri az ES2017-et.
- A `manifest.webmanifest`, az `sw.js` és az ikonok a `node scripts/build.mjs` futtatásakor készülnek a közös kit révén (az `src/app.json` `pwa` szakasza); a `--check` is ellenőrzi őket, az `npm test` pedig azt, hogy a manifeszt, a service worker verziója és a CSP megegyezik az oldalval.

## Őszinte korlátok

- A beépített csomagok vázlatok: a neveket és a megjegyzéseket MI-asszisztenssel írták általános ismeretekből, és csak részben ellenőrizték nyilvános oldalakon. Biológus, gombaszakértő vagy anyanyelvi beszélő nem nézte át őket. A bolgár és a moldovai csomag 10-10 fajos váz.
- A «Nincs mérgezőnek jelölve» csak annyit jelent, hogy ebben a csomagban senki nem jelölte mérgezőnek a fajt. Soha nem állítja, hogy egy növény vagy gomba ehető vagy biztonságos, és a csomagok nem tanítanak a hasonmások megkülönböztetésére. Soha ne egyél vadon élő növényt vagy gombát ez az oldal alapján.
- A beépített csomagok nem tartalmaznak fényképeket és hanghivatkozásokat, mert a licenceket és a felvételek számát internet nélkül nem lehetett ellenőrizni. A formátum mindkettőt támogatja, szerzővel, licenccel és forrással.
- Az itt importált csomagok csak ebben a böngészőben maradnak; a webhelyadatok törlése eltávolítja őket. Töltsd le azokat, amelyek fontosak neked.
- A VietAR alkalmazás még nem tudja importálni ezeket a csomagokat. Egyelőre a csomagokat ez az oldal és a tároló szkriptjei olvassák és ellenőrzik.
- A felület fordításait gép írta, anyanyelvi beszélők nem nézték át. A fajok nevei és megjegyzései a csomag nyelvén jelennek meg, tartaléknak az angollal.

## Járulj hozzá 5 perc alatt

1. Forkold ezt a tárolót.
2. Készíts vagy bővíts egy csomagot: az oldalon használd a „Készítés” lapot, és töltsd le a fájlt, vagy írj kézzel `data/species/<latin-nev>.json` fájlokat (lásd `docs/pack-format.md`).
3. Alakíts egy letöltött csomagot fájlokká a `node scripts/pack.mjs --split vietar-pack-<id>.json` paranccsal, vagy vedd fel az új fajok azonosítóit a csomag jegyzékébe a `data/packs/` mappában.
4. Futtasd a `node scripts/pack.mjs`, a `python3 scripts/validate.py`, az `npm test` és a `node scripts/build.mjs` parancsot.
5. Nyiss egy pull requestet – az adathozzájárulásokhoz nem kell programozni. Minden névhez, megjegyzéshez és mérgezőségi jelzéshez adj forrást, és soha ne jelölj meg magad egy csomagot átnézettnek (lásd `docs/review-guide.md`).

## Jó első feladatok

Kész feladatok: `ISSUES_GOOD_FIRST.md`.

## Licenc

Kód: MIT. Adatok: minden csomag megadja a saját licencét (CC0-1.0, CC-BY-4.0 vagy CC-BY-SA-4.0); a beépített csomagok CC0-1.0 alatt vannak. A fényképek és a hangok megtartják a saját licencüket: mindegyik megnevezi a szerzőjét, licencét és forrását. A beküldött adatoknál add meg a forrást; annak a csomagnak a licence alatt jelennek meg, amelyhez csatlakoznak.

## Támogatás

Ha hasznos a projekt, [meghívhatsz egy kávéra](https://buymeacoffee.com/echo.of.the.strings).
