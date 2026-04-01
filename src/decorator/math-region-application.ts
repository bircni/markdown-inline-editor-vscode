import type { Range, TextDocument, TextEditor } from 'vscode';
import type { MathRegion } from '../parser';
import type { MathDecorations } from '../math/math-decorations';

export function applyMathDecorationsForEditor(
  editor: TextEditor,
  mathRegions: MathRegion[],
  normalizedText: string,
  selections: readonly Range[],
  document: TextDocument,
  createRange: (startPos: number, endPos: number, originalText?: string) => Range | null,
  isSelectionOrCursorInsideOffsets: (
    startPos: number,
    endPos: number,
    text: string,
    selectionRanges: readonly Range[],
    activeDocument: TextDocument
  ) => boolean,
  mathDecorations: MathDecorations
): void {
  const regionsWithRanges = mathRegions.map((region) => {
    const inside = isSelectionOrCursorInsideOffsets(
      region.startPos,
      region.endPos,
      normalizedText,
      selections,
      document
    );
    return {
      region,
      range: inside ? null : createRange(region.startPos, region.endPos, normalizedText),
    };
  });

  mathDecorations.apply(editor, regionsWithRanges);
}
