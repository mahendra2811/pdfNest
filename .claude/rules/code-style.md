# Code Style — pdfNest

## TypeScript

- `strict: true` — no `any` (use `unknown` + type guards)
- Explicit return types on all exported functions
- `const` over `let`, never `var`
- `satisfies` for typed object literals
- Discriminated unions for processing state machines

## React / Next.js

- Server Components by default; `"use client"` only when state/effects/refs needed
- Named exports only (default export only for `page.tsx` / `layout.tsx`)
- Props: `interface {ComponentName}Props { ... }`
- Handlers: `handle{Action}` — e.g. `handleFileSelect`, `handleProcess`
- No `useEffect` for derived state — compute inline or `useMemo`
- Heavy tool components lazy-loaded with `next/dynamic`

## File naming

- Files: `kebab-case.tsx` / `kebab-case.ts`
- Components: `PascalCase` in code
- Hooks: `use-kebab-case.ts`
- Constants: `UPPER_SNAKE_CASE`

## Imports

Strict ordering:
1. React / Next.js
2. External libs
3. `@/components`
4. `@/hooks`
5. `@/lib` (utils, types, constants)
6. Relative imports

Always use `@/` absolute imports. No barrel exports.

## Tailwind / CSS

- Use `cn()` from `@/lib/utils` for conditional classes
- Mobile-first: base → `sm:` → `md:` → `lg:`
- Dark mode: `dark:` variants, controlled by `next-themes`
- Never build class names by string interpolation (Tailwind v4 static-class requirement)
- Use static maps for dynamic class selection (e.g. `CATEGORY_GRADIENTS`)
