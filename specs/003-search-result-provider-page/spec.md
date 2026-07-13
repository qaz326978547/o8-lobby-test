# 功能規格：搜尋結果頁與遊戲商遊戲列表頁

**功能分支**：`003-search-result-provider`

**建立日期**：2026-06-18

**狀態**：Draft

**輸入**：在 002-ugs-lobby-api-integration Phase 4 完成搜尋 API 串接後，依照設計參考圖
`reference/Home-1.png`、`reference/Home-2.png`、`reference/Search-1.png`、`reference/Search-2.png`
補實首頁「發現」預設狀態、GamePlatformNav 資料來源、搜尋結果 UI（三段分區顯示）、
搜尋無結果空狀態、遊戲商遊戲列表頁，以及遊戲類別遊戲列表頁（前端篩選，不新增 API）。

---

## 釐清記錄

### Session 2026-06-18

- 搜尋結果 UI 延用 002 Phase 4 已串接的 UGS Search API（`/api/lobby/mobile/search`），本規格只補 UI 呈現。
- 遊戲商列表頁不新增任何 API，使用 store `LobbyGameList` 依 `game.providercode` 前端篩選（API 文件無 providerCode 查詢端點）。
- 空狀態圖統一使用 `/assets/images/no-data.png`，透過共用 `EmptyState` 元件呈現，**不作為遊戲卡片圖片 fallback**。
- `gameTypes.items[].gamecount` 只代表數量，不觸發額外 API。
- `Player`、`Balance`、`CurrencySymbol` 沿用 002 規則，只存 store，不接 UI。

### Session 2026-06-21（路由與互動規則確認）

- **搜尋框展開仍屬首頁**：點擊搜尋 icon 後，搜尋框在首頁展開（路由仍為 `/`，不跳轉）；使用者輸入 keyword 後，搜尋結果直接在 SearchPanel overlay 下方以可捲動方式顯示，**不導覽至 `/search`**。X 關閉按鈕位於 SearchPanel overlay 中，點擊後導覽回 `/` 並清除 keyword。
- **首頁 provider 選單**：使用者在首頁平台導覽列點擊 provider（ATG、BT 等），以 `selectedProviderCode` 更新首頁內部狀態，顯示該 provider 的遊戲列表（`LobbyGameList` 前端篩選）；路由不變，不進入 `/search/provider/:code`，與搜尋流程完全分離。
- **遊戲商遊戲列表頁路由**：採用 `/search/provider/:code`（不強制帶 keyword query）；返回按鈕回到 `/`（首頁）。
- **遊戲類別遊戲列表頁**：本功能實作 `/search/game-type/:code`；遊戲清單以 `LobbyGameList` 前端篩選，不新增 API；返回按鈕回到 `/`。
- **provider 資料優先順序**（用於 `/search/provider/:code` 頁面）：`store.LobbyGameProviders`（`code === route.params.code`）> `store.searchResult?.providers.items` 中對應項目 > 純文字顯示 `route.params.code`。
- **`provider.iconurl` 空值佔位**：顯示 `provider.code` 縮寫文字，不崩潰，不使用 `no-data.png`。
- **gameType 點擊**：點擊搜尋結果區塊的遊戲類別 → 導覽至 `/search/game-type/:code`；本功能實作。

### Session 2026-06-21（首頁發現狀態與 GamePlatformNav 規則確認）

- **「發現」為固定前端項目**：`GamePlatformNav` 第一個項目固定為「發現」，不從 API 取得，由前端插入；code 固定為 `'Discover'`，icon 固定使用 `/assets/images/icons/discover.png`，顯示文字依 i18n（zh-TW：發現，en-US：Discover）。
- **「發現」為首頁預設選中**：首頁初始載入時預設選中「發現」，顯示熱門遊戲與新品推薦 mock 輪播。
- **GamePlatformNav API provider 來源**：除「發現」外，其餘 provider 項目來自 `Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders ?? []`；`All` group 不存在時 provider 清單為空，但「發現」仍顯示、首頁不崩潰。
- **Hot/New group 現階段不存在**：UGS Lobby API 現階段 `groups[].code` 中無 `'Hot'` 或 `'New'`；熱門遊戲與新品推薦先維持 mock 輪播（各 3 頁，每頁 4 張卡片，圖片使用 `GameCard-1.png` 至 `GameCard-4.png`）；未來 API 新增後可切換，但現階段不強制。
- **禁止 non-null assertion**：不得使用 `groups.find(g => g.code === 'All')!`、`groups.find(g => g.code === 'Hot')!`、`groups.find(g => g.code === 'New')!`，必須以 optional chaining / nullish coalescing 處理。

### Session 2026-06-22（搜尋流程調整確認）

- **搜尋結果改為 inline overlay（此決策已由 2026-06-23 修正覆蓋）**：原訂搜尋結果在 SearchPanel overlay 下方顯示；2026-06-23 調整為在首頁主內容區顯示（見下方）。
- **返回按鈕目標為 `/`**：從 `/search/provider/:code` 或 `/search/game-type/:code` 點擊返回，直接回到首頁 `/`。

### Session 2026-06-23（搜尋流程全面修正）

- **SearchPanel 職責收窄**：SearchPanel overlay 只負責搜尋輸入、觸發搜尋、顯示預設 tags；**不顯示搜尋結果**。搜尋完成後 SearchPanel overlay 關閉，搜尋結果在首頁 GamePlatformNav 下方主內容區顯示。
- **搜尋觸發方式**：僅在以下三種事件才呼叫搜尋 API：① 使用者按 Enter；② 使用者點擊搜尋 icon；③ 使用者點擊預設 tag。**禁止** debounce watcher 或 input change 事件自動呼叫 API。
- **SearchTag 結構**：新增 `searchValue` 欄位，區分顯示文字（`label`）與搜尋關鍵字（`searchValue`）。Tag 點擊時以 `searchValue` 呼叫 API，不以 `label` 直接搜尋（例：顯示「電子」但 searchValue 為 `'Slot'`）。
  ```ts
  interface SearchTag {
    id: string
    label: string        // display text（可為 t('home.search.tags.slots') i18n key）
    searchValue: string  // 傳給 API 的搜尋關鍵字
  }
  ```
- **搜尋完成後行為**：SearchPanel overlay 關閉；首頁 `lobbyStore.searchResultMode` 設為 `true`；搜尋結果顯示於 GamePlatformNav 下方主內容區（取代原本 Discover mock 輪播或 provider 遊戲列表）；路由仍為 `/`。
- **GamePlatformNav 永遠保留**：首頁 `/` 的所有狀態（Discover 預設、provider 篩選、搜尋結果模式）下，GamePlatformNav 都必須可見，不可隱藏或移除。
- **首頁 MainContent 優先順序**：
  1. `lobbyStore.searchResultMode === true` → 顯示搜尋結果三段區塊（取代所有其他內容）
  2. `selectedProviderCode` 有值（且 `searchResultMode === false`）→ 顯示 provider 遊戲列表
  3. 其他（Discover 預設）→ 熱門遊戲與新品推薦 mock 輪播
- **子頁返回策略**：ProviderGamesView / GameTypeGamesView 返回按鈕只執行 `router.push('/')`，**不設定任何 flag**。返回後 `lobbyStore.searchResultMode` 仍保留 `true`，首頁主內容區直接顯示搜尋結果；SearchPanel overlay **不自動重新展開**。若 store 搜尋狀態遺失（`searchResult === null`），回到 Discover 預設，不崩潰。
- **Store 狀態調整**：移除 `searchPanelShouldRestore`；新增 `searchResultMode: ref<boolean>(false)`；新增 `searchError: ref<string | null>(null)`；新增 `executeSearch(keyword: string)` action（呼叫 `searchLobby()`、設 `searchResultMode = true`）；新增 `clearSearchResult()` action（清除 `searchResult`、重置 `searchResultMode = false`、清除 `searchKeyword`）。`isSearching` 現有 state 保留（或改名 `searchLoading`）。
- **X 關閉按鈕行為**：只關閉 SearchPanel overlay、清除 input local keyword（可同步清空 `lobbyStore.searchKeyword`）；**不清除首頁搜尋結果**（`searchResultMode` 保持不變）。
- **Clear 清除按鈕行為**：清空 input local keyword（可同步清空 `lobbyStore.searchKeyword`）；SearchPanel 保持展開；顯示預設 tags；不呼叫 API。
- **clearSearchResult() 觸發時機**：使用者點擊 GamePlatformNav 的「發現」或點擊任意 provider 時，呼叫 `clearSearchResult()`，清除搜尋結果模式，顯示 Discover 預設或 provider 遊戲列表。
- **首頁 provider 點擊行為（clarification）**：點擊 GamePlatformNav provider → 設 `selectedProviderCode`、呼叫 `clearSearchResult()`、顯示 provider 遊戲列表；點擊「發現」→ 清除 `selectedProviderCode`、呼叫 `clearSearchResult()`、回到 mock 輪播。

### Session 2026-06-25（API base 調整、Token 保存、遊戲啟動）

- **API base path 調整**：前端呼叫 UGS Lobby API 時，不再使用 `/ugs-api` 作為 base path。Lobby 初始化 API path 改為 `/api/lobby/mobile?token={token}`，搜尋 API path 改為 `/api/lobby/mobile/search?token={token}&keyword={keyword}`。`vite.config.ts` dev proxy 改為代理 `/api` → `https://frontendwebsite.ugsdev.com`（停用 `/ugs-api` proxy）。任何 Network request 不得再出現 `/ugs-api/api/lobby/mobile`。

- **環境變數規則**：
  - `VITE_UGS_API_BASE`：供 axios baseURL 使用（`.env.development` 設為空字串或 `/`，使最終請求為 `/api/lobby/mobile?...`）。
  - `VITE_UGS_FRONTEND_ORIGIN`：供補齊 `game.url` 相對路徑（`.env.development` 設為 `https://frontendwebsite.ugsdev.com`）。
  - `https://frontendwebsite.ugsdev.com` 不得硬編碼於 `src/` runtime code，必須從 `VITE_UGS_FRONTEND_ORIGIN` 讀取。

- **Token 來源優先順序與 sessionStorage 保存**：
  - URL token 優先於 sessionStorage token。
  - 初始化 API 成功後：① 將 token 存入 `sessionStorage`（TTL 24 小時，以 `expiresAt` 欄位記錄）；② 以 `router.replace` 或 `window.history.replaceState` 移除 URL 中的 `token` query（保留其他 query，不觸發頁面重整）。
  - 後續重整或返回時：若 URL 無 token，從 `sessionStorage` 讀取有效 token；token 過期則清除，不呼叫 lobby API，首頁顯示 Discover mock，不崩潰。
  - URL token 與 sessionStorage token 均不存在時，不呼叫 lobby API，首頁正常顯示 mock 輪播。
  - token 不得存於 `localStorage`；`sessionStorage` 只存 `{ token: string; expiresAt: number }`，不存玩家資料。

