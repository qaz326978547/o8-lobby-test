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
- **遊戲商遊戲列表頁路由**：採用 `/search/provider/:code?keyword={keyword}`（非 query param `?provider=`，非 in-memory state）；keyword 保留於 URL；返回按鈕回到 `/`（首頁 SearchPanel 仍保有搜尋狀態）。
- **遊戲類別遊戲列表頁**：本功能實作 `/search/game-type/:code?keyword={keyword}`；遊戲清單以 `LobbyGameList` 前端篩選（`game.gametypename === gameType.name` 或 `String(game.gametype) === gameType.code`），不新增 API；返回按鈕回到 `/`。
- **provider 資料優先順序**（用於 `/search/provider/:code` 頁面）：`store.LobbyGameProviders`（`code === route.params.code`）> `store.searchResult?.providers.items` 中對應項目 > 純文字顯示 `route.params.code`。
- **`provider.iconurl` 空值佔位**：顯示 `provider.code` 縮寫文字，不崩潰，不使用 `no-data.png`。
- **gameType 點擊**：點擊 SearchPanel overlay 遊戲類別結果 → 導覽至 `/search/game-type/:code?keyword={keyword}`；本功能實作（非後續需求）。

### Session 2026-06-22（搜尋流程調整確認）

- **搜尋結果改為 inline overlay**：使用者在 SearchPanel 輸入 keyword 後，結果直接在 overlay 下方顯示（可捲動），**不再導覽至 `/search` 路由**；`/search` 路由保留但對應空白 stub 元件（避免 deep link 404）。
- **返回按鈕目標改為 `/`**：從 `/search/provider/:code` 或 `/search/game-type/:code` 點擊返回，直接回到首頁 `/`；SearchPanel 必須**自動重新展開**並還原 keyword 與搜尋結果。
- **SearchPanel 狀態還原機制**：因 Vue Router 路由切換時 HomeView 重新掛載，SearchPanel 的 component-level state（keyword ref、isOpen）不會自動保留。解決方式：
  1. Lobby store 新增 `searchKeyword: string`（預設 `''`）與 `searchPanelShouldRestore: boolean`（預設 `false`）兩個欄位。
  2. SearchPanel 輸入 keyword 時，同步更新 `lobbyStore.searchKeyword`。
  3. ProviderGamesView / GameTypeGamesView 點擊返回前，設定 `lobbyStore.searchPanelShouldRestore = true`。
  4. HomeView `onMounted` 偵測到 `searchPanelShouldRestore === true` 時，自動開啟 SearchPanel（`isSearchOpen = true`），並將 `lobbyStore.searchKeyword` 傳入 SearchPanel 作為初始 keyword；同時清除 flag（`searchPanelShouldRestore = false`）。
  5. 還原後 store 的 `searchResult` 仍保留（未清除），SearchPanel 直接顯示舊結果，不重新呼叫 API。
  6. 若 store 搜尋狀態已遺失（例如直接 deep link 進入子頁後返回），SearchPanel 以空 keyword 展開，不崩潰，不顯示錯誤。

### Session 2026-06-21（首頁發現狀態與 GamePlatformNav 規則確認）

- **「發現」為固定前端項目**：`GamePlatformNav` 第一個項目固定為「發現」，不從 API 取得，由前端插入；code 固定為 `'Discover'`，icon 固定使用 `/assets/images/icons/discover.png`，顯示文字依 i18n（zh-TW：發現，en-US：Discover）。
- **「發現」為首頁預設選中**：首頁初始載入時預設選中「發現」，顯示熱門遊戲與新品推薦 mock 輪播。
- **GamePlatformNav API provider 來源**：除「發現」外，其餘 provider 項目來自 `Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders ?? []`；`All` group 不存在時 provider 清單為空，但「發現」仍顯示、首頁不崩潰。
- **Hot/New group 現階段不存在**：UGS Lobby API 現階段 `groups[].code` 中無 `'Hot'` 或 `'New'`；熱門遊戲與新品推薦先維持 mock 輪播（各 3 頁，每頁 4 張卡片，圖片使用 `GameCard-1.png` 至 `GameCard-4.png`）；未來 API 新增後可切換，但現階段不強制。
- **禁止 non-null assertion**：不得使用 `groups.find(g => g.code === 'All')!`、`groups.find(g => g.code === 'Hot')!`、`groups.find(g => g.code === 'New')!`，必須以 optional chaining / nullish coalescing 處理。

---

## Reference 設計稿對應

### `reference/Home-1.png`

- **對應設計**：H5-首頁、H5-首頁-搜尋框展開
- **路由**：`/`
- **用途**：
  - 首頁預設狀態：「發現」選中，顯示熱門遊戲與新品推薦 mock 輪播；GamePlatformNav 第一個為「發現」，後續為 `All.gameproviders`
  - 首頁搜尋框展開狀態：搜尋 icon 點擊後，搜尋輸入框出現於首頁
- **注意**：搜尋框展開仍屬首頁 route `/`；使用者尚未執行搜尋前，不進入 `/search`

### `reference/Home-2.png`

- **對應設計**：H5-首頁-點擊選單的遊戲廠商
- **路由**：`/`
- **用途**：使用者在 GamePlatformNav 點擊 API provider（如 ATG、BT、DB），首頁以 `selectedProviderCode` 篩選並顯示該 provider 的遊戲列表；provider 清單來自 `All.gameproviders`
- **資料來源**：`store.LobbyGameList` 依 `game.providercode === selectedProviderCode` 前端篩選
- **限制**：
  - 不呼叫新 API
  - 不導向 `/search/provider/:code`
  - 與搜尋結果頁的 provider 點擊行為嚴格分離

