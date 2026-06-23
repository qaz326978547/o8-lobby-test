# 任務清單：UGS Lobby API 串接

**輸入**：設計文件來自 `specs/002-ugs-lobby-api-integration/`

**前置文件**：plan.md、spec.md、research.md、data-model.md、contracts/

**對應情境**：
- US1 — 首頁載入 API 遊戲清單（P1）
- US2 — 無 token / API 失敗 Fallback（P1）
- US3 — 搜尋 API 串接（P2）
- US4 — 遊戲啟動 URL 準備（P2）

---

## Phase 1：API 基礎建設修正（不動 UI）

**目的**：修正 API base 設定、Vite proxy、axios baseURL，移除硬編碼 token 與 domain；
所有修改均不影響現有 UI Demo 視覺與互動。

**⚠️ 重要**：此 Phase 全程不修改任何 Vue 元件或 store，不修改 `HomeView.vue`。

- [ ] T001 新增 `.env.development`，設定 `VITE_UGS_API_BASE=/ugs-api`
  - **修改檔案**：`.env.development`（新增）
  - **驗收**：`npm run dev` 啟動後，`import.meta.env.VITE_UGS_API_BASE` 於 console 可見值為 `/ugs-api`

- [ ] T002 修改 `.env`，移除 `VITE_API_BASE_URL`，新增空值 `VITE_UGS_API_BASE=`（供正式環境注入）
  - **修改檔案**：`.env`
  - **驗收**：`.env` 不再含 `VITE_API_BASE_URL`；`VITE_UGS_API_BASE=` 存在

- [ ] T003 修改 `vite.config.ts`：proxy key 改為 `/ugs-api`，加入 rewrite 去除前綴，涵蓋 `/gamelauncher`
  - **修改檔案**：`vite.config.ts`
  - **驗收**：dev server 啟動後，請求 `/ugs-api/api/lobby/mobile?token=test` 可被正確轉發至 `https://frontendwebsite.ugsdev.com/api/lobby/mobile?token=test`（Network tab 可見）

- [ ] T004 修改 `src/apis/https.ts`：移除 DEV/production 分岐邏輯與所有 domain 硬編碼，baseURL 改為 `import.meta.env.VITE_UGS_API_BASE`
  - **修改檔案**：`src/apis/https.ts`
  - **驗收**：`grep -n "frontendwebsite\|/api\b" src/apis/https.ts` → 無結果（`/api` 不得出現在 baseURL 設定中）

- [ ] T005 修改 `src/apis/lobby.ts`：移除硬編碼 token，`getLobbyData` 改為接收 `token: string` 參數，path 改為 `/api/lobby/${lobbyPath}`
  - **修改檔案**：`src/apis/lobby.ts`
  - **驗收**：`grep -n "NQtu8t0\|token = " src/apis/lobby.ts` → 無硬編碼 token；函式簽章為 `getLobbyData(lobbyPath, token)`

- [ ] T006 [P] 在 `src/apis/interface/lobby.ts` 新增搜尋相關 interface：`PaginationResult<T>`、`LobbySearchResponse`、`GameSearchItem`、`ProviderSearchItem`、`GameTypeSearchItem`
  - **修改檔案**：`src/apis/interface/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；可正常 import 上述 interface

- [ ] T007 [P] 在 `src/apis/interface/lobby.ts` 新增 API 參數 interface：`SearchLobbyParams`、`GameLaunchParams`
  - **修改檔案**：`src/apis/interface/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；兩個 interface 可正常使用

- [ ] T008 在 `src/apis/lobby.ts` 新增 `searchLobby(params: SearchLobbyParams)` 函式骨架（回傳 `false`，Phase 4 完整實作）
  - **修改檔案**：`src/apis/lobby.ts`
  - **相依**：T006、T007
  - **驗收**：`npm run type-check` 零 error；函式存在且可被 import