- **Token utility**（`src/utils/tokenSession.ts`）：
  ```ts
  const TOKEN_STORAGE_KEY = 'ugs_lobby_token'
  const TOKEN_EXPIRE_MS = 24 * 60 * 60 * 1000  // 1 day

  interface StoredToken { token: string; expiresAt: number }

  function saveTokenToSession(token: string): void
  function getTokenFromSession(): string | null  // 過期則清除並回傳 null
  function clearTokenFromSession(): void
  ```

- **遊戲啟動 URL 解析**（`src/utils/gameLaunch.ts`）：
  - 優先使用 API 回傳的 `game.url`：
    - 相對路徑（`/gamelauncher?...`）→ 補 `VITE_UGS_FRONTEND_ORIGIN` 前綴，組成完整 URL。
    - `http://` 或 `https://` 開頭 → 直接使用。
    - protocol-relative（`//...`）→ 補 `https:` 前綴。
    - 含 `{TOKEN}` placeholder → 替換為當前有效 token。
  - `game.url` 不存在 → fallback：以 `game.providercode`、`game.code`、token 組成 `/gamelauncher?...`，再補 `VITE_UGS_FRONTEND_ORIGIN`。
  - **完整 launchUrl 不得放在 route query 上**（避免 token 暴露）。
  - 共用 helper：`resolveGameLaunchUrl(game: Game, token: string, frontendOrigin: string): string`。

- **`supportiframe` 啟動行為**：
  - `game.supportiframe === true`：`sessionStorage.setItem('ugs_game_launch_url', launchUrl)` → `router.push('/game-frame')`；不整頁跳外部。
  - `game.supportiframe === false`：`window.location.href = launchUrl`；不開 iframe、不導向 `/game-frame`。

- **GameFrameView**（`src/views/GameFrameView.vue`，路由 `/game-frame`）：
  - 頁面結構：簡單 header（左上角「返回首頁」按鈕，i18n key `common.actions.back` 或新增 `common.actions.backToHome`）+ 全版 iframe（`calc(100vh - headerHeight)`，`border: 0`，寬度 100%）。
  - iframe `src`：`sessionStorage.getItem('ugs_game_launch_url')`；無 launchUrl 時顯示 EmptyState + 返回首頁按鈕，不崩潰。
  - 返回首頁：`router.push('/')`（可同時清除 `sessionStorage.removeItem('ugs_game_launch_url')`）。
  - header 不顯示玩家/餘額/幣別；不破壞既有 `AppHeader.vue`（若不適用，可新增 `GameFrameHeader` 元件）。

- **遊戲卡片點擊範圍**：首頁 provider 篩選列表、首頁搜尋結果 games 區塊、`ProviderGamesView`、`GameTypeGamesView` 的 API 遊戲卡片，均使用同一套 `launchGame(game)` helper。搜尋結果 game item 若無 `url` 欄位，先以 `code + providercode` 回查 `LobbyGameList` 取完整 game 資料後再 launch。Discover mock 輪播卡片（非真實 API game）現階段不套用 launch 邏輯。

### Session 2026-07-02（Lobby Path 調整、Hot/New API 群組整合、輪播 Slide 效果）

- **Lobby API path 調整**：`fetchLobbyData` 預設 lobbyPath 已設為 `'O8_Mobile_Lobby_test'`，對應 endpoint `/api/lobby/O8_Mobile_Lobby_test?token=...`；`executeSearch` 搜尋 API path 同步改為 `lobbyPath: 'O8_Mobile_Lobby_test'`，最終 Network request 為 `/api/lobby/O8_Mobile_Lobby_test/search?...`；`src/stores/lobby.ts` 的 `executeSearch` 中 `searchLobby` 呼叫由 `lobbyPath: 'mobile'` 改為 `lobbyPath: 'O8_Mobile_Lobby_test'`。

- **O8_Mobile_Lobby_test 包含 Hot/New 群組**：切換至 `O8_Mobile_Lobby_test` 後，API 回傳 `Lobby.Data.groups` 包含 `code: "Hot"` 與 `code: "New"` 的群組。首頁「熱門遊戲」區塊優先使用 `groups.find(g => g.code === 'Hot')?.games ?? []`；「新品推薦」區塊優先使用 `groups.find(g => g.code === 'New')?.games ?? []`；Hot/New group 不存在或 `games` 為空時，fallback 至現有 mock 輪播（`carouselPages`），確保首頁不崩潰。

- **Hot/New 遊戲卡片可進入遊戲**：首頁「熱門遊戲」與「新品推薦」區塊顯示 API 遊戲時，點擊遊戲卡片使用 `launchGame(game, token, frontendOrigin, router.push)` 啟動遊戲（`supportiframe` 決定 iframe vs redirect）。**Mock fallback 時（Hot/New group 不存在或 games 為空）不套用 `launchGame`**（靜態 mock 資料無真實 `Game` 物件）。由於 `GameSection.vue` props 不得修改，有 API 資料時 HomeView 使用獨立輪播區塊渲染（不經由 `<GameSection>` 元件，以支援 `@click`）；mock fallback 時仍使用 `<GameSection>`。

- **各區塊遊戲來源規則明確化**：
  - 首頁 Hot 輪播：`groups.find(g => g.code === 'Hot')?.games ?? []`（有資料則用，無資料 fallback mock）
  - 首頁 New 輪播：`groups.find(g => g.code === 'New')?.games ?? []`（同上）
  - `LobbyGameList`（供 provider 篩選、搜尋結果 game lookup、ProviderGamesView、GameTypeGamesView）：改為只取 `groups.find(g => g.code === 'All')?.games ?? []`（避免 Hot/New 遊戲與 All 遊戲在篩選結果中重複）
  - `GamePlatformNav` provider 清單：`groups.find(g => g.code === 'All')?.gameproviders ?? []`（不變）
  - **禁止 non-null assertion**：所有 `.find(...)` 必須搭配 `?.` 與 `?? []`。

- **首頁輪播過場效果**：`GameSection.vue` 輪播過場由淡入淡出（`<Transition name="fade">`）改為平滑橫向滑動（slide）；以 CSS `transform: translateX` 搭配 `transition` 實現；保留自動播放（5 秒）與觸控滑動手勢；不修改 `GameSection.vue` 的 props 介面及其他核心視覺（標題、圖示、進度條、grid 結構）。

---

## Reference 設計稿對應

### `reference/Home-1.png`

- **對應設計**：H5-首頁、H5-首頁-搜尋框展開
- **路由**：`/`
- **用途**：
  - 首頁預設狀態：「發現」選中，顯示熱門遊戲與新品推薦 mock 輪播；GamePlatformNav 第一個為「發現」，後續為 `All.gameproviders`
  - 首頁搜尋框展開狀態：搜尋 icon 點擊後，SearchPanel overlay 出現；overlay 內只有搜尋 input、清除、搜尋 icon、預設 tags；**不在 overlay 顯示搜尋結果**
- **注意**：搜尋框展開仍屬首頁 route `/`；GamePlatformNav 在搜尋框展開狀態下仍保留可見

### `reference/Home-2.png`

- **對應設計**：H5-首頁-點擊選單的遊戲廠商
- **路由**：`/`
- **用途**：使用者在 GamePlatformNav 點擊 API provider（如 ATG、BT、DB），首頁以 `selectedProviderCode` 篩選並顯示該 provider 的遊戲列表；provider 清單來自 `All.gameproviders`
- **資料來源**：`store.LobbyGameList` 依 `game.providercode === selectedProviderCode` 前端篩選
- **限制**：
  - 不呼叫新 API
  - 不導向 `/search/provider/:code`
  - 與搜尋結果頁的 provider 點擊行為嚴格分離
  - GamePlatformNav 仍顯示在上方

### `reference/Search-1.png`

- **對應設計**：H5-搜尋頁面、H5-搜尋-無結果
- **路由**：`/`（搜尋完成後首頁主內容區，路由不變）
- **用途**：
  - 搜尋完成後，SearchPanel overlay 關閉，搜尋結果在首頁 GamePlatformNav 下方主內容區以三段分區顯示（遊戲 / 遊戲商 / 遊戲類別）；**不在 SearchPanel overlay 內顯示**
  - 有結果：三段依 `items.length > 0` 選擇性顯示
  - 無結果：顯示 EmptyState（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）於主內容區
  - 本設計稿供參考；最終行為為搜尋結果在首頁主內容區，非獨立路由

### `reference/Search-2.png`

- **對應設計**：H5-遊戲廠商搜尋結果頁面、H5-遊戲類別搜尋結果頁面
- **路由**：`/search/provider/:code`、`/search/game-type/:code`
- **用途**：
  - 在首頁主內容區搜尋結果中點擊 provider → 導向 `/search/provider/:code`（可選帶 `?keyword={keyword}`）
  - 在首頁主內容區搜尋結果中點擊 gameType → 導向 `/search/game-type/:code`（可選帶 `?keyword={keyword}`）
- **遊戲列表**：2 欄 grid，使用 `store.LobbyGameList` 前端篩選，不呼叫新 API

---

## 最終路由規劃

| 路由 | 涵蓋設計稿狀態 | 元件（建議） | 說明 |
|------|--------------|-------------|------|
| `/` | H5-首頁 / H5-首頁-搜尋框展開 / H5-首頁-點擊選單的遊戲廠商 / H5-搜尋頁面 / H5-搜尋-無結果 | `HomeView.vue`（既有）+ `SearchPanel.vue` | 首頁所有狀態；「發現」預設選中；SearchPanel 展開、搜尋結果主內容顯示、provider 選單篩選均為頁面內部狀態，不改路由；GamePlatformNav 在所有狀態下均保留可見 |
| `/search` | — | `SearchView.vue`（stub） | 保留路由避免 deep link 404；不作為主要搜尋結果 UI |
| `/search/provider/:code` | H5-遊戲廠商搜尋結果頁面 | `ProviderGamesView.vue`（新增） | 遊戲商遊戲列表頁；前端篩選 `LobbyGameList`；O8 Header + 返回（`/`）+ provider icon |
| `/search/game-type/:code` | H5-遊戲類別搜尋結果頁面 | `GameTypeGamesView.vue`（新增） | 遊戲類別遊戲列表頁；前端篩選 `LobbyGameList`；O8 Header + 返回（`/`）+ gameType 名稱 |
| `/game-frame` | — | `GameFrameView.vue`（新增） | iframe 遊戲啟動頁；iframe `src` 來自 `sessionStorage`（`ugs_game_launch_url`）；header 含返回首頁按鈕（`router.push('/')`）；launchUrl 不出現在 route query |

