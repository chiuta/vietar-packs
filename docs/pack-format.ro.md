# Formatul pachetelor · VietAR Packs

Versiune: 0.2.1 · Ultima actualizare: 2026-11-20 · [English](pack-format.md)

Un pachet este un singur fișier JSON cu speciile unei regiuni: nume în mai multe limbi, un marcaj de toxicitate, sosii periculoase și, când licența o permite, fotografii și legături către sunete. Acest ghid enumeră fiecare câmp și fiecare limită. `schema.json` și `pack.schema.json` sunt regulile exacte; `scripts/validate.py` și pagina le aplică, iar `data/dist/example.json` arată toate câmpurile într-un singur fișier.

## 1. Trei feluri de fișiere

| Fișier | Ce este | Reguli |
| --- | --- | --- |
| `data/species/<id>.json` | o specie, numită după id-ul ei | `schema.json` |
| `data/packs/<id>.json` | manifestul unui pachet: titlu, regiune, versiune, licență, stare și id-urile speciilor lui | `pack.schema.json` |
| `data/dist/<id>.json` | pachetul asamblat: manifestul și speciile într-un singur fișier (format `vietar-pack`, versiunea 1) | ambele scheme și regulile din secțiunea 7 |

`node scripts/pack.mjs` construiește `data/dist/` din celelalte două; `node scripts/pack.mjs --check` eșuează dacă e depășit. Pagina importă și descarcă pachetul asamblat: un fișier descărcat din fila «Creare» sau «Pachete» este cel pe care îl trimiți spre revizuire, iar `node scripts/pack.mjs --split vietar-pack-<id>.json` îl transformă la loc în fișiere de specii și un manifest.

## 2. O specie

```json
{
  "id": "colchicum-autumnale",
  "latin": "Colchicum autumnale",
  "kingdom": "plantae",
  "group": "herb",
  "names": { "en": "Meadow saffron", "ro": "Brândușă de toamnă", "de": "Herbstzeitlose" },
  "toxic": true,
  "toxic_note": { "ro": "Foarte otrăvitoare: conține colchicină. Consumul oricărei părți poate fi mortal." },
  "notes": { "ro": "Înflorește toamna; frunzele apar primăvara." },
  "source": "Note proprii, verificate într-o floră publică",
  "look_alike": [
    { "id": "allium-ursinum", "note": { "ro": "Frunzele pot fi confundate. Confuzia a provocat intoxicații grave." } }
  ]
}
```

| Câmp | Necesar | Ce conține |
| --- | --- | --- |
| `id` | da | numele latinesc cu litere mici și cratime (`Lynx lynx` devine `lynx-lynx`), de la 3 la 80 de caractere; este și numele fișierului |
| `latin` | da | genul cu majusculă, apoi specia și, la nevoie, o subspecie sau o varietate: `Lynx lynx`; de la 5 la 80 de caractere |
| `kingdom` | da | `animalia`, `plantae` sau `fungi` |
| `group` | da | animale: `mammal`, `bird`, `reptile`, `amphibian`, `fish`, `invertebrate` sau `other`; plante: `tree`, `shrub`, `herb` sau `other`; ciuperci: `fungus` sau `other` |
| `names` | da | codul limbii (două sau trei litere mici) → nume, cel mult 80 de caractere fiecare; `en` este obligatoriu; cel mult 24 de limbi |
| `toxic` | plante și ciuperci | `true` sau `false`; animalele îl pot omite (pagina spune «Fără marcaj de toxicitate») |
| `toxic_note` | când `toxic` este `true` (și numai atunci) | limba → text, cel mult 300 de caractere fiecare: ce pericol există |
| `notes` | nu | limba → text, cel mult 600 de caractere fiecare; rândurile noi sunt permise aici și nicăieri altundeva |
| `source` | nu | de unde vin faptele, cel mult 200 de caractere |
| `look_alike` | nu | cel mult 8 intrări `{ "id": …, "note": limba → avertisment, cel mult 300 de caractere fiecare }` |
| `photos` | nu | cel mult 6 fotografii, vezi secțiunea 3 |
| `audio` | nu | cel mult 6 sunete, vezi secțiunea 3 |

Reguli pe care o schemă nu le poate spune, verificate de pagină și de `scripts/validate.py`:

- `toxic: false` înseamnă doar că nimeni n-a marcat specia ca toxică. Pagina nu o arată niciodată verde sau sigură și adaugă mereu un avertisment.
- O sosie trebuie să fie în același pachet și să trimită înapoi la această specie, iar nimic nu se trece pe sine și nici aceeași specie de două ori. Nota spune că se confundă și că confuzia e periculoasă, niciodată cum se deosebesc.
- Textele nu au caractere de control, nici caractere care schimbă sensul textului și nici spații la început sau la sfârșit. `<` și `&` sunt permise și sunt mereu afișate ca text, niciodată ca HTML.

