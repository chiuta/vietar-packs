// Paritate: motorul din pagină (src/engine.mjs) și validatorul din depozit (scripts/validate.py) trebuie să dea același verdict pe aceleași date.
// Se compară mulțimile de «familii» de coduri: orice abatere de formă (type, missing, extra, length, pattern, enum) este «schema» în Python.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {E, ROOT, clone, mkSpecies, mkPack, photo, audio, LYNX, RAMSONS, SAFFRON, MANIFEST} from './helpers.mjs';

const havePy = spawnSync('python3', ['-c', 'import jsonschema']).status === 0;
const T = havePy ? test : test.skip;
const STRUCT = new Set(['file_name', 'species_orphan', 'dist_missing', 'dist_stale', 'species_unknown', 'json']);
const fam = (c) => (E.SHAPE_CODES.includes(c) ? 'schema' : c);
const setOf = (list) => [...new Set(list.map((p) => fam(p.code)).filter((c) => !STRUCT.has(c)))].sort();

function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-par-'));
  for (const f of ['schema.json', 'pack.schema.json']) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  for (const d of ['data/species', 'data/packs', 'data/dist']) fs.mkdirSync(path.join(dir, d), {recursive: true});
  return dir;
}
function py(dir) {
  const r = spawnSync('python3', [path.join(ROOT, 'scripts/validate.py'), '--root', dir, '--json'], {encoding: 'utf8'});
  assert.ok(r.stdout, r.stderr);
  return JSON.parse(r.stdout).problems;
}
const byFile = (problems) => {
  const m = {};
  for (const p of problems) (m[path.basename(p.file)] = m[path.basename(p.file)] || []).push(p);
  return m;
};
const str = (n, c) => String.fromCharCode(...Array.from({length: n}, () => c));
const cp = (...codes) => String.fromCharCode(...codes);

