# Agent Guidelines for Markdown Inline Editor VS Code Extension

## Shared Context

**Tech Stack**
- TypeScript (strict mode, Node LTS configuration)
- VS Code API (1.88.0+)
- [remark](https://github.com/remarkjs/remark) with remark-gfm for Markdown parsing
- Jest for testing with HTML coverage reports
- ESLint with TypeScript rules

**Project Structure**
- `src/` – source code (only modify here)
  - `extension.ts` – extension activation and orchestration
  - `decorator.ts` – manages markdown decorations and selection handling
  - `parser.ts` – parses markdown to decoration ranges
  - `parser-remark.ts` – remark processor initialization helper
  - `decorations.ts` – decoration types and factory functions
  - `link-provider.ts` – clickable link provider for markdown documents
  - `position-mapping.ts` – position mapping utilities (CRLF/LF normalization)
  - `config.ts` – configuration utilities (centralized settings)
  - `editor-utils.ts` – editor and diff detection utilities
  - `url-utils.ts` – URL resolution utilities
  - `commands/` – command handler implementations
  - `parser/__tests__/` – parser tests
  - `link-provider/__tests__/` – link provider tests
- `dist/` – compiled output (do not edit)
- `docs/` – documentation and feature specifications
- `assets/` – icons and static files

## Build, Lint, and Test Commands

### Primary Commands
- **Compile**: `npm run compile` (TypeScript compilation to dist/)
- **Build**: `npm run build` (compile + bundle + package for release)
- **Clean**: `npm run clean` (remove dist/ directory)
- **Test**: `npm test` (run all Jest tests with Node ESM support)
- **Test Watch**: `npm run test:watch` (run tests in watch mode)
- **Test Coverage**: `npm run test:coverage` (run tests with coverage report)
- **Lint**: `npm run lint` (ESLint all source files)
- **Package**: `npm run package` (create .vsix package)

### Testing Specific Scenarios
- **Single Test File**: `npm test -- src/parser/__tests__/parser.test.ts`
- **Single Test Pattern**: `npm test -- -t "empty input handling"`
- **Test with Pattern**: `npm test -- --testPathPatterns="parser"`
- **CRLF-specific Tests**: `npm test -- --testPathPatterns="(crlf|position-mapping|cache-crlf)"`
- **Test Report Generation**: `npm run test:report` (generates HTML report in dist/test-report/)

### Documentation Validation
- **Lint Docs**: `npm run lint:docs` (validate feature documentation files)

## Code Style Guidelines

### TypeScript Configuration
- **Strict Mode**: Always enabled (`"strict": true` in tsconfig)
- **Target**: Node 18 (`"target": "node18"` in build config)
- **Module Resolution**: Node LTS preset with ESM support
- **Declaration Files**: Generated on build for type checking

### Import and Module Organization
- **Import Order**: Group imports by external libraries first, then internal modules
- **Import Style**: Use ES6 imports consistently
- **Relative Imports**: Prefer absolute imports over relative (`../../../`) when possible
- **Barrel Exports**: Use index.ts files for clean module boundaries

### Naming Conventions
- **Files**: kebab-case for files (`parser-remark.ts`), PascalCase for classes
- **Classes**: PascalCase (`MarkdownParser`, `Decorator`)
- **Functions/Methods**: camelCase (`extractDecorations()`, `getEditorApplyDecorations()`)
- **Constants**: UPPER_SNAKE_CASE for global constants (`DIFF_SCHEMES`)
- **Variables**: camelCase, descriptive names (`decorationRanges`, `anchorText`)
- **Test Files**: kebab-case with `.test.ts` suffix (`parser.test.ts`)
- **Private Members**: Prefix with underscore if needed (`_privateField`)

### Type Safety and Interfaces
- **Avoid `any`**: Use strict typing, prefer `unknown` over `any`
- **Interface Usage**: Define interfaces for complex object types
- **Union Types**: Use discriminated unions where appropriate
- **Generic Constraints**: Apply constraints to generics when needed
- **Optional Properties**: Use `?:` for optional interface properties

### Documentation and Comments
- **JSDoc**: Required for all public methods and complex logic
- **Function Documentation**: Include `@param`, `@returns`, and `@example` tags
- **Complex Logic**: Comment business logic and edge cases
- **No Implementation Comments**: Avoid comments that restate obvious code

### Error Handling
- **Graceful Degradation**: Handle malformed markdown and large files gracefully
- **Null Checks**: Validate inputs before processing
- **Try-Catch**: Use for external operations (file I/O, VS Code API calls)
- **Logging**: Use console.error for debugging, avoid production logging
- **Type Guards**: Implement type guards for union type checking

### Code Organization Principles
- **Single Responsibility**: Each file/function should have one clear purpose
- **DRY (Don't Repeat Yourself)**: Extract common logic to utilities
- **Domain Separation**: Keep parsing, decoration, and UI concerns separate
- **Pure Functions**: Prefer pure functions for testability
- **Dependency Injection**: Pass dependencies explicitly rather than importing globally

### Testing Guidelines
- **Test Coverage**: Maintain high coverage, especially for parser logic
- **Test Structure**: Use `describe`/`it` blocks with clear descriptions
- **Mocking**: Mock VS Code API calls and external dependencies
- **Test Naming**: Descriptive test names explaining the scenario
- **Edge Cases**: Test null/undefined inputs, malformed data, and boundary conditions
- **Integration Tests**: Test component interactions, not just isolated functions

### Performance Considerations
- **Caching**: Cache expensive operations (parsing, decoration ranges)
- **Incremental Updates**: Avoid full document re-processing on small changes
- **Memory Management**: Clean up event listeners and disposables
- **Large Files**: Handle files gracefully without blocking the UI
- **Debouncing**: Debounce rapid events (typing, scrolling)

## Operational Rules

### Boundaries and Restrictions
- **Edit Only `src/`**: Never modify `dist/` or generated files
- **Cache Usage**: Never parse entire document on selection change - use cached results
- **Test Requirements**: All changes must include/maintain comprehensive tests
- **File Handling**: Gracefully handle large files and malformed markdown
- **VS Code API**: Respect extension activation events and lifecycle

### Git Workflow
- **Feature Branches**: Use feature branches per focus area (parser, decoration, etc.)
- **PR Standards**: Must pass all CI (lint, test, typecheck) and be focused
- **Issue References**: Reference related issues or PRs in commits
- **Conventional Commits**: Required format `<type>(<scope>): <description>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
  - Examples: `feat(parser): add support for task lists`

### Code Quality Standards
- **ESLint Compliance**: All code must pass ESLint with zero errors
- **TypeScript Strict**: No type errors in strict mode
- **Test Coverage**: Maintain or improve existing coverage levels
- **Performance**: No performance regressions in common scenarios

## Definition of Done
- Code builds successfully (`npm run build`)
- All tests pass (`npm test`) with coverage maintained
- ESLint passes with no errors (`npm run lint`)
- TypeScript compiles without errors
- Documentation updated for new features/changes
- Contribution aligns with project structure and style guidelines

## Releasing a Version (Conventional Commits & SemVer)

- **Version Bump Determination** following [SemVer](https://semver.org/) and [Conventional Commits](https://www/conventionalcommits.org/):
  - `feat`: **minor** version (or **major** if breaking)
  - `fix`: **patch** version
  - `BREAKING CHANGE`: **major** version
- **Update `package.json`** version field (e.g., `1.3.6` → `1.4.0` for feature)
- **Update `CHANGELOG.md`** with new version entry using categories: `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, `Security`
- **Update comparison links** at bottom of CHANGELOG.md
- **Verify feature list** in `README.md` is current before release
- **Verify issue list** on GitHub before release
- **Build extension**: `npm run build`
- **Commit version bump and changelog**: `git commit -am "chore(release): vX.Y.Z"`
- **Tag release**: `git tag vX.Y.Z`
- **Push changes and tag**: `git push origin main && git push origin vX.Y.Z`
- **CI/CD publishes** to VS Code Marketplace and OpenVSX automatically for `v*` tags

## References
- [Contributing Guidelines](CONTRIBUTING.md)
- [Technical Debt](docs/TECHNICAL_DEBT.md)
- [Code Structure Review](docs/CODE_STRUCTURE_REVIEW.md)
- [VS Code Extension API](https://code.visualstudio.com/api)</content>
<parameter name="filePath">/home/schmida/dev/git/markdown-inline-editor-vscode/AGENTS.md