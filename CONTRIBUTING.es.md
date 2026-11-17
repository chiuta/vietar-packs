# Cómo contribuir — VietAR Packs

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · **Español** · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versión: 0.2.0 · Última actualización: 2026-11-17

1. Haz un fork de este repositorio.
2. Crea o amplía un paquete: en la página usa la pestaña «Crear» y descarga el archivo, o escribe a mano archivos `data/species/<nombre-latino>.json` (consulta `docs/pack-format.md`).
3. Convierte un paquete descargado en archivos con `node scripts/pack.mjs --split vietar-pack-<id>.json`, o añade los ids de las nuevas especies al manifiesto del paquete en `data/packs/`.
4. Ejecuta `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` y `node scripts/build.mjs`.
5. Abre un pull request — las contribuciones de datos no requieren programar. Indica una fuente para cada nombre, nota e indicador de toxicidad, y nunca marques tú mismo un paquete como revisado (consulta `docs/review-guide.md`).

## Reglas

- Una especie = un archivo en `data/species/`, con el nombre de su id (el nombre latino en minúsculas con guiones).
- Cita siempre una fuente.
- Aporta solo material que puedas compartir legalmente (sin texto protegido copiado).
- Sé amable: consulta el Código de conducta.

## Añadir especies y paquetes

1. Parte de una fuente que puedas usar: tus propios conocimientos y observaciones, o páginas públicas cuya licencia permita la reutilización (anota la dirección y la fecha). No copies texto de guías de campo, apps o sitios web salvo que la licencia lo permita: escribe la nota con tus palabras y dilo en `source`.
2. Escribe un nombre solo en un idioma que conozcas o que puedas comprobar con un hablante nativo o con un diccionario fiable. El inglés es obligatorio; la página muestra primero el idioma de quien lee y el inglés como respaldo.
3. En plantas y hongos `toxic` es obligatorio. Escribe `true` cuando se sepa que alguna parte de la especie es venenosa, y escribe una nota de toxicidad que diga cuál es el peligro. `false` solo significa que nadie ha marcado aquí la especie como tóxica: nunca significa comestible. Ante la duda, pregunta a un experto local antes de escribir `false`.
4. Anota una pareja peligrosa de dobles en ambas especies, con una nota de advertencia del tipo «Las hojas pueden confundirse; la confusión ha causado intoxicaciones graves». Di que se confunden, nunca cómo distinguirlas: un consejo equivocado puede matar.
5. Fotos: tuyas, de dominio público o con una licencia de la lista de `docs/pack-format.md`, cada una con su autor, su licencia y un enlace a la fuente; redúcelas con `python3 scripts/optimize.py` (WebP, 640 px como máximo, sin datos de lugar) y comprueba las fotos de Wikimedia Commons con `node scripts/check_licences.mjs --online`. Sonidos: solo enlaces a xeno-canto.org que hayas escuchado, con el autor de la grabación y la licencia.
6. Un paquete nuevo es un `draft` (o un `skeleton` cuando solo muestra el formato). Solo un revisor que haya comprobado cada especie puede poner `reviewed`, con su nombre y la fecha: consulta `docs/review-guide.md`.
7. Más información: `docs/contributor-guide.md` (comandos, archivos, comprobaciones), `docs/school-class-guide.md` (una clase o un club crea un paquete) y `docs/pack-format.md` (cada campo y límite).
