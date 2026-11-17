import test from 'node:test';
import assert from 'node:assert/strict';
import {E, SPECIES_SCHEMA, PACK_SCHEMA, clone, mkSpecies, mkPack, photo, audio, LYNX, RAMSONS, SAFFRON, MANIFEST, codes, has, pngUri} from './helpers.mjs';

const same = (a, b) => assert.deepEqual([...a].sort(), [...b].sort());

test('constantele motorului coincid cu schemele', () => {
  const p = SPECIES_SCHEMA.properties;
  same(p.kingdom.enum, E.KINGDOMS);
  same(p.group.enum, E.GROUP_ORDER);
  same(Object.values(E.GROUPS).flat().filter((g, i, a) => a.indexOf(g) === i), E.GROUP_ORDER);
  same(p.photos.items.properties.licence.enum, E.PHOTO_LICENCES);
  same(PACK_SCHEMA.properties.licence.enum, E.PACK_LICENCES);
  same(PACK_SCHEMA.properties.status.enum, E.STATUSES);
  for (const l of E.AUDIO_LICENCES) assert.match(l, new RegExp(p.audio.items.properties.licence.pattern), l);
  assert.equal(E.PACK_LICENCES.every((l) => E.licenceUrl(l).startsWith('https://creativecommons.org/')), true);
});

test('specie validă: modelele din test și datele din depozit', () => {
  assert.deepEqual(E.validateSpecies(clone(LYNX)), []);
  assert.deepEqual(E.validateSpecies(clone(RAMSONS)), []);
  assert.deepEqual(E.validateSpecies(clone(SAFFRON)), []);
  assert.deepEqual(E.validateSpecies(mkSpecies({photos: [photo()], audio: [audio({note: {en: 'song'}})], source: 'Own knowledge', notes: {en: 'Line one\nLine two'}})), []);
});

test('forma: câmpuri lipsă, necunoscute, de tip greșit, enumerări și lungimi', () => {
  const bad = (over, code, path) => {
    const sp = mkSpecies(over);
    for (const k of Object.keys(over)) if (over[k] === undefined) delete sp[k];
    const r = E.validateSpecies(sp);
    assert.ok(has(r, code, path), JSON.stringify([over, r]));
  };
  bad({id: undefined}, 'missing', 'id');
  bad({names: undefined}, 'missing', 'names');
  bad({names: {ro: 'Râs'}}, 'missing', 'names.en');
  bad({names: {}}, 'length', 'names');
  bad({names: {EN: 'x', en: 'y'}}, 'pattern', 'names.EN');
  bad({names: {en: ''}}, 'length', 'names.en');
  bad({names: {en: 'x'.repeat(81)}}, 'length', 'names.en');
  bad({colour: 'brown'}, 'extra', 'colour');
  bad({kingdom: 'protista'}, 'enum', 'kingdom');
  bad({group: 'dragon'}, 'enum', 'group');
  bad({toxic: 'yes'}, 'type', 'toxic');
  bad({id: 'Lynx-lynx'}, 'pattern', 'id');
  bad({id: 'lynx'}, 'pattern', 'id');
  bad({latin: 'lynx lynx'}, 'pattern', 'latin');
  bad({latin: 'Lynx'}, 'length', 'latin');
  bad({names: 'Lynx'}, 'type');
  bad({look_alike: [{id: 'a-b'}]}, 'missing', 'look_alike[0].note');
  bad({look_alike: new Array(9).fill({id: 'a-b', note: {en: 'x'}})}, 'length', 'look_alike');
  bad({photos: [photo({licence: 'All rights reserved'})]}, 'enum', 'photos[0].licence');
  bad({photos: [photo({data: 'data:image/svg+xml;base64,PHN2Zz4='})]}, 'pattern', 'photos[0].data');
  bad({photos: [photo({data: 'data:image/png;base64,' + 'A'.repeat(120001)})]}, 'length', 'photos[0].data');
  bad({photos: [photo({source_url: 'http://example.org/a.png'})]}, 'pattern', 'photos[0].source_url');
  bad({photos: [photo({source_url: 'javascript:alert(1)'})]}, 'pattern', 'photos[0].source_url');
  bad({photos: [photo({commons_file: 'Test.png'})]}, 'pattern', 'photos[0].commons_file');
  bad({photos: new Array(7).fill(photo())}, 'length', 'photos');
  bad({audio: [audio({url: 'https://example.org/123456'})]}, 'pattern', 'audio[0].url');
  bad({audio: [audio({url: 'https://xeno-canto.org.evil.test/1'})]}, 'pattern', 'audio[0].url');
  bad({audio: [audio({url: 'http://xeno-canto.org/123456'})]}, 'pattern', 'audio[0].url');
  bad({audio: [audio({licence: 'CC-BY-9.0'})]}, 'pattern', 'audio[0].licence');
  const noRec = audio(); delete noRec.recordist;
  bad({audio: [noRec]}, 'missing', 'audio[0].recordist');
});

