/* VietAR Packs · motorul (fără ecran, fără rețea). Sintaxă ES2017; la asamblare se elimină cuvântul «export».
   Regulile de formă vin din schema.json și pack.schema.json (aceleași fișiere le folosește și scripts/validate.py): motorul le
   interpretează printr-un mic evaluator (type, required, additionalProperties, enum, pattern, lungimi, propertyNames, $ref),
   iar regulile pe care o schemă nu le poate spune (id = latin, toxic, specii asemănătoare, număr, date) sunt scrise aici și în validate.py. */

export const FORMAT = 'vietar-pack';
export const FORMAT_VERSION = 1;
export const LIMITS = { import_chars: 6000000, store_chars: 4000000, packs: 12, photo_budget: 3000000, draft_species: 400, shown: 24 };
export const KINGDOMS = ['animalia', 'plantae', 'fungi'];
export const GROUPS = {
  animalia: ['mammal', 'bird', 'reptile', 'amphibian', 'fish', 'invertebrate', 'other'],
  plantae: ['tree', 'shrub', 'herb', 'other'],
  fungi: ['fungus', 'other']
};
export const GROUP_ORDER = ['mammal', 'bird', 'reptile', 'amphibian', 'fish', 'invertebrate', 'tree', 'shrub', 'herb', 'fungus', 'other'];
export const PHOTO_LICENCES = ['CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'CC-BY-3.0', 'CC-BY-SA-3.0', 'PDM-1.0'];
export const PACK_LICENCES = ['CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0'];
export const AUDIO_LICENCES = ['CC-BY-4.0', 'CC-BY-SA-4.0', 'CC-BY-NC-4.0', 'CC-BY-NC-SA-4.0', 'CC-BY-ND-4.0', 'CC-BY-NC-ND-4.0', 'CC0-1.0'];
export const STATUSES = ['skeleton', 'draft', 'reviewed'];
export const FORM_KEYS = ['id', 'latin', 'kingdom', 'group', 'names', 'toxic', 'toxic_note', 'notes', 'source'];
var SPECIES_ORDER = ['id', 'latin', 'kingdom', 'group', 'names', 'toxic', 'toxic_note', 'notes', 'source', 'look_alike', 'photos', 'audio'];
var PACK_ORDER = ['id', 'title', 'description', 'region', 'version', 'updated', 'licence', 'status', 'reviewed_by', 'reviewed_on', 'authors', 'count'];
// codurile de formă (o schemă le-ar raporta ca „schema”); celelalte sunt reguli proprii
export const SHAPE_CODES = ['type', 'missing', 'extra', 'length', 'pattern', 'enum'];

var SCHEMAS = { species: null, pack: null };
export function setSchemas(species, pack) { SCHEMAS.species = species; SCHEMAS.pack = pack; }

function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
function typeOf(v) { return v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v; }
function isInt(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }
function sub(path, k) { return path ? path + '.' + k : k; }
function cpLen(s) {
  var n = 0, i, c, d;
  for (i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) { d = s.charCodeAt(i + 1); if (d >= 0xdc00 && d <= 0xdfff) i++; }
    n++;
  }
  return n;
}
var RXS = {};
function rx(p) { return RXS[p] || (RXS[p] = new RegExp(p)); }
function deref(root, node) {
  while (node && node.$ref) {
    var parts = String(node.$ref).replace(/^#\//, '').split('/');
    node = parts.reduce(function (o, k) { return o ? o[k] : undefined; }, root);
  }
  return node;
}

/* ---------- evaluator de schemă (submulțimea de cuvinte-cheie folosită de schema.json și pack.schema.json) ---------- */
function walk(root, node, v, path, out) {
  node = deref(root, node);
  if (!node) return;
  var t = node.type, ty = typeOf(v), i, k, keys;
  if (t) {
    var okType = t === 'integer' ? isInt(v) : t === 'number' ? (ty === 'number' && isFinite(v)) : ty === t;
    if (!okType) { out.push({ code: 'type', path: path }); return; }
  }
  if (node.enum && node.enum.indexOf(v) < 0) { out.push({ code: 'enum', path: path }); return; }
  if (ty === 'string') {
    var n = cpLen(v);
    if ((node.minLength !== undefined && n < node.minLength) || (node.maxLength !== undefined && n > node.maxLength)) out.push({ code: 'length', path: path });
    else if (node.pattern && !rx(node.pattern).test(v)) out.push({ code: 'pattern', path: path });
  } else if (ty === 'number') {
    if ((node.minimum !== undefined && v < node.minimum) || (node.maximum !== undefined && v > node.maximum)) out.push({ code: 'length', path: path });
  } else if (ty === 'array') {
    if ((node.minItems !== undefined && v.length < node.minItems) || (node.maxItems !== undefined && v.length > node.maxItems)) out.push({ code: 'length', path: path });
    if (node.items) for (i = 0; i < v.length; i++) walk(root, node.items, v[i], path + '[' + i + ']', out);
  } else if (ty === 'object') {
    keys = Object.keys(v);
    var props = node.properties || {};
    if ((node.minProperties !== undefined && keys.length < node.minProperties) || (node.maxProperties !== undefined && keys.length > node.maxProperties)) out.push({ code: 'length', path: path });
    (node.required || []).forEach(function (r) { if (!hasOwn(v, r)) out.push({ code: 'missing', path: sub(path, r) }); });
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      if (node.propertyNames && node.propertyNames.pattern && !rx(node.propertyNames.pattern).test(k)) out.push({ code: 'pattern', path: sub(path, k) });
      if (hasOwn(props, k)) walk(root, props[k], v[k], sub(path, k), out);
      else if (node.additionalProperties === false) out.push({ code: 'extra', path: sub(path, k) });
      else if (node.additionalProperties && typeof node.additionalProperties === 'object') walk(root, node.additionalProperties, v[k], sub(path, k), out);
    }
  }
}

