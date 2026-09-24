"""Turn the fresh desktop captures into the assets the site serves.

Reads   raw/pNN-*/pNN-desktop-01..04.png  and  pNN-desktop-rec.mp4
Writes  public/projects/preview-NN.webp   hover preview   (desktop-01)
        public/projects/shot-NN-01..04.webp  detail shots (4 views)
        public/projects/mockup-NN.webp   hero arc frame   (desktop-01)
        public/projects/rec-NN.webm      home-stack screen recording (featured only)

Desktop-only: the phone/frame pipeline is gone. Re-run any time; it only
touches projects it finds captures for.
"""
import glob
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw")
OUT = os.path.join(ROOT, "public", "projects")

# The home "selected work" stack — only these get a (heavier) video.
FEATURED = {"01", "02", "03", "04"}


def webp(src, dst, width, q=80):
    im = Image.open(src).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(width * im.height / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=q, method=6)
    return os.path.getsize(dst) // 1024


def video(src, dst, width=1280, seconds=14):
    """Compress the raw screen recording to a small muted web loop (H.264).

    mp4/H.264 over webm/VP9 on purpose: it encodes in seconds rather than
    minutes and every browser plays it. ~crf 30 keeps a 14s desktop scroll
    near 1MB.
    """
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-an", "-t", str(seconds), "-i", src,
         "-vf", f"scale={width}:-2:flags=lanczos", "-c:v", "libx264",
         "-profile:v", "high", "-crf", "30", "-preset", "veryslow",
         "-movflags", "+faststart", "-pix_fmt", "yuv420p", dst],
        check=True,
    )
    return os.path.getsize(dst) // 1024


def project_dir(n):
    ds = [d for d in glob.glob(os.path.join(RAW, f"p{n}-*")) if os.path.isdir(d)]
    return ds[0] if ds else None


def main():
    ids = sorted(
        {os.path.basename(d)[1:3]
         for d in glob.glob(os.path.join(RAW, "p*")) if os.path.isdir(d)}
    )
    if not ids:
        sys.exit("no raw/pNN-* capture folders found")

    for n in ids:
        d = project_dir(n)
        pid = f"p{n}"
        print(f"\n{pid}")

        shots = sorted(glob.glob(os.path.join(d, f"{pid}-desktop-0*.png")))
        if not shots:
            print("  no desktop shots, skipped"); continue

        print("  preview   ", webp(shots[0], os.path.join(OUT, f"preview-{n}.webp"), 1440))
        print("  mockup    ", webp(shots[0], os.path.join(OUT, f"mockup-{n}.webp"), 1100))
        # clear stale shots from a run with a different count, then write 1..N
        for old in glob.glob(os.path.join(OUT, f"shot-{n}-*.webp")):
            os.remove(old)
        for i, s in enumerate(shots, 1):
            webp(s, os.path.join(OUT, f"shot-{n}-{i:02d}.webp"), 1440)
        print(f"  shots      {len(shots)}")

        rec = os.path.join(d, f"{pid}-desktop-rec.mp4")
        dst_rec = os.path.join(OUT, f"rec-{n}.mp4")
        if n in FEATURED and os.path.exists(rec):
            print("  video     ", video(rec, dst_rec), "KB")
        elif os.path.exists(dst_rec) and n not in FEATURED:
            os.remove(dst_rec)  # dropped from featured — stop shipping its video

    print("\ndone")


if __name__ == "__main__":
    main()
