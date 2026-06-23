# 任務清單：搜尋結果頁與遊戲商遊戲列表頁

**輸入**：設計文件來自 `specs/003-search-result-provider-page/`

**前置文件**：plan.md（必要）、spec.md（使用者情境必要）、research.md、data-model.md、contracts/

**測試**：無自動化測試框架；驗收依 quickstart.md SC-001 ~ SC-012 手動執行。

**組織原則**：任務依使用者情境分組，每個情境可獨立實作與測試。

## 格式：`[ID] [P?] [情境] 描述`

- **[P]**：可與其他 [P] 任務並行（不同檔案，無相依）
- **[情境]**：任務所屬的使用者情境（US1~US8）
- 描述中包含完整檔案路徑

---

## Phase 1：Setup（共用工具與元件）

**目的**：建立所有情境共用的工具函式、常數、元件，不影響現有功能。

- [ ] T001 [P] 新增 `src/utils/url.ts` — 匯出 `resolveIconUrl`（URL 正規化）與 `resolveGameImagePath`（遊戲卡片圖片 fallback 至 GameCard-1~4.png）
- [ ] T002 [P] 新增 `src/utils/provider.ts` — 匯出 `ProviderDisplay` 介面與 `resolveProviderDisplay`（優先順序：LobbyGameProviders → searchResult.providers → code 文字）
- [ ] T003 [P] 新增 `src/data/gameTypes.ts` — 匯出 `GAME_TYPE_CODE_TO_ID: Record<string, number>`（6 種：Slot:0, TableGame:1, LiveDealer:2, Lobby:3, Instant:4, Fishing:12）
- [ ] T004 [P] 更新 `src/apis/interface/lobby.ts` — `Game` 介面補充選用欄位 `gametypename?: string`
- [ ] T005 [P] 新增 `src/components/EmptyState.vue` — `withDefaults` 可選 props（`imageSrc` 預設 `/assets/images/no-data.png`，`message` 預設 `t('home.search.emptyState')`）

---

## Phase 2：Foundational（阻斷性前置任務）

**目的**：所有使用者情境共用的 i18n key 與路由，完成後方可開始任何情境實作。

**⚠️ 重要**：以下任務完成前，任何使用者情境實作均不得開始。

- [ ] T006 新增 i18n keys 至 `src/locales/zh-TW.ts`（`home.search.title: '搜尋'`、`home.search.emptyState: 'Woo...這裡暫時沒有東西'`、`common.actions.back: '返回'`）
- [ ] T007 [P] 同步新增 i18n keys 至 `src/locales/en-US.ts`（`home.search.title: 'Search'`、`home.search.emptyState: 'Woo... Nothing here yet'`、`common.actions.back: 'Back'`）
- [ ] T008 新增 3 條路由至 `src/router/index.ts`（lazy import：`/search` → `SearchView`，`/search/provider/:code` → `ProviderGamesView`，`/search/game-type/:code` → `GameTypeGamesView`）
- [ ] T008b 更新 `src/stores/lobby.ts` — 新增 `searchKeyword: ref<string>('')`（SearchPanel keyword 同步用）與 `searchPanelShouldRestore: ref<boolean>(false)`（子頁返回前設 `true`，HomeView `onMounted` 偵測後自動展開 SearchPanel，清除 flag）；兩個欄位需加入 `return { ... }` 匯出

**Checkpoint**：Setup + Foundational 就緒 — 使用者情境實作可平行開始

---

## Phase 3：使用者情境 1 — 首頁「發現」預設狀態與 mock 輪播（優先級：P1）🎯 MVP

**目標**：修正 carouselPages 為真實 3 頁結構；`GamePlatformNav` 第一項固定為「發現」；首頁「發現」狀態顯示熱門遊戲與新品推薦 mock 輪播，不依賴 API Hot/New groups。

**獨立測試**：開啟 `http://localhost:5173/`（不帶 token），確認 SC-001（3頁輪播、發現高亮）與 SC-002（帶 token 時供應商出現）。

### 使用者情境 1 的實作

