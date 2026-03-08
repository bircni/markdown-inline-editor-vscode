# Implementation Plan: Customizable Syntax Colors

**Branch**: `002-customizable-syntax-colors` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-customizable-syntax-colors/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Allow users to set optional hex colors for 14 syntax decorators (h1–h6, link, list marker, inline code, emphasis, blockquote, image, horizontal rule, checkbox) via VS Code settings. When a color is unset, use theme-derived defaults. Invalid hex values fall back to the default for that element without breaking rendering. Settings are discoverable in the VS Code Settings UI; theme changes preserve user-configured colors and only re-derive unset defaults. Implementation builds on existing `config.ts` (colors.*), `decorations.ts` (color-capable decoration factories), and `decoration-type-registry.ts` (recreateColorDependentTypes); remaining work is to add the three missing settings (image, horizontalRule, checkbox) and ensure all 14 are wired end-to-end with config → registry → decorations.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node 18+  
**Primary Dependencies**: VS Code Extension API (^1.88.0), remark (unified, remark-parse, remark-gfm)  
**Storage**: N/A (VS Code workspace/user settings only)  
**Testing**: Jest (NODE_OPTIONS=--experimental-vm-modules), existing `__tests__/` next to modules  
**Target Platform**: VS Code extension (desktop)  
**Project Type**: VS Code extension (library surface: Extension API)  
**Performance Goals**: Color setting changes apply to all open markdown editors without undue delay; no parse on keystroke (parse cache only).  
**Constraints**: Hex-only for user input; theme token references (e.g. editor.foreground) documented as future; position mapping for CRLF/LF.  
**Scale/Scope**: 14 configurable color options; typical markdown documents; many open editors supported.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality** | ✓ PASS | TypeScript strict; config in `config.ts`, decorations in `decorations.ts`/`decorator/`; `/src/` only; `npm run validate` before commit. |
| **II. Testing Standards** | ✓ PASS | Tests in `__tests__/`; config-colors and decoration-colors tests present; new/changed behavior must have tests. |
| **III. UX Consistency** | ✓ PASS | Settings in VS Code Settings UI; hex format; invalid values fall back to defaults; theme change preserves user colors. |
| **IV. Performance** | ✓ PASS | Parse cache always used; no parse on selection/keystroke; `recreateColorDependentTypes()` on config/theme change only. |

No violations. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-customizable-syntax-colors/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── config.ts                    # Centralized config; colors.* getters (add image, horizontalRule, checkbox)
├── decorations.ts               # Decoration factories; color params → ThemeColor when undefined
├── decorator.ts                 # Orchestration; subscribes to config/theme, calls recreateColorDependentTypes
├── decorator/
│   ├── decoration-type-registry.ts   # RegistryOptions + recreateColorDependentTypes (wire image, horizontalRule, checkbox)
│   └── __tests__/
│       ├── config-colors.test.ts
│       └── decoration-colors.test.ts
├── extension.ts                 # Activation; passes config color getters into registry
├── parser.ts
├── ... (other existing modules)
```

**Structure Decision**: Single project. All source under `src/`; tests colocated in `__tests__/`. No new top-level directories; changes are confined to config, decorations, decorator registry, extension wiring, and package.json contribution points.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable—no violations.
