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
- [ ] T008b 更新 `src/stores/lobby.ts` — 新增 `searchKeyword: ref<string>('')`（SearchPanel keyword 即時同步用）；新增 `searchResultMode: ref<boolean>(false)`（搜尋完成後設 `true`，首頁主內容切換至搜尋結果；子頁返回後自動保留，首頁直接顯示結果，不重新呼叫 API）；新增 `searchError: ref<string | null>(null)`；移除 `searchPanelShouldRestore`；新增 `executeSearch(keyword: string)` action（trim 空值 → 設 searchKeyword → 呼叫 searchLobby → 設 searchResultMode = true）；新增 `clearSearchResult()` action（清除 searchResult、重置 searchResultMode = false、清除 searchKeyword）；所有新欄位與 actions 需加入 `return { ... }` 匯出

**Checkpoint**：Setup + Foundational 就緒 — 使用者情境實作可平行開始

---

## Phase 3：使用者情境 1 — 首頁「發現」預設狀態與 mock 輪播（優先級：P1）🎯 MVP

**目標**：修正 carouselPages 為真實 3 頁結構；`GamePlatformNav` 第一項固定為「發現」；首頁「發現」狀態顯示熱門遊戲與新品推薦 mock 輪播，不依賴 API Hot/New groups。

**獨立測試**：開啟 `http://localhost:5173/`（不帶 token），確認 SC-001（3頁輪播、發現高亮）與 SC-002（帶 token 時供應商出現）。

### 使用者情境 1 的實作

- [ ] T009 [P] [US1] 修正 `src/data/games.ts` — 將 `carouselPages` 由 2 頁擴充至 3 頁（`[gameCards, [...gameCards], [...gameCards]]`）
- [ ] T010 [US1] 更新 `src/views/HomeView.vue` — 移除 local `resolveIconUrl`，改 import `{ resolveIconUrl, resolveGameImagePath }` from `@/utils/url`；新增 `DISCOVER_NAV_ITEM` 常數（`id: 'Discover'`、`name: 'Discover'`（data key only，不作顯示用）、`imagePath: '/assets/images/icons/discover.png'`、`isDiscover: true`）；新增 `navItems` computed（`[DISCOVER_NAV_ITEM, ...All.gameproviders]`，禁止 non-null assertion）；更新 template 傳入 `:platforms="navItems"` 與 `:active-platform-id="selectedProviderCode ?? 'Discover'"`；移除 `import { platforms } from '@/data/platforms'`；移除原有 `onMounted` 中的 `searchPanelShouldRestore` 還原邏輯（首頁主內容由 `searchResultMode` reactive 控制，不需 onMounted 手動處理）

**Checkpoint**：首頁「發現」狀態可完整獨立驗收（SC-001、SC-002）

---

## Phase 4：使用者情境 2 — 首頁 GamePlatformNav Provider 篩選（優先級：P1）

**目標**：點擊 `GamePlatformNav` 中的供應商後，在首頁以 `selectedProviderCode` 篩選 `LobbyGameList`，2 欄 grid 顯示；路由不離開 `/`；點擊「發現」清除篩選回到 mock 輪播。

**獨立測試**：帶 token 開啟首頁，點擊供應商（如 ATG），確認 SC-003（URL 仍 `/`，顯示篩選遊戲，Network 無新請求）。

### 使用者情境 2 的實作