- [ ] T009 [P] 在 `src/apis/lobby.ts` 新增 `getGameLaunchUrl(params: GameLaunchParams): string` 函式骨架（回傳空字串，Phase 5 完整實作）
  - **修改檔案**：`src/apis/lobby.ts`
  - **相依**：T007
  - **驗收**：`npm run type-check` 零 error；函式存在且可被 import

- [ ] T010 執行 `npm run build` 確認 Phase 1 通過
  - **驗收**：零 TypeScript error；`grep -r "frontendwebsite.ugsdev.com" dist/` 無結果；`grep -rn "frontendwebsite\|/ugs-api\|NQtu8t0" src/` 無結果

**Phase 1 Checkpoint**：API 基礎建設正確，無硬編碼 domain 或 token，dev server proxy 可正常轉發。

---

## Phase 2：Store 強化（不動 UI）

**目的**：讓 store 成為完整資料中心，加入 token 管理、fetch action、正確過濾排序與 iframe helper；
全程不修改 View 或 Component。

**⚠️ 重要**：此 Phase 全程不修改 `HomeView.vue` 或任何 Vue 元件。

- [ ] T011 在 `src/stores/lobby.ts` 新增 `token` state（`ref<string | null>(null)`）與 `setToken(t: string)` action
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：Pinia devtools 可見 `token` state；`lobbyStore.setToken('abc')` 後 `token` 值為 `'abc'`

- [ ] T012 在 `src/stores/lobby.ts` 新增 `fetchLobbyData(lobbyPath = 'mobile')` action：從 store 取 token 呼叫 `LobbyApi.getLobbyData`；token 為 `null` 時直接 return，不呼叫 API
  - **修改檔案**：`src/stores/lobby.ts`
  - **相依**：T005（`getLobbyData` 需接受 token 參數）、T011
  - **驗收**：無 token 時 Network tab 無 lobby 請求；有 token 時可見 `/ugs-api/api/lobby/mobile?token=xxx`

- [ ] T013 修正 `src/stores/lobby.ts` 的 `LobbyGameGroup` computed：加入 `filter(g => g.isvisible)` + `sort((a, b) => a.order - b.order)`
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：API 回傳後，Pinia devtools 中 `LobbyGameGroup` 每項 `isvisible === true`，且依 `order` 由小到大排列

- [ ] T014 修正 `src/stores/lobby.ts` 的 `LobbyGameList` computed：改從 `LobbyGameGroup`（已過濾排序）取 games，型別由 `any[]` 改為 `Game[]`
  - **修改檔案**：`src/stores/lobby.ts`
  - **相依**：T013
  - **驗收**：`npm run type-check` 零 error；`LobbyGameList` 不含 `isvisible === false` group 的遊戲

- [ ] T015 修正 `src/stores/lobby.ts` 的 `LobbyGameProviders` computed：型別由 `any[]` 改為 `GameProvider[]`（去重邏輯不變）
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：`npm run type-check` 零 error

- [ ] T016 [P] 在 `src/stores/lobby.ts` 新增 `balanceText`、`currencySymbol` computed（存 store，不接 UI）
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：Pinia devtools 可見兩個 computed 有值；首頁 UI 無任何餘額或幣別顯示

- [ ] T017 [P] 在 `src/stores/lobby.ts` 新增 `iframeUnsupportedProviders` computed：`lobbyData.value?.IframeUnsupportedGameProviders ?? []`
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；Pinia devtools 可見此 computed

- [ ] T018 [P] 在 `src/stores/lobby.ts` 新增 `supportHttpOnlyProviders` computed：`lobbyData.value?.SupportHttpOnlyGameProviders ?? []`（存 store，行為待後端確認）
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：`npm run type-check` 零 error

- [ ] T019 在 `src/stores/lobby.ts` 新增 `shouldOpenByRedirect(game: Game): boolean` helper
  - 條件：`game.supportiframe === false` || `iframeUnsupportedProviders` 包含 `game.providercode` || `iframeunsupportedgameproviders` 包含 `game.providercode`
  - 現階段不改變遊戲卡片點擊行為，僅建立 helper
  - **修改檔案**：`src/stores/lobby.ts`
  - **相依**：T017
  - **驗收**：`npm run type-check` 零 error；可在 console 手動呼叫並驗證邏輯

