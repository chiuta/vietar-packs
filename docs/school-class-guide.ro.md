# O clasă de școală face un pachet local · VietAR Packs

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17 · [English](school-class-guide.md)

Acest ghid este pentru un profesor sau conducătorul unui club de natură. O clasă face un pachet cu plantele, animalele și ciupercile unui loc din apropierea școlii (o curte de școală, un parc, un pârâu), învață cum se numesc în mai multe limbi și învață de ce un pachet este bun doar cât sunt de bune sursele lui. Nu e nevoie de programare: ajunge un calculator cu un browser.

**Siguranța înainte de orice.** Un pachet este o listă de nume. Nu învață pe nimeni să recunoască o plantă sau o ciupercă și nimeni nu trebuie să guste, să mănânce sau să atingă o plantă ori o ciupercă din natură din cauza lui: multe specii cu aspect nevinovat au sosii mortale. Un pachet făcut de o clasă este o ciornă pe care niciun specialist n-a verificat-o.

## 1. Înainte de prima oră

- Alegeți locul și mărimea. Zece până la treizeci de specii sunt un bun prim pachet; creatorul primește până la 400.
- Alegeți id-ul pachetului: un cod de țară, o cratimă și un nume scurt, cu litere mici, numai litere și cifre (`ro-school-park`). Nu se poate schimba fără a face un pachet nou.
- Dați roluri: observatori care notează doar ce au văzut cu adevărat, scriitori care completează pagina, verificatori care caută fiecare nume într-o carte și profesorul, care răspunde de marcajele de toxicitate împreună cu un specialist.
- Hotărâți sursele. O floră, un ghid de teren sau pagina unui centru antiotravă sunt surse de citit, nu texte de copiat: clasa își scrie propriile note și spune de unde vin faptele.
- Protejați elevii. Treceți la autori numele clasei sau al școlii, nu numele întregi ale copiilor, decât dacă părinții sunt de acord. Nu adăugați fotografii cu persoane și nici date despre loc.

## 2. Fișa de observație

Tipăriți câte o fișă pe specie. Elevii o completează afară, iar scriitorii o copiază în pagină:

```
Numele latinesc:
Nume (engleză, limba noastră, altele):
Plantă, animal sau ciupercă?
Unde și când am văzut-o:
De unde vine numele (carte și pagină):
Toxică? Întreabă profesorul; scrie sursa:
```

## 3. În pagină, pas cu pas

1. Deschideți pagina și fila «Creare». Completați «Pachetul»: id-ul, titlul în engleză (și, dacă doriți, în limba voastră, cu codul ei), regiunea (două litere mari, de exemplu `RO`), versiunea, licența și autorii. Starea rămâne «Ciornă»: creatorul nu poate pune «Verificat». Licența `CC0-1.0` lasă pe oricine să refolosească pachetul fără condiții; `CC-BY-4.0` îi cere să numească autorii.
2. Adăugați câte o specie sub «Adaugă sau modifică o specie»: numele latinesc (pagina face id-ul din el), regnul și grupul, numele în limbile pe care le știți și o sursă. Apăsați «Adaugă specia».
3. La plante și ciuperci trebuie să răspundeți la «Toxică?». Răspundeți «Nu: nemarcată toxică» numai când o sursă de încredere spune că specia nu se știe a fi otrăvitoare; chiar și atunci pagina va arăta «Nemarcată toxică», ceea ce nu e același lucru cu comestibilă. Când nu poate spune nimeni, lăsați specia pe mai târziu: un pachet poate conține doar specii al căror marcaj l-a putut verifica cineva.
4. La o specie marcată toxică scrieți nota despre toxicitate: ce pericol există, cu cuvintele voastre, dintr-o sursă de încredere.
5. Legați sosiile numai cu ajutorul profesorului sau al unui specialist și numai perechile pe care oamenii le confundă cu adevărat. Sub «Sosii» alegeți cele două specii, scrieți un avertisment de felul „Frunzele pot fi confundate. Confuzia a provocat intoxicații grave.” și apăsați «Leagă-le». Pagina salvează legătura la ambele specii. Nu scrieți niciodată cum se deosebesc.
6. Sub «Verificare și descărcare» corectați fiecare problemă listată de pagină (fiecare spune unde e), apoi apăsați «Descarcă pachetul». Fișierul se numește `vietar-pack-<id>.json`.
7. Ciorna se păstrează în acest browser, pe acest calculator, cât lucrați. Descărcați pachetul la sfârșitul fiecărei ore. Creatorul nu poate deschide din nou un fișier descărcat, așa că continuați pe același calculator și în același browser sau dați fișierul unui administrator (vezi secțiunea 6).
8. Ca să folosiți pachetul la clasă, apăsați «Adaugă la pachetele mele de aici»: apare în fila «Pachete» și în «Răsfoire». Pe alt calculator folosiți fila «Pachete» → «Importă» cu fișierul descărcat.