- [ ] T011 [US2] 更新 `src/components/GamePlatformNav.vue` — 新增 emit `'select-platform': [id: string]`；template 中 `<li>` 加入 `@click="emit('select-platform', item.id)"`；**顯示文字必須使用 `item.isDiscover ? t('home.navigation.discover') : item.name`**（不得直接使用 `item.name`，否則 zh-TW 顯示英文 'Discover'，違反 constitution §七.12）；引入 `useI18n` 取得 `t`（不改動現有視覺結構）
- [ ] T012 [US2] 更新 `src/views/HomeView.vue` — 新增 `selectedProviderCode = ref<string | null>(null)`；新增 `onSelectPlatform(id)` handler（`id === 'Discover'` → `null`，否則設 `id`）；新增 `providerGameCards` computed（`LobbyGameList.filter(g => g.providercode === selectedProviderCode).map((game, i) => ({ ..., imagePath: resolveGameImagePath(game.iconurl, i) }))`）；template 綁定 `@select-platform="onSelectPlatform"`
- [ ] T013 [US2] 更新 `src/views/HomeView.vue` template — template 改為三段優先順序：① `v-if="lobbyStore.searchResultMode && lobbyStore.searchResult"` → 搜尋結果三段區塊（由 T014 後續完成）；② `v-else-if="selectedProviderCode !== null"` → `.provider-games__grid`（使用 `<GameCard>` 直接列出）與 `<EmptyState>`；③ `v-else` → 保留原 `<GameSection>` 熱門/新品輪播；新增 `.provider-games__grid` SCSS（`display: grid; grid-template-columns: 1fr 1fr; gap: 12px`）；新增 `import EmptyState`、`import GameCard`；更新 `onSelectPlatform` 呼叫 `lobbyStore.clearSearchResult()` 清除搜尋模式

**Checkpoint**：首頁 Provider 篩選可完整獨立驗收（SC-003）

---

## Phase 5：使用者情境 3 — 展開搜尋框與觸發搜尋（優先級：P1）

**目標**：`SearchPanel` 展開仍在 `/`（overlay 只負責輸入，**不顯示搜尋結果**）；**僅** Enter / 搜尋 icon 點擊 / tag 點擊三種事件呼叫 `executeSearch()`；搜尋完成後 SearchPanel overlay 關閉、`searchResultMode = true`；首頁 GamePlatformNav 下方主內容區顯示三段搜尋結果；**不導航至 `/search`**；GamePlatformNav 全程保留可見；X 按鈕只關閉 overlay，不清除首頁搜尋結果。

**獨立測試**：點擊搜尋 icon 展開（SC-004），輸入 keyword 不打 API（SC-008a），按 Enter 打 API 後 overlay 關閉、主內容顯示結果（SC-008b），URL **仍為 `/`**（SC-009）。

### 使用者情境 3 的實作

- [ ] T014 [US3] 更新 `src/components/SearchPanel.vue` — 更新 `SearchTag` 介面：`{ id: string; label: string; searchValue: string }`（移除舊 `type` 欄位）；`watch(keyword)` 只同步 `lobbyStore.searchKeyword = val`，**禁止** debounce 或自動呼叫 API；新增 `triggerSearch(searchValue: string)` 共用函式（trim 空值 → `await lobbyStore.executeSearch(searchValue)` → `emit('close')`）；新增 `onKeyEnter()` handler（Enter 鍵 → `triggerSearch(keyword.value)`）；新增 `onSearchIconClick()` handler（搜尋 icon click → `triggerSearch(keyword.value)`）；新增 `onTagClick(tag: SearchTag)` handler（tag click → `triggerSearch(tag.searchValue)`）；更新 `onClose()` 只清除 input keyword 與 `lobbyStore.searchKeyword`，**不清除 searchResult 也不清除 searchResultMode**；template input 綁定 `@keyup.enter="onKeyEnter"`；搜尋 icon 綁定 `@click="onSearchIconClick"`；tags 綁定 `@click="onTagClick(tag)"`；tag 顯示改用 `tag.label`；移除原有三段 inline 結果 UI（games grid、providers list、gameTypes chips、EmptyState）—— 這些移至首頁主內容區；更新 HomeView searchTags 定義：`{ id, label, searchValue }` 結構

**Checkpoint**：搜尋觸發規則可完整獨立驗收（SC-008a、SC-008b、SC-008c）

---

## Phase 6：使用者情境 4 + 5 — 首頁主內容搜尋結果 UI（優先級：P1）