- [ ] T020 在 `src/stores/lobby.ts` 新增 `searchLobby(params)` store action stub（Phase 4 完整實作）
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；函式存在

- [ ] T021 確認 `src/stores/lobby.ts` 的 `playerData` computed 型別為 `Player | null`（若型別已正確則僅確認，無需修改）
  - **修改檔案**：`src/stores/lobby.ts`（若有型別問題才修改）
  - **驗收**：`npm run type-check` 零 error；Pinia devtools 可見 `playerData` 有值；首頁 UI 無玩家資訊顯示

- [ ] T022 執行 `npm run build` 確認 Phase 2 通過
  - **驗收**：零 TypeScript error；首頁視覺與 001 Demo 完全一致

**Phase 2 Checkpoint**：Store 完整，token 管理正確，computed 型別安全，helper 可用，UI 無任何變化。

---

## Phase 3：使用者情境 1 + 2 — 首頁 API 串接與 Fallback（優先級：P1）🎯 MVP

**目標**：首頁優先顯示 API 遊戲資料；無 token 或 API 失敗時 fallback 至 mock，001 UI Demo 不受影響。

**獨立測試**：帶 token 開啟首頁可見 API 遊戲卡片；不帶 token 可見 mock 卡片；API 斷線後 fallback 正常。

### 使用者情境 1 + 2 實作

- [ ] T023 [US1] 在 `src/views/HomeView.vue` 中從 URL query string 取得 token（使用 `new URLSearchParams(window.location.search).get('token')` 或 `useRoute().query.token`）
  - **修改檔案**：`src/views/HomeView.vue`
  - **驗收**：帶 `?token=xxx` 開啟首頁，console 可見 token 值（debug 可暫時加 log）

- [ ] T024 [US1] 在 `src/views/HomeView.vue` 中修改 `onMounted`：有 token 時呼叫 `lobbyStore.setToken(token)` 再呼叫 `lobbyStore.fetchLobbyData()`；移除舊的 `LobbyApi.getLobbyData()` 直呼叫
  - **修改檔案**：`src/views/HomeView.vue`
  - **相依**：T023、T012
  - **驗收**：有 token 時 Network tab 可見 `/ugs-api/api/lobby/mobile?token=xxx`；無 token 時無請求

- [ ] T025 [US1] 在 `src/views/HomeView.vue` 中新增 `toGameCardPages` adapter 函式，將 `LobbyGroup[]` 轉換為 `GameCard[][]`（每頁 4 張）；`iconurl` 優先，protocol-relative URL（`//`）補 `https:` 前綴，空 iconurl 使用 mock 圖片
  - **修改檔案**：`src/views/HomeView.vue`
  - **相依**：T013
  - **驗收**：adapter 可被呼叫且回傳正確格式；`npm run type-check` 零 error

- [ ] T026 [US1] 在 `src/views/HomeView.vue` 中建立 `gamePages` computed：`LobbyGameGroup.length > 0` 時使用 `toGameCardPages(LobbyGameGroup)`，否則 fallback 至 `carouselPages`；將 `hotGamesPages`、`newGamesPages` 改為使用 `gamePages`
  - **修改檔案**：`src/views/HomeView.vue`
  - **相依**：T025
  - **驗收**：有 API 資料時，遊戲卡片顯示 API `game.name` 與 `game.iconurl` 圖片

- [ ] T027 [US2] 在 `src/views/HomeView.vue` 中確認 API 失敗時（`fetchLobbyData` 拋錯或回傳 false）`gamePages` 自動 fallback 至 `carouselPages`，console 無未捕捉錯誤
  - **修改檔案**：`src/views/HomeView.vue`（在 `fetchLobbyData` 呼叫處加 try/catch 或確認 store action 有 error handling）
  - **相依**：T026
  - **驗收**：斷網後開啟首頁，顯示 mock 卡片，console 無未捕捉錯誤

