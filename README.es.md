# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **Español** · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versión: 0.2.0 · Última actualización: 2026-11-17

🌐 https://vietar-packs.chiuta.ro

> Paquetes regionales de especies para VietAR: nombres, fotos y sonidos de fauna y flora locales.

Trade-free: sin rastreo, sin anuncios, sin cuentas, funciona sin conexión.

## Estado

Alfa, utilizable: el único `index.html` explora, importa, comprueba y crea paquetes regionales de especies: nombres en varios idiomas, un indicador de toxicidad, dobles peligrosos, fotos con licencia y enlaces a sonidos de xeno-canto. Incluye cinco paquetes de partida integrados, con 71 especies en total (Rumanía: 19 plantas y hongos, 17 aves y 15 mamíferos; Bulgaria y Moldavia: las mismas 10 especies comunes cada uno, como esqueletos). Cada paquete integrado es un borrador o un esqueleto: los nombres y las notas se escribieron con un asistente de IA y se comprobaron solo en parte, ningún biólogo, micólogo ni hablante nativo los ha revisado, y todavía no contienen fotos ni enlaces a sonidos. La página no identifica nada y no es una guía de campo: la etiqueta «No marcada como tóxica» nunca significa que sea seguro comerla o tocarla. La app VietAR todavía no puede importar estos paquetes.

## Qué hace

- «Explorar»: elige un paquete, busca por un nombre en cualquier idioma o por el nombre latino (mayúsculas y tildes no importan), filtra por grupo y por indicador de toxicidad, y abre una especie: sus nombres (en el idioma de la página, con el inglés como respaldo), el indicador y la nota de toxicidad, las notas, la fuente, las especies con las que a menudo se confunde (cada una es un enlace), las fotos y los enlaces a sonidos. Un recuadro rojo de seguridad sigue visible en todas las pestañas y dice lo que la página no es.
- «Paquetes»: los paquetes integrados y los que importes (pega el JSON o elige un archivo; 12 como máximo a la vez), cada uno con su región, versión, licencia, autores, una insignia de estado sincera («Esqueleto», «Borrador», «Revisado») y el número de especies por grupo; descarga cualquier paquete o elimina los que importaste. Un paquete se comprueba por completo antes de añadirse: si algo falla, no se importa nada y ves qué corregir.
- «Crear»: crea un paquete para una clase, un club de naturaleza o una región: rellena el paquete, añade las especies una a una (hasta 400), enlaza los dobles en los dos sentidos, comprueba el paquete con las mismas reglas que el repositorio y descarga el archivo. El borrador se guarda en este navegador mientras trabajas. Un paquete hecho aquí nunca puede marcarse como revisado; las fotos y los sonidos se añaden mediante el JSON de la especie.
- «Guía»: cómo usar la página y un ejemplo de especie con una foto y un sonido.
- Formato: un archivo JSON por especie en `data/species/`, un manifiesto por paquete en `data/packs/`, ensamblados en paquetes completos (formato `vietar-pack`) en `data/dist/`; descritos por `schema.json` y `pack.schema.json` y explicados en `docs/pack-format.md`.
- Herramientas para quienes contribuyen: `scripts/pack.mjs` (ensambla los paquetes y divide en archivos un paquete descargado), `scripts/validate.py`, `scripts/optimize.py` (una foto en WebP de 640 px como máximo, sin metadatos), `scripts/check_licences.mjs` (licencias de las fotos, en línea con `--online`). La interfaz está en ocho idiomas y funciona con el teclado y con un lector de pantalla.
- Instalable como aplicación y disponible sin conexión tras la primera visita cuando se sirve por HTTPS (un service worker conserva la página; no se guarda ni se envía nada más). Abierta desde un archivo descargado funciona igual, sin instalación.

## Cómo funciona