### `reference/Search-1.png`

- **對應設計**：H5-搜尋頁面、H5-搜尋-無結果
- **路由**：`/`（SearchPanel overlay，路由不變）
- **用途**：
  - 首頁搜尋框輸入 keyword 後，搜尋結果在 SearchPanel overlay 下方可捲動顯示，**不導向新路由**
  - 有結果：顯示遊戲 / 遊戲商 / 遊戲類別三段分區（in overlay）
  - 無結果：顯示 EmptyState（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」，in overlay）

### `reference/Search-2.png`

- **對應設計**：H5-遊戲廠商搜尋結果頁面、H5-遊戲類別搜尋結果頁面
- **路由**：`/search/provider/:code?keyword={keyword}`、`/search/game-type/:code?keyword={keyword}`
- **用途**：
  - 在 SearchPanel overlay 搜尋結果中點擊 provider → 導向 `/search/provider/:code?keyword={keyword}`
  - 在 SearchPanel overlay 搜尋結果中點擊 gameType → 導向 `/search/game-type/:code?keyword={keyword}`
- **遊戲列表**：2 欄 grid，使用 `store.LobbyGameList` 前端篩選，不呼叫新 API

---

## 最終路由規劃

| 路由 | 涵蓋設計稿狀態 | 元件（建議） | 說明 |
|------|--------------|-------------|------|
| `/` | H5-首頁 / H5-首頁-搜尋框展開 / H5-首頁-點擊選單的遊戲廠商 / H5-搜尋頁面 / H5-搜尋-無結果 | `HomeView.vue`（既有）+ `SearchPanel.vue` | 首頁所有狀態；「發現」預設選中；搜尋框展開、搜尋結果 inline overlay、provider 選單篩選均為頁面內部狀態，不改路由 |
| `/search` | — | `SearchView.vue`（stub） | 保留路由避免 deep link 404；不作為主要搜尋結果 UI；核心搜尋 UI 由 SearchPanel overlay 承擔 |
| `/search/provider/:code?keyword={keyword}` | H5-遊戲廠商搜尋結果頁面 | `ProviderGamesView.vue`（新增） | 遊戲商遊戲列表頁；前端篩選 `LobbyGameList`；O8 Header + 返回（`/`）+ provider icon |
| `/search/game-type/:code?keyword={keyword}` | H5-遊戲類別搜尋結果頁面 | `GameTypeGamesView.vue`（新增） | 遊戲類別遊戲列表頁；前端篩選 `LobbyGameList`；O8 Header + 返回（`/`）+ gameType 名稱 |

**首頁五種狀態（同屬 `/`，均不改路由）**：

1. **發現（預設）**：「發現」選中，顯示熱門遊戲與新品推薦 mock 輪播（各 3 頁 × 4 張卡片）。
2. **搜尋框展開**：點擊搜尋 icon 後搜尋框出現；尚未輸入前顯示預設 tags。
3. **搜尋結果 overlay**：輸入 keyword 後，結果在 SearchPanel overlay 下方可捲動顯示（三段分區或 EmptyState），路由不變。
4. **provider 選單**：點擊 GamePlatformNav 中的 API provider 後，以 `selectedProviderCode` 篩選首頁遊戲列表；路由不變，不進入 `/search/provider/:code`。
5. **provider 篩選結果**：依 `selectedProviderCode` 前端篩選 `LobbyGameList` 並以 2 欄 grid 顯示。

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
`GamePlatformNav` 的 provider 清單（除「發現」外）來自
`Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders ?? []`。

**為何優先**：GamePlatformNav 是首頁核心導覽元素，provider 來源規則與 Discover 邏輯必須在搜尋功能之前確立。

**獨立測試**：在有 lobby 資料的狀態下點擊 ATG，確認：（1）路由仍為 `/`；（2）頁面僅顯示 `providercode === 'ATG'` 的遊戲；（3）Network tab 無新 API 請求。

**驗收場景**：

1. **Given** 首頁 lobby 資料已載入，**When** 使用者觀察 `GamePlatformNav`，**Then** 第一個項目為「發現」，後續 provider 項目來自 `All.gameproviders`；provider 圖示使用 `gameproviders[].iconurl`，名稱優先使用 `shortname`（無則 `name`，再無則 `code`）；`iconurl` 空值時顯示縮寫文字，不使用 `no-data.png`。
2. **Given** 使用者點擊 `GamePlatformNav` 中的某個 provider，**When** 點擊事件觸發，**Then** 路由仍為 `/`，頁面顯示 `LobbyGameList.filter(g => g.providercode === selectedProviderCode)` 的遊戲列表（2 欄 grid），Network tab 無新 API 請求。
3. **Given** 使用者在 provider 篩選狀態下點擊「發現」，**When** 點擊事件觸發，**Then** 清除 `selectedProviderCode`，回到熱門遊戲與新品推薦 mock 輪播狀態。
4. **Given** `Lobby.Data.groups` 中不存在 `code === 'All'` 的 group 或 `All.gameproviders` 為空，**When** 頁面載入，**Then** `GamePlatformNav` 仍顯示「發現」（清單中只有「發現」），首頁不崩潰，熱門遊戲與新品推薦仍顯示 mock 輪播。
5. **Given** 首頁 provider 篩選狀態，**When** 使用者點擊搜尋 icon，**Then** 搜尋框在首頁展開（路由仍 `/`），provider 篩選狀態不受影響。

---

### 使用者情境 3 — 展開搜尋框並顯示 inline 搜尋結果（優先級：P1）

