# Research: Inline LaTeX Equation Rendering

**Feature**: 003-inline-latex-equations  
**Date**: 2026-03-08

## 1. Math rendering library

**Decision**: Use **MathJax (mathjax-full)** with **TeX input and SVG output** for rendering LaTeX to a form suitable for editor decorations.

**Rationale**:
- **Markless** (reference) uses MathJax with SVG output; the same approach (LaTeX → SVG → data URI in `contentIconPath`) is proven and displays correctly in VS Code. KaTeX’s HTML output (including HTML inside SVG `foreignObject`) does not render correctly in decorations—only pure SVG does.
- MathJax’s SVG output uses `currentColor` for fill/stroke, so we can inject a theme-appropriate foreground (e.g. `svg { color: #d4d4d4 }` for dark, `#3c3c3c` for light) and keep equations readable in any theme.
- Lazy-loaded via `require()` in the extension context; synchronous once initialized. Good LaTeX coverage (e.g. `\frac`, `\int`, `\sum`, `\begin{align}`).
- On render error or invalid LaTeX, MathJax produces an error SVG; we detect it (e.g. `data-mjx-error=`) and return null so the decorator shows raw source per spec.

**Alternatives considered**:
- **KaTeX**: Initial implementation used KaTeX; HTML/inline-SVG or HTML-in-foreignObject did not display in `contentIconPath` (raw markup visible). Replaced by MathJax SVG path.
- **Custom/minimal parser**: Too much effort and risk; MathJax is maintained and spec-aligned.
- **Server-side rendering**: Rejected; spec requires local rendering.

**Implementation note**: Add `mathjax-full` as a dependency; use TeX + SVG output jax, liteAdaptor, RegisterHTMLHandler; `html.convert(texString, { display })` then read SVG from node, scale by height, inject error CSS and optional `svg { color }` for theme; convert to base64 data URI. Return null on error or when SVG is a MathJax error so decorator shows raw source.

---

## 2. Embedding rendered math in VS Code decorations

**Decision**: Reuse the **Mermaid pattern**: hide the marked range (transparent or zero-width) and show the rendered output in a `before` (or `after`) decoration using `contentIconPath` with a data URI produced from the rendered math (e.g. SVG).

**Rationale**:
- This repo already uses that pattern in `decorator/mermaid-diagram-decorations.ts`: transparent text + `before.contentIconPath: Uri.parse(dataUri)`.
- VS Code does not support arbitrary HTML/SVG in decorations; image URIs (including data URIs) are supported and scale correctly.
- MathJax outputs pure SVG (no HTML/foreignObject); we serialize to a base64 data URI and pass it to the decoration type. For block math, use a separate decoration type with styling (e.g. block display, centering) as needed.

**Alternatives considered**:
- **Webview per expression**: Spec and constitution rule this out (no webview per expression).
- **Only `contentText` in before/after**: Cannot render math; would need a pre-rendered image, which is what the data URI approach provides.
- **Hover-only**: Spec requires inline rendering in the editor, not only on hover.

**Implementation note**: Add a math-decoration module (similar to MermaidDiagramDecorations) that (1) takes ranges + LaTeX source + displayMode, (2) calls MathJax (or a thin wrapper) for LaTeX→SVG, (3) converts SVG to data URI (base64), (4) creates/gets a cached decoration type per content key and theme, (5) applies decoration to the range. Reuse cache/eviction strategy (e.g. LRU) to avoid unbounded growth.

---

## 6. Theme-appropriate math color and sizing

**Decision**: Use **theme-appropriate default foreground** for rendered math (dark theme → light color, light theme → dark color) and **editor font size/line height** for math decoration sizing; **clear math decoration cache** when `editor.fontSize` or `editor.lineHeight` changes.

**Rationale**:
- Rendered math must be readable in both light and dark themes; using VS Code’s default editor foreground equivalents (e.g. `#d4d4d4` dark, `#3c3c3c` light) keeps equations consistent with surrounding text.
- Inline math height is derived from `fontSize * 1.2`; block math from resolved line height (multiplier, pixels, or auto). When the user changes font or line height, math must be re-rendered at the new size.

**Implementation note**: In math-decorations, compute `foregroundColor` from `window.activeColorTheme.kind` (Dark/HighContrast → dark default, else light default) and pass to renderer; renderer injects `svg { color: <hex> }` into the SVG so MathJax’s `currentColor` resolves correctly. Read `editor.fontSize` and `editor.lineHeight` to compute block and inline heights; subscribe to `onDidChangeConfiguration` for those keys and call `clearMathDecorationCache()` then refresh decorations.

---

## 3. Where to detect math (parser vs. dedicated pass)

**Decision**: Detect math in a **dedicated pass over the document text** (regex or character scan), and feed results into the existing decoration pipeline. Do **not** rely on remark AST for math, because standard remark/GFM do not parse `$...$` / `$$...$$` as math nodes.

**Rationale**:
- remark-parse and remark-gfm do not define math nodes; AST would not contain `$...$` / `$$...$$`.
- A separate scan keeps parser-remark focused on standard markdown; math rules (dollar pairing, no-whitespace-after-opening-$) are spec-specific and easier to maintain in one place.
- ParseResult can be extended with `mathBlocks: MathRegion[]` (or similar); the decorator then uses parse cache output + math regions. Document changes still drive cache invalidation; we do not parse on every keystroke.

**Alternatives considered**:
- **Remark plugin for math**: Would require a custom remark plugin and tight coupling; a text pass is simpler and matches the “no parse on every keystroke” constraint by reusing the same cache and running the math scan when the cached parse is produced.
- **Pure regex in parser.ts**: Acceptable if the regex is maintainable and covers multiline block math; otherwise a small scanner (state machine) is clearer for `$$` vs `$` and for escaping.

**Implementation note**: Extend `ParseResult` with something like `mathRegions: Array<{ startPos, endPos, source, displayMode }>`. Implement a function that scans the normalized document text (from the same text used for remark), finds inline and block math per spec (non-whitespace after `$`, escaped `\$` not starting/ending, empty/whitespace-only not math), and returns these regions. Call this from the same place that produces ParseResult (or immediately after parsing), so one cache entry carries both AST-based decorations and math regions.

---

## 4. Block math “visually distinct” (centered / block-styled)

**Decision**: Use a **separate decoration type** for block math that applies display/block styling (e.g. `display: block`, margin, or centering) so block math appears on its own line and is visually distinct from inline math. Exact CSS depends on what VS Code allows in decoration options; if true centering is not possible, “block + optional indent” is acceptable.

**Rationale**:
- Spec and clarifications require block math to be centered or clearly block-styled.
- VS Code decoration API allows different `before`/`after` and other options per decoration type; we can define one type for inline math and one for block math with different styling.

**Alternatives considered**:
- **Same decoration type for both**: Would not satisfy “visually distinct” requirement.
- **Multiple content fragments**: More complex; one image/svg per block is sufficient.

---

## 5. Configuration (math enabled/disabled)

**Decision**: Add a single setting under the existing `markdownInlineEditor` section, e.g. `math.enabled` (boolean, default `true`). When `false`, do not run math detection or apply math decorations; `$...$` and `$$...$$` remain plain text.

**Rationale**:
- Spec FR-010 and SC-007 require one setting to enable/disable math rendering.
- Aligns with existing config pattern (e.g. `config.emojis.enabled()`); read in decorator or wherever decorations are applied and skip math when disabled.

No additional research needed for this; implementation follows existing config patterns.
