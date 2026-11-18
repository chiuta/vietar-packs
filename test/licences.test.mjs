// Verificatorul de licențe: verificări locale și comparația cu Wikimedia Commons (rețea simulată; nicio cerere reală).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {E, ROOT, clone, mkSpecies, photo, LYNX} from './helpers.mjs';
import * as L from '../scripts/check_licences.mjs';

const sp = (photos, id) => Object.assign(mkSpecies({photos}), id ? {id} : {});
const ph = (over) => photo(over);
const page = (title, meta) => ({title, imageinfo: [{extmetadata: meta}]});
const meta = (lic, short, artist) => ({License: {value: lic}, LicenseShortName: {value: short}, Artist: {value: artist || '<a href="//commons.wikimedia.org/wiki/User:X">Jane Doe</a>'}});
const reply = (pages, extra) => ({ok: true, status: 200, json: async () => ({batchcomplete: true, query: Object.assign({pages}, extra || {})})});

test('licențe: codurile Commons se traduc în codurile noastre', () => {
  assert.equal(L.commonsLicence(meta('cc-by-sa-4.0', 'CC BY-SA 4.0')), 'CC-BY-SA-4.0');
  assert.equal(L.commonsLicence(meta('cc-by-4.0', 'CC BY 4.0')), 'CC-BY-4.0');
  assert.equal(L.commonsLicence(meta('cc-by-3.0', 'CC BY 3.0')), 'CC-BY-3.0');
  assert.equal(L.commonsLicence(meta('cc-by-sa-3.0', 'CC BY-SA 3.0')), 'CC-BY-SA-3.0');
  assert.equal(L.commonsLicence(meta('cc0', 'CC0')), 'CC0-1.0');
  assert.equal(L.commonsLicence(meta('pd', 'Public domain')), 'PDM-1.0');
  assert.equal(L.commonsLicence(meta('', 'Public domain')), 'PDM-1.0');
  assert.equal(L.commonsLicence(meta('', 'CC BY-SA 2.5')), 'CC-BY-SA-2.5');
  assert.equal(L.commonsLicence(meta('gfdl', 'GFDL')), '');
  assert.equal(L.commonsLicence(meta('cc-by-nc-4.0', 'CC BY-NC 4.0')), '');
  assert.equal(L.commonsLicence(undefined), '');
});

test('autor: eticheta HTML devine text simplu', () => {
  assert.equal(L.plainArtist('<a href="x">Jane &amp; John Doe</a>'), 'Jane & John Doe');
  assert.equal(L.plainArtist('<span>  A\n B </span>'), 'A B');
  assert.equal(L.plainArtist(undefined), '');
});

test('verificări locale: gazdă, adresă nepotrivită, atribuire fără legătură', () => {
  const items = L.photosOf([
    sp([ph()], 'aaa-aa'),
    sp([ph({source_url: 'https://example.org/p.png', commons_file: 'File:Test.png'})], 'bbb-bb'),
    sp([ph({commons_file: 'File:Other.png'})], 'ccc-cc'),
    sp([ph({commons_file: 'File:Test.png', source_url: 'https://commons.wikimedia.org/wiki/File:Test.png'})], 'ddd-dd'),
    sp([ph({source_url: undefined, licence: 'CC-BY-4.0'})], 'eee-ee'),
    sp([ph({source_url: undefined, licence: 'CC0-1.0'})], 'fff-ff')
  ]);
  const out = L.offlineChecks(items);
  const at = (c) => out.filter((p) => p.code === c).map((p) => p.at);
  assert.deepEqual(at('commons_host'), ['bbb-bb photos[0]']);
  assert.deepEqual(at('commons_url_mismatch'), ['ccc-cc photos[0]']);
  assert.deepEqual(at('attribution_link_missing'), ['eee-ee photos[0]']);
  assert.ok(out.every((p) => p.level === 'warning'));
});

