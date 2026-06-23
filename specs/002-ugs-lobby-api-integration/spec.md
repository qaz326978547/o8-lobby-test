# 功能規格：UGS Lobby API 串接

**功能分支**：`002-ugs-lobby-api-integration`

**建立日期**：2026-06-17

**狀態**：Draft

**輸入**：將 O8 手機版遊戲大廳 UI Demo（001）逐步串接 UGS Lobby API，優先完成首頁遊戲清單呈現，並為搜尋與遊戲啟動預先規格化，不破壞既有 UI Demo 視覺與互動。

---

## 釐清記錄

### Session 2026-06-17

- 本規格依據現況盤點報告（2026-06-17）與 API 文件摘要（`docs/ugs-lobby-api-summary.md`）及
  `docs/FrontendIntegrationGuide.html` 整理而成。
- `VITE_UGS_API_BASE` 是本專案對 API base 的抽象，非 API 文件所定義的路徑。
- `/ugs-api` 是本專案目前建議的 proxy base path，透過 Vite dev proxy 在本機轉發；
  API 文件使用 `{UgsFrontendWebsiteUrl}` 代表 UGS 原始 base，兩者不同。
- 現階段首頁主要接 `Lobby.Data.groups`，不新增玩家資訊、餘額或幣別 UI。
- 搜尋 API 與遊戲啟動列入本規格，但可後續階段實作。

---

## 使用者情境與測試

### 使用者情境 1 — 首頁載入 API 遊戲清單（優先級：P1）

使用者以帶有 `token` query string 的網址進入遊戲大廳首頁，頁面自動向 UGS Lobby API
取得大廳資料，並以 API 回傳的遊戲群組與遊戲卡片取代原本的 mock 資料呈現於畫面上。
既有的頁面佈局、輪播效果與視覺風格不受影響。

**為何優先**：這是本階段 API 串接的核心目標。成功後，首頁資料來源從靜態 mock 轉為
真實 API，是後續所有功能的基礎。

**獨立測試**：帶 `?token=xxx` 開啟首頁，確認 Network tab 有呼叫 Lobby API，
且頁面顯示 API 回傳的遊戲名稱與圖片（而非固定的 mock 卡片資料）。

**驗收場景**：

1. **Given** 使用者以 `?token=xxx` 開啟首頁，**When** 頁面載入完成，**Then** 瀏覽器
   Network tab 可見一筆 GET 請求至 `{VITE_UGS_API_BASE}/api/lobby/mobile?token=xxx`。
2. **Given** API 成功回傳大廳資料，**When** `Lobby.Data.groups` 有 `isvisible: true` 的
   群組，**Then** 首頁依群組的 `order` 由小到大排序後，各群組以對應的遊戲卡片呈現。
3. **Given** API 回傳遊戲資料，**When** 某遊戲的 `iconurl` 欄位有值，**Then**
   遊戲卡片的圖片來源優先使用 `game.iconurl`，不使用 mock 靜態圖片。
4. **Given** API 成功回傳，**When** 首頁渲染完成，**Then** 既有的輪播切換、分頁指示器、
   header、banner 等視覺元件與互動行為維持正常，不因 API 串接而破版或功能失效。
5. **Given** API 成功回傳，**When** 檢視 store 狀態，**Then** `Player`、`Balance`、
   `CurrencySymbol` 已保存於 store，但頁面 UI 不顯示任何玩家資訊、餘額或幣別。

---

### 使用者情境 2 — 無 token 或 API 失敗時的 Fallback（優先級：P1）

使用者在沒有 `token` query string 的情況下開啟首頁，或 API 呼叫失敗，頁面不崩潰、
不顯示 API 錯誤堆疊，並回退至原本的 UI Demo mock 資料，保持畫面可正常瀏覽。

**為何優先**：確保 API 串接不破壞原有 Demo 可展示性。開發期間 token 經常缺失，
fallback 機制讓 UI Demo 仍可獨立展示。

**獨立測試**：移除 URL 中的 `token` 參數或斷開網路後開啟首頁，確認頁面顯示 mock
遊戲卡片，console 無未捕捉錯誤，且 UI Demo 視覺完整。

**驗收場景**：

1. **Given** URL 沒有 `token` query string，**When** 首頁載入，**Then** 不呼叫 Lobby
   API，首頁顯示原本的 mock 遊戲卡片資料，視覺與原始 UI Demo 一致。