**首頁四種狀態（同屬 `/`，均不改路由，GamePlatformNav 全程保留）**：

1. **發現（預設）**：「發現」選中，顯示熱門遊戲與新品推薦 mock 輪播（各 3 頁 × 4 張卡片）。
2. **搜尋框展開**：點擊搜尋 icon 後 SearchPanel overlay 出現；overlay 內只有 input、clear、搜尋 icon、預設 tags；尚未執行搜尋前首頁主內容不變。
3. **搜尋結果模式**：Enter / 搜尋 icon 點擊 / tag 點擊後觸發 API；SearchPanel overlay 關閉；`searchResultMode = true`；首頁 GamePlatformNav 下方主內容顯示三段搜尋結果（或 EmptyState）；路由不變。
4. **provider 篩選**：點擊 GamePlatformNav 中的 API provider 後，以 `selectedProviderCode` 篩選首頁遊戲列表；路由不變，不進入 `/search/provider/:code`；`searchResultMode` 同時清除。

---

## 使用者情境與測試

### 使用者情境 1 — 首頁「發現」預設狀態與 mock 輪播（優先級：P1）

使用者開啟首頁（`/`），GamePlatformNav 第一個項目為「發現」且預設選中，
顯示「熱門遊戲」與「新品推薦」兩個輪播區塊。
兩個區塊各有 3 頁，每頁 4 張卡片，卡片圖片使用
`/assets/images/games/GameCard-1.png` 至 `GameCard-4.png`（各頁可重複使用四張圖片）。
現階段使用 mock 資料，不依賴 API 的 `Hot` / `New` group（兩者尚未在 API 中存在）。

**為何優先**：首頁「發現」狀態是使用者開啟 App 的第一個視覺，必須穩定呈現，不可因 API group 不存在而空白或 crash。

**獨立測試**：無 token（lobby API 未呼叫）狀態下開啟首頁，確認「發現」選中、兩個輪播各 3 頁 4 張卡片正常顯示。

**驗收場景**：

1. **Given** 使用者開啟首頁，**When** 頁面載入完成，**Then** `GamePlatformNav` 第一個項目為「發現」（icon：`/assets/images/icons/discover.png`），顯示文字透過 `t('home.navigation.discover')` i18n（zh-TW：「發現」，en-US："Discover"），預設選中，顯示熱門遊戲與新品推薦兩個輪播區塊。
2. **Given** 「發現」預設選中，**When** 使用者觀察熱門遊戲輪播，**Then** 共有 3 頁，每頁顯示 4 張卡片（2 欄 grid），圖片來自 `/assets/images/games/GameCard-1.png` 至 `GameCard-4.png`；三頁可重複使用四張圖片，但必須為真實 3 頁資料結構。
3. **Given** 「發現」預設選中，**When** 使用者觀察新品推薦輪播，**Then** 同上（3 頁 × 4 張卡片，同一組 mock 圖片）。
4. **Given** API 回傳的 `groups` 中不含 `Hot` 或 `New`，**When** 頁面載入，**Then** 熱門遊戲與新品推薦仍以 mock 資料顯示，首頁不崩潰，不顯示空白或錯誤。
5. **Given** `Lobby.Data.groups` 完全為空或 API 未呼叫，**When** 頁面載入，**Then** 首頁仍顯示「發現」輪播 mock 資料，不崩潰。

---

### 使用者情境 2 — 首頁 GamePlatformNav provider 選單篩選（優先級：P1）

使用者在首頁 `GamePlatformNav` 點擊「發現」以外的 provider（如 ATG），
頁面以 `selectedProviderCode` 篩選 `store.LobbyGameList` 並顯示該 provider 的遊戲列表（2 欄 grid）。
路由仍為 `/`，不改路由，不呼叫新 API。
同時清除 `searchResultMode`（若搜尋結果模式進行中），回到 provider 篩選模式。
`GamePlatformNav` 的 provider 清單（除「發現」外）來自
`Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders ?? []`。

**為何優先**：GamePlatformNav 是首頁核心導覽元素，provider 來源規則與 Discover 邏輯必須在搜尋功能之前確立。

**獨立測試**：在有 lobby 資料的狀態下點擊 ATG，確認：（1）路由仍為 `/`；（2）頁面僅顯示 `providercode === 'ATG'` 的遊戲；（3）Network tab 無新 API 請求；（4）GamePlatformNav 仍顯示。

**驗收場景**：

1. **Given** 首頁 lobby 資料已載入，**When** 使用者觀察 `GamePlatformNav`，**Then** 第一個項目為「發現」，後續 provider 項目來自 `All.gameproviders`；provider 圖示使用 `gameproviders[].iconurl`，名稱優先使用 `shortname`（無則 `name`，再無則 `code`）；`iconurl` 空值時顯示縮寫文字，不使用 `no-data.png`。
2. **Given** 使用者點擊 `GamePlatformNav` 中的某個 provider，**When** 點擊事件觸發，**Then** 路由仍為 `/`；`searchResultMode` 清除為 `false`；頁面顯示 `LobbyGameList.filter(g => g.providercode === selectedProviderCode)` 的遊戲列表（2 欄 grid）；Network tab 無新 API 請求；GamePlatformNav 仍顯示在上方。
3. **Given** 使用者在 provider 篩選狀態下點擊「發現」，**When** 點擊事件觸發，**Then** 清除 `selectedProviderCode`，呼叫 `clearSearchResult()`，回到熱門遊戲與新品推薦 mock 輪播狀態。
4. **Given** `Lobby.Data.groups` 中不存在 `code === 'All'` 的 group 或 `All.gameproviders` 為空，**When** 頁面載入，**Then** `GamePlatformNav` 仍顯示「發現」（清單中只有「發現」），首頁不崩潰，熱門遊戲與新品推薦仍顯示 mock 輪播。
5. **Given** 首頁 provider 篩選狀態，**When** 使用者點擊搜尋 icon，**Then** SearchPanel overlay 展開（路由仍 `/`），不隱藏 GamePlatformNav，不影響 provider 篩選狀態（overlay 尚未執行搜尋）。
6. **Given** 搜尋結果模式中，**When** 使用者點擊 GamePlatformNav provider，**Then** `clearSearchResult()` 被呼叫，`searchResultMode` 清除，主內容切換為 provider 遊戲列表。

---

### 使用者情境 3 — 展開搜尋框與觸發搜尋（優先級：P1）

使用者點擊首頁 GamePlatformNav 搜尋 icon，SearchPanel overlay 在首頁展開（路由仍為 `/`，不跳轉）。
展開後 overlay 內只顯示：搜尋 input、清除（X）按鈕、搜尋 icon、預設 tags；**不顯示搜尋結果**。

使用者輸入 keyword 時，只更新 local keyword（可同步 `lobbyStore.searchKeyword`），**不呼叫搜尋 API**。
僅在以下三種事件才呼叫搜尋 API：
1. 使用者按 **Enter**
2. 使用者點擊搜尋 icon（overlay 內的搜尋 icon）
3. 使用者點擊預設 **tag**

搜尋 API 呼叫成功後：
- SearchPanel overlay **關閉**
- `lobbyStore.searchResultMode = true`
- 首頁 GamePlatformNav 下方主內容區顯示搜尋結果
- 路由仍為 `/`

**為何優先**：搜尋進入點是進入遊戲商/遊戲類別列表的前置步驟；trigger 規則必須明確，避免 API 被誤觸發。

**獨立測試**：點擊搜尋 icon 展開 overlay；輸入文字確認不打 API；按 Enter 確認打 API、overlay 關閉、主內容顯示結果。

**驗收場景**：

1. **Given** 使用者位於首頁，**When** 點擊搜尋 icon，**Then** SearchPanel overlay 展開，路由仍為 `/`，overlay 內顯示搜尋 input（含 i18n placeholder）、清除按鈕、搜尋 icon、預設 tags；**不**顯示搜尋結果；GamePlatformNav 仍保留可見。
2. **Given** SearchPanel overlay 已展開，**When** 使用者輸入文字，**Then** input 即時更新顯示文字（可同步 `lobbyStore.searchKeyword`），**不**呼叫搜尋 API（Network tab 無搜尋請求）。
3. **Given** SearchPanel overlay 已展開且 keyword 非空，**When** 使用者按 Enter，**Then** 呼叫搜尋 API（`lobbyStore.executeSearch(keyword)`），SearchPanel overlay 關閉，`searchResultMode = true`，首頁主內容顯示搜尋結果；路由仍為 `/`。
4. **Given** SearchPanel overlay 已展開且 keyword 非空，**When** 使用者點擊 overlay 內搜尋 icon，**Then** 同上（呼叫 API、overlay 關閉、主內容顯示結果）。
5. **Given** SearchPanel overlay 已展開，**When** keyword 為空時使用者按 Enter 或點擊搜尋 icon，**Then** 不呼叫 API；SearchPanel 保持展開，顯示預設 tags，不顯示 EmptyState。
6. **Given** SearchPanel overlay 展開中，**When** 點擊 X（清除）按鈕，**Then** input keyword 清除、overlay 關閉；首頁主內容**不變**（若已有搜尋結果，繼續顯示搜尋結果；`searchResultMode` 不受影響）。
7. **Given** SearchPanel overlay 展開中且 keyword 有值，**When** 使用者點擊 overlay 內的「Clear」清除按鈕，**Then** input 清空、SearchPanel 保持展開、顯示預設 tags、不呼叫 API。

---

### 使用者情境 4 — 首頁主內容區搜尋結果顯示（優先級：P1）

使用者在 SearchPanel 觸發搜尋（Enter / 搜尋 icon / tag 點擊），搜尋 API 回傳後，
首頁 GamePlatformNav 下方主內容區以三段分區顯示搜尋結果：「遊戲」、「遊戲商」、「遊戲類別」。
各段依 `items.length > 0` 決定是否顯示；無資料的段落完全不渲染（標題與內容均隱藏）。
路由全程停留在 `/`；GamePlatformNav 仍顯示在搜尋結果上方；不更新 URL query string。

**為何優先**：搜尋結果三段 UI 是本功能最核心的呈現，與 002 API 串接直接對應。

**獨立測試**：觸發搜尋（如輸入 `slot` 並按 Enter），確認 Network 有搜尋請求，回傳後三段依結果選擇性顯示於首頁主內容區，GamePlatformNav 在上方可見。

