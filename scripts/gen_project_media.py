"""Per-project placeholder media for the Work page.

    public/projects/logo-NN.webp      small mark, replaces the "Project NN" label
    public/projects/preview-NN.webp   desktop screenshot shown on hover

Both are drawn at the aspect the layout expects, so dropping in real files is a
straight overwrite — same names, no code change.
"""
import os
import random
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "projects")

BONE = (239, 237, 230)
SURFACE = (227, 224, 214)
SURFACE_2 = (214, 210, 198)
INK = (22, 24, 31)
MUTED = (128, 131, 141)
CREAM = (243, 209, 187)

# One accent per project, matching the `ink` field in cases.ts.
INKS = [
    (37, 47, 76), (84, 84, 65), (58, 63, 82), (47, 58, 92), (74, 74, 58),
    (58, 66, 88), (63, 74, 58), (84, 84, 63), (43, 52, 80),
]

LOGO = 256
PREV_W, PREV_H = 1200, 780  # desktop-ish, matches the CSS aspect-ratio


def rr(d, box, radius, fill):
    d.rounded_rectangle(box, radius=radius, fill=fill)


def logo(n: int) -> Image.Image:
    """A flat geometric mark. Deliberately abstract — a real logo will replace it."""
    accent = INKS[(n - 1) % len(INKS)]
    im = Image.new("RGBA", (LOGO, LOGO), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    m, s = 34, LOGO - 68
    kind = (n - 1) % 6

    if kind == 0:
        d.rounded_rectangle((m, m, m + s, m + s), radius=54, fill=accent)
        d.ellipse((m + 68, m + 68, m + s - 68, m + s - 68), fill=(0, 0, 0, 0))
    elif kind == 1:
        d.polygon([(LOGO // 2, m), (m + s, m + s), (m, m + s)], fill=accent)
    elif kind == 2:
        d.ellipse((m, m, m + s, m + s), fill=accent)
        d.rectangle((LOGO // 2 - 16, m + 44, LOGO // 2 + 16, m + s - 44), fill=(0, 0, 0, 0))
    elif kind == 3:
        for i in range(3):
            y = m + i * (s // 3)
            w = s - i * 46
            rr(d, (m, y, m + w, y + s // 3 - 16), 14, accent)
    elif kind == 4:
        d.polygon([(m, m), (m + s, m), (m + s, m + s)], fill=accent)
        d.polygon([(m, m + 54), (m + s - 54, m + s), (m, m + s)], fill=accent)
    else:
        rr(d, (m, m, m + s, m + s), 20, accent)
        d.polygon(
            [(m + 52, m + s - 52), (LOGO // 2, m + 52), (m + s - 52, m + s - 52)],
            fill=(0, 0, 0, 0),
        )
    return im


def preview(n: int) -> Image.Image:
    """A desktop browser window mock, in the project's accent."""
    rng = random.Random(n * 6151)
    accent = INKS[(n - 1) % len(INKS)]
    dark = n % 3 == 0
    page = INK if dark else BONE
    panel = (36, 41, 56) if dark else SURFACE
    fg = BONE if dark else INK

    im = Image.new("RGB", (PREV_W, PREV_H), SURFACE_2)
    d = ImageDraw.Draw(im)

    # browser chrome
    chrome = 62
    d.rectangle((0, 0, PREV_W, chrome), fill=(228, 226, 218) if not dark else (28, 31, 41))
    for i in range(3):
        x = 28 + i * 30
        d.ellipse((x, chrome // 2 - 9, x + 18, chrome // 2 + 9), fill=MUTED)
    rr(d, (140, 16, PREV_W - 40, chrome - 16), 15, page)

    d.rectangle((0, chrome, PREV_W, PREV_H), fill=page)
    y = chrome + 40

    # site header
    rr(d, (48, y, 48 + 130, y + 26), 7, accent)
    for i in range(4):
        x = PREV_W - 420 + i * 96
        rr(d, (x, y + 6, x + 66, y + 20), 5, MUTED)
    y += 74

    style = n % 3
    if style == 0:  # marketing hero + cards
        rr(d, (48, y, PREV_W - 48, y + 250), 18, accent)
        rr(d, (86, y + 56, 86 + 440, y + 96), 10, CREAM)
        rr(d, (86, y + 118, 86 + 620, y + 146), 8, BONE)
        rr(d, (86, y + 178, 86 + 170, y + 214), 18, CREAM)
        y += 292
        for i in range(3):
            x = 48 + i * ((PREV_W - 96) // 3 + 8)
            rr(d, (x, y, x + (PREV_W - 96) // 3 - 16, y + 200), 14, panel)
            rr(d, (x + 26, y + 30, x + 26 + 90, y + 54), 6, accent)
            rr(d, (x + 26, y + 78, x + 26 + rng.randint(120, 200), y + 96), 5, fg)
    elif style == 1:  # dashboard
        rr(d, (48, y, 268, PREV_H - 48), 14, panel)
        for i in range(6):
            rr(d, (72, y + 28 + i * 52, 72 + rng.randint(90, 170), y + 46 + i * 52), 5, MUTED)
        rr(d, (292, y, PREV_W - 48, y + 210), 14, panel)
        base = y + 180
        for i in range(10):
            h = rng.randint(40, 150)
            x = 326 + i * 76
            rr(d, (x, base - h, x + 48, base), 5, accent if i % 2 else CREAM)
        for i in range(2):
            yy = y + 240
            rr(d, (292 + i * 420, yy, 292 + i * 420 + 396, yy + 190), 14, panel)
    else:  # table / list app
        rr(d, (48, y, PREV_W - 48, y + 66), 12, panel)
        y += 82
        for i in range(6):
            rr(d, (48, y, PREV_W - 48, y + 58), 10, panel if i % 2 else SURFACE_2 if not dark else (30, 34, 46))
            rr(d, (76, y + 20, 76 + rng.randint(150, 320), y + 38), 5, fg)
            rr(d, (PREV_W - 240, y + 18, PREV_W - 140, y + 40), 11, accent if i % 3 else CREAM)
            y += 66
    return im


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for n in range(1, 14):
        logo(n).save(os.path.join(OUT, f"logo-{n:02d}.webp"), quality=92, method=6)
        preview(n).save(os.path.join(OUT, f"preview-{n:02d}.webp"), quality=80, method=6)
    # two detail-page placeholders each, so a project with no uploads yet
        # still renders a complete-looking detail page
        for k in (1, 2):
            preview(n + k * 3).save(os.path.join(OUT, f"shot-{n:02d}-{k:02d}.webp"), quality=80, method=6)
    print("wrote 13 logos + 13 previews + 26 detail shots -> public/projects/")
