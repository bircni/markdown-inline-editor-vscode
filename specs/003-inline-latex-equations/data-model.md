# Data Model: Inline LaTeX Equation Rendering

**Feature**: 003-inline-latex-equations  
**Date**: 2026-03-08

## Entities

### MathRegion

Represents one detected math span in the document (inline or block). Used by the parser/scanner and consumed by the decorator for rendering and decoration placement.

| Field | Type | Description |
|-------|------|-------------|
| `startPos` | number | Start offset in normalized document text (0-based, inclusive). |
| `endPos` | number | End offset in normalized document text (0-based, exclusive). |
| `source` | string | Raw LaTeX between delimiters (no `$` or `$$`). |
| `displayMode` | boolean | `true` for block math (`$$...$$`), `false` for inline (`$...$`). |

**Validation**:
- `startPos < endPos`.
- `source` is the content between the opening and closing delimiters (trimmed for display mode; see parsing rules).
- Empty or whitespace-only `source` is not emitted (per spec: do not treat as math).

**Lifecycle**: Created during the math scan over the normalized document text; read-only after creation. No state transitions.

---

### RenderedMath (internal)

Internal representation of “math region + its rendered image” for decoration application. Not persisted.

| Field | Type | Description |
|-------|------|-------------|
| `region` | MathRegion | The source region. |
| `dataUri` | string | Data URI of the rendered output (e.g. SVG) for use in `contentIconPath`. |
| `contentKey` | string | Cache key (e.g. hash of source + displayMode + theme) for decoration-type reuse. |

**Validation**: `dataUri` must be a valid URI string (e.g. `data:image/svg+xml;base64,...`). If rendering fails, no RenderedMath is produced; decorator shows raw source (no decoration) per FR-008.

---

## Parsing rules (math detection)

These rules are applied to the **normalized** document text (same as used for remark; LF line endings, position mapping used when converting to editor ranges).

1. **Inline math** (`$...$`):
   - A single `$` starts inline math only if it is **immediately followed by non-whitespace**.
   - The closing `$` is the next unescaped `$` that ends the content (no requirement for non-whitespace before it in the spec; can be tightened to “non-whitespace before closing `$`” for consistency if desired).
   - Escaped `\$` does not start or end a region.
   - Content between delimiters must not be empty or only whitespace (otherwise do not treat as math).

2. **Block math** (`$$...$$`):
   - Two consecutive `$$` start block math; the next two consecutive `$$` end it (can span multiple lines).
   - Escaped `\$` does not start or end; do not treat `\$\$` as block delimiter.
   - Content between `$$` and `$$` must not be empty or only whitespace (otherwise do not treat as math).

3. **Precedence**: When both could apply (e.g. `$$` at start of line), block takes precedence (consume `$$...$$` first, then consider remaining `$` for inline).

4. **No overlap**: Ranges for math regions do not overlap. If a closing delimiter is ambiguous, use the first valid close that preserves non-overlapping regions.

5. **Position mapping**: All `startPos`/`endPos` are in the normalized (LF) text. The decorator (or caller) uses the project’s position-mapping layer to convert to editor line/character ranges when setting decorations.

---

## Integration with ParseResult

Extend the existing `ParseResult` (see `src/parser.ts`) with:

- **mathRegions**: `MathRegion[]` — array of detected math regions in document order.

The parser (or a dedicated math scanner invoked after parsing) populates `mathRegions` from the same document text used for the AST. When the parse cache returns a result, it includes both `decorations`/`scopes`/`mermaidBlocks` and `mathRegions`. The decorator then:
- If `config.math.enabled()` is false, ignores `mathRegions`.
- Otherwise, for each region, renders LaTeX to a data URI, builds RenderedMath (or equivalent), and applies the appropriate decoration type (inline vs block) to the range, respecting the visibility model (reveal on select).

---

## Decoration types (conceptual)

- **mathInline**: Rendered inline math; same pattern as Mermaid (transparent text + `before.contentIconPath` with data URI). Reveal raw on select per visibility model.
- **mathBlock**: Rendered block math; same content pattern but decoration type options set for block/centered styling so it appears visually distinct.

Both use the existing visibility model (e.g. ghost/raw) so that when the selection intersects a math range, raw LaTeX and delimiters are shown; when not selected, rendered output is shown (or raw if render failed).
