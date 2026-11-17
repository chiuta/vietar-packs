# Ghid pentru contribuitori · VietAR Packs

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17 · [English](contributor-guide.md)

Acest ghid este pentru cei care adaugă sau corectează specii, pachete, fotografii ori sunete în depozit. O clasă sau un club care vrea doar să facă un pachet în pagină poate începe cu `docs/school-class-guide.md`. Formatul exact este în `docs/pack-format.md`; cum devine un pachet «Verificat» se spune în `docs/review-guide.md`.

## 1. Ce vă trebuie

- Node.js 24 sau mai nou și Python 3 cu `jsonschema` (`pip install jsonschema`). Pillow (`pip install pillow`) trebuie doar pentru `scripts/optimize.py`. Proiectul nu are alte dependențe și nu cere `npm install`.
- Un fork al depozitului, clonat pe calculatorul vostru, și un editor de text: fișierele de specii sunt JSON simplu.

## 2. Ce unde este

| Calea | Ce conține |
| --- | --- |
| `data/species/` | un fișier JSON pe specie, numit după id-ul ei |
| `data/packs/` | un manifest pe pachet: titlu, regiune, versiune, licență, stare și id-urile speciilor lui |
| `data/dist/` | pachetele asamblate, scrise de `node scripts/pack.mjs` și niciodată modificate de mână; `example.json` arată formatul |
| `schema.json`, `pack.schema.json` | regulile unei specii și ale unui pachet |
| `src/` | pagina: `engine.mjs` (reguli și logică), `ui.js`, `i18n.mjs`, `app.css` și `app.json` |
| `scripts/` | `pack.mjs`, `validate.py`, `optimize.py`, `check_licences.mjs` și `build.mjs` |
| `index.html` | pagina construită, făcută de `node scripts/build.mjs` și niciodată modificată de mână |
| `test/` | testele, rulate de `npm test` |
| `docs/` | aceste ghiduri |

## 3. Adăugați sau schimbați o specie

1. Scrieți sau modificați `data/species/<id>.json`: id-ul este numele latinesc cu litere mici și cratime, iar `docs/pack-format.md` enumeră fiecare câmp. Citați sursa în `source`.
2. Treceți id-ul în `species` din manifestul fiecărui pachet care trebuie să o conțină (`data/packs/<id-pachet>.json`), măriți `count`, puneți `updated` și măriți `version` (numărul din mijloc pentru o specie nouă, ultimul pentru o corectură).
3. Dacă specia are o sosie periculoasă, treceți fiecare specie la cealaltă, în același pachet, cu o notă de avertizare. Nu explicați niciodată cum se deosebesc.
4. Rulați aceste comenzi. Ele reconstruiesc `data/dist/`, verifică fiecare fișier, rulează testele și reconstruiesc pagina:

```
node scripts/pack.mjs
python3 scripts/validate.py
npm test
node scripts/build.mjs
```

Un fișier de specie care nu e în niciun pachet este o eroare: fiecare specie aparține cel puțin unui pachet.

## 4. Începeți un pachet nou

Scrieți manifestul `data/packs/<id-pachet>.json` (secțiunea 4 din `docs/pack-format.md`), enumerați id-urile speciilor lui, puneți `status` pe `draft` (sau `skeleton`) și rulați cele patru comenzi de mai sus. Pagina încorporează fiecare pachet din `data/dist/`, deci pachetul nou apare în fila «Pachete» după construire. Un pachet nou nu este niciodată `reviewed`: vezi `docs/review-guide.md`.

## 5. Preluați un pachet făcut în pagină

Un fișier descărcat din fila «Creare» sau «Pachete» devine fișiere de specii și un manifest cu:

```
node scripts/pack.mjs --split vietar-pack-<id>.json
```

Comanda verifică întâi pachetul și nu scrie nimic dacă are probleme. Nu suprascrie un fișier care există și diferă: le enumeră, iar `--force` le suprascrie. Apoi rulați cele patru comenzi din secțiunea 3, citiți fiecare nume și marcaj înainte să deschideți un pull request și păstrați `status` pe `draft`.

## 6. Fotografii

Folosiți numai fotografii proprii, din domeniul public sau cu o licență din lista din `docs/pack-format.md`. Pregătiți fiecare fotografie cu:

```
python3 scripts/optimize.py lynx.jpg --author "Nume Prenume" --licence CC-BY-4.0 --source-url "https://commons.wikimedia.org/wiki/File:Lynx_lynx.jpg" --commons-file "File:Lynx_lynx.jpg" --alt "Un râs pe o stâncă" --lang ro
```

Scriptul face imaginea de cel mult 640 de pixeli în lățime sau înălțime, șterge metadatele (loc, dată, aparat), o salvează ca WebP (JPEG dacă WebP nu e disponibil) și tipărește o intrare de fotografie în JSON, de adăugat în lista `photos` a speciei; dacă rezultatul depășește 120.000 de caractere, scade treptat calitatea și, la nevoie, dimensiunea. Apoi verificați licențele:

```
node scripts/check_licences.mjs
node scripts/check_licences.mjs --online
```

Prima comandă merge fără rețea: fiecare fotografie trebuie să aibă o licență permisă, un autor și o legătură către sursă. A doua întreabă Wikimedia Commons despre fiecare fotografie care are `commons_file` și compară licența și autorul. Este singurul loc în care proiectul folosește rețeaua, și numai când o cereți. O fotografie din altă sursă nu poate fi verificată de un script: răspunde de ea cine o adaugă.

## 7. Sunete

Un sunet este o legătură `https://xeno-canto.org/<număr>` către o înregistrare pe care ați ascultat-o, cu numele celui care a înregistrat și licența, așa cum le scrie xeno-canto. Pagina nu o redă și nu o încarcă niciodată. Numerele nu pot fi verificate fără rețea, așa că fiecare se verifică ascultând.

## 8. Înainte să deschideți un pull request

```
node scripts/pack.mjs --check
python3 scripts/validate.py
npm test
node scripts/build.mjs --check
node scripts/check_licences.mjs
```

`npm run check` rulează prima, a doua și a patra. Șablonul de pull request enumeră ce trebuie bifat, iar aceleași verificări rulează pe GitHub la fiecare push.

## 9. Cum se înțeleg pagina, scripturile și testele

`src/engine.mjs` (folosit de pagină și de `scripts/pack.mjs`) și `scripts/validate.py` aplică aceleași reguli în două limbaje; `test/validator-parity.test.mjs` le compară caz cu caz, deci o regulă schimbată într-un loc și nu în celălalt pică testele. `node scripts/build.mjs --check` eșuează când `index.html` e mai vechi decât `src/` sau `data/dist/`. Testele de browser din hub deschid pagina în opt limbi și încearcă fișiere ostile, stocare plină și texte lungi.

## 10. O greșeală în date

Dacă un marcaj de toxicitate este greșit sau lipsește o sosie periculoasă, deschideți imediat un issue cu titlul „Safety: …” și spuneți ce nu e în regulă și de unde știți. Un astfel de issue are prioritate înaintea tuturor celorlalte. Îl rezolvați într-un pull request care schimbă fișierul speciei, mărește versiunea fiecărui pachet care o conține și, dacă un pachet era `reviewed`, îi pune starea înapoi pe `draft` până când un revizor verifică schimbarea.
