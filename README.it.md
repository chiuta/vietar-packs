# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versione: 0.2.1 · Ultimo aggiornamento: 2026-11-20

🌐 https://vietar-packs.chiuta.ro

> Pacchetti regionali di specie per VietAR: nomi, foto e suoni di fauna e flora locali.

Trade-free: nessun tracciamento, nessuna pubblicità, nessun account, funziona offline.

## Stato

Alfa, utilizzabile: l’unico `index.html` sfoglia, importa, controlla e crea pacchetti regionali di specie: nomi in più lingue, un indicatore di tossicità, sosia pericolosi, foto con licenza e link a suoni di xeno-canto. Contiene cinque pacchetti di partenza incorporati, con 71 specie in tutto (Romania: 19 piante e funghi, 17 uccelli e 15 mammiferi; Bulgaria e Moldavia: le stesse 10 specie diffuse ciascuna, come scheletri). Ogni pacchetto incorporato è una bozza o uno scheletro: nomi e note sono stati scritti con un assistente IA e controllati solo in parte, nessun biologo, micologo o madrelingua li ha rivisti, e non contengono ancora foto né link a suoni. La pagina non identifica nulla e non è una guida da campo: l’etichetta «Non segnalata come tossica» non significa mai che sia sicuro mangiare o toccare. L’app VietAR non può ancora importare questi pacchetti.

## Cosa fa

- «Sfoglia»: scegli un pacchetto, cerca per un nome in qualsiasi lingua o per il nome latino (maiuscole e accenti non contano), filtra per gruppo e per indicatore di tossicità, e apri una specie: i suoi nomi (nella lingua della pagina, con l’inglese come ripiego), l’indicatore e la nota di tossicità, le note, la fonte, le specie con cui viene spesso confusa (ognuna è un link), le foto e i link ai suoni. Un riquadro rosso di sicurezza resta visibile in ogni scheda e dice che cosa la pagina non è.
- «Pacchetti»: i pacchetti incorporati e quelli che importi (incolla il JSON o scegli un file; al massimo 12 alla volta), ciascuno con regione, versione, licenza, autori, un’etichetta di stato onesta («Scheletro», «Bozza», «Rivisto») e il numero di specie per gruppo; scarica qualsiasi pacchetto o rimuovi quelli importati. Un pacchetto viene controllato per intero prima di essere aggiunto: se qualcosa non va, non si importa nulla e vedi che cosa correggere.
- «Crea»: crea un pacchetto per una classe, un club naturalistico o una regione: compila il pacchetto, aggiungi le specie una per una (fino a 400), collega i sosia nei due sensi, controlla il pacchetto con le stesse regole del repository e scarica il file. La bozza resta in questo browser mentre lavori. Un pacchetto fatto qui non può mai essere segnato come rivisto; foto e suoni si aggiungono tramite il JSON della specie.
- «Guida»: come usare la pagina e un esempio di specie con una foto e un suono.
- Formato: un file JSON per specie in `data/species/`, un manifesto per pacchetto in `data/packs/`, assemblati in pacchetti completi (formato `vietar-pack`) in `data/dist/`; descritti da `schema.json` e `pack.schema.json` e spiegati in `docs/pack-format.md`.
- Strumenti per chi contribuisce: `scripts/pack.mjs` (assembla i pacchetti e divide in file un pacchetto scaricato), `scripts/validate.py`, `scripts/optimize.py` (una foto in WebP di al massimo 640 px, senza metadati), `scripts/check_licences.mjs` (licenze delle foto, online con `--online`). L’interfaccia è in otto lingue e funziona con la tastiera e con uno screen reader.
- Installabile come app e disponibile offline dopo la prima visita quando è servita via HTTPS (un service worker conserva la pagina; nient’altro viene memorizzato o inviato). Aperta da un file scaricato funziona allo stesso modo, senza installazione.

## Come funziona

