# VietAR Packs

[English](README.md) · **Română** · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versiune: 0.1.0 · Ultima actualizare: 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Pachete regionale de specii pentru VietAR: nume, fotografii și sunete ale faunei și florei locale.

Fără comerț (trade-free): fără urmărire, fără reclame, fără conturi, funcționează offline.

## Stare

Alfa: depozitul conține structura, schema de date sau primele exemple și ghidurile de contribuție. Domeniul de mai jos este planul, nu ceea ce funcționează azi.

## Domeniu planificat

- O specificație a formatului de pachet: un manifest `pack.json` cu regiune, versiune și număr de specii.
- Pachete de specii pentru România: circa 30 de mamifere din Carpați cu nume în en/ro/hu/de, circa 50 de păsări comune cu linkuri audio (Xeno-canto, CC-BY) și circa 40 de plante și ciuperci sălbatice cu un indicator `toxic`.
- Schelete de pachete pentru Bulgaria și Republica Moldova, cu câte 20 de specii.
- Un câmp `look-alike` care leagă perechile de specii periculoase.
- Unelte: un verificator de licențe foto prin API-ul Wikimedia Commons, un optimizator de imagini (WebP, maximum 640 px) și un ghid prin care o clasă de școală adaugă un pachet local.

Nimic din asta nu este implementat încă: fiecare punct este o sarcină gata pregătită în `ISSUES_GOOD_FIRST.md`.

## Contribuie în 5 minute

1. Fă fork acestui depozit.
2. Copiază `data/species/example.json` în `data/species/` și editează-l.
3. Rulează `python scripts/validate.py`.
4. Deschide un pull request — pentru date nu e nevoie de programare.

## Sarcini bune pentru început

Vezi `ISSUES_GOOD_FIRST.md` pentru sarcini gata pregătite.

## Licență

Cod: MIT. Datele contribuite: indică sursa; sunt publicate sub aceeași licență, dacă fișierul nu spune altfel.

## Sprijin

Dacă proiectul îți este util, poți [să-mi oferi o cafea](https://buymeacoffee.com/echo.of.the.strings).
