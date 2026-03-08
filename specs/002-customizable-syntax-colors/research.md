# Research: Customizable Syntax Colors

**Feature**: 002-customizable-syntax-colors  
**Date**: 2026-03-08

Resolves technical decisions and constraints from the feature spec and plan. No open NEEDS CLARIFICATION items; this document records chosen approaches and alternatives.

---

## 1. Color value format (user input)

**Decision**: Hex only in initial scope (`#RGB` or `#RRGGBB`). Invalid or unsupported values are treated as unset; the extension falls back to theme-derived default for that element.

**Rationale**: Spec explicitly requires hex (e.g. `#ff5500`); theme token references (e.g. `editor.foreground`) are documented as a possible future addition. Keeps validation and parsing simple and avoids dependency on VS Code theme resolution in settings layer.

**Alternatives considered**:
- Theme token references in same release: deferred to avoid scope creep and to keep settings schema simple.
- RGB/RGBA strings: not requested; hex is sufficient and matches VS Code `format: "color"` behavior in Settings UI.

---

## 2. Default colors when user has not set a value

**Decision**: Derive from current VS Code theme via `ThemeColor` (e.g. `editor.foreground`, `textLink.foreground`, `editorWidget.border`). No fixed extension palette for defaults.

**Rationale**: Spec states “theme-based or extension default” and “theme-derived default”; constitution and UX require consistency with VS Code. Using `ThemeColor` ensures defaults follow theme and dark/light switch automatically for unset keys.

**Alternatives considered**:
- Hardcoded hex defaults: rejected because they would not adapt to theme and would conflict with “theme-derived” requirement.
- Single “syntax default” setting: out of scope; 14 discrete keys keep the model simple.

---

## 3. Theme change behavior

**Decision**: When the user switches VS Code theme, preserve all user-configured colors. Only unset (default) colors are re-derived from the new theme.

**Rationale**: Spec clarification: “Preserve user-configured colors; only unset colors follow the new theme.” Implementation already supports this: config returns `string | undefined`; when undefined, decoration factories use `ThemeColor`, which is re-evaluated by VS Code on theme change when `recreateColorDependentTypes()` is called.

**Alternatives considered**:
- Re-applying user hex values on theme change: no change needed; they are already applied.
- Resetting all colors on theme change: contradicts spec.

---

## 4. Where color resolution happens

**Decision**: Resolution happens at decoration-creation time. Config layer returns `string | undefined` (hex or unset). Decoration factories in `decorations.ts` accept `string | ThemeColor | undefined` and resolve to `color ?? new ThemeColor(...)` so that a single factory can be used for both “user hex” and “theme default.”

**Rationale**: Keeps config free of theme APIs; decorations stay the single place that knows theme fallback tokens. Registry calls factories with config getters; on config or theme change, `recreateColorDependentTypes()` recreates only color-dependent decoration types.

**Alternatives considered**:
- Resolving theme default in config (e.g. reading computed theme color): VS Code does not expose resolved theme values to extensions for arbitrary tokens in a reliable way; using `ThemeColor` in decorations is the supported pattern.
- One decoration type per “resolved” color: would require recreating types on every theme change anyway and would complicate the registry; current approach is simpler.

---

## 5. Invalid or malformed hex

**Decision**: Config parses with a strict hex regex; invalid or unsupported values are treated as unset and return `undefined`. Decoration layer receives `undefined` and uses theme default. No crash, no broken document state.

**Rationale**: Spec FR-008 and edge case “invalid or unsupported color value”; constitution requires graceful degradation. Existing `parseHexColor` / `HEX_COLOR_REGEX` in `config.ts` already implement this.

**Alternatives considered**:
- Showing a warning in UI: possible future improvement; not in current scope.
- Allowing partial/case-insensitive hex: current regex already allows 3- and 6-digit hex; no change needed.

---

## 6. Settings surface (image, horizontalRule, checkbox)

**Decision**: Add three settings to match spec: `colors.image`, `colors.horizontalRule`, `colors.checkbox`. One setting for checkbox applies to both unchecked and checked symbols (spec: “one setting”). Same pattern as existing `colors.*`: optional string, hex only, `format: "color"` in package.json.

**Rationale**: Spec table lists image, horizontal rule, and checkbox as configurable; total of 14 options. Existing code already has heading1–6, link, listMarker, inlineCode, emphasis, blockquote; adding these three completes the set. Checkbox uses one setting for both states to keep the count at 14.

**Alternatives considered**:
- Separate checkboxUnchecked / checkboxChecked: spec says “one setting” for checkbox; one setting is used for both.
- Exposing horizontalRule as “border color” in UI: still a single setting key; description can mention “horizontal rule line.”

---

## 7. Strikethrough

**Decision**: Strikethrough is not configurable. It uses theme (e.g. editor foreground) only, as stated in the spec.

**Rationale**: Spec table and FR-009 explicitly exclude strikethrough from the 14 configurable options. No implementation change beyond ensuring it keeps using theme-derived styling only.

---

## Summary

| Topic              | Decision / Pattern                                      |
|--------------------|----------------------------------------------------------|
| User color format  | Hex only; invalid → unset → theme default               |
| Defaults           | Theme-derived via `ThemeColor` in decoration factories  |
| Theme change       | Preserve user colors; re-derive only unset               |
| Resolution         | At decoration creation; config returns hex or undefined |
| Invalid hex        | Treat as unset; fallback in config layer                 |
| Missing settings   | Add image, horizontalRule, checkbox (one checkbox key)   |
| Strikethrough      | Not configurable; theme only                            |
