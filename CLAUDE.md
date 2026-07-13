# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server
npm run build        # type-check + production build
npm run type-check   # run vue-tsc type checking only
npm run preview      # preview production build locally
npm run format       # format src/ with Prettier
```

No test runner is configured yet.

## Architecture

Vue 3 + TypeScript + Vite app. Entry point is `src/main.ts`, which mounts the root `App.vue` and registers Pinia and Vue Router.

- **Routing**: `src/router/index.ts` — currently empty routes; uses `createWebHistory` with `BASE_URL`.
- **State**: `src/stores/` — Pinia stores written in **composition API style** (not options API). The scaffold `counter.ts` store is a placeholder.
- **Path alias**: `@` resolves to `src/`.

## Code Style

Prettier enforced (format-on-save in VS Code): no semicolons, single quotes, 100-char line width.

## Assets & Reference

- `public/assets/images/` — organized into `banner/`, `games/`, `gamePlatform/`, `icons/`, `logo/`.
- `reference/o8-mobile-home-search-reference.png` — mobile lobby UI design reference for the planned game lobby interface.

## Node Version

Requires Node `^20.19.0 || >=22.12.0`.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/003-search-result-provider-page/plan.md`.

Active feature: **003-search-result-provider-page** (搜尋結果頁與遊戲商遊戲列表頁)
- Spec: `specs/003-search-result-provider-page/spec.md`
- Plan: `specs/003-search-result-provider-page/plan.md`
- Data Model: `specs/003-search-result-provider-page/data-model.md`
- Research: `specs/003-search-result-provider-page/research.md`
- Quickstart: `specs/003-search-result-provider-page/quickstart.md`
- Contracts: `specs/003-search-result-provider-page/contracts/`
- Checklist: `specs/003-search-result-provider-page/checklists/requirements.md`

Previous feature (completed through Phase 4):
- **002-ugs-lobby-api-integration** — Spec: `specs/002-ugs-lobby-api-integration/spec.md`
<!-- SPECKIT END -->
