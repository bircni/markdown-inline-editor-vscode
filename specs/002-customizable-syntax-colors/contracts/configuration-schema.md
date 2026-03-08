# Contract: Configuration schema (color settings)

**Feature**: 002-customizable-syntax-colors  
**Audience**: Extension packaging, Settings UI, config layer

## Scope

The extension contributes the following configuration properties under `contributes.configuration.properties` (section `markdownInlineEditor`). All color settings are optional and accept hex only.

## Property shape

Each color property:

- **Type**: `string`
- **Format**: `"color"` (so VS Code shows a color picker where supported)
- **Description**: Short label + markdown description stating “Leave empty to use theme default.”
- **No default in schema**: Omission means “use theme-derived default.”

## Keys (14 total)

| Key | Description |
|-----|-------------|
| `markdownInlineEditor.colors.heading1` … `heading6` | Hex color for heading levels 1–6. |
| `markdownInlineEditor.colors.link` | Hex color for link text (and link icon). |
| `markdownInlineEditor.colors.listMarker` | Hex color for unordered and ordered list markers. |
| `markdownInlineEditor.colors.inlineCode` | Hex color for inline code. |
| `markdownInlineEditor.colors.emphasis` | Hex color for bold, italic, bold+italic. |
| `markdownInlineEditor.colors.blockquote` | Hex color for blockquote bar and/or text. |
| `markdownInlineEditor.colors.image` | Hex color for image link text/placeholder. |
| `markdownInlineEditor.colors.horizontalRule` | Hex color for horizontal rule line. |
| `markdownInlineEditor.colors.checkbox` | Hex color for unchecked and checked checkbox symbols. |

## Validation

- Values that are not valid hex (`#RGB` or `#RRGGBB`) are treated as unset by the config layer; the extension does not crash and falls back to theme default for that decorator.
- Theme token references (e.g. `editor.foreground`) are not supported in this contract; they are documented as a possible future addition.

## Example (package.json snippet)

```json
"markdownInlineEditor.colors.image": {
  "type": "string",
  "description": "Hex color for image link text",
  "format": "color",
  "markdownDescription": "Hex color for image link text/placeholder. Leave empty to use theme default."
}
```