const mk = (over, del) => { const s = mkSpecies(over); for (const k of del || []) delete s[k]; return s; };
const noRec = audio(); delete noRec.recordist;
const SPECIES = {
  'valid lynx': mk({}), 'valid ramsons': clone(RAMSONS), 'valid saffron': clone(SAFFRON),
  'valid photo+audio+notes': mk({photos: [photo()], audio: [audio({note: {en: 'song'}})], source: 'x', notes: {en: 'a\nb'}}),
  'no id': mk({}, ['id']), 'no names': mk({}, ['names']), 'no names.en': mk({names: {ro: 'Râs'}}), 'empty names': mk({names: {}}),
  'name key upper': mk({names: {EN: 'x', en: 'y'}}), 'name empty': mk({names: {en: ''}}), 'name long': mk({names: {en: 'x'.repeat(81)}}),
  'extra key': mk({colour: 'brown'}), 'bad kingdom': mk({kingdom: 'protista'}), 'bad group': mk({group: 'dragon'}), 'toxic string': mk({toxic: 'yes'}),
  'id upper': mk({id: 'Lynx-lynx'}), 'id no hyphen': mk({id: 'lynx'}), 'latin lower': mk({latin: 'lynx lynx'}), 'latin short': mk({latin: 'Lynx'}),
  'names string': mk({names: 'Lynx'}), 'look no note': mk({look_alike: [{id: 'a-b'}]}), 'look 9': mk({look_alike: new Array(9).fill({id: 'a-b', note: {en: 'x'}})}),
  'photo bad licence': mk({photos: [photo({licence: 'All rights reserved'})]}), 'photo svg': mk({photos: [photo({data: 'data:image/svg+xml;base64,PHN2Zz4='})]}),
  'photo long': mk({photos: [photo({data: 'data:image/png;base64,' + 'A'.repeat(120001)})]}), 'photo http': mk({photos: [photo({source_url: 'http://example.org/a.png'})]}),
  'photo js url': mk({photos: [photo({source_url: 'javascript:alert(1)'})]}), 'photo commons bad': mk({photos: [photo({commons_file: 'Test.png'})]}),
  'photo commons ok': mk({photos: [photo({commons_file: 'File:Test image.png'})]}), 'photo 7': mk({photos: new Array(7).fill(photo())}),
  'audio other host': mk({audio: [audio({url: 'https://example.org/123456'})]}), 'audio evil host': mk({audio: [audio({url: 'https://xeno-canto.org.evil.test/1'})]}),
  'audio http': mk({audio: [audio({url: 'http://xeno-canto.org/123456'})]}), 'audio nl': mk({audio: [audio({url: 'https://xeno-canto.org/1\n'})]}),
  'audio www': mk({audio: [audio({url: 'https://www.xeno-canto.org/42'})]}), 'audio bad licence': mk({audio: [audio({licence: 'CC-BY-9.0'})]}),
  'audio nc': mk({audio: [audio({licence: 'CC-BY-NC-SA-4.0'})]}), 'audio no recordist': mk({audio: [noRec]}),
  'ctl NUL': mk({names: {en: 'Ra' + cp(0)}}), 'ctl newline': mk({names: {en: 'Ra\nx'}}), 'ctl DEL': mk({names: {en: 'Ra' + cp(127)}}), 'ctl C1': mk({names: {en: 'Ra' + cp(0x85)}}),
  'bidi RLO': mk({names: {en: 'Ra' + cp(0x202e) + 'x'}}), 'bidi isolate': mk({names: {en: 'Ra' + cp(0x2066) + 'x'}}), 'zero width': mk({names: {en: 'Ra' + cp(0x200b) + 'x'}}),
  'BOM': mk({names: {en: cp(0xfeff) + 'Ra'}}), 'line sep': mk({names: {en: 'Ra' + cp(0x2028) + 'x'}}), 'lone high': mk({names: {en: 'Ra' + cp(0xd800)}}),
  'lone low': mk({names: {en: cp(0xdc00) + 'Ra'}}), 'space lead': mk({names: {en: ' Ra'}}), 'space trail': mk({names: {en: 'Ra '}}), 'spaces only': mk({names: {en: '   '}}),
  'nbsp lead': mk({names: {en: cp(160) + 'Ra'}}), 'ideographic trail': mk({names: {en: 'Ra' + cp(0x3000)}}), 'emoji ok': mk({names: {en: 'R' + String.fromCodePoint(0x1f431) + 'x'}}),
  'emoji 80 ok': mk({names: {en: String.fromCodePoint(0x1f431).repeat(80)}}), 'emoji 81': mk({names: {en: String.fromCodePoint(0x1f431).repeat(81)}}),
  'notes multiline ok': mk({notes: {en: 'a\nb'}}), 'notes lead nl': mk({notes: {en: '\nab'}}), 'notes trail nl': mk({notes: {en: 'ab\n'}}), 'notes CR': mk({notes: {en: 'a\rb'}}),
  'source nl': mk({source: 'a\nb'}), 'id trailing nl': mk({id: 'lynx-lynx\n'}), 'id slug': mk({id: 'lynx-pardinus'}), 'group vs kingdom': mk({group: 'tree'}),
  'plant no toxic': (() => { const p = clone(RAMSONS); delete p.toxic; return p; })(), 'toxic no note': (() => { const p = clone(SAFFRON); delete p.toxic_note; return p; })(),
  'note unused': Object.assign(clone(RAMSONS), {toxic_note: {en: 'x'}}), 'animal toxic false': mk({toxic: false}), 'animal toxic true': mk({toxic: true, toxic_note: {en: 'venomous'}}),
  'look self': mk({look_alike: [{id: 'lynx-lynx', note: {en: 'x'}}]}), 'look dup': mk({look_alike: [{id: 'a-b', note: {en: 'x'}}, {id: 'a-b', note: {en: 'y'}}]}),
  'proto keys': JSON.parse('{"id":"lynx-lynx","latin":"Lynx lynx","kingdom":"animalia","group":"mammal","names":{"en":"Lynx","__proto__":"x"},"__proto__":{"polluted":true}}'),
  'fungus no toxic': {id: 'boletus-edulis', latin: 'Boletus edulis', kingdom: 'fungi', group: 'fungus', names: {en: 'Porcini'}},
  'fungus ok': {id: 'boletus-edulis', latin: 'Boletus edulis', kingdom: 'fungi', group: 'fungus', names: {en: 'Porcini'}, toxic: false},
  'subspecies ok': {id: 'rupicapra-rupicapra-carpatica', latin: 'Rupicapra rupicapra carpatica', kingdom: 'animalia', group: 'mammal', names: {en: 'Carpathian chamois'}},
  'hyphen epithet ok': {id: 'aaa-bb-cc', latin: 'Aaa bb-cc', kingdom: 'animalia', group: 'other', names: {en: 'x'}}
};
const MANIFESTS = {
  valid: clone(MANIFEST), 'valid reviewed': Object.assign(clone(MANIFEST), {status: 'reviewed', reviewed_by: 'Dr X', reviewed_on: '2026-11-17'}),
  'date feb 30': Object.assign(clone(MANIFEST), {updated: '2026-02-30'}), 'date year 999': Object.assign(clone(MANIFEST), {updated: '0999-01-01'}), 'date month 13': Object.assign(clone(MANIFEST), {updated: '2026-13-01'}),
  'date leap ok': Object.assign(clone(MANIFEST), {updated: '2024-02-29'}), 'date leap bad': Object.assign(clone(MANIFEST), {updated: '2025-02-29'}), 'date short': Object.assign(clone(MANIFEST), {updated: '2026-1-1'}),
  'reviewed no by': Object.assign(clone(MANIFEST), {status: 'reviewed'}), 'reviewed no on': Object.assign(clone(MANIFEST), {status: 'reviewed', reviewed_by: 'x'}),
  'reviewed_on bad': Object.assign(clone(MANIFEST), {reviewed_on: '2026-02-31'}), 'count 2': Object.assign(clone(MANIFEST), {count: 2}),
  'dup species': Object.assign(clone(MANIFEST), {species: ['lynx-lynx', 'lynx-lynx', 'a-b'], count: 3}), 'species number': Object.assign(clone(MANIFEST), {species: [5], count: 1}),
  'species bad id': Object.assign(clone(MANIFEST), {species: ['Lynx'], count: 1}), 'species empty': Object.assign(clone(MANIFEST), {species: [], count: 0}),
  'id short': Object.assign(clone(MANIFEST), {id: 'ro'}), 'id upper': Object.assign(clone(MANIFEST), {id: 'RO-test'}), 'region lower': Object.assign(clone(MANIFEST), {region: 'ro'}),
  'version short': Object.assign(clone(MANIFEST), {version: '1.0'}), 'version long': Object.assign(clone(MANIFEST), {version: '1.0.0.0'}), 'licence mit': Object.assign(clone(MANIFEST), {licence: 'MIT'}),
  'title no en': Object.assign(clone(MANIFEST), {title: {ro: 'x'}}), 'authors 11': Object.assign(clone(MANIFEST), {authors: new Array(11).fill('x')}), 'count float': Object.assign(clone(MANIFEST), {count: 3.5}),
  'count string': Object.assign(clone(MANIFEST), {count: '3'}), 'extra field': Object.assign(clone(MANIFEST), {colour: 'x'}), 'title space': Object.assign(clone(MANIFEST), {title: {en: ' x'}}),
  'status bad': Object.assign(clone(MANIFEST), {status: 'final'}), 'description ok': Object.assign(clone(MANIFEST), {description: {en: 'x'}}), 'description long': Object.assign(clone(MANIFEST), {description: {en: 'x'.repeat(301)}}),
  'array root': []
};

