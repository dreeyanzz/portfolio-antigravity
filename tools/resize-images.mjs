/**
 * IMAGE DOWNSCALER
 *
 * Reads a manifest of source images, fits each one inside a box, re-encodes it
 * as JPEG and writes it under assets/. Straight photos off a phone run 1–4MB
 * each; at the size a bento tile actually renders them that is one to two
 * orders of magnitude more data than the page can use.
 *
 *   node tools/resize-images.mjs
 *
 * Headless Chrome does the decode, scale and encode, exactly as
 * tools/project-heroes/render.mjs does its capture — the browser is already
 * the only image toolchain this repo can count on, so there is nothing to
 * install. Sources are read as data URLs into a page that draws them to a
 * canvas and hands back a JPEG data URL.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { dirname, resolve, extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];

const chrome = CHROME_CANDIDATES.find(existsSync);
if (!chrome) {
  console.error('No Chrome or Edge found. Checked:\n  ' + CHROME_CANDIDATES.join('\n  '));
  process.exit(1);
}

const manifestPath = resolve(HERE, 'resize-manifest.json');
if (!existsSync(manifestPath)) {
  console.error(`Missing manifest: ${manifestPath}`);
  process.exit(1);
}
const jobs = JSON.parse(readFileSync(manifestPath, 'utf8'));

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

function dataUrl(file) {
  const ext = extname(file).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
}

let done = 0, failed = 0, savedBytes = 0;

for (const job of jobs) {
  const src = job.src;
  const out = resolve(ROOT, job.out);
  if (!existsSync(src)) {
    console.error(`  MISS ${src}`);
    failed++;
    continue;
  }
  mkdirSync(dirname(out), { recursive: true });

  // The page cannot be handed a file:// path for the source and still read
  // the canvas back — a file:// image taints it. Inlining the bytes keeps the
  // canvas clean so toDataURL() is allowed.
  const page = `<!doctype html><meta charset="utf-8"><body><script>
    const img = new Image();
    img.onload = () => {
      const max = ${job.max}, q = ${job.quality ?? 0.82};
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      const x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      // JPEG has no alpha; without this, transparent PNGs come out black.
      x.fillStyle = '#FFFAF7';
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      document.title = c.toDataURL('image/jpeg', q) + '|' + c.width + 'x' + c.height;
    };
    img.onerror = () => { document.title = 'ERR'; };
    img.src = ${JSON.stringify(dataUrl(src))};
  <\/script>`;

  const tmpPage = resolve(tmpdir(), `resize-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  const tmpDump = resolve(tmpdir(), `resize-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
  writeFileSync(tmpPage, page, 'utf8');

  try {
    // --dump-dom gives back the serialized document, and the title is where
    // the page parked the encoded result.
    const dom = execFileSync(chrome, [
      '--headless',
      '--disable-gpu',
      '--virtual-time-budget=12000',
      '--dump-dom',
      pathToFileURL(tmpPage).href
    ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

    const m = dom.match(/<title>([\s\S]*?)<\/title>/);
    if (!m || m[1] === 'ERR' || !m[1].startsWith('data:image/jpeg;base64,')) {
      throw new Error('no encoded result in page title');
    }
    const [url, dims] = m[1].split('|');
    const buf = Buffer.from(url.slice('data:image/jpeg;base64,'.length), 'base64');
    writeFileSync(out, buf);

    const before = statSync(src).size;
    savedBytes += before - buf.length;
    console.log(`  ok   ${basename(job.out).padEnd(28)} ${dims.padEnd(11)} ${(before / 1024 | 0)}K -> ${(buf.length / 1024 | 0)}K`);
    done++;
  } catch (err) {
    console.error(`  FAIL ${job.out}: ${err.message}`);
    failed++;
  } finally {
    rmSync(tmpPage, { force: true });
    rmSync(tmpDump, { force: true });
  }
}

console.log(`\n${done} written, ${failed} failed, ${(savedBytes / 1048576).toFixed(1)}MB saved.`);
process.exit(failed ? 1 : 0);
