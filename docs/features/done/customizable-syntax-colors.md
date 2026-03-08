---
status: DONE
updateDate: 2025-03-08
priority: Enhancement
---

# Customizable Syntax Colors

## Overview

Optional hex color overrides for headings and other inline Markdown syntax. When a setting is unset or invalid, the extension uses theme-derived defaults (e.g. `editor.foreground`, `textLink.foreground`).

## Implementation

- **Configuration**: 14 optional color properties under `markdownInlineEditor.colors` in `package.json`; config getters in `src/config.ts` with hex validation; decoration factories in `src/decorations.ts` accept optional `color`; `src/decorator/decoration-type-registry.ts` wires config to decoration creation; config and theme change trigger `recreateColorDependentTypes()`.
- **Settings**: Keys `heading1` … `heading6`, `link`, `listMarker`, `inlineCode`, `emphasis`, `blockquote`, `image`, `horizontalRule`, `checkbox` (14 total).
- **Format**: Hex `#RGB` or `#RRGGBB`; invalid/malformed values are ignored and theme default is used (no crash).
- **Behavior**: Changing a color setting or active theme updates open Markdown editors without reload; user-configured hex is preserved when switching themes.

## Acceptance Criteria

```gherkin
Feature: Customizable syntax colors

  Scenario: Set heading color
    When I set "markdownInlineEditor.colors.heading1" to "#e06c75"
    And I open a markdown file with "# Heading"
    Then the heading uses the configured color

  Scenario: Unset uses theme default
    When "markdownInlineEditor.colors.heading1" is unset
    Then headings use editor.foreground from the theme

  Scenario: Invalid hex falls back to theme
    When I set "markdownInlineEditor.colors.link" to "not-a-color"
    Then links use textLink.foreground from the theme
    And the extension does not crash
```

## Notes

- Delivers US3 (discoverable settings) via schema and descriptions in Settings UI.
- Invalid hex is validated in config getters (regex); decorations receive `undefined` and use ThemeColor.
- All 14 options are optional; theme-derived defaults per data-model.md.

## Examples

```json
{
  "markdownInlineEditor.colors.heading1": "#e06c75",
  "markdownInlineEditor.colors.link": "#61afef",
  "markdownInlineEditor.colors.inlineCode": "#98c379",
  "markdownInlineEditor.colors.image": "#61afef",
  "markdownInlineEditor.colors.horizontalRule": "#5c6370",
  "markdownInlineEditor.colors.checkbox": "#98c379"
}
```

## References

- Spec: `specs/002-customizable-syntax-colors/spec.md`
- Issue: [#49](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/49)
