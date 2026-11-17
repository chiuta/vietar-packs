# Come contribuire — VietAR Packs

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · **Italiano** · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versione: 0.2.0 · Ultimo aggiornamento: 2026-11-17

1. Fai un fork di questo repository.
2. Crea o amplia un pacchetto: nella pagina usa la scheda «Crea» e scarica il file, oppure scrivi a mano file `data/species/<nome-latino>.json` (vedi `docs/pack-format.md`).
3. Trasforma un pacchetto scaricato in file con `node scripts/pack.mjs --split vietar-pack-<id>.json`, oppure aggiungi gli id delle nuove specie al manifesto del pacchetto in `data/packs/`.
4. Esegui `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` e `node scripts/build.mjs`.
5. Apri una pull request — i contributi di dati non richiedono di programmare. Indica una fonte per ogni nome, nota e indicatore di tossicità, e non segnare mai da solo un pacchetto come rivisto (vedi `docs/review-guide.md`).

## Regole

- Una specie = un file in `data/species/`, chiamato come il suo id (il nome latino in minuscolo con trattini).
- Cita sempre una fonte.
- Contribuisci solo con materiale che puoi condividere legalmente (niente testi protetti copiati).
- Sii gentile: vedi il Codice di condotta.

## Aggiungere specie e pacchetti

1. Parti da una fonte che puoi usare: le tue conoscenze e osservazioni, oppure pagine pubbliche la cui licenza consente il riuso (annota l’indirizzo e la data). Non copiare testo da guide da campo, app o siti se la licenza non lo permette: scrivi la nota con parole tue e dillo in `source`.
2. Scrivi un nome solo in una lingua che conosci o che puoi controllare con un madrelingua o con un dizionario affidabile. L’inglese è obbligatorio; la pagina mostra prima la lingua di chi legge e l’inglese come ripiego.
3. Per piante e funghi `toxic` è obbligatorio. Scrivi `true` quando si sa che una parte della specie è velenosa e scrivi una nota di tossicità che dica qual è il pericolo. `false` significa solo che nessuno ha segnato qui la specie come tossica: non significa mai commestibile. Nel dubbio, chiedi a un esperto locale prima di scrivere `false`.
4. Indica una coppia pericolosa di sosia su entrambe le specie, con una nota di avvertimento del tipo «Le foglie possono essere confuse; la confusione ha causato gravi intossicazioni». Di’ che si confondono, mai come distinguerle: un consiglio sbagliato può uccidere.
5. Foto: tue, di pubblico dominio o con una licenza dell’elenco in `docs/pack-format.md`, ciascuna con autore, licenza e un link alla fonte; riducile con `python3 scripts/optimize.py` (WebP, al massimo 640 px, senza dati di luogo) e controlla le foto di Wikimedia Commons con `node scripts/check_licences.mjs --online`. Suoni: solo link a xeno-canto.org che hai ascoltato, con l’autore della registrazione e la licenza.
6. Un nuovo pacchetto è un `draft` (o uno `skeleton` quando mostra soltanto il formato). Solo chi ha controllato ogni specie può mettere `reviewed`, con il proprio nome e la data: vedi `docs/review-guide.md`.
7. Per saperne di più: `docs/contributor-guide.md` (comandi, file, controlli), `docs/school-class-guide.md` (una classe o un club crea un pacchetto) e `docs/pack-format.md` (ogni campo e limite).