## 4. Fotografii și sunete (opțional)

- Folosiți numai fotografii făcute chiar de elevi plantelor și animalelor (niciodată persoanelor) sau fotografii din domeniul public ori cu o licență din lista din `docs/pack-format.md`. Numiți autorul, licența și sursa fiecărei fotografii.
- Micșorați o fotografie și scoateți-i datele despre loc cu `python3 scripts/optimize.py` (elevii mai mari sau profesorul; vezi `docs/contributor-guide.md`), apoi adăugați-o prin caseta «Această specie ca JSON (pentru fotografii și sunete)» și apăsați «Aplică JSON-ul».
- Un sunet este doar o legătură către o înregistrare de pe xeno-canto.org pe care cineva a ascultat-o, cu numele celui care a înregistrat și licența.

## 5. Cereți unui specialist să se uite

Rugați un profesor de biologie, un pădurar, un custode al unei rezervații, o societate botanică sau micologică ori un centru antiotravă să citească pachetul în fila «Răsfoire» și să spună ce nu e în regulă. Spuneți-le limpede că este o ciornă făcută de o clasă. Doar un revizor care a verificat fiecare specie poate marca un pachet ca verificat, și nu în creator: vezi `docs/review-guide.md`.

## 6. Trimiteți-l proiectului (opțional)

Deschideți un issue cu șablonul „New species, pack, photo or sound” și atașați fișierul descărcat sau trimiteți un pull request. Un administrator verifică fișierul, îl transformă în fișiere de specii (`node scripts/pack.mjs --split`) și cere o revizuire înainte ca el să poată intra printre pachetele incluse. Până atunci pachetul rămâne o ciornă și îl folosește doar clasa voastră.

## 7. Ce să le spuneți elevilor

- Pachetul listează nume; nu spune ce este sigur.
- Nu gustați, nu culegeți ca să mâncați și nu atingeți o plantă sau o ciupercă din natură din cauza unei aplicații, a unei fotografii sau a unei liste. Întrebați un specialist care poate vedea planta adevărată.
- «Nemarcată toxică» înseamnă doar că nimeni n-a marcat-o. Nu înseamnă niciodată că e sigur s-o mănânci sau s-o atingi.
- Un nume în limba noastră este bun doar cât este cartea din care vine. Dacă două cărți nu se potrivesc, notați-le pe amândouă.

## 8. Limitele creatorului

- O ciornă pe browser; se pierde dacă se șterg datele site-ului, iar pagina vă avertizează când browserul nu mai are loc.
- O ciornă are cel mult 400 de specii, iar o specie cel mult 8 sosii.
- Un fișier descărcat nu poate fi deschis din nou în creator.
- Fotografiile și sunetele se adaugă numai prin JSON-ul unei specii.
- Traducerile interfeței au fost scrise de o mașină și nu au fost revizuite de vorbitori nativi.
