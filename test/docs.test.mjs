// Documentația: ghidurile, README-urile, șabloanele și fluxul de lucru spun adevărul despre cod, scheme, interfață și date.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import I18N from '../src/i18n.mjs';
import {E, ROOT, SPECIES_SCHEMA as SS, PACK_SCHEMA as PS, LYNX, clone, mkPack, pngUri} from './helpers.mjs';

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const LANGS = ['en', 'ro', 'fr', 'it', 'es', 'pt', 'de', 'hu'];
const sfx = (l) => (l === 'en' ? '' : '.' + l);
const GUIDES = ['pack-format', 'school-class-guide', 'contributor-guide', 'review-guide'];
const guide = (g, l) => read('docs/' + g + (l === 'ro' ? '.ro' : '') + '.md');
const pkg = JSON.parse(read('package.json'));
const app = JSON.parse(read('src/app.json'));
// ghilimelele cu care generatorul de documentație citează numele din interfață, pe limbi
const QU = {en: ['“', '”'], ro: ['«', '»'], fr: ['« ', ' »'], it: ['«', '»'], es: ['«', '»'], pt: ['«', '»'], de: ['„', '“'], hu: ['„', '”']};
// căi pomenite în CHANGELOG ca fișiere înlocuite (nu mai există în depozit)
const EXAMPLE_PATHS = new Set(['data/species/example.json']);
// citate din ghiduri care nu sunt nume din interfață: un avertisment dat ca exemplu, titlul unui șablon de issue, un titlu de issue, un cuvânt între ghilimele
const NOT_UI = new Set([
  'The leaves can be mistaken for each other. Confusing them has caused serious poisonings.',
  'The leaves can be mistaken for each other; confusing them has caused serious poisonings',
  'New species, pack, photo or sound', 'Safety: …', 'safe'
]);
const hasPy = (mod) => spawnSync('python3', ['-c', 'import ' + mod]).status === 0;