**目標**：搜尋結果（三段分區：遊戲 / 遊戲商 / 遊戲類別）顯示在首頁 GamePlatformNav 下方主內容區（`searchResultMode === true` 時）；無結果時顯示 EmptyState；GamePlatformNav 全程保留可見；`/search` 路由維持 stub 避免 deep link 404。

> **架構說明（2026-06-23）**：搜尋結果從 SearchPanel overlay 移至首頁主內容區；`SearchView.vue` 維持 stub 狀態。

**獨立測試**：觸發搜尋後，確認首頁主內容顯示三段結果（SC-009），GamePlatformNav 可見（SC-012），URL 仍為 `/`；三段均空時顯示 EmptyState（SC-010）。

### 使用者情境 4 + 5 的實作

- [ ] T015 [US4] 確認 `src/views/SearchView.vue` 為最小 stub（`<template><div /></template>`）；路由定義保留於 `src/router/index.ts`；不在 stub 元件中新增搜尋 UI 邏輯
- [ ] T016 [US4+US5] 更新 `src/views/HomeView.vue` template 搜尋結果顯示區塊 — 在 `v-if="lobbyStore.searchResultMode && lobbyStore.searchResult"` 分支內：新增 `searchGames`、`searchProviders`、`searchGameTypes`、`hasAnySearchResults` computed（從 `lobbyStore.searchResult` 取值）；`lobbyStore.isSearching` → 載入狀態；`!hasAnySearchResults` → `<EmptyState />`（SC-010）；`hasAnySearchResults` → 三段分區：遊戲 2欄 grid（`resolveGameImagePath`）、遊戲商 list（`resolveProviderDisplay`、點擊 `router.push('/search/provider/:code')`）、遊戲類別 chips（點擊 `router.push('/search/game-type/:code')`）（SC-009）；GamePlatformNav 不被隱藏（SC-012）

**Checkpoint**：首頁搜尋結果主內容 UI 完整（SC-009、SC-010、SC-012）可驗收

---

## Phase 7：使用者情境 6 — 遊戲商遊戲列表頁（優先級：P2）

**目標**：`/search/provider/:code` 頁顯示 provider 圓形 icon + 名稱（`resolveProviderDisplay` 三優先順序）、`LobbyGameList.filter(g => g.providercode === code)` 遊戲 2 欄 grid；無遊戲 → `<EmptyState />`；返回 → `/`（首頁，`searchResultMode` 仍保留 `true`，主內容直接顯示搜尋結果，SearchPanel **不自動展開**）；不呼叫新 API。

**獨立測試**：在有 lobby 資料狀態下點擊搜尋結果遊戲商，確認 SC-013（URL）、SC-007（遊戲列表、Network 無請求）、SC-014（返回後首頁顯示搜尋結果、SearchPanel 不展開）。

### 使用者情境 6 的實作

- [ ] T017 [US6] 新增 `src/views/ProviderGamesView.vue` — 頁面頂部包含 `<AppHeader />`（O8 logo + 語系 icon，import from `@/components/AppHeader.vue`，不修改 AppHeader.vue 核心視覺，per FR-009）；`code = route.params.code as string`；`display = computed(() => resolveProviderDisplay(code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? []))`；`v-if="display.iconPath"` 控制 img（空字串顯示 name 文字，不用 no-data.png）；`games = computed(() => LobbyGameList.filter(g => g.providercode === code))`；遊戲卡片 `resolveGameImagePath(game.iconurl, i)`；無遊戲 → `<EmptyState />`；**返回按鈕 handler**：直接執行 `router.push('/')`（FR-013；不設 flag；返回後 `searchResultMode` 仍 `true`，首頁自動顯示搜尋結果）；套用 mobile-first 容器 SCSS

**Checkpoint**：遊戲商遊戲列表頁（SC-007、SC-013、SC-014）可完整獨立驗收

---

## Phase 8：使用者情境 7 — 遊戲類別遊戲列表頁（優先級：P2）

