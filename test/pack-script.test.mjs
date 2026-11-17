// scripts/pack.mjs: asamblare în data/dist, --check, --split cu conflicte, specii orfane, fișiere dist rămase fără manifest.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {E, ROOT, clone, LYNX, RAMSONS, SAFFRON, MANIFEST, mkPack} from './helpers.mjs';
import * as P from '../scripts/pack.mjs';

const CLI = path.join(ROOT, 'scripts/pack.mjs');
const cli = (args) => spawnSync('node', [CLI, ...args], {encoding: 'utf8'});
const w = (dir, f, o) => { fs.mkdirSync(path.dirname(path.join(dir, f)), {recursive: true}); fs.writeFileSync(path.join(dir, f), typeof o === 'string' ? o : JSON.stringify(o, null, 2) + '\n'); };
const r = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');
function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-pack-'));
  for (const f of ['schema.json', 'pack.schema.json']) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  for (const s of [LYNX, RAMSONS, SAFFRON]) w(dir, 'data/species/' + s.id + '.json', s);
  w(dir, 'data/packs/xx-test.json', MANIFEST);
  return dir;
}

test('asamblare: scrie data/dist, apoi --check trece; o schimbare în specie face --check să pice și rularea normală o repară', () => {
  const dir = repo();
  let o = cli(['--root', dir]);
  assert.equal(o.status, 0, o.stdout + o.stderr);
  assert.match(o.stdout, /1 file\(s\) written/);
  const built = JSON.parse(r(dir, 'data/dist/xx-test.json'));
  assert.equal(built.format, 'vietar-pack');
  assert.equal(built.species.length, 3);
  assert.deepEqual(E.validatePack(built), []);
  assert.equal(cli(['--root', dir, '--check']).status, 0);
  const s = clone(LYNX); s.names.ro = 'Râsul';
  w(dir, 'data/species/lynx-lynx.json', s);
  o = cli(['--root', dir, '--check']);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /data\/dist\/xx-test\.json: out of date/);
  assert.equal(JSON.parse(r(dir, 'data/dist/xx-test.json')).species.find((x) => x.id === 'lynx-lynx').names.ro, 'Râs', '--check nu scrie');
  assert.equal(cli(['--root', dir]).status, 0);
  assert.equal(JSON.parse(r(dir, 'data/dist/xx-test.json')).species.find((x) => x.id === 'lynx-lynx').names.ro, 'Râsul');
  assert.equal(cli(['--root', dir, '--check']).status, 0);
});

test('o rulare repetată nu schimbă nimic (ieșire deterministă, cheile în ordine fixă)', () => {
  const dir = repo();
  cli(['--root', dir]);
  const a = r(dir, 'data/dist/xx-test.json');
  const b = P.write(dir, false);
  assert.deepEqual(b.changed, []);
  assert.equal(r(dir, 'data/dist/xx-test.json'), a);
  // ordinea fișierelor de specii nu schimbă ieșirea: specia e ordonată după manifest
  assert.equal(JSON.parse(a).species.map((x) => x.id).join(), MANIFEST.species.join());
});

test('probleme: specie invalidă, specie lipsă, fișier cu alt nume, JSON stricat → nimic nu se scrie și codul de ieșire e 1', () => {
  const dir = repo();
  const bad = clone(RAMSONS); delete bad.toxic;
  w(dir, 'data/species/allium-ursinum.json', bad);
  let o = cli(['--root', dir]);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /allium-ursinum\.json: toxic_required/);
  assert.ok(!fs.existsSync(path.join(dir, 'data/dist/xx-test.json')), 'nimic scris');
  assert.ok(!/species_unknown/.test(o.stdout), 'specia invalidă nu e numită și «necunoscută»');
  w(dir, 'data/species/allium-ursinum.json', RAMSONS);
  fs.unlinkSync(path.join(dir, 'data/species/colchicum-autumnale.json'));
  o = cli(['--root', dir]);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /xx-test\.json: species_unknown \(species\[2\]\)/);
  w(dir, 'data/species/colchicum-autumnale.json', SAFFRON);
  w(dir, 'data/species/wrong-name.json', Object.assign(clone(LYNX), {id: 'lynx-pardinus', latin: 'Lynx pardinus'}));
  w(dir, 'data/species/broken.json', '{ nu e json');
  o = cli(['--root', dir]);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /wrong-name\.json: file_name/);
  assert.match(o.stdout, /broken\.json: json/);
  assert.match(o.stdout, /wrong-name\.json: species_orphan/);
});

