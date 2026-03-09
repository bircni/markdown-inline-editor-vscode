# Contract: Math delimiter grammar

**Feature**: 003-inline-latex-equations  
**Type**: Parser / scanner contract  
**Consumers**: Math scanner (parser or dedicated module); unit tests; documentation.

## Purpose

Define the exact rules for recognizing inline and block math so that parser and tests agree and behavior is testable without implementation details.

## Inline math: `$...$`

- **Start**: A single `$` that is not escaped. Optional whitespace may appear immediately after it.
- **End**: The next single `$` that is not escaped (i.e. not preceded by an odd number of backslashes). Optional whitespace may appear before this `$`.
- **Content**: The substring between start and end, excluding the delimiters, **trimmed**. Must not be empty after trimming (else do **not** treat as math).
- **Scope**: Inline math may span multiple lines; the next unescaped `$` closes the region.

**Note**: "Price is $10" still produces no region (no closing `$`). `$ 50` with no closing `$` also produces no region.

## Block math: `$$...$$`

- **Start**: Two consecutive `$` characters that are not escaped (i.e. not `\$\$`). No requirement for non-whitespace after.
- **End**: The next two consecutive `$` that are not escaped. May be on a different line.
- **Content**: The substring between the start `$$` and the end `$$`, excluding both delimiter pairs. Must not be empty and must not consist only of whitespace (else do **not** treat as math).
- **Scope**: May span multiple lines.

## Precedence

- When the same position could start both inline and block (e.g. `$$` at line start), **block wins**: try to match block first; if that fails or is not applicable, then consider inline.
- Regions do not overlap: once a region is committed, its positions are consumed and not reused for another region.

## Escaping

- Backslash escapes the next character for delimiter purposes. `\$` is a literal dollar and does not start or end math. `\$$` is literal `$` followed by block start. Parsing is on the **normalized** document text (after any escape handling that the editor/store applies; if the document stores `\$` as two characters, the scanner sees backslash + dollar and treats it as escaped).

## Empty / whitespace-only

- `$ $`, `$$ $$`, `$$   $$` (only spaces/tabs/newlines between delimiters): **do not** treat as math. Leave as plain text.

## Position semantics

- All offsets (`startPos`, `endPos`) are in **normalized** text (LF line endings). The consumer is responsible for mapping to editor coordinates (e.g. via position-mapping layer) for CRLF documents.

## Test cases (contract validation)

- `$E = mc^2$` → one inline region, source `E = mc^2`.
- `Price is $10` → no region (single `$`, no closing `$`).
- `$  x$` → one inline region, source `x` (content trimmed).
- `$ f(x)=\int_{-\infty}^{\infty}e^{-x^2}dx $` → one inline region, source `f(x)=\int_{-\infty}^{\infty}e^{-x^2}dx`.
- `\$x$` → no region (escaped first `$`).
- `$$\int_0^\infty$$` → one block region, source `\int_0^\infty`.
- `$$  $$` → no region (whitespace-only content).
- `$x$ and $y$` → two inline regions.
- `$$a$$ $$b$$` → two block regions.

**Currency-style pairs:** `$100$` and `$200$` are valid inline regions (content `100` and `200`) per the rules above. The spec clarifies that *unmatched* “$100” (e.g. “Price is $100”) is not math; no digits-only exclusion is defined in this contract.
