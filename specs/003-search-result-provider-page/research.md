# Phase 0 研究報告：搜尋結果頁與遊戲商遊戲列表頁

**分支**：`003-search-result-provider`  
**日期**：2026-06-21  
**關聯規格**：`specs/003-search-result-provider-page/spec.md`

---

## DEC-001：`Game.gametypename` 欄位確認 + 篩選策略

**調查**：`src/apis/interface/lobby.ts` 的 `Game` 介面目前只有 `gametype: number`，
但 API 實際回傳 `gametypename: string`（例：`"gametypename": "Slot"`），介面定義不完整。
搜尋 API 的 `GameTypeSearchItem.code` 為字串（例：`"Slot"`），無法直接對應到 `gametype: 0`。

**決策**：
1. `Game` 介面補入 `gametypename?: string`（T001b）。
2. 新增 `GAME_TYPE_CODE_TO_ID` 常數映射（`src/data/gameTypes.ts`，T001c），現階段 6 種。
3. `GameTypeGamesView` 篩選策略：
   - 第一優先：`Number(game.gametype) === GAME_TYPE_CODE_TO_ID[code]`
   - Fallback：`game.gametypename === gameTypeName || game.gametypename === code`
4. 禁止只用 `String(game.gametype) === code`（`"Slot"` 無法命中數字 `0`）。

**現階段支援的 gameType**（依截圖確認）：

| code | gametype |
|------|---------|
| Slot | 0 |
| TableGame | 1 |
| LiveDealer | 2 |
| Lobby | 3 |
| Instant | 4 |
| Fishing | 12 |

不得加入 `Sports`、`Card`、`CardLobby`、`FishingLobby`、`Lottery`（截圖未使用）。

---

## DEC-002：`GamePlatformNav` 資料來源

**調查**：
- `store.LobbyGameProviders` 合併所有可見 group 的 provider（去重）。
- 規格 FR-031 明確指定「`All.gameproviders ?? []`」，而非 `LobbyGameProviders`。
- `LobbyGroup.gameproviders: GameProvider[]` 欄位已存在。

**決策**：在 `HomeView.vue` 中直接讀取
`lobbyData?.Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders ?? []`，
不在 store 新增 computed。Discover 固定項目由前端插入（FR-026）。

**替代方案排除**：
- 使用 `LobbyGameProviders` → 合併了多個 group，不符合規格 `All.gameproviders` 要求。
- 在 store 新增 computed → 過度設計，HomeView 可直接計算。

---

## DEC-003：`resolveIconUrl` + `resolveGameImagePath` 提取至共用工具

**調查**：`HomeView.vue` 與 `SearchPanel.vue` 各自實作了相同邏輯但 fallback 不一致。
FR-025 規定 `resolveIconUrl` 只做 URL 正規化，空白回傳空字串。
但遊戲卡片圖片不可顯示空白，需要 fallback 至 `GameCard-1~4.png`。

**決策**：
- `src/utils/url.ts` 匯出兩個函式：
  1. `resolveIconUrl(iconurl)` — 只做 URL 正規化（`//` → `https:`，空值 → `''`）
  2. `resolveGameImagePath(iconurl, idx)` — 先呼叫 resolveIconUrl，若仍空則依 idx 輪替 `GameCard-1~4.png`
- 遊戲卡片圖片映射（HomeView、ProviderGamesView、GameTypeGamesView）統一使用 `resolveGameImagePath`。
- Provider icon 映射（在 `resolveProviderDisplay` 中）使用 `resolveIconUrl`；空值時顯示文字佔位，不使用任何圖片。
- `no-data.png` 只在 `EmptyState` 元件中使用（由 `imageSrc` props 預設值設定），不得作為任何卡片或 icon 的 fallback。

**替代方案排除**：只提取 resolveIconUrl 且讓遊戲卡片空白顯示 → 破壞 GameCard UI。

---

## DEC-004：`SearchPanel` 行為重構

**調查**：現行 `SearchPanel.vue` 的 `watch(keyword)` debounce 300ms 後呼叫
`lobbyStore.searchLobby()`，並在面板內顯示結果。003 要求搜尋結果移至獨立路由 `/search`。

