# VietAR Packs

[English](README.md) · **Română** · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17

🌐 https://vietar-packs.chiuta.ro

> Pachete regionale de specii pentru VietAR: nume, fotografii și sunete ale faunei și florei locale.

Fără comerț (trade-free): fără urmărire, fără reclame, fără conturi, funcționează offline.

## Stare

Alfa, utilizabilă: singurul `index.html` răsfoiește, importă, verifică și creează pachete regionale de specii: nume în mai multe limbi, un marcaj de toxicitate, sosii periculoase, fotografii cu licență și legături către sunete de pe xeno-canto. Conține cinci pachete de pornire incluse, cu 71 de specii în total (România: 19 plante și ciuperci, 17 păsări și 15 mamifere; Bulgaria și Moldova: aceleași 10 specii răspândite, ca schelete). Fiecare pachet inclus este o ciornă sau un schelet: numele și notele au fost scrise cu un asistent IA și verificate doar în parte, niciun biolog, micolog sau vorbitor nativ nu le-a revizuit, iar pachetele nu au încă fotografii și nici legături către sunete. Pagina nu identifică nimic și nu este un ghid de teren: eticheta «Nemarcată toxică» nu înseamnă niciodată că e sigur de mâncat sau de atins. Aplicația VietAR nu poate încă importa aceste pachete.

## Ce face

- «Răsfoire»: alegi un pachet, cauți după un nume în orice limbă sau după numele latinesc (majusculele și diacriticele nu contează), filtrezi după grup și după marcajul de toxicitate și deschizi o specie: numele ei (în limba paginii, cu engleza ca rezervă), marcajul și nota despre toxicitate, notele, sursa, speciile cu care e adesea confundată (fiecare o legătură), fotografiile și legăturile către sunete. O casetă roșie de siguranță rămâne vizibilă în fiecare filă și spune ce nu este pagina.
- «Pachete»: pachetele incluse și cele pe care le imporți (lipești JSON-ul sau alegi un fișier; cel mult 12 odată), fiecare cu regiunea, versiunea, licența, autorii, o insignă sinceră de stare («Schelet», «Ciornă», «Verificat») și numărul de specii pe grupe; descarci orice pachet sau le ștergi pe cele importate. Un pachet este verificat integral înainte de a fi adăugat: dacă ceva nu e în regulă, nu se importă nimic și vezi ce trebuie corectat.
- «Creare»: faci un pachet pentru o clasă, un club de natură sau o regiune: completezi pachetul, adaugi specii pe rând (până la 400), legi sosiile în ambele sensuri, verifici pachetul cu aceleași reguli ca depozitul și descarci fișierul. Ciorna se păstrează în acest browser cât lucrezi. Un pachet făcut aici nu poate fi marcat ca revizuit; fotografiile și sunetele se adaugă prin JSON-ul speciei.
- «Ghid»: cum se folosește pagina și un exemplu de specie cu o fotografie și un sunet.
- Format: un fișier JSON pe specie în `data/species/`, un manifest pe pachet în `data/packs/`, asamblate în pachete complete (format `vietar-pack`) în `data/dist/`; descrise de `schema.json` și `pack.schema.json` și explicate în `docs/pack-format.md`.
- Unelte pentru contribuitori: `scripts/pack.mjs` (asamblează pachetele și desparte în fișiere un pachet descărcat), `scripts/validate.py`, `scripts/optimize.py` (o fotografie în WebP de cel mult 640 px, fără metadate), `scripts/check_licences.mjs` (licențele fotografiilor, online cu `--online`). Interfața este în opt limbi și merge cu tastatura și cu un cititor de ecran.
- Se poate instala ca aplicație și funcționează offline după prima vizită, când e servită prin HTTPS (un service worker păstrează pagina; nu se stochează și nu se trimite nimic altceva). Deschisă dintr-un fișier descărcat, merge la fel, fără instalare.

## Cum funcționează