2. **Given** URL 有 `token` 但 API 回傳錯誤（如 401、網路失敗），**When** 首頁載入完成，
   **Then** 頁面 fallback 顯示 mock 資料，console 無未捕捉 JavaScript 錯誤。
3. **Given** 任一 fallback 情境，**When** 使用者瀏覽頁面，**Then** 輪播、搜尋面板開關、
   語系切換等 UI Demo 互動功能維持正常。

---

### 使用者情境 3 — 搜尋 API 串接（優先級：P2）

使用者在搜尋面板中輸入關鍵字後，頁面向 UGS Search API 取得搜尋結果，並分別呈現
遊戲（`games`）、遊戲商（`providers`）、遊戲類型（`gameTypes`）三段結果。
輸入為空時顯示空結果，不顯示全部遊戲。

**為何優先**：搜尋功能是大廳互動的重要路徑，但不影響首頁資料載入，可在 P1 完成後推進。

**獨立測試**：在有 token 的狀態下開啟搜尋面板、輸入關鍵字（如 `slot`），確認
Network tab 有 Search API 請求，且搜尋結果以三段分區呈現。

**驗收場景**：

1. **Given** 使用者在搜尋面板輸入 `slot`，**When** 送出搜尋，**Then** Network tab 可見
   GET 請求至 `{VITE_UGS_API_BASE}/api/lobby/mobile/search?token=xxx&keyword=slot`。
2. **Given** API 回傳搜尋結果，**When** 搜尋結果渲染完成，**Then** 畫面分三段顯示：
   `games.items`、`providers.items`、`gameTypes.items`，各段獨立。
3. **Given** 使用者清空搜尋框（keyword 為空），**When** 觸發搜尋或清除，**Then**
   三段皆顯示空結果，不顯示「全部遊戲」清單。
4. **Given** 某段結果的 `hasMore === true`，**When** 使用者觸發「載入更多」，**Then**
   下一頁的 offset 為 `前次 offset + 前次 items.length`，且請求的 query string 僅包含
   API 文件已定義的參數（`token`、`keyword`、`pageSize`、`gamesOffset`、
   `providersOffset`、`gameTypesOffset`）。
   > **延後實作**：`searchNextPage()` helper（T034）已在 store 實作 offset 計算邏輯，
   > 但 Search UI 的「載入更多」按鈕與觸發流程列為後續迭代，不在本功能 002 範疇內。
5. **Given** `gameTypes.items` 中某項目有 `gamecount: 234`，**When** 使用者查看，
   **Then** `gamecount` 僅顯示為數量提示，不代表已取得該類型底下所有遊戲，
   系統不以 `gamecount` 作為遊戲清單資料來源。

---

### 使用者情境 4 — 遊戲啟動 URL 準備（優先級：P2）

使用者點擊遊戲卡片，系統依 `game.providercode`（`gpcode`）與 `game.code`（`gcode`）
組合出遊戲啟動 URL，並依 iframe 支援判斷決定以整頁跳轉或 iframe 方式開啟遊戲。

**為何優先**：啟動遊戲是大廳的核心目的，但因 `/gamelauncher` 回傳行為尚待確認，
本情境可先規格化，待確認後再實作。

**獨立測試**：點擊遊戲卡片，確認可產生正確格式的啟動 URL，並依 iframe 支援判斷
使用正確的開啟方式（console log 或 URL 可驗證）。

**驗收場景**：

1. **Given** 使用者點擊一張遊戲卡片，**When** 點擊事件觸發，**Then** 系統產生啟動 URL
   格式為 `{VITE_UGS_API_BASE}/gamelauncher?token=xxx&gpcode={game.providercode}&gcode={game.code}&lang=zh-TW`。
2. **Given** `shouldOpenByRedirect(game)` 回傳 `true`，**When** 遊戲啟動，**Then**
   以 `window.location.href` 整頁跳轉至啟動 URL。
3. **Given** `shouldOpenByRedirect(game)` 回傳 `false`，**When** 遊戲啟動，**Then**
   以 iframe 方式載入啟動 URL（若 iframe modal 尚未實作，可保留 TODO，不得破壞 build）。
