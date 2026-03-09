/**
 * Tests for math reveal-on-select: when selection/cursor is inside a math region,
 * raw LaTeX is shown (no math decoration applied for that region).
 */

jest.mock('../../math/math-renderer', () => ({
  renderMathToDataUri: jest.fn((source: string) => `data:image/svg+xml,${source}`),
}));

import { Decorator } from '../../decorator';
import { TextDocument, TextEditor, Selection, Position, Uri } from '../../test/__mocks__/vscode';

const text = 'Before $E = mc^2$ after';
const mathRegions = [
  { startPos: 7, endPos: 16, source: 'E = mc^2', displayMode: false },
];

function createDecoratorWithMathCache(): Decorator & {
  parseCache: { get: (doc: ReturnType<typeof TextDocument>) => unknown };
  applyMathDecorations: (regions: typeof mathRegions, normalizedText: string) => void;
  mathDecorations: { apply: jest.Mock; clear: jest.Mock };
} {
  const entry = {
    version: 1,
    text,
    decorations: [],
    scopes: [],
    mermaidBlocks: [],
    mathRegions,
  };
  const parseCache = {
    get: () => entry,
    invalidate: () => {},
    clear: () => {},
  };
  const decorator = new Decorator(parseCache as any) as any;
  decorator.mathDecorations = {
    apply: jest.fn(),
    clear: jest.fn(),
  };
  return decorator;
}

describe('Decorator - Math reveal on select', () => {
  it('applies math decoration when cursor is outside math region', () => {
    const document = new TextDocument(Uri.file('test.md'), 'markdown', 1, text);
    const cursorOutside = new Position(0, 0);
    const editor = new TextEditor(document, [new Selection(cursorOutside, cursorOutside)]);
    const decorator = createDecoratorWithMathCache();
    decorator.setActiveEditor(editor);
    (decorator as any).updateDecorationsInternal();

    expect(decorator.mathDecorations.apply).toHaveBeenCalled();
    const calls = (decorator.mathDecorations.apply as jest.Mock).mock.calls;
    const lastCall = calls[calls.length - 1];
    const regionsWithRanges = lastCall[1];
    expect(regionsWithRanges).toHaveLength(1);
    expect(regionsWithRanges[0].range).not.toBeNull();
  });

  it('does not apply math decoration when cursor is inside math region', () => {
    const document = new TextDocument(Uri.file('test.md'), 'markdown', 1, text);
    const cursorInside = new Position(0, 10);
    const editor = new TextEditor(document, [new Selection(cursorInside, cursorInside)]);
    const decorator = createDecoratorWithMathCache();
    decorator.setActiveEditor(editor);
    (decorator as any).updateDecorationsInternal();

    expect(decorator.mathDecorations.apply).toHaveBeenCalled();
    const calls = (decorator.mathDecorations.apply as jest.Mock).mock.calls;
    const lastCall = calls[calls.length - 1];
    const regionsWithRanges = lastCall[1];
    expect(regionsWithRanges).toHaveLength(1);
    expect(regionsWithRanges[0].range).toBeNull();
  });

  it('shows raw when selection overlaps math region', () => {
    const document = new TextDocument(Uri.file('test.md'), 'markdown', 1, text);
    const selection = new Selection(new Position(0, 5), new Position(0, 12));
    const editor = new TextEditor(document, [selection]);
    const decorator = createDecoratorWithMathCache();
    decorator.setActiveEditor(editor);
    (decorator as any).updateDecorationsInternal();

    expect(decorator.mathDecorations.apply).toHaveBeenCalled();
    const calls = (decorator.mathDecorations.apply as jest.Mock).mock.calls;
    const lastCall = calls[calls.length - 1];
    const regionsWithRanges = lastCall[1];
    expect(regionsWithRanges[0].range).toBeNull();
  });
});
