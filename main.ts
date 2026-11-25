// u-myronera-post-the-meme-win-the-feed-2de960bf entry program (Node 22, standard library only).
//
// The entry itself is the X post, not this program: the meme (entry.png) was
// made in this session and posted on X from a public account, and POST.json
// at the repository root names that post. All this program has to do is hand
// POST.json to the grader, by copying it into the output directory the
// grader reads. It is deterministic and offline: same input file, same
// output bytes, no network, no randomness.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// It prints nothing on success and exits non-zero only when POST.json cannot
// be found or copied.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'POST.json');
const TARGET = join(OUTPUT_DIR, 'POST.json');

mkdirSync(OUTPUT_DIR, { recursive: true });

// Validate POST.json before copying it, so a placeholder or a mistyped
// address fails loudly here instead of silently scoring 0 at the gate:
// the url must be an X status address, https://x.com/<handle>/status/<id>
// (twitter.com accepted too), with digits only for the id.
const raw = readFileSync(SOURCE, 'utf8');
let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string' || !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/.test(url)) {
  console.error(`POST.json url is not an X status address: ${String(url)}`);
  process.exit(1);
}

try {
  copyFileSync(SOURCE, TARGET);
} catch (err) {
  console.error(`POST.json could not be copied from ${SOURCE} to ${TARGET}: ${(err as Error).message}`);
  process.exit(1);
}
