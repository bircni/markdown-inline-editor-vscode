# Quickstart: Customizable Syntax Colors (002)

**Feature branch**: `002-customizable-syntax-colors`  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Goal

Implement optional user-configurable colors for markdown headings (h1–h6) and eight syntax categories (links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox). Colors are hex-only; unset values use theme-derived defaults.

## Prerequisites

- Repo root: `npm run validate` passes.
- Branch: `002-customizable-syntax-colors` (or equivalent feature branch).
- Read: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md).

## Implementation order (high level)

1. **Configuration**
   - Add 14 optional color properties to `package.json` under `contributes.configuration.properties` (see [contracts/configuration-schema.md](contracts/configuration-schema.md)).
   - In `src/config.ts`, add getters for each (e.g. `config.colors.heading1()` → string | undefined). Validate hex; return undefined when unset or invalid.

2. **Decorations**
   - In `src/decorations.ts`, extend or add factories so heading, link, list, inline code, emphasis, blockquote, image, horizontal rule, and checkbox decoration types accept an optional color (string hex or ThemeColor). When a hex is provided use it; otherwise use the appropriate ThemeColor (see data-model.md).

3. **Decorator lifecycle**
   - In `src/decorator/` (e.g. decoration-type-registry or decorator), subscribe to `onDidChangeConfiguration` (scope: extension) and `onDidChangeActiveColorTheme`. When config or theme changes, dispose and recreate decoration types that depend on colors so open editors update without reload.

4. **Tests**
   - Config: tests that getters return undefined for unset/invalid, and the hex string for valid values.
   - Decorations: tests that creation with hex vs ThemeColor produces the expected options (and that invalid hex falls back to ThemeColor).
   - No parser or position-mapping changes; no new files under parser/.

## Key files

| File | Role |
|------|------|
| `package.json` | New `markdownInlineEditor.colors.*` properties. |
| `src/config.ts` | New color getters with hex validation. |
| `src/decorations.ts` | Decoration factories that accept optional color (hex or ThemeColor). |
| `src/decorator/decoration-type-registry.ts` (or equivalent) | Recreate types on config/theme change. |

## Validation

- Run `npm run validate` before commit.
- Manually: open Settings, set a heading color, open a markdown file, confirm color applies; change theme and confirm unset colors update and set colors stay.

## Next

After implementation, run `/speckit.tasks` to generate or update [tasks.md](tasks.md) for granular task tracking.
