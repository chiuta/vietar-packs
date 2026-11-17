/* VietAR Packs · interfața. Folosește din ambalaj: I18N, DATA, SPECIES_SCHEMA, PACK_SCHEMA, tr(), fmt() și motorul din engine.mjs.
   Sintaxă ES2017 scrisă în stil ES5; fără atribute style= (CSP strict). Starea stă în localStorage sub două chei (pachete importate și ciorna creatorului)
   și se verifică la fiecare citire: pachetele cu parseStore, ciorna cu parseDraft. Textele din pachete ajung în pagină doar prin textContent. */
var KEY_PACKS = 'vietar-packs.packs', KEY_DRAFT = 'vietar-packs.draft';
var TABS = ['browse', 'packs', 'build', 'guide'];
var MAX_FILE = 8000000, MAX_LINES = 20, NOTE_LANGS_DEFAULT = 'en';
var S = { packs: [], draft: null }, BUILT = [];
var V = { tab: 'browse', main: null, live: null, focus: '', confirm: '', pack: '', q: '', group: 'all', toxic: 'all', shown: 0, open: '', report: null, impText: '',
  form: null, formBase: null, formEdit: '', formErr: null, formEls: null, lookLang: '', lookNote: '', lookA: '', lookB: '', jsonText: '', jsonErr: null, listEl: null, countEl: null, chkEl: null, groupSel: null };
var cur = { el: null, lang: 'en', L: null };
var booted = false;
var EXAMPLE = '{\n  "photos": [{\n    "data": "data:image/webp;base64,(the picture as base64)",\n    "alt": {"en": "A lynx on a rock"},\n    "author": "Jane Doe",\n    "licence": "CC-BY-4.0",\n    "source_url": "https://commons.wikimedia.org/wiki/File:Lynx_lynx.jpg",\n    "commons_file": "File:Lynx lynx.jpg"\n  }],\n  "audio": [{\n    "url": "https://xeno-canto.org/123456",\n    "recordist": "John Roe",\n    "licence": "CC-BY-4.0"\n  }]\n}';