test('licențele de sunet acceptate și respinse', () => {
  for (const l of E.AUDIO_LICENCES) assert.deepEqual(E.validateSpecies(mkSpecies({audio: [audio({licence: l})]})), [], l);
  for (const l of ['CC-BY', 'CC-BY-5.0', 'cc-by-4.0', 'CC-BY-4.0 ', 'GPL-3.0', 'CC-BY-ND-NC-4.0', 'CC0-4.0']) assert.ok(E.validateSpecies(mkSpecies({audio: [audio({licence: l})]})).length > 0, l);
  for (const url of ['https://xeno-canto.org/1', 'https://www.xeno-canto.org/999999999']) assert.deepEqual(E.validateSpecies(mkSpecies({audio: [audio({url})]})), [], url);
  for (const url of ['https://xeno-canto.org/1234567890', 'https://xeno-canto.org/', 'https://xeno-canto.org/12a', 'https://xeno-canto.org/1\n']) assert.ok(E.validateSpecies(mkSpecies({audio: [audio({url})]})).length > 0, JSON.stringify(url));
});

test('text: caractere de control, de direcție, nevăzute, surogate singure și spații la margini', () => {
  const field = (names) => E.validateSpecies(mkSpecies({names}));
  const nul = String.fromCharCode(0), esc = String.fromCharCode(27), nl = '\n';
  for (const [label, s] of [
    ['NUL', 'Ra' + nul], ['ESC', esc + 'Ra'], ['linie nouă', 'Ra' + nl + 'x'], ['tab', 'Ra' + String.fromCharCode(9) + 'x'],
    ['DEL', 'Ra' + String.fromCharCode(127)], ['C1', 'Ra' + String.fromCharCode(0x85)],
    ['RLO', 'Ra' + String.fromCharCode(0x202e) + 'x'], ['isolate', 'Ra' + String.fromCharCode(0x2066) + 'x'], ['spațiu de lățime zero', 'Ra' + String.fromCharCode(0x200b) + 'x'],
    ['BOM', String.fromCharCode(0xfeff) + 'Ra'], ['separator de linie', 'Ra' + String.fromCharCode(0x2028) + 'x'],
    ['surogat singur', 'Ra' + String.fromCharCode(0xd800)], ['surogat singur jos', String.fromCharCode(0xdc00) + 'Ra'],
    ['spațiu la început', ' Ra'], ['spațiu la sfârșit', 'Ra '], ['doar spații', '   '], ['NBSP la margine', String.fromCharCode(160) + 'Ra'], ['spațiu ideografic', 'Ra' + String.fromCharCode(0x3000)]
  ]) assert.ok(has(field({en: s}), 'text', 'names.en') || has(field({en: s}), 'length', 'names.en'), label);
  assert.deepEqual(field({en: 'Ra x'}), []);
  assert.deepEqual(field({en: 'Eurasian lynx (Lynx)'}), []);
  assert.deepEqual(field({en: 'R' + String.fromCodePoint(0x1f431) + 'x'}), [], 'perechea de surogate este un caracter valid');
  // linia nouă e permisă doar în «notes»
  assert.deepEqual(E.validateSpecies(mkSpecies({notes: {en: 'a\nb'}})), []);
  assert.ok(has(E.validateSpecies(mkSpecies({notes: {en: '\nab'}})), 'text', 'notes.en'));
  assert.ok(has(E.validateSpecies(mkSpecies({notes: {en: 'ab\n'}})), 'text', 'notes.en'));
  assert.ok(has(E.validateSpecies(mkSpecies({notes: {en: 'a\rb'}})), 'text', 'notes.en'));
  assert.ok(has(E.validateSpecies(mkSpecies({source: 'a\nb'})), 'text', 'source'));
  assert.ok(has(E.validateSpecies(mkSpecies({names: {en: 'ok'}, toxic_note: {en: 'a\nb'}, toxic: true})), 'text', 'toxic_note.en'));
});

test('lungimea se numără în caractere, nu în unități UTF-16', () => {
  const cat = String.fromCodePoint(0x1f431);
  assert.deepEqual(E.validateSpecies(mkSpecies({names: {en: cat.repeat(80)}})), []);
  assert.ok(has(E.validateSpecies(mkSpecies({names: {en: cat.repeat(81)}})), 'length', 'names.en'));
});

