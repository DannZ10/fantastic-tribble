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
import io
import os
import re
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw")
PUB = os.path.join(ROOT, "public")

FRAME_COUNT = 48
CASES = os.path.join(ROOT, "src", "data", "cases.ts")


def featured_numbers():
    """The project numbers whose frame sequence is actually requested.

    PhoneScrub only renders inside CaseStack, and CaseStack only renders
    `featured`. Frames for every other project are ~1.4MB each of build
    output that nothing ever fetches, so they are not written at all.
    Change `featured` in cases.ts and re-run this script to regenerate.
    """
    src = io.open(CASES, encoding="utf-8").read()
    nums = set()
    for chunk in src.split("slug:")[1:]:
        m = re.search(r"number: '(\d+)'", chunk)
        if m and "featured: true" in chunk.split("...media")[0]:
            nums.add(m.group(1))
    return nums


def out(*parts):
    p = os.path.join(PUB, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p


def save(img, path, quality=82):
    img.save(path, "WEBP", quality=quality, method=6)


def flat(src, min_stddev=15.0):
    """True when a still is near-uniform, i.e. nothing rendered.

    A capture can land on a loading state the same way a recording opens on
    one: p04-preview.png came back as a flat dark screen (stddev 10.0) while
    the real page measures 88. Standard deviation separates them cleanly —
    a rendered page has text and edges, a loading screen has neither.
    """
    return ImageStat.Stat(Image.open(src).convert("L")).stddev[0] < min_stddev


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

    # capture_portfolio.mjs writes into raw/<project-name>/ while files
    # uploaded by hand land flat in raw/. Index both by basename so either
    # layout works and neither needs copying.
    files = {}
    for root, dirs, names in os.walk(RAW):
        dirs[:] = [d for d in dirs if not d.startswith("temp_rec_")]
        for name in names:
            if name.startswith("p") and name[1:3].isdigit():
                files.setdefault(name, os.path.join(root, name))

    ids = sorted({f[:3] for f in files})
    if not ids:
        sys.exit("no pNN-* files found in raw/")

    wanted = featured_numbers()
    print("featured, so frames are built for:", ", ".join(sorted(wanted)) or "nothing")

    arc_pool = []
    for pid in ids:
        n = pid[1:]
        print(f"\n{pid}")

        shots = [
            files[f]
            for f in sorted(files)
            if f.startswith(f"{pid}-desktop-") and f.endswith(".png")
        ]
        shots = [f for f in shots if not flat(f)]

        prev = files.get(f"{pid}-preview.png")
        if prev and flat(prev):
            # The dedicated preview capture never rendered; the first usable
            # detail shot is a better hover panel than a blank screen.
            prev = shots[0] if shots else None
            print("  preview       flat capture, using", os.path.basename(prev) if prev else "nothing")
        if prev:
            print("  preview      ", desktop(prev, out("projects", f"preview-{n}.webp")))

        for i, f in enumerate(shots, 1):
            print(f"  shot-{i:02d}      ", desktop(f, out("projects", f"shot-{n}-{i:02d}.webp")))

        # Drop shots left over from an earlier run with more captures, or the
        # count in cases.ts will point at a stale duplicate of the last one.
        for stale in sorted(glob.glob(os.path.join(PUB, "projects", f"shot-{n}-*.webp")))[len(shots):]:
            os.remove(stale)
            print("  removed      ", os.path.basename(stale))

        rec = files.get(f"{pid}-mobile-rec.mp4")
        if rec and n in wanted:
            fc, a, b = frames_from_video(rec, out("frames", f"case{n}"))
            print(f"  frames        {fc} frames from the {a}s-{b}s window")

        for f in sorted(x for x in files if x.startswith(f"{pid}-mobile-") and x.endswith(".png")):
            arc_pool.append(files[f])

    for d in sorted(glob.glob(os.path.join(PUB, "frames", "case*"))):
        if os.path.basename(d)[4:] not in wanted:
            shutil.rmtree(d)
            print(f"removed {os.path.basename(d)}: not featured, nothing loads it")

    # Real phone screens beat the generated placeholders in the hero arc.
    # Ten slots; whatever is missing keeps the placeholder already in place.
    for i, src in enumerate(arc_pool[:10], 1):
        mobile_still(src, out("arc", f"{i}.webp"))
    print(f"\narc: replaced {min(len(arc_pool), 10)} of 10 hero phones with real screens")


if __name__ == "__main__":
    main()
