import argparse
import subprocess
import sys
from pathlib import Path

from imageio_ffmpeg import get_ffmpeg_exe


VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}


def build_output_path(src: Path) -> Path:
    if src.suffix.lower() == ".mp4":
        return src.with_name(f"{src.stem}_h264.mp4")
    return src.with_name(f"{src.stem}_h264.mp4")


def transcode_to_web_compatible(ffmpeg_path: str, src: Path, dst: Path) -> int:
    cmd = [
        ffmpeg_path,
        "-y",
        "-i",
        str(src),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        str(dst),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[FAIL] {src.name}")
        print(result.stderr.strip())
    else:
        print(f"[OK]   {src.name} -> {dst.name}")
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Batch transcode videos to browser-compatible H.264 MP4."
    )
    parser.add_argument(
        "--video-dir",
        default="static/video",
        help="Directory containing source videos (default: static/video)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing *_h264.mp4 outputs",
    )
    args = parser.parse_args()

    video_dir = Path(args.video_dir).resolve()
    if not video_dir.exists() or not video_dir.is_dir():
        print(f"Video directory not found: {video_dir}")
        return 1

    sources = [
        p for p in sorted(video_dir.iterdir()) if p.is_file() and p.suffix.lower() in VIDEO_EXTS
    ]
    if not sources:
        print(f"No video files found in: {video_dir}")
        return 1

    ffmpeg_path = get_ffmpeg_exe()
    print(f"Using ffmpeg: {ffmpeg_path}")

    failed = 0
    for src in sources:
        if src.stem.endswith("_h264"):
            continue

        dst = build_output_path(src)
        if dst.exists() and not args.overwrite:
            print(f"[SKIP] {dst.name} already exists (use --overwrite to replace)")
            continue

        code = transcode_to_web_compatible(ffmpeg_path, src, dst)
        if code != 0:
            failed += 1

    if failed:
        print(f"Done with {failed} failure(s).")
        return 2

    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