使用者點擊首頁 GamePlatformNav 搜尋 icon，搜尋框在首頁展開（路由仍為 `/`，不跳轉）。
展開後顯示搜尋輸入框，placeholder 使用既有 i18n（遊戲、遊戲商、遊戲類別）；預設狀態顯示 tags。
使用者輸入 keyword 後，SearchPanel debounce 300ms 呼叫搜尋 API，結果直接在 overlay 下方以可捲動方式顯示（三段分區或空狀態）；**路由全程停留在 `/`，不導覽至 `/search`**。
X 關閉按鈕點擊後清除 keyword、清除 store 搜尋狀態，SearchPanel 關閉，首頁正常顯示。

**為何優先**：搜尋進入點與 inline 結果是進入遊戲商/遊戲類別列表的唯一入口，必須先正確呈現才能驗收後續情境。

**獨立測試**：點擊首頁搜尋 icon，確認搜尋框展開但路由仍為 `/`；輸入 keyword，確認結果在 overlay 下方顯示，路由仍為 `/`。

**驗收場景**：

1. **Given** 使用者位於首頁，**When** 點擊搜尋 icon，**Then** 搜尋框在首頁展開，路由仍為 `/`，顯示含 i18n placeholder 的搜尋輸入框；預設顯示 tags；**不**導覽至 `/search`。
2. **Given** 首頁搜尋框已展開且使用者輸入 keyword，**When** debounce 300ms 後，**Then** `lobbyStore.searchLobby()` 被呼叫，搜尋結果在 SearchPanel overlay 下方顯示（三段分區或空狀態）；路由**仍為** `/`，**不**導覽至 `/search`。
3. **Given** SearchPanel overlay 展開中，**When** 點擊 X 按鈕，**Then** keyword 清除、store 搜尋狀態清除，SearchPanel 關閉，路由仍為 `/`，首頁正常顯示。
4. **Given** SearchPanel 展開且 keyword 為空，**When** 使用者未輸入任何文字，**Then** 顯示預設 tags（如 ATG、AG Live、電子），不顯示搜尋結果，不顯示空狀態圖。

---

### 使用者情境 4 — 搜尋後在 overlay 顯示三段結果（優先級：P1）

使用者在首頁 SearchPanel 輸入 keyword，系統呼叫搜尋 API，結果以三段分區呈現在 overlay 可捲動區域：
「遊戲」、「遊戲商」、「遊戲類別」。
各段依 `items.length > 0` 決定是否顯示；無資料的段落完全不渲染（標題與內容均隱藏）。
路由全程停留在 `/`；不更新 URL query string。

**為何優先**：搜尋結果三段 UI 是本功能最核心的呈現，與 002 API 串接直接對應。

**獨立測試**：在 SearchPanel 輸入 `slot`，確認 Network 有搜尋請求，回傳後三段依結果選擇性顯示於 overlay。

**驗收場景**：

1. **Given** 使用者在 SearchPanel 輸入 keyword，**When** 搜尋 API 回傳 `games.items.length > 0`，**Then** overlay 顯示「遊戲」區塊，遊戲以 2 欄 grid 呈現，每張卡片圖片來自 `game.iconurl`（protocol-relative 補 `https:`；空值 fallback 至 `GameCard-*.png`，**非 no-data.png**），卡片底部顯示截斷的 `game.name`。
2. **Given** 搜尋 API 回傳 `providers.items.length > 0`，**When** 結果渲染，**Then** overlay 顯示「遊戲商」區塊，每個 provider 以圓形 icon（`provider.iconurl`）與 `provider.name` 呈現；`provider.iconurl` 為空時顯示 `provider.code` 縮寫文字佔位。
3. **Given** 搜尋 API 回傳 `gameTypes.items.length > 0`，**When** 結果渲染，**Then** overlay 顯示「遊戲類別」區塊，每個 gameType 以 tag/chip 形式顯示 `gameType.name`；點擊 gameType 導覽至 `/search/game-type/:code?keyword={keyword}`。
4. **Given** 某段 `items.length === 0`，**When** 搜尋 API 回傳，**Then** 該段標題與內容完全不渲染，不出現空白佔位區域。
5. **Given** 搜尋進行中（`isSearching === true`），**When** 等待 API 回應，**Then** overlay 顯示載入狀態，不顯示上次的搜尋結果。
6. **Given** 使用者在 overlay 點擊遊戲卡片，**When** 點擊事件觸發，**Then** 依 002 `shouldOpenByRedirect(game)` 決定啟動方式（不導覽至其他子頁）。

---

### 使用者情境 5 — 搜尋無結果（優先級：P1）

使用者在 SearchPanel 輸入無任何結果的 keyword，API 回傳三段均為空陣列，
overlay 顯示空狀態：`/assets/images/no-data.png` 圖片與文字「Woo...這裡暫時沒有東西」。
不顯示「遊戲」「遊戲商」「遊戲類別」標題，不顯示空白區塊。

**為何優先**：空結果是常見情境，缺少空狀態會顯示空白 overlay，嚴重影響使用者體驗。

**獨立測試**：在 SearchPanel 輸入亂碼字串，確認三段均不顯示，no-data 圖與文字正確出現於 overlay。

**驗收場景**：

