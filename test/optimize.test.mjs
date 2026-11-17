// scripts/optimize.py: imaginea mare devine mică, fără EXIF, iar fragmentul JSON respectă schema și motorul.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {E, ROOT, clone, LYNX} from './helpers.mjs';

const havePil = spawnSync('python3', ['-c', 'import PIL']).status === 0;
const T = havePil ? test : test.skip;
const SCRIPT = path.join(ROOT, 'scripts/optimize.py');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vp-opt-'));
const run = (args) => spawnSync('python3', [SCRIPT, ...args], {encoding: 'utf8'});

/** Fotografie de probă cu EXIF (loc GPS + aparat) și orientare 6 (rotită), generată cu Pillow. */
function makeJpeg(file, w, h, exif) {
  const py = `
import sys
from PIL import Image
w, h, out, withexif = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4] == '1'
im = Image.new('RGB', (w, h))
px = im.load()
for x in range(w):
    for y in range(h):
        px[x, y] = ((x * 7) % 256, (y * 5) % 256, ((x + y) * 3) % 256)
kw = {}
if withexif:
    e = Image.Exif()
    e[0x010F] = 'SecretCamCo'; e[0x0110] = 'Model-Private-9000'; e[0x0112] = 6
    kw['exif'] = e.tobytes()
    kw['comment'] = b'private comment'
im.save(out, 'JPEG', quality=92, **kw)
`;
  const r = spawnSync('python3', ['-c', py, String(w), String(h), file, exif ? '1' : '0'], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
}
const parse = (r) => JSON.parse(r.stdout);
const decode = (uri) => Buffer.from(uri.split(',')[1], 'base64');
const dims = (buf) => {
  const py = 'import sys,io\nfrom PIL import Image\nim=Image.open(io.BytesIO(sys.stdin.buffer.read()))\nprint(im.width,im.height,im.format,len(im.getexif()),"icc" if im.info.get("icc_profile") else "-")';
  const r = spawnSync('python3', ['-c', py], {input: buf, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  const [w, h, f, n, icc] = r.stdout.trim().split(' ');
  return {w: +w, h: +h, f, exif: +n, icc};
};

T('o fotografie mare ajunge ≤640 px, WebP, fără EXIF, cu orientarea aplicată, și fragmentul trece verificarea motorului', () => {
  const d = tmp(), f = path.join(d, 'big.jpg');
  makeJpeg(f, 2400, 1600, true);
  const r = run([f, '--author', 'Jane Doe', '--licence', 'CC-BY-4.0', '--alt', 'Un râs', '--lang', 'ro', '--source-url', 'https://commons.wikimedia.org/wiki/File:Lynx_lynx.jpg', '--commons-file', 'File:Lynx lynx.jpg']);
  assert.equal(r.status, 0, r.stderr);
  const p = parse(r);
  assert.match(p.data, /^data:image\/webp;base64,/);
  assert.ok(p.data.length <= 120000, String(p.data.length));
  const info = dims(decode(p.data));
  assert.equal(info.f, 'WEBP');
  assert.ok(Math.max(info.w, info.h) <= 640);
  // orientarea 6 (90°) a fost aplicată: imaginea 2400×1600 devine în picioare, 1600×2400 → ≤640 pe latura lungă
  assert.ok(info.h > info.w, JSON.stringify(info));
  assert.equal(info.exif, 0);
  assert.equal(info.icc, '-');
  const bytes = decode(p.data).toString('latin1');
  assert.ok(!bytes.includes('SecretCamCo') && !bytes.includes('Model-Private') && !bytes.includes('private comment'));
  assert.deepEqual(p.alt, {ro: 'Un râs'});
  assert.equal(p.licence, 'CC-BY-4.0');
  assert.equal(p.commons_file, 'File:Lynx lynx.jpg');
  const sp = clone(LYNX); sp.photos = [p];
  assert.deepEqual(E.validateSpecies(sp), []);
});

T('o imagine mică nu e mărită; PNG cu transparență rămâne valid', () => {
  const d = tmp(), f = path.join(d, 'small.png');
  const py = 'from PIL import Image\nim=Image.new("RGBA",(100,60),(10,200,30,128))\nim.save(__import__("sys").argv[1])';
  assert.equal(spawnSync('python3', ['-c', py, f]).status, 0);
  const r = run([f, '--author', 'A', '--licence', 'CC0-1.0', '--alt', 'x']);
  assert.equal(r.status, 0, r.stderr);
  const p = parse(r);
  const info = dims(decode(p.data));
  assert.deepEqual([info.w, info.h], [100, 60]);
  assert.equal('source_url' in p, false);
  const sp = clone(LYNX); sp.photos = [p];
  assert.deepEqual(E.validateSpecies(sp), []);
});

T('o imagine foarte «zgomotoasă» e comprimată mai tare, ca să încapă în limită', () => {
  const d = tmp(), f = path.join(d, 'noise.png');
  const py = 'import os,sys\nfrom PIL import Image\nim=Image.frombytes("RGB",(900,900),os.urandom(900*900*3))\nim.save(sys.argv[1])';
  assert.equal(spawnSync('python3', ['-c', py, f]).status, 0);
  const r = run([f, '--author', 'A', '--licence', 'CC0-1.0', '--alt', 'zgomot']);
  assert.equal(r.status, 0, r.stderr);
  const p = parse(r);
  assert.ok(p.data.length <= 120000, String(p.data.length));
  const sp = clone(LYNX); sp.photos = [p];
  assert.deepEqual(E.validateSpecies(sp), []);
});

T('argumente greșite: licență necunoscută, adresă http, fișier lipsit, alt gol, limbă stricată', () => {
  const d = tmp(), f = path.join(d, 'a.jpg');
  makeJpeg(f, 50, 50, false);
  const base = [f, '--author', 'A', '--licence', 'CC0-1.0', '--alt', 'x'];
  assert.notEqual(run([f, '--author', 'A', '--licence', 'MIT', '--alt', 'x']).status, 0);
  assert.notEqual(run([...base, '--source-url', 'http://example.org/a']).status, 0);
  assert.notEqual(run([...base, '--commons-file', 'Lynx.jpg']).status, 0);
  assert.notEqual(run([f, '--author', 'A', '--licence', 'CC0-1.0', '--alt', '']).status, 0);
  assert.notEqual(run([...base, '--lang', 'RO']).status, 0);
  const missing = run([path.join(d, 'nu-exista.jpg'), '--author', 'A', '--licence', 'CC0-1.0', '--alt', 'x']);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Eroare/);
  fs.writeFileSync(path.join(d, 'text.jpg'), 'nu sunt o imagine');
  assert.equal(run([path.join(d, 'text.jpg'), '--author', 'A', '--licence', 'CC0-1.0', '--alt', 'x']).status, 1);
});

T('--out scrie fragmentul într-un fișier și mesajul de mărime merge pe stderr', () => {
  const d = tmp(), f = path.join(d, 'a.jpg'), o = path.join(d, 'out.json');
  makeJpeg(f, 300, 200, false);
  const r = run([f, '--author', 'A', '--licence', 'CC-BY-SA-4.0', '--alt', 'x', '--out', o]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /300×200 px/);
  assert.equal(JSON.parse(fs.readFileSync(o, 'utf8')).licence, 'CC-BY-SA-4.0');
});
