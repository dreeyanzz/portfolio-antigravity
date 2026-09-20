/**
 * PROJECT HERO RENDERER
 *
 * Screenshots index.html once per project and writes assets/projects/<id>.png,
 * which is exactly where js/data.js already points each flagship's `image`.
 *
 *   node tools/project-heroes/render.mjs            # all projects
 *   node tools/project-heroes/render.mjs banter     # just one
 *
 * Headless Chrome does the capture — no dependency to install. The frame is
 * authored at the card's artwork band — 480x196 — and taken at device-scale 2,
 * so the PNG lands at 960x392 and every type size in the source is the size a
 * visitor actually sees.
 *
 * Re-run it after editing index.html. Any PNG here can also just be replaced
 * by hand with a real screenshot; nothing downstream cares which it got.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, '../../assets/projects');
const FRAME = resolve(HERE, 'index.html');

// Must match the ids in js/data.js `flagships`.
const PROJECTS = [
  'veralove',
  'wildcat-one',
  'wall-crack-detector',
  'human-detector-2',
  'smartplug-system',
  'studyhub',
  'banter'
];

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

const requested = process.argv.slice(2);
const targets = requested.length ? requested : PROJECTS;

const unknown = targets.filter((id) => !PROJECTS.includes(id));
if (unknown.length) {
  console.error(`Unknown project(s): ${unknown.join(', ')}\nKnown: ${PROJECTS.join(', ')}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const id of targets) {
  const out = resolve(OUT_DIR, `${id}.png`);
  const url = `${pathToFileURL(FRAME).href}?p=${id}`;

  execFileSync(chrome, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=480,196',
    // Lets the Google Fonts stylesheet land before the shot is taken —
    // without it the type can fall back mid-capture.
    '--virtual-time-budget=10000',
    `--screenshot=${out}`,
    url
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  if (!existsSync(out)) {
    console.error(`  FAILED ${id}`);
    process.exitCode = 1;
    continue;
  }
  console.log(`  ${id}.png  ${(statSync(out).size / 1024).toFixed(0)} KB`);
}
