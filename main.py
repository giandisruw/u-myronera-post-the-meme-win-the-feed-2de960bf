#!/usr/bin/env python3
"""Copy the meme image to the output directory, deterministically.

The graded entry for this bounty is the X post named in POST.json (see
main.ts, the kit entrypoint). This helper exists so the meme image itself
can be reproduced byte-for-byte through a plain entrypoint: it copies
entry.png from the repository root to /output/entry.png (or $MAKEFUN_OUTPUT_DIR).

No network, no randomness, no wall clock: running it twice writes the
same bytes both times.

Usage:
    python3 main.py [--out DIR]
"""

import argparse
import hashlib
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SOURCE = REPO_ROOT / "entry.png"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description="Copy entry.png to the output directory.")
    parser.add_argument("--out", default=None, help="Output directory (default: $MAKEFUN_OUTPUT_DIR or /output)")
    args = parser.parse_args()

    import os

    out_dir = Path(args.out or os.environ.get("MAKEFUN_OUTPUT_DIR", "/output"))
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / "entry.png"

    if not SOURCE.exists():
        print(f"entry.png not found at {SOURCE}", file=sys.stderr)
        return 1

    shutil.copyfile(SOURCE, target)
    # Verify the copy is byte-identical: a silent partial copy would hand
    # the grader a corrupt image, so refuse to report success on mismatch.
    if sha256(SOURCE) != sha256(target):
        print("copy mismatch: output bytes differ from entry.png", file=sys.stderr)
        return 1
    print(f"copied {SOURCE} -> {target}")
    print(f"sha256: {sha256(target)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