- [ ] T028 [US1] 在 `src/views/HomeView.vue` 中移除所有 `console.log` debug log（共 4 行）
  - **修改檔案**：`src/views/HomeView.vue`
  - **驗收**：`grep -n "console.log" src/views/HomeView.vue` → 無結果

- [ ] T029 [US2] 確認 001 UI Demo 所有互動功能正常：輪播、搜尋面板開關、語系切換、浮動按鈕；確認首頁 UI 無玩家資訊或餘額顯示
  - **修改檔案**：不修改（純驗收）
  - **驗收**：手動測試所有 001 UI Demo 驗收項目

- [ ] T030 執行 `npm run build` 確認 Phase 3 通過
  - **驗收**：零 TypeScript error；帶 token 首頁顯示 API 資料；不帶 token 顯示 mock；視覺與 001 Demo 一致

**Phase 3 Checkpoint**：首頁可顯示 API 遊戲資料，fallback 機制正常，001 UI Demo 視覺完整。

---

## Phase 4：使用者情境 3 — 搜尋 API 串接（優先級：P2）

**目標**：搜尋框接上 UGS Search API，三段結果分區呈現；空 keyword 顯示空結果，不當全部遊戲。

**獨立測試**：輸入關鍵字可見 Search API 請求；三段結果分區；空 keyword 顯示空結果。

### 使用者情境 3 實作

- [ ] T031 [US3] 在 `src/apis/lobby.ts` 完整實作 `searchLobby(params: SearchLobbyParams)` 函式：
  - path：`/api/lobby/${params.lobbyPath}/search`
  - query params 只用文件定義的欄位（`token`、`keyword`、`pageSize`、`gamesOffset`、`providersOffset`、`gameTypesOffset`）
  - 不加 `providerCode`、`gameTypeCode` 等未定義參數
  - **修改檔案**：`src/apis/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；Network tab 可見搜尋請求格式正確

- [ ] T032 [US3] 在 `src/stores/lobby.ts` 新增搜尋結果 state：`searchResult: ref<LobbySearchResponse | null>(null)` 與 `isSearching: ref(false)`
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；Pinia devtools 可見新增 state

- [ ] T033 [US3] 在 `src/stores/lobby.ts` 完整實作 `searchLobby(params)` store action：
  - keyword 為空字串時不呼叫 API，直接將 `searchResult` 設為空結果（三段皆空）
  - 呼叫 `LobbyApi.searchLobby`，結果存入 `searchResult`
  - 不把 `gameTypes.items[].gamecount` 當遊戲清單
  - **修改檔案**：`src/stores/lobby.ts`
  - **相依**：T031、T032
  - **驗收**：空 keyword → `searchResult` 三段皆空；有 keyword → 三段有回傳資料

- [ ] T034 [US3] 在 `src/stores/lobby.ts` 新增 `searchNextPage(segment: 'games' | 'providers' | 'gameTypes')` helper 計算下一頁 offset：`nextOffset = prevOffset + items.length`
  - **修改檔案**：`src/stores/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；offset 計算邏輯正確
  - **備注**：「載入更多」UI 按鈕列為後續迭代，本 Phase 僅建立 helper，不實作 UI 觸發流程

- [ ] T035 [P] [US3] 在搜尋 UI（`src/components/SearchPanel.vue` 或新建搜尋結果元件）接入搜尋結果三段顯示（games / providers / gameTypes）
  - **修改檔案**：`src/components/SearchPanel.vue`（或新增元件）
  - **相依**：T033
  - **驗收**：輸入 `slot` 後，UI 分三區顯示搜尋結果

- [ ] T036 [US3] 確認空 keyword 行為：清空搜尋框或點擊清除後，三段結果皆為空，不顯示全部遊戲清單
  - **修改檔案**：不修改（純驗收，若有問題再調整 T033）
  - **驗收**：空 keyword → UI 三段皆空