test('fișiere dist rămase fără manifest sunt șterse la rulare și semnalate la --check; example.json rămâne', () => {
  const dir = repo();
  cli(['--root', dir]);
  w(dir, 'data/dist/old-pack.json', '{}');
  w(dir, 'data/dist/example.json', '{}');
  let o = cli(['--root', dir, '--check']);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /data\/dist\/old-pack\.json: out of date/);
  assert.ok(!/example\.json/.test(o.stdout));
  o = cli(['--root', dir]);
  assert.equal(o.status, 0);
  assert.ok(!fs.existsSync(path.join(dir, 'data/dist/old-pack.json')));
  assert.ok(fs.existsSync(path.join(dir, 'data/dist/example.json')));
});

test('--split: un pachet descărcat din pagină se desparte în specii + manifest și se reasamblează identic', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-split-'));
  for (const f of ['schema.json', 'pack.schema.json']) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  const pack = mkPack({id: 'xx-split', title: {en: 'Split me'}});
  const src = path.join(dir, 'vietar-pack-xx-split.json');
  fs.writeFileSync(src, JSON.stringify(pack));
  let o = cli(['--root', dir, '--split', src]);
  assert.equal(o.status, 0, o.stdout + o.stderr);
  assert.match(o.stdout, /4 file\(s\) written/);
  for (const f of ['data/species/lynx-lynx.json', 'data/species/allium-ursinum.json', 'data/species/colchicum-autumnale.json', 'data/packs/xx-split.json']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.equal(JSON.parse(r(dir, 'data/packs/xx-split.json')).count, 3);
  o = cli(['--root', dir]);
  assert.equal(o.status, 0, o.stdout);
  assert.deepEqual(JSON.parse(r(dir, 'data/dist/xx-split.json')), pack);
  // a doua despărțire: nimic nou de scris
  o = cli(['--root', dir, '--split', src]);
  assert.equal(o.status, 0);
  assert.match(o.stdout, /^0 file\(s\) written/);
});

test('--split: fișiere existente diferite → conflict (cod 1, nimic scris) până la --force', () => {
  const dir = repo();
  const pack = mkPack({id: 'xx-test'});
  pack.species[0].names.ro = 'Alt nume';
  const src = path.join(dir, 'incoming.json');
  fs.writeFileSync(src, JSON.stringify(pack));
  const before = r(dir, 'data/species/lynx-lynx.json');
  let o = cli(['--root', dir, '--split', src]);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /exist and differ.*lynx-lynx\.json/);
  assert.equal(r(dir, 'data/species/lynx-lynx.json'), before);
  o = cli(['--root', dir, '--split', src, '--force']);
  assert.equal(o.status, 0, o.stdout);
  assert.equal(JSON.parse(r(dir, 'data/species/lynx-lynx.json')).names.ro, 'Alt nume');
});

test('--split: pachet invalid sau JSON stricat → probleme, cod 1, nimic scris', () => {
  const dir = repo();
  const pack = mkPack({id: 'xx-bad', count: 99});
  const src = path.join(dir, 'bad.json');
  fs.writeFileSync(src, JSON.stringify(pack));
  let o = cli(['--root', dir, '--split', src]);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /count_mismatch/);
  assert.ok(!fs.existsSync(path.join(dir, 'data/packs/xx-bad.json')));
  fs.writeFileSync(src, '{ nu e json');
  o = cli(['--root', dir, '--split', src]);
  assert.equal(o.status, 1);
  assert.match(o.stdout, /json/);
});

test('--split: id-uri de specie ostile nu pot scrie în afara data/species', () => {
  const dir = repo();
  const pack = mkPack({id: 'xx-evil'}, [LYNX]);
  pack.species[0].id = '../../evil';
  const src = path.join(dir, 'evil.json');
  fs.writeFileSync(src, JSON.stringify(pack));
  const o = cli(['--root', dir, '--split', src]);
  assert.equal(o.status, 1);
  assert.ok(!fs.existsSync(path.join(dir, 'evil.json.json')) && !fs.existsSync(path.join(dir, '..', 'evil.json')));
  assert.ok(!fs.existsSync(path.join(dir, 'data/packs/xx-evil.json')));
});

test('depozitul real: build() nu raportează nicio problemă, iar toate pachetele dist sunt la zi', () => {
  const b = P.build(ROOT);
  assert.deepEqual(b.problems, []);
  assert.deepEqual(b.stale, []);
  const w = P.write(ROOT, true);
  assert.deepEqual(w.changed, []);
  assert.ok(b.outputs.length >= 5);
  for (const o of b.outputs) assert.deepEqual(E.validatePack(JSON.parse(o.text)), [], o.file);
});
