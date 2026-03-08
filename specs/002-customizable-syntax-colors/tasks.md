# Tasks: Customizable Syntax Colors

**Input**: Design documents from `/specs/002-customizable-syntax-colors/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included per quickstart.md and constitution (config getters, decoration creation with hex/ThemeColor, invalid-hex fallback).

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently. US3 (discoverable settings) is delivered by Phase 2 (configuration schema + config getters).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = heading colors, US2 = other syntax colors
- Include exact file paths in descriptions

## Path Conventions

- Source: `src/` at repository root
- Tests: `src/**/__tests__/*.test.ts`
- Config: `package.json` (contributes.configuration.properties)

---

## Phase 1: Setup

**Purpose**: Verify environment and design artifacts before implementation.

- [x] T001 Verify `npm run validate` passes at repo root and branch is `002-customizable-syntax-colors` (or equivalent)
- [x] T002 [P] Confirm design docs read: plan.md, spec.md, research.md, data-model.md, contracts/configuration-schema.md, contracts/config-colors-api.md, quickstart.md in `specs/002-customizable-syntax-colors/`

**Checkpoint**: Ready to implement configuration and decorations.

---

## Phase 2: Foundational (Configuration & Lifecycle)

**Purpose**: Add 14 color settings and config accessors; subscribe to config/theme change so decoration types can be recreated. Blocks US1 and US2. Delivers US3 (discoverable settings).

**Independent Test**: Open VS Code Settings, search for "markdown inline" or the extension; confirm 14 color options appear under the extension with clear labels and color picker where supported.

- [x] T003 Add 14 color properties to `package.json` under `contributes.configuration.properties` per `specs/002-customizable-syntax-colors/contracts/configuration-schema.md` (markdownInlineEditor.colors.heading1–heading6, link, listMarker, inlineCode, emphasis, blockquote, image, horizontalRule, checkbox; type string, format color, descriptions)
- [x] T004 [P] Add `config.colors` getters in `src/config.ts` for all 14 keys; validate hex with regex `#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$`; return `string | undefined` (undefined when unset or invalid)
- [x] T005 Subscribe to `vscode.workspace.onDidChangeConfiguration` (scope: markdownInlineEditor) and `vscode.window.onDidChangeActiveColorTheme` in decorator lifecycle (e.g. `src/decorator.ts` or `src/extension.ts`); on event, call registry's recreateColorDependentTypes so open editors update without reload

**Checkpoint**: Configuration is readable; config/theme change triggers recreation of color-dependent decoration types. US3 acceptance criteria (settings visible, hex format, defaults without config) are met.

---

## Phase 3: User Story 1 – Override heading colors (P1) – MVP

**Goal**: User can set optional hex colors for h1–h6; unset levels use theme-derived default; changing a setting updates open markdown editors without reload.

**Independent Test**: Open Settings, set a color for heading1 (e.g. `#e06c75`), open a markdown file with `# Heading`, confirm the heading uses that color; clear the setting and confirm it uses theme default.

### Tests for User Story 1

- [x] T006 [P] [US1] Add or extend unit tests for config color getters (valid hex, invalid hex, unset) for heading1–heading6 in `src/decorator/__tests__/config-colors.test.ts`
- [x] T007 [P] [US1] Add tests for heading decoration creation with hex vs ThemeColor in `src/decorator/__tests__/decoration-colors.test.ts` (e.g. Heading1DecorationType through Heading6DecorationType)

### Implementation for User Story 1

- [x] T008 [P] [US1] Extend heading decoration factories in `src/decorations.ts` (Heading1DecorationType through Heading6DecorationType or shared helper) to accept optional color: when provided use hex in `color`, when undefined use `new ThemeColor('editor.foreground')` per data-model.md
- [x] T009 [US1] Wire heading decoration type creation in `src/decorator/decoration-type-registry.ts` to use `config.colors.heading1()` … `config.colors.heading6()`; create types with hex or ThemeColor; ensure `recreateColorDependentTypes()` includes all heading types

**Checkpoint**: Heading colors (h1–h6) are configurable and theme-derived when unset; tests pass; display updates on config/theme change.

---

## Phase 4: User Story 2 – Override colors for other syntax (P2)

**Goal**: User can set optional hex colors for links, list markers, inline code, emphasis, blockquote, image, horizontal rule, checkbox; unset categories use theme-derived default; display updates on config/theme change.

**Independent Test**: Set `markdownInlineEditor.colors.link` to a hex value, open a markdown file with a link, confirm link text uses that color; repeat for list, inline code, emphasis, blockquote, image, horizontal rule, checkbox.

### Tests for User Story 2

- [x] T010 [P] [US2] Add or extend tests for config color getters (link, listMarker, inlineCode, emphasis, blockquote, image, horizontalRule, checkbox) in `src/decorator/__tests__/config-colors.test.ts`
- [x] T011 [P] [US2] Add tests for syntax decoration creation with hex vs ThemeColor and invalid-hex fallback (link, list, code, emphasis, blockquote, image, horizontal rule, checkbox) in `src/decorator/__tests__/decoration-colors.test.ts`

### Implementation for User Story 2

- [x] T012 [P] [US2] Extend link, list marker, inline code, emphasis, and blockquote decoration factories in `src/decorations.ts` (LinkDecorationType, ListItemDecorationType, OrderedListItemDecorationType, CodeDecorationType, BoldDecorationType, ItalicDecorationType, BoldItalicDecorationType, BlockquoteDecorationType) to accept optional color; when provided use hex in `color`, when undefined use appropriate ThemeColor per data-model.md
- [x] T013 [US2] Wire link, list, code, emphasis, blockquote decoration type creation in `src/decorator/decoration-type-registry.ts` to use `config.colors.link()`, `config.colors.listMarker()`, `config.colors.inlineCode()`, `config.colors.emphasis()`, `config.colors.blockquote()`; add to `recreateColorDependentTypes()`
- [x] T014 [P] [US2] Extend ImageDecorationType, HorizontalRuleDecorationType, CheckboxUncheckedDecorationType, CheckboxCheckedDecorationType in `src/decorations.ts` to accept optional color; when provided use hex, when undefined use appropriate ThemeColor (e.g. textLink.foreground for image, editorWidget.border for horizontal rule, editor.foreground for checkbox)
- [x] T015 [US2] Wire image, horizontal rule, and checkbox decoration type creation in `src/decorator/decoration-type-registry.ts` to use `config.colors.image()`, `config.colors.horizontalRule()`, `config.colors.checkbox()`; add getImageColor, getHorizontalRuleColor, getCheckboxColor to RegistryOptions; add image, horizontalRule, checkboxUnchecked, checkboxChecked to `recreateColorDependentTypes()`
- [x] T016 [US2] Pass config.colors getters (including image, horizontalRule, checkbox) from `src/extension.ts` into DecorationTypeRegistry options so registry can create color-dependent types

**Checkpoint**: All 14 color options (6 headings + 8 syntax) work; unset uses theme; invalid hex falls back to theme (FR-008).

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Documentation, edge-case coverage, and validation.

- [x] T017 [P] Update `docs/features/` or README with the new color settings (list of 14 options, hex format, theme-derived defaults) per AGENTS.md
- [x] T018 Add or extend test that invalid/malformed hex does not crash and fallback is applied (FR-008) in `src/decorator/__tests__/config-colors.test.ts`
- [x] T019 Run `npm run validate` and fix any failures; run quickstart.md validation (manual: open Settings, set heading color, open markdown file, confirm color; change theme, confirm behavior)

**Checkpoint**: Docs updated; invalid hex covered; full validate passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1. **Blocks** Phase 3 and 4.
- **Phase 3 (US1)**: Depends on Phase 2. No dependency on US2.
- **Phase 4 (US2)**: Depends on Phase 2. No dependency on US1 (can run in parallel with US1 if desired).
- **Phase 5 (Polish)**: Depends on Phase 3 and 4 (or at least the stories being implemented).

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2. Delivers MVP (heading colors).
- **User Story 2 (P2)**: After Phase 2. Can start in parallel with US1 or after.
- **User Story 3 (P1, discoverable settings)**: Delivered by Phase 2 (schema + getters + defaults).

### Within Each User Story

- Tests (T006–T007 for US1, T010–T011 for US2) can run in parallel; write tests before or alongside implementation.
- Implementation: decoration factories before registry wiring; registry wiring before extension wiring.

### Parallel Opportunities

- T002, T003, T004 can run in parallel after T001.
- T006, T007, T008 can run in parallel within US1; T009 after T008.
- T010, T011, T012 can run in parallel within US2; T013 after T012; T014, T015, T016 sequential as needed.
- T017, T018 can run in parallel in Polish.

---

## Parallel Example: User Story 1

```text
# Tests for US1 together:
T006: config-colors.test.ts (heading getters)
T007: decoration-colors.test.ts (heading decoration types)

# Implementation:
T008: decorations.ts (heading factories)
T009: decoration-type-registry.ts (wire heading getters + recreateColorDependentTypes)
```

---

## Parallel Example: User Story 2

```text
# Tests for US2 together:
T010: config-colors.test.ts (syntax getters)
T011: decoration-colors.test.ts (syntax decoration types)

# Implementation (link/list/code/emphasis/blockquote first, then image/hr/checkbox):
T012: decorations.ts (link, list, code, emphasis, blockquote)
T013: decoration-type-registry.ts (wire those + recreateColorDependentTypes)
T014: decorations.ts (image, horizontalRule, checkbox)
T015: decoration-type-registry.ts (wire image, horizontalRule, checkbox + recreateColorDependentTypes)
T016: extension.ts (pass all color getters into registry)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (heading colors)
4. **STOP and VALIDATE**: Set heading1 color, open markdown, confirm; clear and confirm theme default; change theme and confirm unset follows theme
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + 2 → Settings visible, config ready, lifecycle subscribed (US3 done)
2. Phase 3 (US1) → Heading colors shippable (MVP)
3. Phase 4 (US2) → All 14 syntax colors shippable
4. Phase 5 → Docs and validate

### Parallel Team Strategy

After Phase 2:

- Developer A: Phase 3 (US1 – headings)
- Developer B: Phase 4 (US2 – other syntax)
Then merge and run Phase 5 (Polish).

---

## Notes

- [P] = different files or no ordering constraint; [US1]/[US2] = traceability to spec.
- Commit after each task or logical group; run `npm run validate` before commit (constitution).
- No parser or position-mapping changes; no new top-level modules.
- Theme change: user-configured (hex) colors preserved; only unset colors re-derived from new theme (spec clarification).
