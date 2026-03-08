# Data Model: Customizable Syntax Colors

**Feature**: 002-customizable-syntax-colors  
**Date**: 2026-03-08

Entities and validation rules derived from the feature spec. No persistent storage; state is entirely expressed in VS Code workspace/user configuration and runtime decoration types.

---

## Entities

### Heading color setting

| Field     | Type   | Description |
|----------|--------|-------------|
| level    | 1..6   | Heading level (h1–h6). |
| value    | string \| undefined | User-configured hex color (e.g. `#ff5500`) or unset. |

**Validation**: If present, value must match hex format (`#RGB` or `#RRGGBB`). Invalid values are treated as unset.  
**Default when unset**: Theme-derived (e.g. `editor.foreground` via `ThemeColor`).  
**Configuration key**: `markdownInlineEditor.colors.heading1` … `markdownInlineEditor.colors.heading6`.

---

### Syntax color setting

| Field   | Type   | Description |
|--------|--------|-------------|
| category| enum   | One of: link, listMarker, inlineCode, emphasis, blockquote, image, horizontalRule, checkbox. |
| value  | string \| undefined | User-configured hex color or unset. |

**Validation**: Same as heading (hex or unset).  
**Default when unset**: Theme-derived (category-specific token, e.g. `textLink.foreground` for link, `editor.foreground` for listMarker/checkbox, etc.).  
**Configuration keys**: `markdownInlineEditor.colors.link`, `.colors.listMarker`, …, `.colors.checkbox`.  
**Note**: `checkbox` is one setting for both unchecked and checked checkbox symbols.

---

## Relationships

- **Configuration → Runtime**: VS Code `workspace.getConfiguration('markdownInlineEditor').get('colors.<key>')` returns the raw string or undefined. Config module parses to valid hex or undefined; decoration layer receives `string | undefined` and resolves undefined to `ThemeColor(...)`.
- **Theme change**: User-configured (hex) values are unchanged. Only unset keys are re-derived when the active color theme changes (via recreation of color-dependent decoration types).
- **Decoration types**: Each configurable decorator (14 total) has a corresponding decoration type created with either the user hex or a theme fallback. Registry holds these types and recreates them when config or theme changes.

---

## State transitions

- **User sets a color**: Setting is stored by VS Code; next config read returns the value; on next `recreateColorDependentTypes()` (or editor update), decorations use the new color.
- **User clears a color**: Setting becomes unset; config returns undefined; decorations fall back to theme default.
- **User enters invalid hex**: Parsed as undefined; behavior same as “user clears.”
- **Theme change**: Extension receives event; calls `recreateColorDependentTypes()`; all decoration types are recreated; unset colors now use new theme’s tokens; user-set hex unchanged.

---

## Out of scope

- **Strikethrough**: Not an entity in this feature; uses theme only, not configurable.
- **Theme token references in settings**: Not in initial scope; documented as future addition.
- **Persistence**: Handled by VS Code; no extension-owned storage.
