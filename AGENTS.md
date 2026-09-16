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
- `src/pages/index.vue` is the top-level orchestrator for the board: it owns all Pinia access and logic dispatch. Extracted board modules must run independently and talk to `index.vue` only via `props`/`emits`. Do not let leaf modules reach into stores directly.

## Components (通用組件 vs Layout，統稱 components)

- Terminology: `components/` and `layouts/` are both called `components` — do not scatter attention by using the folder split as the responsibility boundary. The boundary is the naming + data-access rule below, not the folder.
- Naming: plain components are `{name}.vue` (e.g. `task-sidebar.vue`, `task-item.vue`); layouts are `{name}Layout.vue` (e.g. `task-boardLayout.vue`, `productLayout.vue`). `src/layouts/Product.vue` is legacy — treat it as a Layout and rename to `*Layout.vue` when touching it.
- Plain `components` (`{name}.vue`) are generic/pure:
  - 絕對禁止調用 Pinia (`use*Store`)，也禁止調用 `useRouter`/`useRoute`.
  - 禁止調用非 component 自身分發的 `inject`/`provide`. Only exception: a component may `inject` what it (or its own sub-component family) `provide`s — e.g. `navigation-drawer` may `provide`, `navigation-drawer-tab` may `inject`, but `ndt` 只能 `inject` 由 `nd` 分發的 `provide`.
  - Data in only via `props` (e.g. `tabs`, `counts`, `visible`), actions out only via `emits`. Example: `components/nd` 只能接受 `tabs` 等 `props`,不可自行 `useStore`.
- `layouts` (`{name}Layout.vue`) are component + business-logic integration:
  - 可以使用 `useRouter` 也可以調用 `useStore`. Responsible for fetching business data and dispatching data + logic down to `component/*` via `props`/`emits`.
  - Example: `ndLayout` 負責獲取業務數據並將業務數據和業務邏輯分發到 `component/nd`,通過 `emits` 和 `props` 通信.
- Migration debt (do not extend): `src/components/create-todo/CreateTodoFab.vue`, `src/components/create-collection/CreateCollectionTab.vue`, and `src/components/material-provider/material-theme-provider.tsx` currently call Pinia directly — refactor them to pure `{name}.vue` + `*Layout.vue` wrappers when touching that code.
- 不要過度組件化，請善用 Vue 的 `template` 功能: keep tiny markup (`chip`, `menu-item`, `circle-check`, composer rows, `<template v-for>` fragments, slots) as inline `<template>` in the parent instead of spinning up one-file-per-element components. Split only at independently-runnable module boundaries (header / composer / task row incl. subtasks via `<template>` / list card / dialogs).

## Composables (`src/composables/use*.ts`)

- Scattered page logic goes into composables, not more components. Max ~5 cohesive hooks per page (current board: `useBoardView`, `useComposers`, `useBoardDialogs`, `useBoardDrag`, `useMasonry`).
- Two kinds, same rule as components: pure hooks (no `use*Store`, e.g. `useComposers`, `useMasonry` with breakpoint passed as param) are usable anywhere; store-touching hooks (e.g. `useBoardView`, `useBoardDialogs`, `useBoardDrag`) are business logic — only call them from a page / `*Layout.vue`, never from a pure `{name}.vue`.
- Hooks never import each other. Cross-cutting needs (e.g. `closePop`, `ensureVisible`, busy guard) arrive as explicit params — the page composes them.
- Data-mutating operations belong in the Pinia store as methods (`findByUuid`, `stepsOf`/`saveSteps`, `createTask`/`updateTask`, step ops, `moveTaskTo`, `renameCollection`, `removeInList`, …); hooks and pages only dispatch. Keep cross-store imports out of stores.
- Each hook returns an explicit object and stays independently runnable/testable; the page keeps identical `props`/`emits` names toward children so templates don't churn.

## Verification — Playwright MCP first

- 優先采用 Playwright MCP (`playwright_browser_*` tools) for any UI / layout / visual work. Do not rely on code reading or `npm run preview` eyeballing alone.
- Standard loop: `npm run dev` → `playwright_browser_navigate` to the dev URL → `playwright_browser_snapshot` for structure → `playwright_browser_take_screenshot` for pixel compare against `prototype/*.png` → iterate → `npm run type-check`.
- Use `playwright_browser_click` / `playwright_browser_type` / `playwright_browser_press_key` / `playwright_browser_wait_for` to exercise task CRUD, drawer open/close, breakpoints, and dark mode instead of guessing behavior.
- Use `playwright_browser_console_messages` and `playwright_browser_network_requests` when debugging blank pages or missing assets.
- Pixel-level replication means: compare spacing, radius, colors (M3 tokens), typography, and iconography against `prototype/` side-by-side at the same viewport (default desktop 1600px wide unless testing `compact`); fix discrepancies before finishing.

## Conventions & gotchas

- `@material/web` tags (`md-*`): `vite.config.ts` marks them as custom elements in **both** `vue()` and `vueJsx()` plugin options — keep both when editing config.
- Styling: tokens/utilities come from `@sandlada/material-design-css` imports in `src/styles/tailwind.css` (e.g. `bg-surface`, `bg-surface-container`, `ease-emphasized-decelerate`). Scoped `<style>` blocks must start with `@reference "../styles/tailwind.css";` for `@apply` to work (see `Product.vue`).
- Imports: use relative `../` paths as existing code does. Vite defines `@` → `./src/`, but nothing uses it and `tsconfig` `paths` don't cover bare `@`; don't introduce it.
- TS: `verbatimModuleSyntax: true` — use `import type` for type-only imports. `strict`, `target/module ES2022`.
- IDs: use the `uuid` package (v14, already a dependency). `src/utils/uuid.ts:10` (`makeUuid`, hand-rolled RFC4122) is legacy — don't extend it; migrate call sites (currently `stores/todo-list.ts:90`) to `uuid` when touching that code.
- Persistence: simple config (theme) → `localStorage` with existing `Symbol(__...)` key strings. Complex/stateful data (todos, collections/tabs) → IndexedDB (migration pending; current `localStorage` in `todo-list`/`todo-tabs` is the tech debt to replace). Settings "Clear" wipes `localStorage` (`src/pages/settings.vue`) — extend it to IndexedDB once migration lands.
