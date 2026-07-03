import type { Delete, Emphasis, Heading, InlineCode, Node, Strong } from 'mdast';
import {
  addMarkerDecorations,
  addScope,
  getBoldMarker,
  getItalicMarker,
  hasValidPosition,
  isInCodeBlock,
} from './common';
import type { DecorationRange, DecorationType, ScopeRange } from './types';

export function processHeading(
  node: Heading,
  text: string,
  decorations: DecorationRange[],
  scopes: ScopeRange[],
  ancestors: Node[],
): void {
  if (!hasValidPosition(node) || isInCodeBlock(ancestors)) {
    return;
  }

  const start = node.position!.start.offset!;
  const end = node.position!.end.offset!;
  let markerLength = 0;
  let pos = start;
  while (pos < end && text[pos] === '#') {
    markerLength++;
    pos++;
  }

  if (markerLength === 0) {
    return;
  }

  const headingType = `heading${markerLength}` as DecorationType;
  const contentStart = start + markerLength;
  let whitespaceLength = 0;
  let posAfterMarker = contentStart;
  while (posAfterMarker < end && /\s/.test(text[posAfterMarker])) {
    whitespaceLength++;
    posAfterMarker++;
  }

  const hideEnd = contentStart + whitespaceLength;
  decorations.push({ startPos: start, endPos: hideEnd, type: 'hide' });

  const { contentEnd, attributeStart } = splitHeadingAttributeSuffix(text, hideEnd, end);

  if (attributeStart !== null && attributeStart < end) {
    decorations.push({ startPos: attributeStart, endPos: end, type: 'hide' });
  }

  if (hideEnd < contentEnd) {
    decorations.push({ startPos: hideEnd, endPos: contentEnd, type: headingType });
    decorations.push({ startPos: hideEnd, endPos: contentEnd, type: 'heading' });
  }

  addScope(scopes, start, contentEnd, 'heading');
}

/** Pandoc-style attribute suffix, e.g. `{#id}` or `{#id .class}`. */
function splitHeadingAttributeSuffix(
  text: string,
  hideEnd: number,
  end: number,
): { contentEnd: number; attributeStart: number | null } {
  let contentEnd = end;
  while (contentEnd > hideEnd && /\s/.test(text[contentEnd - 1])) {
    contentEnd--;
  }

  const visible = text.slice(hideEnd, contentEnd);
  const match = visible.match(/^(.*?)(\s+\{[^}]+\})$/);
  if (!match) {
    return { contentEnd, attributeStart: null };
  }

  const trimmedVisibleEnd = hideEnd + match[1].length;
  const attributeStart = hideEnd + match[1].length;
  return {
    contentEnd: trimmedVisibleEnd,
    attributeStart,
  };
}

export function processStrong(
  node: Strong,
  text: string,
  decorations: DecorationRange[],
  scopes: ScopeRange[],
  ancestors: Node[],
): void {
  if (!hasValidPosition(node) || isInCodeBlock(ancestors)) {
    return;
  }

  const start = node.position!.start.offset!;
  const end = node.position!.end.offset!;
  const marker = getBoldMarker(text, start);
  if (!marker) {
    return;
  }

  const contentType: DecorationType = ancestors.some((ancestor) => ancestor.type === 'emphasis')
    ? 'boldItalic'
    : 'bold';

  addMarkerDecorations(decorations, start, end, marker.length, contentType);
  addScope(scopes, start, end, contentType);
}

export function processEmphasis(
  node: Emphasis,
  text: string,
  decorations: DecorationRange[],
  scopes: ScopeRange[],
  ancestors: Node[],
): void {
  if (!hasValidPosition(node) || isInCodeBlock(ancestors)) {
    return;
  }

  const start = node.position!.start.offset!;
  const end = node.position!.end.offset!;
  const marker = getItalicMarker(text, start);
  if (!marker) {
    return;
  }

  const parentStrong = ancestors.find((ancestor) => ancestor.type === 'strong');
  if (parentStrong?.position) {
    const strongStart = parentStrong.position.start.offset ?? -1;
    const strongEnd = parentStrong.position.end.offset ?? -1;
    if (start === strongStart + 2 && end === strongEnd - 2) {
      return;
    }
  }

  const contentType: DecorationType = ancestors.some((ancestor) => ancestor.type === 'strong')
    ? 'boldItalic'
    : 'italic';

  addMarkerDecorations(decorations, start, end, marker.length, contentType);
  addScope(scopes, start, end, contentType);
}

export function processStrikethrough(
  node: Delete,
  text: string,
  decorations: DecorationRange[],
  scopes: ScopeRange[],
  ancestors: Node[],
): void {
  if (!hasValidPosition(node) || isInCodeBlock(ancestors)) {
    return;
  }

  const start = node.position!.start.offset!;
  const end = node.position!.end.offset!;
  if (
    start + 1 >= text.length ||
    text[start] !== '~' ||
    text[start + 1] !== '~' ||
    end < 2 ||
    text[end - 2] !== '~' ||
    text[end - 1] !== '~'
  ) {
    return;
  }

  addMarkerDecorations(decorations, start, end, 2, 'strikethrough');
  addScope(scopes, start, end, 'strikethrough');
}

export function processInlineCode(
  node: InlineCode,
  text: string,
  decorations: DecorationRange[],
  scopes: ScopeRange[],
): void {
  if (!hasValidPosition(node)) {
    return;
  }

  const start = node.position!.start.offset!;
  const end = node.position!.end.offset!;
  let markerLength = 0;
  let pos = start;
  while (pos < end && text[pos] === '`') {
    markerLength++;
    pos++;
  }

  if (markerLength === 0) {
    return;
  }

  decorations.push({ startPos: start, endPos: end, type: 'code' });
  decorations.push({ startPos: start, endPos: start + markerLength, type: 'transparent' });
  decorations.push({ startPos: end - markerLength, endPos: end, type: 'transparent' });
  addScope(scopes, start, end, 'code');
}
