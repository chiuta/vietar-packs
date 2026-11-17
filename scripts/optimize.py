#!/usr/bin/env python3
"""scripts/optimize.py — pregătește o fotografie pentru un pachet VietAR.

    python scripts/optimize.py poza.jpg --author "Nume Prenume" --licence CC-BY-4.0 \
        --source-url "https://commons.wikimedia.org/wiki/File:Lynx_lynx.jpg" --alt "Râs pe o stâncă" [--lang ro]

Ce face: redimensionează la cel mult 640 px pe latura lungă, scoate metadatele (EXIF: loc, dată, aparat),
corectează orientarea, o salvează ca WebP (sau JPEG dacă nu e disponibil WebP) și scrie pe ieșirea standard
fragmentul JSON gata de lipit în «photos» din data/species/<id>.json. Dacă rezultatul depășește limita
din schemă (120 000 de caractere), scade calitatea treptat.

Nu trimite nimic nicăieri: lucrează doar pe fișierul dat. Necesită Pillow (pip install pillow).
Licența și autorul rămân în grija ta: scriptul nu le poate verifica (pentru Commons rulează după aceea
`node scripts/check_licences.mjs --online`).
"""
import argparse
import base64
import io
import json
import sys

MAX_SIDE = 640
MAX_CHARS = 120000  # limita din schema.json pentru «data» (inclusiv prefixul data:)
LICENCES = ("CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "CC-BY-3.0", "CC-BY-SA-3.0", "PDM-1.0")


def encode(img, fmt, quality):
    buf = io.BytesIO()
    if fmt == "WEBP":
        img.save(buf, "WEBP", quality=quality, method=6)
        mime = "image/webp"
    else:
        img.convert("RGB").save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
        mime = "image/jpeg"
    uri = "data:%s;base64,%s" % (mime, base64.b64encode(buf.getvalue()).decode("ascii"))
    return uri, mime


def optimise(path, max_side=MAX_SIDE, max_chars=MAX_CHARS):
    """Întoarce (data_uri, lățime, înălțime, mime). Ridică ValueError dacă nu încape nici la calitate mică."""
    from PIL import Image, ImageOps, features

    with Image.open(path) as im:
        im.load()
        img = ImageOps.exif_transpose(im)  # aplică orientarea, apoi nu mai păstrăm EXIF
        if img.mode in ("P", "LA", "PA", "CMYK", "I;16", "I", "F"):
            img = img.convert("RGBA" if "A" in img.mode or img.mode == "P" else "RGB")
        img.thumbnail((max_side, max_side), Image.LANCZOS)
        clean = Image.new(img.mode, img.size)  # o imagine nouă: fără EXIF, ICC sau comentarii
        clean.paste(img)
    fmt = "WEBP" if features.check("webp") else "JPEG"
    for side_factor in (1.0, 0.85, 0.7, 0.55):
        cur = clean
        if side_factor != 1.0:
            cur = clean.copy()
            cur.thumbnail((int(clean.width * side_factor) or 1, int(clean.height * side_factor) or 1), Image.LANCZOS)
        for q in (82, 74, 66, 58, 50, 42):
            uri, mime = encode(cur, fmt, q)
            if len(uri) <= max_chars:
                return uri, cur.width, cur.height, mime
    raise ValueError("nu am reușit să încadrez imaginea în %d de caractere; alege o imagine mai simplă sau mai mică" % max_chars)


def snippet(uri, alt, lang, author, licence, source_url, commons_file):
    photo = {"data": uri, "alt": {lang: alt}, "author": author, "licence": licence}
    if source_url:
        photo["source_url"] = source_url
    if commons_file:
        photo["commons_file"] = commons_file
    return photo


def main(argv=None):
    ap = argparse.ArgumentParser(description="Optimizează o fotografie pentru un pachet VietAR și scrie fragmentul JSON.")
    ap.add_argument("image")
    ap.add_argument("--author", required=True, help="autorul fotografiei, așa cum cere licența")
    ap.add_argument("--licence", required=True, choices=LICENCES)
    ap.add_argument("--alt", required=True, help="descrierea imaginii pentru cititoare de ecran (≤200 de caractere)")
    ap.add_argument("--lang", default="en", help="limba descrierii (cod din 2-3 litere; implicit en)")
    ap.add_argument("--source-url", default="", help="adresa https a paginii originale")
    ap.add_argument("--commons-file", default="", help="titlul de pe Wikimedia Commons, de ex. «File:Lynx lynx.jpg»")
    ap.add_argument("--max-side", type=int, default=MAX_SIDE)
    ap.add_argument("--out", default="", help="scrie fragmentul într-un fișier în loc de ieșirea standard")
    a = ap.parse_args(argv)

    if len(a.alt) > 200 or not a.alt.strip():
        ap.error("--alt trebuie să aibă între 1 și 200 de caractere")
    if len(a.author) > 200 or not a.author.strip():
        ap.error("--author trebuie să aibă între 1 și 200 de caractere")
    if a.source_url and not a.source_url.startswith("https://"):
        ap.error("--source-url trebuie să înceapă cu https://")
    if a.commons_file and not a.commons_file.startswith("File:"):
        ap.error("--commons-file trebuie să înceapă cu «File:»")
    if not (2 <= len(a.lang) <= 3 and a.lang.isalpha() and a.lang.islower()):
        ap.error("--lang trebuie să fie un cod de limbă din 2-3 litere mici")
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("Lipsește Pillow: rulează «pip install pillow».", file=sys.stderr)
        return 2
    try:
        uri, w, h, mime = optimise(a.image, a.max_side)
    except (OSError, ValueError) as e:
        print("Eroare: %s" % e, file=sys.stderr)
        return 1
    text = json.dumps(snippet(uri, a.alt, a.lang, a.author, a.licence, a.source_url, a.commons_file), ensure_ascii=False, indent=2)
    if a.out:
        with open(a.out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
    else:
        print(text)
    print("%d×%d px, %s, %d de caractere (limita %d)" % (w, h, mime, len(uri), MAX_CHARS), file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
