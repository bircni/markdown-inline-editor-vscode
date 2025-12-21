/**
 * VS Code compatibility helpers.
 *
 * Keep these checks centralized so decoration/render-option feature gates are consistent.
 */
import * as vscode from 'vscode';

/**
 * `DecorationRenderOptions.lineHeight` was added in newer VS Code versions.
 * We gate usage at runtime to avoid relying on undefined behavior in older hosts.
 *
 * Note: Even if a host ignores unknown properties, this keeps behavior explicit and debuggable.
 */
export function isDecorationLineHeightSupported(): boolean {
  // Confirmed present in @types/vscode 1.107.x. Runtime support aligns with that API level.
  return compareVersions(vscode.version, '1.107.0') >= 0;
}

/**
 * Compares versions of the form "major.minor.patch" (patch optional).
 * Returns:
 * -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersionParts(a);
  const pb = parseVersionParts(b);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const av = pa[i] ?? 0;
    const bv = pb[i] ?? 0;
    if (av < bv) return -1;
    if (av > bv) return 1;
  }
  return 0;
}

function parseVersionParts(v: string): number[] {
  // vscode.version can include pre-release/build suffixes, e.g. "1.107.0-insider"
  const core = v.split('-')[0];
  return core.split('.').map((p) => {
    const n = Number.parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