4. **Given** `lang` 參數，**When** 組合啟動 URL，**Then** 優先使用 `Player.lang`；
   若不存在，使用目前 i18n locale；若皆不存在，使用 `zh-TW` 作為 fallback。

---

### 邊界條件

- URL 中 `token` 缺失時，不呼叫任何 UGS API，頁面顯示 mock fallback。
- `token` 有值但 API 回傳 401 時，顯示授權失敗狀態，或 fallback 至 mock；
  不使用硬編碼 token 嘗試重試。
- `Lobby.Data.groups` 中所有 group 的 `isvisible === false` 時，首頁以 mock fallback
  渲染，不顯示空白區塊。
- `game.iconurl` 為空或載入失敗時，降級使用 mock 圖片（`GameCard-*.png`）。
- `iconurl` 為 protocol-relative URL（如 `//photo.o8-game.com/...`）時，前端 `<img>`
  能正常載入，不因協定問題破圖。
- 搜尋 keyword 為空字串時，不將結果當成全部遊戲清單，三段皆顯示空結果。
- `gameTypes.items[].gamecount` 僅用於顯示數量，不作為遊戲清單資料來源。
- 不得自行新增 API 文件未定義的 query 參數（如 `providerCode`、`gameTypeCode`）。
- `shouldOpenByRedirect` 邏輯中，若 `IframeUnsupportedGameProviders` 或
  `iframeunsupportedgameproviders` 為空陣列，不應影響其他判斷條件的結果。
- `betlimitid` 沒有資料時，啟動 URL 帶空字串（`betlimitid=`），不省略此參數。
- `npm run build` 必須在任何實作階段完成後通過，無 TypeScript error。

---

## 功能需求

### 主要功能需求

#### API 基礎建設

- **FR-001**：系統必須以環境變數 `VITE_UGS_API_BASE` 作為 UGS API 的唯一 base，
  業務程式碼（`src/` 目錄下）不得出現硬編碼的 domain（如
  `https://frontendwebsite.ugsdev.com`）或固定 path（如 `/ugs-api`）。
- **FR-002**：本機開發環境必須透過 Vite dev server proxy 將 `VITE_UGS_API_BASE`
  對應的路徑（預設為 `/ugs-api`）轉發到 `https://frontendwebsite.ugsdev.com`，
  並使用 path rewrite 去除前綴。proxy 設定必須同時涵蓋 `/api/lobby/*`（大廳與搜尋）
  與 `/gamelauncher`（遊戲啟動）。
- **FR-003**：`token` 必須從 URL query string（`?token=`）取得並存入 store，
  不可在任何程式碼中硬編碼 token 字串。
- **FR-004**：若 URL 中無 `token`，系統不得呼叫任何 UGS API。

#### 大廳資料取得

- **FR-005**：系統必須提供 `fetchLobbyData(lobbyPath?)` store action，
  以 store 內保存的 `token` 呼叫 Lobby API
  （`GET {VITE_UGS_API_BASE}/api/lobby/{lobbyPath}?token={token}`），
  並將回傳結果保存於 lobby store。`token` 不作為參數傳入，必須從 store state 讀取；
  `token` 為 null 時不呼叫 API 直接 return。
- **FR-006**：`LobbyGameGroup` computed 必須對 `Lobby.Data.groups` 套用：
  (a) 只保留 `isvisible === true` 的群組；
  (b) 依 `order` 欄位由小到大排序。
- **FR-007**：`LobbyGameList` computed 必須從已過濾排序的 `LobbyGameGroup` 取得遊戲，
  不包含 `isvisible === false` 群組的遊戲。
- **FR-008**：`Player`、`Balance`、`CurrencySymbol` 必須在 API 回傳後保存至 store，
  但現階段不得接到任何畫面 UI。不得新增顯示玩家名稱、餘額或幣別的 UI 元素。

#### 遊戲卡片圖片

- **FR-009**：遊戲卡片圖片必須優先使用 `game.iconurl`；若 `iconurl` 為空或載入失敗，
  才降級使用 mock 圖片。
- **FR-010**：`iconurl` 為 protocol-relative URL（`//domain/...`）時，前端 `<img>`
  必須能正常顯示，不得因協定不明而破圖。

#### Fallback 機制