1. **Given** 使用者在 SearchPanel 輸入 keyword 且 API 回傳，**When** `games.items`、`providers.items`、`gameTypes.items` 三段 `length` 均為 0，**Then** overlay 顯示 `/assets/images/no-data.png` 圖片與「Woo...這裡暫時沒有東西」文字，不顯示三段區塊標題。
2. **Given** 空狀態顯示中，**When** 使用者清除 keyword（輸入框為空），**Then** 空狀態隱藏，回到預設 tags 顯示狀態。
3. **Given** 空狀態顯示中，**When** 使用者重新輸入 keyword 且搜尋有結果，**Then** 空狀態消失，有資料的區塊正確顯示於 overlay。

---

### 使用者情境 6 — 點擊遊戲商進入遊戲商遊戲列表頁（優先級：P2）

使用者在首頁 SearchPanel overlay 搜尋結果「遊戲商」區塊點擊某 provider（如 ATG），
系統導覽至 `/search/provider/ATG?keyword={keyword}`，keyword 保留於 URL。
頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、provider 圓形 icon 與名稱，
以及 store `LobbyGameList` 依 `game.providercode === provider.code` 篩選的遊戲列表（2 欄 grid）。
**不呼叫任何新 API。**

**provider 資料優先順序**：優先取 `store.LobbyGameProviders`（`code === route.params.code`）；
無則取 `store.searchResult?.providers.items` 中對應項目；再無則純文字顯示 `route.params.code`。

**為何優先**：遊戲商點擊後的頁面是此功能第二個核心場景，使用前端篩選可獨立實作不阻塞後端。

**獨立測試**：在有 lobby 資料的狀態下於 SearchPanel overlay 中點擊 ATG provider，確認 URL 為 `/search/provider/ATG?keyword=ATG`，頁面僅顯示 `providercode === 'ATG'` 的遊戲，Network tab 無新 API 請求。

**驗收場景**：

1. **Given** 使用者在 SearchPanel overlay 點擊 provider，**When** 導覽完成，**Then** URL 為 `/search/provider/:code?keyword={keyword}`，頁面顯示：O8 Header（含搜尋與語系 icon）、返回按鈕、provider 圓形 icon（`provider.iconurl`，空值顯示縮寫文字）與 `provider.name`。
2. **Given** `/search/provider/:code?keyword={keyword}` 頁已載入且 `LobbyGameList` 有對應 provider 的遊戲，**When** 頁面渲染，**Then** 遊戲以 2 欄 grid 顯示，每張卡片圖片來自 `game.iconurl`（處理邏輯同 US4；fallback 為 `GameCard-*.png`，非 `no-data.png`）。
3. **Given** `LobbyGameList` 中無任何 `game.providercode === provider.code` 的遊戲，**When** 頁面渲染，**Then** 顯示空狀態：`/assets/images/no-data.png` 與「Woo...這裡暫時沒有東西」。
4. **Given** 頁面載入，**When** 使用者觀察 Network tab，**Then** 無任何新 API 請求，遊戲列表來自 store 前端篩選。
5. **Given** 使用者點擊遊戲卡片，**When** 點擊事件觸發，**Then** 依 002 `shouldOpenByRedirect(game)` 邏輯決定啟動方式（Phase 5 尚未完成時保留 TODO，不破壞 build）。

---

### 使用者情境 7 — 點擊遊戲類別進入遊戲類別遊戲列表頁（優先級：P2）

使用者在首頁 SearchPanel overlay 搜尋結果「遊戲類別」區塊點擊某 gameType（如 電子），
系統導覽至 `/search/game-type/:code?keyword={keyword}`，keyword 保留於 URL。
頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、gameType 名稱，
以及 store `LobbyGameList` 依 `GAME_TYPE_CODE_TO_ID` 數字映射（優先）+ `gametypename` fallback 條件篩選的遊戲列表（2 欄 grid）；禁止只用 `String(game.gametype) === gameType.code`（`String(0) !== "Slot"`，永遠不命中）。
**不呼叫任何新 API。**

**為何優先**：遊戲類別列表頁的資料來源（前端篩選）與 provider 頁相同，可同批實作。

**獨立測試**：在 SearchPanel overlay 點擊「電子」gameType tag，確認 URL 為 `/search/game-type/{code}?keyword={keyword}`，頁面顯示篩選後遊戲，Network tab 無新請求。

**驗收場景**：

1. **Given** 使用者在 SearchPanel overlay 點擊 gameType tag，**When** 導覽完成，**Then** URL 為 `/search/game-type/:code?keyword={keyword}`，頁面顯示：O8 Header（含搜尋與語系 icon）、返回按鈕、`gameType.name` 標題。
2. **Given** `/search/game-type/:code?keyword={keyword}` 頁已載入且 `LobbyGameList` 有符合條件的遊戲，**When** 頁面渲染，**Then** 遊戲以 2 欄 grid 顯示，篩選策略（取一符合即包含）：優先使用 `GAME_TYPE_CODE_TO_ID[code]` 對應數字 ID 與 `Number(game.gametype)` 精確匹配（例：`Slot → 0`）；fallback 使用 `game.gametypename === gameTypeName` 或 `game.gametypename === code`；**禁止只使用** `String(game.gametype) === code`（`String(0) !== "Slot"`，永遠不命中）。
3. **Given** `LobbyGameList` 中無符合條件的遊戲，**When** 頁面渲染，**Then** 顯示空狀態：`/assets/images/no-data.png` 與「Woo...這裡暫時沒有東西」。
4. **Given** 頁面載入，**When** 使用者觀察 Network tab，**Then** 無任何新 API 請求。
5. **Given** 使用者點擊遊戲卡片，**When** 點擊事件觸發，**Then** 依 002 `shouldOpenByRedirect(game)` 邏輯決定啟動方式（Phase 5 尚未完成時保留 TODO，不破壞 build）。

---