test('adresa de interogare: titluri separate cu «|», câmpuri cerute, fără chei secrete', () => {
  const u = new URL(L.queryUrl(['File:A b.png', 'File:C.png']));
  assert.equal(u.origin + u.pathname, 'https://commons.wikimedia.org/w/api.php');
  assert.equal(u.searchParams.get('titles'), 'File:A b.png|File:C.png');
  assert.equal(u.searchParams.get('prop'), 'imageinfo');
  assert.equal(u.searchParams.get('redirects'), '1');
  assert.ok(![...u.searchParams.keys()].some((k) => /key|token|secret|user/i.test(k)));
});

test('online: totul se potrivește → fără probleme; o singură cerere pentru mai multe fotografii', async () => {
  const items = L.photosOf([sp([ph({commons_file: 'File:A.png', author: 'Jane Doe'}), ph({commons_file: 'File:B.png', author: 'Jane Doe', licence: 'CC0-1.0'})], 'aaa-aa')]);
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({url, init}); return reply([page('File:A.png', meta('cc-by-4.0', 'CC BY 4.0')), page('File:B.png', meta('cc0', 'CC0'))]); };
  const out = await L.onlineChecks(items, {fetchImpl, delay: 0});
  assert.deepEqual(out, []);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers['User-Agent'], L.USER_AGENT);
  assert.match(L.USER_AGENT, /trade-free/);
});

test('online: licență diferită, fișier dispărut, autor diferit', async () => {
  const items = L.photosOf([
    sp([ph({commons_file: 'File:A.png', author: 'Jane Doe', licence: 'CC-BY-4.0'}), ph({commons_file: 'File:B.png', author: 'Jane Doe', licence: 'CC-BY-4.0'}), ph({commons_file: 'File:C.png', author: 'Someone Else', licence: 'CC-BY-4.0'})], 'aaa-aa')
  ]);
  const fetchImpl = async () => reply([
    page('File:A.png', meta('cc-by-sa-4.0', 'CC BY-SA 4.0')),
    {title: 'File:B.png', missing: true},
    page('File:C.png', meta('cc-by-4.0', 'CC BY 4.0'))
  ]);
  const out = await L.onlineChecks(items, {fetchImpl, delay: 0});
  const k = out.map((p) => p.level + ':' + p.code + ':' + p.at).sort();
  assert.deepEqual(k, ['error:file_missing:aaa-aa photos[1]', 'error:licence_mismatch:aaa-aa photos[0]', 'warning:author_mismatch:aaa-aa photos[2]']);
  assert.match(out.find((p) => p.code === 'licence_mismatch').msg, /CC-BY-SA-4\.0/);
});

test('online: redirecționări și normalizări ale titlului sunt urmate', async () => {
  const items = L.photosOf([sp([ph({commons_file: 'File:Old_name.png', author: 'Jane'})], 'aaa-aa')]);
  const fetchImpl = async () => reply([page('File:New name.png', meta('cc-by-4.0', 'CC BY 4.0'))], {normalized: [{from: 'File:Old_name.png', to: 'File:Old name.png'}], redirects: [{from: 'File:Old name.png', to: 'File:New name.png'}]});
  assert.deepEqual(await L.onlineChecks(items, {fetchImpl, delay: 0}), []);
});

test('online: rețea căzută, HTTP 500, eroare API și răspuns ciudat → «lookup_failed», niciodată «totul e bine»', async () => {
  const items = L.photosOf([sp([ph({commons_file: 'File:A.png'})], 'aaa-aa')]);
  const cases = {
    'rețea': async () => { throw new Error('ECONNRESET'); },
    'http': async () => ({ok: false, status: 503, json: async () => ({})}),
    'api': async () => ({ok: true, status: 200, json: async () => ({error: {code: 'ratelimited'}})}),
    'ciudat': async () => ({ok: true, status: 200, json: async () => ({hello: 1})}),
    'json stricat': async () => ({ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); }})
  };
  for (const [name, fetchImpl] of Object.entries(cases)) {
    const out = await L.onlineChecks(items, {fetchImpl, delay: 0});
    assert.deepEqual(out.map((p) => p.code), ['lookup_failed'], name);
    assert.equal(out[0].level, 'error', name);
  }
});

