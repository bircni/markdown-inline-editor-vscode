# Quickstart: Inline LaTeX Equation Rendering (003)

**Feature**: 003-inline-latex-equations  
**Audience**: Developers implementing or testing the feature.

## Prerequisites

- Node 18+, npm; VS Code 1.88+ for testing.
- Repo built once: `npm install && npm run compile`.
- Familiarity with `src/parser.ts`, `src/decorator.ts`, and `src/decorator/mermaid-diagram-decorations.ts` is helpful.

## Key files to add or touch

| Area | File(s) | Purpose |
|------|--------|--------|
| Config | `src/config.ts` | Add `math.enabled()` and package.json contribution. |
| Parser / scan | `src/parser.ts` or new `src/math/math-scanner.ts` | Detect math regions; extend ParseResult with `mathRegions`. |
| ParseResult | `src/parser.ts` | Add `MathRegion` type and `mathRegions: MathRegion[]`. |
| Rendering | `src/math/math-renderer.ts` (new) | KaTeX → SVG → data URI; handle errors (return raw). |
| Decorations | `src/math/math-decorations.ts` or under `decorator/` | Apply inline/block math decorations; cache by content key. |
| Decorator | `src/decorator.ts` | When math enabled, pass mathRegions to math decoration module; respect visibility model. |
| Registry | `src/decorator/decoration-type-registry.ts` | Register math decoration types if shared. |
| Tests | `src/parser/__tests__/parser-math.test.ts`, `src/math/__tests__/*.test.ts` | Delimiter grammar, ranges, render failure, reveal-on-select. |

## Implementation order (suggested)

1. **Config**: Add `math.enabled` to package.json and `config.ts`.
2. **Data model**: Define `MathRegion` and extend `ParseResult` with `mathRegions`.
3. **Scanner**: Implement math detection per [contracts/math-delimiter-grammar.md](./contracts/math-delimiter-grammar.md); unit test with parser-math.test.ts.
4. **Renderer**: Add KaTeX dependency; implement LaTeX → data URI (with `throwOnError: false`); on error, return a sentinel so decorator shows raw source.
5. **Decorations**: Implement math decoration application (inline + block types, cache by key); reuse Mermaid pattern (transparent + before contentIconPath).
6. **Integration**: From decorator, when `config.math.enabled()` and parse result has `mathRegions`, render and apply math decorations; hook into visibility model so reveal-on-select shows raw LaTeX.
7. **Block styling**: Ensure block math uses a decoration type with block/centered styling so it is visually distinct.

## Running tests

```bash
npm test -- --testPathPattern="math|parser-math"
npm run validate   # before commit
```

## Spec and contracts

- [spec.md](./spec.md) — requirements and acceptance criteria.
- [data-model.md](./data-model.md) — entities and parsing rules.
- [contracts/math-config-schema.md](./contracts/math-config-schema.md) — setting key and default.
- [contracts/math-delimiter-grammar.md](./contracts/math-delimiter-grammar.md) — delimiter rules for scanner and tests.
