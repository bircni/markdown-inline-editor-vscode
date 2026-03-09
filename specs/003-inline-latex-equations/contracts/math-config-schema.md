# Contract: Math configuration

**Feature**: 003-inline-latex-equations  
**Type**: Configuration schema (VS Code settings)  
**Consumers**: Extension code reading `config.math.*`; Settings UI.

## Section

`markdownInlineEditor`

## Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `math.enabled` | `boolean` | `true` | When `true`, inline and block math (`$...$`, `$$...$$`) are detected and rendered. When `false`, no math detection or decoration is applied; delimiters remain plain text. |

## package.json contribution

```json
"markdownInlineEditor.math.enabled": {
  "type": "boolean",
  "default": true,
  "description": "Render LaTeX math inline ($...$ and $$...$$). When disabled, math delimiters are shown as plain text."
}
```

## Access

- **Config module**: `config.math.enabled(): boolean` (see `src/config.ts`).
- **When to read**: Whenever building decoration set for a document (e.g. in decorator); if `false`, do not add math regions to decorations and do not run math renderer.

## Compatibility

- New key; no migration. Default `true` preserves “math on” for existing users when they upgrade.