test('reguli proprii: id din numele latin, grup și regn, toxic, specii asemănătoare', () => {
  assert.ok(has(E.validateSpecies(mkSpecies({id: 'lynx-pardinus'})), 'id_slug', 'id'));
  assert.ok(has(E.validateSpecies(mkSpecies({group: 'tree'})), 'group_kingdom', 'group'));
  assert.ok(has(E.validateSpecies(Object.assign(clone(RAMSONS), {group: 'mammal'})), 'group_kingdom', 'group'));
  const noToxic = clone(RAMSONS); delete noToxic.toxic;
  assert.ok(has(E.validateSpecies(noToxic), 'toxic_required', 'toxic'));
  const fungus = {id: 'boletus-edulis', latin: 'Boletus edulis', kingdom: 'fungi', group: 'fungus', names: {en: 'Porcini'}};
  assert.ok(has(E.validateSpecies(fungus), 'toxic_required', 'toxic'));
  assert.deepEqual(E.validateSpecies(Object.assign({}, fungus, {toxic: false})), []);
  assert.deepEqual(E.validateSpecies(mkSpecies({toxic: false})), [], 'la animale indicatorul e opțional');
  const nn = clone(SAFFRON); delete nn.toxic_note;
  assert.ok(has(E.validateSpecies(nn), 'toxic_note_required', 'toxic_note'));
  assert.ok(has(E.validateSpecies(Object.assign(clone(RAMSONS), {toxic_note: {en: 'x'}})), 'toxic_note_unused', 'toxic_note'));
  assert.ok(has(E.validateSpecies(mkSpecies({look_alike: [{id: 'lynx-lynx', note: {en: 'x'}}]})), 'look_self'));
  assert.ok(has(E.validateSpecies(mkSpecies({look_alike: [{id: 'a-b', note: {en: 'x'}}, {id: 'a-b', note: {en: 'y'}}]})), 'look_dup', 'look_alike[1].id'));
  // regulile proprii nu se adaugă peste erorile de formă
  assert.deepEqual(codes(E.validateSpecies(mkSpecies({group: 'dragon', id: 'x-y'}))), ['enum']);
});

test('«__proto__» și alte chei ostile în specii sunt respinse, fără efecte asupra obiectelor', () => {
  const sp = JSON.parse('{"id":"lynx-lynx","latin":"Lynx lynx","kingdom":"animalia","group":"mammal","names":{"en":"Lynx","__proto__":"x"},"__proto__":{"polluted":true}}');
  const r = E.validateSpecies(sp);
  assert.ok(has(r, 'extra', '__proto__'));
  assert.ok(has(r, 'pattern', 'names.__proto__'));
  assert.equal({}.polluted, undefined);
  for (const bad of [null, 5, 'x', [], true]) assert.ok(E.validateSpecies(bad).length > 0);
});

test('manifest: forma, datele reale, verificarea și numărul', () => {
  assert.deepEqual(E.validateManifest(clone(MANIFEST)), []);
  const m = (over) => Object.assign(clone(MANIFEST), over);
  assert.ok(has(E.validateManifest(m({updated: '2026-02-30'})), 'date', 'updated'));
  assert.ok(has(E.validateManifest(m({updated: '0999-01-01'})), 'date', 'updated'));
  assert.ok(has(E.validateManifest(m({updated: '2026-13-01'})), 'date', 'updated'));
  assert.deepEqual(E.validateManifest(m({updated: '2024-02-29'})), []);
  assert.ok(has(E.validateManifest(m({updated: '2026-1-1'})), 'length', 'updated'));
  assert.ok(has(E.validateManifest(m({updated: '26-11-2026'})), 'pattern', 'updated'));
  assert.ok(has(E.validateManifest(m({status: 'reviewed'})), 'review_missing', 'reviewed_by'));
  assert.ok(has(E.validateManifest(m({status: 'reviewed', reviewed_by: 'Dr X'})), 'review_missing', 'reviewed_on'));
  assert.deepEqual(E.validateManifest(m({status: 'reviewed', reviewed_by: 'Dr X', reviewed_on: '2026-11-17'})), []);
  assert.ok(has(E.validateManifest(m({reviewed_on: '2026-02-31'})), 'date', 'reviewed_on'));
  assert.ok(has(E.validateManifest(m({count: 2})), 'count_mismatch', 'count'));
  assert.ok(has(E.validateManifest(m({species: ['lynx-lynx', 'lynx-lynx', 'a-b'], count: 3})), 'dup_species'));
  assert.ok(has(E.validateManifest(m({species: [5], count: 1})), 'type', 'species[0]'));
  assert.ok(has(E.validateManifest(m({species: ['Lynx'], count: 1})), 'pattern', 'species[0]'));
  assert.ok(has(E.validateManifest(m({species: [], count: 0})), 'length', 'species'));
  assert.ok(has(E.validateManifest(m({id: 'ro'})), 'length', 'id'));
  assert.ok(has(E.validateManifest(m({id: 'RO-test'})), 'pattern', 'id'));
  assert.ok(has(E.validateManifest(m({region: 'ro'})), 'pattern', 'region'));
  assert.ok(has(E.validateManifest(m({version: '1.0'})), 'length', 'version'));
  assert.ok(has(E.validateManifest(m({version: '1.0.0.0'})), 'pattern', 'version'));
  assert.ok(has(E.validateManifest(m({version: 'v1.0.0'})), 'pattern', 'version'));
  assert.ok(has(E.validateManifest(m({licence: 'MIT'})), 'enum', 'licence'));
  assert.ok(has(E.validateManifest(m({title: {ro: 'x'}})), 'missing', 'title.en'));
  assert.ok(has(E.validateManifest(m({authors: new Array(11).fill('x')})), 'length', 'authors'));
  assert.ok(has(E.validateManifest(m({count: 3.5})), 'type', 'count'));
  assert.ok(has(E.validateManifest(m({count: '3'})), 'type', 'count'));
  assert.ok(E.validateManifest([]).length > 0);
});

