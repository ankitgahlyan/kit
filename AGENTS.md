# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Repository Overview

This is a monorepo using pnpm workspaces with turbo for build orchestration. It contains multiple packages for TON blockchain wallet development:

- `@ton/appkit` - Core wallet management library
- `@ton/appkit-react` - React components for wallet UI
- `@ton/walletkit` - Core wallet functionality
- `@ton/phosphate` - DeFi and advanced wallet features
- Various apps and demos

## Build Commands

All commands should be run from the repository root:

### Core Commands
- `pnpm build` - Build all packages with turbo
- `pnpm dev` - Start development mode with turbo
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint (max-warnings 0)
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm quality` - Run quality checks (includes tests)
- `pnpm clean` - Clean node_modules and build artifacts

### Package-specific Commands
- `pnpm --filter @ton/appkit test` - Run tests for appkit package
- `pnpm --filter @ton/appkit test --run` - Run specific test file
- `pnpm --filter @ton/appkit typecheck` - Typecheck appkit package

### Single Test Commands
- `pnpm --filter @ton/appkit test --run src/utils/promise/cancel-promise.spec.ts`
- `pnpm --filter @ton/appkit test --run "src/utils/**/*.test.ts"`
- `pnpm --filter @ton/appkit test --run --reporter=verbose` for detailed output

### Development
- `pnpm dev` - Start turbo dev mode
- `pnpm --filter @ton/appkit dev` - Watch mode for appkit
- `pnpm --filter @ton/appkit-react dev` - Watch mode for React components

## Code Style Guidelines

### Import Organization
- Use type imports for type-only imports: `import type { SomeType } from './types'`
- Use consistent type specifier style: prefer top-level type imports
- Group imports: external libraries first, then internal modules
- Use barrel exports (index.ts files) for clean module interfaces

### TypeScript Configuration
- Strict mode enabled with comprehensive checks
- ES2022 target for modern JavaScript features
- Module resolution set to "bundler" for modern tooling
- JSX enabled for React components

### Naming Conventions
- **Files**: kebab-case for utilities, PascalCase for components
- **Functions/Variables**: camelCase
- **Classes/Types**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for exported constants
- **Private members**: underscore prefix (_privateMethod)

### Code Structure
- Export everything through index files for clean public APIs
- Use barrel exports: `export * from './module'`
- Keep utility functions in dedicated `utils/` directories
- Organize by feature: `src/features/`, `src/components/`

### Error Handling
- Use `getErrorMessage` utility for consistent error messages
- Wrap errors with context when throwing
- Use proper TypeScript error types
- Handle async errors with try/catch or promise rejection handling

### Utility Patterns
- Predicate functions: `isString(value)`, `isObjectWithMessage(obj)`
- Array utilities: `keyBy(arr, getKey)`, `randomFromArray(items)`
- Promise utilities: `cancelPromise(promise, timeoutMs)`
- Error utilities: `getErrorMessage(error, defaultMessage)`

### Testing
- Use Vitest for unit tests
- Test files end with `.test.ts` or `.spec.ts`
- Test utilities in `__tests__/` directories
- Mock external dependencies in `__mocks__/`

### Code Quality
- License headers required on all files
- No console.log in production code (except in examples)
- Consistent formatting with Prettier (via toolchain)
- ESLint rules enforced (max-warnings 0)

### React Components (in @ton/appkit-react)
- Use TypeScript with strict mode
- Export components through index.tsx
- Use clsx for conditional class names
- Follow Radix UI patterns for accessibility

### Monorepo Patterns
- All packages use pnpm workspaces
- Use `workspace:*` for internal dependencies
- Follow semantic versioning with changesets
- Build outputs to `dist/` directories

### File Organization
```
src/
├── core/           # Core business logic
├── features/       # Feature-specific modules
├── components/     # React components (if applicable)
├── utils/          # Utility functions
├── types/          # Type definitions
├── hooks/          # React hooks (if applicable)
└── constants/      # Application constants
```

### Git Workflow
- Use conventional commits for changesets
- Run `pnpm lint:fix` before committing
- Ensure all tests pass before pushing
- Use turbo for consistent builds across packages

## Development Notes

- This is a TON blockchain wallet development toolkit
- Focus on security and correctness in wallet operations
- Use TypeScript extensively for type safety
- Follow existing patterns in the codebase
- Test thoroughly, especially for wallet operations