- Un fișier de specie și un manifest (lista id-urilor de specii și numărul lor) devin un pachet complet: `node scripts/pack.mjs` îl scrie în `data/dist/<id>.json`. Pagina încorporează `data/dist/`, deci ce răsfoiești este exact ce descarci.
- `schema.json` și `pack.schema.json` descriu fișierele; `scripts/validate.py` le aplică și verifică regulile pe care o schemă nu le poate spune: numele fișierului, id-ul și numele latinesc se potrivesc, grupul se potrivește cu regnul, plantele și ciupercile spun dacă sunt toxice, o specie toxică are notă despre toxicitate, sosiile se indică reciproc, fotografiile încap în 3 MB, un pachet revizuit își numește revizorul și data. `src/engine.mjs` aplică aceleași reguli în pagină; testele le compară.
- Sigură prin construcție: textul dintr-un pachet este mereu afișat ca text, niciodată ca HTML; legăturile deschid doar adrese `https://`; pagina nu face nicio cerere în rețea (fotografiile sunt încorporate, sunetele sunt legături care deschid xeno-canto.org într-o filă nouă); un pachet importat și starea salvată sunt verificate din nou la încărcarea paginii, deci unul deteriorat sau ostil este refuzat, nu i se acordă încredere.
- `src/ui.js`, `src/i18n.mjs` și `src/app.css` sunt interfața; `scripts/build.mjs` construiește singurul `index.html` din `src/` și încorporează pachetele din `data/dist/`; `node scripts/build.mjs --check` eșuează dacă pagina e depășită.
- Teste: `npm test` (motorul, paritatea cu validatorul, scripturile, verificatorul de licențe, optimizatorul de fotografii, documentația) și teste de browser în hub (opt limbi, accesibilitate, importuri ostile, limite, stocare plină). Dezvoltarea cere Node.js 24 sau mai nou și Python 3 cu `jsonschema` (Pillow doar pentru optimizatorul de fotografii); pagina însăși cere un browser care știe ES2017.
- `manifest.webmanifest`, `sw.js` și pictogramele sunt produse de `node scripts/build.mjs` prin kitul comun (secțiunea `pwa` din `src/app.json`); `--check` le verifică și el, iar `npm test` verifică dacă manifestul, versiunea service worker-ului și CSP-ul corespund paginii.

## Limite sincere

- Pachetele încorporate sunt ciorne: numele și notele au fost scrise cu un asistent IA din cunoștințe generale și verificate doar în parte pe pagini publice. Niciun biolog, micolog sau vorbitor nativ nu le-a revizuit. Pachetele pentru Bulgaria și Moldova sunt schelete de câte 10 specii.
- «Nemarcată ca toxică» înseamnă doar că nimeni n-a marcat specia ca toxică în acest pachet. Nu este niciodată o afirmație că o plantă sau o ciupercă e comestibilă sau sigură, iar pachetele nu te învață cum să deosebești sosiile. Nu mânca niciodată o plantă sau o ciupercă din natură pe baza acestei pagini.
- Pachetele încorporate nu conțin fotografii și nici legături către sunete, fiindcă licențele și numerele înregistrărilor nu au putut fi verificate fără internet. Formatul le acceptă pe amândouă, cu autor, licență și sursă.
- Pachetele importate aici sunt păstrate doar în acest browser; ștergerea datelor site-ului le elimină. Descarcă-le pe cele la care ții.
- Aplicația VietAR nu poate importa încă aceste pachete. Deocamdată pachetele sunt citite și verificate în această pagină și de scripturile din depozit.
- Traducerile interfeței au fost scrise de o mașină și nu au fost revizuite de vorbitori nativi. Numele și notele speciilor apar în limba pachetului, cu engleza ca variantă de rezervă.

## Contribuie în 5 minute

1. Fă un fork al acestui depozit.
2. Fă sau extinde un pachet: în pagină folosește fila «Creare» și descarcă fișierul, sau scrie de mână fișiere `data/species/<nume-latinesc>.json` (vezi `docs/pack-format.md`).
3. Transformă un pachet descărcat în fișiere cu `node scripts/pack.mjs --split vietar-pack-<id>.json` sau treci id-urile noilor specii în manifestul pachetului din `data/packs/`.
4. Rulează `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` și `node scripts/build.mjs`.
5. Deschide un pull request — contribuțiile de date nu cer programare. Dă o sursă pentru fiecare nume, notă și marcaj de toxicitate și nu marca niciodată singur un pachet ca revizuit (vezi `docs/review-guide.md`).

## Sarcini bune pentru început

Vezi `ISSUES_GOOD_FIRST.md` pentru sarcini gata pregătite.

## Licență

Cod: MIT. Date: fiecare pachet își indică licența (CC0-1.0, CC-BY-4.0 sau CC-BY-SA-4.0); pachetele incluse sunt CC0-1.0. Fotografiile și sunetele își păstrează licențele lor: fiecare numește autorul, licența și sursa. Datele contribuite: indică sursa; sunt publicate sub licența pachetului la care se adaugă.

## Sprijin

Dacă proiectul îți este util, poți [să-mi oferi o cafea](https://buymeacoffee.com/echo.of.the.strings).
