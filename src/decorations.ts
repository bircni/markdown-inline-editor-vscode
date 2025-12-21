import { window, ThemeColor } from 'vscode';
import { isDecorationLineHeightSupported } from './vscode-compat';

export interface HeadingDecorationOptions {
  /**
   * CSS `line-height` value to apply to heading text.
   *
   * Example values: `"1.4"`, `"1.6em"`, `"24px"`.
   */
  lineHeight?: string;
}

/**
 * Creates a decoration type for hiding markdown syntax.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type that hides text
 */
export function HideDecorationType() {
  return window.createTextEditorDecorationType({
    // Hide the item
    textDecoration: 'none; display: none;',
    // This forces the editor to re-layout following text correctly
    after: {
      contentText: '',
    },
  });
}

/**
 * Creates a decoration type for bold text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold text
 */
export function BoldDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for italic text
 */
export function ItalicDecorationType() {
  return window.createTextEditorDecorationType({
    fontStyle: 'italic',
  });
}

/**
 * Creates a decoration type for bold+italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold+italic text
 */
export function BoldItalicDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
    fontStyle: 'italic',
  });
}

/**
 * Creates a decoration type for strikethrough text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for strikethrough text
 */
export function StrikethroughDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'line-through',
  });
}

/**
 * Creates a decoration type for inline code styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for inline code
 */
export function CodeDecorationType() {
  // Note: backgroundColor doesn't work for inline decorations (only for isWholeLine: true)
  // So we just use the theme's default styling
  return window.createTextEditorDecorationType({
    // No custom styling - will use editor's default inline code appearance
  });
}

/**
 * Creates a decoration type for code block styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for code blocks
 */
export function CodeBlockDecorationType() {
  return window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('textCodeBlock.background'), // Use theme color instead of red
    isWholeLine: true, // Extend background to full line width
  });
}

/**
 * Heading decoration configuration
 */
const HEADING_CONFIG = [
  { size: '200%', bold: true },  // H1
  { size: '150%', bold: true },  // H2
  { size: '110%', bold: true },  // H3
  { size: '100%', bold: false }, // H4
  { size: '90%', bold: false },  // H5
  { size: '80%', bold: false },  // H6
];

/**
 * Builds the render options for the generic heading decoration.
 * Exported for unit testing and for consistent option composition.
 */
export function getGenericHeadingDecorationRenderOptions(options?: HeadingDecorationOptions): Record<string, unknown> {
  const base: Record<string, unknown> = {
    fontWeight: 'bold',
  };

  const lineHeight = options?.lineHeight?.trim();
  // Only set lineHeight if VS Code version supports it (>= 1.107.0)
  if (lineHeight && isDecorationLineHeightSupported()) {
    base.lineHeight = lineHeight;
  }

  return base;
}

export function HeadingDecorationType(options?: HeadingDecorationOptions) {
  return window.createTextEditorDecorationType(getGenericHeadingDecorationRenderOptions(options) as any);
}

/**
 * Builds the render options for a given heading level.
 * Exported for unit testing and for consistent option composition.
 */
export function getHeadingDecorationRenderOptions(level: number, options?: HeadingDecorationOptions): Record<string, unknown> {
  const config = HEADING_CONFIG[level - 1];
  if (!config) throw new Error(`Invalid heading level: ${level}`);

  const base: Record<string, unknown> = {
    textDecoration: `none; font-size: ${config.size};`,
    ...(config.bold ? { fontWeight: 'bold' } : { color: new ThemeColor('descriptionForeground') }),
  };

  const lineHeight = options?.lineHeight?.trim();
  // Only set lineHeight if VS Code version supports it (>= 1.107.0)
  if (lineHeight && isDecorationLineHeightSupported()) {
    base.lineHeight = lineHeight;
  }

  return base;
}

function createHeadingDecoration(level: number, options?: HeadingDecorationOptions) {
  return window.createTextEditorDecorationType(getHeadingDecorationRenderOptions(level, options) as any);
}

export const Heading1DecorationType = (options?: HeadingDecorationOptions) => createHeadingDecoration(1, options);
export const Heading2DecorationType = (options?: HeadingDecorationOptions) => createHeadingDecoration(2, options);
export const Heading3DecorationType = (options?: HeadingDecorationOptions) => createHeadingDecoration(3, options);
export const Heading4DecorationType = (options?: HeadingDecorationOptions) => createHeadingDecoration(4, options);
export const Heading5DecorationType = (options?: HeadingDecorationOptions) => createHeadingDecoration(5, options);
export const Heading6DecorationType = (options?: HeadingDecorationOptions) => createHeadingDecoration(6, options);

/**
 * Creates a decoration type for link styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for links
 */
export function LinkDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
    textDecoration: 'underline',
  });
}

/**
 * Creates a decoration type for image styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for images
 */
export function ImageDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
  });
}

/**
 * Creates a decoration type for blockquote marker styling.
 * 
 * Replaces '>' characters with a vertical blue bar.
 * Nested blockquotes automatically show multiple bars (one per '>').
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for blockquote markers
 */
export function BlockquoteDecorationType() {
  // Hide the '>' character and replace it with a vertical bar
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Properly hide the original '>' character
    before: {
      contentText: '│',
      color: new ThemeColor('textLink.foreground'),
      fontWeight: 'bold',
    },
  });
}

/**
 * Creates a decoration type for list item styling.
 * 
 * Replaces list markers (-, *, +) with a bullet point (•).
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for list items
 */
export function ListItemDecorationType() {
  // Hide the list marker and replace it with a bullet point
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Properly hide the original marker
    before: {
      contentText: '• ',
      // No color specified - uses regular text color
    },
  });
}

/**
 * Creates a decoration type for horizontal rules (thematic breaks).
 * 
 * Replaces ---, ***, or ___ with a visual horizontal line that spans the full editor width.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for horizontal rules
 */
export function HorizontalRuleDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hide the original text
    after: {
      contentText: '─'.repeat(200), // Very long horizontal line
      color: new ThemeColor('editorWidget.border'),
    },
    isWholeLine: true,
  });
}
