---
status: IMPLEMENTED
githubIssue: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/20
updateDate: 2026-01-09
priority: High
---

# Show Raw Markdown in Diffs

## Overview

✅ **Implemented** - Configuration settings to show raw markdown syntax when viewing diffs, allowing users to see markdown changes more clearly in both source control view and Copilot inline diffs.

## Implementation

**Configuration Settings:**
- `markdownInlineEditor.defaultBehaviors.diffView.applyDecorations` (boolean, default: `false`)
  - Controls whether decorations are applied in diff views
  - When `false` (default), raw markdown syntax is shown in diff views
  - When `true`, decorations are applied in diff views
  
- `markdownInlineEditor.defaultBehaviors.editor.applyDecorations` (boolean, default: `true`)
  - Controls whether decorations are applied in regular editor views
  - When `true` (default), decorations are applied normally
  - When `false`, raw markdown syntax is shown

**Diff Detection:**
- ✅ Automatically detects diff editors using VS Code's editor API
- ✅ Detects diff context via URI scheme detection
- ✅ Listens for editor changes to update decoration state when switching between diff and normal views

**Scope:**
- ✅ Source control diff view (Git, SVN, etc.)
- ✅ Copilot inline diffs
- ✅ VS Code merge editor
- ✅ Any VS Code diff editor context

**Behavior:**
- ✅ When `diffView.applyDecorations` is `false` (default) and diff is detected, raw markdown syntax is shown (decorations skipped)
- ✅ When `diffView.applyDecorations` is `true`, decorations are applied in diff views
- ✅ When `editor.applyDecorations` is `true` (default), decorations are applied in normal editors
- ✅ Setting changes immediately update active editors

### Affected Components

**Code Modules:**
- ✅ `src/extension.ts` - Configuration reading and change listeners
- ✅ `src/decorator.ts` - Diff detection and decoration skipping logic
- ✅ `src/link-provider.ts` - Diff-aware behavior implemented
- ✅ `package.json` - Configuration contribution

**Systems & Features:**
- VS Code configuration system (`workspace.getConfiguration`, `onDidChangeConfiguration`)
- VS Code editor API (`activeTextEditor`, `TextDocument.uri.scheme`)
- Git/Source Control diff views (`git:` URI scheme)
- VS Code Merge Editor (`vscode-merge:` URI scheme)
- GitHub Copilot inline diffs
- All markdown decoration features (when showing raw in diff mode)

## Acceptance Criteria

### Configuration Setting
```gherkin
Feature: Show raw markdown in diffs configuration

  Scenario: Enable setting
    When I enable "show raw markdown in diffs" setting
    And I open a diff view
    Then markdown decorations are disabled
    And raw markdown syntax is visible

  Scenario: Disable setting
    When I disable "show raw markdown in diffs" setting
    And I open a diff view
    Then markdown decorations are enabled
    And markdown is rendered as usual
```

### Source Control Diff View
```gherkin
Feature: Show raw markdown in source control diff

  Scenario: Diff view with setting enabled
    Given "show raw markdown in diffs" setting is enabled
    When I open source control diff view
    Then decorations are disabled
    And raw markdown changes are visible

  Scenario: Diff view with setting disabled
    Given "show raw markdown in diffs" setting is disabled
    When I open source control diff view
    Then decorations are enabled
    And markdown is rendered
```

### Copilot Inline Diffs
```gherkin
Feature: Show raw markdown in Copilot inline diffs

  Scenario: Copilot diff with setting enabled
    Given "show raw markdown in diffs" setting is enabled
    When Copilot shows inline diff
    Then decorations are disabled
    And raw markdown changes are visible

  Scenario: Copilot diff with setting disabled
    Given "show raw markdown in diffs" setting is disabled
    When Copilot shows inline diff
    Then decorations are enabled
    And markdown is rendered
```

### Edge Cases
```gherkin
Feature: Show raw markdown in diffs edge cases

  Scenario: Setting change during diff view
    Given I have a diff view open
    When I change "show raw markdown in diffs" setting
    Then decorations update immediately

  Scenario: Normal editor view unaffected
    Given "show raw markdown in diffs" setting is enabled
    When I open a normal markdown file
    Then decorations are enabled
```

## Notes

- ✅ **Implemented in v1.6.0** - Makes reviewing markdown changes much easier
- ✅ Problem solved: Rendered markdown no longer obscures actual changes (e.g., heading level changes like `##` to `###` are now clearly visible)
- ✅ Solution: Hierarchical configuration structure with separate settings for diff view and editor
- ✅ Affects both source control view and Copilot inline diffs
- ✅ Default behavior: Raw markdown shown in diff views by default (`diffView.applyDecorations: false`)
- ✅ Users can opt-in to decorations in diff views by setting `diffView.applyDecorations: true`
- ✅ Settings organized into `defaultBehaviors` hierarchy for better organization

## Examples

**Before (with decorations in diff):**
```markdown
## Old Heading
```
Rendered as: **Old Heading** (obscures the actual change)

**After (with setting enabled):**
```markdown
## Old Heading
### New Heading
```
Raw markdown visible: `##` → `###` change is clear

**Configuration:**
```json
{
  "markdownInlineEditor.defaultBehaviors": {
    "diffView": {
      "applyDecorations": false  // Show raw markdown in diffs (default)
    },
    "editor": {
      "applyDecorations": true    // Apply decorations in normal editor (default)
    }
  }
}
```

- **Source Control Diff**: When viewing changes in Git diff, raw markdown is shown instead of rendered
- **Copilot Inline Diff**: When Copilot suggests changes, raw markdown diff is visible
- **Normal Editing**: Regular markdown files still render normally when setting is enabled