- [ ] T009 [P] [US1] 修正 `src/data/games.ts` — 將 `carouselPages` 由 2 頁擴充至 3 頁（`[gameCards, [...gameCards], [...gameCards]]`）
- [ ] T010 [US1] 更新 `src/views/HomeView.vue` — 移除 local `resolveIconUrl`，改 import `{ resolveIconUrl, resolveGameImagePath }` from `@/utils/url`；新增 `DISCOVER_NAV_ITEM` 常數（`id: 'Discover'`、`name: 'Discover'`（data key only，不作顯示用）、`imagePath: '/assets/images/icons/discover.png'`、`isDiscover: true`）；新增 `navItems` computed（`[DISCOVER_NAV_ITEM, ...All.gameproviders]`，禁止 non-null assertion）；更新 template 傳入 `:platforms="navItems"` 與 `:active-platform-id="selectedProviderCode ?? 'Discover'"`；移除 `import { platforms } from '@/data/platforms'`；新增 `onMounted` 還原邏輯：若 `lobbyStore.searchPanelShouldRestore === true`，設 `isSearchOpen.value = true`，清除 flag

**Checkpoint**：首頁「發現」狀態可完整獨立驗收（SC-001、SC-002）

---

## Phase 4：使用者情境 2 — 首頁 GamePlatformNav Provider 篩選（優先級：P1）

**目標**：點擊 `GamePlatformNav` 中的供應商後，在首頁以 `selectedProviderCode` 篩選 `LobbyGameList`，2 欄 grid 顯示；路由不離開 `/`；點擊「發現」清除篩選回到 mock 輪播。

**獨立測試**：帶 token 開啟首頁，點擊供應商（如 ATG），確認 SC-003（URL 仍 `/`，顯示篩選遊戲，Network 無新請求）。

### 使用者情境 2 的實作

- [ ] T011 [US2] 更新 `src/components/GamePlatformNav.vue` — 新增 emit `'select-platform': [id: string]`；template 中 `<li>` 加入 `@click="emit('select-platform', item.id)"`；**顯示文字必須使用 `item.isDiscover ? t('home.navigation.discover') : item.name`**（不得直接使用 `item.name`，否則 zh-TW 顯示英文 'Discover'，違反 constitution §七.12）；引入 `useI18n` 取得 `t`（不改動現有視覺結構）
- [ ] T012 [US2] 更新 `src/views/HomeView.vue` — 新增 `selectedProviderCode = ref<string | null>(null)`；新增 `onSelectPlatform(id)` handler（`id === 'Discover'` → `null`，否則設 `id`）；新增 `providerGameCards` computed（`LobbyGameList.filter(g => g.providercode === selectedProviderCode).map((game, i) => ({ ..., imagePath: resolveGameImagePath(game.iconurl, i) }))`）；template 綁定 `@select-platform="onSelectPlatform"`
- [ ] T013 [US2] 更新 `src/views/HomeView.vue` template — 以 `<template v-if="selectedProviderCode !== null">` 顯示 `.provider-games__grid`（使用 `<GameCard>` 直接列出，非 `<GameSection :title-key="''">`）與 `<EmptyState>`；`<template v-else>` 保留原 `<GameSection>` 熱門/新品輪播；新增 `.provider-games__grid` SCSS（`display: grid; grid-template-columns: 1fr 1fr; gap: 12px`）；新增 `import EmptyState`、`import GameCard`

**Checkpoint**：首頁 Provider 篩選可完整獨立驗收（SC-003）

---

## Phase 5：使用者情境 3 — 展開搜尋框並顯示 inline 搜尋結果（優先級：P1）

**目標**：`SearchPanel` 展開仍在 `/`；輸入 keyword 後 debounce 300ms 呼叫 `lobbyStore.searchLobby()`；**搜尋結果在 overlay 下方可捲動區域顯示**（三段分區）；**不導航至 `/search`**；X 按鈕清除 keyword 並關閉 SearchPanel。

**獨立測試**：點擊搜尋 icon（SC-004），輸入 keyword（SC-005a），確認結果在 overlay inline 顯示，URL **仍為 `/`**。

### 使用者情境 3 的實作

- [ ] T014 [US3] 更新 `src/components/SearchPanel.vue` — 引入 `useLobbyStore`、`useRouter`、`resolveIconUrl`、`resolveGameImagePath`、`resolveProviderDisplay`；`watch(keyword, val => { lobbyStore.searchKeyword = val; ... })` 改為即時同步 keyword 至 store（FR-008），再 debounce 300ms 後呼叫 `lobbyStore.searchLobby({ lobbyPath: 'mobile', token: lobbyStore.token ?? '', keyword: val })`（**不** router.push 至 /search）；新增 `onMounted(() => { if (lobbyStore.searchKeyword) keyword.value = lobbyStore.searchKeyword })`（SearchPanel 掛載後從 store 還原 keyword）；新增 `searchGames`、`searchProviders`、`searchGameTypes`、`hasAnyResults` computed；provider 搜尋結果使用 `resolveProviderDisplay(p.code, lobbyStore.LobbyGameProviders, searchProviders.value)` 取得 `{ name, iconPath }`；template 在搜尋列下方新增可捲動結果區域（`overflow-y: auto`）：`keyword && isSearching` → 載入狀態；`keyword && !hasAnyResults` → `<EmptyState />`；`keyword && hasAnyResults` → 三段結果（games 2欄 grid、providers list、gameTypes chips）；provider 點擊 → `router.push('/search/provider/:code?keyword=' + keyword)`；gameType 點擊 → `router.push('/search/game-type/:code?keyword=' + keyword)`；`v-else` → 預設 tags；移除 local `resolveIconUrl`，改 import from `@/utils/url`