**決策（最小改動）**：
- 保留 SearchPanel 的展開 overlay UI（Home-1 設計稿右側）。
- 將 debounce watcher 改為：若 keyword 非空 → `router.push('/search?keyword=' + encodeURIComponent(val))`。
- 移除 SearchPanel 中的結果顯示 sections（games / providers / gameTypes）。
- 保留 tags 預設狀態。
- `onClose` 行為不變（清空 keyword、emit close）。
- `lobbyStore.searchLobby()` 改在 `SearchView.vue` 中呼叫。

**替代方案排除**：
- 完全重寫 SearchPanel → 違反「不重寫現有元件，以最小改動方式處理」原則。
- 保留結果在 SearchPanel 顯示，同時也在 SearchView 顯示 → 邏輯重複。

---

## DEC-005：`carouselPages` 補齊至 3 頁

**調查**：`src/data/games.ts` 目前 `carouselPages = [gameCards, [...gameCards]]`（僅 2 頁）。
規格 FR-028 要求「3 頁 × 4 張」。

**決策**：在 `games.ts` 加入第 3 頁：
```ts
export const carouselPages: GameCard[][] = [gameCards, [...gameCards], [...gameCards]]
```

---

## DEC-006：`selectedProviderCode` 首頁狀態

**調查**：`GamePlatformNav.vue` 的 `<li>` 目前無 `@click` handler，僅有搜尋按鈕的
`open-search` emit。需要能點擊 provider item 以切換首頁顯示。

**決策**：
- `GamePlatformNav.vue` 新增 emit `select-platform(id: string)` 及 `<li>` 的 `@click`。
- `HomeView.vue` 新增 `selectedProviderCode = ref<string | null>(null)`。
- 點擊 Discover → emit `'select-platform', 'Discover'` → `HomeView` 設為 `null`。
- 點擊其他 → emit `'select-platform', item.id` → `HomeView` 設為 `item.id`。
- `activePlatformId` prop 傳入 `selectedProviderCode ?? 'Discover'`。
- 不導向子路由（FR-033）。

---

## DEC-007：首頁 provider 篩選遊戲顯示

**調查**：Provider 篩選後需要顯示平整的遊戲卡片列表。若使用 `<GameSection :title-key="''">`，
會觸發 i18n warning（key 為空字串）。

**決策**：
- 使用自訂 `.provider-games__grid` div（`display: grid; grid-template-columns: 1fr 1fr`），直接渲染 `GameCard.vue`。
- `providerGameCards = computed<GameCard[]>(() => ...)` — 平整陣列（非分頁 `GameCard[][]`）。
- 圖片映射使用 `resolveGameImagePath(game.iconurl, i)` 處理 fallback（DEC-003）。
- 不修改 `GameSection.vue`、`GameCard.vue` 的 props 或核心視覺。
- `selectedProviderCode === null`（Discover）：顯示原 hotGames + newGames `GameSection`（mock 輪播）。

---

## DEC-008：新路由架構

**決策**：在 `src/router/index.ts` 新增：
```ts
{ path: '/search', component: () => import('@/views/SearchView.vue') }
{ path: '/search/provider/:code', component: () => import('@/views/ProviderGamesView.vue') }
{ path: '/search/game-type/:code', component: () => import('@/views/GameTypeGamesView.vue') }
```

---

## DEC-009：SearchView 實作策略

**決策**：
- 讀取 `route.query.keyword`（string）作為初始 keyword。
- 區域 `keyword = ref('')`，初始化時 `keyword.value = route.query.keyword ?? ''`。
- `watch(keyword, debounced)` → `router.replace({ query: { keyword: val } })` + 呼叫 `lobbyStore.searchLobby()`。
- 使用 `router.replace` 而非 `push`，避免搜尋每次字元都產生歷史記錄。
- X 按鈕 → `router.push('/')`。
- 結果點擊 provider → `router.push('/search/provider/' + code + '?keyword=' + keyword.value)`。
- 結果點擊 gameType → `router.push('/search/game-type/' + code + '?keyword=' + keyword.value)`。

---

## DEC-010：ProviderGamesView 實作策略

