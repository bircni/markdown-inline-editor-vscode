import type { Definition, LinkReference, Node, Root } from 'mdast';
import { addScope, hasValidPosition, isInCodeBlock } from './common';
import type { DecorationRange, ScopeRange } from './types';

export function collectLinkDefinitions(ast: Root): Map<string, string> {
  const definitions = new Map<string, string>();
  walkForDefinitions(ast, definitions);
  return definitions;
}

function walkForDefinitions(node: Node, definitions: Map<string, string>): void {
  if (node.type === 'definition') {
    const definition = node as Definition;
    const key = definition.identifier;
    if (key && definition.url) {
      definitions.set(key, definition.url);
    }
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      walkForDefinitions(child, definitions);
    }
  }
}

export function processDefinition(
  node: Definition,
  text: string,
  decorations: DecorationRange[],
  scopes: ScopeRange[],
): void {
  if (!hasValidPosition(node)) {
    return;
  }

  const start = node.position!.start.offset!;
  const end = node.position!.end.offset!;
  if (start >= end) {
    return;
  }

  decorations.push({ startPos: start, endPos: end, type: 'hide' });
  addScope(scopes, start, end, 'linkDefinition');
}

export function processLinkReference(
  node: LinkReference,
  text: string,
  decorations: DecorationRange[],
  scopes: ScopeRange[],
  definitionUrls: Map<string, string>,
  ancestors: Node[],
): void {
  if (!hasValidPosition(node) || isInCodeBlock(ancestors)) {
    return;
  }

  const start = node.position!.start.offset!;
  const end = node.position!.end.offset!;
  const bracketStart = text.indexOf('[', start);
  if (bracketStart === -1 || bracketStart > start) {
    return;
  }

  const bracketEnd = text.indexOf(']', bracketStart + 1);
  if (bracketEnd === -1 || bracketEnd >= end) {
    return;
  }

  decorations.push({ startPos: bracketStart, endPos: bracketStart + 1, type: 'hide' });

  const contentStart = bracketStart + 1;
  if (contentStart < bracketEnd) {
    const url = definitionUrls.get(node.identifier) ?? '';
    decorations.push({
      startPos: contentStart,
      endPos: bracketEnd,
      type: 'link',
      url,
    });
  }

  decorations.push({ startPos: bracketEnd, endPos: bracketEnd + 1, type: 'hide' });

  const referenceStart = bracketEnd + 1;
  if (referenceStart < end) {
    decorations.push({ startPos: referenceStart, endPos: end, type: 'hide' });
  }

  addScope(scopes, start, end, 'link');
}