- Un archivo de especie y un manifiesto (la lista de ids de especies y su número) se convierten en un paquete completo: `node scripts/pack.mjs` lo escribe en `data/dist/<id>.json`. La página incorpora `data/dist/`, así que lo que exploras es exactamente lo que descargas.
- `schema.json` y `pack.schema.json` describen los archivos; `scripts/validate.py` los aplica, junto con las reglas que un esquema no puede decir: el nombre del archivo, el id y el nombre latino coinciden, el grupo encaja con el reino, las plantas y los hongos dicen si son tóxicos, una especie tóxica tiene una nota de toxicidad, los dobles se señalan mutuamente, las fotos caben en 3 MB, un paquete revisado nombra al revisor y la fecha. `src/engine.mjs` aplica las mismas reglas en la página; las pruebas comparan ambas.
- Segura por construcción: el texto de un paquete se muestra siempre como texto, nunca como HTML; los enlaces solo abren direcciones `https://`; la página no hace ninguna petición de red (las fotos van incorporadas, los sonidos son enlaces que abren xeno-canto.org en una pestaña nueva); un paquete importado y el estado guardado se vuelven a comprobar al cargar la página, de modo que uno dañado u hostil se rechaza, no se da por bueno.
- `src/ui.js`, `src/i18n.mjs` y `src/app.css` son la interfaz; `scripts/build.mjs` construye el único `index.html` desde `src/` e incorpora los paquetes de `data/dist/`; `node scripts/build.mjs --check` falla si la página está desactualizada.
- Pruebas: `npm test` (motor, paridad con el validador, scripts, verificador de licencias, optimizador de fotos, documentación) y pruebas de navegador en el hub (ocho idiomas, accesibilidad, importaciones hostiles, límites, almacenamiento lleno). El desarrollo requiere Node.js 24 o más reciente y Python 3 con `jsonschema` (Pillow solo para el optimizador de fotos); la página en sí requiere un navegador que conozca ES2017.
- `manifest.webmanifest`, `sw.js` y los iconos los produce `node scripts/build.mjs` mediante el kit común (sección `pwa` de `src/app.json`); `--check` también los verifica, y `npm test` comprueba que el manifiesto, la versión del service worker y la CSP coincidan con la página.

## Límites sinceros

- Los paquetes incluidos son borradores: los nombres y las notas se escribieron con un asistente de IA a partir de conocimientos generales y se comprobaron solo en parte en páginas públicas. Ningún biólogo, micólogo ni hablante nativo los ha revisado. Los paquetes de Bulgaria y Moldavia son esqueletos de 10 especies cada uno.
- «No marcada como tóxica» solo significa que nadie marcó la especie como tóxica en este paquete. Nunca es una afirmación de que una planta o una seta sea comestible o segura, y los paquetes no enseñan a distinguir los dobles. No comas nunca una planta o una seta silvestre por esta página.
- Los paquetes incluidos no contienen fotos ni enlaces a sonidos, porque las licencias y los números de grabación no se pudieron comprobar sin conexión. El formato admite ambos, con autor, licencia y fuente.
- Los paquetes importados aquí se guardan solo en este navegador; borrar los datos del sitio los elimina. Descarga los que te importen.
- La aplicación VietAR todavía no puede importar estos paquetes. Por ahora los paquetes se leen y se comprueban en esta página y con los scripts del repositorio.
- Las traducciones de la interfaz las escribió una máquina y no las han revisado hablantes nativos. Los nombres y notas de las especies aparecen en el idioma del paquete, con el inglés como respaldo.

## Contribuye en 5 minutos

1. Haz un fork de este repositorio.
2. Crea o amplía un paquete: en la página usa la pestaña «Crear» y descarga el archivo, o escribe a mano archivos `data/species/<nombre-latino>.json` (consulta `docs/pack-format.md`).
3. Convierte un paquete descargado en archivos con `node scripts/pack.mjs --split vietar-pack-<id>.json`, o añade los ids de las nuevas especies al manifiesto del paquete en `data/packs/`.
4. Ejecuta `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` y `node scripts/build.mjs`.
5. Abre un pull request — las contribuciones de datos no requieren programar. Indica una fuente para cada nombre, nota e indicador de toxicidad, y nunca marques tú mismo un paquete como revisado (consulta `docs/review-guide.md`).

## Buenas primeras tareas

Consulta `ISSUES_GOOD_FIRST.md` para tareas ya preparadas.

## Licencia

Código: MIT. Datos: cada paquete indica su propia licencia (CC0-1.0, CC-BY-4.0 o CC-BY-SA-4.0); los paquetes integrados son CC0-1.0. Las fotos y los sonidos conservan sus propias licencias: cada uno nombra su autor, su licencia y su fuente. Datos aportados: indica la fuente; se publican con la licencia del paquete al que se suman.

## Apoyo

Si el proyecto te resulta útil, puedes [invitarme a un café](https://buymeacoffee.com/echo.of.the.strings).