**Checkpoint**：搜尋框展開與 inline 結果行為可完整獨立驗收（SC-004、SC-005a）

---

## Phase 6：使用者情境 4 + 5 — SearchView stub（優先級：P1）

**目標**：`/search` 路由需對應一個最小 stub 元件，避免 deep link 404；核心搜尋 UI 已整合至 Phase 5 的 `SearchPanel.vue`。

> **架構說明（2026-06-22）**：搜尋結果改為在 SearchPanel overlay 顯示，`SearchView.vue` 不再作為主要搜尋結果 UI，僅維持 stub 狀態。

**獨立測試**：直接訪問 `/search` 確認不 404（stub 頁面）。

### 使用者情境 4 + 5 的實作

- [ ] T015 [US4] 確認 `src/views/SearchView.vue` 為最小 stub（`<template><div /></template>`）；路由定義保留於 `src/router/index.ts`；不在 stub 元件中新增搜尋 UI 邏輯
- [ ] T016 [US5] 確認 SearchPanel inline overlay 顯示無結果空狀態（EmptyState）—— 由 T014 完成；此任務僅為驗收標記（keyword 非空且三段均空 → overlay 顯示 EmptyState）

**Checkpoint**：`/search` 不 404；inline overlay 搜尋結果完整（SC-005a、SC-008、SC-009）可驗收

---

## Phase 7：使用者情境 6 — 遊戲商遊戲列表頁（優先級：P2）

**目標**：`/search/provider/:code?keyword=` 頁顯示 provider 圓形 icon + 名稱（`resolveProviderDisplay` 三優先順序）、`LobbyGameList.filter(g => g.providercode === code)` 遊戲 2 欄 grid；無遊戲 → `<EmptyState />`；返回 → `/`（首頁，SearchPanel 保有搜尋狀態）；不呼叫新 API。

**獨立測試**：在有 lobby 資料狀態下點擊供應商結果，確認 SC-007（URL、遊戲列表、Network 無請求、返回保留 keyword）。

### 使用者情境 6 的實作

- [ ] T017 [US6] 新增 `src/views/ProviderGamesView.vue` — 頁面頂部包含 `<AppHeader />`（O8 logo + 語系 icon，import from `@/components/AppHeader.vue`，不修改 AppHeader.vue 核心視覺，per FR-009）；`code = route.params.code as string`；`keyword = route.query.keyword as string ?? ''`；`display = computed(() => resolveProviderDisplay(code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? []))`；`v-if="display.iconPath"` 控制 img（空字串顯示 name 文字，不用 no-data.png）；`games = computed(() => LobbyGameList.filter(g => g.providercode === code))`；遊戲卡片 `resolveGameImagePath(game.iconurl, i)`；無遊戲 → `<EmptyState />`；**返回按鈕 handler**：先設 `lobbyStore.searchPanelShouldRestore = true`，再執行 `router.push('/')`（FR-013，不用 /search?keyword=）；套用 mobile-first 容器 SCSS

**Checkpoint**：遊戲商遊戲列表頁（SC-007）可完整獨立驗收

---

## Phase 8：使用者情境 7 — 遊戲類別遊戲列表頁（優先級：P2）

**目標**：`/search/game-type/:code?keyword=` 頁以 `GAME_TYPE_CODE_TO_ID` 映射（6 種）+ `gametypename` fallback 雙條件篩選遊戲；無遊戲 → `<EmptyState />`；返回 → `/`（首頁，SearchPanel 保有搜尋狀態）；不重新呼叫 API。

**獨立測試**：點擊遊戲類別 tag（SC-008），確認 URL、遊戲列表、Network 無請求、返回保留 keyword。

### 使用者情境 7 的實作

