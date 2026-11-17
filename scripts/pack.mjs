#!/usr/bin/env node
// scripts/pack.mjs — asamblează pachetele de distribuție (data/dist/<id>.json) din fișierele de specii și din manifeste.
//
//   node scripts/pack.mjs                 validează data/species și data/packs, apoi scrie data/dist/<id>.json
//   node scripts/pack.mjs --check         nu scrie nimic: iese cu cod 1 dacă o problemă sau o diferență există (CI, teste)
//   node scripts/pack.mjs --split FILE    desparte un pachet descărcat din pagină (Creează → Descarcă) în fișiere de specii și un manifest
//                                         (--force suprascrie fișierele existente care diferă)
//   --root DIR                            alt depozit (teste)
//
// Surse:  data/species/<id>.json   o specie (schema.json), numele fișierului = id-ul
//         data/packs/<id>.json     manifest (pack.schema.json): titlu, regiune, versiune, lista de id-uri și numărul lor
// Ieșire: data/dist/<id>.json      pachetul complet (format «vietar-pack»), exact ce importă pagina; example.json din dist este un exemplu de format
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as E from '../src/engine.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const listJson = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : []);
export function loadSchemas(root) { E.setSchemas(readJson(path.join(root, 'schema.json')), readJson(path.join(root, 'pack.schema.json'))); }

/** Citește depozitul și întoarce {problems, outputs, stale}: problemele (cu fișierul lor), pachetele de scris și fișierele dist rămase fără manifest. */
export function build(root) {
  loadSchemas(root);
  const problems = [], speciesById = Object.create(null), outputs = [], used = new Set(), manifests = [], invalid = new Set(), where = Object.create(null);
  const add = (file, list) => { for (const p of list) problems.push({file, code: p.code, path: p.path}); };
  const sdir = path.join(root, 'data/species'), pdir = path.join(root, 'data/packs'), ddir = path.join(root, 'data/dist');
  for (const f of listJson(sdir)) {
    const rel = 'data/species/' + f;
    let sp;
    try { sp = readJson(path.join(sdir, f)); } catch (e) { problems.push({file: rel, code: 'json', path: ''}); continue; }
    if (!sp || typeof sp !== 'object' || Array.isArray(sp)) { problems.push({file: rel, code: 'type', path: ''}); continue; }
    const bad = E.validateSpecies(sp);
    add(rel, bad);
    if (typeof sp.id === 'string' && f !== sp.id + '.json') problems.push({file: rel, code: 'file_name', path: 'id'});
    if (bad.length) { if (typeof sp.id === 'string') invalid.add(sp.id); } else { speciesById[sp.id] = sp; where[sp.id] = rel; }
  }
  for (const f of listJson(pdir)) {
    const rel = 'data/packs/' + f;
    let m;
    try { m = readJson(path.join(pdir, f)); } catch (e) { problems.push({file: rel, code: 'json', path: ''}); continue; }
    const bad = E.validateManifest(m);
    add(rel, bad);
    if (m && typeof m.id === 'string' && f !== m.id + '.json') problems.push({file: rel, code: 'file_name', path: 'id'});
    if (!bad.length) manifests.push({file: rel, m});
  }
  for (const {file, m} of manifests) {
    const r = E.assemble(m, speciesById);
    // o specie cu fișier invalid e deja raportată: nu o mai numim și «necunoscută»
    add(file, r.problems.filter((p) => !(p.code === 'species_unknown' && invalid.has(m.species[+/\[([0-9]+)\]/.exec(p.path)[1]]))));
    for (const id of m.species) used.add(id);
    if (r.pack) outputs.push({file: 'data/dist/' + m.id + '.json', text: E.packText(r.pack)});
  }
  for (const id of Object.keys(speciesById)) if (!used.has(id)) problems.push({file: where[id], code: 'species_orphan', path: ''});
  const ids = new Set(outputs.map((o) => path.basename(o.file)));
  const stale = listJson(ddir).filter((f) => f !== 'example.json' && !ids.has(f)).map((f) => 'data/dist/' + f);
  return {problems, outputs, stale};
}

/** Scrie (sau doar compară, cu check) fișierele dist. Întoarce {problems, changed}. */
export function write(root, check) {
  const r = build(root), changed = [];
  const hard = r.problems.length > 0;
  for (const o of r.outputs) {
    const f = path.join(root, o.file);
    const cur = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
    if (cur === o.text) continue;
    changed.push(o.file);
    if (!check && !hard) { fs.mkdirSync(path.dirname(f), {recursive: true}); fs.writeFileSync(f, o.text); }
  }
  for (const s of r.stale) { changed.push(s); if (!check && !hard) fs.unlinkSync(path.join(root, s)); }
  return {problems: r.problems, changed};
}

/** Desparte un pachet construit în fișiere de specii + manifest. Întoarce {problems, conflicts, written}. */
export function split(root, file, force) {
  loadSchemas(root);
  let o;
  try { o = readJson(file); } catch (e) { return {problems: [{file, code: 'json', path: ''}], conflicts: [], written: []}; }
  const bad = E.validatePack(o);
  if (bad.length) return {problems: bad.map((p) => ({file, code: p.code, path: p.path})), conflicts: [], written: []};
  const {manifest, species} = E.splitPack(o);
  const jobs = species.map((s) => ({file: 'data/species/' + s.id + '.json', text: JSON.stringify(E.orderSpecies(s), null, 2) + '\n'}));
  jobs.push({file: 'data/packs/' + manifest.id + '.json', text: JSON.stringify(manifest, null, 2) + '\n'});
  const conflicts = [], written = [];
  for (const j of jobs) {
    const f = path.join(root, j.file);
    if (fs.existsSync(f) && fs.readFileSync(f, 'utf8') !== j.text && !force) conflicts.push(j.file);
  }
  if (conflicts.length) return {problems: [], conflicts, written};
  for (const j of jobs) {
    const f = path.join(root, j.file);
    if (fs.existsSync(f) && fs.readFileSync(f, 'utf8') === j.text) continue;
    fs.mkdirSync(path.dirname(f), {recursive: true});
    fs.writeFileSync(f, j.text);
    written.push(j.file);
  }
  return {problems: [], conflicts, written};
}

function main() {
  const args = process.argv.slice(2);
  const take = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
  const rootArg = take('--root');
  const root = path.resolve(rootArg || path.join(HERE, '..'));
  const splitFile = take('--split');
  const force = args.includes('--force');
  const check = args.includes('--check');
  const show = (ps) => ps.forEach((p) => console.log(p.file + ': ' + p.code + (p.path ? ' (' + p.path + ')' : '')));
  if (splitFile) {
    const r = split(root, path.resolve(splitFile), force);
    show(r.problems);
    if (r.conflicts.length) { console.log('These files exist and differ (use --force to overwrite): ' + r.conflicts.join(', ')); process.exit(1); }
    console.log(r.written.length + ' file(s) written' + (r.written.length ? ': ' + r.written.join(', ') : ''));
    process.exit(r.problems.length ? 1 : 0);
  }
  const r = write(root, check);
  show(r.problems);
  if (check) {
    for (const f of r.changed) console.log(f + ': out of date (run node scripts/pack.mjs)');
    console.log(r.problems.length || r.changed.length ? 'Not up to date.' : 'The packs in data/dist match data/species and data/packs.');
    process.exit(r.problems.length || r.changed.length ? 1 : 0);
  }
  console.log(r.problems.length ? r.problems.length + ' problem(s); nothing written.' : r.changed.length + ' file(s) written.');
  process.exit(r.problems.length ? 1 : 0);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