- [ ] T037 執行 `npm run build` 確認 Phase 4 通過
  - **驗收**：零 TypeScript error；搜尋功能正常；query string 無未定義參數

**Phase 4 Checkpoint**：搜尋 API 正常，三段分區顯示，空 keyword 規則遵守。

---

## Phase 5：使用者情境 4 — 遊戲啟動 URL 準備（優先級：P2）

**目標**：遊戲卡片點擊後組合正確啟動 URL，依 `shouldOpenByRedirect` 決定開啟方式。

**注意**：`/gamelauncher` 回傳行為待後端確認後再完整實作；iframe modal 若尚未實作保留 TODO，不破壞 build。

**獨立測試**：點擊遊戲卡片可見正確格式的啟動 URL；redirect 遊戲使用 `window.location.href`。

### 使用者情境 4 實作

- [ ] T038 [US4] 在 `src/apis/lobby.ts` 完整實作 `getGameLaunchUrl(params: GameLaunchParams): string`：
  - URL 格式：`${import.meta.env.VITE_UGS_API_BASE}/gamelauncher?token={token}&gpcode={gpcode}&gcode={gcode}&betlimitid={betlimitid}&lang={lang}`
  - `gpcode` = `game.providercode`、`gcode` = `game.code`
  - `betlimitid` 無值時帶空字串 `''`（不省略參數）
  - `lang` fallback：`Player.lang` → `i18n.locale` → `'zh-TW'`
  - **修改檔案**：`src/apis/lobby.ts`
  - **驗收**：`npm run type-check` 零 error；函式回傳格式正確的 URL 字串

- [ ] T039 [US4] 在 `src/views/HomeView.vue` 或遊戲卡片元件中新增點擊 handler，呼叫 `getGameLaunchUrl` 組合啟動 URL
  - **修改檔案**：`src/views/HomeView.vue`（或 `src/components/GameSection.vue`，視 adapter 放置位置而定）
  - **相依**：T038
  - **驗收**：點擊遊戲卡片，console 可見正確格式的 URL（或直接觸發跳轉）

- [ ] T040 [US4] 在點擊 handler 中加入 `shouldOpenByRedirect(game)` 判斷：
  - `true` → `window.location.href = launchUrl`
  - `false` → iframe 方式（若 iframe modal 尚未實作，留 `// TODO: open in iframe` 佔位，不破壞 build）
  - **修改檔案**：`src/views/HomeView.vue`（或遊戲卡片相關元件）
  - **相依**：T039、T019
  - **驗收**：`npm run type-check` 零 error；`shouldOpenByRedirect === true` 的遊戲使用 `window.location.href` 跳轉

- [ ] T041 執行 `npm run build` 確認 Phase 5 通過
  - **驗收**：零 TypeScript error；啟動 URL 格式正確；iframe TODO 佔位不破壞 build

**Phase 5 Checkpoint**：遊戲可觸發啟動，URL 格式正確，iframe/redirect 判斷邏輯完整。

---

## Final Phase：Polish 與跨情境驗收

**目的**：整體品質確認，執行完整驗收指南。

- [ ] T042 [P] 執行 `quickstart.md` 所有 Phase 驗收步驟，確認每個 Phase 的驗收條件皆通過
  - **修改檔案**：不修改（純驗收）
  - **驗收**：所有 quickstart.md 驗收項目打勾

- [ ] T043 [P] 確認 `src/` 目錄無以下禁止字串：
  ```bash
  grep -rn "frontendwebsite.ugsdev.com\|NQtu8t0\|VITE_API_BASE\b" src/
  ```
  - **修改檔案**：若有發現則修正對應檔案
  - **驗收**：無結果

- [ ] T044 [P] 確認 production build 無 UGS domain：
  ```bash
  npm run build && grep -r "frontendwebsite.ugsdev.com" dist/
  ```
  - **修改檔案**：若有發現則修正對應 `src/` 檔案
  - **驗收**：無結果

