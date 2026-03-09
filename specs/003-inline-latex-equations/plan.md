# Implementation Plan: Inline LaTeX Equation Rendering

**Branch**: `003-inline-latex-equations` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-inline-latex-equations/spec.md`

## Summary

Render LaTeX-style math inline in the markdown editor: detect `$...$` (inline) and `$$...$$` (block), render with MathJax to SVG, and display via the existing decoration pipeline—hiding raw delimiters and source. Block math is visually distinct (e.g. centered). Reveal-on-select, no false positives for currency, invalid LaTeX falls back to raw source, and a setting toggles math rendering. Theme-appropriate font color (dark/High Contrast → light text; light → dark text). Use the existing parse cache and position mapping; no line-count limits.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node 18+  
**Primary Dependencies**: VS Code Extension API (^1.88.0), unified / remark-parse / remark-gfm (existing), mathjax-full (see [research.md](./research.md))  
**Storage**: N/A (decoration state in memory; parse cache per document)  
**Testing**: Jest; tests in `src/**/__tests__/*.test.ts`  
**Target Platform**: VS Code 1.88+, cross-platform (Windows, macOS, Linux)  
**Project Type**: VS Code extension (markdown inline editor)  
**Performance Goals**: No full-doc parse on keystroke/selection; decoration updates bounded; large files (>500 lines, >10k lines) supported without disabling math  
**Constraints**: Use markdown-parse-cache; position mapping for CRLF/LF; no webview per expression; pass `npm run validate`  
**Scale/Scope**: Single editor per document; typical docs 10–2000 lines; no hard limit on file size or number of math expressions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|--------|
| **I. Code Quality** | Pass | TypeScript strict; new code under `/src/`; JSDoc for public APIs; `npm run validate` before commit. |
| **II. Testing Standards** | Pass | Tests in `__tests__/` next to module; cover inline/block math, dollar ambiguity, reveal-on-select, invalid LaTeX, empty math, theme color; mock VS Code API as needed. |
| **III. UX Consistency** | Pass | Math follows same reveal-on-select and decoration patterns as other syntax; errors degrade to raw source; setting aligns with VS Code settings UX; theme-appropriate math color (including High Contrast). |
| **IV. Performance** | Pass | Parse cache used; no parse on every keystroke; position mapping for ranges; no line-count skip. |
| **Quality Gates** | Pass | Parser/decorator changes include tests for new syntax and edge cases; feature documented in specs and optionally in `/docs/features/`. |

No violations. Complexity tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/003-inline-latex-equations/
├── plan.md              # This file
├── research.md          # Phase 0: math library choice, decoration approach, theme/sizing
├── data-model.md        # Phase 1: entities, parsing rules
├── quickstart.md        # Phase 1: dev quickstart
├── contracts/           # Phase 1: config contract, delimiter grammar
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

Existing layout; new/updated files for this feature:

```text
src/
├── extension.ts                    # Register math setting; wire math pipeline; clear math cache on font/lineHeight change
├── config.ts                       # Add math.enabled() (and any future math options)
├── parser.ts                       # Add math region detection ($...$, $$...$$); extend ParseResult
├── parser-remark.ts                # No change (math is scan, not AST from remark)
├── markdown-parse-cache.ts         # No change (cache reused)
├── position-mapping.ts             # No change (used for math ranges)
├── decorator.ts                    # Apply math decorations; respect visibility model & setting; clearMathDecorationCache
├── decorations.ts                 # Optional: math-specific helpers if needed
├── decorator/
│   ├── decoration-type-registry.ts # Register math decoration types (inline/block)
│   ├── visibility-model.ts         # Treat math like other syntax (reveal on select)
│   └── (optional) math-*.ts         # See research — rendering in math/
├── parser/__tests__/
│   └── parser-math.test.ts         # Unit tests for math detection and ranges
├── math/                           # New module per research.md
│   ├── math-scanner.ts             # Scan normalized text for $...$ and $$...$$
│   ├── math-renderer.ts            # LaTeX → SVG → data URI (MathJax); null on error
│   ├── math-decorations.ts         # Apply inline/block math decorations; theme color; cache by content key
│   └── __tests__/
│       └── math-renderer.test.ts
└── decorator/__tests__/
    └── decorator-math.test.ts      # Reveal-on-select for math
```

**Structure Decision**: Math detection in a dedicated scanner (`math/math-scanner.ts`) invoked from parser; math rendering and decoration in `math/` module. Theme-appropriate foreground (Dark/HighContrast → light, Light → dark) per spec US5 and research §6.

## Complexity Tracking

Not applicable—no constitution violations.
