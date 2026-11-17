// Ajutoare comune pentru teste: schemele încărcate în motor, specii și pachete-model, un PNG valid generat la cerere.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import * as E from '../src/engine.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
export const SPECIES_SCHEMA = rd('schema.json');
export const PACK_SCHEMA = rd('pack.schema.json');
E.setSchemas(SPECIES_SCHEMA, PACK_SCHEMA);
export {E};
export const clone = (o) => JSON.parse(JSON.stringify(o));

/** PNG valid (RGB, o singură culoare) ca URI de date, ca testele de fotografii să afișeze o imagine reală. */
export function pngUri(w, h, rgb) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.alloc(1 + w * 3); for (let x = 0; x < w; x++) { row[1 + x * 3] = rgb[0]; row[2 + x * 3] = rgb[1]; row[3 + x * 3] = rgb[2]; }
  const raw = Buffer.concat(Array.from({length: h}, () => row));
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  return 'data:image/png;base64,' + png.toString('base64');
}

export const LYNX = {id: 'lynx-lynx', latin: 'Lynx lynx', kingdom: 'animalia', group: 'mammal', names: {en: 'Eurasian lynx', ro: 'Râs', hu: 'Hiúz', de: 'Luchs'}};
export const RAMSONS = {id: 'allium-ursinum', latin: 'Allium ursinum', kingdom: 'plantae', group: 'herb', names: {en: 'Ramsons', ro: 'Leurdă', de: 'Bärlauch'}, toxic: false,
  look_alike: [{id: 'colchicum-autumnale', note: {en: 'Leaves can be mistaken for each other.'}}]};
export const SAFFRON = {id: 'colchicum-autumnale', latin: 'Colchicum autumnale', kingdom: 'plantae', group: 'herb', names: {en: 'Meadow saffron', ro: 'Brândușă de toamnă'}, toxic: true,
  toxic_note: {en: 'Very poisonous.'}, look_alike: [{id: 'allium-ursinum', note: {en: 'Leaves can be mistaken for each other.'}}]};
export const MANIFEST = {id: 'xx-test', title: {en: 'Test pack'}, region: 'RO', version: '0.1.0', updated: '2026-11-17', licence: 'CC0-1.0', status: 'draft', authors: ['Tester'],
  species: ['lynx-lynx', 'allium-ursinum', 'colchicum-autumnale'], count: 3};

export function mkSpecies(over) { return Object.assign(clone(LYNX), over || {}); }
export function mkPack(over, speciesList) {
  const species = clone(speciesList || [LYNX, RAMSONS, SAFFRON]);
  const m = Object.assign(clone(MANIFEST), {species: species.map((s) => s.id), count: species.length});
  return Object.assign({format: E.FORMAT, format_version: E.FORMAT_VERSION}, m, {species}, over || {});
}
export function photo(over) {
  return Object.assign({data: pngUri(8, 8, [30, 140, 60]), alt: {en: 'A green square'}, author: 'Test Author', licence: 'CC-BY-4.0', source_url: 'https://commons.wikimedia.org/wiki/File:Test.png'}, over || {});
}
export function audio(over) { return Object.assign({url: 'https://xeno-canto.org/123456', recordist: 'Test Recordist', licence: 'CC-BY-4.0'}, over || {}); }
export const codes = (list) => list.map((p) => p.code);
export const has = (list, code, path) => list.some((p) => p.code === code && (path === undefined || p.path === path));
