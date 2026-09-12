"""One-off repair of the two uploaded brand assets.

Character PNG arrived from a background remover with two defects:
  * global feather - body pixels sit at alpha 250-254 instead of 255
  * white matte fringe - ~12% of pixels at alpha 1-127 carry blended white

Logo PNG arrived with no alpha channel at all (black on solid white).
"""
import os
from PIL import Image

DL = r"C:\Users\LAPTOP\Downloads"
OUT = r"D:\Projects\Portfolio\public"

CHAR = os.path.join(DL, "ChatGPT Image 12 Sep 2026, 11.58.20.png")
LOGO = os.path.join(DL, "ChatGPT Image 11 Sep 2026, 15.50.21.png")

SOLID = 240   # at or above this, treat as fully opaque
CLEAR = 24    # at or below this, treat as fully transparent


def prep_character():
    im = Image.open(CHAR).convert("RGBA")
    px = im.load()
    w, h = im.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a <= CLEAR:
                px[x, y] = (0, 0, 0, 0)
            elif a >= SOLID:
                px[x, y] = (r, g, b, 255)
            else:
                # un-composite the white matte: observed = a*true + (1-a)*255
                f = a / 255.0
                px[x, y] = (
                    min(255, max(0, int((r - 255 * (1 - f)) / f))),
                    min(255, max(0, int((g - 255 * (1 - f)) / f))),
                    min(255, max(0, int((b - 255 * (1 - f)) / f))),
                    a,
                )

    im = im.crop(im.getchannel("A").point(lambda p: 255 if p > 8 else 0).getbbox())
    im.save(os.path.join(OUT, "characters", "hero.png"), optimize=True)
    im.save(os.path.join(OUT, "characters", "hero.webp"), quality=92, method=6)

    hist = im.getchannel("A").histogram()
    print(f"character -> {im.size}  opaque={hist[255]}  fringe={sum(hist[1:128])}")
    return im.size


def prep_logo():
    im = Image.open(LOGO).convert("L")
    # black mark on white: invert so the mark becomes the alpha mask
    alpha = im.point(lambda p: 255 - p)
    alpha = alpha.point(lambda p: 255 if p > 128 else 0)  # hard threshold, flat art

    mark = Image.new("RGBA", im.size, (0, 0, 0, 255))
    mark.putalpha(alpha)
    mark = mark.crop(alpha.getbbox())
    mark.save(os.path.join(OUT, "brand", "logo-mark.png"), optimize=True)

    # white variant for dark backgrounds
    light = Image.new("RGBA", mark.size, (255, 255, 255, 255))
    light.putalpha(mark.getchannel("A"))
    light.save(os.path.join(OUT, "brand", "logo-mark-light.png"), optimize=True)

    print(f"logo -> {mark.size}  transparent bg, black + white variants")
    return mark.size


if __name__ == "__main__":
    prep_character()
    prep_logo()