/* ---------- ajutoare DOM ---------- */
function h(tag, attrs, kids) {
  var e = document.createElement(tag), k;
  if (attrs) for (k in attrs) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  if (kids) for (var i = 0; i < kids.length; i++) {
    var c = kids[i];
    if (c === null || c === undefined || c === false) continue;
    e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  return e;
}
function makeL(lang) {
  return {
    lang: lang,
    t: function (k) { return tr(lang, k); },
    f: function (k) { var a = [tr(lang, k)]; for (var i = 1; i < arguments.length; i++) a.push(arguments[i]); return fmt.apply(null, a); }
  };
}
function plainObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
function copyOf(o) { return JSON.parse(JSON.stringify(o)); }
function langAttr(code) { return typeof code === 'string' && /^[a-z]{2,3}$/.test(code) ? code : null; }
function downloadBlob(name, blob) {
  try {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    return true;
  } catch (e) { return false; }
}
function downloadText(name, text) { return downloadBlob(name, new Blob([text], { type: 'application/json;charset=utf-8' })); }
// citește un fișier ca text; «done» primește textul, sau null când fișierul nu poate fi citit (mesajul e deja afișat)
function readText(file, done) {
  var L = cur.L;
  if (!file) return;
  if (file.size > MAX_FILE) { flash(L.t('i_err_big')); done(null); return; }
  var fr = new FileReader();
  fr.onload = function () { done(String(fr.result)); };
  fr.onerror = function () { flash(L.t('i_err_json')); done(null); };
  fr.readAsText(file, 'utf-8');
}
function flash(msg, lines) {
  var box = V.live;
  if (!box) return;
  box.textContent = '';
  if (msg) box.appendChild(h('p', { text: msg }));
  if (lines && lines.length) box.appendChild(h('ul', { class: 'vp-lines' }, lines.map(function (x) { return h('li', { text: x }); })));
  // dacă ultima salvare a ciornei a eșuat, mesajul acțiunii nu o ascunde: ciorna rămâne doar în pagina deschisă
  if (msg && V.saveFail && V.tab === 'build' && msg !== cur.L.t('e_draft_quota')) box.appendChild(h('p', { class: 'vp-bad', text: cur.L.t('e_draft_quota') }));
}
function field(label, control, id, cls, hint) {
  var kids = [h('label', { for: id, text: label }), control];
  if (hint) kids.push(h('span', { class: 'vp-fh', id: id + '-h', text: hint }));
  if (hint) control.setAttribute('aria-describedby', id + '-h');
  return h('div', { class: 'vp-f' + (cls ? ' ' + cls : '') }, kids);
}
function selectOf(id, options, value, onchange) {
  var s = h('select', { id: id, class: 'sel vp-inp' }, options.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
  s.value = value;
  if (s.value !== value) s.selectedIndex = 0;
  if (onchange) s.addEventListener('change', function () { onchange(s.value); });
  return s;
}
function textInput(id, value, onchange, attrs) {
  var a = { type: 'text', id: id, class: 'vp-inp', autocomplete: 'off', spellcheck: 'false' }, k;
  if (attrs) for (k in attrs) a[k] = attrs[k];
  var i = h('input', a);
  i.value = value || '';
  i.addEventListener('input', function () { onchange(i.value); });
  return i;
}
function areaInput(id, value, rows, onchange, mono) {
  var t = h('textarea', { id: id, class: 'vp-inp' + (mono ? ' vp-mono' : ''), rows: rows, autocomplete: 'off', spellcheck: 'false' });
  t.value = value || '';
  t.addEventListener('input', function () { onchange(t.value); });
  return t;
}
function refocus() {
  if (!V.focus) return;
  var f = document.getElementById(V.focus);
  if (f) { if (!/^(button|input|select|textarea|a)$/i.test(f.tagName)) f.setAttribute('tabindex', '-1'); f.focus(); }
  V.focus = '';
}
function problemLine(p) { return cur.L.t('v_' + p.code) + (p.path ? ' (' + p.path + ')' : ''); }
function problemLines(list) {
  var lines = list.slice(0, MAX_LINES).map(problemLine);
  if (list.length > MAX_LINES) lines.push(cur.L.f('i_more', list.length - MAX_LINES));
  return lines;
}
function tbl(L, headers, rows, labelId) {
  var t = h('table', { class: 'vp-tbl' });
  t.appendChild(h('thead', null, [h('tr', null, headers.map(function (k) { return h('th', { scope: 'col', text: L.t(k) }); }))]));
  t.appendChild(h('tbody', null, rows.map(function (r) {
    return h('tr', null, r.map(function (c, i) { return i === 0 ? h('th', { scope: 'row', text: c }) : h('td', { text: String(c) }); }));
  })));
  return h('div', { class: 'vp-tblwrap', role: 'region', tabindex: '0', 'aria-labelledby': labelId }, [t]);
}

/* ---------- starea salvată ---------- */
function readRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function store(key, text) { try { localStorage.setItem(key, text); return true; } catch (e) { return false; } }
function savePacks() { var text = JSON.stringify(S.packs); return text.length <= LIMITS.store_chars && store(KEY_PACKS, text); }
function saveDraft() {
  var text = JSON.stringify(S.draft), saved = text.length <= LIMITS.store_chars && store(KEY_DRAFT, text);
  V.saveFail = !saved;
  if (!saved) flash(cur.L.t('e_draft_quota'));
  return saved;
}
function isBuiltinId(id) { return BUILT.some(function (p) { return p.id === id; }); }
function builtinPacks() {
  var keys = typeof DATA === 'undefined' ? [] : Object.keys(DATA).sort(), out = [];
  keys.forEach(function (k) { var p = DATA[k]; if (plainObj(p) && !validatePack(p).length) out.push(p); });
  out.sort(function (a, b) { return b.species.length - a.species.length || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
  return out;
}
function allPacks() {
  return BUILT.map(function (p) { return { pack: p, builtin: true }; }).concat(S.packs.map(function (p) { return { pack: p, builtin: false }; }));
}
function itemOf(id) { var all = allPacks(); for (var i = 0; i < all.length; i++) if (all[i].pack.id === id) return all[i]; return null; }
function curItem() { return itemOf(V.pack) || allPacks()[0] || null; }
function cleanDraft(d) {
  var m = d.meta;
  if (m.status !== 'skeleton' && m.status !== 'draft') m.status = 'draft';
  if (PACK_LICENCES.indexOf(m.licence) < 0) m.licence = 'CC0-1.0';
  return d;
}

/* ---------- pornire ---------- */
function boot() {
  if (booted) return;
  booted = true;
  setSchemas(SPECIES_SCHEMA, PACK_SCHEMA);
  BUILT = builtinPacks();
  var st = parseStore(readRaw(KEY_PACKS));
  S.packs = st.packs.filter(function (p) { return !isBuiltinId(p.id); });
  S.draft = cleanDraft(parseDraft(readRaw(KEY_DRAFT)).draft);
  var first = allPacks()[0];
  V.pack = first ? first.pack.id : '';
  V.shown = LIMITS.shown;
  V.form = blankForm();
}

/* ---------- nume, etichete, legături ---------- */
function nm(map) { return nameIn(map, cur.lang); }
function nameNode(map, cls) {
  var n = nm(map), s = h('span', { class: cls || null, lang: langAttr(n.lang) }, [n.text]);
  if (n.fallback && n.text) s.appendChild(h('span', { class: 'vp-lc', text: ' (' + n.lang + ')' }));
  return s;
}
function textEl(tag, map, cls) { var n = nm(map); return h(tag, { class: cls || null, lang: langAttr(n.lang), text: n.text }); }
function packTitle(pack) { return nm(pack.title).text; }
function badge(text, cls) { return h('span', { class: 'vp-badge' + (cls ? ' ' + cls : ''), text: text }); }
function statusNote(L, pack) { return pack.status === 'reviewed' ? L.f('sn_reviewed', pack.reviewed_by, pack.reviewed_on) : L.t('sn_' + pack.status); }
// un text cu {0}, {1}… în care unele locuri primesc elemente (legături), nu doar text
function template(L, key, args) {
  var parts = L.t(key).split(/\{([0-9])\}/), out = document.createDocumentFragment(), i, a;
  for (i = 0; i < parts.length; i++) {
    if (i % 2 === 0) { if (parts[i]) out.appendChild(document.createTextNode(parts[i])); }
    else { a = args[+parts[i]]; if (a !== undefined && a !== null) out.appendChild(typeof a === 'object' ? a : document.createTextNode(String(a))); }
  }
  return out;
}
function extLink(url, text) { return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', text: text }); }
function licLink(code) { var u = licenceUrl(code); return u ? extLink(u, code) : h('span', { text: code }); }
function packFacts(L, pack, full) {
  var out = [], st = packStats(pack);
  out.push(h('p', { class: 'vp-status vp-st-' + pack.status }, [badge(L.t('st_' + pack.status), 'vp-badge-st'), ' ', statusNote(L, pack)]));
  out.push(h('p', { class: 'vp-meta', text: L.f('p_stats', st.count, st.toxic, st.photos, st.audio) }));
  if (full) {
    if (pack.description) out.push(textEl('p', pack.description, 'vp-meta'));
    out.push(h('p', { class: 'vp-meta', text: L.f('p_meta', pack.region, pack.version, pack.updated) }));
    var lic = h('p', { class: 'vp-meta' });
    lic.appendChild(template(L, 'p_lic', [licLink(pack.licence)]));
    out.push(lic);
    if (pack.authors && pack.authors.length) out.push(h('p', { class: 'vp-meta', text: L.f('p_by', pack.authors.join(', ')) }));
  }
  return out;
}
function filtered(pack) { return filterSpecies(pack.species, { q: V.q, group: V.group, toxic: V.toxic, lang: cur.lang }); }

/* ---------- răsfoire ---------- */
function speciesButton(L, sp) {
  var kids = [nameNode(sp.names, 'vp-n'), ' ', h('em', { class: 'vp-lat', text: sp.latin }), ' ', h('span', { class: 'vp-g', text: L.t('g_' + sp.group) })];
  if (sp.toxic === true) kids.push(' ', badge(L.t('d_tox_yes'), 'vp-badge-tox'));
  else if (sp.toxic === false) kids.push(' ', badge(L.t('d_tox_no')));
  return h('button', { type: 'button', class: 'btn vp-sp', id: 'vp-sp-' + sp.id, onclick: function () { V.open = sp.id; V.focus = 'vp-d-h'; render(); } }, kids);
}
function fillList() {
  var L = cur.L, it = curItem();
  if (!it || !V.listEl) return;
  var list = filtered(it.pack);
  V.countEl.textContent = L.f('b_count', list.length, it.pack.species.length);
  V.listEl.textContent = '';
  if (!list.length) { V.listEl.appendChild(h('p', { class: 'vp-hint', text: L.t('b_none') })); return; }
  var n = Math.min(V.shown, list.length), i;
  var ul = h('ul', { class: 'vp-list', id: 'vp-list', 'aria-label': L.t('b_list_l') });
  for (i = 0; i < n; i++) ul.appendChild(h('li', null, [speciesButton(L, list[i])]));
  V.listEl.appendChild(ul);
  if (n < list.length) {
    var more = Math.min(LIMITS.shown, list.length - n), firstNew = list[n].id;
    V.listEl.appendChild(h('button', { type: 'button', class: 'btn vp-more', id: 'vp-more', text: L.f('b_more', more), onclick: function () {
      V.shown += LIMITS.shown; V.focus = 'vp-sp-' + firstNew; fillList(); refocus();
    } }));
  }
}
function filterChanged() { V.shown = LIMITS.shown; fillList(); }
function backToList(id) {
  var it = curItem(), list = it ? filtered(it.pack) : [], idx = -1;
  list.forEach(function (s, i) { if (s.id === id) idx = i; });
  if (idx >= V.shown) V.shown = Math.ceil((idx + 1) / LIMITS.shown) * LIMITS.shown;
  V.open = ''; V.focus = idx >= 0 ? 'vp-sp-' + id : 'vp-q';
  render();
}
function namesList(sp) {
  var codes = Object.keys(sp.names).sort(function (a, b) {
    var ra = a === cur.lang ? 0 : a === 'en' ? 1 : 2, rb = b === cur.lang ? 0 : b === 'en' ? 1 : 2;
    return ra - rb || (a < b ? -1 : a > b ? 1 : 0);
  });
  return h('ul', { class: 'vp-names' }, codes.map(function (c) {
    return h('li', null, [h('span', { class: 'vp-lc', text: c }), ' ', h('span', { lang: langAttr(c), text: sp.names[c] })]);
  }));
}
function toxicBlock(L, sp) {
  var cls = sp.toxic === true ? ' vp-tox-yes' : sp.toxic === false ? ' vp-tox-no' : '';
  var box = h('div', { class: 'vp-tox' + cls });
  box.appendChild(h('p', { class: 'vp-tox-h', text: L.t(sp.toxic === true ? 'd_tox_yes' : sp.toxic === false ? 'd_tox_no' : 'd_tox_unk') }));
  if (sp.toxic === true && sp.toxic_note) {
    box.appendChild(h('h4', { text: L.t('d_tox_note_h') }));
    box.appendChild(textEl('p', sp.toxic_note, 'vp-pre'));
  }
  if (sp.toxic !== true) box.appendChild(h('p', { class: 'vp-hint', text: L.t('d_tox_warn') }));
  return box;
}
function photoFigure(L, p) {
  var cap = h('figcaption', { class: 'vp-cap' });
  cap.appendChild(template(L, 'd_photo_cap', [p.author, licLink(p.licence)]));
  if (p.source_url) { cap.appendChild(document.createTextNode(' · ')); cap.appendChild(extLink(p.source_url, L.t('d_original') + ' (' + hostOf(p.source_url) + ')')); }
  return h('figure', { class: 'vp-fig' }, [h('img', { class: 'vp-photo', src: p.data, alt: nm(p.alt).text, decoding: 'async', loading: 'lazy' }), cap]);
}
function detailView(L, pack, sp) {
  var by = indexById(pack), looks = lookAlikes(pack, sp.id);
  var box = h('section', { class: 'vp-detail', id: 'vp-detail', 'aria-labelledby': 'vp-d-h' });
  box.appendChild(h('button', { type: 'button', class: 'btn', id: 'vp-back', text: L.t('b_back'), onclick: function () { backToList(sp.id); } }));
  box.appendChild(h('h3', { class: 'vp-d-h', id: 'vp-d-h', tabindex: '-1' }, [nameNode(sp.names, 'vp-n'), ' ', h('em', { class: 'vp-lat', text: sp.latin })]));
  box.appendChild(h('p', { class: 'vp-meta', text: L.f('d_group', L.t('k_' + sp.kingdom), L.t('g_' + sp.group)) }));
  box.appendChild(toxicBlock(L, sp));
  box.appendChild(h('h4', { text: L.t('d_names_h') }));
  box.appendChild(namesList(sp));
  if (sp.notes) { box.appendChild(h('h4', { text: L.t('d_notes_h') })); box.appendChild(textEl('p', sp.notes, 'vp-pre')); }
  if (sp.source) box.appendChild(h('p', { class: 'vp-meta', text: L.f('d_source', sp.source) }));
  if (looks.length) {
    var ul = h('ul', { class: 'vp-looks' });
    looks.forEach(function (l) {
      var t = by[l.id];
      ul.appendChild(h('li', null, [
        h('button', { type: 'button', class: 'btn vp-lk', id: 'vp-look-' + l.id, onclick: function () { V.open = l.id; V.focus = 'vp-d-h'; render(); } }, [L.f('d_look_go', nm(t.names).text)]),
        ' ', textEl('span', l.note, 'vp-pre')
      ]));
    });
    box.appendChild(h('h4', { text: L.t('d_look_h') }));
    box.appendChild(h('p', { class: 'vp-hint', text: L.t('d_look_help') }));
    box.appendChild(ul);
  }
  if (sp.photos && sp.photos.length) {
    box.appendChild(h('h4', { text: L.t('d_photos_h') }));
    sp.photos.forEach(function (p) { box.appendChild(photoFigure(L, p)); });
  }
  if (sp.audio && sp.audio.length) {
    box.appendChild(h('h4', { text: L.t('d_audio_h') }));
    box.appendChild(h('p', { class: 'vp-hint', text: L.t('d_audio_note') }));
    var al = h('ul', { class: 'vp-audio' });
    sp.audio.forEach(function (a) {
      var li = h('li');
      li.appendChild(extLink(a.url, L.t('d_audio_open')));
      li.appendChild(document.createTextNode(' · '));
      li.appendChild(template(L, 'd_audio_cap', [a.recordist, licLink(a.licence)]));
      if (a.note) { li.appendChild(document.createTextNode(' · ')); li.appendChild(textEl('span', a.note)); }
      al.appendChild(li);
    });
    box.appendChild(al);
  }
  return box;
}
function panelBrowse(L) {
  var box = h('div', { class: 'vp-box' }), it = curItem();
  if (!it) { box.appendChild(h('h3', { text: L.t('b_h') })); box.appendChild(h('p', { class: 'vp-hint', text: L.t('b_nopack') })); return box; }
  V.pack = it.pack.id;
  if (V.open) {
    var sp = indexById(it.pack)[V.open];
    if (sp) { box.appendChild(detailView(L, it.pack, sp)); return box; }
    V.open = '';
  }
  box.appendChild(h('h3', { text: L.t('b_h') }));
  box.appendChild(h('p', { class: 'vp-hint', text: L.t('b_intro') }));
  var opts = allPacks().map(function (x) { return [x.pack.id, packTitle(x.pack) + ' · ' + L.t('st_' + x.pack.status)]; });
  var bar = h('div', { class: 'vp-bar' });
  bar.appendChild(field(L.t('b_pack'), selectOf('vp-pack', opts, V.pack, function (id) {
    V.pack = id; V.q = ''; V.group = 'all'; V.toxic = 'all'; V.shown = LIMITS.shown; V.open = ''; render();
  }), 'vp-pack'));
  box.appendChild(bar);
  packFacts(L, it.pack, false).forEach(function (e) { box.appendChild(e); });
  var st = packStats(it.pack), gopts = [['all', L.t('b_all_groups')]];
  GROUP_ORDER.forEach(function (g) { if (st.groups[g]) gopts.push([g, L.t('g_' + g) + ' (' + st.groups[g] + ')']); });
  if (V.group !== 'all' && !st.groups[V.group]) V.group = 'all';
  var q = textInput('vp-q', V.q, function (v) { V.q = v; filterChanged(); }, { type: 'search' });
  var filters = h('div', { class: 'vp-bar' });
  filters.appendChild(field(L.t('b_search'), q, 'vp-q', 'vp-f-wide', L.t('b_search_hint')));
  filters.appendChild(field(L.t('b_group'), selectOf('vp-grp', gopts, V.group, function (v) { V.group = v; filterChanged(); }), 'vp-grp'));
  filters.appendChild(field(L.t('b_toxic'), selectOf('vp-tox', [['all', L.t('b_tox_all')], ['yes', L.t('b_tox_yes')], ['no', L.t('b_tox_no')]], V.toxic, function (v) { V.toxic = v; filterChanged(); }), 'vp-tox'));
  box.appendChild(filters);
  V.countEl = h('p', { class: 'vp-count', id: 'vp-count', role: 'status', 'aria-live': 'polite' });
  V.listEl = h('div', { class: 'vp-listbox' });
  box.appendChild(V.countEl);
  box.appendChild(V.listEl);
  fillList();
  return box;
}

/* ---------- pachete: import, descărcare, ștergere ---------- */
function failImport(key, arg) { V.report = { err: key, arg: arg }; V.focus = 'vp-imp-rep'; render(); }
// adaugă (sau înlocuiește) un pachet deja verificat; întoarce {ok, replaced} sau {err, arg}; nu atinge ecranul
function addPack(pack) {
  var at = -1;
  if (isBuiltinId(pack.id)) return { err: 'i_err_builtin' };
  S.packs.forEach(function (x, i) { if (x.id === pack.id) at = i; });
  if (at < 0 && S.packs.length >= LIMITS.packs) return { err: 'i_err_full', arg: LIMITS.packs };
  var before = S.packs.slice();
  if (at >= 0) S.packs[at] = pack; else S.packs.push(pack);
  if (!savePacks()) { S.packs = before; return { err: 'e_quota' }; }
  V.pack = pack.id; V.q = ''; V.group = 'all'; V.toxic = 'all'; V.shown = LIMITS.shown; V.open = '';
  return { ok: true, replaced: at >= 0 };
}
function tryImport(text) {
  var L = cur.L, r = parseImport(text);
  V.report = null;
  if (r.error === 'invalid') { V.report = { problems: r.problems }; V.focus = 'vp-imp-rep'; render(); return; }
  if (r.error) { failImport(r.error === 'empty' ? 'i_err_empty' : r.error === 'big' ? 'i_err_big' : 'i_err_json'); return; }
  var a = addPack(r.pack);
  if (a.err) { failImport(a.err, a.arg); return; }
  V.impText = '';
  V.focus = 'vp-pk-h-' + r.pack.id; render();
  flash(L.f(a.replaced ? 'i_replaced' : 'i_done', packTitle(r.pack), r.pack.species.length));
}
function removePack(it) {
  var L = cur.L, id = it.pack.id, before = S.packs.slice();
  S.packs = S.packs.filter(function (x) { return x.id !== id; });
  if (!savePacks()) { S.packs = before; V.confirm = ''; render(); flash(L.t('e_quota')); return; }
  if (V.pack === id) { var f = allPacks()[0]; V.pack = f ? f.pack.id : ''; V.open = ''; V.q = ''; V.group = 'all'; V.toxic = 'all'; }
  V.confirm = ''; V.focus = 'vp-imp-h'; render();
  flash(L.f('p_removed', packTitle(it.pack)));
}
function confirmButton(L, id, key, sureKey, token, act) {
  var sure = V.confirm === token;
  return h('button', { type: 'button', class: 'btn' + (sure ? ' pri' : ''), id: id, text: L.t(sure ? sureKey : key), onclick: function () {
    if (!sure) { V.confirm = token; V.focus = id; render(); return; }
    act();
  } });
}
function groupTable(L, pack, labelId) {
  var st = packStats(pack), rows = [];
  GROUP_ORDER.forEach(function (g) { if (st.groups[g]) rows.push([L.t('g_' + g), st.groups[g]]); });
  return tbl(L, ['th_group', 'th_count'], rows, labelId);
}
function packCard(L, it) {
  var p = it.pack, id = p.id, card = h('section', { class: 'vp-pack', 'aria-labelledby': 'vp-pk-h-' + id });
  card.appendChild(h('h4', { class: 'vp-pk-h', id: 'vp-pk-h-' + id, tabindex: '-1' }, [h('span', { id: 'vp-pk-t-' + id, text: packTitle(p) }), ' ', badge(L.t(it.builtin ? 'p_built' : 'p_imp'))]));
  packFacts(L, p, true).forEach(function (e) { card.appendChild(e); });
  var bar = h('div', { class: 'vp-bar' });
  bar.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'vp-pk-open-' + id, text: L.t('p_open'), onclick: function () {
    V.pack = id; V.q = ''; V.group = 'all'; V.toxic = 'all'; V.shown = LIMITS.shown; V.open = ''; gotoTab('browse', 'vp-q');
  } }));
  bar.appendChild(h('button', { type: 'button', class: 'btn', id: 'vp-pk-dl-' + id, text: L.t('p_export'), onclick: function () { downloadText(packFileName(id), packText(p)); } }));
  if (!it.builtin) bar.appendChild(confirmButton(L, 'vp-pk-rm-' + id, 'p_remove', 'p_remove_sure', 'rm:' + id, function () { removePack(it); }));
  card.appendChild(bar);
  card.appendChild(h('h5', { class: 'vp-maph', id: 'vp-gr-h-' + id, text: L.t('p_groups_h') }));
  card.appendChild(groupTable(L, p, 'vp-pk-t-' + id + ' vp-gr-h-' + id));
  return card;
}
function errBox(L, id, titleKey, err) {
  var box = h('div', { class: 'vp-rep', id: id, tabindex: '-1' });
  if (!err) return box;
  if (err.key) { box.appendChild(h('p', { class: 'vp-bad', text: err.arg !== undefined ? L.f(err.key, err.arg) : L.t(err.key) })); return box; }
  box.appendChild(h('p', { class: 'vp-bad', text: L.t(titleKey) }));
  box.appendChild(h('ul', { class: 'vp-lines' }, problemLines(err.problems).map(function (x) { return h('li', { text: x }); })));
  return box;
}
function importBox(L) {
  var box = h('section', { class: 'vp-imp', 'aria-labelledby': 'vp-imp-h' });
  box.appendChild(h('h4', { id: 'vp-imp-h', tabindex: '-1', text: L.t('i_h') }));
  box.appendChild(h('p', { class: 'vp-hint', text: L.t('i_help') }));
  box.appendChild(field(L.t('i_ta_l'), areaInput('vp-imp-ta', V.impText, 6, function (v) { V.impText = v; }, true), 'vp-imp-ta'));
  var fi = h('input', { type: 'file', id: 'vp-imp-file', class: 'vp-inp', accept: '.json,application/json' });
  box.appendChild(field(L.t('i_file_l'), fi, 'vp-imp-file'));
  box.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'vp-imp-go', text: L.t('i_go'), onclick: function () {
    var f = fi.files && fi.files[0];
    if (f) { readText(f, function (t) { fi.value = ''; if (t !== null) tryImport(t); }); return; }
    tryImport(V.impText);
  } }));
  var r = V.report, rep;
  if (!r) rep = errBox(L, 'vp-imp-rep', 'i_err_pack', null);
  else if (r.err) rep = errBox(L, 'vp-imp-rep', 'i_err_pack', { key: r.err, arg: r.arg });
  else rep = errBox(L, 'vp-imp-rep', 'i_err_pack', { problems: r.problems });
  box.appendChild(rep);
  return box;
}
function panelPacks(L) {
  var box = h('div', { class: 'vp-box' });
  box.appendChild(h('h3', { text: L.t('p_h') }));
  box.appendChild(h('p', { class: 'vp-hint', text: L.t('p_intro') }));
  allPacks().forEach(function (it) { box.appendChild(packCard(L, it)); });
  box.appendChild(importBox(L));
  return box;
}