**目標**：`/search/game-type/:code` 頁以 `GAME_TYPE_CODE_TO_ID` 映射（6 種）+ `gametypename` fallback 雙條件篩選遊戲；無遊戲 → `<EmptyState />`；返回 → `/`（首頁，`searchResultMode` 仍保留 `true`，主內容直接顯示搜尋結果，SearchPanel **不自動展開**）；不重新呼叫 API。

**獨立測試**：點擊搜尋結果遊戲類別 tag，確認 SC-013（URL）、遊戲列表（Network 無請求）、SC-014（返回後首頁顯示搜尋結果、SearchPanel 不展開）。

### 使用者情境 7 的實作

- [ ] T018 [US7] 新增 `src/views/GameTypeGamesView.vue` — 頁面頂部包含 `<AppHeader />`（O8 logo + 語系 icon，import from `@/components/AppHeader.vue`，不修改 AppHeader.vue 核心視覺，per FR-014）；`code = route.params.code as string`；`gameTypeName = computed(() => lobbyStore.searchResult?.gameTypes.items.find(t => t.code === code)?.name ?? code)`；`gameTypeId = computed(() => GAME_TYPE_CODE_TO_ID[code])`；篩選條件：`matchByTypeId = gameTypeId !== undefined && Number(game.gametype) === gameTypeId`；`matchByTypeName = game.gametypename === gameTypeName.value || game.gametypename === code`；回傳 `matchByTypeId || matchByTypeName`（禁止只用 `String(gametype) === code`）；遊戲卡片 `resolveGameImagePath(game.iconurl, i)`；無遊戲 → `<EmptyState />`；**返回按鈕 handler**：直接執行 `router.push('/')`（FR-018；不設 flag；返回後 `searchResultMode` 仍 `true`，首頁自動顯示搜尋結果）；套用 mobile-first 容器 SCSS

**Checkpoint**：遊戲類別列表頁（SC-013、SC-014）可完整獨立驗收

---

---

## Phase 10：API base 路徑調整與環境變數（建議在 Phase 2 完成後執行）

**目的**：確保前端 API 呼叫路徑從 `/ugs-api/api/...` 改為 `/api/...`；設定 `VITE_UGS_FRONTEND_ORIGIN` 供遊戲啟動使用。

- [ ] T022 更新 `.env.development` — 新增/確認 `VITE_UGS_API_BASE=`（空字串）與 `VITE_UGS_FRONTEND_ORIGIN=https://frontendwebsite.ugsdev.com`（不得硬編碼於 src/ runtime code）
- [ ] T023 更新 `vite.config.ts` — dev proxy 改為 `'/api': { target: 'https://frontendwebsite.ugsdev.com', changeOrigin: true, secure: false }`；移除（或停用）原有 `/ugs-api` proxy；不需新增 `/gamelauncher` proxy（遊戲連結由 `VITE_UGS_FRONTEND_ORIGIN` 組成完整外部 URL）
- [ ] T024 確認/更新 axios 或 fetch 設定（`src/apis/lobby.ts` 或 axios instance）— baseURL 使用 `import.meta.env.VITE_UGS_API_BASE`，使最終 Network request 為 `/api/lobby/mobile?token=xxx`；執行 `npm run dev` 後在 DevTools Network tab 驗證無 `/ugs-api` 出現（SC-019、SC-020）

**Checkpoint**：DevTools Network tab 確認 API 請求為 `/api/lobby/mobile?...`，無 `/ugs-api/api/...`

---

## Phase 11：Token sessionStorage 保存與 URL 移除（建議在 Phase 10 後執行）

**目的**：URL token 優先 → init → 存 sessionStorage（24hr）→ 移除 URL token；sessionStorage fallback；過期不呼叫 API；首頁不崩潰。