## 3. Fotografii și sunete

```json
{
  "photos": [
    {
      "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNQ6lYCAAGiANAIO/QDAAAAAElFTkSuQmCC",
      "alt": { "ro": "O piatră cenușie pe o potecă" },
      "author": "Autor Exemplu",
      "licence": "CC-BY-4.0",
      "source_url": "https://commons.wikimedia.org/wiki/File:Example.png",
      "commons_file": "File:Example.png"
    }
  ],
  "audio": [
    {
      "url": "https://xeno-canto.org/123456",
      "recordist": "Înregistrator Exemplu",
      "licence": "CC-BY-4.0",
      "note": { "ro": "Cântec, dimineață de primăvară" }
    }
  ]
}
```

| Câmp | Necesar | Ce conține |
| --- | --- | --- |
| `photos[].data` | da | imaginea însăși ca adresă de date: `data:image/webp;base64,…` (sau `jpeg`, `png`), cel mult 120.000 de caractere |
| `photos[].alt` | da | limba → ce arată imaginea, cel mult 200 de caractere fiecare |
| `photos[].author` | da | autorul, cel mult 120 de caractere |
| `photos[].licence` | da | `CC0-1.0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC-BY-3.0`, `CC-BY-SA-3.0` sau `PDM-1.0` |
| `photos[].source_url` | nu | o adresă `https://` a sursei, cel mult 300 de caractere |
| `photos[].commons_file` | nu | fișierul de pe Wikimedia Commons (`File:Nume.jpg`): `scripts/check_licences.mjs --online` compară licența și autorul cu Commons |
| `audio[].url` | da | `https://xeno-canto.org/` și numărul înregistrării |
| `audio[].recordist` | da | persoana care a înregistrat, cel mult 120 de caractere |
| `audio[].licence` | da | `CC0-1.0` sau o licență Creative Commons scrisă ca la xeno-canto (de exemplu `CC-BY-NC-SA-4.0`) |
| `audio[].note` | nu | limba → text, cel mult 200 de caractere fiecare |

Fotografiile unui pachet însumează cel mult 3.000.000 de caractere (circa 3 MB). Pagina nu încarcă nimic din rețea și nu redă singură niciun sunet: fotografiile sunt în fișier, iar fiecare sunet este o legătură care deschide xeno-canto.org într-o filă nouă. Pregătește o fotografie cu `python3 scripts/optimize.py` (vezi `docs/contributor-guide.md`).

## 4. Manifestul unui pachet

```json
{
  "id": "xx-garden",
  "title": { "en": "A school garden", "ro": "Grădina școlii" },
  "description": { "ro": "Plantele și animalele unei grădini de școală. Ciornă: niciun specialist n-a verificat-o." },
  "region": "XX",
  "version": "0.1.0",
  "updated": "2026-11-17",
  "licence": "CC0-1.0",
  "status": "draft",
  "authors": ["Clasa 5B"],
  "species": ["lynx-lynx", "allium-ursinum"],
  "count": 2
}
```

| Câmp | Necesar | Ce conține |
| --- | --- | --- |
| `id` | da | un cod de țară, o cratimă și un nume scurt, cu litere mici (`ro-mammals`), de la 5 la 40 de caractere; este și numele fișierului |
| `title` | da | limba → titlu, cel mult 100 de caractere fiecare; `en` este obligatoriu |
| `description` | nu | limba → text, cel mult 300 de caractere fiecare |
| `region` | da | două litere mari (`RO`) |
| `version` | da | trei numere despărțite prin puncte (`0.1.0`) |
| `updated` | da | o dată reală, `AAAA-LL-ZZ` (`YYYY-MM-DD`) |
| `licence` | da | `CC0-1.0`, `CC-BY-4.0` sau `CC-BY-SA-4.0` |
| `status` | da | `skeleton`, `draft` sau `reviewed` (secțiunea 5) |
| `reviewed_by`, `reviewed_on` | când `status` este `reviewed` | cine a verificat (cel mult 120 de caractere) și data |
| `authors` | nu | cel mult 10 nume de cel mult 80 de caractere: ajunge numele unei clase sau al unui club |
| `species` | da | de la 1 la 2.000 de id-uri de specii, fără repetări |
| `count` | da | numărul de specii, egal cu lungimea lui `species` |

## 5. Starea

- `skeleton` («Schelet»): doar câteva specii, ca să arate formatul. Numele nu sunt verificate.
- `draft` («Ciornă»): scris cu grijă sau cu un asistent IA și verificat doar în parte. Niciun specialist nu l-a revizuit. Un pachet făcut în pagină și unul trimis de cineva pornesc de aici.
- `reviewed` («Verificat»): un revizor numit spune că a verificat fiecare specie la data dată (vezi `docs/review-guide.md`). O revizuire tot nu e o garanție, iar pagina o spune. Creatorul din pagină nu îl poate pune niciodată.