**驗收場景**：

1. **Given** 使用者觸發搜尋且 API 回傳 `games.items.length > 0`，**When** 結果渲染，**Then** 首頁主內容區顯示「遊戲」區塊，遊戲以 2 欄 grid 呈現，每張卡片圖片來自 `game.iconurl`（protocol-relative 補 `https:`；空值 fallback 至 `GameCard-*.png`，**非 no-data.png**），卡片底部顯示截斷的 `game.name`。
2. **Given** 搜尋 API 回傳 `providers.items.length > 0`，**When** 結果渲染，**Then** 首頁主內容區顯示「遊戲商」區塊，每個 provider 以圓形 icon（`provider.iconurl`）與 `provider.name` 呈現；`provider.iconurl` 為空時顯示 `provider.code` 縮寫文字佔位，不用 `no-data.png`；點擊 provider 導覽至 `/search/provider/:code`。
3. **Given** 搜尋 API 回傳 `gameTypes.items.length > 0`，**When** 結果渲染，**Then** 首頁主內容區顯示「遊戲類別」區塊，每個 gameType 以 tag/chip 形式顯示 `gameType.name`；點擊 gameType 導覽至 `/search/game-type/:code`。
4. **Given** 某段 `items.length === 0`，**When** 搜尋 API 回傳，**Then** 該段標題與內容完全不渲染，不出現空白佔位區域。
5. **Given** 搜尋進行中（`isSearching === true`），**When** 等待 API 回應，**Then** 首頁主內容區顯示載入狀態（不顯示上次搜尋結果、不顯示 Discover 輪播）。
6. **Given** 搜尋結果模式下（`searchResultMode === true`），**When** 使用者向下捲動頁面，**Then** 搜尋結果跟隨頁面正常捲動（非 overlay 內部捲動），GamePlatformNav 固定在上方。
7. **Given** 搜尋結果模式下，**When** 使用者點擊遊戲卡片，**Then** 呼叫 `launchGame(game)`：以 `resolveGameLaunchUrl(game, token, frontendOrigin)` 組完整 launchUrl；若 search item 缺少 `url`，先以 `code + providercode` 回查 `LobbyGameList` 取完整 game 資料再 launch；`supportiframe === true` → `sessionStorage` 暫存 + `router.push('/game-frame')`；`supportiframe === false` → `window.location.href = launchUrl`。

---

### 使用者情境 5 — 搜尋無結果（優先級：P1）

使用者觸發搜尋（Enter / 搜尋 icon / tag 點擊），API 回傳三段均為空陣列，
首頁主內容區顯示空狀態：`/assets/images/no-data.png` 圖片與文字「Woo...這裡暫時沒有東西」。
不顯示「遊戲」「遊戲商」「遊戲類別」標題，不顯示空白區塊。

**為何優先**：空結果是常見情境，缺少空狀態會顯示空白主內容，嚴重影響使用者體驗。

**獨立測試**：在 SearchPanel 輸入亂碼字串並按 Enter，確認三段均不顯示，no-data 圖與文字正確出現於首頁主內容區（非 overlay）。

**驗收場景**：

1. **Given** 使用者觸發搜尋且 API 回傳，**When** `games.items`、`providers.items`、`gameTypes.items` 三段 `length` 均為 0，**Then** 首頁主內容區顯示 `/assets/images/no-data.png` 圖片與「Woo...這裡暫時沒有東西」文字，不顯示三段區塊標題；GamePlatformNav 仍保留在上方。
2. **Given** 搜尋無結果狀態，**When** 使用者再次點擊搜尋 icon 展開 SearchPanel 並修改 keyword 後觸發搜尋，**Then** 新搜尋結果（或新的空狀態）取代原有顯示。
3. **Given** 搜尋無結果狀態，**When** 使用者點擊「發現」，**Then** `clearSearchResult()` 被呼叫，搜尋結果消失，回到 mock 輪播預設內容。

---

### 使用者情境 6 — 點擊遊戲商進入遊戲商遊戲列表頁（優先級：P2）

使用者在首頁主內容區搜尋結果「遊戲商」區塊點擊某 provider（如 ATG），
系統導覽至 `/search/provider/ATG`（可帶 `?keyword={keyword}`）。
頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、provider 圓形 icon 與名稱，
以及 store `LobbyGameList` 依 `game.providercode === provider.code` 篩選的遊戲列表（2 欄 grid）。
**不呼叫任何新 API。**

**provider 資料優先順序**：優先取 `store.LobbyGameProviders`（`code === route.params.code`）；
無則取 `store.searchResult?.providers.items` 中對應項目；再無則純文字顯示 `route.params.code`。

**為何優先**：遊戲商點擊後的頁面是此功能第二個核心場景，使用前端篩選可獨立實作不阻塞後端。

**獨立測試**：在首頁搜尋結果中點擊 ATG provider，確認 URL 為 `/search/provider/ATG`，頁面僅顯示 `providercode === 'ATG'` 的遊戲，Network tab 無新 API 請求。

**驗收場景**：

1. **Given** 使用者在首頁主內容區搜尋結果點擊 provider，**When** 導覽完成，**Then** URL 為 `/search/provider/:code`，頁面顯示：O8 Header（含搜尋與語系 icon）、返回按鈕、provider 圓形 icon（空值顯示縮寫文字）與 `provider.name`。
2. **Given** `/search/provider/:code` 頁已載入且 `LobbyGameList` 有對應 provider 的遊戲，**When** 頁面渲染，**Then** 遊戲以 2 欄 grid 顯示，每張卡片圖片來自 `game.iconurl`（fallback 為 `GameCard-*.png`，非 `no-data.png`）。
3. **Given** `LobbyGameList` 中無任何 `game.providercode === provider.code` 的遊戲，**When** 頁面渲染，**Then** 顯示空狀態：`/assets/images/no-data.png` 與「Woo...這裡暫時沒有東西」。
4. **Given** 頁面載入，**When** 使用者觀察 Network tab，**Then** 無任何新 API 請求，遊戲列表來自 store 前端篩選。
5. **Given** 使用者點擊遊戲卡片，**When** 點擊事件觸發，**Then** 呼叫 `launchGame(game)`：以 `resolveGameLaunchUrl(game, token, frontendOrigin)` 組完整 launchUrl（`game.url` 優先，相對路徑補 `VITE_UGS_FRONTEND_ORIGIN`，無 `url` 則 fallback）；`supportiframe === true` → `sessionStorage` 暫存 + `router.push('/game-frame')`；`supportiframe === false` → `window.location.href = launchUrl`。

---

### 使用者情境 7 — 點擊遊戲類別進入遊戲類別遊戲列表頁（優先級：P2）

使用者在首頁主內容區搜尋結果「遊戲類別」區塊點擊某 gameType（如 電子），
系統導覽至 `/search/game-type/:code`（可帶 `?keyword={keyword}`）。
頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、gameType 名稱，
以及 store `LobbyGameList` 依 `GAME_TYPE_CODE_TO_ID` 數字映射（優先）+ `gametypename` fallback 條件篩選的遊戲列表（2 欄 grid）；禁止只用 `String(game.gametype) === gameType.code`（`String(0) !== "Slot"`，永遠不命中）。
**不呼叫任何新 API。**

**為何優先**：遊戲類別列表頁的資料來源（前端篩選）與 provider 頁相同，可同批實作。

**獨立測試**：在首頁搜尋結果點擊「電子」gameType tag，確認 URL 為 `/search/game-type/{code}`，頁面顯示篩選後遊戲，Network tab 無新請求。

**驗收場景**：

1. **Given** 使用者在首頁主內容區搜尋結果點擊 gameType tag，**When** 導覽完成，**Then** URL 為 `/search/game-type/:code`，頁面顯示：O8 Header（含搜尋與語系 icon）、返回按鈕、`gameType.name` 標題。
2. **Given** `/search/game-type/:code` 頁已載入且 `LobbyGameList` 有符合條件的遊戲，**When** 頁面渲染，**Then** 遊戲以 2 欄 grid 顯示，篩選策略（取一符合即包含）：優先使用 `GAME_TYPE_CODE_TO_ID[code]` 對應數字 ID 與 `Number(game.gametype)` 精確匹配（例：`Slot → 0`）；fallback 使用 `game.gametypename === gameTypeName` 或 `game.gametypename === code`；**禁止只使用** `String(game.gametype) === code`。
3. **Given** `LobbyGameList` 中無符合條件的遊戲，**When** 頁面渲染，**Then** 顯示空狀態：`/assets/images/no-data.png` 與「Woo...這裡暫時沒有東西」。
4. **Given** 頁面載入，**When** 使用者觀察 Network tab，**Then** 無任何新 API 請求。
5. **Given** 使用者點擊遊戲卡片，**When** 點擊事件觸發，**Then** 呼叫 `launchGame(game)`：以 `resolveGameLaunchUrl(game, token, frontendOrigin)` 組完整 launchUrl（`game.url` 優先，相對路徑補 `VITE_UGS_FRONTEND_ORIGIN`，無 `url` 則 fallback）；`supportiframe === true` → `sessionStorage` 暫存 + `router.push('/game-frame')`；`supportiframe === false` → `window.location.href = launchUrl`。

---

### 使用者情境 8 — 返回與關閉（優先級：P2）

使用者在遊戲商/遊戲類別頁點擊返回，或在 SearchPanel 點擊 X，各有明確的導覽行為。
keyword 與搜尋結果在適當時機保留，不重新呼叫 API。
SearchPanel overlay 的關閉不影響首頁搜尋結果模式。

**為何優先**：返回行為直接影響導覽體驗，keyword 與結果應在適當時機保留或清除，避免使用者重複操作。

**獨立測試**：從遊戲商頁點返回，確認回到首頁 `/`，首頁主內容區仍顯示搜尋結果，Network 無新請求。

**驗收場景**：

