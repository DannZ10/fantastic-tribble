"""Turn dropped raw capture files into the assets the site actually serves.

Reads  raw/pNN-*.png|mp4
Writes public/projects/preview-NN.webp   hover panel  (16:10)
       public/projects/shot-NN-0N.webp   detail page  (16:10)
       public/frames/caseNN/001..048.webp  phone scrub (9:19.5)
       public/arc/N.webp                 hero phones  (9:19.5)

Safe to re-run: it only writes projects it finds raw files for, and leaves
every other project's existing assets alone.
"""
import glob
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw")
PUB = os.path.join(ROOT, "public")

FRAME_COUNT = 48


def out(*parts):
    p = os.path.join(PUB, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p


def save(img, path, quality=82):
    img.save(path, "WEBP", quality=quality, method=6)


def desktop(src, dest):
    """Detail/preview shots. Captured at 1440x900, already 16:10, so no crop."""
    im = Image.open(src).convert("RGB")
    if im.width > 1600:
        im = im.resize((1600, round(1600 * im.height / im.width)), Image.LANCZOS)
    save(im, dest)
    return im.size


def content_window(src, blank_threshold=250.0, fps=2.0):
    """Find the stretch of a recording that actually shows the page.

    Playwright starts recording before the first paint, so these clips open on
    a blank white viewport — p02 was white for its first nine seconds. Sampling
    the raw duration would spend half the scrub on nothing. This profiles the
    clip at low resolution and returns the first and last moment that is
    meaningfully darker than a blank page.
    """
    tmp = tempfile.mkdtemp(prefix="prof-")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", src,
             "-vf", f"fps={fps},scale=160:-2", os.path.join(tmp, "%05d.png")],
            check=True,
        )
        frames = sorted(os.listdir(tmp))
        lumas = []
        for f in frames:
            im = Image.open(os.path.join(tmp, f)).convert("RGB").resize((8, 8))
            lumas.append(sum(sum(p) for p in im.get_flattened_data()) / (64 * 3))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    lit = [i for i, l in enumerate(lumas) if l < blank_threshold]
    if not lit:  # nothing ever rendered — fall back to the whole clip
        return 0.0, len(lumas) / fps
    return lit[0] / fps, (lit[-1] + 1) / fps


def frames_from_video(src, dest_dir, count=FRAME_COUNT):
    """Even-spaced stills across the clip's *useful* window.

    Written as PNG by ffmpeg then converted with Pillow: ffmpeg 9's webp
    encoder folds a multi-frame output into one animated .webp instead of a
    numbered sequence, whatever muxer you ask for.

    Width is forced to 540 because the bezel renders ~264 CSS px and needs 2x
    for a retina screen; the 390px capture alone would look soft.
    """
    os.makedirs(dest_dir, exist_ok=True)
    for old in glob.glob(os.path.join(dest_dir, "*.webp")):
        os.remove(old)

    start, end = content_window(src)
    dur = max(0.5, end - start)

    tmp = tempfile.mkdtemp(prefix="frames-")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}",
             "-i", src, "-vf", f"fps={count / dur:.6f},scale=540:-2",
             "-frames:v", str(count), os.path.join(tmp, "%03d.png")],
            check=True,
        )
        pngs = sorted(glob.glob(os.path.join(tmp, "*.png")))
        for i, p in enumerate(pngs[:count], 1):
            save(Image.open(p).convert("RGB"), os.path.join(dest_dir, f"{i:03d}.webp"), 78)
        # a short clip can yield fewer than `count`; repeat the last so the
        # scrubber never indexes past the end
        for i in range(len(pngs) + 1, count + 1):
            shutil.copyfile(
                os.path.join(dest_dir, f"{len(pngs):03d}.webp"),
                os.path.join(dest_dir, f"{i:03d}.webp"),
            )
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    return len(os.listdir(dest_dir)), round(start, 1), round(end, 1)


def mobile_still(src, dest):
    im = Image.open(src).convert("RGB")
    if im.width < 540:
        im = im.resize((540, round(540 * im.height / im.width)), Image.LANCZOS)
    save(im, dest)
    return im.size


def main():
    if not os.path.isdir(RAW):
        sys.exit(f"no raw/ directory at {RAW}")

    files = os.listdir(RAW)
    ids = sorted({f[:3] for f in files if f.startswith("p") and f[1:3].isdigit()})
    if not ids:
        sys.exit("no pNN-* files found in raw/")

    arc_pool = []
    for pid in ids:
        n = pid[1:]
        print(f"\n{pid}")

        prev = os.path.join(RAW, f"{pid}-preview.png")
        if os.path.exists(prev):
            print("  preview      ", desktop(prev, out("projects", f"preview-{n}.webp")))

        shots = sorted(f for f in files if f.startswith(f"{pid}-desktop-") and f.endswith(".png"))
        for i, f in enumerate(shots, 1):
            print(f"  shot-{i:02d}      ", desktop(os.path.join(RAW, f), out("projects", f"shot-{n}-{i:02d}.webp")))

        rec = os.path.join(RAW, f"{pid}-mobile-rec.mp4")
        if os.path.exists(rec):
            fc, a, b = frames_from_video(rec, out("frames", f"case{n}"))
            print(f"  frames        {fc} frames from the {a}s-{b}s window")

        for f in sorted(x for x in files if x.startswith(f"{pid}-mobile-") and x.endswith(".png")):
            arc_pool.append(os.path.join(RAW, f))

    # Real phone screens beat the generated placeholders in the hero arc.
    # Ten slots; whatever is missing keeps the placeholder already in place.
    for i, src in enumerate(arc_pool[:10], 1):
        mobile_still(src, out("arc", f"{i}.webp"))
    print(f"\narc: replaced {min(len(arc_pool), 10)} of 10 hero phones with real screens")


if __name__ == "__main__":
    main()