test('pachet complet: format, specii, numărul și relațiile dintre specii', () => {
  assert.deepEqual(E.validatePack(mkPack()), []);
  assert.deepEqual(codes(E.validatePack({})), ['format']);
  assert.deepEqual(codes(E.validatePack(Object.assign(mkPack(), {format_version: 2}))), ['format']);
  assert.deepEqual(codes(E.validatePack(null)), ['type']);
  assert.ok(has(E.validatePack(mkPack({count: 4})), 'count_mismatch'));
  assert.ok(has(E.validatePack(mkPack({}, [LYNX, LYNX])), 'dup_species'));
  assert.ok(has(E.validatePack(mkPack({species: 'x'})), 'type', 'species'));
  assert.ok(has(E.validatePack(mkPack({species: [5], count: 1})), 'type', 'species[0]'));
  const p = mkPack(); p.species[0] = Object.assign({}, p.species[0], {group: 'tree'});
  assert.ok(has(E.validatePack(p), 'group_kingdom', 'species[0].group'));
  // ținta lipsește din pachet
  assert.ok(has(E.validatePack(mkPack({}, [RAMSONS, LYNX])), 'look_unknown', 'species[0].look_alike[0].id'));
  // relația nu e reciprocă
  const sa = clone(SAFFRON); delete sa.look_alike;
  assert.ok(has(E.validatePack(mkPack({}, [RAMSONS, sa])), 'look_asym', 'species[0].look_alike[0].id'));
  // fotografii peste buget: 6 × ~120 000 de caractere în 5 specii
  const big = 'data:image/png;base64,' + 'A'.repeat(119000);
  const many = Array.from({length: 5}, (_, i) => ({id: 'aaa-bb' + 'abcde'[i], latin: 'Aaa bb' + 'abcde'[i], kingdom: 'animalia', group: 'other', names: {en: 'S' + i}, photos: new Array(6).fill(photo({data: big}))}));
  assert.ok(has(E.validatePack(mkPack({}, many)), 'photo_budget'));
  assert.deepEqual(E.validatePack(mkPack({}, many.slice(0, 4))), []);
});

test('asamblare și separare: pachetul se întoarce identic, cu toate verificările', () => {
  const byId = {'lynx-lynx': LYNX, 'allium-ursinum': RAMSONS, 'colchicum-autumnale': SAFFRON};
  const r = E.assemble(clone(MANIFEST), byId);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(Object.keys(r.pack).slice(0, 4), ['format', 'format_version', 'id', 'title']);
  assert.equal(r.pack.species.length, 3);
  const back = E.splitPack(r.pack);
  assert.deepEqual(back.manifest, MANIFEST);
  assert.deepEqual(back.species, [LYNX, RAMSONS, SAFFRON]);
  const miss = E.assemble(Object.assign(clone(MANIFEST), {species: ['lynx-lynx', 'allium-ursinum', 'colchicum-autumnale', 'x-y'], count: 4}), byId);
  assert.ok(has(miss.problems, 'species_unknown', 'species[3]'));
  assert.equal(miss.pack, null);
  assert.equal(E.assemble(Object.assign(clone(MANIFEST), {updated: 'x'}), byId).pack, null);
  assert.ok(E.packText(r.pack).endsWith('}\n'));
  assert.deepEqual(JSON.parse(E.packText(r.pack)), r.pack);
});