/* ---------- text: caractere interzise, spații la margini ---------- */
function isSp(c) { return c === 32 || c === 160 || c === 0x1680 || (c >= 0x2000 && c <= 0x200a) || c === 0x202f || c === 0x205f || c === 0x3000; }
function badChar(c) {
  return c < 32 || (c >= 0x7f && c <= 0x9f) || (c >= 0x200b && c <= 0x200f) || c === 0x2028 || c === 0x2029 || (c >= 0x202a && c <= 0x202e) ||
    (c >= 0x2060 && c <= 0x2064) || (c >= 0x2066 && c <= 0x2069) || c === 0xfeff;
}
export function textBad(s, multi) {
  var n = s.length, i, c, d, a, b;
  if (!n) return false;
  for (i = 0; i < n; i++) {
    c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      d = i + 1 < n ? s.charCodeAt(i + 1) : 0;
      if (d >= 0xdc00 && d <= 0xdfff) { i++; continue; }
      return true;
    }
    if (c >= 0xdc00 && c <= 0xdfff) return true;
    if (badChar(c) && !(multi && c === 10)) return true;
  }
  a = s.charCodeAt(0); b = s.charCodeAt(n - 1);
  return isSp(a) || isSp(b) || (multi && (a === 10 || b === 10));
}
function textPass(v, path, out) {
  var i, ks;
  if (typeof v === 'string') {
    if (/^photos\[[0-9]+\]\.data$/.test(path)) return;
    if (textBad(v, /^notes\./.test(path))) out.push({ code: 'text', path: path });
  } else if (Array.isArray(v)) {
    for (i = 0; i < v.length; i++) textPass(v[i], path + '[' + i + ']', out);
  } else if (v && typeof v === 'object') {
    ks = Object.keys(v);
    for (i = 0; i < ks.length; i++) textPass(v[ks[i]], sub(path, ks[i]), out);
  }
}

/* ---------- date, nume, șiruri ---------- */
export function dateOk(s) {
  var m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(String(s));
  if (!m) return false;
  var y = +m[1], mo = +m[2], d = +m[3];
  if (y < 1000) return false;
  var t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}