1. **Given** 使用者在 `/search/provider/:code` 點擊返回，**When** 導覽完成（只執行 `router.push('/')`），**Then** 回到 `/`（首頁）；`lobbyStore.searchResultMode` 仍為 `true`，首頁主內容區**直接顯示搜尋結果**；SearchPanel overlay **不自動展開**；**未重新呼叫 API**；若 store 搜尋狀態已遺失（`searchResult === null`），首頁顯示 Discover 預設，不崩潰。
2. **Given** 使用者在 `/search/game-type/:code` 點擊返回，**When** 導覽完成（只執行 `router.push('/')`），**Then** 回到 `/`（首頁）；`lobbyStore.searchResultMode` 仍為 `true`，首頁主內容區**直接顯示搜尋結果**；SearchPanel overlay **不自動展開**；**未重新呼叫 API**；若 store 搜尋狀態已遺失，首頁顯示 Discover 預設，不崩潰。
3. **Given** SearchPanel overlay 展開中（首頁已在搜尋結果模式），**When** 使用者點擊 X 關閉按鈕，**Then** SearchPanel overlay 關閉；input keyword 清除；首頁主內容區的搜尋結果**仍然顯示**（`searchResultMode` 不受 X 關閉影響）。
4. **Given** 使用者使用瀏覽器硬返回至 `/`，**When** 返回完成，**Then** 首頁正常顯示；若 `searchResultMode` 為 `true`，主內容顯示搜尋結果；若為 `false`，顯示 Discover 預設。
5. **Given** 首頁 provider 篩選狀態，**When** 使用者點擊「發現」，**Then** 呼叫 `clearSearchResult()`，清除 `selectedProviderCode`，路由不變（仍為 `/`），回到熱門遊戲與新品推薦 mock 輪播。
6. **Given** 首頁 provider 篩選狀態，**When** 使用者點擊另一個 provider，**Then** 呼叫 `clearSearchResult()`，只更新 `selectedProviderCode`，路由不變，不進入 `/search/provider/:code`。
7. **Given** 首頁搜尋結果模式下，**When** 使用者再次點擊搜尋 icon 展開 SearchPanel，**Then** SearchPanel overlay 展開；首頁主內容區搜尋結果仍顯示在後方（overlay 遮罩覆蓋）；使用者可繼續輸入新 keyword 並再次觸發搜尋。

---

### 邊界條件

- `Lobby.Data.groups` 中 `code === 'Hot'` 或 `code === 'New'` group 不存在，或 `group.games` 為空 → 熱門遊戲與新品推薦 fallback 至 mock 輪播，不崩潰；`O8_Mobile_Lobby_test` 一般會回傳這兩個 group，但仍需此 fallback 保護。
- `Lobby.Data.groups` 中無 `code === 'All'` 或 `All.gameproviders` 為空 → `GamePlatformNav` 只顯示「發現」，首頁不崩潰，mock 輪播正常顯示。
- `All.gameproviders[].iconurl` 為空 → 顯示 `shortname` 或 `code` 縮寫文字佔位，不使用 `no-data.png`，不崩潰。
- keyword 為空字串時，不呼叫搜尋 API，SearchPanel 保持展開，顯示預設 tags，不顯示空狀態圖。
- keyword 非空但三段均空 → 首頁主內容區顯示空狀態（`no-data.png` + 「Woo...這裡暫時沒有東西」）。
- `game.iconurl` 為空或載入失敗時，遊戲卡片 fallback 至 mock 圖片（`GameCard-*.png`），**不使用 `no-data.png`**；兩種 fallback 用途嚴格分離。
- `provider.iconurl` 為空時，顯示 `provider.code` 縮寫文字佔位，不崩潰，不使用 `no-data.png`。
- `iconurl` 為 protocol-relative URL（`//...`）時，補 `https:` 前綴（延用 002 `resolveIconUrl` 邏輯）。
- `gameTypes.items[].gamecount` 只顯示數量，不作為遊戲清單資料來源，不觸發 API。
- 使用者到達 `/search/provider/:code` 或 `/search/game-type/:code` 時若 `LobbyGameList` 為空（無 token 或 lobby API 未完成），顯示空狀態，不崩潰。
- `LobbyGameList` 以 002 `LobbyGameGroup`（已過濾 `isvisible`、已排序 `order`）為來源，不繞過此過濾邏輯。
- `npm run build` 必須在任何實作階段完成後通過，零 TypeScript error。
- 直接瀏覽 `/search/provider/:code` 或 `/search/game-type/:code`（深度連結）時，若 store 尚未初始化，頁面顯示空狀態，不崩潰（fetch 行為只在首頁 onMounted 觸發）。
- 子頁返回後若 `lobbyStore.searchResult` 為 `null`（store 已遺失），`searchResultMode` 自動降回 `false`，首頁顯示 Discover 預設，不崩潰。

---

## 功能需求

### 首頁「發現」預設狀態與 GamePlatformNav

- **FR-026**：`GamePlatformNav` 第一個項目必須固定為「發現」（前端插入，非 API 資料）；固定資料：`code: 'Discover'`、`name: 'Discover'`（僅作 data key）、`iconurl: '/assets/images/icons/discover.png'`；**顯示文字必須使用 `t('home.navigation.discover')` i18n，不得直接顯示 `item.name` 字串「Discover」**（否則 zh-TW 使用者將看到英文字，違反 constitution §七.12）；判斷方式：`item.isDiscover ? t('home.navigation.discover') : item.name`。
- **FR-027**：首頁初始載入時「發現」必須為預設選中項目；點擊「發現」時呼叫 `clearSearchResult()`、清除 `selectedProviderCode`，回到熱門遊戲與新品推薦 mock 輪播狀態。
- **FR-028**：「發現」選中時，首頁必須顯示「熱門遊戲」與「新品推薦」兩個輪播區塊。各區塊優先使用 API group 資料：Hot 輪播來自 `groups.find(g => g.code === 'Hot')?.games ?? []`，New 輪播來自 `groups.find(g => g.code === 'New')?.games ?? []`；有 API 資料時，遊戲卡片使用 `resolveGameImagePath(game.iconurl, i)` 顯示圖片，點擊呼叫 `launchGame(game, token, frontendOrigin, router.push)`；無 API 資料（group 不存在或 `games` 為空）時，fallback 至 mock 輪播（`carouselPages`，各 3 頁 × 4 張卡片），mock 卡片不套用 `launchGame`（無真實 `Game` 物件）。
- **FR-029**：Hot/New group 已存在於 `O8_Mobile_Lobby_test` API 回傳；但首頁熱門遊戲與新品推薦仍需 fallback 機制：Hot/New group 不存在或 `games` 為空時，fallback 至 mock 輪播（`carouselPages`），確保首頁「發現」狀態不空白或 crash；fallback 時 mock 卡片不套用 `launchGame`（無真實 `Game` 物件）。
- **FR-030**：熱門遊戲優先使用 `groups.find(g => g.code === 'Hot')?.games`，新品推薦優先使用 `groups.find(g => g.code === 'New')?.games`；Hot/New group 不存在時 fallback mock（見 FR-029）；**禁止 non-null assertion**：必須使用 `?.games ?? []`，不得使用 `groups.find(g => g.code === 'Hot')!`。
- **FR-031**：`GamePlatformNav` 除「發現」外的 provider 項目必須來自 `Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders ?? []`；`All` group 不存在或 `gameproviders` 為空時，清單只顯示「發現」，不崩潰；禁止 `groups.find(g => g.code === 'All')!`。
- **FR-032**：`GamePlatformNav` provider 項目顯示規則：圖示使用 `gameproviders[].iconurl`（空值顯示 `shortname` / `code` 縮寫文字，非 `no-data.png`）；名稱優先使用 `shortname`，無則 `name`，再無則 `code`。
- **FR-033**：首頁點擊 `GamePlatformNav` provider 後，以 `selectedProviderCode = provider.code` 更新頁面內部狀態，並呼叫 `lobbyStore.clearSearchResult()`；遊戲列表以 `LobbyGameList.filter(g => g.providercode === selectedProviderCode)` 前端篩選，以 2 欄 grid 顯示；路由仍為 `/`，不呼叫新 API，不導向 `/search/provider/:code`；GamePlatformNav 仍顯示在上方。
- **FR-034**：首頁「發現」mock 輪播資料不影響搜尋結果、遊戲商頁、遊戲類別頁的 API/store 資料邏輯；兩套資料來源完全分離。
- **FR-038**：`GamePlatformNav` 在首頁 `/` 的所有狀態（Discover 預設、provider 篩選、搜尋結果模式、SearchPanel 展開）下必須保留可見；任何原因均不得隱藏或移除整條 GamePlatformNav bar。

### SearchPanel 搜尋輸入 UI

- **FR-001**：SearchPanel overlay 必須顯示搜尋輸入框（i18n placeholder：遊戲、遊戲商、遊戲類別）、搜尋 icon、清除（X）按鈕、預設 tags；**不顯示搜尋結果**。X 按鈕點擊後：清除 input local keyword（可同步 `lobbyStore.searchKeyword = ''`）、SearchPanel overlay 關閉；**不清除首頁搜尋結果**（`searchResultMode` 不受影響）；路由仍為 `/`。
- **FR-035**：SearchPanel 搜尋觸發規則（三種事件才呼叫 API）：
  1. **Enter 鍵**：若 keyword.trim() 非空 → 呼叫 `lobbyStore.executeSearch(keyword)` → 關閉 SearchPanel → 首頁顯示結果
  2. **搜尋 icon 點擊**：若 keyword.trim() 非空 → 同上
  3. **tag 點擊**：將 keyword 設為 `tag.searchValue` → 呼叫 `lobbyStore.executeSearch(tag.searchValue)` → 關閉 SearchPanel → 首頁顯示結果
  - **禁止**：input `change`/`input` 事件自動呼叫 API；debounce watcher 自動呼叫 API；keyword 為空時呼叫 API。
- **FR-036**：SearchTag 結構定義：`{ id: string; label: string; searchValue: string }`。`label` 為顯示文字（可使用 i18n 或直接字串）；`searchValue` 為呼叫 API 時傳入的關鍵字（固定英文或特定字串，不受 i18n 影響）。範例：`{ id: 'slots', label: t('home.search.tags.slots'), searchValue: 'Slot' }`。
- **FR-037**：SearchPanel 的「Clear」清除按鈕行為：清空 input local keyword（可同步 `lobbyStore.searchKeyword = ''`）；SearchPanel 保持展開；顯示預設 tags；**不呼叫 API**；**不清除首頁搜尋結果**（`searchResultMode` 不受影響）。
- **FR-006**：keyword 為空字串時，不顯示搜尋結果，不顯示空狀態圖，顯示預設 tags。

### 首頁搜尋結果主內容區

- **FR-039**：首頁 `/` 的主內容區依以下優先順序顯示內容（`GamePlatformNav` 全程固定在上方）：
  1. `lobbyStore.searchResultMode === true` → 顯示搜尋結果三段區塊（FR-002~FR-007）；不顯示 Discover 輪播、不顯示 provider 遊戲列表
  2. `selectedProviderCode !== null` → 顯示 provider 遊戲列表（FR-033）
  3. 其他 → Discover 預設 mock 輪播（FR-028）