### 使用者情境 8 — 返回與關閉（優先級：P2）

使用者在遊戲商/遊戲類別頁點擊返回，或在搜尋頁點擊 X，各有明確的導覽行為。
keyword 與搜尋結果在正確時機保留，不重新呼叫 API；僅在主動關閉搜尋（X 按鈕）時清除。

**為何優先**：返回行為直接影響導覽體驗，keyword 與結果應在適當時機保留或清除，避免使用者重複操作。

**獨立測試**：從遊戲商頁點返回，確認回到首頁 `/`，SearchPanel overlay 仍保有搜尋狀態，Network 無新請求。

**驗收場景**：

1. **Given** 使用者在 `/search/provider/:code?keyword={keyword}` 點擊返回，**When** 導覽完成（ProviderGamesView 先設定 `lobbyStore.searchPanelShouldRestore = true` 再執行 `router.push('/')`），**Then** 回到 `/`（首頁），HomeView `onMounted` 偵測到 flag 後自動展開 SearchPanel，keyword 從 `lobbyStore.searchKeyword` 還原，`searchResult` 保留於 store 直接顯示，**未重新呼叫 API**；若 store 狀態已遺失，SearchPanel 以空 keyword 展開，不崩潰。
2. **Given** 使用者在 `/search/game-type/:code?keyword={keyword}` 點擊返回，**When** 導覽完成（GameTypeGamesView 先設定 `lobbyStore.searchPanelShouldRestore = true` 再執行 `router.push('/')`），**Then** 回到 `/`（首頁），HomeView `onMounted` 偵測到 flag 後自動展開 SearchPanel，keyword 從 `lobbyStore.searchKeyword` 還原，`searchResult` 保留於 store 直接顯示，**未重新呼叫 API**；若 store 狀態已遺失，SearchPanel 以空 keyword 展開，不崩潰。
3. **Given** SearchPanel overlay 展開中，**When** 使用者點擊 X 關閉按鈕，**Then** keyword 清除、store 搜尋狀態清除，SearchPanel 關閉，路由仍為 `/`，首頁正常顯示。
4. **Given** 使用者使用瀏覽器硬返回至 `/`，**When** 返回完成，**Then** 首頁正常顯示，SearchPanel 關閉狀態，keyword 不殘留。
5. **Given** 首頁 provider 選單已展開（`selectedProviderCode` 已設定），**When** 使用者點擊「發現」，**Then** 只清除 `selectedProviderCode`，路由不變（仍為 `/`），回到熱門遊戲與新品推薦 mock 輪播。
6. **Given** 首頁 provider 選單已展開，**When** 使用者點擊另一個 provider，**Then** 只更新 `selectedProviderCode`，路由不變，不進入 `/search/provider/:code`。
7. **Given** 使用者在首頁再次點擊搜尋 icon，**When** 搜尋框展開，**Then** 搜尋框為空，顯示預設 tags，無殘留舊結果；使用者需重新輸入後方顯示新的搜尋結果。

---

### 邊界條件

- `Lobby.Data.groups` 中無 `code === 'Hot'` 或 `code === 'New'` → 熱門遊戲與新品推薦使用 mock 輪播，不崩潰。
- `Lobby.Data.groups` 中無 `code === 'All'` 或 `All.gameproviders` 為空 → `GamePlatformNav` 只顯示「發現」，首頁不崩潰，mock 輪播正常顯示。
- `All.gameproviders[].iconurl` 為空 → 顯示 `shortname` 或 `code` 縮寫文字佔位，不使用 `no-data.png`，不崩潰。
- keyword 為空字串時，不呼叫搜尋 API，顯示預設 tags，不顯示空狀態圖（沿用 002 FR-016）。
- keyword 非空但三段均空 → 顯示空狀態（`no-data.png` + 「Woo...這裡暫時沒有東西」）。
- `game.iconurl` 為空或載入失敗時，遊戲卡片 fallback 至 mock 圖片（`GameCard-*.png`），**不使用 `no-data.png`**；兩種 fallback 用途嚴格分離。
- `provider.iconurl` 為空時，顯示 `provider.code` 縮寫文字佔位，不崩潰，不使用 `no-data.png`。
- `iconurl` 為 protocol-relative URL（`//...`）時，補 `https:` 前綴（延用 002 `resolveIconUrl` 邏輯）。
- `gameTypes.items[].gamecount` 只顯示數量，不作為遊戲清單資料來源，不觸發 API。
- 使用者到達 `/search/provider/:code?keyword=` 或 `/search/game-type/:code?keyword=` 時若 `LobbyGameList` 為空（無 token 或 lobby API 未完成），顯示空狀態，不崩潰。
- `LobbyGameList` 以 002 `LobbyGameGroup`（已過濾 `isvisible`、已排序 `order`）為來源，不繞過此過濾邏輯。
- `npm run build` 必須在任何實作階段完成後通過，零 TypeScript error。
- 直接瀏覽 `/search/provider/:code?keyword=xxx` 或 `/search/game-type/:code?keyword=xxx`（深度連結）時，若 store 尚未初始化，頁面顯示空狀態，不崩潰（fetch 行為只在首頁 onMounted 觸發）。

---

## 功能需求

### 首頁「發現」預設狀態與 GamePlatformNav

