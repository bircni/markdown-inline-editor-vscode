---
status: IMPLEMENTED
updateDate: 2026-01-10
priority: High
githubIssue: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/6
---

# LaTeX/Math

## Overview

Inline rendering of LaTeX/math formulas using MathJax. Supports both inline (`$...$`) and block (`$$...$$`) math syntax. Math formulas are rendered as SVG and displayed inline in the editor, with syntax markers hidden.

## Implementation

- **Parser**: Uses `remark-math` to detect inline (`$...$`) and block (`$$...$$`) math expressions
- **Rendering**: MathJax converts LaTeX to SVG with proper scaling for inline vs block math
- **Display**: SVG decorations replace the original text, with syntax markers hidden
- **Reveal**: Selecting math expressions reveals the raw Markdown syntax for editing
- **Code blocks**: Also supports ` ```math ` code blocks for block math rendering

**Key Components:**
- `src/parser.ts` - Math node detection and position mapping
- `src/math-renderer.ts` - MathJax-based LaTeX to SVG conversion
- `src/decorator.ts` - SVG decoration application with memoization

## Acceptance Criteria

### Inline Math
```gherkin
Feature: Inline math formatting

  Scenario: Basic inline math
    When I type $E = mc^2$
    Then the math is detected
    And rendered formula appears inline
    And syntax markers are hidden

  Scenario: Inline math in paragraph
    When I type "The equation $x = y$ is true"
    Then the math is detected
    And surrounding text is unaffected
```

### Block Math
```gherkin
Feature: Block math formatting

  Scenario: Basic block math
    When I type $$
    And I type \int_0^\infty e^{-x^2} dx
    And I type $$
    Then the math is detected
    And rendered formula appears inline
    And syntax markers are hidden

  Scenario: Multi-line block math
    When I type $$
    And I type \begin{align}
    And I type x &= y
    And I type \end{align}
    And I type $$
    Then the math is detected correctly
```

### Edge Cases
```gherkin
Feature: Math edge cases

  Scenario: Dollar sign in text
    When I type "Price is $10"
    Then it is not treated as math
    And the dollar sign is preserved

  Scenario: Escaped dollar
    When I type \$10
    Then it is not treated as math
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal math

  Scenario: Reveal on select
    Given $E = mc^2$ is in my file
    When I select the math
    Then the raw markdown is shown
    When I deselect
    Then the math is detected again
```

## Notes

- ✅ **Implemented** - Full support for inline and block math
- Uses MathJax for LaTeX rendering (industry standard)
- SVG-based rendering with proper scaling
- Memoization cache for performance
- Theme-aware (dark mode support via CSS filter inversion)
- Handles edge cases: escaped dollar signs, empty expressions, whitespace-only math
- Code blocks with `math` language are also supported

## Examples

- **Inline math**: `$E = mc^2$` → Rendered formula appears inline, syntax hidden
- **Block math**: `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$` → Rendered formula appears inline, syntax hidden
- **Code block math**: 
  ````markdown
  ```math
  \begin{align}
  x &= y \\
  z &= w
  \end{align}
  ```
  ````
  → Rendered as block math, fence markers hidden

## Technical Details

- **MathJax Version**: Uses MathJax full package with TeX input and SVG output
- **Performance**: Memoization cache prevents re-rendering identical expressions
- **Scaling**: Inline math scales to font size, block math scales to line height
- **Error Handling**: Invalid LaTeX shows error message in SVG