test('import din text: gol, prea mare, JSON stricat, BOM, pachet greșit și pachet bun', () => {
  const good = E.packText(mkPack());
  assert.equal(E.parseImport('').error, 'empty');
  assert.equal(E.parseImport('  \n ').error, 'empty');
  assert.equal(E.parseImport('{').error, 'json');
  assert.equal(E.parseImport('x'.repeat(E.LIMITS.import_chars + 1)).error, 'big');
  assert.equal(E.parseImport('[]').error, 'invalid');
  assert.equal(E.parseImport('{"format":"other"}').error, 'invalid');
  assert.deepEqual(E.parseImport(String.fromCharCode(0xfeff) + good).pack, mkPack());
  assert.deepEqual(E.parseImport(good).pack.species.map((s) => s.id), ['lynx-lynx', 'allium-ursinum', 'colchicum-autumnale']);
  const bad = E.parseImport(good.replace('"count": 3', '"count": 9'));
  assert.equal(bad.error, 'invalid');
  assert.ok(has(bad.problems, 'count_mismatch'));
});

test('depozitul local: pachetele stricate, duplicate sau în exces sunt lăsate deoparte', () => {
  const a = mkPack(), b = mkPack({id: 'xx-other'}), c = mkPack({count: 9});
  const r = E.parseStore(JSON.stringify([a, b, c, a, 5, null, 'x']));
  assert.deepEqual(r.packs.map((p) => p.id), ['xx-test', 'xx-other']);
  assert.equal(r.dropped, 5);
  for (const t of ['', null, undefined, '{}', '5', 'nu e json', '"x"', 'x'.repeat(E.LIMITS.store_chars + 1)]) assert.deepEqual(E.parseStore(t), {packs: [], dropped: 0}, String(t).slice(0, 12));
  const many = Array.from({length: 14}, (_, i) => mkPack({id: 'xx-p' + i}));
  const lim = E.parseStore(JSON.stringify(many));
  assert.equal(lim.packs.length, E.LIMITS.packs);
  assert.equal(lim.dropped, 2);
  // chei ostile
  const hostile = '[{"format":"vietar-pack","format_version":1,"__proto__":{"x":1},"id":"xx-test"}]';
  assert.deepEqual(E.parseStore(hostile), {packs: [], dropped: 1});
  assert.equal({}.x, undefined);
});

test('normalizare, căutare fără diacritice, nume în limba paginii cu revenire la engleză', () => {
  assert.equal(E.norm('  Brândușă  DE Toamnă '), 'brandusa de toamna');
  assert.equal(E.norm('Őszi kikerics'), 'oszi kikerics');
  assert.equal(E.norm('Weißstorch'), 'weissstorch');
  assert.equal(E.norm('Ștefan Ţepeș'), 'stefan tepes');
  assert.equal(E.norm('İstanbul'), 'istanbul');
  assert.equal(E.slugOf('Lynx lynx'), 'lynx-lynx');
  assert.equal(E.tidyLatin('  lYNX   LynX '), 'Lynx lynx');
  assert.equal(E.tidyLatin('rupicapra RUPICAPRA carpatica'), 'Rupicapra rupicapra carpatica');
  assert.deepEqual(E.nameIn({en: 'A', ro: 'B'}, 'ro'), {text: 'B', lang: 'ro', fallback: false});
  assert.deepEqual(E.nameIn({en: 'A', ro: 'B'}, 'fr'), {text: 'A', lang: 'en', fallback: true});
  assert.deepEqual(E.nameIn({ro: 'B', hu: 'C'}, 'fr'), {text: 'C', lang: 'hu', fallback: true});
  assert.equal(E.nameIn(undefined, 'ro').text, '');
  const pack = mkPack();
  const q = (o) => E.filterSpecies(pack.species, o).map((s) => s.id);
  assert.deepEqual(q({q: 'brandusa'}), ['colchicum-autumnale']);
  assert.deepEqual(q({q: 'BRÂNDUȘĂ toamna'}), ['colchicum-autumnale']);
  assert.deepEqual(q({q: 'colchicum'}), ['colchicum-autumnale']);
  assert.deepEqual(q({q: 'luchs'}), ['lynx-lynx']);
  assert.deepEqual(q({q: 'ra'}).length, 3);
  assert.deepEqual(q({q: 'nu există'}), []);
  assert.deepEqual(q({group: 'herb'}), ['allium-ursinum', 'colchicum-autumnale'].sort((a, b) => E.norm(E.nameIn(pack.species.find((s) => s.id === a).names, 'en').text) < E.norm(E.nameIn(pack.species.find((s) => s.id === b).names, 'en').text) ? -1 : 1));
  assert.deepEqual(q({toxic: 'yes'}), ['colchicum-autumnale']);
  assert.deepEqual(q({toxic: 'no'}).sort(), ['allium-ursinum', 'lynx-lynx']);
  assert.deepEqual(q({lang: 'ro'}), ['colchicum-autumnale', 'lynx-lynx', 'allium-ursinum'].sort((a, b) => 0).length === 3 ? q({lang: 'ro'}) : []);
  assert.deepEqual(E.sortSpecies(pack.species, 'ro').map((s) => s.names.ro), ['Brândușă de toamnă', 'Leurdă', 'Râs']);
  assert.deepEqual(E.sortSpecies(pack.species, 'en').map((s) => s.names.en), ['Eurasian lynx', 'Meadow saffron', 'Ramsons']);
});