export function todayIso(now) {
  var d = now instanceof Date ? now : new Date();
  var two = function (n) { return (n < 10 ? '0' : '') + n; };
  return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
}
export function slugOf(latin) { return String(latin).toLowerCase().replace(/ /g, '-'); }
export function tidyLatin(s) {
  return String(s).replace(/\s+/g, ' ').trim().split(' ').map(function (w, i) {
    w = w.toLowerCase();
    return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  }).join(' ');
}
var DIA = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
var FOLD = { 'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'đ': 'd', 'ł': 'l', 'ı': 'i' };
export function norm(s) {
  s = String(s).toLowerCase();
  if (s.normalize) s = s.normalize('NFD').replace(DIA, '');
  s = s.replace(/[ßæœøđłı]/g, function (c) { return FOLD[c]; });
  return s.replace(/\s+/g, ' ').trim();
}

/* ---------- validare: o specie ---------- */
export function validateSpecies(sp) {
  var out = [];
  if (!SCHEMAS.species) throw new Error('setSchemas() nu a fost apelat');
  walk(SCHEMAS.species, SCHEMAS.species, sp, '', out);
  textPass(sp, '', out);
  if (out.length) return out;
  if (sp.id !== slugOf(sp.latin)) out.push({ code: 'id_slug', path: 'id' });
  if (GROUPS[sp.kingdom].indexOf(sp.group) < 0) out.push({ code: 'group_kingdom', path: 'group' });
  if (sp.kingdom !== 'animalia' && !hasOwn(sp, 'toxic')) out.push({ code: 'toxic_required', path: 'toxic' });
  if (sp.toxic === true && !hasOwn(sp, 'toxic_note')) out.push({ code: 'toxic_note_required', path: 'toxic_note' });
  if (hasOwn(sp, 'toxic_note') && sp.toxic !== true) out.push({ code: 'toxic_note_unused', path: 'toxic_note' });
  if (sp.look_alike) {
    var seen = {};
    sp.look_alike.forEach(function (l, i) {
      if (l.id === sp.id) out.push({ code: 'look_self', path: 'look_alike[' + i + '].id' });
      else if (hasOwn(seen, l.id)) out.push({ code: 'look_dup', path: 'look_alike[' + i + '].id' });
      seen[l.id] = 1;
    });
  }
  return out;
}

/* ---------- validare: manifestul (fișier sursă: species = lista de id-uri) sau un pachet construit ---------- */
function packRules(view, out) {
  if (!dateOk(view.updated)) out.push({ code: 'date', path: 'updated' });
  if (hasOwn(view, 'reviewed_on') && !dateOk(view.reviewed_on)) out.push({ code: 'date', path: 'reviewed_on' });
  if (view.status === 'reviewed') {
    if (!hasOwn(view, 'reviewed_by')) out.push({ code: 'review_missing', path: 'reviewed_by' });
    if (!hasOwn(view, 'reviewed_on')) out.push({ code: 'review_missing', path: 'reviewed_on' });
  }
  var seen = {}, dup = false;
  view.species.forEach(function (id) { if (hasOwn(seen, id)) dup = true; seen[id] = 1; });
  if (dup) out.push({ code: 'dup_species', path: 'species' });
  if (view.count !== view.species.length) out.push({ code: 'count_mismatch', path: 'count' });
}
export function validateManifest(m) {
  var out = [];
  if (!SCHEMAS.pack) throw new Error('setSchemas() nu a fost apelat');
  if (!m || typeof m !== 'object' || Array.isArray(m)) return [{ code: 'type', path: '' }];
  walk(SCHEMAS.pack, SCHEMAS.pack, m, '', out);
  if (Array.isArray(m.species)) {
    var idPat = SCHEMAS.species.definitions.speciesId;
    m.species.forEach(function (id, i) {
      if (typeof id !== 'string') out.push({ code: 'type', path: 'species[' + i + ']' });
      else walk(SCHEMAS.species, idPat, id, 'species[' + i + ']', out);
    });
  }
  textPass(m, '', out);
  if (!out.length) packRules(m, out);
  return out;
}
export function validatePack(file) {
  var out = [], i, view = Object.create(null);
  if (!file || typeof file !== 'object' || Array.isArray(file)) return [{ code: 'type', path: '' }];
  if (file.format !== FORMAT || file.format_version !== FORMAT_VERSION) return [{ code: 'format', path: '' }];
  Object.keys(file).forEach(function (k) { if (k !== 'format' && k !== 'format_version') view[k] = file[k]; });
  var list = Array.isArray(file.species) ? file.species : null;
  if (list) view.species = list.map(function (s) { return s && typeof s === 'object' && !Array.isArray(s) && typeof s.id === 'string' ? s.id : 'x-x'; });
  walk(SCHEMAS.pack, SCHEMAS.pack, view, '', out);
  textPass(view, '', out);
  if (list) {
    list.forEach(function (s, j) {
      if (!s || typeof s !== 'object' || Array.isArray(s)) { out.push({ code: 'type', path: 'species[' + j + ']' }); return; }
      validateSpecies(s).forEach(function (p) { out.push({ code: p.code, path: 'species[' + j + ']' + (p.path ? '.' + p.path : '') }); });
    });
  }
  if (out.length) return out;
  packRules(view, out);
  if (out.length) return out;
  // specii asemănătoare: ținta trebuie să fie în pachet și relația să fie reciprocă (un avertisment nu are voie să lipsească dintr-o parte)
  var by = Object.create(null), photoChars = 0;
  list.forEach(function (s) { by[s.id] = s; });
  list.forEach(function (s, j) {
    (s.look_alike || []).forEach(function (l, x) {
      var target = by[l.id];
      var at = 'species[' + j + '].look_alike[' + x + '].id';
      if (!target) out.push({ code: 'look_unknown', path: at });
      else if (!(target.look_alike || []).some(function (b) { return b.id === s.id; })) out.push({ code: 'look_asym', path: at });
    });
    (s.photos || []).forEach(function (p) { photoChars += p.data.length; });
  });
  if (photoChars > LIMITS.photo_budget) out.push({ code: 'photo_budget', path: 'species' });
  return out;
}

/* ---------- pachete: asamblare din manifest + fișiere de specii, și invers ---------- */
export function assemble(manifest, speciesById) {
  var problems = validateManifest(manifest), list = [];
  if (Array.isArray(manifest && manifest.species)) {
    manifest.species.forEach(function (id, i) {
      if (typeof id === 'string' && hasOwn(speciesById, id)) list.push(speciesById[id]);
      else if (typeof id === 'string') problems.push({ code: 'species_unknown', path: 'species[' + i + ']' });
    });
  }
  if (problems.length) return { pack: null, problems: problems };
  var built = { format: FORMAT, format_version: FORMAT_VERSION };
  PACK_ORDER.forEach(function (k) { if (hasOwn(manifest, k)) built[k] = manifest[k]; });
  built.species = list;
  problems = validatePack(built);
  return { pack: problems.length ? null : built, problems: problems };
}
export function splitPack(pack) {
  var manifest = {};
  PACK_ORDER.forEach(function (k) { if (hasOwn(pack, k)) manifest[k] = pack[k]; });
  manifest.species = pack.species.map(function (s) { return s.id; });
  return { manifest: manifest, species: pack.species.slice() };
}
export function packText(pack) { return JSON.stringify(pack, null, 2) + '\n'; }
export function orderSpecies(sp) {
  var o = {};
  SPECIES_ORDER.forEach(function (k) { if (hasOwn(sp, k)) o[k] = sp[k]; });
  Object.keys(sp).forEach(function (k) { if (!hasOwn(o, k)) o[k] = sp[k]; });
  return o;
}

/* ---------- citire din text (import, depozit local) ---------- */
export function parseImport(text) {
  text = String(text);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  if (!text.trim()) return { error: 'empty' };
  if (text.length > LIMITS.import_chars) return { error: 'big' };
  var o;
  try { o = JSON.parse(text); } catch (e) { return { error: 'json' }; }
  var problems = validatePack(o);
  return problems.length ? { error: 'invalid', problems: problems } : { pack: o };
}
export function parseStore(text) {
  var out = { packs: [], dropped: 0 }, o;
  if (typeof text !== 'string' || !text || text.length > LIMITS.store_chars) return out;
  try { o = JSON.parse(text); } catch (e) { return out; }
  if (!Array.isArray(o)) return out;
  var ids = {};
  o.forEach(function (p) {
    if (out.packs.length >= LIMITS.packs) { out.dropped++; return; }
    if (validatePack(p).length || hasOwn(ids, p.id)) { out.dropped++; return; }
    ids[p.id] = 1;
    out.packs.push(p);
  });
  return out;
}

/* ---------- căutare, filtre, nume ---------- */
export function indexById(pack) {
  var by = Object.create(null);
  pack.species.forEach(function (s) { by[s.id] = s; });
  return by;
}
export function nameIn(map, lang) {
  if (map && hasOwn(map, lang)) return { text: map[lang], lang: lang, fallback: false };
  if (map && hasOwn(map, 'en')) return { text: map.en, lang: 'en', fallback: true };
  var ks = map ? Object.keys(map).sort() : [];
  return ks.length ? { text: map[ks[0]], lang: ks[0], fallback: true } : { text: '', lang: 'en', fallback: true };
}
export function searchKey(sp) {
  var parts = [sp.latin];
  Object.keys(sp.names).forEach(function (k) { parts.push(sp.names[k]); });
  return norm(parts.join(' '));
}
export function sortSpecies(list, lang) {
  var keyed = list.map(function (sp) { return { sp: sp, k: norm(nameIn(sp.names, lang).text) + '|' + sp.id }; });
  keyed.sort(function (a, b) { return a.k < b.k ? -1 : a.k > b.k ? 1 : 0; });
  return keyed.map(function (x) { return x.sp; });
}
export function filterSpecies(list, o) {
  var toks = norm(o.q || '').split(' ').filter(function (t) { return t; });
  var out = list.filter(function (sp) {
    if (o.group && o.group !== 'all' && sp.group !== o.group) return false;
    if (o.toxic === 'yes' && sp.toxic !== true) return false;
    if (o.toxic === 'no' && sp.toxic === true) return false;
    if (toks.length) {
      var key = searchKey(sp);
      for (var i = 0; i < toks.length; i++) if (key.indexOf(toks[i]) < 0) return false;
    }
    return true;
  });
  return sortSpecies(out, o.lang || 'en');
}
// specii asemănătoare: cele declarate de specie plus cele care o declară pe ea (relația e citită în ambele sensuri)
export function lookAlikes(pack, id) {
  var by = indexById(pack), me = by[id], out = [], seen = {};
  if (me && me.look_alike) me.look_alike.forEach(function (l) { if (by[l.id] && !hasOwn(seen, l.id)) { seen[l.id] = 1; out.push({ id: l.id, note: l.note }); } });
  pack.species.forEach(function (sp) {
    if (sp.id === id || hasOwn(seen, sp.id) || !sp.look_alike) return;
    sp.look_alike.forEach(function (l) { if (l.id === id && !hasOwn(seen, sp.id)) { seen[sp.id] = 1; out.push({ id: sp.id, note: l.note }); } });
  });
  return out;
}
export function packStats(pack) {
  var st = { count: pack.species.length, toxic: 0, photos: 0, audio: 0, groups: {} };
  pack.species.forEach(function (s) {
    if (s.toxic === true) st.toxic++;
    st.photos += (s.photos || []).length;
    st.audio += (s.audio || []).length;
    st.groups[s.group] = (st.groups[s.group] || 0) + 1;
  });
  return st;
}
export function licenceUrl(code) {
  var m = /^CC-BY((?:-NC)?(?:-SA|-ND)?)-([0-9][.][0-9])$/.exec(code);
  if (m) return 'https://creativecommons.org/licenses/by' + m[1].toLowerCase() + '/' + m[2] + '/';
  if (code === 'CC0-1.0') return 'https://creativecommons.org/publicdomain/zero/1.0/';
  if (code === 'PDM-1.0') return 'https://creativecommons.org/publicdomain/mark/1.0/';
  return '';
}
export function hostOf(url) { var m = /^https:\/\/([^/]+)/.exec(String(url)); return m ? m[1] : ''; }
export function packFileName(id) { return 'vietar-pack-' + id + '.json'; }

/* ---------- creatorul de pachete: schiță, formular, specii asemănătoare ---------- */
export function newDraft() {
  return { meta: { id: '', title_en: '', title_loc: '', loc_lang: '', region: '', version: '0.1.0', licence: 'CC0-1.0', status: 'draft', authors: '' }, species: [] };
}
var META_KEYS = ['id', 'title_en', 'title_loc', 'loc_lang', 'region', 'version', 'licence', 'status', 'authors'];
export function parseDraft(text) {
  var d = newDraft(), dropped = 0, o;
  if (typeof text !== 'string' || !text || text.length > LIMITS.store_chars) return { draft: d, dropped: 0 };
  try { o = JSON.parse(text); } catch (e) { return { draft: d, dropped: 0 }; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { draft: d, dropped: 0 };
  if (o.meta && typeof o.meta === 'object' && !Array.isArray(o.meta)) {
    META_KEYS.forEach(function (k) { if (hasOwn(o.meta, k) && typeof o.meta[k] === 'string' && o.meta[k].length <= 300) d.meta[k] = o.meta[k]; });
  }
  if (Array.isArray(o.species)) {
    var ids = {};
    o.species.forEach(function (s) {
      if (d.species.length >= LIMITS.draft_species || !s || typeof s !== 'object' || Array.isArray(s) || validateSpecies(s).length || hasOwn(ids, s.id)) { dropped++; return; }
      ids[s.id] = 1;
      d.species.push(s);
    });
  }
  return { draft: d, dropped: dropped };
}
export function draftToPack(d, today) {
  var m = d.meta, title = {}, authors = String(m.authors || '').split(/[,\n]/).map(function (a) { return a.trim(); }).filter(function (a) { return a; });
  if (m.title_en) title.en = m.title_en;
  if (m.loc_lang && m.title_loc) title[m.loc_lang] = m.title_loc;
  var pack = { format: FORMAT, format_version: FORMAT_VERSION, id: m.id, title: title, region: m.region, version: m.version, updated: today, licence: m.licence, status: m.status };
  if (authors.length) pack.authors = authors;
  pack.count = d.species.length;
  pack.species = d.species.map(orderSpecies);
  return { pack: pack, problems: validatePack(pack) };
}
export function speciesFromForm(f, base) {
  var sp = {}, names = {}, nl = f.note_lang || 'en', latin = tidyLatin(f.latin || '');
  var put = function (lang, text) { text = String(text || '').trim(); if (text) names[lang] = text; };
  put('en', f.name_en); put('ro', f.name_ro); put('hu', f.name_hu); put('de', f.name_de);
  if (String(f.x_name || '').trim()) names[String(f.x_lang || '').trim().toLowerCase()] = String(f.x_name).trim();
  sp.id = slugOf(latin); sp.latin = latin; sp.kingdom = f.kingdom; sp.group = f.group; sp.names = names;
  if (f.toxic === 'yes') sp.toxic = true; else if (f.toxic === 'no') sp.toxic = false;
  var langMap = function (old, text) {
    var m = {}, k;
    if (old) for (k in old) if (hasOwn(old, k)) m[k] = old[k];
    text = String(text || '').trim();
    if (text) m[nl] = text; else delete m[nl];
    return Object.keys(m).length ? m : null;
  };
  var tn = langMap(base && base.toxic_note, f.toxic_note), nt = langMap(base && base.notes, f.notes);
  if (tn) sp.toxic_note = tn;
  if (nt) sp.notes = nt;
  if (String(f.source || '').trim()) sp.source = String(f.source).trim();
  if (base) Object.keys(base).forEach(function (k) { if (FORM_KEYS.indexOf(k) < 0) sp[k] = base[k]; });
  sp = orderSpecies(sp);
  return { species: sp, problems: validateSpecies(sp) };
}
export function speciesToForm(sp, lang) {
  var f = { latin: sp.latin, kingdom: sp.kingdom, group: sp.group, name_en: sp.names.en || '', name_ro: sp.names.ro || '', name_hu: sp.names.hu || '', name_de: sp.names.de || '', x_lang: '', x_name: '', toxic: sp.toxic === true ? 'yes' : sp.toxic === false ? 'no' : '', note_lang: lang || 'en', toxic_note: '', notes: '', source: sp.source || '' };
  var other = Object.keys(sp.names).filter(function (k) { return ['en', 'ro', 'hu', 'de'].indexOf(k) < 0; }).sort();
  if (other.length) { f.x_lang = other[0]; f.x_name = sp.names[other[0]]; }
  var has = function (m) { return m && hasOwn(m, f.note_lang); };
  if (!has(sp.toxic_note) && !has(sp.notes)) {
    var first = Object.keys(sp.toxic_note || {}).concat(Object.keys(sp.notes || {}));
    if (first.length) f.note_lang = first[0];
  }
  f.toxic_note = sp.toxic_note && hasOwn(sp.toxic_note, f.note_lang) ? sp.toxic_note[f.note_lang] : '';
  f.notes = sp.notes && hasOwn(sp.notes, f.note_lang) ? sp.notes[f.note_lang] : '';
  return f;
}
// adaugă relația în ambele sensuri (nota e aceeași); întoarce lista nouă sau {error}
export function addLookAlike(list, aId, bId, note) {
  var a = null, b = null;
  list.forEach(function (s) { if (s.id === aId) a = s; if (s.id === bId) b = s; });
  if (!a || !b) return { error: 'unknown' };
  if (aId === bId) return { error: 'self' };
  var put = function (s, other) {
    var items = (s.look_alike || []).filter(function (l) { return l.id !== other; });
    if (items.length >= 8) return null;
    items.push({ id: other, note: note });
    var c = {}; Object.keys(s).forEach(function (k) { c[k] = s[k]; });
    c.look_alike = items;
    return orderSpecies(c);
  };
  var na = put(a, bId), nb = put(b, aId);
  if (!na || !nb) return { error: 'full' };
  return { list: list.map(function (s) { return s.id === aId ? na : s.id === bId ? nb : s; }) };
}
export function removeLookAlike(list, aId, bId) {
  return list.map(function (s) {
    if (s.id !== aId && s.id !== bId) return s;
    var other = s.id === aId ? bId : aId, c = {};
    Object.keys(s).forEach(function (k) { c[k] = s[k]; });
    var items = (s.look_alike || []).filter(function (l) { return l.id !== other; });
    if (items.length) c.look_alike = items; else delete c.look_alike;
    return c;
  });
}
export function removeSpecies(list, id) {
  return list.filter(function (s) { return s.id !== id; }).map(function (s) {
    if (!s.look_alike || !s.look_alike.some(function (l) { return l.id === id; })) return s;
    var c = {}; Object.keys(s).forEach(function (k) { c[k] = s[k]; });
    var items = s.look_alike.filter(function (l) { return l.id !== id; });
    if (items.length) c.look_alike = items; else delete c.look_alike;
    return c;
  });
}
// înlocuiește o specie (id-ul poate să se schimbe: trimiterile din celelalte specii se actualizează)
export function replaceSpecies(list, oldId, sp) {
  return list.map(function (s) {
    if (s.id === oldId) return sp;
    if (oldId === sp.id || !s.look_alike) return s;
    var c = {}; Object.keys(s).forEach(function (k) { c[k] = s[k]; });
    c.look_alike = s.look_alike.map(function (l) { return l.id === oldId ? { id: sp.id, note: l.note } : l; });
    return c;
  });
}