/* ---------- creare: formular, listă, specii asemănătoare, JSON, verificare ---------- */
function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
function blankForm() {
  return { latin: '', kingdom: 'animalia', group: 'mammal', name_en: '', name_ro: '', name_hu: '', name_de: '', x_lang: '', x_name: '', toxic: '', note_lang: cur.lang || NOTE_LANGS_DEFAULT, toxic_note: '', notes: '', source: '' };
}
function openForm(sp) {
  V.formEdit = sp ? sp.id : '';
  V.formBase = sp ? copyOf(sp) : null;
  V.form = sp ? speciesToForm(sp, cur.lang) : blankForm();
  V.formErr = null; V.jsonErr = null;
  V.jsonText = sp ? JSON.stringify(orderSpecies(sp), null, 2) : '';
}
function putLang(map, lang, text) {
  var m = {}, k;
  if (map) for (k in map) if (own(map, k)) m[k] = map[k];
  text = String(text || '').trim();
  if (text) m[lang] = text; else delete m[lang];
  return Object.keys(m).length ? m : null;
}
function setOptions(sel, opts, value) {
  sel.textContent = '';
  opts.forEach(function (o) { sel.appendChild(h('option', { value: o[0], text: o[1] })); });
  sel.value = value;
  if (sel.value !== value) sel.selectedIndex = 0;
}
function groupOptions(L, kingdom) { return GROUPS[kingdom].map(function (g) { return [g, L.t('g_' + g)]; }); }
// schimbarea limbii notelor: textele de acum se păstrează în «baza» speciei, iar câmpurile arată textele noii limbi
function switchNoteLang(v) {
  var L = cur.L, f = V.form, els = V.formEls, old = f.note_lang, nl = String(v || '').trim().toLowerCase();
  if (!/^[a-z]{2,3}$/.test(nl)) { els.nlang.value = old; flash(L.t('c_note_lang') + ': ' + L.t('v_pattern')); return; }
  els.nlang.value = nl;
  if (nl === old) return;
  var base = V.formBase ? copyOf(V.formBase) : {};
  var tn = putLang(base.toxic_note, old, f.toxic_note), nt = putLang(base.notes, old, f.notes);
  if (tn) base.toxic_note = tn; else delete base.toxic_note;
  if (nt) base.notes = nt; else delete base.notes;
  V.formBase = base;
  f.note_lang = nl;
  f.toxic_note = base.toxic_note && own(base.toxic_note, nl) ? base.toxic_note[nl] : '';
  f.notes = base.notes && own(base.notes, nl) ? base.notes[nl] : '';
  els.tnote.value = f.toxic_note; els.notes.value = f.notes;
}
function submitSpecies() {
  var L = cur.L, r = speciesFromForm(V.form, V.formBase), list = S.draft.species, editing = V.formEdit, sp = r.species;
  V.formErr = null;
  // întâi «există deja» (cel mai lămuritor mesaj când se alege numele latin al altei specii), apoi problemele de câmp, apoi limita
  if (list.some(function (s) { return s.id === sp.id && s.id !== editing; })) V.formErr = { key: 'c_exists' };
  else if (r.problems.length) V.formErr = { problems: r.problems };
  else if (!editing && list.length >= LIMITS.draft_species) V.formErr = { key: 'c_full', arg: LIMITS.draft_species };
  if (V.formErr) { V.focus = 'vp-f-err'; render(); return; }
  S.draft.species = editing ? replaceSpecies(list, editing, sp) : list.concat([sp]);
  saveDraft();
  openForm(null);
  V.focus = 'vp-f-latin'; render();
  flash(L.f(editing ? 'c_updated' : 'c_added', nm(sp.names).text));
}
function speciesForm(L) {
  var f = V.form, els = {}, box = h('section', { class: 'vp-form', 'aria-labelledby': 'vp-f-h' });
  V.formEls = els;
  box.appendChild(h('h4', { id: 'vp-f-h', text: L.t('c_sp_h') }));
  var bar = h('div', { class: 'vp-bar' });
  bar.appendChild(field(L.t('c_latin'), textInput('vp-f-latin', f.latin, function (v) { f.latin = v; }), 'vp-f-latin', 'vp-f-wide', L.t('c_latin_hint')));
  var groupSel = selectOf('vp-f-group', groupOptions(L, f.kingdom), f.group, function (v) { f.group = v; });
  var kingSel = selectOf('vp-f-kingdom', KINGDOMS.map(function (k) { return [k, L.t('k_' + k)]; }), f.kingdom, function (v) {
    f.kingdom = v;
    if (GROUPS[v].indexOf(f.group) < 0) f.group = GROUPS[v][0];
    setOptions(groupSel, groupOptions(L, v), f.group);
  });
  bar.appendChild(field(L.t('c_kingdom'), kingSel, 'vp-f-kingdom'));
  bar.appendChild(field(L.t('c_group'), groupSel, 'vp-f-group'));
  box.appendChild(bar);
  var names = h('div', { class: 'vp-bar' });
  ['en', 'ro', 'hu', 'de'].forEach(function (c) {
    names.appendChild(field(L.t('c_name_' + c), textInput('vp-f-name_' + c, f['name_' + c], function (v) { f['name_' + c] = v; }), 'vp-f-name_' + c));
  });
  names.appendChild(field(L.t('c_name_x'), textInput('vp-f-xlang', f.x_lang, function (v) { f.x_lang = v; }, { maxlength: 3, size: 4 }), 'vp-f-xlang', 'vp-f-short'));
  names.appendChild(field(L.t('c_name_xn'), textInput('vp-f-xname', f.x_name, function (v) { f.x_name = v; }), 'vp-f-xname'));
  box.appendChild(names);
  var tox = h('div', { class: 'vp-bar' });
  tox.appendChild(field(L.t('c_toxic'), selectOf('vp-f-toxic', [['', L.t('c_tox_unk')], ['yes', L.t('c_tox_yes')], ['no', L.t('c_tox_no')]], f.toxic, function (v) { f.toxic = v; }), 'vp-f-toxic'));
  els.nlang = textInput('vp-f-nlang', f.note_lang, function () {}, { maxlength: 3, size: 4 });
  els.nlang.addEventListener('change', function () { switchNoteLang(els.nlang.value); });
  tox.appendChild(field(L.t('c_note_lang'), els.nlang, 'vp-f-nlang', 'vp-f-short'));
  box.appendChild(tox);
  els.tnote = areaInput('vp-f-tnote', f.toxic_note, 3, function (v) { f.toxic_note = v; });
  els.notes = areaInput('vp-f-notes', f.notes, 4, function (v) { f.notes = v; });
  box.appendChild(field(L.t('c_tox_note'), els.tnote, 'vp-f-tnote'));
  box.appendChild(field(L.t('c_notes'), els.notes, 'vp-f-notes'));
  box.appendChild(field(L.t('c_source'), textInput('vp-f-source', f.source, function (v) { f.source = v; }), 'vp-f-source', 'vp-f-wide'));
  var act = h('div', { class: 'vp-bar' });
  act.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'vp-f-add', text: L.t(V.formEdit ? 'c_update' : 'c_add'), onclick: submitSpecies }));
  if (V.formEdit) act.appendChild(h('button', { type: 'button', class: 'btn', id: 'vp-f-cancel', text: L.t('c_cancel'), onclick: function () { openForm(null); V.focus = 'vp-f-latin'; render(); } }));
  box.appendChild(act);
  box.appendChild(errBox(L, 'vp-f-err', 'c_form_err', V.formErr));
  return box;
}
function metaField(L, key, label, hint, cls) {
  var m = S.draft.meta, i = textInput('vp-m-' + key, m[key], function (v) { m[key] = v; });
  i.addEventListener('change', function () { saveDraft(); fillCheck(); });
  return field(label, i, 'vp-m-' + key, cls, hint);
}
function metaBox(L) {
  var m = S.draft.meta, box = h('section', { class: 'vp-meta-box', 'aria-labelledby': 'vp-m-h' });
  box.appendChild(h('h4', { id: 'vp-m-h', text: L.t('c_meta_h') }));
  var a = h('div', { class: 'vp-bar' });
  a.appendChild(metaField(L, 'id', L.t('c_id'), L.t('c_id_hint'), 'vp-f-wide'));
  a.appendChild(metaField(L, 'title_en', L.t('c_title_en'), null, 'vp-f-wide'));
  box.appendChild(a);
  var b = h('div', { class: 'vp-bar' });
  b.appendChild(metaField(L, 'title_loc', L.t('c_title_loc'), null, 'vp-f-wide'));
  b.appendChild(metaField(L, 'loc_lang', L.t('c_loc_lang'), null, 'vp-f-short'));
  box.appendChild(b);
  var c = h('div', { class: 'vp-bar' });
  c.appendChild(metaField(L, 'region', L.t('c_region'), L.t('c_region_hint'), 'vp-f-short'));
  c.appendChild(metaField(L, 'version', L.t('c_version'), null, 'vp-f-short'));
  c.appendChild(field(L.t('c_licence'), selectOf('vp-m-licence', PACK_LICENCES.map(function (x) { return [x, x]; }), m.licence, function (v) { m.licence = v; saveDraft(); fillCheck(); }), 'vp-m-licence'));
  c.appendChild(field(L.t('c_status'), selectOf('vp-m-status', [['skeleton', L.t('st_skeleton')], ['draft', L.t('st_draft')]], m.status, function (v) { m.status = v; saveDraft(); fillCheck(); }), 'vp-m-status'));
  box.appendChild(c);
  box.appendChild(h('div', { class: 'vp-bar' }, [metaField(L, 'authors', L.t('c_authors'), null, 'vp-f-wide')]));
  return box;
}
function draftList(L) {
  var sps = S.draft.species, box = h('section', { class: 'vp-dlist', 'aria-labelledby': 'vp-d-lh' });
  box.appendChild(h('h4', { id: 'vp-d-lh', text: L.f('c_list_h', sps.length) }));
  if (!sps.length) { box.appendChild(h('p', { class: 'vp-hint', text: L.t('c_list_none') })); return box; }
  var ul = h('ul', { class: 'vp-dl' });
  sortSpecies(sps, cur.lang).forEach(function (sp) {
    var info = h('span', { class: 'vp-dl-i' }, [nameNode(sp.names, 'vp-n'), ' ', h('em', { class: 'vp-lat', text: sp.latin }), ' ', h('span', { class: 'vp-g', text: L.t('g_' + sp.group) })]);
    if (sp.toxic === true) info.appendChild(badge(L.t('d_tox_yes'), 'vp-badge-tox'));
    ul.appendChild(h('li', { class: 'vp-dl-row' }, [info, h('span', { class: 'vp-dl-b' }, [
      h('button', { type: 'button', class: 'btn', id: 'vp-d-edit-' + sp.id, text: L.t('c_edit'), 'aria-label': L.t('c_edit') + ': ' + nm(sp.names).text, onclick: function () { openForm(sp); V.focus = 'vp-f-latin'; render(); } }),
      confirmButton(L, 'vp-d-rm-' + sp.id, 'c_remove', 'c_remove_sure', 'drm:' + sp.id, function () {
        S.draft.species = removeSpecies(S.draft.species, sp.id);
        if (V.formEdit === sp.id) openForm(null);
        saveDraft(); V.confirm = ''; V.focus = 'vp-d-lh'; render();
        flash(L.f('c_removed', nm(sp.names).text));
      })
    ])]));
  });
  box.appendChild(ul);
  return box;
}
function pairsOf(list) {
  var by = {}, seen = {}, out = [];
  list.forEach(function (s) { by[s.id] = s; });
  list.forEach(function (s) {
    (s.look_alike || []).forEach(function (l) {
      var key = [s.id, l.id].sort().join('|');
      if (own(seen, key) || !own(by, l.id)) return;
      seen[key] = 1;
      out.push({ a: s, b: by[l.id], note: l.note });
    });
  });
  return out;
}
function linkSpecies() {
  var L = cur.L, list = S.draft.species, lang = String(V.lookLang || '').trim().toLowerCase(), note = String(V.lookNote || '').trim();
  if (V.lookA === V.lookB) { flash(L.t('c_look_self')); return; }
  if (!/^[a-z]{2,3}$/.test(lang)) { flash(L.t('c_note_lang') + ': ' + L.t('v_pattern')); return; }
  if (!note) { flash(L.t('c_look_need_note')); return; }
  var map = {}; map[lang] = note;
  var r = addLookAlike(list, V.lookA, V.lookB, map);
  if (r.error) { flash(L.t(r.error === 'full' ? 'c_look_full' : r.error === 'self' ? 'c_look_self' : 'c_look_need_two')); return; }
  var a = null, b = null;
  list.forEach(function (s) { if (s.id === V.lookA) a = s; if (s.id === V.lookB) b = s; });
  S.draft.species = r.list;
  if (V.formEdit) { var cs = null; r.list.forEach(function (s) { if (s.id === V.formEdit) cs = s; }); if (cs) { V.formBase = copyOf(cs); V.jsonText = JSON.stringify(orderSpecies(cs), null, 2); } }
  V.lookNote = '';
  saveDraft(); V.focus = 'vp-l-note'; render();
  flash(L.f('c_look_done', nm(a.names).text, nm(b.names).text));
}
function lookBox(L) {
  var sps = S.draft.species, box = h('section', { class: 'vp-look', 'aria-labelledby': 'vp-l-h' });
  box.appendChild(h('h4', { id: 'vp-l-h', text: L.t('c_look_h') }));
  box.appendChild(h('p', { class: 'vp-hint', text: L.t('c_look_help') }));
  if (sps.length < 2) { box.appendChild(h('p', { class: 'vp-hint', text: L.t('c_look_need_two') })); return box; }
  var ids = sps.map(function (s) { return s.id; });
  if (ids.indexOf(V.lookA) < 0) V.lookA = ids[0];
  if (ids.indexOf(V.lookB) < 0 || V.lookB === V.lookA) V.lookB = ids[ids[0] === V.lookA ? 1 : 0];
  if (!V.lookLang) V.lookLang = V.form.note_lang || cur.lang;
  var opts = sortSpecies(sps, cur.lang).map(function (s) { return [s.id, nm(s.names).text + ' (' + s.latin + ')']; });
  var bar = h('div', { class: 'vp-bar' });
  bar.appendChild(field(L.t('c_look_a'), selectOf('vp-l-a', opts, V.lookA, function (v) { V.lookA = v; }), 'vp-l-a'));
  bar.appendChild(field(L.t('c_look_b'), selectOf('vp-l-b', opts, V.lookB, function (v) { V.lookB = v; }), 'vp-l-b'));
  bar.appendChild(field(L.t('c_note_lang'), textInput('vp-l-lang', V.lookLang, function (v) { V.lookLang = v; }, { maxlength: 3, size: 4 }), 'vp-l-lang', 'vp-f-short'));
  box.appendChild(bar);
  box.appendChild(field(L.t('c_look_note'), areaInput('vp-l-note', V.lookNote, 3, function (v) { V.lookNote = v; }), 'vp-l-note'));
  box.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'vp-l-add', text: L.t('c_look_add'), onclick: linkSpecies }));
  box.appendChild(h('h5', { class: 'vp-maph', id: 'vp-l-ph', text: L.t('c_look_pairs_h') }));
  var pairs = pairsOf(sps);
  if (!pairs.length) { box.appendChild(h('p', { class: 'vp-hint', text: L.t('c_look_none') })); return box; }
  box.appendChild(h('ul', { class: 'vp-pairs', 'aria-labelledby': 'vp-l-ph' }, pairs.map(function (p) {
    var an = nm(p.a.names).text, bn = nm(p.b.names).text;
    return h('li', { class: 'vp-pair' }, [
      h('span', { class: 'vp-pair-t' }, [an + ' ↔ ' + bn + ': ', textEl('span', p.note, 'vp-pre')]),
      h('button', { type: 'button', class: 'btn', id: 'vp-l-un-' + p.a.id + '-' + p.b.id, text: L.f('c_look_unlink', an, bn), onclick: function () {
        S.draft.species = removeLookAlike(S.draft.species, p.a.id, p.b.id);
        if (V.formEdit) { var cs = null; S.draft.species.forEach(function (s) { if (s.id === V.formEdit) cs = s; }); if (cs) { V.formBase = copyOf(cs); V.jsonText = JSON.stringify(orderSpecies(cs), null, 2); } }
        saveDraft(); V.focus = 'vp-l-ph'; render();
      } })
    ]);
  })));
  return box;
}
function applyJson() {
  var L = cur.L, sp, editing = V.formEdit, list = S.draft.species;
  V.jsonErr = null;
  try { sp = JSON.parse(V.jsonText); } catch (e) { V.jsonErr = { key: 'c_json_bad' }; }
  if (!V.jsonErr) {
    var problems = plainObj(sp) ? validateSpecies(sp) : [{ code: 'type', path: '' }];
    if (problems.length) V.jsonErr = { problems: problems };
    else if (list.some(function (s) { return s.id === sp.id && s.id !== editing; })) V.jsonErr = { key: 'c_exists' };
  }
  if (V.jsonErr) { V.focus = 'vp-j-err'; render(); return; }
  S.draft.species = replaceSpecies(list, editing, sp);
  saveDraft();
  openForm(sp);
  V.focus = 'vp-f-latin'; render();
  flash(L.f('c_json_ok', nm(sp.names).text));
}
function jsonBox(L) {
  var box = h('section', { class: 'vp-json', 'aria-labelledby': 'vp-j-h' });
  box.appendChild(h('h4', { id: 'vp-j-h', text: L.t('c_json_h') }));
  box.appendChild(h('p', { class: 'vp-hint', text: L.t('c_json_help') }));
  var ta = areaInput('vp-j-ta', V.jsonText, 12, function (v) { V.jsonText = v; }, true);
  ta.setAttribute('aria-labelledby', 'vp-j-h');
  box.appendChild(h('div', { class: 'vp-f' }, [ta]));
  box.appendChild(h('button', { type: 'button', class: 'btn', id: 'vp-j-apply', text: L.t('c_json_apply'), onclick: applyJson }));
  box.appendChild(errBox(L, 'vp-j-err', 'c_json_err', V.jsonErr));
  return box;
}
function draftPack() { return draftToPack(S.draft, todayIso(new Date())); }
function fillCheck() {
  var L = cur.L, box = V.chkEl;
  if (!box) return;
  var n = S.draft.species.length, r = draftPack(), bad = !n || r.problems.length > 0;
  box.textContent = '';
  if (!n) box.appendChild(h('p', { class: 'vp-hint', text: L.t('c_empty') }));
  else if (r.problems.length) {
    box.appendChild(h('p', { class: 'vp-bad', text: L.f('c_problems', r.problems.length) }));
    box.appendChild(h('ul', { class: 'vp-lines' }, problemLines(r.problems).map(function (x) { return h('li', { text: x }); })));
  } else box.appendChild(h('p', { class: 'vp-ok', text: L.f('c_ok', n) }));
  [document.getElementById('vp-dl-pack'), document.getElementById('vp-use')].forEach(function (b) {
    if (!b) return;
    if (bad) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
  });
}
function checkedPack() {
  var L = cur.L, r = draftPack();
  if (!S.draft.species.length) { flash(L.t('c_empty')); return null; }
  if (r.problems.length) { flash(L.t('c_need_fix')); return null; }
  return r.pack;
}
function checkBox(L) {
  var box = h('section', { class: 'vp-check', 'aria-labelledby': 'vp-c-h' });
  box.appendChild(h('h4', { id: 'vp-c-h', text: L.t('c_check_h') }));
  V.chkEl = h('div', { class: 'vp-chk', id: 'vp-chk' });
  box.appendChild(V.chkEl);
  var bar = h('div', { class: 'vp-bar' });
  bar.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'vp-dl-pack', text: L.t('c_download'), onclick: function () {
    var p = checkedPack();
    if (p) downloadText(packFileName(p.id), packText(p));
  } }));
  bar.appendChild(h('button', { type: 'button', class: 'btn', id: 'vp-use', text: L.t('c_use'), onclick: function () {
    var p = checkedPack();
    if (!p) return;
    var a = addPack(p);
    flash(a.err ? (a.arg !== undefined ? L.f(a.err, a.arg) : L.t(a.err)) : L.f('c_used', packTitle(p)));
  } }));
  bar.appendChild(confirmButton(L, 'vp-clear', 'c_clear', 'c_clear_sure', 'clear', function () {
    S.draft = newDraft(); cleanDraft(S.draft); openForm(null); V.lookA = ''; V.lookB = ''; V.lookNote = '';
    saveDraft(); V.confirm = ''; V.focus = 'vp-m-id'; render();
    flash(L.t('c_cleared'));
  }));
  box.appendChild(bar);
  return box;
}
function panelBuild(L) {
  var box = h('div', { class: 'vp-box' });
  box.appendChild(h('h3', { text: L.t('c_h') }));
  box.appendChild(h('p', { class: 'vp-hint', text: L.t('c_intro') }));
  box.appendChild(metaBox(L));
  box.appendChild(speciesForm(L));
  box.appendChild(draftList(L));
  box.appendChild(lookBox(L));
  if (V.formEdit) box.appendChild(jsonBox(L));
  box.appendChild(checkBox(L));
  return box;
}