test('specii asemănătoare: citite în ambele sensuri, fără duplicate și fără ținte lipsă', () => {
  const pack = mkPack();
  assert.deepEqual(E.lookAlikes(pack, 'allium-ursinum').map((l) => l.id), ['colchicum-autumnale']);
  assert.deepEqual(E.lookAlikes(pack, 'colchicum-autumnale').map((l) => l.id), ['allium-ursinum']);
  assert.deepEqual(E.lookAlikes(pack, 'lynx-lynx'), []);
  // relația declarată doar dintr-o parte apare totuși la ambele specii
  const one = mkPack({}, [RAMSONS, Object.assign(clone(SAFFRON), {look_alike: undefined})]);
  delete one.species[1].look_alike;
  assert.deepEqual(E.lookAlikes(one, 'colchicum-autumnale').map((l) => l.id), ['allium-ursinum']);
  // ținta lipsește din pachet: nu apare
  assert.deepEqual(E.lookAlikes({species: [RAMSONS]}, 'allium-ursinum'), []);
});

test('statistici și legături de licență', () => {
  const p = mkPack({}, [LYNX, mkSpecies({id: 'lynx-pardinus', latin: 'Lynx pardinus', photos: [photo(), photo()], audio: [audio()]}), SAFFRON, RAMSONS]);
  assert.deepEqual(E.packStats(p), {count: 4, toxic: 1, photos: 2, audio: 1, groups: {mammal: 2, herb: 2}});
  assert.equal(E.licenceUrl('CC-BY-4.0'), 'https://creativecommons.org/licenses/by/4.0/');
  assert.equal(E.licenceUrl('CC-BY-NC-SA-4.0'), 'https://creativecommons.org/licenses/by-nc-sa/4.0/');
  assert.equal(E.licenceUrl('CC-BY-SA-3.0'), 'https://creativecommons.org/licenses/by-sa/3.0/');
  assert.equal(E.licenceUrl('CC0-1.0'), 'https://creativecommons.org/publicdomain/zero/1.0/');
  assert.equal(E.licenceUrl('PDM-1.0'), 'https://creativecommons.org/publicdomain/mark/1.0/');
  assert.equal(E.licenceUrl('MIT'), '');
  assert.equal(E.hostOf('https://commons.wikimedia.org/wiki/File:A.png'), 'commons.wikimedia.org');
  assert.equal(E.hostOf('javascript:alert(1)'), '');
  assert.equal(E.packFileName('ro-mammals'), 'vietar-pack-ro-mammals.json');
});