**決策**：
- `code = route.params.code as string`
- `keyword = ref(route.query.keyword as string ?? '')`（僅用於 back 導航）
- `display` 透過 `resolveProviderDisplay(code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? [])` 取得（DEC-014）。
  - 優先從 `LobbyGameProviders` 取得 name + iconPath
  - fallback 至 `searchResult.providers.items`
  - iconPath 空字串時顯示 name 文字佔位，**不使用 `no-data.png`**
- `games` 從 `lobbyStore.LobbyGameList.filter(g => g.providercode === code)` 取得。
- 遊戲圖片使用 `resolveGameImagePath(game.iconurl, i)` 處理 fallback（DEC-003）。
- 返回：`router.push('/search?keyword=' + keyword.value)`。
- 無遊戲 → `<EmptyState />`（props 預設值）。

---

## DEC-011：GameTypeGamesView 實作策略

**決策**：
- `code = route.params.code as string`（例：`Slot`）
- `gameTypeId = GAME_TYPE_CODE_TO_ID[code]`（例：`0`）（DEC-015）
- `gameTypeName` 從 `lobbyStore.searchResult?.gameTypes.items.find(t => t.code === code)?.name ?? code`
- 篩選策略（兩個條件 OR）：
  1. `Number(game.gametype) === gameTypeId`（第一優先）
  2. `game.gametypename === gameTypeName.value || game.gametypename === code`（fallback）
- 禁止只用 `String(game.gametype) === code`（`"Slot"` 無法命中數字 `0`）。
- 遊戲圖片使用 `resolveGameImagePath(game.iconurl, i)`。
- 無遊戲 → `<EmptyState />`（props 預設值）。

---

## DEC-012：`EmptyState` 元件

**決策**：
- 新增 `src/components/EmptyState.vue`。
- Props 均為選用：
  - `imageSrc?: string` — 預設 `/assets/images/no-data.png`（非 `icons/` 子目錄）
  - `message?: string` — 未傳入時元件內用 `t('home.search.emptyState')` 提供預設
- 呼叫方可省略 props（使用預設），也可個別覆寫。
- **`no-data.png` 只用於 EmptyState 的 `imageSrc` 預設值，禁止做遊戲卡片或 provider icon fallback**。
- 樣式：置中容器（flex column），圖片 80px × 80px，文字 13px `#888`，上下 padding 32px。

---

## DEC-013：i18n 新增 keys

**決策**：在 `zh-TW.ts` 與 `en-US.ts` 各新增以下 key，保持結構一致：

| Key | zh-TW | en-US |
|-----|-------|-------|
| `home.search.title` | `搜尋` | `Search` |
| `home.search.emptyState` | `Woo...這裡暫時沒有東西` | `Woo... Nothing here yet` |
| `common.actions.back` | `返回` | `Back` |

---

## DEC-014：`resolveProviderDisplay` 共用工具

**決策**：新增 `src/utils/provider.ts`，匯出 `resolveProviderDisplay(code, lobbyProviders, searchProviders)`。

優先順序：
1. `LobbyGameProviders`（`All.gameproviders`）中相同 code → 使用 `shortname || name`，icon 使用 `resolveIconUrl(iconurl)`
2. `searchResult.providers.items` 中相同 code → 使用 `shortname || name || code`，icon fallback
3. 純文字 fallback → `{ code, name: code, iconPath: '' }`

icon 為空字串時：template 使用 `v-if="display.iconPath"` 控制是否渲染 `<img>`，顯示 name 文字佔位。
**不使用 `no-data.png` 作為 provider icon fallback（禁止事項 #15）。**

此函式用於：SearchView（provider card）、ProviderGamesView（頁首）。

---

## DEC-015：`GAME_TYPE_CODE_TO_ID` 常數映射表

**決策**：新增 `src/data/gameTypes.ts`，匯出 `GAME_TYPE_CODE_TO_ID`。

現階段只含依截圖確認的 6 種遊戲類型：

| code | gametype 數值 |
|------|-------------|
| Slot | 0 |
| TableGame | 1 |
| LiveDealer | 2 |
| Lobby | 3 |
| Instant | 4 |
| Fishing | 12 |

**嚴格禁止**：不得加入 `Sports`、`Card`、`CardLobby`、`FishingLobby`、`Lottery`（截圖未使用）。
未來截圖確認有新類型後，才在 spec 更新後加入。