/* ---------- ghid ---------- */
function panelGuide(L) {
  var box = h('div', { class: 'vp-box' });
  box.appendChild(h('h3', { text: L.t('gd_h') }));
  box.appendChild(h('ol', { class: 'vp-steps' }, [1, 2, 3, 4, 5].map(function (i) { return h('li', { text: L.t('gd_' + i) }); })));
  box.appendChild(h('h4', { id: 'vp-ex-h', text: L.t('gd_ex_h') }));
  box.appendChild(h('p', { class: 'vp-hint', text: L.t('gd_ex_note') }));
  box.appendChild(h('pre', { class: 'vp-code', tabindex: '0', role: 'region', 'aria-labelledby': 'vp-ex-h' }, [h('code', { text: EXAMPLE })]));
  return box;
}

/* ---------- file și desenare ---------- */
var PANELS = { browse: panelBrowse, packs: panelPacks, build: panelBuild, guide: panelGuide };
function gotoTab(id, focusId) {
  V.tab = id; V.focus = focusId || ''; V.confirm = ''; V.report = null;
  flash('');
  render();
}
function tabsBar() {
  var L = cur.L, bar = h('div', { class: 'vp-tabs', role: 'tablist', 'aria-label': L.t('tabs_l') });
  TABS.forEach(function (id, i) {
    var on = id === V.tab;
    bar.appendChild(h('button', {
      type: 'button', class: 'btn vp-tab' + (on ? ' pri' : ''), role: 'tab', id: 'vp-tt-' + id, 'aria-selected': on ? 'true' : 'false', 'aria-controls': 'vp-p-' + id, tabindex: on ? '0' : '-1', text: L.t('tab_' + id),
      onclick: function () { gotoTab(id, 'vp-tt-' + id); },
      onkeydown: function (ev) {
        var j = null;
        if (ev.key === 'ArrowRight') j = i + 1; else if (ev.key === 'ArrowLeft') j = i - 1; else if (ev.key === 'Home') j = 0; else if (ev.key === 'End') j = TABS.length - 1;
        if (j === null) return;
        ev.preventDefault();
        j = (j + TABS.length) % TABS.length;
        gotoTab(TABS[j], 'vp-tt-' + TABS[j]);
      }
    }));
  });
  return bar;
}
function safetyBox(L) {
  return h('section', { class: 'vp-safe', id: 'vp-safe', 'aria-labelledby': 'vp-safe-h' }, [
    h('h3', { id: 'vp-safe-h', text: L.t('s_h') }),
    h('p', { text: L.t('s_1') }),
    h('p', { class: 'vp-strong', text: L.t('s_2') }),
    h('p', { text: L.t('s_3') })
  ]);
}
function render() {
  var main = V.main, L = cur.L;
  if (!main) return;
  main.textContent = '';
  V.listEl = null; V.countEl = null; V.chkEl = null; V.formEls = null;
  var root = h('div', { class: 'vp-root' });
  root.appendChild(safetyBox(L));
  root.appendChild(tabsBar());
  TABS.forEach(function (id) {
    var p = h('div', { class: 'vp-panel', role: 'tabpanel', id: 'vp-p-' + id, 'aria-labelledby': 'vp-tt-' + id, hidden: id !== V.tab });
    if (id === V.tab) p.appendChild(PANELS[id](L));
    root.appendChild(p);
  });
  main.appendChild(root);
  if (V.tab === 'build') fillCheck();
  refocus();
}

