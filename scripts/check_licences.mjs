#!/usr/bin/env node
// scripts/check_licences.mjs — verifică licențele și autorii fotografiilor din data/species.
//
//   node scripts/check_licences.mjs               verificări locale (fără rețea): licență permisă, atribuire, legătura către sursă
//   node scripts/check_licences.mjs --online      în plus: întreabă API-ul Wikimedia Commons pentru fiecare fotografie cu «commons_file»
//                                                 și compară licența și autorul (rețeaua se folosește doar cu această opțiune)
//   --root DIR                                    alt depozit (teste)
//
// Niveluri: «error» (licență diferită, fișier dispărut, căutare eșuată) oprește scriptul cu cod 1; «warning» doar se afișează.
// Fotografiile fără «commons_file» (fotografii proprii, din alte surse) nu pot fi verificate automat: ele rămân în sarcina celui care le adaugă.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as E from '../src/engine.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const API = 'https://commons.wikimedia.org/w/api.php';
export const USER_AGENT = 'VietAR-Packs-licence-check/0.2 (https://vietar-packs.chiuta.ro; trade-free, one request per batch, no tracking)';
const COMMONS_HOSTS = ['commons.wikimedia.org', 'upload.wikimedia.org'];

/** Fotografiile din specii, cu locul lor: [{species, index, photo}]. */
export function photosOf(speciesList) {
  const out = [];
  for (const sp of speciesList) (sp.photos || []).forEach((photo, index) => out.push({species: sp.id, index, photo}));
  return out;
}