test('creatorul: formularul dă specia, specia dă formularul, notele păstrează celelalte limbi', () => {
  const f = {latin: 'colchicum  AUTUMNALE', kingdom: 'plantae', group: 'herb', name_en: ' Meadow saffron ', name_ro: 'Brândușă de toamnă', name_hu: '', name_de: 'Herbstzeitlose', x_lang: 'FR', x_name: 'Colchique', toxic: 'yes', note_lang: 'ro', toxic_note: 'Foarte otrăvitoare.', notes: '', source: ' Cunoștințe proprii '};
  const r = E.speciesFromForm(f, null);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.species, {id: 'colchicum-autumnale', latin: 'Colchicum autumnale', kingdom: 'plantae', group: 'herb', names: {en: 'Meadow saffron', ro: 'Brândușă de toamnă', de: 'Herbstzeitlose', fr: 'Colchique'}, toxic: true, toxic_note: {ro: 'Foarte otrăvitoare.'}, source: 'Cunoștințe proprii'});
  const back = E.speciesToForm(r.species, 'ro');
  assert.equal(back.latin, 'Colchicum autumnale');
  assert.equal(back.name_en, 'Meadow saffron');
  assert.equal(back.x_lang, 'fr');
  assert.equal(back.toxic, 'yes');
  assert.equal(back.toxic_note, 'Foarte otrăvitoare.');
  // editare: ce nu e în formular (specii asemănătoare, fotografii, sunete) rămâne, celelalte limbi ale notei rămân
  const base = Object.assign(clone(SAFFRON), {toxic_note: {en: 'Very poisonous.', ro: 'Foarte otrăvitoare.'}, photos: [photo()]});
  const edited = E.speciesFromForm(Object.assign(E.speciesToForm(base, 'ro'), {toxic_note: 'Mortal de otrăvitoare.'}), base);
  assert.deepEqual(edited.problems, []);
  assert.deepEqual(edited.species.toxic_note, {en: 'Very poisonous.', ro: 'Mortal de otrăvitoare.'});
  assert.equal(edited.species.photos.length, 1);
  assert.equal(edited.species.look_alike[0].id, 'allium-ursinum');
  assert.deepEqual(Object.keys(edited.species).slice(0, 5), ['id', 'latin', 'kingdom', 'group', 'names']);
  // ștergerea textului din limba aleasă șterge doar acea limbă
  const cleared = E.speciesFromForm(Object.assign(E.speciesToForm(base, 'ro'), {toxic_note: ''}), base);
  assert.deepEqual(cleared.species.toxic_note, {en: 'Very poisonous.'});
  // erori: fără nume englezesc, nume latin greșit, limbă greșită
  assert.ok(has(E.speciesFromForm(Object.assign({}, f, {name_en: ''}), null).problems, 'missing', 'names.en'));
  assert.ok(has(E.speciesFromForm(Object.assign({}, f, {latin: 'x'}), null).problems, 'length', 'latin'));
  assert.ok(has(E.speciesFromForm(Object.assign({}, f, {x_lang: 'english'}), null).problems, 'pattern', 'names.english'));
  assert.ok(has(E.speciesFromForm(Object.assign({}, f, {toxic: ''}), null).problems, 'toxic_required'));
  assert.ok(has(E.speciesFromForm(Object.assign({}, f, {toxic: 'no'}), null).problems, 'toxic_note_unused'));
});

test('creatorul: relațiile se adaugă și se șterg în ambele sensuri, ștergerea unei specii curăță trimiterile', () => {
  const a = clone(RAMSONS), b = clone(SAFFRON); delete a.look_alike; delete b.look_alike;
  const list = [a, b, clone(LYNX)];
  const r = E.addLookAlike(list, 'allium-ursinum', 'colchicum-autumnale', {en: 'Leaves look alike.'});
  assert.ok(!r.error);
  assert.deepEqual(r.list[0].look_alike, [{id: 'colchicum-autumnale', note: {en: 'Leaves look alike.'}}]);
  assert.deepEqual(r.list[1].look_alike, [{id: 'allium-ursinum', note: {en: 'Leaves look alike.'}}]);
  assert.equal(r.list[2].look_alike, undefined);
  assert.deepEqual(E.validatePack(mkPack({}, r.list)), []);
  assert.equal(list[0].look_alike, undefined, 'lista veche nu se modifică');
  const again = E.addLookAlike(r.list, 'colchicum-autumnale', 'allium-ursinum', {en: 'New note'});
  assert.equal(again.list[0].look_alike.length, 1);
  assert.equal(again.list[0].look_alike[0].note.en, 'New note');
  assert.equal(E.addLookAlike(list, 'allium-ursinum', 'nope-nope', {en: 'x'}).error, 'unknown');
  assert.equal(E.addLookAlike(list, 'allium-ursinum', 'allium-ursinum', {en: 'x'}).error, 'self');
  let full = clone(list);
  for (let i = 0; i < 8; i++) { const id = 'zzz-' + 'abcdefghij'[i]; full.push({id, latin: 'Zzz ' + 'abcdefghij'[i], kingdom: 'animalia', group: 'other', names: {en: id}}); full = E.addLookAlike(full, 'allium-ursinum', id, {en: 'x'}).list; }
  assert.equal(E.addLookAlike(full, 'allium-ursinum', 'colchicum-autumnale', {en: 'x'}).error, 'full');
  const gone = E.removeLookAlike(r.list, 'allium-ursinum', 'colchicum-autumnale');
  assert.equal(gone[0].look_alike, undefined);
  assert.equal(gone[1].look_alike, undefined);
  const del = E.removeSpecies(r.list, 'colchicum-autumnale');
  assert.deepEqual(del.map((s) => s.id), ['allium-ursinum', 'lynx-lynx']);
  assert.equal(del[0].look_alike, undefined);
  assert.deepEqual(E.validatePack(mkPack({}, del)), []);
  const renamed = E.replaceSpecies(r.list, 'colchicum-autumnale', Object.assign(clone(r.list[1]), {id: 'colchicum-speciosum', latin: 'Colchicum speciosum'}));
  assert.equal(renamed[0].look_alike[0].id, 'colchicum-speciosum');
});