## 6. Un pachet complet

Acesta este ce importă și descarcă pagina: câmpurile manifestului, `format` și `format_version`, iar în loc de id-uri, speciile însele. Este un pachet cu două specii care se confundă între ele, deci fiecare o trece pe cealaltă:

```json
{
  "format": "vietar-pack",
  "format_version": 1,
  "id": "xx-garden",
  "title": { "en": "A school garden", "ro": "Grădina școlii" },
  "region": "XX",
  "version": "0.1.0",
  "updated": "2026-11-17",
  "licence": "CC0-1.0",
  "status": "draft",
  "authors": ["Clasa 5B"],
  "count": 2,
  "species": [
    {
      "id": "allium-ursinum",
      "latin": "Allium ursinum",
      "kingdom": "plantae",
      "group": "herb",
      "names": { "en": "Ramsons (wild garlic)", "ro": "Leurdă" },
      "toxic": false,
      "look_alike": [
        { "id": "colchicum-autumnale", "note": { "ro": "Frunzele pot fi confundate. Confuzia a provocat intoxicații grave." } }
      ]
    },
    {
      "id": "colchicum-autumnale",
      "latin": "Colchicum autumnale",
      "kingdom": "plantae",
      "group": "herb",
      "names": { "en": "Meadow saffron", "ro": "Brândușă de toamnă" },
      "toxic": true,
      "toxic_note": { "ro": "Foarte otrăvitoare: conține colchicină. Consumul oricărei părți poate fi mortal." },
      "look_alike": [
        { "id": "allium-ursinum", "note": { "ro": "Frunzele pot fi confundate. Confuzia a provocat intoxicații grave." } }
      ]
    }
  ]
}
```

Ca să încerci un pachet în pagină, folosește fila «Pachete» → «Importă»: lipește JSON-ul sau alege fișierul. Pachetul este verificat integral întâi; dacă ceva nu e în regulă, nu se importă nimic și pagina arată ce trebuie corectat.

## 7. Limite și probleme

Pagina respectă aceste limite:

- un text importat de cel mult 6.000.000 de caractere (circa 6 MB);
- pachete importate de cel mult 4.000.000 de caractere în total în browser și cel mult 12 pachete;
- un pachet de la 1 la 2.000 de specii și o ciornă din fila «Creare» de cel mult 400 de specii;
- fotografii de cel mult 3.000.000 de caractere într-un pachet;
- o listă care arată câte 24 de specii odată.

Pagina și scripturile raportează o problemă printr-un cod. Primul tabel conține codurile pe care le raportează ambele, cu mesajul paginii; al doilea conține codurile pe care le raportează doar scripturile.

| Cod | Mesajul paginii |
| --- | --- |
| `type` | tip de valoare greșit |
| `missing` | lipsește un câmp obligatoriu |
| `extra` | câmp necunoscut |
| `length` | prea scurt, prea lung sau număr greșit de elemente |
| `pattern` | nu are forma cerută |
| `enum` | nu e una dintre valorile permise |
| `text` | conține caractere interzise sau spații la capete |
| `date` | nu e o dată reală (folosește AAAA-LL-ZZ) |
| `id_slug` | id-ul trebuie să fie denumirea latină cu litere mici și cratime |
| `group_kingdom` | grupul acesta nu aparține regnului ales |
| `toxic_required` | plantele și ciupercile trebuie să spună dacă sunt toxice |
| `toxic_note_required` | o specie marcată toxică are nevoie de o notă despre toxicitate |
| `toxic_note_unused` | nota despre toxicitate e permisă doar la o specie marcată toxică |
| `look_self` | o specie nu poate fi propria ei sosie |
| `look_dup` | aceeași sosie e trecută de două ori |
| `look_unknown` | sosia nu se află în acest pachet |
| `look_asym` | sosia nu trece această specie înapoi |
| `dup_species` | aceeași specie apare de două ori |
| `count_mismatch` | numărul nu se potrivește cu numărul de specii |
| `review_missing` | un pachet verificat are nevoie de verificator și de data verificării |
| `photo_budget` | fotografiile sunt prea mari împreună (limita este 3 MB) |
| `format` | nu este un fișier vietar-pack (format sau versiune greșită) |
| `species_unknown` | specia nu se află în listă |

| Cod | Îl raportează doar scripturile |
| --- | --- |
| `json` | fișierul nu este JSON valid |
| `schema` | fișierul nu respectă schema (`scripts/validate.py` spune unde) |
| `file_name` | numele fișierului nu este id-ul lui |
| `species_orphan` | un fișier de specie nu este în niciun pachet |
| `dist_missing` | un pachet nu are fișier asamblat în `data/dist/` |
| `dist_stale` | un fișier asamblat diferă de ce ar scrie `node scripts/pack.mjs` sau nu are manifest |
