# Features Folder Improvement Tasks

This checklist captures concrete, high‑impact tasks to improve the frontend `features` folder structure, imports, and public APIs. Tackle Quick Wins first, then proceed to structural refactors.

## Quick Wins (1–2 hours)

- [ ] Fix Auth circular dependency and consolidate `useAuth`
  - [ ] Source of truth: move the actual auth implementation from `src/frontend/src/features/profile/hooks/useAuth.ts` to `src/frontend/src/features/common/hooks/useAuth.ts` (or `providers/useProvideAuth.ts`).
  - [ ] Update `src/frontend/src/providers/AuthProvider.tsx` to import the implementation hook directly (e.g., `useProvideAuth`).
  - [ ] Expose a context consumer hook (e.g., `useAuth`) that reads from `AuthContext` instead of re‑exporting from the provider to avoid loops.
  - [ ] Remove or replace `src/frontend/src/hooks/useAuth.ts` to be a thin context consumer (or delete if unused).

- [ ] Remove stub `useActor` and standardize actor usage
  - [ ] Delete `src/frontend/src/hooks/useActor.ts` (stub).
  - [ ] Ensure all imports point to `src/frontend/src/features/common/hooks/useActor.ts`.
  - [ ] Run TypeScript to find and fix any remaining incorrect imports.

- [ ] Deduplicate `ProfileButton` component
  - [ ] Keep a single implementation in `src/frontend/src/features/common/components/ProfileButton.tsx`.
  - [ ] Remove duplicates at:
    - `src/frontend/src/features/profile/components/shared/ProfileButton.tsx`
    - `src/frontend/src/features/vibes/components/shared/ProfileButton.tsx`
  - [ ] Update all imports to reference the common component.

- [ ] Add path aliases for cleaner imports and boundary control
  - [ ] In `src/frontend/tsconfig.json` add paths:
    - `"@features/*": ["./src/features/*"]`
    - `"@common/*": ["./src/features/common/*"]`
    - `"@backend/*": ["./src/backend/*"]`
  - [ ] In `src/frontend/vite.config.js` add matching `resolve.alias` entries.
  - [ ] Convert the most frequent deep imports (found via `rg "\.\./\.\./"`) to aliases.

## Structural Refactors (0.5–1 day)

- [ ] Consolidate map logic; avoid duplicate map implementations
  - [ ] Prefer `src/frontend/src/features/map/*` as the primary map feature.
  - [ ] Deprecate or merge `src/frontend/src/features/profile/map/*` into the map feature (components, hooks, utils).
  - [ ] Expose required map UI via `@features/map` and consume it from Profile.
  - [ ] Remove redundant files and update imports.

- [ ] Move cross‑feature shared code into `common`
  - [ ] Buttons, modals, hooks, utils shared by multiple features → `src/frontend/src/features/common/*`.
  - [ ] Ensure features depend on `common` (not on each other) to reduce coupling.

- [ ] Standardize feature layout
  - [ ] Each feature uses: `components/`, `hooks/`, `types/`, `utils/`, `styles/`.
  - [ ] Flatten unnecessary nesting (e.g., extra subfolders under `components/` when not needed).

- [ ] Normalize naming conventions
  - [ ] Components: `PascalCase.tsx`.
  - [ ] Hooks: `useThing.ts` or `useThing.tsx`.
  - [ ] Types: colocate under `types/` or use `*.types.ts` consistently (choose one strategy).
  - [ ] Avoid mixing patterns like `useVibeOperations.types.ts` alongside a `types/` folder.

## Imports, APIs, and Barrels (0.5 day)

- [ ] Enforce public API per feature
  - [ ] Update each feature’s `index.ts` to export only intended public surface.
  - [ ] Replace cross‑feature deep imports with imports from the feature root.

- [ ] Standardize barrel exports
  - [ ] Prefer named exports for components/hooks/types for consistency and tree‑shaking.
  - [ ] Avoid blanket `export *` when it over‑exposes internals; export explicitly.
  - [ ] Normalize mixed default/named exports (keep default only for route‑level pages if desired).

## Dev/Playground Code (30–60 min)

- [ ] Scope dev/demo code to development
  - [ ] Keep `src/frontend/src/features/dev/*` as a playground, or rename to `playground/`.
  - [ ] Gate imports under `if (import.meta.env.DEV)` or split routes to avoid production bundling.

## Validation and Follow‑up (30–60 min)

- [ ] TypeScript compile and quick smoke run
  - [ ] `cd src/frontend && pnpm i && pnpm typecheck` (or `tsc --noEmit`) to catch import/type issues.
  - [ ] Launch app, verify Profile and Map flows.

- [ ] Targeted tests (optional but recommended)
  - [ ] Map utils: `src/frontend/src/features/profile/map/utils/map-utils.ts`.
  - [ ] Vibes selection/transform logic: `src/frontend/src/features/vibes/hooks/*`.
  - [ ] Auth/actor lifecycle: `src/frontend/src/features/common/hooks/*`.

- [ ] Documentation
  - [ ] Short README per feature with public API and usage.
  - [ ] Document import aliases and examples in main README.

## References (key files to touch)

- `src/frontend/src/providers/AuthProvider.tsx`
- `src/frontend/src/hooks/useAuth.ts`
- `src/frontend/src/features/profile/hooks/useAuth.ts`
- `src/frontend/src/hooks/useActor.ts`
- `src/frontend/src/features/common/hooks/useActor.ts`
- `src/frontend/src/features/profile/components/shared/ProfileButton.tsx`
- `src/frontend/src/features/vibes/components/shared/ProfileButton.tsx`
- `src/frontend/tsconfig.json`
- `src/frontend/vite.config.js`
- `src/frontend/src/features/profile/map/*`
- `src/frontend/src/features/map/*`

---

Notes
- Use ripgrep to find deep imports: `rg -n "\.\./\.\./" src/frontend/src/features`.
- Make changes incrementally and run type checks between steps to keep the feedback loop tight.