- [ ] T025 [P] 新增 `src/utils/tokenSession.ts` — 匯出 `saveTokenToSession(token: string): void`（存 `{ token, expiresAt: Date.now() + TOKEN_EXPIRE_MS }`）、`getTokenFromSession(): string | null`（過期則清除並回傳 null）、`clearTokenFromSession(): void`；常數 `TOKEN_STORAGE_KEY = 'ugs_lobby_token'`、`TOKEN_EXPIRE_MS = 24 * 60 * 60 * 1000`；儲存格式 `{ token: string; expiresAt: number }`；不使用 localStorage
- [ ] T026 更新 `src/views/HomeView.vue` onMounted — 改為：① 讀取 URL token（`route.query.token`）；② 無 URL token 則呼叫 `getTokenFromSession()`；③ 有有效 token → `lobbyStore.setToken()` → `fetchLobbyData()`；④ init 成功後若來自 URL：`saveTokenToSession(token)` + `router.replace({ query: { ...route.query 去除 token } })`（不觸發重整，保留其他 query）；⑤ token 過期或兩者均無 → 不呼叫 API，首頁顯示 Discover mock，不崩潰（SC-021、SC-022、SC-023、SC-024）

**Checkpoint**：DevTools Application > Session Storage 確認 `ugs_lobby_token` 存在；URL 移除 token 不觸發頁面重整；重整後 sessionStorage token 仍可 init

---

## Phase 12：遊戲啟動（Game Launch + GameFrameView）（建議在 Phase 8 後執行）

**目的**：實作 `resolveGameLaunchUrl`、`launchGame`、`GameFrameView`，以及各 API 遊戲卡片的 click 整合；supportiframe 分流 iframe vs redirect。

- [ ] T027 新增 `src/utils/gameLaunch.ts` — 匯出 `resolveGameLaunchUrl(game: Game, token: string, frontendOrigin: string): string`（`game.url` 優先：相對路徑補 frontendOrigin、`//` 補 `https:`、`http/https` 直接使用、`{TOKEN}` 替換為 token；`game.url` 缺失則 fallback 組 `/gamelauncher?token=...&gpcode=...&gcode=...&fromlobby=true`）；匯出 `launchGame(game, token, frontendOrigin, routerPush)` helper（`supportiframe === true` → `sessionStorage.setItem('ugs_game_launch_url', url)` + `routerPush('/game-frame')`；`supportiframe === false` → `window.location.href = url`）
- [ ] T028 [P] 更新 `src/apis/interface/lobby.ts` — `Game` 介面新增選用欄位 `url?: string`（API 回傳遊戲啟動 URL）
- [ ] T029 新增 `/game-frame` 路由至 `src/router/index.ts`（lazy import：`{ path: '/game-frame', component: () => import('@/views/GameFrameView.vue') }`）
- [ ] T030 新增 `src/views/GameFrameView.vue` — 頁面結構：header（左上角返回首頁按鈕，i18n `common.actions.back` 或新增 `common.actions.backToHome`，點擊 `router.push('/')` 並 `sessionStorage.removeItem('ugs_game_launch_url')`）+ 全版 iframe（`src = sessionStorage.getItem('ugs_game_launch_url')`，`width: 100%`，`height: calc(100vh - headerHeight)`，`border: 0`）；無 launchUrl 時顯示 `<EmptyState />` + 返回首頁按鈕，不崩潰；header 不顯示玩家/餘額/幣別；不修改 `AppHeader.vue`；套用 mobile-first 容器 SCSS
- [ ] T031 更新 `src/views/HomeView.vue` — provider 篩選遊戲列表 `<GameCard>` 加入 `@click`，呼叫 `launchGame(apiGame, token, frontendOrigin, router.push)`；import `launchGame` from `@/utils/gameLaunch`；`token` 從 `lobbyStore.token` 或 `getTokenFromSession()` 取得；`frontendOrigin` 從 `import.meta.env.VITE_UGS_FRONTEND_ORIGIN` 取得
- [ ] T032 更新 `src/views/HomeView.vue` 搜尋結果 games 區塊 — `<GameCard>` click 時：若 `game.url` 存在則直接 `launchGame(game, ...)`；若缺少 `url`，先以 `game.code + game.providercode` 在 `lobbyStore.LobbyGameList` 中查找完整 game（`find(g => g.code === game.code && g.providercode === game.providercode)`），找到後再 launch，找不到則 no-op 或顯示提示（SC-030）
- [ ] T033 更新 `src/views/ProviderGamesView.vue` — 遊戲卡片 `@click` 改用 `launchGame(game, token, frontendOrigin, router.push)`
- [ ] T034 更新 `src/views/GameTypeGamesView.vue` — 同 T033

