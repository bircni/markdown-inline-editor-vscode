/**
 * Scans normalized document text for inline ($...$) and block ($$...$$) math regions.
 * Positions are in normalized text (LF line endings). Block has precedence over inline.
 * Per contract: math-delimiter-grammar.md
 */

import type { MathRegion } from '../parser';

/**
 * Scans text for math regions. Block math ($$...$$) is tried first; then inline ($...$).
 * Escaped \$ does not start/end; empty or whitespace-only content is not treated as math.
 * Inline: $ may have optional whitespace immediately after it and before the closing $;
 * content is trimmed and must be non-empty (so "Price is $10" still has no closing $ → no region).
 *
 * @param text - Normalized document text (LF only)
 * @returns MathRegion[] in document order, non-overlapping
 */
export function scanMathRegions(text: string): MathRegion[] {
  const regions: MathRegion[] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    // Try block first ($$...$$)
    if (text[i] === '$' && i + 1 < n && text[i + 1] === '$') {
      if (isEscaped(text, i)) {
        i++;
        continue;
      }
      const block = tryMatchBlock(text, i);
      if (block) {
        regions.push(block);
        i = block.endPos;
        continue;
      }
      // Block failed (e.g. whitespace-only content); skip both $ so we don't treat as inline
      i += 2;
      continue;
    }

    // Inline: single $ then find next unescaped $; content between is trimmed and must be non-empty
    if (text[i] === '$' && !isEscaped(text, i)) {
      const inline = tryMatchInline(text, i);
      if (inline) {
        regions.push(inline);
        i = inline.endPos;
        continue;
      }
    }

    i++;
  }

  return regions;
}

function isEscaped(text: string, dollarIndex: number): boolean {
  let backslashes = 0;
  let p = dollarIndex - 1;
  while (p >= 0 && text[p] === '\\') {
    backslashes++;
    p--;
  }
  return backslashes % 2 === 1;
}

function tryMatchBlock(text: string, start: number): MathRegion | null {
  if (start + 4 > text.length) return null;
  if (text[start] !== '$' || text[start + 1] !== '$') return null;
  let i = start + 2;
  while (i < text.length) {
    const idx = text.indexOf('$$', i);
    if (idx === -1) return null;
    if (isEscapedAt(text, idx)) {
      i = idx + 1;
      continue;
    }
    const content = text.slice(start + 2, idx).trim();
    if (content.length === 0) {
      i = idx + 2;
      continue;
    }
    return {
      startPos: start,
      endPos: idx + 2,
      source: text.slice(start + 2, idx).trim(),
      displayMode: true,
    };
  }
  return null;
}

function isEscapedAt(text: string, idx: number): boolean {
  if (idx <= 0) return false;
  let backslashes = 0;
  let p = idx - 1;
  while (p >= 0 && text[p] === '\\') {
    backslashes++;
    p--;
  }
  return backslashes % 2 === 1;
}

function tryMatchInline(text: string, start: number): MathRegion | null {
  if (text[start] !== '$') return null;
  let i = start + 1;
  while (i < text.length) {
    const idx = text.indexOf('$', i);
    if (idx === -1) return null;
    if (isEscapedAt(text, idx)) {
      i = idx + 1;
      continue;
    }
    const content = text.slice(start + 1, idx).trim();
    if (content.length === 0) {
      i = idx + 1;
      continue;
    }
    return {
      startPos: start,
      endPos: idx + 1,
      source: content,
      displayMode: false,
    };
  }
  return null;
}
