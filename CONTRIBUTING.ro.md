# Cum contribui — VietAR Packs

[English](CONTRIBUTING.md) · **Română** · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17

1. Fă un fork al acestui depozit.
2. Fă sau extinde un pachet: în pagină folosește fila «Creare» și descarcă fișierul, sau scrie de mână fișiere `data/species/<nume-latinesc>.json` (vezi `docs/pack-format.md`).
3. Transformă un pachet descărcat în fișiere cu `node scripts/pack.mjs --split vietar-pack-<id>.json` sau treci id-urile noilor specii în manifestul pachetului din `data/packs/`.
4. Rulează `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` și `node scripts/build.mjs`.
5. Deschide un pull request — contribuțiile de date nu cer programare. Dă o sursă pentru fiecare nume, notă și marcaj de toxicitate și nu marca niciodată singur un pachet ca revizuit (vezi `docs/review-guide.md`).

## Reguli

- O specie = un fișier în `data/species/`, numit după id-ul ei (numele latinesc cu litere mici și cratime).
- Citează întotdeauna o sursă.
- Contribuie doar cu material pe care ai voie să-l partajezi (fără texte copiate protejate de drepturi de autor).
- Fii amabil: vezi Codul de conduită.

## Adăugarea de specii și pachete

1. Pornește de la o sursă pe care ai voie s-o folosești: cunoștințele și observațiile tale sau pagini publice a căror licență permite reutilizarea (notează adresa și data). Nu copia text din ghiduri de teren, aplicații sau site-uri decât dacă licența o permite: scrie nota cu cuvintele tale și spune asta în `source`.
2. Scrie un nume doar într-o limbă pe care o cunoști sau pe care o poți verifica cu un vorbitor nativ sau cu un dicționar de încredere. Engleza este obligatorie; pagina arată întâi limba cititorului și engleza ca rezervă.
3. La plante și ciuperci `toxic` este obligatoriu. Scrie `true` când se știe că vreo parte a speciei este otrăvitoare și scrie o notă despre toxicitate care spune ce pericol există. `false` înseamnă doar că nimeni n-a marcat aici specia ca toxică: nu înseamnă niciodată comestibilă. La îndoială, întreabă un specialist local înainte să scrii `false`.
4. Notează o pereche periculoasă de sosii pe ambele specii, cu o notă de avertizare de felul „Frunzele pot fi confundate; confuzia a provocat intoxicații grave”. Spune că se confundă, niciodată cum se deosebesc: un sfat greșit poate ucide.
5. Fotografii: ale tale, din domeniul public sau cu o licență din lista din `docs/pack-format.md`, fiecare cu autorul, licența și o legătură către sursă; micșorează-le cu `python3 scripts/optimize.py` (WebP, cel mult 640 px, fără date despre loc) și verifică fotografiile din Wikimedia Commons cu `node scripts/check_licences.mjs --online`. Sunete: doar legături către xeno-canto.org pe care le-ai ascultat, cu autorul înregistrării și licența.
6. Un pachet nou este `draft` (sau `skeleton`, când doar arată formatul). Doar un revizor care a verificat fiecare specie poate pune `reviewed`, cu numele lui și data: vezi `docs/review-guide.md`.
7. Mai mult: `docs/contributor-guide.md` (comenzi, fișiere, verificări), `docs/school-class-guide.md` (o clasă sau un club face un pachet) și `docs/pack-format.md` (fiecare câmp și limită).