**Checkpoint**：`supportiframe === true` 進入 `/game-frame`（SC-027、SC-028）；`supportiframe === false` 整頁跳外部（SC-029）；launchUrl 不出現在 URL bar（SC-030）；GameFrameView 直接訪問不崩潰（SC-032）

---

## Phase 13：Lobby Path 調整、Hot/New API 群組整合、輪播 Slide 效果（2026-07-02 新增）

**目的**：統一搜尋 API path；Hot/New 輪播改用 API 資料優先；LobbyGameList 改為只取 All.games；輪播過場改為 slide 效果。

- [ ] T035 更新 `src/stores/lobby.ts` — `executeSearch` 中 `searchLobby` 呼叫的 `lobbyPath` 從 `'mobile'` 改為 `'O8_Mobile_Lobby_test'`（對應 DEC-024）
- [ ] T036 [P] 更新 `src/stores/lobby.ts` — `LobbyGameList` computed 改為只取 `All.games`：`lobbyData.value.Lobby.Data.groups.filter(g => g.isvisible).find(g => g.code === 'All')?.games ?? []`（對應 DEC-025；禁止 non-null assertion）
- [ ] T037 [P] 更新 `src/views/HomeView.vue` — 新增 `hotGames`/`newGames` computed（`groups.find(g => g.code === 'Hot/New')?.games ?? []`）；新增 `gamesToCardPages(games: Game[], pageSize = 4): GameCardData[][]` helper；新增 `hotGamePages`/`newGamePages` computed（API 資料優先；無資料 fallback `carouselPages`）
- [ ] T038 更新 `src/views/HomeView.vue` — 有 API Hot/New 資料時，template 改為獨立輪播區塊（不透過 `<GameSection>`）並加入 `@click` → `launchGame`；新增 `onClickDiscoverGame(game: Game)` handler；無 API 資料時 fallback 使用 `<GameSection>`（mock，不可 click launch）；需新增 `hotCurrentPage`/`newCurrentPage` state 及對應 auto-play/touch 邏輯（對應 DEC-026）
- [ ] T039 [P] 更新 `src/components/GameSection.vue` — 移除 `<Transition name="fade">`；改用 `display: flex` + `transition: transform 0.3s ease` slide 效果；`currentPage` 變化時 `translateX(-N * 100%)`；保留 auto-play 5秒、touchstart/touchmove/touchend 手勢、分頁指示器；移除 fade 相關 SCSS；props 介面不變（對應 DEC-027）

**Checkpoint**：`npm run type-check` 零錯誤；`executeSearch` network 請求為 `/api/lobby/O8_Mobile_Lobby_test/search?...`；Hot/New 遊戲卡片可點擊啟動（有 API 資料時）；輪播頁面切換平滑滑動（無 fade）；provider/gametype 遊戲列表無重複遊戲（All.games 來源）

---

## Phase 9：Polish 與驗證

**目的**：確認跨情境的整合正確、零 TypeScript 錯誤、全功能 E2E 驗收。

- [ ] T019 手動驗證返回與關閉導航（US8）— 確認以下行為：
  - `/search/provider/:code` 點擊返回 → 回到 `/`（首頁），首頁主內容**直接顯示搜尋結果**（`searchResultMode === true`），SearchPanel **不自動展開**，Network tab **無新請求**（SC-014）；若 store 已遺失（`searchResult === null`），首頁顯示 Discover 預設，不崩潰
  - `/search/game-type/:code` 點擊返回 → 同上（SC-014）
  - SearchPanel X 按鈕點擊 → 清除 input keyword、關閉 SearchPanel overlay；首頁搜尋結果**仍然顯示**（`searchResultMode` 不受 X 影響）（SC-018）
  - 首頁「發現」點擊 → 呼叫 `clearSearchResult()`，清除 `selectedProviderCode`，主內容切換回 mock 輪播，路由仍為 `/`
  - 首頁 provider 點擊 → 呼叫 `clearSearchResult()`，切換 `selectedProviderCode`，主內容顯示 provider 遊戲列表
  - Network tab 確認返回後無新 API 請求（無 providerCode / gameTypeCode 請求）
  - 確認 `searchPanelShouldRestore` 不再存在於 store（已移除）