- [ ] T018 [US7] 新增 `src/views/GameTypeGamesView.vue` — 頁面頂部包含 `<AppHeader />`（O8 logo + 語系 icon，import from `@/components/AppHeader.vue`，不修改 AppHeader.vue 核心視覺，per FR-014）；`code = route.params.code as string`；`keyword = route.query.keyword as string ?? ''`；`gameTypeName = computed(() => lobbyStore.searchResult?.gameTypes.items.find(t => t.code === code)?.name ?? code)`；`gameTypeId = computed(() => GAME_TYPE_CODE_TO_ID[code])`；篩選條件：`matchByTypeId = gameTypeId !== undefined && Number(game.gametype) === gameTypeId`；`matchByTypeName = game.gametypename === gameTypeName.value || game.gametypename === code`；回傳 `matchByTypeId || matchByTypeName`（禁止只用 `String(gametype) === code`）；遊戲卡片 `resolveGameImagePath(game.iconurl, i)`；無遊戲 → `<EmptyState />`；**返回按鈕 handler**：先設 `lobbyStore.searchPanelShouldRestore = true`，再執行 `router.push('/')`（FR-018，不用 /search?keyword=）；套用 mobile-first 容器 SCSS

**Checkpoint**：遊戲類別列表頁（SC-008）可完整獨立驗收

---

## Phase 9：Polish 與驗證

**目的**：確認跨情境的整合正確、零 TypeScript 錯誤、全功能 E2E 驗收。

- [ ] T019 手動驗證返回與關閉導航（US8）— 確認以下行為：
  - `/search/provider/:code?keyword=xxx` 點擊返回 → 回到 `/`（首頁），**SearchPanel 自動重新展開**，keyword 從 `lobbyStore.searchKeyword` 還原，搜尋結果直接顯示（SC-014）
  - `/search/game-type/:code?keyword=xxx` 點擊返回 → 回到 `/`（首頁），**SearchPanel 自動重新展開**，keyword 還原，搜尋結果直接顯示（SC-014）
  - SearchPanel X 按鈕點擊 → 清除 `searchResult`、`lobbyStore.searchKeyword`、SearchPanel 關閉、路由仍為 `/`
  - 首頁「發現」點擊 → 只清除 `selectedProviderCode`，路由仍為 `/`
  - Network tab 確認返回後無新 API 請求（無 providerCode / gameTypeCode 請求）
  - `lobbyStore.searchPanelShouldRestore` 在 HomeView `onMounted` 後確認已重置為 `false`
- [ ] T020 執行 `npm run build` — 確認零 TypeScript 錯誤、零 ESLint 錯誤（SC-010）；並執行下列 grep 確認無違規（SC-017）：
  ```bash
  grep -R "ugsdev.com" src
  grep -R "frontendwebsite.ugsdev.com" src
  grep -R "providerCode" src
  grep -R "gameTypeCode" src
  ```
  以上指令均應無輸出（空結果 = 通過）。
- [ ] T021 [P] 依 `specs/003-search-result-provider-page/quickstart.md` SC-001~SC-012 手動 E2E 驗收（SC-011 i18n 切換、SC-012 舊有功能回歸）

---

## 相依與執行順序

### Phase 相依關係

- **Setup（Phase 1）**：無相依，立即可開始；T001~T005 可全部並行
- **Foundational（Phase 2）**：須等 Phase 1 完成 — 阻斷所有使用者情境（T006 先於 T007；T008、T008b 與 T006/T007 可並行）
- **使用者情境（Phase 3~8）**：皆須等 Phase 2 完成（含 T008b lobby store 欄位）
  - Phase 3（US1）：T009 與 T010 可並行；T010 需要 T001（resolveIconUrl）、T008b（lobby store 欄位）
  - Phase 4（US2）：依序 T011 → T012 → T013；T012/T013 需要 T001（resolveGameImagePath）、T005（EmptyState）
  - Phase 5（US3）：T014 需要 T001（resolveIconUrl、resolveGameImagePath）、T002（resolveProviderDisplay）、T005（EmptyState）、T008b（searchKeyword 同步）
  - Phase 6（US4+US5）：T015 確認 SearchView.vue 為 stub；T016 為 T014 的驗收標記（不需額外實作）
  - Phase 7（US6）：T017 需要 T002（resolveProviderDisplay）、T005（EmptyState）、T001（resolveGameImagePath）
  - Phase 8（US7）：T018 需要 T003（GAME_TYPE_CODE_TO_ID）、T004（gametypename）、T005（EmptyState）、T001（resolveGameImagePath）
- **Polish（Phase 9）**：須等所有目標情境完成；T019 手動驗收需 T014/T017/T018 均完成

