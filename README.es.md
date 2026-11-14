# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **Español** · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versión: 0.1.0 · Última actualización: 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Paquetes regionales de especies para VietAR: nombres, fotos y sonidos de fauna y flora locales.

Trade-free: sin rastreo, sin anuncios, sin cuentas, funciona sin conexión.

## Estado

Alfa: el repositorio contiene la estructura, el esquema de datos o los primeros ejemplos y las guías de contribución. El alcance de abajo es el plan, no lo que funciona hoy.

## Alcance previsto

- Una especificación del formato de paquete: un manifiesto `pack.json` con región, versión y número de especies.
- Paquetes de especies para Rumanía: unos 30 mamíferos de los Cárpatos con nombres en en/ro/hu/de, unas 50 aves comunes con enlaces de audio (Xeno-canto, CC-BY) y unas 40 plantas y setas silvestres con un indicador `toxic`.
- Esqueletos de paquetes para Bulgaria y Moldavia, con 20 especies cada uno.
- Un campo `look-alike` que vincula pares de especies peligrosas.
- Herramientas: un verificador de licencias de fotos mediante la API de Wikimedia Commons, un optimizador de imágenes (WebP, 640 px como máximo) y una guía para que una clase escolar añada un paquete local.

Nada de esto está implementado todavía: cada punto es una tarea preparada en `ISSUES_GOOD_FIRST.md`.

## Contribuye en 5 minutos

1. Haz un fork de este repositorio.
2. Copia `data/species/example.json` en `data/species/` y edítalo.
3. Ejecuta `python scripts/validate.py`.
4. Abre un pull request: para los datos no hace falta programar.

## Buenas primeras tareas

Consulta `ISSUES_GOOD_FIRST.md` para tareas ya preparadas.

## Licencia

Código: MIT. Datos aportados: indica la fuente; se publican con la misma licencia salvo que el archivo diga otra cosa.

## Apoyo

Si el proyecto te resulta útil, puedes [invitarme a un café](https://buymeacoffee.com/echo.of.the.strings).
