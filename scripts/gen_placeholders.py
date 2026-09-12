"""Generate stand-in media so the scroll effects can be built and reviewed
before the real screen recordings and gallery shots arrive.

Everything here writes to the exact paths the real assets will occupy, so
replacing them later is a file copy and touches no code:

    public/work/1..13.webp          gallery carousel textures   (4:5)
    public/frames/caseNN/001..048.webp   phone scrub sequences  (9:19.5)

Deterministic — same output every run, so a rebuild never churns git.
"""
import os
import random
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

BONE = (239, 237, 230)
SURFACE = (227, 224, 214)
SURFACE_2 = (216, 212, 200)
INK = (22, 24, 31)
MUTED = (106, 109, 120)
NAVY = (37, 47, 76)
OLIVE = (84, 84, 65)
CREAM = (243, 209, 187)

TILE_W, TILE_H = 1200, 1500
FRAME_W, FRAME_H = 540, 1170
FRAME_COUNT = 48


def rounded(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def gallery_tile(seed: int) -> Image.Image:
    """An abstract UI composition — reads as a product shot at carousel size."""
    rng = random.Random(seed * 977)
    accent = [NAVY, OLIVE, INK][seed % 3]
    bg = [BONE, SURFACE, NAVY][seed % 3]
    fg = BONE if bg == NAVY else INK
    panel = SURFACE_2 if bg != NAVY else (48, 58, 88)

    im = Image.new("RGB", (TILE_W, TILE_H), bg)
    d = ImageDraw.Draw(im)
    m = 90

    # top bar
    rounded(d, (m, m, m + 240, m + 34), 17, accent if bg != NAVY else CREAM)
    for i in range(3):
        x = TILE_W - m - 34 - i * 48
        d.ellipse((x, m, x + 26, m + 26), fill=panel)

    y = m + 110
    style = seed % 4

    if style == 0:  # stat tiles over a bar chart
        for col in range(2):
            x = m + col * ((TILE_W - m * 2) // 2 + 14)
            rounded(d, (x, y, x + (TILE_W - m * 2) // 2 - 14, y + 210), 14, panel)
            rounded(d, (x + 28, y + 40, x + 150, y + 72), 8, accent if bg != NAVY else CREAM)
            rounded(d, (x + 28, y + 100, x + 250, y + 150), 10, fg)
        y += 250
        base = y + 430
        for i in range(9):
            h = rng.randint(90, 420)
            x = m + i * ((TILE_W - m * 2) // 9)
            rounded(d, (x, base - h, x + (TILE_W - m * 2) // 9 - 18, base), 8,
                    accent if i % 3 else (CREAM if bg == NAVY else OLIVE))

    elif style == 1:  # list rows
        for i in range(7):
            rounded(d, (m, y, TILE_W - m, y + 132), 14, panel)
            d.ellipse((m + 28, y + 34, m + 92, y + 98), fill=accent if bg != NAVY else CREAM)
            rounded(d, (m + 122, y + 44, m + 122 + rng.randint(220, 480), y + 70), 7, fg)
            rounded(d, (m + 122, y + 84, m + 122 + rng.randint(140, 300), y + 102), 6, MUTED)
            y += 152

    elif style == 2:  # code / editor
        rounded(d, (m, y, TILE_W - m, TILE_H - m), 16, panel)
        ty = y + 44
        for i in range(18):
            indent = rng.choice([0, 0, 38, 76, 114])
            w = rng.randint(160, 640)
            col = [fg, accent, CREAM if bg == NAVY else OLIVE, MUTED][rng.randint(0, 3)]
            rounded(d, (m + 44 + indent, ty, m + 44 + indent + w, ty + 20), 5, col)
            ty += 48

    else:  # phone frame inside a shot
        pw, ph = 420, 900
        px = (TILE_W - pw) // 2
        rounded(d, (px, y, px + pw, y + ph), 46, INK if bg != NAVY else (12, 14, 22))
        rounded(d, (px + 16, y + 16, px + pw - 16, y + ph - 16), 34, BONE)
        iy = y + 80
        rounded(d, (px + 54, iy, px + 54 + 200, iy + 30), 8, accent)
        iy += 70
        for i in range(6):
            rounded(d, (px + 54, iy, px + pw - 54, iy + 84), 12, SURFACE)
            rounded(d, (px + 76, iy + 24, px + 76 + rng.randint(120, 220), iy + 44), 6, INK)
            iy += 100

    return im


def phone_frame(case: int, i: int) -> Image.Image:
    """One frame of a scrolling app screen. Frame index drives scroll offset,
    so scrubbing the sequence reads as a genuine scroll."""
    accent = [NAVY, OLIVE, (58, 63, 82)][case - 1]

    im = Image.new("RGB", (FRAME_W, FRAME_H), BONE)
    d = ImageDraw.Draw(im)

    scroll = int((i / (FRAME_COUNT - 1)) * 980)
    row_h = 108
    y = 210 - scroll

    rows = 22
    for r in range(rows):
        top = y + r * row_h
        if top > FRAME_H or top + row_h < 150:
            continue
        rounded(d, (24, top, FRAME_W - 24, top + row_h - 14), 14, SURFACE)
        d.ellipse((44, top + 22, 44 + 52, top + 74), fill=accent if r % 3 else CREAM)
        # per-row width, stable across frames so rows don't jitter while scrubbing
        w = random.Random(case * 101 + r * 13).randint(120, 300)
        rounded(d, (116, top + 30, 116 + w, top + 48), 6, INK)
        rounded(d, (116, top + 60, 116 + int(w * 0.6), top + 74), 5, MUTED)
        # a state pill, so the scrub visibly carries information
        pill = [NAVY, OLIVE, CREAM][r % 3]
        rounded(d, (FRAME_W - 132, top + 38, FRAME_W - 44, top + 66), 14, pill)

    # sticky app chrome, drawn last so rows pass beneath it
    d.rectangle((0, 0, FRAME_W, 150), fill=BONE)
    rounded(d, (24, 54, 24 + 190, 54 + 34), 9, accent)
    d.ellipse((FRAME_W - 78, 54, FRAME_W - 78 + 34, 54 + 34), fill=SURFACE_2)
    d.line((0, 150, FRAME_W, 150), fill=SURFACE_2, width=2)

    # scroll position indicator
    track_h = 620
    knob = int((i / (FRAME_COUNT - 1)) * (track_h - 90))
    rounded(d, (FRAME_W - 12, 200 + knob, FRAME_W - 7, 200 + knob + 90), 3, accent)

    return im


def main():
    work_dir = os.path.join(OUT, "work")
    os.makedirs(work_dir, exist_ok=True)
    for n in range(1, 14):
        gallery_tile(n).save(os.path.join(work_dir, f"{n}.webp"), quality=82, method=6)
    print(f"wrote 13 gallery tiles -> public/work/")

    for case in (1, 2, 3):
        fdir = os.path.join(OUT, "frames", f"case{case:02d}")
        os.makedirs(fdir, exist_ok=True)
        for i in range(FRAME_COUNT):
            phone_frame(case, i).save(
                os.path.join(fdir, f"{i + 1:03d}.webp"), quality=78, method=6
            )
        print(f"wrote {FRAME_COUNT} frames -> public/frames/case{case:02d}/")


if __name__ == "__main__":
    main()
