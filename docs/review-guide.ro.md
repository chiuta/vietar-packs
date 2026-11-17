# Ghid de revizuire · VietAR Packs

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17 · [English](review-guide.md)

Acest ghid este pentru cel care revizuiește un pachet ca acesta să poată fi marcat «Verificat» și pentru oricine vrea să știe ce promite acest cuvânt. Pachetele incluse sunt astăzi ciorne: niciun specialist nu le-a verificat, iar acest ghid arată cum se schimbă asta.

## 1. Ce înseamnă «Verificat»

Un pachet marcat `reviewed` spune că o persoană numită, cu cunoștințele potrivite, a verificat fiecare specie a pachetului, la o dată anume, pe baza unor surse de încredere, și a corectat sau a scos ce nu era în regulă. Pagina arată atunci cine l-a verificat și când și adaugă că o verificare tot nu este o garanție.

Nu înseamnă că pachetul este complet, că poate recunoaște orice sau că speciile marcate «Nemarcată toxică» sunt sigure de mâncat ori de atins. Nu înlocuiește niciodată un specialist local care ține în mână planta sau ciuperca adevărată.

## 2. Cine poate verifica

- Plante și arbori: un botanist, un inginer silvic sau cineva care lucrează cu flora regiunii.
- Ciuperci: un micolog sau un membru cu experiență al unei societăți micologice. Marcajele de toxicitate și sosiile ciupercilor cer și o a doua persoană, pentru că o greșeală poate fi fatală.
- Animale: un zoolog, un ornitolog sau un pădurar.
- Nume într-o limbă: un vorbitor nativ poate verifica numele din limba lui, dar nu marcajele de toxicitate.
- Marcaje și note de toxicitate: o persoană cu expertiză în toxicologie sau în grupul respectiv ori informațiile publicate ale unui centru antiotravă.

Nimeni nu își verifică propria muncă: cel care a scris o specie nu poate fi singurul care o verifică.

## 3. Ce se verifică la fiecare specie

1. Numele latinesc este valid și actual (verificați într-o listă recunoscută sau într-o floră și notați care) și regnul și grupul sunt corecte.
2. Fiecare nume este un nume pe care oamenii îl folosesc cu adevărat pentru această specie în limba respectivă. Un nume care aparține altei specii se scoate.
3. Marcajul de toxicitate. `true` numai când o sursă de încredere spune așa. `false` numai când o sursă de încredere spune că specia nu se știe a fi otrăvitoare, și întrebați-vă dacă un cititor ar putea înțelege „sigur”. Nicio plantă și nicio ciupercă nu rămâne fără marcaj.
4. Nota de toxicitate spune care este pericolul (ce parte, ce efect) și nici nu îl exagerează, nici nu îl minimalizează.
5. Sosiile. Sunt trecute perechile periculoase cunoscute, pe ambele specii? Fiecare notă avertizează fără să învețe cum se deosebesc cele două?
6. Notele și sursa: faptele sunt corecte, sursele sunt numite și niciun text nu e copiat dintr-o sursă care nu permite asta.
7. Fiecare fotografie arată această specie, iar autorul, licența și sursa ei sunt corecte (`node scripts/check_licences.mjs --online` pentru fotografiile de pe Commons). Fără persoane, fără date despre loc.
8. Fiecare sunet este o înregistrare a acestei specii (ascultați-l), iar cel care a înregistrat și licența se potrivesc cu xeno-canto.

## 4. Ce se verifică la pachet

Titlul, regiunea, descrierea (nu trebuie să promită mai mult decât conține pachetul), licența (datele pot fi partajate sub ea), autorii, versiunea și numărul de specii. Un pachet nu conține specii pe care nimeni nu le-a putut verifica: scoateți-le sau lăsați pachetul ciornă.

## 5. Înregistrarea

Scrieți înregistrarea în pull request; șablonul are aceleași câmpuri (în engleză, ca și șablonul; completați-le în limba voastră):

```
Reviewer: <name>, <expertise>, <institution or club>
Pack: <pack id>, version <x.y.z>
Species checked: <N> of <N>, one by one
Sources: <flora, checklist, poison centre, dictionary …>
Toxic flags and look-alikes: checked by <name>, expertise <…>
Differences found and fixed: <none | list>
Not checked: <…>
```

Apoi puneți în manifestul pachetului: `status` pe `reviewed`, `reviewed_by` pe nume și expertiză (cel mult 120 de caractere), `reviewed_on` pe dată, o `version` și un `updated` noi. Pagina și `scripts/validate.py` refuză un pachet `reviewed` fără verificator și fără dată.

## 6. După verificare

O verificare acoperă speciile și textele așa cum erau la data ei. Dacă cineva schimbă mai târziu o specie a pachetului (un nume, un marcaj, o notă, o sosie, o fotografie) sau adaugă una, pachetul se întoarce la `draft` până când un revizor verifică schimbarea. Pagina nu poate ști ce s-a schimbat de la verificare, așa că cei care întrețin pachetul păstrează această regulă. Verificați din nou un pachet când se schimbă sursele și, oricum, la câțiva ani: numele și notele pot deveni greșite.

## 7. Dacă găsiți un pericol

Dacă găsiți un marcaj de toxicitate greșit sau o sosie periculoasă care lipsește, spuneți imediat celor care întrețin proiectul, într-un issue cu titlul „Safety: …”, înainte să terminați restul verificării. Un pachet cu un marcaj greșit cunoscut se pune înapoi pe `draft` până când este corectat.