T('paritate: o specie primește aceleași familii de probleme în motor și în validate.py', () => {
  const dir = repo();
  const names = Object.keys(SPECIES);
  names.forEach((n, i) => fs.writeFileSync(path.join(dir, 'data/species', 'case-' + String(i).padStart(3, '0') + '.json'), JSON.stringify(SPECIES[n])));
  const got = byFile(py(dir));
  const diffs = [];
  names.forEach((n, i) => {
    const f = 'case-' + String(i).padStart(3, '0') + '.json';
    const a = setOf(E.validateSpecies(SPECIES[n])), b = [...new Set((got[f] || []).map((p) => p.code).filter((c) => !STRUCT.has(c)))].sort();
    if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(n + ': motor=' + a + ' python=' + b);
  });
  assert.deepEqual(diffs, []);
  // câteva verdicte-cheie, ca testul să nu fie o egalitate goală
  assert.deepEqual(setOf(E.validateSpecies(SPECIES['valid lynx'])), []);
  assert.deepEqual(setOf(E.validateSpecies(SPECIES['toxic no note'])), ['toxic_note_required']);
  assert.deepEqual(setOf(E.validateSpecies(SPECIES['ctl NUL'])), ['text']);
  assert.ok(names.length > 70, String(names.length));
});

T('paritate: un manifest primește aceleași familii de probleme în motor și în validate.py', () => {
  const dir = repo();
  const names = Object.keys(MANIFESTS);
  names.forEach((n, i) => fs.writeFileSync(path.join(dir, 'data/packs', 'case-' + String(i).padStart(3, '0') + '.json'), JSON.stringify(MANIFESTS[n])));
  const got = byFile(py(dir));
  const diffs = [];
  names.forEach((n, i) => {
    const f = 'case-' + String(i).padStart(3, '0') + '.json';
    const a = setOf(E.validateManifest(MANIFESTS[n])), b = [...new Set((got[f] || []).map((p) => p.code).filter((c) => !STRUCT.has(c)))].sort();
    if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(n + ': motor=' + a + ' python=' + b);
  });
  assert.deepEqual(diffs, []);
  assert.deepEqual(setOf(E.validateManifest(MANIFESTS['date feb 30'])), ['date']);
  assert.deepEqual(setOf(E.validateManifest(MANIFESTS.valid)), []);
});

