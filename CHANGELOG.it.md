# Registro delle modifiche

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · **Italiano** · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Non rilasciato]

## [0.2.1] - 2026-11-20

### Aggiunto
- `scripts/check_licences.mjs --api URL`: un altro endpoint MediaWiki al posto di Commons; il test CLI «senza rete» usa ora una porta locale chiusa e non dipende più dalla disponibilità di Internet sulla macchina.

### Modificato
- fff-kit 1.8.1: quando il browser blocca l’archiviazione o ne è privo (`localStorage`/`sessionStorage` generano un errore o mancano), la pagina si avvia con un’archiviazione temporanea in memoria invece di fermarsi; i dati non vengono conservati dopo la chiusura della pagina.
- fff-kit 1.8.1: la guida che ingrandisce i controlli piccoli a 44 px misura ora anche la larghezza del corpo della pagina e dell’elemento genitore, quindi una riga di pulsanti non può più uscire dallo schermo (il gruppo resta intatto quando l’ingrandimento lo renderebbe troppo largo).

## [0.2.0] - 2026-11-17

### Aggiunto
- La pagina: le schede «Sfoglia», «Pacchetti», «Crea» e «Guida» in otto lingue, con un riquadro rosso di sicurezza sempre visibile, scorciatoie da tastiera e supporto per gli screen reader.
- Il visualizzatore: ricerca in qualsiasi lingua (maiuscole e accenti ignorati), filtri per gruppo e indicatore di tossicità, schede di specie con nomi, indicatore e nota di tossicità, note, fonte, sosia (come link), foto e link ai suoni; «Non segnalata come tossica» non appare mai in verde e porta sempre un avvertimento.
- Pacchetti: importazione (incollata o da file, controllata per intero prima di aggiungere qualcosa), download, rimozione e sostituzione per id; numero di specie per gruppo; etichette di stato oneste («Scheletro», «Bozza», «Rivisto») con il loro significato.
- Il creatore: un modulo del pacchetto, un modulo della specie con nomi in più lingue, indicatore e note di tossicità, sosia collegati nei due sensi, un editor JSON per foto e suoni, un controllo, un download e una bozza conservata nel browser (con un avviso quando il browser non ha più spazio).
- Il formato dei pacchetti: `schema.json` (una specie), `pack.schema.json` (un manifesto), pacchetti assemblati in `data/dist/` (formato `vietar-pack`, versione 1) e `data/dist/example.json` come esempio di formato.
- Cinque pacchetti di partenza incorporati, con 71 specie: Romania (19 piante e funghi, 17 uccelli, 15 mammiferi) e scheletri per Bulgaria e Moldavia (le stesse 10 specie ciascuno); bozze scritte con un assistente IA e controllate solo in parte, senza foto né link a suoni.
- `scripts/pack.mjs` (assemblaggio, `--check`, `--split`), `scripts/validate.py` (le stesse regole della pagina, per ogni file e ogni pacchetto assemblato), `scripts/optimize.py` (foto) e `scripts/check_licences.mjs` (licenza e autore delle foto; `--online` interroga Wikimedia Commons).
- Guide in inglese e rumeno: `docs/pack-format.md`, `docs/school-class-guide.md`, `docs/contributor-guide.md` e `docs/review-guide.md`.
- `src/` e `scripts/build.mjs`: l’unico `index.html` ora si costruisce dai sorgenti, con i pacchetti di `data/dist/` incorporati, e `--check` lo verifica.
- Test: `npm test` e test del browser nell’hub.
- ISSUES_GOOD_FIRST e CODE_OF_CONDUCT tradotti in tutte e otto le lingue.
- README in inglese, rumeno, francese, italiano, spagnolo, portoghese, tedesco e ungherese: sezioni di stato e di ambito previsto (derivate da `ISSUES_GOOD_FIRST.md`).
- Installabile (PWA): `manifest.webmanifest`, `sw.js` e le icone sono generati dal kit comune (`fff-kit/pwa`); la pagina funziona offline dopo la prima visita via HTTPS.

### Modificato
- Il workflow gira su Ubuntu 26.04 e Node.js 26, ed esegue il controllo dei pacchetti, il validatore, i test e il controllo della costruzione.
- I dati sono ora un file per specie e un manifesto per pacchetto (`data/species/`, `data/packs/`), assemblati in `data/dist/`; `data/species/example.json` è sostituito da `data/dist/example.json`, e `scripts/validate.py`, i passi del README e i modelli sono cambiati di conseguenza.
- L’elenco dei «good first issues» contiene ora ciò che resta da fare (più specie, revisione di esperti, foto, suoni, traduzioni); la specifica del formato, il campo dei sosia, l’ottimizzatore di foto, il verificatore di licenze e la guida per le classi, che elencava prima, esistono.

## [0.1.0] - 2026-11-13

### Aggiunto
- Scheletro iniziale: struttura, schema dei dati o primi esempi, guide al contributo in otto lingue.