- **FR-011**：若 URL 無 `token` 或 API 呼叫失敗，首頁必須 fallback 至原有 mock 資料，
  維持 UI Demo 可正常展示，且不得顯示 JavaScript 錯誤堆疊於畫面。

#### iframe / Redirect 支援設定

- **FR-012**：系統必須在 lobby store 中保存以下 iframe 支援設定資料（現階段不接 UI，
  但須備妥供遊戲啟動使用）：
  - `response.IframeUnsupportedGameProviders`
  - `response.Lobby.Data.configurations.iframeunsupportedgameproviders`
  - `game.supportiframe`（隨 game 物件保存）
- **FR-013**：系統必須提供 `shouldOpenByRedirect(game)` helper 函式，邏輯如下：
  符合任一條件即回傳 `true`（應使用整頁跳轉）：
  - `game.supportiframe === false`
  - `IframeUnsupportedGameProviders` 包含 `game.providercode`
  - `Lobby.Data.configurations.iframeunsupportedgameproviders` 包含 `game.providercode`

#### 搜尋 API

- **FR-014**：系統必須提供搜尋 action，以 keyword 呼叫
  `GET {VITE_UGS_API_BASE}/api/lobby/mobile/search?token={token}&keyword={keyword}`，
  回傳結果分為 `games`、`providers`、`gameTypes` 三段。
- **FR-015**：搜尋 query string 只能包含 API 文件已定義的參數：
  `token`、`keyword`、`pageSize`、`gamesOffset`、`providersOffset`、`gameTypesOffset`。
  不得自行新增 `providerCode`、`gameTypeCode` 或其他文件未定義的參數。
- **FR-016**：keyword 為空字串時，三段皆顯示空結果，不得將空 keyword 當成全部遊戲查詢。
- **FR-017**：`gameTypes.items[].gamecount` 僅代表數量，不得作為遊戲清單資料來源，
  也不得因 `gamecount` 有值就自行呼叫額外 API 取得遊戲。
- **FR-018**：三段結果的分頁互相獨立（`gamesOffset`、`providersOffset`、
  `gameTypesOffset`）。某段 `hasMore === true` 時，該段下一頁 offset 計算方式為
  `offset + items.length`。

#### 遊戲啟動

- **FR-019**：系統必須能組合出正確的遊戲啟動 URL：
  `{VITE_UGS_API_BASE}/gamelauncher?token={token}&gpcode={game.providercode}&gcode={game.code}&betlimitid={betlimitid}&lang={lang}`，
  其中 `betlimitid` 無值時帶空字串，`lang` 依序 fallback：`Player.lang` → i18n locale → `zh-TW`。
- **FR-020**：遊戲啟動方式依 `shouldOpenByRedirect(game)` 判斷：
  - 回傳 `true`：使用 `window.location.href` 整頁跳轉。
  - 回傳 `false`：使用 iframe 方式載入（若 iframe modal 尚未實作，保留 TODO，不破壞 build）。

### 主要資料實體

- **LobbyResponse**：UGS Lobby API 完整回應，包含 `Lobby`、`Player`、`Balance`、
  `CurrencySymbol`、`IframeUnsupportedGameProviders`、`SupportHttpOnlyGameProviders`。
- **LobbyGroup**：遊戲群組，包含 `code`、`name`、`order`、`isvisible`、`games[]`、
  `gameproviders[]`。
- **Game**：遊戲卡片資料，關鍵欄位：`id`、`name`、`code`、`providercode`、
  `providername`、`iconurl`、`supportiframe`、`isactive`、`isrestricted`。
- **Player**：玩家資料，包含 `lang`、`cur`、`cursym`、`bal`；現階段存 store，不接 UI。
- **SearchResult**：搜尋結果，包含 `games`、`providers`、`gameTypes` 三段，每段為
  `PaginationResult<T>` 結構（`items`、`offset`、`totalCount`、`hasMore`）。
- **IframeConfig**：iframe 支援設定，整合 `IframeUnsupportedGameProviders`、
  `iframeunsupportedgameproviders`、`game.supportiframe` 三個來源。

---

## 成功標準

### 可量測成果

- **SC-001**：有 `token` 時，首頁遊戲卡片呈現 API 回傳的真實遊戲名稱與圖片，
  100% 可驗證（Network tab 有 Lobby API 請求、卡片圖片來自 `game.iconurl`）。