test('online: cererile sunt grupate (20 de titluri), cu pauză între grupuri; titlurile repetate se cer o dată', async () => {
  const photos = Array.from({length: 45}, (_, i) => ph({commons_file: 'File:P' + (i % 41) + '.png', author: 'Jane Doe'}));
  const items = L.photosOf([sp(photos.slice(0, 6), 'aaa-aa'), sp(photos.slice(6, 12), 'bbb-bb'), sp(photos.slice(12, 18), 'ccc-cc'), sp(photos.slice(18, 24), 'ddd-dd'), sp(photos.slice(24, 30), 'eee-ee'), sp(photos.slice(30, 36), 'fff-ff'), sp(photos.slice(36, 42), 'ggg-gg'), sp(photos.slice(42), 'hhh-hh')]);
  const asked = [];
  const fetchImpl = async (url) => { const t = new URL(url).searchParams.get('titles').split('|'); asked.push(t); return reply(t.map((x) => page(x, meta('cc-by-4.0', 'CC BY 4.0')))); };
  const t0 = Date.now();
  const out = await L.onlineChecks(items, {fetchImpl, delay: 20});
  assert.deepEqual(out, []);
  assert.deepEqual(asked.map((a) => a.length), [20, 20, 1]);
  assert.equal(new Set(asked.flat()).size, 41);
  assert.ok(Date.now() - t0 >= 35, 'pauză între cereri');
});

test('online: fotografiile fără «commons_file» nu sunt interogate', async () => {
  let called = 0;
  const out = await L.onlineChecks(L.photosOf([sp([ph()], 'aaa-aa')]), {fetchImpl: async () => { called++; return reply([]); }, delay: 0});
  assert.deepEqual(out, []);
  assert.equal(called, 0);
});

test('CLI: pe un depozit cu o fotografie nepotrivită (offline) iese cu 0 și afișează avertismentul; fără --online nu atinge rețeaua', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-lic-'));
  fs.mkdirSync(path.join(dir, 'data/species'), {recursive: true});
  const s = clone(LYNX); s.photos = [ph({commons_file: 'File:Other.png'})];
  fs.writeFileSync(path.join(dir, 'data/species/lynx-lynx.json'), JSON.stringify(s));
  const r = spawnSync('node', [path.join(ROOT, 'scripts/check_licences.mjs'), '--root', dir], {encoding: 'utf8', env: Object.assign({}, process.env, {HTTPS_PROXY: 'http://127.0.0.1:9', HTTP_PROXY: 'http://127.0.0.1:9'})});
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /warning commons_url_mismatch/);
  assert.match(r.stdout, /1 photo\(s\) read \(use --online/);
});

test('CLI --online fără rețea: cod 1 și «lookup_failed» (nu o trecere în tăcere)', () => {
  // Ermetic: punctul de acces e un port închis de pe aceeași mașină, deci rezultatul nu depinde de rețeaua (sau lipsa ei) de unde rulează testul.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-lic-'));
  fs.mkdirSync(path.join(dir, 'data/species'), {recursive: true});
  const s = clone(LYNX); s.photos = [ph({commons_file: 'File:Test.png'})];
  fs.writeFileSync(path.join(dir, 'data/species/lynx-lynx.json'), JSON.stringify(s));
  const r = spawnSync('node', [path.join(ROOT, 'scripts/check_licences.mjs'), '--root', dir, '--online', '--api', 'http://127.0.0.1:9/w/api.php'], {encoding: 'utf8', timeout: 60000});
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /error lookup_failed/);
});