- [ ] T045 確認 001 UI Demo 全部驗收項目仍可通過（手動測試）：
  - 首頁預設狀態（無 token 時 mock 顯示完整）
  - 搜尋面板開啟與關閉
  - 語系切換（zh-TW / en-US）
  - 輪播自動切換
  - 浮動回頂部按鈕
  - **修改檔案**：不修改
  - **驗收**：所有 001 驗收場景正常

---

## 相依與執行順序

### Phase 相依關係

```
Phase 1（API 基礎建設）
  ↓
Phase 2（Store 強化）
  ↓
Phase 3（首頁 UI 串接）  ← MVP 停止點
  ↓
Phase 4（搜尋 API）
  ↓
Phase 5（遊戲啟動）
  ↓
Final Phase（Polish）
```

### Phase 內部並行機會

**Phase 1**：
- T001、T002、T003 — 不同設定檔，可並行
- T006、T007 — 同一檔案但不同 interface，可先後執行（T007 可接 T006 完成後立即開始）
- T008、T009 — T006、T007 完成後可並行新增函式骨架

**Phase 2**：
- T016、T017、T018 — 不同 computed，可並行
- T011 完成後，T012 與 T013 可並行開始

**Phase 3**：
- T025 與 T028 — 不同邏輯，可並行

### 完成條件確認

| Phase | 關鍵驗收 |
|-------|---------|
| Phase 1 | `npm run build` 通過；無 domain 硬編碼；proxy 轉發正確 |
| Phase 2 | `npm run build` 通過；store 過濾排序正確；無 UI 變化 |
| Phase 3 | API 遊戲卡片顯示；fallback 正常；001 Demo 視覺不變 |
| Phase 4 | 搜尋三段結果；空 keyword 空結果；無未定義 query 參數 |
| Phase 5 | 啟動 URL 格式正確；redirect 邏輯正確；build 通過 |

---

## 並行範例

### Phase 1 內部並行

```bash
# 可同時執行：
T001: 新增 .env.development
T002: 修改 .env
T003: 修改 vite.config.ts
```

```bash
# T004 完成後，可同時執行：
T006: 新增搜尋 interface（PaginationResult 等）
T007: 新增 SearchLobbyParams / GameLaunchParams
```

### Phase 2 內部並行

```bash
# T011 完成後，可同時執行：
T012: fetchLobbyData action
T013: LobbyGameGroup 過濾排序
```

```bash
# T013 完成後，可同時執行：
T016: balanceText / currencySymbol computed
T017: iframeUnsupportedProviders computed
T018: supportHttpOnlyProviders computed
```

---

## 實作策略

### MVP 優先（Phase 1 + 2 + 3）

1. 完成 Phase 1：API 基礎建設（不動 UI）
2. 完成 Phase 2：Store 強化（不動 UI）
3. 完成 Phase 3：首頁 UI 串接
4. **停止並驗收**：帶 token 首頁顯示 API 遊戲資料，001 Demo 視覺完整
5. MVP 可展示：API 串接基礎功能完成

### 遞增交付

1. Phase 1 + 2 → 基礎就緒，可驗收 API 層正確性
2. Phase 3 → 首頁可見真實遊戲資料（MVP）
3. Phase 4 → 搜尋功能完整
4. Phase 5 → 遊戲可啟動（待後端確認 `/gamelauncher` 行為）

---

## 備注

- `[P]` 任務 = 不同檔案，無相依，可並行
- `[US1]`/`[US2]`/`[US3]`/`[US4]` 對應 spec.md 中的使用者情境
- Phase 1、Phase 2 全程不得修改 `HomeView.vue` 或任何 Vue 元件
- Phase 3 只做最小 UI 串接，不重寫 `HomeView.vue`
- `src/` 目錄不得出現 `frontendwebsite.ugsdev.com`、`/ugs-api`、硬編碼 token
- 每個 Phase 完成後執行 `npm run build`（零 error 為硬性條件）
- `GameCard.vue`、`GameSection.vue` 在本功能全程不修改