- **FR-002**：「遊戲」區塊必須依 `games.items.length > 0` 決定顯示；有資料時以 2 欄 grid 呈現遊戲卡片，圖片來自 `game.iconurl`（空值 fallback `GameCard-*.png`，protocol-relative 補 `https:`），卡片底部顯示截斷 `game.name`；點擊卡片依 002 `shouldOpenByRedirect(game)` 決定啟動方式。
- **FR-003**：「遊戲商」區塊必須依 `providers.items.length > 0` 決定顯示；有資料時，每個 provider 以 `resolveProviderDisplay(provider.code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? [])` 取得顯示資料（icon、name），優先順序：`LobbyGameProviders` > `searchResult.providers.items` > code 文字 fallback；`iconPath` 為空時顯示縮寫文字佔位，不使用 `no-data.png`；點擊 provider 導覽至 `/search/provider/:code`（可帶 `?keyword={lobbyStore.searchKeyword}`）。
- **FR-004**：「遊戲類別」區塊必須依 `gameTypes.items.length > 0` 決定顯示；有資料時以 tag/chip 形式顯示 `gameType.name`；點擊 gameType 導覽至 `/search/game-type/:code`（可帶 `?keyword={lobbyStore.searchKeyword}`）；`gameType.gamecount` 僅作數量提示，不觸發 API。
- **FR-005**：當三段 `items` 均為空（且 `searchResultMode === true`）時，必須顯示 `EmptyState`（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）；不顯示三段標題或空白區域。
- **FR-007**：`isSearching === true` 時首頁主內容區顯示載入狀態，不顯示上次搜尋結果。
- **FR-040**：`lobbyStore.executeSearch(keyword: string)` action 實作：若 keyword 為空，不執行；設 `searchKeyword = keyword`；呼叫 `searchLobby()`；搜尋完成後設 `searchResultMode = true`。`lobbyStore.clearSearchResult()` action：清除 `searchResult = null`、`searchResultMode = false`、`searchKeyword = ''`（或只清除 mode 保留 keyword，依產品決定）。

### API base、Token 保存、遊戲啟動

- **FR-041**：前端呼叫 UGS Lobby API 時，base path 必須為 `/api`（不得使用 `/ugs-api`）。`vite.config.ts` dev proxy 代理 `/api` → `https://frontendwebsite.ugsdev.com`。最終 Network request 必須為 `/api/lobby/mobile?token=...`、`/api/lobby/mobile/search?...`，不得出現 `/ugs-api/api/...`。
- **FR-042**：`VITE_UGS_FRONTEND_ORIGIN` 環境變數用於補齊 `game.url` 相對路徑（`.env.development` 設為 `https://frontendwebsite.ugsdev.com`）；`VITE_UGS_API_BASE` 用於 axios baseURL；兩者均不得硬編碼於 `src/` runtime code。
- **FR-043**：token 來源優先順序：URL `?token=` > `sessionStorage` 有效 token > 無 token（不呼叫 API）。URL token 與 sessionStorage token 均不存在時，首頁正常顯示 Discover mock 輪播，不崩潰。token 不得存於 `localStorage`。
- **FR-044**：首次帶 URL token 初始化 API 成功後：① 以 `saveTokenToSession(token)` 存入 `sessionStorage`（TTL 24 小時）；② 以 `router.replace` 或 `window.history.replaceState` 移除 URL `token` query（保留其他 query 參數，不觸發頁面重整）。
- **FR-045**：`sessionStorage` token 過期時，呼叫 `clearTokenFromSession()` 清除；不呼叫 lobby API；首頁顯示 Discover mock，不崩潰。
- **FR-046**：新增 `src/utils/tokenSession.ts` — 匯出 `saveTokenToSession(token: string): void`、`getTokenFromSession(): string | null`（過期則清除並回傳 `null`）、`clearTokenFromSession(): void`；常數 `TOKEN_STORAGE_KEY = 'ugs_lobby_token'`、`TOKEN_EXPIRE_MS = 24 * 60 * 60 * 1000`；儲存結構 `{ token: string; expiresAt: number }`。
- **FR-047**：新增 `src/utils/gameLaunch.ts` — 匯出 `resolveGameLaunchUrl(game: Game, token: string, frontendOrigin: string): string`。
- **FR-048**：`resolveGameLaunchUrl` 解析規則（依序）：① `game.url` 存在且為相對路徑（`/gamelauncher?...`）→ `frontendOrigin + game.url`；② `game.url` 為 `http://` 或 `https://` 開頭 → 直接使用；③ `game.url` 為 `//` 開頭 → 補 `https:`；④ `game.url` 含 `{TOKEN}` placeholder → 替換為當前 token；⑤ `game.url` 不存在 → fallback：`frontendOrigin + /gamelauncher?token=&gpcode=providercode&gcode=code&fromlobby=true`。
- **FR-049**：完整 launchUrl 不得出現在 route query 上（避免 token 暴露）。
- **FR-050**：`game.supportiframe === true` 時：`sessionStorage.setItem('ugs_game_launch_url', launchUrl)` → `router.push('/game-frame')`；不整頁跳外部。
- **FR-051**：`game.supportiframe === false` 時：`window.location.href = launchUrl`；不開 iframe、不導向 `/game-frame`。
- **FR-052**：新增路由 `/game-frame` → `GameFrameView.vue`（lazy import）。
- **FR-053**：`GameFrameView.vue` 頁面結構：header（左上角返回首頁按鈕，i18n `common.actions.back` 或 `common.actions.backToHome`）+ 全版 iframe（`width: 100%`、`height: calc(100vh - headerHeight)`、`border: 0`）。返回首頁：`router.push('/')`，可同時 `sessionStorage.removeItem('ugs_game_launch_url')`。
- **FR-054**：`GameFrameView` iframe `src` 來自 `sessionStorage.getItem('ugs_game_launch_url')`；無 launchUrl 時顯示 `<EmptyState />` + 返回首頁按鈕，不崩潰；不直接在 route query 攜帶 launchUrl。
- **FR-055**：`GameFrameView` header 不顯示玩家資訊、餘額、幣別；不破壞既有 `AppHeader.vue`（若 AppHeader 不適用，可新增簡單 `GameFrameHeader` 元件）。
- **FR-056**：首頁 provider 篩選遊戲列表、首頁搜尋結果 games 區塊、`ProviderGamesView`、`GameTypeGamesView` 的 API 遊戲卡片點擊，必須使用同一套 `launchGame(game)` helper（呼叫 `resolveGameLaunchUrl` 再依 `supportiframe` 分流）。
- **FR-057**：搜尋結果 game item 若無 `url` 欄位，必須先以 `game.code + game.providercode` 在 `lobbyStore.LobbyGameList` 中查找完整 game 資料，取得後再呼叫 `launchGame()`。
- **FR-058**：Lobby API 呼叫一律使用 `O8_Mobile_Lobby_test` 作為 lobby path：`fetchLobbyData` 預設參數與 `executeSearch` 中的 `searchLobby` 呼叫均使用 `'O8_Mobile_Lobby_test'`；最終 Network request 為 `/api/lobby/O8_Mobile_Lobby_test?token=...`（初始化）與 `/api/lobby/O8_Mobile_Lobby_test/search?...`（搜尋）；不得出現 `/api/lobby/mobile`。
- **FR-059**：`LobbyGameList` computed 改為只取 `groups.find(g => g.code === 'All')?.games ?? []`（All group 需先過濾 `isvisible`）；禁止 non-null assertion；避免 Hot/New 遊戲與 All 遊戲在 provider 篩選或遊戲類別篩選結果中重複出現；`All` group 不存在時回傳空陣列，ProviderGamesView 與 GameTypeGamesView 顯示 EmptyState，不崩潰。
- **FR-060**：首頁「熱門遊戲」與「新品推薦」區塊顯示 API 遊戲時，遊戲卡片點擊必須呼叫 `launchGame(game, token, frontendOrigin, router.push)`（token 從 `lobbyStore.token ?? getTokenFromSession()` 取得，`frontendOrigin` 從 `import.meta.env.VITE_UGS_FRONTEND_ORIGIN` 取得）；有 API 資料時使用獨立輪播區塊渲染（不經 `<GameSection>` 以支援 `@click`）；mock fallback 時仍使用 `<GameSection>`，不套用 `launchGame`。
- **FR-061**：`GameSection.vue` 輪播過場效果由淡入淡出（`<Transition name="fade">`）改為平滑橫向滑動（slide）；以 CSS `transform: translateX` 搭配 `transition` 實現；保留自動播放（5 秒 setInterval）與觸控滑動手勢（touchstart/touchmove/touchend）；不修改 `GameSection.vue` 的 props 介面及其他核心視覺（標題、圖示、進度條、grid 結構）。

### 遊戲商遊戲列表頁（`/search/provider/:code`）

- **FR-009**：頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、provider 圓形 icon 與名稱；使用 `resolveProviderDisplay(route.params.code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? [])` 取得 `{ name, iconPath }`；`iconPath` 為空時顯示縮寫文字，不使用 `no-data.png`。
- **FR-010**：遊戲列表必須從 store `LobbyGameList` 依 `game.providercode === route.params.code` 前端篩選，**不呼叫任何新 API**，不新增 `providerCode` 或其他 API 文件未定義的 query 參數。
- **FR-011**：遊戲列表以 2 欄 grid 呈現，卡片圖片來自 `game.iconurl`（處理邏輯同 FR-002）；點擊卡片依 002 `shouldOpenByRedirect(game)` 決定啟動方式。
- **FR-012**：`LobbyGameList` 中無對應 providercode 遊戲時，顯示 `EmptyState`（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）。
- **FR-013**：返回按鈕點擊後，執行 `router.push('/')`；返回後 `lobbyStore.searchResultMode` 仍為 `true`，首頁主內容區直接顯示搜尋結果；SearchPanel overlay **不自動展開**；**不重新呼叫 API**；若 `searchResult` 為 `null`，首頁回到 Discover 預設，不崩潰。

### 遊戲類別遊戲列表頁（`/search/game-type/:code`）