const big = 'data:image/png;base64,' + 'A'.repeat(119000);
const many = Array.from({length: 5}, (_, i) => ({id: 'aaa-bb' + 'abcde'[i], latin: 'Aaa bb' + 'abcde'[i], kingdom: 'animalia', group: 'other', names: {en: 'S' + i}, photos: new Array(6).fill(photo({data: big}))}));
const sa = clone(SAFFRON); delete sa.look_alike;
const PACKS = {
  valid: mkPack(), 'look unknown': mkPack({}, [RAMSONS, LYNX]), 'look asymmetric': mkPack({}, [RAMSONS, sa]), 'photo budget': mkPack({}, many), 'photo within budget': mkPack({}, many.slice(0, 4)),
  'count off': mkPack({count: 4}), 'duplicate': mkPack({}, [LYNX, LYNX]), 'species invalid': mkPack({}, [mk({group: 'tree'}), RAMSONS]),
  'review missing': mkPack({status: 'reviewed'}), 'bad date': mkPack({updated: '2026-02-30'})
};
for (const name of Object.keys(PACKS)) {
  T('paritate: pachet «' + name + '» — motorul și validate.py (după despărțirea în fișiere) dau aceleași familii', () => {
    const pack = PACKS[name], dir = repo();
    const species = pack.species.filter((s) => s && typeof s.id === 'string');
    const seen = new Set();
    for (const s of species) { if (!seen.has(s.id)) { seen.add(s.id); fs.writeFileSync(path.join(dir, 'data/species', s.id + '.json'), JSON.stringify(s)); } }
    const manifest = {};
    for (const k of Object.keys(pack)) if (k !== 'format' && k !== 'format_version') manifest[k] = pack[k];
    manifest.species = pack.species.map((s) => s.id);
    fs.writeFileSync(path.join(dir, 'data/packs', pack.id + '.json'), JSON.stringify(manifest));
    const a = setOf(E.validatePack(pack)), b = [...new Set(py(dir).map((p) => p.code).filter((c) => !STRUCT.has(c)))].sort();
    assert.deepEqual(b, a, name);
    if (name === 'valid') assert.deepEqual(a, []);
    else assert.ok(a.length > 0 || name === 'photo within budget', name);
  });
}

T('depozitul real: validate.py și pack.mjs --check sunt curate, iar dist se potrivește cu sursele', () => {
  const r = spawnSync('python3', [path.join(ROOT, 'scripts/validate.py')], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /0 problem\(s\)\./);
  const n = spawnSync('node', [path.join(ROOT, 'scripts/pack.mjs'), '--check'], {encoding: 'utf8'});
  assert.equal(n.status, 0, n.stdout + n.stderr);
});

