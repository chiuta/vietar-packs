# Registro de cambios

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · **Español** · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Sin publicar]

## [0.2.0] - 2026-11-17

### Añadido
- La página: las pestañas «Explorar», «Paquetes», «Crear» y «Guía» en ocho idiomas, con un recuadro rojo de seguridad siempre visible, atajos de teclado y compatibilidad con lectores de pantalla.
- El visor: búsqueda en cualquier idioma (mayúsculas y tildes ignoradas), filtros por grupo y por indicador de toxicidad, fichas de especies con nombres, indicador y nota de toxicidad, notas, fuente, dobles (como enlaces), fotos y enlaces a sonidos; «No marcada como tóxica» no aparece nunca en verde y lleva siempre una advertencia.
- Paquetes: importación (pegada o desde un archivo, comprobada por completo antes de añadir nada), descarga, eliminación y sustitución por id; número de especies por grupo; insignias de estado sinceras («Esqueleto», «Borrador», «Revisado») con lo que significa cada una.
- El creador: un formulario de paquete, un formulario de especie con nombres en varios idiomas, indicador y notas de toxicidad, dobles enlazados en los dos sentidos, un editor JSON para fotos y sonidos, una comprobación, una descarga y un borrador guardado en el navegador (con un aviso cuando el navegador se queda sin espacio).
- El formato de los paquetes: `schema.json` (una especie), `pack.schema.json` (un manifiesto), paquetes ensamblados en `data/dist/` (formato `vietar-pack`, versión 1) y `data/dist/example.json` como ejemplo de formato.
- Cinco paquetes de partida integrados, con 71 especies: Rumanía (19 plantas y hongos, 17 aves, 15 mamíferos) y esqueletos para Bulgaria y Moldavia (las mismas 10 especies cada uno); borradores escritos con un asistente de IA y comprobados solo en parte, sin fotos ni enlaces a sonidos.
- `scripts/pack.mjs` (ensamblado, `--check`, `--split`), `scripts/validate.py` (las mismas reglas que la página, para cada archivo y cada paquete ensamblado), `scripts/optimize.py` (fotos) y `scripts/check_licences.mjs` (licencia y autor de las fotos; `--online` consulta Wikimedia Commons).
- Guías en inglés y rumano: `docs/pack-format.md`, `docs/school-class-guide.md`, `docs/contributor-guide.md` y `docs/review-guide.md`.
- `src/` y `scripts/build.mjs`: el único `index.html` se construye ahora desde las fuentes, con los paquetes de `data/dist/` incorporados, y `--check` lo verifica.
- Pruebas: `npm test` y pruebas de navegador en el hub.
- ISSUES_GOOD_FIRST y CODE_OF_CONDUCT traducidos a los ocho idiomas.
- README en inglés, rumano, francés, italiano, español, portugués, alemán y húngaro: secciones de estado y de alcance previsto (derivadas de `ISSUES_GOOD_FIRST.md`).
- Instalable (PWA): `manifest.webmanifest`, `sw.js` y los iconos los genera el kit común (`fff-kit/pwa`); la página funciona sin conexión tras la primera visita por HTTPS.

### Cambiado
- El workflow se ejecuta en Ubuntu 26.04 y Node.js 26, y ejecuta la comprobación de los paquetes, el validador, las pruebas y la comprobación de la construcción.
- Los datos son ahora un archivo por especie y un manifiesto por paquete (`data/species/`, `data/packs/`), ensamblados en `data/dist/`; `data/species/example.json` se sustituye por `data/dist/example.json`, y `scripts/validate.py`, los pasos del README y las plantillas cambiaron con ello.
- La lista de «good first issues» contiene ahora lo que queda por hacer (más especies, revisión de expertos, fotos, sonidos, traducciones); la especificación del formato, el campo de dobles, el optimizador de fotos, el verificador de licencias y la guía para clases, que enumeraba antes, existen.

## [0.1.0] - 2026-11-13

### Añadido
- Esqueleto inicial: estructura, esquema de datos o primeros ejemplos, guías de contribución en ocho idiomas.
