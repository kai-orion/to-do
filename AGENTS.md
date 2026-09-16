# AGENTS.md — to-do (Google Tasks clone SPA)

SPA. Vue 3.5 + Pinia 4 + Vue Router 5 + TypeScript ~6.0 + Vite 8 + TailwindCSS v4 (`@tailwindcss/vite`) + `@material/web` 2.5 + `@sandlada/mcu-helper` / `@sandlada/material-design-css`. Target: Chrome 150+, MDN Baseline 2026+, ESNext. No legacy fallbacks/polyfills.

## Commands

- `npm run dev` — local dev server.
- `npm run type-check` (`vue-tsc --noEmit`) — run before finishing any code change; repo has no lint/test runner.
- `npm run build` — outputs to `./docs` with `base: '/to-do'` (GitHub Pages artifact). Do not change `outDir`/`base`.
- `npm run preview` — serve the `docs/` build.

No test, lint, or format scripts exist. `fake-indexeddb` is a dep reserved for future IndexedDB work/tests.

## Architecture

- Entry: `index.html` → `src/main.ts` (single `import '@material/web/all'` + Pinia + `globalRouter`) → `src/App.vue` (`MaterialThemeProvider` + `RouterView`, starts/stops the `media-query` observer) → `src/pages/` via `src/layouts/Product.vue`.
- Router `src/router/index.ts`: only `/` and `/settings`. Must stay `createWebHashHistory` — static hosting under `docs/` has no SPA fallback.
- Stores (`src/stores/`, Pinia setup-style `ref` + explicit `save()`): `todo-list`, `todo-tabs`, `material-theme`, `media-query`, `navigation`. No cross-store imports except components composing them.
- Theme: `src/components/material-provider/material-theme-provider.tsx` injects `theme.cssText` (built with `createTheme`/`toCSS` from `@sandlada/mcu-helper`, `specVersion: '2025'`) into `<style id="material-theme-styles">` scoped to `.material-theme-provider-scoped, :root`, and toggles the `dark` attribute on `<html>`. `material-theme.ts` reads both flat and legacy `{ configuration: {...} }` persisted shapes — keep that compat.
- Breakpoints: `media-query` store wraps `createBreakpointObserver` from `@sandlada/breakpoint` (`MEDIA_WIDTH_BREAKPOINTS`, keys `compact/medium/expanded/large/extra-large`, `dimension: 'width'`, `start(el)`/`stop()` lifecycle from `App.vue`) and syncs `currentWidth`/`currentBreakpoint` plus the breakpoint class onto `document.body`. `rxjs` is a direct dep (observer peer dep). `Product.vue` treats `compact` as modal drawer. Never hardcode `600px` elsewhere; read the store.
- Components mix `.vue` SFCs and `.tsx` + `.module.css` (see `header/`, `navigation-drawer/`).
- Design target: `prototype/` holds the goal-state UI references (currently `all-task.demo.png`, the Google Tasks multi-list board to replicate). It is the source of truth for task-list layout — consult it before building or changing task UI; the current `src/` implementation may not match it yet.

## Conventions & gotchas

- `@material/web` tags (`md-*`): `vite.config.ts` marks them as custom elements in **both** `vue()` and `vueJsx()` plugin options — keep both when editing config.
- Styling: tokens/utilities come from `@sandlada/material-design-css` imports in `src/styles/tailwind.css` (e.g. `bg-surface`, `bg-surface-container`, `ease-emphasized-decelerate`). Scoped `<style>` blocks must start with `@reference "../styles/tailwind.css";` for `@apply` to work (see `Product.vue`).
- Imports: use relative `../` paths as existing code does. Vite defines `@` → `./src/`, but nothing uses it and `tsconfig` `paths` don't cover bare `@`; don't introduce it.
- TS: `verbatimModuleSyntax: true` — use `import type` for type-only imports. `strict`, `target/module ES2022`.
- IDs: use the `uuid` package (v14, already a dependency). `src/utils/uuid.ts:10` (`makeUuid`, hand-rolled RFC4122) is legacy — don't extend it; migrate call sites (currently `stores/todo-list.ts:90`) to `uuid` when touching that code.
- Persistence: simple config (theme) → `localStorage` with existing `Symbol(__...)` key strings. Complex/stateful data (todos, collections/tabs) → IndexedDB (migration pending; current `localStorage` in `todo-list`/`todo-tabs` is the tech debt to replace). Settings "Clear" wipes `localStorage` (`src/pages/settings.vue`) — extend it to IndexedDB once migration lands.
