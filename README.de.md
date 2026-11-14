# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · **Deutsch** · [Magyar](README.hu.md)

Version: 0.1.0 · Letzte Aktualisierung: 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Regionale Artenpakete für VietAR: Namen, Fotos und Laute lokaler Tiere und Pflanzen.

Trade-free: kein Tracking, keine Werbung, keine Konten, funktioniert offline.

## Status

Alpha: Das Repository enthält die Struktur, das Datenschema oder die ersten Beispiele und die Beitragsleitfäden. Der Umfang unten ist der Plan, nicht das, was heute funktioniert.

## Geplanter Umfang

- Eine Spezifikation des Paketformats: ein Manifest `pack.json` mit Region, Version und Artenzahl.
- Artenpakete für Rumänien: rund 30 Säugetiere der Karpaten mit Namen in en/ro/hu/de, rund 50 häufige Vögel mit Audio-Links (Xeno-canto, CC-BY) und rund 40 Wildpflanzen und Pilze mit einem Feld `toxic`.
- Paketgerüste für Bulgarien und Moldau mit je 20 Arten.
- Ein Feld `look-alike`, das gefährliche Artenpaare verknüpft.
- Werkzeuge: eine Prüfung der Fotolizenzen über die Wikimedia-Commons-API, ein Bildoptimierer (WebP, höchstens 640 px) und eine Anleitung, wie eine Schulklasse ein lokales Paket ergänzt.

Nichts davon ist bisher umgesetzt: Jeder Punkt ist eine fertig vorbereitete Aufgabe in `ISSUES_GOOD_FIRST.md`.

## In 5 Minuten mitmachen

1. Forke dieses Repository.
2. Kopiere `data/species/example.json` nach `data/species/` und bearbeite die Datei.
3. Führe `python scripts/validate.py` aus.
4. Öffne einen Pull Request – für Daten ist keine Programmierung nötig.

## Gute erste Aufgaben

Siehe `ISSUES_GOOD_FIRST.md` für fertige Aufgaben.

## Lizenz

Code: MIT. Beigesteuerte Daten: Quelle angeben; sie stehen unter derselben Lizenz, sofern die Datei nichts anderes sagt.

## Unterstützung

Wenn dir das Projekt nützt, kannst du [mir einen Kaffee spendieren](https://buymeacoffee.com/echo.of.the.strings).