// Blocuri de cod, fără comentariile de la sfârșitul rândurilor (ele sunt scrise în limba ghidului).
function blocks(t) { return [...t.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)].map((m) => ({info: m[1].trim(), body: m[2].split('\n').map((l) => l.replace(/\s+#.*$/, '')).join('\n')})); }
const noCode = (t) => t.replace(/```[\s\S]*?```/g, '');
const h2 = (t) => (t.match(/^## /gm) || []).length;
// numerele dintr-un text, cu separatorul miilor eliminat (1,000 · 1 000 · 1.000)
const numbers = (t) => [...t.replace(/(\d)[ ,.  ](?=\d{3}(?!\d))/g, '$1').matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// în ghidul în română se traduc textele dintre ghilimele duble dintr-o comandă (titlul, descrierea), locurile de completat («<id-pachet>») și limba (--lang)
const norm = (t) => t.replace(/"[^"\n]*"/g, '""').replace(/<[^<>\n]*>/g, '<>').replace(/--lang [a-z]{2,3}/g, '--lang xx');
const isCommandBlock = (b) => b.body.split('\n').filter(Boolean).every((l) => /^(node|python3|npm|pip|sha256sum|\s+--)/.test(l));
const marks = (l) => (l.match(/</g) || []).length;
const isJsonBlock = (b) => b.info === 'json' || /^\s*[{"]/.test(b.body);
const parseBlock = (b) => { const t = b.body.trim(); return JSON.parse(t.startsWith('{') ? t : '{' + t + '}'); };
// câmpurile care sunt hărți limbă → text: în ghidul în română exemplele pot folosi altă limbă decât în cel în engleză
const LANG_MAPS = new Set(['names', 'toxic_note', 'notes', 'note', 'alt', 'title', 'description']);
/** structura unui JSON: aceleași chei și tipuri, textele înlocuite cu «s», codurile de limbă din hărți înlocuite cu numere (exemplele din ghidul în română sunt traduse) */
function shape(v, k) {
  if (Array.isArray(v)) return v.map((x) => shape(x));
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).map((x, i) => [LANG_MAPS.has(k) ? 'lang' + i : x, shape(v[x], x)]));
  return typeof v === 'string' ? 's' : v;
}
const tally = (a) => a.reduce((m, x) => { m[x] = (m[x] || 0) + 1; return m; }, {});
/** cuvintele unei comenzi de shell, cu ghilimele duble păstrate ca un singur cuvânt */
function words(cmd) { return [...cmd.matchAll(/"([^"]*)"|(\S+)/g)].map((m) => (m[1] !== undefined ? m[1] : m[2])); }
/** comenzile «node scripts/…» și «python3 scripts/…» din blocurile de cod */
function commands(t) {
  const out = [];
  for (const b of blocks(t)) for (const c of b.body.replace(/\\\n\s*/g, ' ').split('\n')) if (/^(node|python3) scripts\//.test(c.trim())) out.push(c.trim());
  return out;
}
/** rândurile unui tabel markdown care încep cu un cod între apostrofuri inverse: [[cod, text], …] */
function codeRows(t) { return [...t.matchAll(/^\| `([a-z_]+)` \| (.+) \|$/gm)].map((m) => [m[1], m[2]]); }
const manifests = () => fs.readdirSync(path.join(ROOT, 'data/packs')).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(read('data/packs/' + f)));

test('ghidurile există în engleză și română, au aceleași comenzi, aceleași secțiuni, aceeași versiune și trimit unul la altul', () => {
  for (const g of GUIDES) {
    const en = guide(g, 'en'), ro = guide(g, 'ro');
    const be = blocks(en), br = blocks(ro);
    assert.equal(be.length, br.length, g + ': numărul de blocuri de cod');
    be.forEach((x, i) => {
      const where = g + ': blocul de cod ' + (i + 1);
      assert.equal(x.info, br[i].info, where);
      if (isJsonBlock(x)) assert.deepEqual(shape(parseBlock(x)), shape(parseBlock(br[i])), g + ': structura blocului JSON ' + (i + 1));
      else if (isCommandBlock(x)) assert.deepEqual(norm(x.body), norm(br[i].body), where);
      else assert.deepEqual(x.body.split('\n').map(marks), br[i].body.split('\n').map(marks), where + ' (șablon: același număr de rânduri și de locuri de completat)');
    });
    assert.equal(h2(en), h2(ro), g + ': numărul de secțiuni');
    assert.ok(h2(en) >= 5, g + ': ' + h2(en) + ' secțiuni');
    const head = /^(Version|Versiune): (\d+\.\d+\.\d+) · (Last updated|Ultima actualizare): (\d{4}-\d{2}-\d{2}) · \[(Română|English)\]\(([a-z.-]+\.md)\)$/m;
    const a = head.exec(en), b = head.exec(ro);
    assert.ok(a && b, g + ': linia de versiune');
    assert.deepEqual([a[1], a[3], a[5], a[6]], ['Version', 'Last updated', 'Română', g + '.ro.md']);
    assert.deepEqual([b[1], b[3], b[5], b[6]], ['Versiune', 'Ultima actualizare', 'English', g + '.md']);
    assert.equal(a[2], pkg.version); assert.equal(b[2], pkg.version);
    assert.equal(a[4], app.updated); assert.equal(b[4], app.updated);
    assert.match(en, /^# .+ · VietAR Packs$/m); assert.match(ro, /^# .+ · VietAR Packs$/m);
  }
});

test('exemplele JSON din ghidul de format sunt valide în engleză și în română: specia, fotografiile și sunetele, manifestul și pachetul complet', () => {
  for (const l of ['en', 'ro']) {
    const js = blocks(guide('pack-format', l)).filter(isJsonBlock).map(parseBlock);
    assert.equal(js.length, 4, l);
    const [sp, media, man, full] = js;
    assert.deepEqual(E.validateSpecies(sp), [], l + ': specia');
    assert.equal(sp.toxic, true); assert.ok(sp.toxic_note && sp.look_alike.length === 1, l + ': specia exemplu este toxică, cu notă și cu o sosie');
    assert.equal(media.photos.length, 1); assert.equal(media.audio.length, 1);
    assert.deepEqual(E.validateSpecies(Object.assign(clone(LYNX), media)), [], l + ': fotografiile și sunetele');
    assert.deepEqual(E.validateManifest(man), [], l + ': manifestul');
    assert.equal(man.status, 'draft'); assert.equal(man.count, man.species.length);
    assert.deepEqual(E.validatePack(full), [], l + ': pachetul complet');
    assert.equal(full.format, E.FORMAT); assert.equal(full.format_version, E.FORMAT_VERSION);
    assert.equal(full.count, full.species.length);
    // cele două specii se confundă între ele, deci se arată reciproc; una este toxică și are notă, cealaltă nu este marcată toxică
    const [a, b] = full.species;
    assert.deepEqual([a.look_alike[0].id, b.look_alike[0].id], [b.id, a.id], l + ': sosiile se arată reciproc');
    assert.deepEqual([a.toxic, b.toxic].sort(), [false, true]);
    assert.ok([a, b].find((s) => s.toxic).toxic_note, l + ': nota de toxicitate');
    // un pachet «verificat» nu poate fi scris fără verificator și dată, iar creatorul din pagină nu poate produce unul
    assert.ok(E.validatePack(Object.assign(clone(full), {status: 'reviewed'})).some((p) => p.code === 'review_missing'), l);
  }
  // pachetul cu două specii din ghid se poate importa așa cum este scris
  const full = blocks(guide('pack-format', 'en')).filter(isJsonBlock).map(parseBlock)[3];
  const r = E.parseImport(JSON.stringify(full));
  assert.ok(r.pack, JSON.stringify(r));
});

test('ghidurile au aceleași numere în engleză și în română, iar limitele din ghidul de format sunt cele din motor și din scheme', () => {
  for (const g of GUIDES) assert.deepEqual(tally(numbers(guide(g, 'en'))), tally(numbers(guide(g, 'ro'))), g);
  const pf = guide('pack-format', 'en'), L = E.LIMITS;
  const sp = SS.properties, pp = PS.properties, d = SS.definitions;
  const photo = sp.photos.items.properties, audio = sp.audio.items.properties;
  const must = [
    // specia
    [d.speciesId.minLength + ' to ' + d.speciesId.maxLength + ' characters', 'id-ul speciei'], [sp.latin.minLength + ' to ' + sp.latin.maxLength + ' characters', 'numele latinesc'],
    ['at most ' + sp.names.additionalProperties.maxLength + ' characters each; `en` is required; at most ' + sp.names.maxProperties + ' languages', 'numele'],
    ['at most ' + d.map300.additionalProperties.maxLength + ' characters each: what the danger is', 'nota de toxicitate'], ['at most ' + d.map600.additionalProperties.maxLength + ' characters each; line breaks', 'notele'],
    ['at most ' + sp.source.maxLength + ' characters', 'sursa'], ['at most ' + sp.look_alike.maxItems + ' entries', 'sosiile'],
    // fotografii și sunete
    ['at most ' + sp.photos.maxItems + ' photos', 'fotografiile'], ['at most ' + fmt(photo.data.maxLength) + ' characters', 'o fotografie'], ['at most ' + d.map200.additionalProperties.maxLength + ' characters each', 'descrierea imaginii'],
    ['at most ' + photo.author.maxLength + ' characters', 'autorul'], ['at most ' + photo.source_url.maxLength + ' characters', 'adresa sursei'],
    ['at most ' + sp.audio.maxItems + ' sounds', 'sunetele'], ['at most ' + audio.recordist.maxLength + ' characters', 'cine a înregistrat'],
    // manifestul
    [pp.id.minLength + ' to ' + pp.id.maxLength + ' characters', 'id-ul pachetului'], ['at most ' + pp.title.additionalProperties.maxLength + ' characters each', 'titlul'],
    ['at most ' + pp.authors.maxItems + ' names of at most ' + pp.authors.items.maxLength + ' characters each', 'autorii'], [pp.species.minItems + ' to ' + fmt(pp.species.maxItems) + ' species ids', 'speciile'],
    ['(at most ' + pp.reviewed_by.maxLength + ' characters)', 'cine a verificat'],
    // limitele paginii
    ['an imported text of at most ' + fmt(L.import_chars) + ' characters', 'importul'], ['imported packs of at most ' + fmt(L.store_chars) + ' characters in all', 'spațiul din browser'],
    ['at most ' + L.packs + ' packs', 'pachetele importate'], ['a pack of ' + pp.species.minItems + ' to ' + fmt(pp.species.maxItems) + ' species', 'un pachet'],
    ['of at most ' + L.draft_species + ' species', 'ciorna din creator'], ['photos of at most ' + fmt(L.photo_budget) + ' characters in a pack', 'fotografiile unui pachet'], ['shows ' + L.shown + ' species at a time', 'lista']
  ];
  for (const [phrase, what] of must) assert.ok(pf.includes(phrase), 'ghidul de format nu spune «' + phrase + '» (' + what + ')');
  // aceleași numere și în ghidul în română
  const set = new Set(numbers(guide('pack-format', 'ro')));
  for (const v of [L.import_chars, L.store_chars, L.packs, L.photo_budget, L.draft_species, L.shown, photo.data.maxLength, pp.species.maxItems, sp.names.maxProperties, sp.look_alike.maxItems, sp.photos.maxItems, sp.audio.maxItems, pp.authors.maxItems]) assert.ok(set.has(String(v)), 'ghidul în română nu are numărul ' + v);
  // limitele din motor sunt cele din scripturi
  assert.equal(L.photo_budget, 3000000); assert.equal(photo.data.maxLength, 120000);
  assert.match(read('scripts/optimize.py'), /MAX_SIDE = 640/); assert.match(read('scripts/optimize.py'), /MAX_CHARS = 120000/);
  assert.match(guide('contributor-guide', 'en'), /at most 640 pixels/); assert.match(guide('contributor-guide', 'ro'), /cel mult 640 de pixeli/);
});

test('tabelele de coduri de probleme din ghidul de format sunt mesajele din interfață, în engleză și în română, iar codurile sunt cele din motor și din scripturi', () => {
  const keys = Object.keys(I18N.en).filter((k) => /^v_/.test(k)).map((k) => k.slice(2));
  for (const l of ['en', 'ro']) {
    const t = guide('pack-format', l), i = t.indexOf('\n| ', t.indexOf('## 7.'));
    const second = t.indexOf('\n| ', t.indexOf('\n\n', i) + 2);
    const both = codeRows(t.slice(i, second)), only = codeRows(t.slice(second));
    assert.deepEqual(both.map((r) => r[0]), keys, l + ': codurile din primul tabel');
    for (const [code, msg] of both) assert.equal(msg, I18N[l]['v_' + code], l + ': mesajul pentru ' + code);
    assert.deepEqual(only.map((r) => r[0]), ['json', 'schema', 'file_name', 'species_orphan', 'dist_missing', 'dist_stale'], l + ': codurile din al doilea tabel');
  }
  assert.deepEqual(keys.slice(0, E.SHAPE_CODES.length), E.SHAPE_CODES);
  // fiecare cod din primul tabel este în motor și în validatorul Python; cele din al doilea sunt doar în scripturi
  const eng = read('src/engine.mjs'), py = read('scripts/validate.py'), pk = read('scripts/pack.mjs');
  for (const c of keys.slice(E.SHAPE_CODES.length)) { assert.ok(eng.includes("'" + c + "'"), 'motorul nu are codul ' + c); assert.ok(py.includes('"' + c + '"'), 'validate.py nu are codul ' + c); }
  for (const c of ['file_name', 'species_orphan', 'dist_missing', 'dist_stale', 'schema']) { assert.ok(py.includes('"' + c + '"'), 'validate.py nu are codul ' + c); assert.ok(!eng.includes("'" + c + "'"), 'motorul nu trebuie să aibă codul ' + c); }
  assert.ok(pk.includes("code: 'json'"), 'pack.mjs nu raportează codul json');
});

test('listele din ghidul de format (regnuri, grupe, licențe, stări) sunt cele din motor, iar afirmațiile despre stare sunt adevărate', () => {
  for (const l of ['en', 'ro']) {
    const t = guide('pack-format', l);
    for (const k of E.KINGDOMS) assert.ok(t.includes('`' + k + '`'), l + ': regnul ' + k);
    for (const g of Object.values(E.GROUPS).flat()) assert.ok(t.includes('`' + g + '`'), l + ': grupa ' + g);
    for (const c of E.PHOTO_LICENCES) assert.ok(t.includes('`' + c + '`'), l + ': licența fotografiei ' + c);
    for (const c of E.PACK_LICENCES) assert.ok(t.includes('`' + c + '`'), l + ': licența pachetului ' + c);
    for (const s of E.STATUSES) assert.ok(t.includes('`' + s + '`'), l + ': starea ' + s);
    assert.ok(t.includes('`CC-BY-NC-SA-4.0`'), l + ': exemplul de licență pentru sunete'); assert.ok(E.AUDIO_LICENCES.includes('CC-BY-NC-SA-4.0'));
    // numele stărilor din interfață sunt citate lângă codul stării
    for (const [s, k] of [['skeleton', 'st_skeleton'], ['draft', 'st_draft'], ['reviewed', 'st_reviewed']]) assert.ok(t.includes('`' + s + '` (' + QU[l][0] + I18N[l][k] + QU[l][1] + ')'), l + ': ' + k);
  }
  // creatorul din pagină nu poate produce un pachet verificat: nici dacă ciorna ar spune «reviewed», nu are cine și când a verificat
  const d = E.newDraft();
  Object.assign(d.meta, {id: 'xx-test', title_en: 'T', region: 'XX', status: 'reviewed'});
  d.species = [clone(LYNX)];
  assert.ok(E.draftToPack(d, '2026-11-17').problems.some((p) => p.code === 'review_missing'));
  // pachetele incluse sunt ciorne sau schelete: README și ghidul de verificare spun că niciun specialist nu le-a verificat
  for (const m of manifests()) assert.ok(['draft', 'skeleton'].includes(m.status), m.id + ' este «' + m.status + '»; actualizați README și ghidul de verificare înainte să marcați un pachet verificat');
  for (const m of manifests()) assert.equal(m.licence, 'CC0-1.0', m.id);
  // un pachet verificat are nevoie de verificator și de dată; cu ele este valid
  const ok = mkPack({status: 'reviewed', reviewed_by: 'A. Botanist, botanist', reviewed_on: '2026-11-17'});
  assert.deepEqual(E.validatePack(ok), []);
  assert.ok(E.validatePack(Object.assign(clone(ok), {reviewed_by: 'x'.repeat(PS.properties.reviewed_by.maxLength + 1)})).length);
});

test('comenzile din ghiduri există și își folosesc opțiunile reale, iar scripturile și comenzile npm descrise în ghidul de contribuție sunt toate cele din depozit', () => {
  const cmds = [];
  for (const g of GUIDES) for (const l of ['en', 'ro']) for (const c of commands(guide(g, l))) cmds.push({g, l, c});
  assert.ok(cmds.length >= 20, cmds.length + ' comenzi');
  for (const {g, l, c} of cmds) {
    const w = words(c);
    const script = w[1];
    assert.ok(exists(script), g + '/' + l + ': lipsește ' + script);
    const src = read(script);
    for (const o of w.filter((x) => /^--[a-z-]+$/.test(x))) assert.ok(src.includes(o), g + '/' + l + ': opțiunea ' + o + ' nu există în ' + script);
  }
  // opțiunile pomenite în text, între apostrofuri inverse, există în cel puțin un script
  const allScripts = fs.readdirSync(path.join(ROOT, 'scripts')).map((f) => read('scripts/' + f)).join('\n');
  let nOpts = 0;
  for (const g of GUIDES) for (const l of ['en', 'ro']) for (const m of noCode(guide(g, l)).matchAll(/`(--[a-z-]+)`/g)) { nOpts++; assert.ok(allScripts.includes(m[1]), g + '/' + l + ': opțiunea ' + m[1] + ' nu există în niciun script'); }
  assert.ok(nOpts >= 2, nOpts + ' opțiuni în text');
  // comenzile npm pomenite în ghiduri sunt în package.json (ghidurile spun că nu e nevoie de «npm install»)
  for (const g of GUIDES) for (const l of ['en', 'ro']) for (const m of guide(g, l).matchAll(/`npm (?:run )?([a-z]+)`/g)) if (m[1] !== 'install') assert.ok(pkg.scripts[m[1]], g + '/' + l + ': npm ' + m[1]);
  assert.ok(!pkg.dependencies && !pkg.devDependencies, 'ghidurile spun că nu e nevoie de npm install');
  assert.equal(pkg.scripts.check, 'node scripts/pack.mjs --check && python3 scripts/validate.py && node scripts/build.mjs --check');
  // fiecare script din scripts/ (în afară de cel care creează issue-uri) este descris în ghidul de contribuție, în ambele limbi
  for (const l of ['en', 'ro']) {
    const cg = guide('contributor-guide', l);
    for (const s of fs.readdirSync(path.join(ROOT, 'scripts')).filter((f) => !f.endsWith('.sh'))) assert.ok(cg.includes('scripts/' + s), 'ghidul de contribuție (' + l + ') nu pomenește scripts/' + s);
  }
  // cele cinci verificări dinaintea unui pull request, așa cum sunt în ghidul de contribuție (secțiunea 8), în ambele limbi
  for (const l of ['en', 'ro']) {
    const cg = guide('contributor-guide', l), sec = cg.slice(cg.indexOf('## 8.'), cg.indexOf('## 9.'));
    assert.deepEqual(blocks(sec)[0].body.trim().split('\n'), ['node scripts/pack.mjs --check', 'python3 scripts/validate.py', 'npm test', 'node scripts/build.mjs --check', 'node scripts/check_licences.mjs'], l);
  }
  const pr = read('.github/PULL_REQUEST_TEMPLATE.md');
  for (const c of ['node scripts/pack.mjs --check', 'python3 scripts/validate.py', 'npm test', 'node scripts/build.mjs', 'node scripts/build.mjs --check', 'node scripts/check_licences.mjs']) assert.ok(pr.includes(c), 'șablonul de PR: ' + c);
});

test('comenzile din ghidul de contribuție rulează așa cum sunt scrise: pachetul descărcat din pagină este despărțit în fișiere, iar verificările trec; fotografia este pregătită și verificată', () => {
  const full = blocks(guide('pack-format', 'en')).filter(isJsonBlock).map(parseBlock)[3];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-docs-'));
  for (const f of ['schema.json', 'pack.schema.json']) fs.copyFileSync(path.join(ROOT, f), path.join(tmp, f));
  const file = path.join(tmp, 'vietar-pack-' + full.id + '.json');
  fs.writeFileSync(file, JSON.stringify(full, null, 2) + '\n');
  const node = (script, args) => spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args, '--root', tmp], {encoding: 'utf8'});
  const cg = guide('contributor-guide', 'en');
  const split = commands(cg).find((c) => c.startsWith('node scripts/pack.mjs --split'));
  assert.ok(split); assert.equal(words(split).length, 4, 'comanda din ghid: node scripts/pack.mjs --split <fișier>');
  // despărțirea: două specii și un manifest; a doua rulare nu schimbă nimic
  let r = node('pack.mjs', ['--split', file]);
  assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /^3 file\(s\) written/);
  assert.deepEqual(fs.readdirSync(path.join(tmp, 'data/species')).sort(), ['allium-ursinum.json', 'colchicum-autumnale.json']);
  assert.deepEqual(fs.readdirSync(path.join(tmp, 'data/packs')), ['xx-garden.json']);
  r = node('pack.mjs', ['--split', file]);
  assert.equal(r.status, 0); assert.match(r.stdout, /^0 file\(s\) written/);
  // un fișier care există și diferă nu este suprascris fără --force; cu --force este
  const sf = path.join(tmp, 'data/species/allium-ursinum.json');
  const edited = JSON.parse(fs.readFileSync(sf, 'utf8')); edited.notes = {en: 'Edited by hand.'};
  fs.writeFileSync(sf, JSON.stringify(edited, null, 2) + '\n');
  r = node('pack.mjs', ['--split', file]);
  assert.equal(r.status, 1); assert.match(r.stdout, /use --force to overwrite\): data\/species\/allium-ursinum\.json/);
  assert.equal(JSON.parse(fs.readFileSync(sf, 'utf8')).notes.en, 'Edited by hand.', 'nu s-a scris nimic');
  r = node('pack.mjs', ['--split', file, '--force']);
  assert.equal(r.status, 0); assert.match(r.stdout, /^1 file\(s\) written/);
  // un pachet cu probleme nu scrie nimic
  const bad = clone(full); bad.count = 5;
  const badFile = path.join(tmp, 'bad.json'); fs.writeFileSync(badFile, JSON.stringify(bad));
  r = node('pack.mjs', ['--split', badFile]);
  assert.equal(r.status, 1); assert.match(r.stdout, /count_mismatch/);
  // comenzile pe rând: construirea, verificarea, validatorul
  r = node('pack.mjs', []);
  assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /1 file\(s\) written/);
  r = node('pack.mjs', ['--check']);
  assert.equal(r.status, 0, r.stdout); assert.match(r.stdout, /match data\/species and data\/packs/);
  if (hasPy('jsonschema')) {
    const val = (args) => spawnSync('python3', [path.join(ROOT, 'scripts/validate.py'), ...args, '--root', tmp], {encoding: 'utf8'});
    r = val([]);
    assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /0 problem\(s\)/);
    // «o specie care nu e în niciun pachet este o greșeală»
    const orphan = clone(LYNX); fs.writeFileSync(path.join(tmp, 'data/species/lynx-lynx.json'), JSON.stringify(orphan, null, 2) + '\n');
    r = val([]);
    assert.equal(r.status, 1, r.stdout + r.stderr); assert.match(r.stdout, /data\/species\/lynx-lynx\.json: species_orphan\n/, r.stdout + r.stderr);
    fs.unlinkSync(path.join(tmp, 'data/species/lynx-lynx.json'));
  }
  // fotografia: comanda din ghid (în engleză și în română), cu fișierul nostru în loc de lynx.jpg, dă un fragment valid care trece verificarea licențelor
  if (hasPy('PIL') && hasPy('jsonschema')) {
    const png = path.join(tmp, 'lynx.png');
    fs.writeFileSync(png, Buffer.from(pngUri(64, 48, [90, 120, 60]).split(',')[1], 'base64'));
    for (const l of ['en', 'ro']) {
      const cmd = commands(guide('contributor-guide', l)).find((c) => c.startsWith('python3 scripts/optimize.py'));
      assert.ok(cmd, l + ': comanda pentru fotografie');
      const w = words(cmd).slice(2); w[0] = png;
      const o = spawnSync('python3', [path.join(ROOT, 'scripts/optimize.py'), ...w], {encoding: 'utf8'});
      assert.equal(o.status, 0, o.stderr);
      const photo = JSON.parse(o.stdout);
      assert.deepEqual(Object.keys(photo.alt), [l], l + ': limba descrierii');
      assert.equal(photo.licence, 'CC-BY-4.0'); assert.equal(photo.commons_file, 'File:Lynx_lynx.jpg'); assert.match(photo.source_url, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      const sp = Object.assign(clone(LYNX), {photos: [photo]});
      assert.deepEqual(E.validateSpecies(sp), [], l + ': fragmentul din ghid');
      const root2 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-docs-lic-'));
      fs.mkdirSync(path.join(root2, 'data/species'), {recursive: true});
      fs.writeFileSync(path.join(root2, 'data/species/lynx-lynx.json'), JSON.stringify(sp));
      const c = spawnSync(process.execPath, [path.join(ROOT, 'scripts/check_licences.mjs'), '--root', root2], {encoding: 'utf8'});
      assert.equal(c.status, 0, c.stdout + c.stderr); assert.match(c.stdout, /^1 photo\(s\) read .* 0 error\(s\), 0 warning\(s\)/);
    }
  }
  // verificarea licențelor din depozit, fără rețea, ca în ghid
  const lic = spawnSync(process.execPath, [path.join(ROOT, 'scripts/check_licences.mjs')], {encoding: 'utf8'});
  assert.equal(lic.status, 0, lic.stdout + lic.stderr);
});

test('numele din interfață citate în ghiduri sunt cele din interfață, aceleași în engleză și în română, iar frazele de siguranță nu lipsesc', () => {
  const keysOf = (l, v) => Object.keys(I18N[l]).filter((k) => I18N[l][k] === v);
  let nUi = 0;
  for (const g of GUIDES) {
    const ui = {};
    for (const l of ['en', 'ro']) {
      const [a, b] = QU[l];
      const q = [...noCode(guide(g, l)).matchAll(new RegExp(a + '([^' + b + ']+)' + b, 'g'))].map((m) => m[1]);
      for (const x of q) assert.ok(keysOf(l, x).length || (l === 'en' && NOT_UI.has(x)), g + ' (' + l + '): ' + a + x + b + ' nu este un nume din interfață');
      ui[l] = q.filter((x) => keysOf(l, x).length);
    }
    assert.equal(ui.en.length, ui.ro.length, g + ': același număr de nume din interfață în engleză și în română');
    ui.en.forEach((x, i) => assert.ok(keysOf('en', x).some((k) => keysOf('ro', ui.ro[i]).includes(k)), g + ': citatul ' + (i + 1) + ' (' + x + ' / ' + ui.ro[i] + ') nu este același element de interfață'));
    nUi += ui.en.length;
  }
  assert.ok(nUi >= 35, nUi + ' nume din interfață citate în ghiduri');
  // ghidul de format spune la fel despre import
  assert.ok(guide('pack-format', 'en').includes('tab “' + I18N.en.tab_packs + '” → “' + I18N.en.i_go + '”'));
  assert.ok(guide('pack-format', 'ro').includes('fila «' + I18N.ro.tab_packs + '» → «' + I18N.ro.i_go + '»'));
  // frazele de siguranță din ghidul clasei și din ghidul de revizuire, în ambele limbi
  const must = {
    en: {'school-class-guide': ['**Safety first.**', 'nobody should taste, eat or handle a wild plant or mushroom because of it', 'It never means that it is safe to eat or to touch.', 'never of people'],
      'review-guide': ['a review is still not a guarantee', 'Nobody reviews their own work', 'Safety: …'], 'contributor-guide': ['Never explain how to tell them apart', 'Safety: …'],
      'pack-format': ['never how to tell them apart', 'never shows it as green or as safe']},
    ro: {'school-class-guide': ['**Siguranța înainte de orice.**', 'nimeni nu trebuie să guste, să mănânce sau să atingă', 'Nu înseamnă niciodată că e sigur s-o mănânci sau s-o atingi.', 'niciodată persoanelor'],
      'review-guide': ['o verificare tot nu este o garanție', 'Nimeni nu își verifică propria muncă', 'Safety: …'], 'contributor-guide': ['Nu explicați niciodată cum se deosebesc', 'Safety: …'],
      'pack-format': ['niciodată cum se deosebesc', 'niciodată verde sau sigură']}
  };
  for (const l of ['en', 'ro']) for (const [g, phrases] of Object.entries(must[l])) for (const p of phrases) assert.ok(guide(g, l).includes(p), g + ' (' + l + '): lipsește «' + p + '»');
  // exemplele de id de pachet din ghiduri sunt valide
  const idRe = new RegExp(PS.properties.id.pattern);
  for (const g of GUIDES) for (const l of ['en', 'ro']) for (const m of guide(g, l).matchAll(/`((?:ro|bg|md|xx)-[a-z0-9-]+)`/g)) assert.ok(idRe.test(m[1]) && m[1].length >= 5 && m[1].length <= 40 || exists('data/species/' + m[1] + '.json'), g + '/' + l + ': ' + m[1]);
});

test('căile din README, CONTRIBUTING, ghiduri și șabloane există, iar legăturile relative duc la fișiere existente', () => {
  const texts = [];
  for (const l of LANGS) for (const b of ['README', 'CONTRIBUTING', 'ISSUES_GOOD_FIRST', 'CHANGELOG']) texts.push([b + sfx(l) + '.md', read(b + sfx(l) + '.md')]);
  for (const g of GUIDES) for (const l of ['en', 'ro']) texts.push(['docs/' + g + (l === 'ro' ? '.ro' : '') + '.md', guide(g, l)]);
  for (const f of ['.github/ISSUE_TEMPLATE/new-entry.md', '.github/ISSUE_TEMPLATE/bug.md', '.github/PULL_REQUEST_TEMPLATE.md']) texts.push([f, read(f)]);
  let nPaths = 0, nLinks = 0;
  for (const [name, t] of texts) {
    for (const m of t.matchAll(/`((?:docs|scripts|data|src|test)\/[A-Za-z0-9_.\-/]+|schema\.json|pack\.schema\.json|good-first-issues\.txt|index\.html)`/g)) {
      if (EXAMPLE_PATHS.has(m[1])) continue;
      nPaths++;
      assert.ok(exists(m[1]), name + ': lipsește ' + m[1]);
    }
    const base = path.dirname(name);
    for (const m of t.matchAll(/\]\(([^)#\s]+)\)/g)) {
      if (/^https?:/.test(m[1])) continue;
      nLinks++;
      assert.ok(fs.existsSync(path.join(ROOT, base, m[1])), name + ': legătura ' + m[1] + ' nu duce nicăieri');
    }
  }
  assert.ok(nPaths >= 400 && nLinks >= 200, nPaths + ' căi, ' + nLinks + ' legături');
  // locurile de completat din căi (data/species/<id>.json …) trimit la directoare care există
  assert.ok(exists('data/species') && exists('data/packs') && exists('data/dist') && exists('docs') && exists('scripts'));
});

test('README, CONTRIBUTING, CHANGELOG și ISSUES_GOOD_FIRST au aceeași versiune și dată în toate cele opt limbi', () => {
  assert.equal(pkg.version, app.version);
  assert.equal(pkg.version, '0.2.0');
  assert.equal(app.slug, 'vietar-packs');
  const WORD = {en: ['Version', 'Last updated'], ro: ['Versiune', 'Ultima actualizare']};
  for (const l of LANGS) {
    for (const base of ['README', 'CONTRIBUTING']) {
      const t = read(base + sfx(l) + '.md');
      const m = t.match(/^(.+?): (\d+\.\d+\.\d+) · (.+?): (\d{4}-\d{2}-\d{2})$/m);
      assert.ok(m, base + sfx(l) + ': linia de versiune');
      assert.equal(m[2], pkg.version, base + sfx(l)); assert.equal(m[4], app.updated, base + sfx(l));
      if (WORD[l]) assert.deepEqual([m[1], m[3]], WORD[l], base + sfx(l));
    }
    const c = read('CHANGELOG' + sfx(l) + '.md');
    assert.ok(c.includes('## [' + pkg.version + '] - ' + app.updated), 'CHANGELOG' + sfx(l));
    const heads = [...c.matchAll(/^## \[(.+?)\]/gm)].map((m) => m[1]);
    assert.equal(heads.length, 3, 'CHANGELOG' + sfx(l) + ': ' + heads.join(' | '));
    assert.deepEqual(heads.slice(1), [pkg.version, '0.1.0'], 'CHANGELOG' + sfx(l) + ': ordinea versiunilor');
  }
});

test('README: adresa, cerințele (ES2017, Node.js 24), cifrele din date, numele din interfață, limitele și licența, în toate limbile', () => {
  const mans = Object.fromEntries(manifests().map((m) => [m.id, m]));
  assert.equal(Object.keys(mans).length, 5);
  const total = Object.values(mans).reduce((n, m) => n + m.count, 0);
  const wanted = [total, mans['ro-plants-fungi'].count, mans['ro-birds'].count, mans['ro-mammals'].count, mans['bg-starter'].count];
  assert.deepEqual(wanted, [71, 19, 17, 15, 10]);
  assert.equal(mans['md-starter'].count, 10);
  for (const l of LANGS) {
    const t = read('README' + sfx(l) + '.md');
    assert.ok(t.includes('https://vietar-packs.chiuta.ro'), l);
    assert.ok(/ES2017/.test(t) && /Node\.js 24/.test(t), 'README' + sfx(l) + ': cerințele');
    const status = numbers(t.split(/^## /m)[1]);
    for (const n of wanted) assert.ok(status.includes(String(n)), 'README' + sfx(l) + ': cifra ' + n + ' din secțiunea despre stare');
    for (const k of ['tab_browse', 'tab_packs', 'tab_build', 'tab_guide', 'st_skeleton', 'st_draft', 'st_reviewed']) assert.ok(t.includes(QU[l][0] + I18N[l][k] + QU[l][1]), 'README' + sfx(l) + ': ' + k);
    // limitele sinceritate sunt aceleași texte ca în interfață
    for (let i = 1; i <= 6; i++) assert.ok(t.includes(I18N[l]['lim_' + i]), 'README' + sfx(l) + ': lim_' + i);
    assert.ok(t.includes('## ' + I18N[l].h_limits), 'README' + sfx(l) + ': titlul limitelor');
    // secțiunea de licență: codul este MIT, datele au licența lor, cele incluse sunt CC0-1.0
    for (const c of ['MIT', 'CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0']) assert.ok(t.includes(c), 'README' + sfx(l) + ': ' + c);
    for (const f of ['docs/pack-format', 'docs/contributor-guide', 'docs/review-guide', 'docs/school-class-guide', 'scripts/pack.mjs', 'scripts/validate.py', 'scripts/optimize.py', 'scripts/check_licences.mjs', 'schema.json', 'pack.schema.json']) assert.ok((t + read('CONTRIBUTING' + sfx(l) + '.md')).includes(f), 'README sau CONTRIBUTING' + sfx(l) + ' nu pomenește ' + f);
    const c = read('CONTRIBUTING' + sfx(l) + '.md');
    assert.ok(c.includes(QU[l][0] + I18N[l].tab_build + QU[l][1]), 'CONTRIBUTING' + sfx(l) + ': tab_build');
  }
  assert.equal(pkg.engines.node, '>=24');
  // ce spun limitele sincere este adevărat despre date: pachetele incluse sunt ciorne, schelete BG și MD cu aceleași 10 specii, fără fotografii și fără sunete
  assert.deepEqual([mans['bg-starter'].status, mans['md-starter'].status], ['skeleton', 'skeleton']);
  assert.deepEqual(mans['bg-starter'].species, mans['md-starter'].species, 'CHANGELOG și README spun că cele două schelete au aceleași 10 specii');
  for (const f of fs.readdirSync(path.join(ROOT, 'data/species'))) { const s = JSON.parse(read('data/species/' + f)); assert.ok(!s.photos && !s.audio, f + ' are fotografii sau sunete, dar README spune că pachetele incluse nu au'); }
});

test('sarcinile de început: zece, aceleași în toate limbile, iar good-first-issues.txt are titlurile englezești', () => {
  const issue = (l) => [...read('ISSUES_GOOD_FIRST' + sfx(l) + '.md').matchAll(/^- \[ \] (.+)$/gm)].map((m) => m[1]);
  for (const l of LANGS) assert.equal(issue(l).length, 10, 'ISSUES_GOOD_FIRST' + sfx(l));
  assert.deepEqual(read('good-first-issues.txt').trim().split('\n'), issue('en'));
  assert.ok(read('scripts/create_issues.sh').includes('good-first-issues.txt'));
  // numerele din sarcini sunt aceleași în toate limbile (30, 50, 40, 20, 20) și pachetele pomenite există
  const nums = (l) => numbers(issue(l).join('\n'));
  for (const l of LANGS) assert.deepEqual(nums(l), nums('en'), 'ISSUES_GOOD_FIRST' + sfx(l) + ': cifrele');
  for (const id of ['ro-mammals', 'ro-birds', 'ro-plants-fungi', 'bg-starter', 'md-starter']) assert.ok(issue('en').join('\n').includes('`' + id + '`') && exists('data/packs/' + id + '.json'), id);
  // ținta unei sarcini este mai mare decât ce există acum, altfel sarcina nu mai are sens
  const target = {'ro-mammals': 30, 'ro-birds': 50, 'ro-plants-fungi': 40, 'bg-starter': 20, 'md-starter': 20};
  for (const [id, n] of Object.entries(target)) assert.ok(JSON.parse(read('data/packs/' + id + '.json')).count < n, id + ' a atins ținta sarcinii; actualizați ISSUES_GOOD_FIRST');
});

test('fluxul de lucru rulează verificarea pachetelor, validarea, testele și verificarea construcției pe Ubuntu 26.04 cu Node.js 26', () => {
  const y = read('.github/workflows/validate.yml');
  assert.match(y, /runs-on: ubuntu-26\.04/);
  assert.match(y, /node-version: 26/);
  for (const c of ['node scripts/pack.mjs --check', 'python scripts/validate.py', 'node --test "test/*.test.mjs"', 'node scripts/build.mjs --check', 'pip install jsonschema pillow']) assert.ok(y.includes(c), c);
  assert.ok(!/ubuntu-latest/.test(y));
  // verificările din fluxul de lucru sunt cele din «npm run check» și din ghidul de contribuție
  for (const c of ['node scripts/pack.mjs --check', 'node scripts/build.mjs --check']) assert.ok(pkg.scripts.check.includes(c) && guide('contributor-guide', 'en').includes(c), c);
  assert.equal(pkg.scripts.test, 'node --test "test/*.test.mjs"');
});

test('șabloanele de pe GitHub trimit la ghiduri, la validator și la construcție, iar înregistrarea verificării din șablonul de PR este cea din secțiunea 5 a ghidului de revizuire', () => {
  const n = read('.github/ISSUE_TEMPLATE/new-entry.md'), p = read('.github/PULL_REQUEST_TEMPLATE.md'), b = read('.github/ISSUE_TEMPLATE/bug.md');
  assert.match(n, /labels: data/); assert.match(b, /labels: bug/);
  for (const f of ['docs/contributor-guide.md', 'docs/pack-format.md', 'docs/review-guide.md', 'docs/school-class-guide.md']) assert.ok(n.includes(f), 'șablonul de issue: ' + f);
  for (const f of ['scripts/pack.mjs', 'scripts/validate.py', 'npm test', 'node scripts/build.mjs', 'scripts/check_licences.mjs', 'docs/review-guide.md']) assert.ok(p.includes(f), 'șablonul de PR: ' + f);
  assert.ok(p.includes('section 5 of `docs/review-guide.md`'));
  assert.ok(n.includes(QU.en[0] + I18N.en.tab_build + QU.en[1]), 'șablonul de issue numește fila «' + I18N.en.tab_build + '»');
  // aceleași șapte câmpuri, cu același text, în șablonul de PR și în secțiunea 5 a ghidului în engleză și în română
  const fromPr = blocks(p.slice(p.indexOf('### Record of the review')))[0].body.trim().split('\n');
  assert.deepEqual(fromPr.map((l) => l.split(':')[0]), ['Reviewer', 'Pack', 'Species checked', 'Sources', 'Toxic flags and look-alikes', 'Differences found and fixed', 'Not checked']);
  for (const l of ['en', 'ro']) {
    const t = guide('review-guide', l), sec = t.slice(t.indexOf('## 5.'), t.indexOf('## 6.'));
    assert.deepEqual(blocks(sec)[0].body.trim().split('\n'), fromPr, 'ghidul de revizuire (' + l + '), secțiunea 5');
    for (const f of ['status', 'reviewed', 'reviewed_by', 'reviewed_on', 'version', 'updated']) assert.ok(sec.includes('`' + f + '`'), l + ': ' + f);
  }
  // câmpurile din manifest pomenite în ghid există în schemă
  for (const f of ['reviewed_by', 'reviewed_on', 'status', 'version', 'updated']) assert.ok(PS.properties[f], f);
});

test('fișierele de proiect: licența MIT, codul de conduită în opt limbi, FUNDING, CNAME și fără dependențe', () => {
  assert.match(read('LICENSE'), /MIT License/);
  for (const l of LANGS) assert.ok(exists('CODE_OF_CONDUCT' + sfx(l) + '.md'), 'CODE_OF_CONDUCT' + sfx(l));
  assert.ok(exists('.github/FUNDING.yml')); assert.ok(exists('.all-contributorsrc'));
  assert.ok(!exists('node_modules'), 'nu sunt dependențe');
  assert.equal(read('CNAME').trim(), 'vietar-packs.chiuta.ro');
  assert.ok(!pkg.dependencies && !pkg.devDependencies, 'package.json fără dependențe');
  assert.equal(pkg.license, 'MIT'); assert.equal(pkg.type, 'module');
  assert.equal(app.data, 'data/dist'); assert.deepEqual(app.files, {SPECIES_SCHEMA: 'schema.json', PACK_SCHEMA: 'pack.schema.json'});
});
