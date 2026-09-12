"""Ten phone-shaped project screens for the hero arc.

The arc bezels are 9:19.5. Feeding them the 4:5 gallery tiles meant
`object-fit: cover` threw away most of each image, so these are drawn at
the bezel's own aspect ratio instead.

Replace these with real screenshots of your apps at public/arc/1..10.webp
— same filenames, same aspect, no code change needed.
"""
import os
import random
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "arc")
W, H = 540, 1170

BONE = (239, 237, 230)
SURFACE = (227, 224, 214)
SURFACE_2 = (214, 210, 198)
INK = (22, 24, 31)
MUTED = (128, 131, 141)
NAVY = (37, 47, 76)
OLIVE = (84, 84, 65)
CREAM = (243, 209, 187)


def rr(d, box, radius, fill):
    d.rounded_rectangle(box, radius=radius, fill=fill)


def screen(seed: int) -> Image.Image:
    rng = random.Random(seed * 7919)
    accent = [NAVY, OLIVE, INK, (58, 63, 82)][seed % 4]
    dark = seed % 5 == 0
    bg = INK if dark else BONE
    panel = (34, 38, 52) if dark else SURFACE
    fg = BONE if dark else INK

    im = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(im)
    M = 34

    # status bar + app bar
    rr(d, (M, 44, M + 74, 60), 8, panel)
    rr(d, (W - M - 96, 44, W - M, 60), 8, panel)
    rr(d, (M, 96, M + 190, 130), 9, accent if not dark else CREAM)
    d.ellipse((W - M - 40, 94, W - M, 134), fill=panel)

    y = 174
    kind = seed % 5

    if kind == 0:  # hero card + feed
        rr(d, (M, y, W - M, y + 250), 20, accent)
        rr(d, (M + 28, y + 40, M + 28 + 210, y + 70), 8, CREAM)
        rr(d, (M + 28, y + 92, M + 28 + 300, y + 132), 10, BONE)
        rr(d, (M + 28, y + 178, M + 28 + 150, y + 214), 18, CREAM)
        y += 292
        for _ in range(4):
            rr(d, (M, y, W - M, y + 128), 16, panel)
            d.ellipse((M + 22, y + 30, M + 90, y + 98), fill=accent)
            rr(d, (M + 110, y + 40, M + 110 + rng.randint(150, 280), y + 62), 6, fg)
            rr(d, (M + 110, y + 76, M + 110 + rng.randint(90, 180), y + 92), 5, MUTED)
            y += 146

    elif kind == 1:  # chart dashboard
        rr(d, (M, y, W - M, y + 300), 18, panel)
        base = y + 260
        for i in range(7):
            h = rng.randint(60, 210)
            x = M + 30 + i * 62
            rr(d, (x, base - h, x + 40, base), 6, accent if i % 2 else CREAM)
        y += 340
        for _ in range(2):
            rr(d, (M, y, (W // 2) - 8, y + 150), 16, panel)
            rr(d, ((W // 2) + 8, y, W - M, y + 150), 16, panel)
            rr(d, (M + 24, y + 34, M + 24 + 96, y + 58), 6, accent)
            rr(d, ((W // 2) + 32, y + 34, (W // 2) + 32 + 96, y + 58), 6, CREAM)
            y += 170

    elif kind == 2:  # grid
        for row in range(5):
            for col in range(2):
                x = M + col * ((W - M * 2) // 2 + 8)
                rr(d, (x, y, x + (W - M * 2) // 2 - 8, y + 180), 14, panel)
                rr(d, (x + 18, y + 128, x + 18 + rng.randint(70, 150), y + 148), 5, fg)
            y += 196

    elif kind == 3:  # chat / form
        for i in range(7):
            w = rng.randint(180, 330)
            right = i % 3 == 0
            x0 = W - M - w if right else M
            rr(d, (x0, y, x0 + w, y + rng.randint(70, 118)), 16, accent if right else panel)
            y += 132
        rr(d, (M, H - 120, W - M, H - 56), 22, panel)

    else:  # media list
        rr(d, (M, y, W - M, y + 330), 18, panel)
        d.ellipse((W // 2 - 46, y + 120, W // 2 + 46, y + 212), fill=accent)
        y += 372
        for _ in range(4):
            rr(d, (M, y, M + 96, y + 96), 12, panel)
            rr(d, (M + 118, y + 20, M + 118 + rng.randint(150, 260), y + 42), 6, fg)
            rr(d, (M + 118, y + 56, M + 118 + rng.randint(80, 150), y + 72), 5, MUTED)
            y += 116

    # home indicator
    rr(d, (W // 2 - 70, H - 34, W // 2 + 70, H - 26), 4, MUTED)
    return im


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for n in range(1, 11):
        screen(n).save(os.path.join(OUT, f"{n}.webp"), quality=82, method=6)
    print(f"wrote 10 arc screens -> public/arc/ at {W}x{H}")
