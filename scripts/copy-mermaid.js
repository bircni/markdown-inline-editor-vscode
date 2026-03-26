#!/usr/bin/env node
/* eslint-env node */

/**
 * Cross-platform replacement for the copy:mermaid shell one-liner.
 * Copies mermaid dist files into assets/mermaid/.
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const SRC     = path.join(ROOT, 'node_modules', 'mermaid', 'dist');
const DEST    = path.join(ROOT, 'assets', 'mermaid');
const CHUNKS  = path.join(SRC, 'chunks');

/** Copy a single file, silently skipping if it does not exist. */
function copyFile(src, destDir) {
  if (!fs.existsSync(src)) return;
  fs.copyFileSync(src, path.join(destDir, path.basename(src)));
}

/** Copy all files in srcDir whose names match predicate into destDir. */
function copyMatching(srcDir, destDir, predicate) {
  if (!fs.existsSync(srcDir)) return;
  for (const name of fs.readdirSync(srcDir)) {
    const full = path.join(srcDir, name);
    if (fs.statSync(full).isFile() && predicate(name)) {
      fs.copyFileSync(full, path.join(destDir, name));
    }
  }
}

/** Recursively copy a directory tree. */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

fs.mkdirSync(DEST, { recursive: true });

// mermaid.esm.min.mjs
copyFile(path.join(SRC, 'mermaid.esm.min.mjs'), DEST);

// mermaid-*.js
copyMatching(SRC, DEST, n => n.startsWith('mermaid-') && n.endsWith('.js'));

// *Diagram*.js
copyMatching(SRC, DEST, n => n.includes('Diagram') && n.endsWith('.js'));

// *-*.js  (catches remaining chunk/helper files)
copyMatching(SRC, DEST, n => /^[^.]+-.+\.js$/.test(n));

// chunks/ sub-directory (if present)
copyDir(CHUNKS, path.join(DEST, 'chunks'));

console.log('✅ Mermaid assets copied to assets/mermaid/');