test('creatorul: schița se transformă în pachet valid sau în lista problemelor', () => {
  const d = E.newDraft();
  d.meta.id = 'xx-class'; d.meta.title_en = 'Our school pond'; d.meta.region = 'RO'; d.meta.authors = 'Ana, Ion\nMaria';
  const empty = E.draftToPack(d, '2026-11-17');
  assert.ok(has(empty.problems, 'length', 'species'));
  d.species = [clone(LYNX)];
  const r = E.draftToPack(d, '2026-11-17');
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.pack.authors, ['Ana', 'Ion', 'Maria']);
  assert.equal(r.pack.updated, '2026-11-17');
  assert.equal(r.pack.count, 1);
  d.meta.loc_lang = 'ro'; d.meta.title_loc = 'Iazul școlii';
  assert.deepEqual(E.draftToPack(d, '2026-11-17').pack.title, {en: 'Our school pond', ro: 'Iazul școlii'});
  d.meta.id = 'Bad id';
  assert.ok(has(E.draftToPack(d, '2026-11-17').problems, 'pattern', 'id'));
  assert.ok(has(E.draftToPack(d, 'azi').problems, 'length', 'updated'));
  assert.equal(E.todayIso(new Date(2026, 10, 7)), '2026-11-07');
});

test('creatorul: o schiță salvată ostilă se curăță, nu se acceptă', () => {
  assert.deepEqual(E.parseDraft('nu e json'), {draft: E.newDraft(), dropped: 0});
  assert.deepEqual(E.parseDraft('[]'), {draft: E.newDraft(), dropped: 0});
  assert.deepEqual(E.parseDraft(null), {draft: E.newDraft(), dropped: 0});
  const text = JSON.stringify({meta: {id: 'xx-ok', region: 5, title_en: 'x'.repeat(400), version: '1.0.0', evil: 'x'}, species: [LYNX, LYNX, {id: 'x'}, 5, null, Object.assign(clone(LYNX), {id: 'lynx-pardinus', latin: 'Lynx pardinus'}), mkSpecies({names: {en: 'ok'}, toxic_note: {en: 'x'}})]});
  const r = E.parseDraft(text);
  assert.equal(r.draft.meta.id, 'xx-ok');
  assert.equal(r.draft.meta.region, '', 'tip greșit: rămâne valoarea implicită');
  assert.equal(r.draft.meta.title_en, '', 'text prea lung: rămâne valoarea implicită');
  assert.equal(r.draft.meta.version, '1.0.0');
  assert.equal(r.draft.meta.evil, undefined);
  assert.deepEqual(r.draft.species.map((s) => s.id), ['lynx-lynx', 'lynx-pardinus']);
  assert.equal(r.dropped, 5);
  const many = JSON.stringify({meta: {}, species: Array.from({length: 450}, (_, i) => ({id: 'aaa-' + 'abcdefghijklmnopqrstuvwxyz'[i % 26].repeat(1 + Math.floor(i / 26)), latin: 'Aaa ' + 'abcdefghijklmnopqrstuvwxyz'[i % 26].repeat(1 + Math.floor(i / 26)), kingdom: 'animalia', group: 'other', names: {en: 'S' + i}}))});
  assert.equal(E.parseDraft(many).draft.species.length, E.LIMITS.draft_species);
  const proto = E.parseDraft('{"meta":{"__proto__":{"id":"hack"}},"species":[]}');
  assert.equal(proto.draft.meta.id, '');
  assert.equal({}.id, undefined);
});

test('datele din depozit: toate pachetele din data/dist sunt valide și coerente', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const {ROOT} = await import('./helpers.mjs');
  const dir = path.join(ROOT, 'data/dist');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(files.length >= 6);
  for (const f of files) {
    const pack = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    assert.deepEqual(E.validatePack(pack), [], f);
    // example.json este exemplul de format (id-ul lui e «xx-example»); celelalte se numesc după id
    assert.equal(f, f === 'example.json' ? 'example.json' : pack.id + '.json');
  }
});