- **SC-002**：無 `token` 或 API 失敗時，首頁 fallback 至 mock 資料，頁面可正常瀏覽，
  console 無未捕捉 JavaScript 錯誤，100% 可驗證。
- **SC-003**：production build 產物（`npm run build` 輸出）中不出現
  `frontendwebsite.ugsdev.com` 字串，API base 完全由 `VITE_UGS_API_BASE` 控制，
  100% 可驗證（grep build 產物）。
- **SC-004**：`src/` 目錄下不出現 `/ugs-api` 字串或 UGS domain 字串，
  100% 可驗證（grep 檢查）。
- **SC-005**：`LobbyGameGroup` 只包含 `isvisible: true` 的群組，且依 `order`
  由小到大排序，100% 可驗證（對照 API 回傳資料與畫面渲染順序）。
- **SC-006**：`Player`、`Balance`、`CurrencySymbol` 已存入 store，但首頁 UI
  不顯示任何玩家資訊或餘額，100% 可驗證（store devtool + 畫面目測）。
- **SC-007**：搜尋 keyword 為空時，三段結果皆為空，不顯示遊戲清單，100% 可驗證。
- **SC-008**：遊戲啟動 URL 格式正確，包含 `gpcode`（`game.providercode`）與
  `gcode`（`game.code`），100% 可驗證（console log 或 URL 檢查）。
- **SC-009**：每個實作階段完成後，`npm run build` 零 TypeScript error，100% 可驗證。
- **SC-010**：既有 001 UI Demo 的所有視覺元件（header、banner、輪播、搜尋面板、
  語系切換）在 API 串接後維持正常，目測與 001 驗收標準一致。

---

## 假設前提

- UGS Lobby API endpoint 為 `{UgsFrontendWebsiteUrl}/api/lobby/mobile`，`lobbyPath`
  現階段固定為 `mobile`。
- `token` 是由合作方後端呼叫 AuthorizePlayer 取得的 `authtoken`，前端僅從 URL
  query string 取得，不自行產生或刷新。
- `token` 為短效 / 單次授權 token，無 refresh 機制；過期後前端顯示授權失敗或
  保留 mock fallback，不嘗試自動重取 token。
- 本機開發時 `VITE_UGS_API_BASE=/ugs-api`，Vite dev proxy 負責轉發；
  設定值由 `.env` 管理，業務程式碼不知道實際 domain。
- 正式環境的 CORS 由 infra proxy 解決；若 infra proxy 尚未就緒，前端仍使用相同的
  `VITE_UGS_API_BASE`，不需要修改業務程式碼。
- 搜尋 API 目前無「依 provider 或 gameType 取得遊戲列表」的定義端點；若產品需要此功能，
  需由後端提供補充 API，前端不自行新增文件未定義的 query 參數。
- `/gamelauncher` 的具體回傳行為（302 redirect、回傳 HTML 或回傳 URL）待後端確認，
  遊戲啟動實作應以回傳後端確認的行為為準。
- `SupportHttpOnlyGameProviders` 的前端處理行為待後端確認，現階段先存 store，
  不實作對應的啟動邏輯。
- 001 UI Demo 的 mock 資料（`src/data/games.ts` 的 `carouselPages`）保留不刪除，
  作為無 API 資料時的 fallback。
- `GameCard.vue` 現有的 props 介面（`imagePath`、`name`、`value`、`capsuleColor`）
  需透過 adapter 函式橋接 API `Game` 型別，不直接修改 `GameCard.vue` 的 props 型別
  使之破壞 001 UI Demo 已驗收的行為。

---

## 待後端確認事項

以下項目不影響現階段 Phase 1、Phase 2 實作，但應在對應功能階段開始前確認：

1. `groups[].code` 有哪些固定值（如 `All`、`Hot`、`New`、`Recommend`）？
2. `gametype` 數字的完整 enum 對照為何？
3. `gamelaunchtype` 的 enum 對照為何？
4. `lobbyplatformtype` 的 enum 對照為何？
5. `/gamelauncher` 的回傳行為為何（302 redirect / 回傳 HTML / 回傳 URL）？
6. `SupportHttpOnlyGameProviders` 的前端處理方式為何（redirect / 新視窗 / 其他）？
7. 點擊 `gameTypes.items` 或 `providers.items` 後，是否有取得該分類全部遊戲的 API？