/* ---------- montare ---------- */
function mount(el, lang) {
  var prev = cur.lang;
  cur.el = el; cur.lang = lang; cur.L = makeL(lang);
  boot();
  // limba notelor urmează limba paginii cât timp formularul nu are încă nicio notă scrisă (ca notele să nu fie etichetate cu altă limbă decât cea în care se scriu)
  if (prev !== lang && V.form && !V.formEdit && V.form.note_lang === prev && !V.form.toxic_note && !V.form.notes) V.form.note_lang = lang;
  if (prev !== lang && V.lookLang === prev && !V.lookNote) V.lookLang = lang;
  var L = cur.L, card = el.parentNode;
  if (card && card.classList) card.classList.add('vp');
  el.textContent = '';
  V.live = h('div', { class: 'vp-msg', id: 'vp-live', role: 'status', 'aria-live': 'polite' });
  V.main = h('div', { class: 'vp-main' });
  el.appendChild(V.live);
  el.appendChild(V.main);
  var old = document.getElementById('vp-lim-card');
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var lim = h('section', { class: 'card rv vp vp-card-lim', id: 'vp-lim-card', 'aria-labelledby': 'vp-lim-h' }, [h('h2', { id: 'vp-lim-h', text: L.t('h_limits') }), h('ul', { class: 'vp-list-lim' }, [1, 2, 3, 4, 5, 6].map(function (i) { return h('li', { text: L.t('lim_' + i) }); }))]);
  if (card && card.insertAdjacentElement) card.insertAdjacentElement('afterend', lim);
  render();
}
