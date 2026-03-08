# Contract: Config color API

**Feature**: 002-customizable-syntax-colors  
**Consumers**: Decoration-type registry, extension activation

## Interface

The config module exposes a `colors` object with getters for each of the 14 color keys. Each getter:

- **Signature**: `() => string | undefined`
- **Returns**: Valid hex string (e.g. `#ff5500`) when the user has set a valid value; `undefined` when unset or invalid.

## Getters

| Method | Setting key | Used by decoration |
|--------|-------------|---------------------|
| `heading1()` … `heading6()` | `colors.heading1` … `colors.heading6` | Heading1 … Heading6 |
| `link()` | `colors.link` | Link |
| `listMarker()` | `colors.listMarker` | ListItem, OrderedListItem |
| `inlineCode()` | `colors.inlineCode` | Code (inline) |
| `emphasis()` | `colors.emphasis` | Bold, Italic, BoldItalic |
| `blockquote()` | `colors.blockquote` | Blockquote |
| `image()` | `colors.image` | Image |
| `horizontalRule()` | `colors.horizontalRule` | HorizontalRule |
| `checkbox()` | `colors.checkbox` | CheckboxUnchecked, CheckboxChecked |

## Resolution

- Consumer (e.g. registry) calls the getter when creating a decoration type.
- If return value is `string`, pass it to the decoration factory (hex).
- If return value is `undefined`, the decoration factory uses its theme fallback (e.g. `new ThemeColor('editor.foreground')`).
- Invalid or malformed values are normalized to `undefined` inside the config layer; consumers never see invalid strings.

## Theme change

Config getters do not depend on theme. When the active color theme changes, the registry must call `recreateColorDependentTypes()` so that decoration types using theme fallbacks are recreated with the new theme. User-configured (hex) values are unchanged.