### 使用者情境相依關係

- **US1（P1）**：Foundational 完成後即可開始，不相依其他情境
- **US2（P1）**：依賴 US1（navItems computed 在同一 HomeView.vue）
- **US3（P1）**：可與 US1/US2 並行開始；T014 實作 SearchPanel inline 結果（含三段結果、EmptyState、provider/gameType 點擊導航）
- **US4+US5（P1）**：US3（T014）完成後即可驗收；T015/T016 為 stub 確認與驗收標記，不需額外實作
- **US6（P2）**：依賴 US3（SearchPanel provider 點擊）；可獨立直接訪問 URL 測試
- **US7（P2）**：依賴 US3（SearchPanel gameType 點擊）
- **US8（P2）**：返回與關閉行為已整合於 US3（T014 SearchPanel X 按鈕）、US6（T017 返回 `/`）、US7（T018 返回 `/`）；手動驗收見 Phase 9 T019

### 並行機會

- **Phase 1**：T001、T002、T003、T004、T005 全部可並行
- **Phase 2**：T006 與 T007 可並行，T008 可與兩者並行（不同檔案）
- **Phase 3**：T009 可與 T010 並行
- **Phase 6**：T015 完成後再做 T016
- **Phase 7、Phase 8 初期**：T017、T018 可並行（不同檔案）

---

## 並行範例：Phase 1

```bash
# 同時啟動 Phase 1 全部任務：
任務：「新增 src/utils/url.ts — resolveIconUrl + resolveGameImagePath」
任務：「新增 src/utils/provider.ts — resolveProviderDisplay」
任務：「新增 src/data/gameTypes.ts — GAME_TYPE_CODE_TO_ID」
任務：「更新 src/apis/interface/lobby.ts — gametypename?: string」
任務：「新增 src/components/EmptyState.vue」
```

## 並行範例：Phase 7 + Phase 8 初期

```bash
# Phase 7 與 Phase 8 可並行：
任務：「新增 src/views/ProviderGamesView.vue」
任務：「新增 src/views/GameTypeGamesView.vue」
```

---

## 實作策略

### MVP 優先（US1 ~ US5，P1 情境）

1. 完成 Phase 1：Setup（T001~T005）
2. 完成 Phase 2：Foundational（T006~T008、**T008b**）
3. 完成 Phase 3：US1 — 首頁「發現」mock 輪播（T009~T010）
4. 完成 Phase 4：US2 — HomeView Provider 篩選（T011~T013）
5. 完成 Phase 5：US3 — SearchPanel inline 搜尋結果（T014）
6. 完成 Phase 6：US4+US5 — SearchView stub 確認（T015~T016）
7. **停止並驗收**：SC-001~SC-005a、SC-008、SC-009、SC-010（所有 P1 情境）
8. 準備就緒後交付 P2 情境（US6、US7、US8）

### 遞增交付

1. Setup + Foundational → 基礎就緒，不破壞現有功能
2. US1（mock 輪播）→ 獨立測試 SC-001
3. US2（Provider 篩選）→ 獨立測試 SC-003
4. US3（SearchPanel inline 結果）→ 獨立測試 SC-004、SC-005a
5. US4+US5（stub 確認 + inline 結果驗收）→ 獨立測試 SC-005a、SC-008、SC-009
6. US6（遊戲商頁）→ 獨立測試 SC-007
7. US7（遊戲類別頁）→ 獨立測試 SC-008
8. Polish → T019 返回導航手動驗收 + T020 build + grep 驗證 + SC-010~SC-012 全功能驗收

---

## 備注

- `[P]` 任務 = 不同檔案，無相依，可並行
- 情境標籤（US1~US8）將任務連結至 spec.md 中對應的使用者情境
- **禁止事項**（適用所有任務）：
  - 不硬編碼 token 或 UGS domain 至 runtime code
  - 不使用 non-null assertion（`!`）存取 groups（用 `?.` 與 `?? []`）
  - 不使用 `no-data.png` 作為遊戲圖片或 provider icon fallback
  - 不修改 `GameCard.vue`、`GameSection.vue`、`HeroBanner.vue` 核心視覺
  - 不新增 providerCode / gameTypeCode query 參數呼叫 API
  - 不把 `gameTypes.items[].gamecount` 當作已取得的遊戲清單
- 每個 Checkpoint 可獨立停下驗收對應情境
- 每個任務或邏輯群組完成後執行 `npm run type-check` 確認零 TypeScript 錯誤