- Un file di specie e un manifesto (l’elenco degli id delle specie e il loro numero) diventano un pacchetto completo: `node scripts/pack.mjs` lo scrive in `data/dist/<id>.json`. La pagina incorpora `data/dist/`, quindi ciò che sfogli è esattamente ciò che scarichi.
- `schema.json` e `pack.schema.json` descrivono i file; `scripts/validate.py` li applica, insieme alle regole che uno schema non può dire: il nome del file, l’id e il nome latino coincidono, il gruppo è coerente con il regno, piante e funghi dicono se sono tossici, una specie tossica ha una nota di tossicità, i sosia si indicano a vicenda, le foto stanno entro 3 MB, un pacchetto rivisto indica chi l’ha rivisto e la data. `src/engine.mjs` applica le stesse regole nella pagina; i test confrontano le due implementazioni.
- Sicura per costruzione: il testo di un pacchetto è sempre mostrato come testo, mai come HTML; i link aprono solo indirizzi `https://`; la pagina non fa alcuna richiesta di rete (le foto sono incorporate, i suoni sono link che aprono xeno-canto.org in una nuova scheda); un pacchetto importato e lo stato salvato vengono ricontrollati al caricamento della pagina, quindi uno danneggiato o ostile viene rifiutato, non creduto.
- `src/ui.js`, `src/i18n.mjs` e `src/app.css` sono l’interfaccia; `scripts/build.mjs` costruisce l’unico `index.html` da `src/` e incorpora i pacchetti di `data/dist/`; `node scripts/build.mjs --check` fallisce se la pagina non è aggiornata.
- Test: `npm test` (motore, parità con il validatore, script, verifica delle licenze, ottimizzatore di foto, documentazione) e test del browser nell’hub (otto lingue, accessibilità, importazioni ostili, limiti, archivio pieno). Lo sviluppo richiede Node.js 24 o più recente e Python 3 con `jsonschema` (Pillow solo per l’ottimizzatore di foto); la pagina stessa richiede un browser che conosca ES2017.
- `manifest.webmanifest`, `sw.js` e le icone sono prodotti da `node scripts/build.mjs` tramite il kit comune (sezione `pwa` di `src/app.json`); anche `--check` li verifica, e `npm test` controlla che il manifest, la versione del service worker e la CSP corrispondano alla pagina.

## Limiti onesti

- I pacchetti incorporati sono bozze: nomi e note sono stati scritti con un assistente IA da conoscenze generali e verificati solo in parte su pagine pubbliche. Nessun biologo, micologo o madrelingua li ha rivisti. I pacchetti bulgaro e moldavo sono scheletri di 10 specie ciascuno.
- «Non segnalata come tossica» significa solo che nessuno ha segnato la specie come tossica in questo pacchetto. Non è mai l’affermazione che una pianta o un fungo sia commestibile o sicuro, e i pacchetti non insegnano a distinguere i sosia. Non mangiare mai una pianta o un fungo selvatico per via di questa pagina.
- I pacchetti incorporati non contengono foto né link a suoni, perché licenze e numeri delle registrazioni non si potevano verificare offline. Il formato supporta entrambi, con autore, licenza e fonte.
- I pacchetti importati qui sono conservati solo in questo browser; cancellare i dati del sito li elimina. Scarica quelli a cui tieni.
- L’app VietAR non può ancora importare questi pacchetti. Per ora i pacchetti sono letti e controllati in questa pagina e dagli script del repository.
- Le traduzioni dell’interfaccia sono state scritte da una macchina e non sono state riviste da madrelingua. Nomi e note delle specie compaiono nella lingua del pacchetto, con l’inglese come ripiego.

## Contribuisci in 5 minuti

1. Fai un fork di questo repository.
2. Crea o amplia un pacchetto: nella pagina usa la scheda «Crea» e scarica il file, oppure scrivi a mano file `data/species/<nome-latino>.json` (vedi `docs/pack-format.md`).
3. Trasforma un pacchetto scaricato in file con `node scripts/pack.mjs --split vietar-pack-<id>.json`, oppure aggiungi gli id delle nuove specie al manifesto del pacchetto in `data/packs/`.
4. Esegui `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` e `node scripts/build.mjs`.
5. Apri una pull request — i contributi di dati non richiedono di programmare. Indica una fonte per ogni nome, nota e indicatore di tossicità, e non segnare mai da solo un pacchetto come rivisto (vedi `docs/review-guide.md`).

## Buone prime attività

Vedi `ISSUES_GOOD_FIRST.md` per attività già pronte.

## Licenza

Codice: MIT. Dati: ogni pacchetto indica la propria licenza (CC0-1.0, CC-BY-4.0 o CC-BY-SA-4.0); i pacchetti incorporati sono CC0-1.0. Foto e suoni mantengono le proprie licenze: ciascuno indica autore, licenza e fonte. Dati contribuiti: indica la fonte; sono pubblicati con la licenza del pacchetto a cui si aggiungono.

## Supporto

Se il progetto ti è utile, puoi [offrirmi un caffè](https://buymeacoffee.com/echo.of.the.strings).
