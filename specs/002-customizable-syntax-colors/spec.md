# Feature Specification: Customizable Syntax Colors

**Feature Branch**: `002-customizable-syntax-colors`  
**Created**: 2025-03-08  
**Status**: Draft  
**Input**: Implement [GitHub issue #49](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/49): allow users to change colors for markdown headings (h1–h6) and other inline syntax. Keep the solution simple and not overly complex.

---

## Syntax decorators (overview)

This feature covers only **syntax decorators** that render visible colored content. Structural/utility decorators (e.g. hide, transparent, ghost, selection overlay, emoji replacement) are not in scope.

| Decorator | Configurable | Setting key(s) | Notes |
|-----------|-------------|----------------|-------|
| **Headings** (h1–h6) | Yes | `colors.heading1` … `colors.heading6` | Six levels. |
| **Link** | Yes | `colors.link` | Link text and optional trailing icon. |
| **List marker** | Yes | `colors.listMarker` | Unordered (•) and ordered list numbers. |
| **Inline code** | Yes | `colors.inlineCode` | Backtick-wrapped code. |
| **Emphasis** | Yes | `colors.emphasis` | Bold, italic, bold+italic (one setting). |
| **Blockquote** | Yes | `colors.blockquote` | Blockquote bar and/or text. |
| **Image** | Yes | `colors.image` | Image link text/placeholder. |
| **Horizontal rule** | Yes | `colors.horizontalRule` | Horizontal rule line. |
| **Checkbox** (unchecked/checked) | Yes | `colors.checkbox` | Unchecked and checked checkbox symbols (one setting). |
| **Strikethrough** | No | — | Uses theme (editor foreground). |

**Total configurable:** 14 settings (6 heading + 8 syntax). Strikethrough uses theme-derived color only and is not configurable in this feature.

---

## Clarifications

### Session 2025-03-08

- Q: When the user switches VS Code theme, should user-configured colors be preserved or re-derived from the new theme? → A: Preserve user-configured colors; only unset colors follow the new theme.
- Q: Which "other syntax" categories are in scope for P2? → A: Links, list markers, inline code, emphasis, blockquote (5 categories).
- Q: Which color value format(s) should the extension accept? → A: Hex only in initial scope; theme token references (e.g. editor.foreground) documented as a possible future addition.
- Q: When the user has not set a color, where should the default come from? → A: Derive from current theme; use theme colors for headings/syntax when no setting is present.
- Q: Should the spec define a maximum time for color-setting changes to apply? → A: No; keep "few seconds" and "without undue delay"; defer concrete targets to the plan.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Override heading colors (Priority: P1)

As a user editing markdown in VS Code, I can set custom colors for heading levels (h1–h6) so that headings match my theme or preferences. When I open a markdown file, headings use my chosen colors instead of defaults that don’t fit my theme.

**Why this priority**: Directly addresses the issue: “The theme that I use doesn’t bring good colors for headings.”

**Independent Test**: Open extension settings, set a color for one or more heading levels, open a markdown file with those headings, and confirm the displayed colors match the settings.

**Acceptance Scenarios**:

1. **Given** the extension is enabled, **when** I set a color for a heading level (e.g. h1) in settings, **then** that heading level is shown in the chosen color in open markdown files.
2. **Given** I have set colors for multiple heading levels (h1–h6), **when** I open a markdown file with those levels, **then** each level uses its configured color.
3. **Given** I have not set a color for a heading level, **when** the file is displayed, **then** that level uses a sensible default (e.g. theme-based or extension default) so the document remains readable.
4. **Given** I change or clear a heading color in settings, **when** the markdown file is already open, **then** the display updates to reflect the new setting without requiring a reload.

---

### User Story 2 – Override colors for other syntax (Priority: P2)

As a user, I can optionally set colors for other inline markdown syntax (links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox) so that all styled elements can match my theme, without having to configure every construct separately.

**Why this priority**: Issue asks for “the rest of the syntax”; delivering it as a small set of options keeps complexity low.

**Independent Test**: Set colors for one or more “other syntax” options in settings, open a markdown file containing those constructs, and confirm the colors apply.

**Acceptance Scenarios**:

1. **Given** the extension supports syntax categories for links, list markers, inline code, emphasis, blockquote, image, horizontal rule, and checkbox, **when** I set a color for a category, **then** that category is rendered in the chosen color in open markdown files.
2. **Given** I have not set a color for a category, **when** the file is displayed, **then** that category uses a theme-derived default so the document remains readable.
3. **Given** I change or clear a syntax color in settings, **when** the markdown file is already open, **then** the display updates without requiring a reload.
4. **Given** a markdown file contains syntax that is not configurable (e.g. strikethrough), **when** I view or edit the file, **then** that syntax uses theme-derived colors and no error occurs.

---

### User Story 3 – Simple, discoverable settings (Priority: P1)

As a user, I find color settings in the normal VS Code Settings UI (e.g. under the extension’s group) without editing config files or CSS. Settings use clear labels and, where possible, color pickers or standard color values.

**Why this priority**: Keeps the feature simple and consistent with VS Code; avoids “too complex” (no CSS file required for basic use).

**Independent Test**: Open VS Code Settings, search for the extension or “markdown inline,” and confirm heading and syntax color options are visible and editable.

**Acceptance Scenarios**:

1. **Given** the extension is installed, **when** I open Settings (UI), **then** I see heading color options (and any other syntax color options) under the extension’s settings group.
2. **Given** I am editing a color setting, **when** the setting accepts a color value, **then** I can enter a value in hex format (e.g. `#ff5500`); theme token references may be supported in a future release.
3. **Given** I have never configured colors, **when** I open the extension settings, **then** defaults are applied and the extension works without any configuration.

---

### Edge Cases

- **Invalid or unsupported color value**: If the user enters an invalid color (e.g. malformed hex), the extension falls back to the default for that element and does not break rendering or crash.
- **Theme change**: When the user switches VS Code theme, user-configured colors are preserved; only unset (default) colors are re-derived from the new theme.
- **Many open editors**: Changing a color setting updates all open markdown editors that use the extension without undue delay or errors.
- **Minimal scope**: “Other syntax” includes eight categories: links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox. Only strikethrough uses theme-derived color only and is not configurable in this feature (see [Syntax decorators (overview)](#syntax-decorators-overview)).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST allow the user to set an optional color for each of the six heading levels (h1–h6) via VS Code settings.
- **FR-002**: The extension MUST apply the user-configured heading colors to the corresponding heading levels in the inline-rendered markdown view when those settings are present.
- **FR-003**: When a heading level has no user-configured color, the extension MUST use a defined default (theme-based or extension default) so headings remain visible and readable.
- **FR-004**: The extension MUST allow the user to set optional colors for eight additional syntax categories—links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox—via VS Code settings, without requiring a CSS file or per-construct configuration.
- **FR-005**: When a syntax category has no user-configured color, the extension MUST use a theme-derived default so that category remains readable.
- **FR-006**: When the user changes or clears a color setting, the extension MUST update the display in all affected open markdown editors without requiring the user to reload the file or restart the editor.
- **FR-007**: Color settings MUST be discoverable and editable in the VS Code Settings UI under the extension’s settings group, with clear names; color values MUST be in hex format (e.g. `#ff5500`). Support for theme token references (e.g. `editor.foreground`) is documented as a possible future addition.
- **FR-008**: The extension MUST handle invalid or unsupported color values gracefully by falling back to the default for that element and MUST NOT crash or leave the document in a broken state.
- **FR-009**: The total number of configurable color options MUST remain small: six heading levels plus eight syntax categories (links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox), i.e. 14 options total.

### Key Entities

- **Heading color setting**: A user preference for the display color of one heading level (h1–h6); optional; has a defined default when unset.
- **Syntax color setting**: A user preference for the display color of one of eight non-heading categories: links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox; optional; has a defined default when unset.

---

## Assumptions

- Users are satisfied with configuring colors via VS Code settings (no requirement for a custom CSS file in the initial scope).
- “Other syntax” is implemented as exactly eight categories: links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox. Only strikethrough is not configurable in this feature.
- Color values are in hex format (e.g. `#ff5500`); theme token references (e.g. `editor.foreground`) may be added in a future release.
- Default colors for unset options are derived from the current VS Code theme (no fixed extension palette for defaults).
- Concrete maximum time for settings to apply is not specified in this spec; the implementation plan may define latency targets if needed.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open Settings, set a color for at least one heading level, and see that color applied in an open markdown file within a few seconds without reloading.
- **SC-002**: A user can configure colors for all six heading levels and for the eight syntax categories (links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox) without encountering more than 14 total color settings.
- **SC-003**: Invalid color values do not cause the extension to crash or leave markdown content unreadable; fallback is applied and the document still renders.
- **SC-004**: User feedback or support requests related to “can’t change heading colors” or “colors don’t match my theme” can be addressed by pointing to the new settings (issue #49–style requests are satisfied).

---

## Relationship to other artifacts

- **Product spec** (`.specify/memory/product-spec.md`): This feature supports “consistent, predictable rendering” (US4) and “inline visual treatment” (FR-001) by allowing users to align colors with their theme.
- **Constitution** (`.specify/memory/constitution.md`): Implementation must follow code quality, testing, UX consistency, and performance principles; no parse on every keystroke; position mapping for ranges.
- **AGENTS.md**: Implementation patterns (e.g. config in `config.ts`, decorations in decorator/parser) apply; new settings must be documented where appropriate.