- **FR-014**：頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、`gameType.name` 標題；gameType 資料取 `store.searchResult?.gameTypes.items` 中 `code === route.params.code` 的項目；無對應資料時以 `route.params.code` 作文字顯示。
- **FR-015**：遊戲列表必須從 store `LobbyGameList` 前端篩選，篩選策略（雙條件，取一符合即包含）：**第一優先**：透過 `GAME_TYPE_CODE_TO_ID` 映射取得數字 ID（例：`Slot → 0`），以 `Number(game.gametype) === mappedId` 精確匹配；**Fallback**：`game.gametypename === gameTypeName` 或 `game.gametypename === code`；**禁止只使用** `String(game.gametype) === code`（`String(0) !== "Slot"`，永遠不命中）；**不呼叫任何新 API**，不新增未定義 query 參數。
- **FR-016**：遊戲列表以 2 欄 grid 呈現，卡片圖片來自 `game.iconurl`（處理邏輯同 FR-002）；點擊卡片依 002 `shouldOpenByRedirect(game)` 決定啟動方式。
- **FR-017**：`LobbyGameList` 中無符合條件遊戲時，顯示 `EmptyState`（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）。
- **FR-018**：返回按鈕點擊後，執行 `router.push('/')`；返回後 `lobbyStore.searchResultMode` 仍為 `true`，首頁主內容區直接顯示搜尋結果；SearchPanel overlay **不自動展開**；**不重新呼叫 API**；若 `searchResult` 為 `null`，首頁回到 Discover 預設，不崩潰。（同 FR-013）

### 共用空狀態元件

- **FR-019**：系統必須提供共用 `EmptyState` 元件，props：`imageSrc`（預設 `/assets/images/no-data.png`）與 `message`（預設「Woo...這裡暫時沒有東西」）；`no-data.png` 透過此元件使用，不直接硬編碼於各頁面，**絕對不用於遊戲卡片圖片 fallback 或 provider icon fallback**。

### 全程限制

- **FR-020**：不修改 `GameCard.vue`、`GameSection.vue`、`HeroBanner.vue` 的 props 或核心視覺；若需 adapter 函式，新增獨立 function，不破壞既有 GameCard props 型別。
- **FR-021**：不新增玩家資訊、餘額、幣別相關 UI。
- **FR-022**：不新增 API 文件未定義的 endpoint 或 query 參數（`providerCode`、`gameTypeCode` 等）。
- **FR-023**：`LobbyGameList` 以 002 `LobbyGameGroup`（已過濾 `isvisible`、已排序 `order`）為資料來源，不繞過 002 的過濾排序邏輯。
- **FR-024**：不破壞 001 O8 手機版 UI Demo 的任何既有視覺與互動（首頁輪播、語系切換、浮動按鈕等）。
- **FR-025**：`resolveIconUrl` 邏輯（protocol-relative `//` 補 `https:`）必須提取為共用 utility，供搜尋頁、遊戲商頁、遊戲類別頁共用，不在各元件重複貼上。

---

## 禁止事項

1. **不新增 API query 參數**：禁止新增 `providerCode`、`gameTypeCode` 等 API 文件未定義的 query 參數呼叫 UGS API。
2. **不誤用 gamecount**：禁止將 `gameTypes.items[].gamecount` 當作已取得的遊戲清單，`gamecount` 只是數量欄位。
3. **不誤用 no-data.png 作遊戲圖片 fallback**：遊戲卡片圖片 fallback 只能使用 `GameCard-*.png`；`no-data.png` 僅限空狀態元件使用。
4. **不誤用 no-data.png 作 provider icon fallback**：GamePlatformNav provider icon、搜尋結果 provider icon 空值時均顯示縮寫文字，不使用 `no-data.png`。
5. **不破壞 001 首頁 UI Demo**：001 O8 手機版首頁輪播、語系切換、浮動按鈕等既有互動，在本功能完成後必須維持正常。
6. **不破壞 002 已完成功能**：002 API 串接、搜尋 API、遊戲啟動規格（`shouldOpenByRedirect`）不得被覆蓋或移除。
7. **不重寫 HomeView.vue**：若 HomeView.vue 需整合搜尋入口，應以最小改動方式處理，不整體重構。
8. **不修改核心元件視覺**：`GameCard.vue`、`GameSection.vue`、`HeroBanner.vue` 的 props 介面與核心視覺樣式不得修改。
9. **不新增玩家/餘額/幣別 UI**：`Player`、`Balance`、`CurrencySymbol` 沿用 002 規則，存 store 不接 UI。
10. **不硬編碼 token 或 domain**：`src/` runtime code 禁止出現硬編碼 token、`https://frontendwebsite.ugsdev.com` 或任何 UGS domain；API base 由 `VITE_UGS_API_BASE` 環境變數控制。
11. **不把「發現」當成 API provider**：「發現」是前端固定插入項目，禁止期待 API 回傳 `code === 'Discover'` 的 group 或 provider。
12. **不從 Hot / New group 取 GamePlatformNav provider**：現階段 `GamePlatformNav` provider 清單只使用 `All.gameproviders`。
13. **不使用 non-null assertion 存取 group**：禁止使用 `groups.find(g => g.code === 'All')!`、`groups.find(g => g.code === 'Hot')!`、`groups.find(g => g.code === 'New')!`；必須以 optional chaining / nullish coalescing 防止 crash。
14. **不在 All group 不存在時讓畫面 crash**：`All` group 缺失時 `GamePlatformNav` 只顯示「發現」，首頁繼續正常運作。
15. **Hot / New group 存在但仍需 fallback**：`O8_Mobile_Lobby_test` 已回傳 Hot/New group；熱門遊戲與新品推薦優先使用 API 資料，但 group 不存在或 games 為空時必須 fallback 至 mock 輪播；禁止 non-null assertion（`groups.find(g => g.code === 'Hot')!`）。
16. **不導向錯誤路由**：首頁 GamePlatformNav provider 點擊只在首頁內部篩選（路由仍 `/`），不導向 `/search/provider/:code`；此路由只供搜尋結果中的 provider 點擊使用。
17. **不在搜尋結果模式下隱藏 GamePlatformNav**：`searchResultMode === true` 時 GamePlatformNav 必須仍可見。
18. **不在 provider 篩選狀態下隱藏 GamePlatformNav**：`selectedProviderCode` 有值時 GamePlatformNav 必須仍可見。
19. **不因 SearchPanel 展開而隱藏 GamePlatformNav**：SearchPanel overlay 展開時 GamePlatformNav 仍保留（overlay 覆蓋在上方，但 bar 本身不被移除）。
20. **不使用 debounce 或 input 事件自動呼叫搜尋 API**：搜尋 API 只由 Enter / 搜尋 icon 點擊 / tag 點擊觸發；input change 事件不直接呼叫 API。
21. **不在 SearchPanel 內顯示搜尋結果**：SearchPanel overlay 只承擔輸入與觸發；搜尋結果顯示在首頁主內容區；禁止在 SearchPanel 內加入 games/providers/gameTypes 三段結果 UI。
22. **不讓 X 關閉按鈕清除首頁搜尋結果**：X 只關閉 SearchPanel overlay；若需清除首頁搜尋結果，需明確呼叫 `clearSearchResult()` action。
23. **不新增 `/search?keyword=...` 搜尋結果頁**：`/search` 只是 stub，不承接搜尋結果 UI。
24. **不讓子頁返回時展開 SearchPanel**：ProviderGamesView / GameTypeGamesView 返回後只顯示首頁主內容區搜尋結果，SearchPanel overlay 不自動展開。
25. **不得再使用 `/ugs-api` 作為前端 API path**：禁止讓初始化 API request 出現 `/ugs-api/api/lobby/mobile`；任何呼叫均改用 `/api` base path。
26. **不得把 token 長期留在 URL**：初始化成功後必須以 `router.replace` 或 `window.history.replaceState` 移除 URL token query，不得保留。
27. **不得把 token 存在 `localStorage`**：token 只允許存於 `sessionStorage`（短期），不得使用 `localStorage`（長期）。
28. **不得把完整 launchUrl 放在 route query**：launchUrl 含 token，放入 route query 會暴露 token；必須以 `sessionStorage` 傳遞至 `GameFrameView`。
29. **不得忽略 `game.url` 改用手刻 URL**：只有在 `game.url` 不存在時才 fallback 自行組 URL；若 `game.url` 存在，必須以其為主。
30. **`supportiframe === false` 不得開 iframe**：必須使用 `window.location.href = launchUrl` 整頁導向外部。
31. **`supportiframe === true` 不得直接整頁跳外部**：必須以 `/game-frame` iframe 路由啟動，不得略過 iframe。
32. **不得讓 `GameFrameView` 顯示玩家資訊、餘額或幣別**：`Player`、`Balance`、`CurrencySymbol` 一律不接 UI。
33. **不得讓 `https://frontendwebsite.ugsdev.com` 出現在 `src/` runtime code**：必須從 `import.meta.env.VITE_UGS_FRONTEND_ORIGIN` 讀取。

---

## 主要資料實體

- **SearchResult（延用 002）**：`games`、`providers`、`gameTypes` 三段，每段為 `PaginationResult<T>`（`items[]`、`offset`、`totalCount`、`hasMore`）。
- **GameSearchItem（延用 002）**：`id`、`name`、`code`、`providercode`、`iconurl`。
- **ProviderSearchItem（延用 002）**：`code`、`name`、`shortname`、`iconurl`。
- **GameTypeSearchItem（延用 002）**：`code`、`name`、`gamecount`（僅數量）。
- **Game（延用 002）**：`id`、`name`、`code`、`providercode`、`iconurl`、`supportiframe`、`gametypename`、`gametype` 等；用於遊戲商頁與遊戲類別頁前端篩選資料來源，亦用於首頁 provider 篩選。
- **GameProvider（延用 002）**：`code`、`name`、`shortname`、`iconurl`；來源為 `All.gameproviders`，用於 GamePlatformNav 項目。
- **DiscoverItem（前端固定）**：`{ code: 'Discover', name: 'Discover', shortname: 'Discover', iconurl: '/assets/images/icons/discover.png' }`。
- **EmptyState**：共用 UI 元件，props `imageSrc: string`（預設 `/assets/images/no-data.png`）、`message: string`（預設「Woo...這裡暫時沒有東西」）。
- **SearchTag（更新）**：`{ id: string; label: string; searchValue: string }`；`label` 為顯示文字（可 i18n），`searchValue` 為傳給 API 的搜尋關鍵字。

---

## 成功標準

### 可量測成果