- **FR-026**：`GamePlatformNav` 第一個項目必須固定為「發現」（前端插入，非 API 資料）；固定資料：`code: 'Discover'`、`name: 'Discover'`（僅作 data key）、`iconurl: '/assets/images/icons/discover.png'`；**顯示文字必須使用 `t('home.navigation.discover')` i18n，不得直接顯示 `item.name` 字串「Discover」**（否則 zh-TW 使用者將看到英文字，違反 constitution §七.12）；判斷方式：`item.isDiscover ? t('home.navigation.discover') : item.name`。
- **FR-027**：首頁初始載入時「發現」必須為預設選中項目；點擊「發現」時清除 `selectedProviderCode`，回到熱門遊戲與新品推薦 mock 輪播狀態。
- **FR-028**：「發現」選中時，首頁必須顯示「熱門遊戲」與「新品推薦」兩個輪播區塊；各區塊各有 3 頁，每頁 4 張卡片（2 欄 grid），圖片使用 `/assets/images/games/GameCard-1.png` 至 `GameCard-4.png`（各頁可重複使用四張，但必須為真實 3 頁資料結構，非假 indicator）。
- **FR-029**：現階段熱門遊戲與新品推薦必須使用寫死 mock 資料，不依賴 `groups.find(g => g.code === 'Hot')` 或 `groups.find(g => g.code === 'New')`；即使 API 只有 `All` group 或 groups 完全為空，首頁「發現」狀態不可空白或 crash。
- **FR-030**：未來若 API 新增 `group.code === 'Hot'`，熱門遊戲區塊可改為優先使用 `Hot.games`，不存在時 fallback mock；未來若 API 新增 `group.code === 'New'`，新品推薦同理；現階段不得假設兩者存在，禁止 non-null assertion（`groups.find(g => g.code === 'Hot')!`、`groups.find(g => g.code === 'New')!`）。
- **FR-031**：`GamePlatformNav` 除「發現」外的 provider 項目必須來自 `Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders ?? []`；`All` group 不存在或 `gameproviders` 為空時，清單只顯示「發現」，不崩潰；禁止 `groups.find(g => g.code === 'All')!`。
- **FR-032**：`GamePlatformNav` provider 項目顯示規則：圖示使用 `gameproviders[].iconurl`（空值顯示 `shortname` / `code` 縮寫文字，非 `no-data.png`）；名稱優先使用 `shortname`，無則 `name`，再無則 `code`。
- **FR-033**：首頁點擊 `GamePlatformNav` provider 後，以 `selectedProviderCode = provider.code` 更新頁面內部狀態；遊戲列表以 `LobbyGameList.filter(g => g.providercode === selectedProviderCode)` 前端篩選，以 2 欄 grid 顯示；路由仍為 `/`，不呼叫新 API，不導向 `/search/provider/:code`。
- **FR-034**：首頁「發現」mock 輪播資料不影響搜尋結果頁 `/search`、遊戲商頁 `/search/provider/:code`、遊戲類別頁 `/search/game-type/:code` 的 API/store 資料邏輯；兩套資料來源完全分離。

### SearchPanel inline 搜尋 UI

- **FR-001**：SearchPanel overlay 必須顯示 X 關閉按鈕、搜尋輸入框（i18n placeholder：遊戲、遊戲商、遊戲類別）及搜尋 icon；X 按鈕點擊後：清除 keyword（輸入框置空）、將 `lobbyStore.searchKeyword` 重置為 `''`、清除 store 搜尋狀態（`searchResult`）、SearchPanel 關閉，路由仍為 `/`。
- **FR-002**：「遊戲」區塊必須依 `games.items.length > 0` 決定顯示；有資料時以 2 欄 grid 呈現遊戲卡片，圖片來自 `game.iconurl`（空值 fallback `GameCard-*.png`，protocol-relative 補 `https:`），卡片底部顯示截斷 `game.name`；點擊卡片依 002 `shouldOpenByRedirect(game)` 決定啟動方式。
- **FR-003**：「遊戲商」區塊必須依 `providers.items.length > 0` 決定顯示；有資料時，每個 provider 以 `resolveProviderDisplay(provider.code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? [])` 取得顯示資料（icon、name），優先順序：`LobbyGameProviders` > `searchResult.providers.items` > code 文字 fallback；`iconPath` 為空時顯示縮寫文字佔位，不使用 `no-data.png`；點擊 provider 導覽至 `/search/provider/:code?keyword={keyword}`（keyword 來自輸入框當前值）。
- **FR-004**：「遊戲類別」區塊必須依 `gameTypes.items.length > 0` 決定顯示；有資料時以 tag/chip 形式顯示 `gameType.name`；點擊 gameType 導覽至 `/search/game-type/:code?keyword={keyword}`（keyword 來自輸入框當前值）；`gameType.gamecount` 僅作數量提示，不觸發 API。
- **FR-005**：當三段 `items` 均為空（且 keyword 非空）時，必須在 overlay 顯示 `EmptyState`（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）；不顯示三段標題或空白區域。
- **FR-006**：keyword 為空字串時，不顯示搜尋結果，不顯示空狀態圖，顯示預設 tags（沿用 002 FR-016）。
- **FR-007**：`isSearching === true` 時顯示載入狀態，不顯示上次搜尋結果。
- **FR-008**：keyword debounce 300ms 後呼叫 `lobbyStore.searchLobby()`；SearchPanel 每次 keyword 變更時，必須同步更新 `lobbyStore.searchKeyword`，以便子頁返回後 HomeView 能還原 keyword；導覽至 `/search/provider/:code` 或 `/search/game-type/:code` 時，keyword 必須一併帶入 URL query string；路由本身（`/`）**不**隨 keyword 更新（無 URL 同步）。

### 遊戲商遊戲列表頁（`/search/provider/:code?keyword={keyword}`）