const titleFromUrl = (url) => {
  const m = /^https:\/\/commons\.wikimedia\.org\/wiki\/(File:[^?#]+)/.exec(String(url || ''));
  if (!m) return '';
  try { return decodeURIComponent(m[1]).replace(/_/g, ' '); } catch (e) { return ''; }
};

/** Verificări fără rețea. */
export function offlineChecks(items) {
  const out = [];
  for (const {species, index, photo} of items) {
    const at = species + ' photos[' + index + ']';
    const add = (level, code, msg) => out.push({level, code, at, msg});
    const host = E.hostOf(photo.source_url);
    if (photo.commons_file && !COMMONS_HOSTS.includes(host)) add('warning', 'commons_host', 'commons_file is set, but source_url is not a Wikimedia Commons address');
    if (photo.commons_file && COMMONS_HOSTS.includes(host)) {
      const t = titleFromUrl(photo.source_url);
      if (t && t !== photo.commons_file.replace(/_/g, ' ')) add('warning', 'commons_url_mismatch', 'source_url names "' + t + '" but commons_file is "' + photo.commons_file + '"');
    }
    if (/^CC-BY/.test(photo.licence) && !photo.source_url) add('warning', 'attribution_link_missing', photo.licence + ' needs attribution: add source_url so readers can find the original');
  }
  return out;
}

/* ---------- Wikimedia Commons ---------- */
export function queryUrl(titles) {
  const p = new URLSearchParams({
    action: 'query', titles: titles.join('|'), prop: 'imageinfo', iiprop: 'extmetadata',
    iiextmetadatafilter: 'License|LicenseShortName|Artist', format: 'json', formatversion: '2', redirects: '1'
  });
  return API + '?' + p.toString();
}
/** Licența de pe Commons, în codul nostru (sau «» dacă nu o recunoaștem). */
export function commonsLicence(meta) {
  const get = (k) => (meta && meta[k] && typeof meta[k].value === 'string' ? meta[k].value.trim() : '');
  const lic = get('License').toLowerCase(), short = get('LicenseShortName');
  let m = /^cc-by(-sa)?-([0-9][.][0-9])$/.exec(lic);
  if (m) return 'CC-BY' + (m[1] ? '-SA' : '') + '-' + m[2];
  if (lic === 'cc0' || lic === 'cc-zero' || /^cc0/.test(lic)) return 'CC0-1.0';
  if (/^pd/.test(lic)) return 'PDM-1.0';
  m = /^CC BY(-SA)? ([0-9][.][0-9])$/.exec(short);
  if (m) return 'CC-BY' + (m[1] || '') + '-' + m[2];
  if (/^CC0/.test(short)) return 'CC0-1.0';
  if (/^public domain$/i.test(short)) return 'PDM-1.0';
  return '';
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ');
export function plainArtist(html) { return decode(String(html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim(); }

/** Citește răspunsul API-ului: {title → {missing, licence, artist}} (după redirecționări și normalizări). */
export function parseCommons(json, asked) {
  const q = json && json.query;
  if (!q || !Array.isArray(q.pages)) return null;
  const alias = new Map();
  for (const n of q.normalized || []) alias.set(n.from, n.to);
  for (const r of q.redirects || []) alias.set(r.from, r.to);
  const byTitle = new Map();
  for (const p of q.pages) {
    const meta = p.imageinfo && p.imageinfo[0] && p.imageinfo[0].extmetadata;
    byTitle.set(p.title, {missing: !!p.missing || !meta, licence: commonsLicence(meta), artist: plainArtist(meta && meta.Artist && meta.Artist.value)});
  }
  const out = new Map();
  for (const t of asked) {
    let to = t;
    for (let i = 0; i < 3 && alias.has(to); i++) to = alias.get(to);
    out.set(t, byTitle.get(to) || {missing: true, licence: '', artist: ''});
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Întreabă Commons, câte `batch` titluri într-o cerere; `fetchImpl` și `delay` pot fi înlocuite în teste. */
export async function onlineChecks(items, opts) {
  const o = Object.assign({fetchImpl: globalThis.fetch, batch: 20, delay: 300}, opts || {});
  const out = [];
  const wanted = items.filter((x) => x.photo.commons_file);
  const titles = [...new Set(wanted.map((x) => x.photo.commons_file))];
  const found = new Map();
  for (let i = 0; i < titles.length; i += o.batch) {
    const part = titles.slice(i, i + o.batch);
    let json = null, why = '';
    try {
      const res = await o.fetchImpl(queryUrl(part), {headers: {'User-Agent': USER_AGENT, Accept: 'application/json'}});
      if (!res.ok) why = 'HTTP ' + res.status;
      else { json = await res.json(); if (json && json.error) { why = 'API: ' + (json.error.code || 'error'); json = null; } }
    } catch (e) { why = String(e && e.message ? e.message : e); }
    const parsed = json ? parseCommons(json, part) : null;
    if (!parsed && !why) why = 'unexpected response';
    for (const t of part) found.set(t, parsed ? parsed.get(t) : {failed: why});
    if (i + o.batch < titles.length && o.delay) await sleep(o.delay);
  }
  for (const {species, index, photo} of wanted) {
    const at = species + ' photos[' + index + ']', r = found.get(photo.commons_file);
    const add = (level, code, msg) => out.push({level, code, at, msg});
    if (r.failed) { add('error', 'lookup_failed', photo.commons_file + ': ' + r.failed); continue; }
    if (r.missing) { add('error', 'file_missing', photo.commons_file + ' does not exist on Wikimedia Commons (renamed or deleted?)'); continue; }
    if (r.licence !== photo.licence) add('error', 'licence_mismatch', photo.commons_file + ': Commons says ' + (r.licence || 'a licence we do not accept') + ', the pack says ' + photo.licence);
    const a = E.norm(r.artist), b = E.norm(photo.author);
    if (a && b && !a.includes(b) && !b.includes(a)) add('warning', 'author_mismatch', photo.commons_file + ': Commons names "' + r.artist.slice(0, 80) + '", the pack says "' + photo.author + '"');
  }
  return out;
}

export function loadSpecies(root) {
  const dir = path.join(root, 'data/species');
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) : [];
}

async function main() {
  const args = process.argv.slice(2);
  const ri = args.indexOf('--root');
  const root = path.resolve(ri >= 0 ? args[ri + 1] : path.join(HERE, '..'));
  const online = args.includes('--online');
  const items = photosOf(loadSpecies(root));
  let problems = offlineChecks(items);
  if (online) problems = problems.concat(await onlineChecks(items));
  for (const p of problems) console.log(p.level + ' ' + p.code + ' — ' + p.at + ': ' + p.msg);
  const errors = problems.filter((p) => p.level === 'error').length;
  const checked = online ? items.filter((x) => x.photo.commons_file).length : 0;
  console.log(items.length + ' photo(s) read' + (online ? ', ' + checked + ' checked on Commons' : ' (use --online to compare with Wikimedia Commons)') + '; ' + errors + ' error(s), ' + (problems.length - errors) + ' warning(s).');
  process.exit(errors ? 1 : 0);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.join(HERE, '..');
  E.setSchemas(JSON.parse(fs.readFileSync(path.join(dir, 'schema.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(dir, 'pack.schema.json'), 'utf8')));
  await main();
}