import {build} from '../scripts/pack.mjs';
// pack.mjs raportează ca «diferențe» (nu ca probleme) pachetele dist lipsă sau învechite: le scrie sau le semnalează cu --check
const packProblems = (dir) => build(dir).problems.map((p) => p.file.split('/').pop() + ':' + p.code).sort();

T('validate.py prinde: pachet lipsă din dist, dist învechit, specie orfană, nume de fișier greșit, JSON stricat', () => {
  const dir = repo();
  fs.writeFileSync(path.join(dir, 'data/species/lynx-lynx.json'), JSON.stringify(LYNX));
  fs.writeFileSync(path.join(dir, 'data/species/orphan-sp.json'), JSON.stringify(Object.assign(clone(LYNX), {id: 'lynx-pardinus', latin: 'Lynx pardinus'})));
  fs.writeFileSync(path.join(dir, 'data/species/broken.json'), '{ not json');
  fs.writeFileSync(path.join(dir, 'data/packs/xx-one.json'), JSON.stringify(Object.assign(clone(MANIFEST), {id: 'xx-one', species: ['lynx-lynx'], count: 1})));
  let codes = py(dir).map((p) => p.file.split('/').pop() + ':' + p.code).sort();
  assert.deepEqual(codes, ['broken.json:json', 'orphan-sp.json:file_name', 'orphan-sp.json:species_orphan', 'xx-one.json:dist_missing']);
  assert.deepEqual(packProblems(dir), ['broken.json:json', 'orphan-sp.json:file_name', 'orphan-sp.json:species_orphan'], 'pack.mjs raportează la fel');
  const built = E.assemble(Object.assign(clone(MANIFEST), {id: 'xx-one', species: ['lynx-lynx'], count: 1}), {'lynx-lynx': LYNX}).pack;
  fs.writeFileSync(path.join(dir, 'data/dist/xx-one.json'), JSON.stringify(built));
  codes = py(dir).map((p) => p.file.split('/').pop() + ':' + p.code).sort();
  assert.ok(!codes.includes('xx-one.json:dist_missing') && !codes.includes('xx-one.json:dist_stale'), codes.join());
  built.version = '9.9.9';
  fs.writeFileSync(path.join(dir, 'data/dist/xx-one.json'), JSON.stringify(built));
  assert.ok(py(dir).some((p) => p.code === 'dist_stale'));
  fs.writeFileSync(path.join(dir, 'data/dist/old-pack.json'), JSON.stringify(built));
  assert.ok(py(dir).some((p) => p.file.endsWith('old-pack.json') && p.code === 'dist_stale'));
});

T('validate.py raportează o specie orfană și când alt pachet are specii cu sosii (regresie: variabila «where» era suprascrisă și scriptul se oprea cu o eroare)', () => {
  const dir = repo();
  const man = Object.assign(clone(MANIFEST), {id: 'xx-two', species: ['allium-ursinum', 'colchicum-autumnale'], count: 2});
  const orphan = Object.assign(clone(LYNX), {id: 'lynx-pardinus', latin: 'Lynx pardinus'});
  for (const s of [RAMSONS, SAFFRON, orphan]) fs.writeFileSync(path.join(dir, 'data/species/' + s.id + '.json'), JSON.stringify(s));
  fs.writeFileSync(path.join(dir, 'data/packs/xx-two.json'), JSON.stringify(man));
  fs.writeFileSync(path.join(dir, 'data/dist/xx-two.json'), JSON.stringify(E.assemble(man, {'allium-ursinum': RAMSONS, 'colchicum-autumnale': SAFFRON}).pack));
  const r = spawnSync('python3', [path.join(ROOT, 'scripts/validate.py'), '--root', dir], {encoding: 'utf8'});
  assert.equal(r.stderr, '', r.stderr);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /data\/species\/lynx-pardinus\.json: species_orphan/);
  assert.deepEqual(py(dir).map((p) => p.file.split('/').pop() + ':' + p.code), ['lynx-pardinus.json:species_orphan']);
  assert.deepEqual(packProblems(dir), ['lynx-pardinus.json:species_orphan'], 'pack.mjs raportează la fel');
});