- **FR-009**：頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、provider 圓形 icon 與名稱；使用 `resolveProviderDisplay(route.params.code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? [])` 取得 `{ name, iconPath }`；優先順序：`store.LobbyGameProviders` > `store.searchResult?.providers.items` > code 文字 fallback；`iconPath` 為空時顯示縮寫文字，不使用 `no-data.png`。
- **FR-010**：遊戲列表必須從 store `LobbyGameList` 依 `game.providercode === route.params.code` 前端篩選，**不呼叫任何新 API**，不新增 `providerCode` 或其他 API 文件未定義的 query 參數。
- **FR-011**：遊戲列表以 2 欄 grid 呈現，卡片圖片來自 `game.iconurl`（處理邏輯同 FR-002）；點擊卡片依 002 `shouldOpenByRedirect(game)` 決定啟動方式（Phase 5 完成前保留 TODO，不破壞 build）。
- **FR-012**：`LobbyGameList` 中無對應 providercode 遊戲時，顯示 `EmptyState`（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）。
- **FR-013**：返回按鈕點擊後，先設定 `lobbyStore.searchPanelShouldRestore = true`，再執行 `router.push('/')`；HomeView `onMounted` 偵測 flag 後自動展開 SearchPanel 並從 `lobbyStore.searchKeyword` 還原 keyword，同時清除 flag；`searchResult` 保留於 store，**不重新呼叫 API**。（使用 `router.push('/')` 確保返回行為確定性，見 DEC-016）

### 遊戲類別遊戲列表頁（`/search/game-type/:code?keyword={keyword}`）

- **FR-014**：頁面顯示 O8 Header（含搜尋與語系 icon）、返回按鈕、`gameType.name` 標題；gameType 資料取 `store.searchResult?.gameTypes.items` 中 `code === route.params.code` 的項目；無對應資料時以 `route.params.code` 作文字顯示。
- **FR-015**：遊戲列表必須從 store `LobbyGameList` 前端篩選，篩選策略（雙條件，取一符合即包含）：**第一優先**：透過 `GAME_TYPE_CODE_TO_ID` 映射取得數字 ID（例：`Slot → 0`），以 `Number(game.gametype) === mappedId` 精確匹配；**Fallback**：`game.gametypename === gameTypeName` 或 `game.gametypename === code`；**禁止只使用** `String(game.gametype) === code`（`String(0) !== "Slot"`，永遠不命中）；**不呼叫任何新 API**，不新增 `gameTypeCode` 等未定義 query 參數。
- **FR-016**：遊戲列表以 2 欄 grid 呈現，卡片圖片來自 `game.iconurl`（處理邏輯同 FR-002）；點擊卡片依 002 `shouldOpenByRedirect(game)` 決定啟動方式（Phase 5 完成前保留 TODO，不破壞 build）。
- **FR-017**：`LobbyGameList` 中無符合條件遊戲時，顯示 `EmptyState`（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）。
- **FR-018**：返回按鈕點擊後，先設定 `lobbyStore.searchPanelShouldRestore = true`，再執行 `router.push('/')`；還原機制同 FR-013。（原因同 FR-013、DEC-016）

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
7. **不重寫 HomeView.vue**：若 HomeView.vue 需整合搜尋入口，應以最小改動方式處理（僅加路由跳轉邏輯），不整體重構。
8. **不修改核心元件視覺**：`GameCard.vue`、`GameSection.vue`、`HeroBanner.vue` 的 props 介面與核心視覺樣式不得修改。
9. **不新增玩家/餘額/幣別 UI**：`Player`、`Balance`、`CurrencySymbol` 沿用 002 規則，存 store 不接 UI。
10. **不硬編碼 token 或 domain**：`src/` runtime code 禁止出現硬編碼 token、`https://frontendwebsite.ugsdev.com` 或任何 UGS domain；API base 由 `VITE_UGS_API_BASE` 環境變數控制。
11. **不把「發現」當成 API provider**：「發現」是前端固定插入項目，禁止期待 API 回傳 `code === 'Discover'` 的 group 或 provider。
12. **不從 Hot / New group 取 GamePlatformNav provider**：現階段 `GamePlatformNav` provider 清單只使用 `All.gameproviders`；禁止從 `Hot` 或 `New` group 取 provider。
13. **不使用 non-null assertion 存取 group**：禁止使用 `groups.find(g => g.code === 'All')!`、`groups.find(g => g.code === 'Hot')!`、`groups.find(g => g.code === 'New')!`；必須以 optional chaining / nullish coalescing 防止 crash。
14. **不在 All group 不存在時讓畫面 crash**：`All` group 缺失時 `GamePlatformNav` 只顯示「發現」，首頁繼續正常運作。
15. **不假設 Hot / New group 現階段存在**：現階段熱門遊戲與新品推薦必須有 mock fallback，不可直接讀取 `Hot.games` 或 `New.games` 而無防護。
16. **不導向錯誤路由**：首頁 GamePlatformNav provider 點擊只在首頁內部篩選（路由仍 `/`），不導向 `/search/provider/:code`；此路由只供搜尋結果頁的 provider 點擊使用。

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

---

## 成功標準

### 可量測成果

