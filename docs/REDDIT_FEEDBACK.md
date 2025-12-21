# Reddit Feedback Summary

## Overview
Post on r/vscode received **99 upvotes** and **39K views** with overwhelmingly positive reception. Users appreciate bringing Obsidian-style editing to VS Code.

## Feature Requests (Priority Order)

### 🔴 High Priority

1. **Generic List Number Resolution** (19 upvotes)
   - **Request**: Render `1. foo` `1. bar` as `1. foo` `2. bar` (auto-number ordered lists)
   - **User**: `CertainlyNotMrD`
   - **Status**: Rejeced - no need, use Markdown-All-In-One Extension to fix this problem
   - **Notes**: Currently only unordered lists (`-`, `*`, `+`) are supported. Need to add ordered list support with auto-numbering.

2. **Header Line Height Fix** (Multiple users)
   - **Request**: Headers look "squeezed" - need better line height
   - **Users**: `Expensive-Rip-6165`, `Glove_Final`
   - **Suggestion**: Use VS Code's variable line height feature (possibly experimental)
   - **Status**: ✅ **Implemented** - Added `mdInline.headingLineHeight` setting (default: `"1.4"`)
   - **Notes**: Requires VS Code ≥1.107.0 for `DecorationRenderOptions.lineHeight` support. Users can customize or disable via settings.

### 🟡 Medium Priority

3. **KaTeX/Math Formula Support**
   - **Request**: Support for KaTeX math formulas (e.g., `$x^2$` or `$$\int$$`)
   - **User**: `ArtisticFox8` (CS student use case)
   - **Status**: Not implemented
   - **Notes**: Important for academic/technical documentation. VS Code preview uses MathJax, but inline rendering would need different approach.

4. **GitHub-Flavored Markdown (GFM) Support**
   - **Request**: Support GFM features (alerts, task lists enhancements, etc.)
   - **User**: `sudoemt`
   - **Status**: Partially implemented (task lists exist, but GFM-specific features may be missing)
   - **Notes**: Check what GFM features are missing vs. standard markdown

### 🟢 Low Priority / Future

5. **Run Icon (JetBrains-style)**
   - **Request**: Add run icon like JetBrains has
   - **User**: `Senior-Release930`
   - **Status**: Not implemented
   - **Notes**: Unclear what this would do - may need clarification

6. **Obsidian-Specific Features**
   - **Request**: Support Obsidian-specific text elements (keywords, etc.)
   - **User**: `Oddly_Energy`
   - **Status**: Not implemented
   - **Notes**: May be out of scope if goal is standard markdown compatibility

## Already In Progress (Per OP)

- ✅ Tables - Working on
- ✅ Mermaid diagrams - Working on

## Positive Feedback Themes

- Users love the concept of Obsidian experience in VS Code
- Many users can't install Obsidian at work but can install VS Code extensions
- Appreciation for native integration and performance improvements
- Users switching from other buggy/outdated extensions

## Next Steps

1. **Implement ordered list support with auto-numbering** (highest upvoted request)
2. **Fix header line height** (multiple user complaints)
3. **Research KaTeX integration** (important for academic users)
4. **Evaluate GFM feature gaps** (check what's missing)

