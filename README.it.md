# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versione: 0.1.0 · Ultimo aggiornamento: 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Pacchetti regionali di specie per VietAR: nomi, foto e suoni di fauna e flora locali.

Trade-free: nessun tracciamento, nessuna pubblicità, nessun account, funziona offline.

## Stato

Alpha: il repository contiene la struttura, lo schema dati o i primi esempi e le guide al contributo. L’ambito qui sotto è il piano, non ciò che funziona oggi.

## Ambito previsto

- Una specifica del formato di pacchetto: un manifest `pack.json` con regione, versione e numero di specie.
- Pacchetti di specie per la Romania: circa 30 mammiferi dei Carpazi con nomi in en/ro/hu/de, circa 50 uccelli comuni con link audio (Xeno-canto, CC-BY) e circa 40 piante e funghi selvatici con un indicatore `toxic`.
- Scheletri di pacchetti per Bulgaria e Moldavia, con 20 specie ciascuno.
- Un campo `look-alike` che collega coppie di specie pericolose.
- Strumenti: un verificatore di licenze fotografiche tramite l’API di Wikimedia Commons, un ottimizzatore di immagini (WebP, max 640 px) e una guida perché una classe scolastica aggiunga un pacchetto locale.

Nulla di tutto ciò è ancora implementato: ogni voce è un compito pronto in `ISSUES_GOOD_FIRST.md`.

## Contribuisci in 5 minuti

1. Fai il fork di questo repository.
2. Copia `data/species/example.json` in `data/species/` e modificalo.
3. Esegui `python scripts/validate.py`.
4. Apri una pull request: per i dati non serve programmare.

## Buone prime attività

Vedi `ISSUES_GOOD_FIRST.md` per attività già pronte.

## Licenza

Codice: MIT. Dati contribuiti: indica la fonte; sono pubblicati con la stessa licenza salvo diversa indicazione.

## Supporto

Se il progetto ti è utile, puoi [offrirmi un caffè](https://buymeacoffee.com/echo.of.the.strings).