- **SC-001**：首頁初始進入 `/` 時，「發現」為 `GamePlatformNav` 第一個且預設選中項目，100% 可驗證（目測）。
- **SC-002**：「發現」icon 使用 `/assets/images/icons/discover.png`，100% 可驗證（目測 + DevTools）。
- **SC-003**：`GamePlatformNav` 除「發現」外的 provider 來自 `All.gameproviders`；provider 名稱優先顯示 `shortname`，icon 使用 `gameproviders[].iconurl`，空值顯示縮寫文字而非 `no-data.png`，100% 可驗證（目測）。
- **SC-004**：首頁「發現」狀態顯示熱門遊戲與新品推薦各 3 頁輪播，每頁 4 張卡片，圖片來自 `GameCard-1~4.png`，100% 可驗證（目測）。
- **SC-005**：即使 API 只回傳 `All` group 且無 `Hot` / `New`，首頁「發現」mock 輪播仍正常顯示，不空白、不崩潰，100% 可驗證（以無 `Hot`/`New` group 的 API 回應測試）。
- **SC-006**：即使 `All.gameproviders` 為空，`GamePlatformNav` 仍顯示「發現」且首頁不崩潰，100% 可驗證（mock API 回應移除 gameproviders）。
- **SC-005a**：在 SearchPanel 輸入 keyword 後，搜尋結果顯示於 overlay 下方可捲動區域，路由**不變更為 `/search`**，100% 可驗證（DevTools 觀察 URL）。
- **SC-007**：首頁點擊 provider 後路由仍為 `/`，遊戲列表依 `selectedProviderCode` 前端篩選，Network tab 無新 API 請求，100% 可驗證。
- **SC-008**：在 SearchPanel 輸入 keyword 後，搜尋結果在 overlay 以三段分區顯示，每段僅在 `items.length > 0` 時出現，100% 可驗證（目測 + Network tab）。
- **SC-009**：三段均空時，顯示 `no-data.png` 與「Woo...這裡暫時沒有東西」，不顯示空白區塊，100% 可驗證（目測）。
- **SC-010**：`no-data.png` 不出現在遊戲卡片 fallback 或任何 provider icon fallback；遊戲卡片圖片 fallback 僅使用 `GameCard-*.png`，100% 可驗證（目測）。
- **SC-011**：點擊 provider 後，URL 變更為 `/search/provider/:code?keyword={keyword}`（keyword 保留），遊戲商頁顯示前端篩選遊戲列表，Network tab 無新 API 請求，100% 可驗證。
- **SC-012**：點擊 gameType 後，URL 變更為 `/search/game-type/:code?keyword={keyword}`（keyword 保留），遊戲類別頁顯示前端篩選遊戲列表，Network tab 無新 API 請求，100% 可驗證。
- **SC-013**：遊戲商頁或遊戲類別頁無對應遊戲時，顯示空狀態，100% 可驗證（目測）。
- **SC-014**：從子頁返回按鈕回到 `/`（首頁），SearchPanel **自動重新展開**（via `searchPanelShouldRestore` flag），keyword 從 `lobbyStore.searchKeyword` 還原，`searchResult` 直接顯示（未重新呼叫 API），100% 可驗證（目測 + Network tab 無新請求）。
- **SC-015**：001 O8 手機版 UI Demo 全部互動（首頁輪播、語系切換、浮動按鈕）在本功能完成後維持正常，100% 可驗證（手動測試）。
- **SC-016**：`npm run build` 零 TypeScript error，100% 可驗證。
- **SC-017**：`src/` 目錄不出現新的 domain 硬編碼、未定義 API 端點或未定義 query 參數，100% 可驗證（grep 檢查）。

---

## 假設前提

- 002 Phase 1–4 已完成：搜尋 API 串接（`LobbyApi.searchLobby`）、store `searchResult`/`isSearching`/`searchNextPage`、`LobbyGameList` 依 `isvisible` 過濾與 `order` 排序已就緒。
- `LobbyGameList` 在使用者帶 token 開啟首頁後由 `fetchLobbyData` 填入；若無 token，`LobbyGameList` 為空，遊戲商頁與遊戲類別頁顯示空狀態；首頁「發現」mock 輪播不依賴 `LobbyGameList`，token 有無均可顯示。
- 搜尋入口（搜尋 icon 點擊）目前在首頁 `GamePlatformNav` 區域；003 將此點擊改為在首頁展開搜尋框（路由仍為 `/`）；使用者輸入 keyword 後，`SearchPanel.vue` 呼叫搜尋 API，結果直接在 overlay 下方可捲動區域顯示，**不導覽至 `/search`**；`/search` 路由保留 stub 元件避免 deep link 404；點擊搜尋結果 provider/gameType 則導覽至對應子頁。
- `resolveIconUrl` 函式（002 實作於 `HomeView.vue`）在 003 提取為共用 utility（如 `src/utils/url.ts`），供所有新增頁面共用；具體位置在 plan 階段確認。
- 001 UI Demo 的 mock 資料（`carouselPages`）保留不刪除，作為無 API 資料時的 fallback；003 mock 輪播（熱門遊戲、新品推薦）另行定義於 HomeView 或 store，不與搜尋 API 資料混用。
- `Game` 型別含 `gametypename: string` 與 `gametype: number | string` 欄位（依 002 API 文件）；若實際型別不符，在 plan 階段依 API 文件確認並更新型別定義。
- 遊戲類別頁的 gameType 資料（name/code）從搜尋結果 store 傳遞至子頁，無需額外 API。
- `Lobby.Data.groups` 現階段只有 `All` group；`Hot` 與 `New` group 尚未提供，現規格不強制使用；未來 API 新增時，可在後續需求中切換為 API 資料優先並保留 mock fallback。
- `Lobby.Data.groups.find(g => g.code === 'All')?.gameproviders` 為 `GameProvider[]`，型別與 002 store `LobbyGameProviders`（來自所有 `LobbyGameGroup[].gameproviders` 的去重合併）不同；在 plan 階段確認實作時使用哪份 provider 清單作為 `GamePlatformNav` 來源。