- [ ] T020 執行 `npm run build` — 確認零 TypeScript 錯誤、零 ESLint 錯誤（SC-016）；並執行下列 grep 確認無違規（SC-017、SC-033、SC-034）：
  ```bash
  grep -R "ugsdev.com" src
  grep -R "frontendwebsite.ugsdev.com" src
  grep -R "ugs-api" src
  grep -R "providerCode" src
  grep -R "gameTypeCode" src
  grep -R "localStorage" src/utils/tokenSession.ts
  ```
  以上指令均應無輸出（空結果 = 通過）；另確認 `vite.config.ts` 無 `/ugs-api` proxy 設定。
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
- **US3（P1）**：可與 US1/US2 並行開始；T014 改寫 SearchPanel 為純輸入觸發（移除 inline 結果 UI，改 Enter/icon/tag 觸發 `executeSearch()`）；T016 在 HomeView 補完三段搜尋結果主內容顯示
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
2. 完成 Phase 2：Foundational（T006~T008、**T008b**）—— T008b 新增 `searchResultMode`、`executeSearch()`、`clearSearchResult()`
3. 完成 Phase 3：US1 — 首頁「發現」mock 輪播（T009~T010）
4. 完成 Phase 4：US2 — HomeView Provider 篩選（T011~T013）—— T013 建立 searchResultMode 優先順序 template 骨架
5. 完成 Phase 5：US3 — SearchPanel 搜尋輸入觸發（T014）—— Enter / icon / tag 觸發 `executeSearch()`，SearchPanel overlay 關閉
6. 完成 Phase 6：US4+US5 — 首頁主內容搜尋結果 UI（T015~T016）—— HomeView 填入三段結果顯示
7. **停止並驗收**：SC-001~SC-005、SC-007~SC-012、SC-018（所有 P1 情境）
8. 準備就緒後交付 P2 情境（US6、US7、US8）

### 遞增交付

1. Setup + Foundational → 基礎就緒，不破壞現有功能
2. US1（mock 輪播）→ 獨立測試 SC-001~SC-006
3. US2（Provider 篩選）→ 獨立測試 SC-007、SC-012
4. US3（SearchPanel 觸發搜尋）→ 獨立測試 SC-008a、SC-008b、SC-008c
5. US4+US5（首頁主內容搜尋結果 UI）→ 獨立測試 SC-009、SC-010、SC-012
6. US6（遊戲商頁）→ 獨立測試 SC-013、SC-014
7. US7（遊戲類別頁）→ 獨立測試 SC-013、SC-014
8. Polish → T019 返回導航手動驗收 + T020 build + grep 驗證 + SC-015~SC-018 全功能驗收

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
  - 不再使用 `/ugs-api` 作為前端 API path（改用 `/api`）
  - 不把 token 長期留在 URL（init 成功後必須移除）
  - 不把 token 存於 `localStorage`（只存 `sessionStorage`）
  - 不把完整 launchUrl 放在 route query（改用 `sessionStorage`）
  - 不硬編碼 `https://frontendwebsite.ugsdev.com` 於 src/（改用 `VITE_UGS_FRONTEND_ORIGIN`）
  - `supportiframe === false` 不得開 iframe；`supportiframe === true` 不得直接整頁跳外部
  - 不忽略 `game.url`，除非不存在才 fallback 手組 URL
- 每個 Checkpoint 可獨立停下驗收對應情境
- 每個任務或邏輯群組完成後執行 `npm run type-check` 確認零 TypeScript 錯誤