- **SC-001**：首頁初始進入 `/` 時，「發現」為 `GamePlatformNav` 第一個且預設選中項目，100% 可驗證（目測）。
- **SC-002**：「發現」icon 使用 `/assets/images/icons/discover.png`，100% 可驗證（目測 + DevTools）。
- **SC-003**：`GamePlatformNav` 除「發現」外的 provider 來自 `All.gameproviders`；provider 名稱優先顯示 `shortname`，icon 使用 `gameproviders[].iconurl`，空值顯示縮寫文字而非 `no-data.png`，100% 可驗證（目測）。
- **SC-004**：首頁「發現」狀態顯示熱門遊戲與新品推薦兩個輪播區塊；有 API 資料時（Hot/New group 存在且 games 非空），輪播顯示 API 遊戲卡片（圖片來自 `game.iconurl`，fallback `GameCard-*.png`），點擊可啟動遊戲；無 API 資料時 fallback 至 mock 輪播（各 3 頁 × 4 張 `GameCard-*.png`），100% 可驗證（目測）。
- **SC-005**：即使 API 只回傳 `All` group 且無 `Hot` / `New`，首頁「發現」mock 輪播仍正常顯示，不空白、不崩潰，100% 可驗證。
- **SC-006**：即使 `All.gameproviders` 為空，`GamePlatformNav` 仍顯示「發現」且首頁不崩潰，100% 可驗證。
- **SC-007**：首頁點擊 provider 後路由仍為 `/`，遊戲列表依 `selectedProviderCode` 前端篩選，Network tab 無新 API 請求，GamePlatformNav 仍顯示在上方，100% 可驗證。
- **SC-008a**：SearchPanel overlay 展開時，使用者輸入 keyword 不觸發 API（Network tab 無請求），100% 可驗證（DevTools Network）。
- **SC-008b**：按 Enter 或點擊搜尋 icon 才觸發 API；搜尋 API 被呼叫後 SearchPanel overlay 關閉，100% 可驗證（Network tab + 目測）。
- **SC-008c**：tag 點擊觸發搜尋 API（以 `searchValue` 為關鍵字），SearchPanel overlay 關閉，100% 可驗證。
- **SC-009**：搜尋結果顯示在首頁 GamePlatformNav **下方主內容區**（非 SearchPanel overlay 內），三段依 `items.length > 0` 選擇性顯示，100% 可驗證（目測）。
- **SC-010**：三段均空時，首頁主內容區顯示 `no-data.png` 與「Woo...這裡暫時沒有東西」，不顯示空白區塊，100% 可驗證（目測）。
- **SC-011**：`no-data.png` 不出現在遊戲卡片 fallback 或任何 provider icon fallback；遊戲卡片圖片 fallback 僅使用 `GameCard-*.png`，100% 可驗證（目測）。
- **SC-012**：搜尋結果模式下 GamePlatformNav 仍可見；點擊 GamePlatformNav provider 清除 `searchResultMode`，顯示 provider 遊戲列表，100% 可驗證（目測）。
- **SC-013**：搜尋結果中點擊 provider 才導向 `/search/provider/:code`；搜尋結果中點擊 gameType 才導向 `/search/game-type/:code`；首頁 GamePlatformNav provider 點擊留在 `/`，100% 可驗證（URL 觀察）。
- **SC-014**：從子頁（`/search/provider/:code` 或 `/search/game-type/:code`）點擊返回後，回到 `/`，首頁主內容區**直接顯示搜尋結果**；SearchPanel overlay **不自動展開**；Network tab **無新請求**；100% 可驗證（目測 + Network tab）。
- **SC-015**：001 O8 手機版 UI Demo 全部互動（首頁輪播、語系切換、浮動按鈕）在本功能完成後維持正常，100% 可驗證（手動測試）。
- **SC-016**：`npm run build` 零 TypeScript error，100% 可驗證。
- **SC-017**：`src/` 目錄不出現新的 domain 硬編碼、未定義 API 端點或未定義 query 參數，100% 可驗證（grep 檢查）。
- **SC-018**：X 關閉按鈕點擊後 SearchPanel overlay 關閉；若首頁已在搜尋結果模式，主內容區搜尋結果**仍然顯示**（X 不清除 searchResultMode），100% 可驗證（目測）。
- **SC-019**：首次帶 token 開啟首頁，初始化 API Network request URL 為 `/api/lobby/O8_Mobile_Lobby_test?token=xxx`（不含 `/ugs-api`、不含 `/mobile`），100% 可驗證（DevTools Network tab）。
- **SC-020**：Network tab 不出現 `/ugs-api/api/lobby/mobile`，100% 可驗證（DevTools grep）。
- **SC-021**：初始化 API 成功後，瀏覽器網址列的 `token` query 被移除（其他 query 保留），且不觸發頁面重整，100% 可驗證（目測）。
- **SC-022**：token 被保存至 `sessionStorage`（`ugs_lobby_token` key），且具有 `expiresAt` 欄位（24 小時後到期），100% 可驗證（DevTools Application > Session Storage）。
- **SC-023**：URL 無 token 但 `sessionStorage` token 有效時，重整頁面仍可正常初始化 lobby API，100% 可驗證（手動測試：移除 URL token 後重整）。
- **SC-024**：`sessionStorage` token 過期或不存在，且 URL 無 token 時，不呼叫 lobby API，首頁顯示 Discover mock 輪播，不崩潰，100% 可驗證（手動清除 sessionStorage 後重整）。
- **SC-025**：點擊 API 遊戲卡片時，launchUrl 以 `game.url` 為基礎組成；若 `game.url` 為 `/gamelauncher?...`，最終 URL 為 `{VITE_UGS_FRONTEND_ORIGIN}/gamelauncher?...`，100% 可驗證（DevTools debugger）。
- **SC-026**：`game.url` 不存在時，fallback 組成的 launchUrl 不崩潰，或顯示錯誤提示，100% 可驗證。
- **SC-027**：`game.supportiframe === true` 時，點擊遊戲卡片後進入 `/game-frame` 路由（URL 確認），100% 可驗證。
- **SC-028**：`/game-frame` 頁面頂部有 header，左上角有返回首頁按鈕；iframe 佔滿剩餘畫面高度，`border: 0`，100% 可驗證（目測）。
- **SC-029**：`game.supportiframe === false` 時，點擊遊戲卡片後以 `window.location.href` 直接導向外部（不進入 `/game-frame`），100% 可驗證（目測 + Network tab）。
- **SC-030**：完整 launchUrl 不出現在任何 route query string 上（URL bar 觀察），100% 可驗證。
- **SC-031**：`sessionStorage` 的 `ugs_game_launch_url` 在進入 `/game-frame` 前被設定，離開後可被清除，100% 可驗證（DevTools Application > Session Storage）。
- **SC-032**：`GameFrameView` 無 launchUrl 時顯示 EmptyState + 返回首頁按鈕，不崩潰（直接訪問 `/game-frame` 時），100% 可驗證。
- **SC-033**：`src/` 目錄不出現 `https://frontendwebsite.ugsdev.com` 硬編碼字串（`grep -R "frontendwebsite.ugsdev.com" src` 無輸出），100% 可驗證。
- **SC-034**：`src/` 目錄不出現 `/ugs-api` 字串（`grep -R "ugs-api" src` 無輸出），100% 可驗證。
- **SC-035**：首頁三種主內容狀態（Discover mock、provider 篩選、搜尋結果）在所有新功能加入後仍正常運作；GamePlatformNav 全程可見，100% 可驗證（手動回歸測試）。
- **SC-036**：帶 token 開啟首頁、lobby API 成功後，首頁「熱門遊戲」與「新品推薦」輪播顯示 API 遊戲卡片（非 mock `GameCard-*.png`）；點擊遊戲卡片依 `supportiframe` 進入 `/game-frame` 或整頁跳外部，100% 可驗證（目測 + Network tab）。
- **SC-037**：搜尋 API Network request URL 為 `/api/lobby/O8_Mobile_Lobby_test/search?...`（不含 `/mobile`、不含 `/ugs-api`），100% 可驗證（DevTools Network tab）。
- **SC-038**：首頁輪播換頁過場為平滑橫向滑動（slide）效果，不再是淡入淡出（fade）；自動播放（5 秒）與觸控滑動手勢仍正常運作，100% 可驗證（目測）。

---

## 假設前提

- 002 Phase 1–4 已完成：搜尋 API 串接（`LobbyApi.searchLobby`）、store `searchResult`/`isSearching`/`searchNextPage`、`LobbyGameList` 依 `isvisible` 過濾與 `order` 排序已就緒。
- `LobbyGameList` 在使用者帶 token 開啟首頁後由 `fetchLobbyData` 填入；若無 token，`LobbyGameList` 為空，遊戲商頁與遊戲類別頁顯示空狀態；首頁「發現」mock 輪播不依賴 `LobbyGameList`，token 有無均可顯示。
- 搜尋入口（搜尋 icon 點擊）目前在首頁 `GamePlatformNav` 區域；003 將此點擊改為在首頁展開 SearchPanel overlay（路由仍為 `/`）；使用者按 Enter / 點搜尋 icon / 點 tag 後，`lobbyStore.executeSearch(keyword)` 被呼叫，SearchPanel 關閉，結果顯示在首頁主內容區；**不導覽至 `/search`**；`/search` 路由保留 stub 元件避免 deep link 404；點擊搜尋結果 provider/gameType 則導覽至對應子頁。
- `resolveIconUrl` 函式（002 實作於 `HomeView.vue`）在 003 提取為共用 utility（`src/utils/url.ts`），供所有新增頁面共用。
- 001 UI Demo 的 mock 資料（`carouselPages`）保留不刪除，作為無 API 資料時的 fallback；003 mock 輪播（熱門遊戲、新品推薦）另行定義於 HomeView 或 store，不與搜尋 API 資料混用。
- `Game` 型別含 `gametypename: string` 與 `gametype: number | string` 欄位（依 002 API 文件）。
- 遊戲類別頁的 gameType 資料（name/code）從搜尋結果 store 傳遞至子頁，無需額外 API。
- `O8_Mobile_Lobby_test` API 回傳的 `Lobby.Data.groups` 包含 `Hot`、`New`、`All` 三個群組；Hot/New group 仍需 fallback 機制（group 不存在或 `games` 為空時回到 mock 輪播）；`LobbyGameList` 只取 `All.games`，避免 Hot/New 遊戲在篩選結果中重複。
- `.env.development` 已設定 `VITE_UGS_FRONTEND_ORIGIN=https://frontendwebsite.ugsdev.com`；`VITE_UGS_API_BASE` 設為空或 `/`，使 axios 請求最終為 `/api/lobby/O8_Mobile_Lobby_test?...`（初始化）與 `/api/lobby/O8_Mobile_Lobby_test/search?...`（搜尋）。
- `Game` 型別含 `url?: string` 欄位（API 回傳 `/gamelauncher?...` 相對路徑或完整 URL）；`supportiframe: boolean` 欄位決定啟動方式。
- `ugs_game_launch_url` 為前端約定的 `sessionStorage` key，用於 `GameFrameView` 取得 iframe src；`ugs_lobby_token` 為 token 儲存 key。
- dev proxy `/api` → `https://frontendwebsite.ugsdev.com` 已在 `vite.config.ts` 設定，不再使用 `/ugs-api`。
