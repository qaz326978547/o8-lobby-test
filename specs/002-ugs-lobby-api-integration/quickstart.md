# 驗收快速指南：UGS Lobby API 串接

**功能分支**：`002-ugs-lobby-api-integration`
**日期**：2026-06-17

本文件提供每個 Phase 的逐步驗收步驟，無需了解實作細節即可執行。

---

## 前置條件

- Node.js `^20.19.0 || >=22.12.0`
- 已安裝依賴：`npm install`
- 已取得 UGS authtoken（`?token=...`），可向後端申請測試用 token

---

## 環境確認

驗收前確認本機 `.env.development` 包含：

```
VITE_UGS_API_BASE=/ugs-api
```

啟動 dev server：

```bash
npm run dev
```

---

## Phase 1 驗收

**目標**：API base 由環境變數控制，無硬編碼 domain 或 token。

### Step 1 — Build 通過

```bash
npm run build
```

期望：零 TypeScript error，build 成功。

### Step 2 — Build 產物無 UGS domain

```bash
grep -r "frontendwebsite.ugsdev.com" dist/
```

期望：無任何結果（domain 不應出現在產物中）。

### Step 3 — src/ 無硬編碼字串

```bash
grep -rn "frontendwebsite.ugsdev.com\|/ugs-api\|NQtu8t0" src/
```

期望：無任何結果。

### Step 4 — 本機代理正確轉發

1. 啟動 dev server：`npm run dev`
2. 開啟瀏覽器，進入：`http://localhost:5173/?token=test`
3. 開啟 DevTools → Network tab，篩選 XHR/Fetch
4. 確認可見請求：`/ugs-api/api/lobby/mobile?token=test`

> 注意：此時 UI 可能仍顯示 mock 資料（Phase 3 才接 UI），但 Network 請求路徑正確即可。

---

## Phase 2 驗收

**目標**：Store 具備 token 管理、fetch action、正確過濾排序。

### Step 1 — Build 通過

```bash
npm run build
```

### Step 2 — 無 token 不呼叫 API

1. 開啟：`http://localhost:5173/`（無 token）
2. DevTools → Network tab
3. 確認：無 `/ugs-api/api/lobby/mobile` 請求

### Step 3 — 有 token 呼叫 API

1. 開啟：`http://localhost:5173/?token=xxx`（填入實際 token）
2. DevTools → Network tab
3. 確認：可見 `/ugs-api/api/lobby/mobile?token=xxx` 請求

### Step 4 — Store 過濾排序正確

1. 安裝 Vue DevTools（或使用 Pinia devtools）
2. 開啟有 token 的首頁，API 呼叫成功後
3. 在 Pinia devtools 查看 `lobby` store：
   - `LobbyGameGroup`：每個 group 的 `isvisible` 皆為 `true`
   - `LobbyGameGroup`：依 `order` 由小到大排列（例如 order: 1, 2, 3...）

### Step 5 — 玩家資料存 store 但不顯示於 UI

1. Pinia devtools → `lobby` store
2. 確認：`playerData`、`balanceText`、`currencySymbol` 有值
3. 確認：首頁 UI 無任何玩家名稱、餘額或幣別顯示

### Step 6 — shouldOpenByRedirect 邏輯驗證

在 DevTools Console 執行（假設已有 lobbyStore 與一個 game 物件）：

```js
// 取得 Pinia store 後可用 __pinia 或直接從 Vue devtools 觀察
// 此步驟主要驗證 TypeScript build 通過即可，邏輯驗收在 Phase 5
```

---

## Phase 3 驗收

**目標**：首頁遊戲卡片優先顯示 API 資料，無資料時 fallback 至 mock。

### Step 1 — Build 通過

```bash
npm run build
```

### Step 2 — API 資料顯示於卡片

1. 開啟：`http://localhost:5173/?token=xxx`（有效 token）
2. 等待 API 回應（觀察 Network tab）
3. 確認：遊戲卡片標題顯示 API `game.name`（非固定的 `Gods-Of-Glory` 等）
4. 確認：遊戲卡片圖片來自 `game.iconurl`（圖片可正常顯示，非破圖）

### Step 3 — 無 token fallback

1. 開啟：`http://localhost:5173/`（無 token）
2. 確認：遊戲卡片顯示 mock 資料（`Gods-Of-Glory`、`Coins-And-Cannons` 等）
3. 確認：Network tab 無 Lobby API 請求

### Step 4 — API 失敗 fallback

1. DevTools → Network → 勾選「Offline」模擬斷線
2. 開啟：`http://localhost:5173/?token=xxx`
3. 確認：頁面顯示 mock 卡片，console 無未捕捉 JavaScript 錯誤
4. 確認：UI 視覺與 001 Demo 一致（輪播、header、banner 正常）

### Step 5 — 既有 UI Demo 功能正常

1. 帶 token 或不帶 token 皆測試以下互動：
   - 輪播自動切換（等待 5 秒）
   - 點擊搜尋按鈕 → 搜尋面板開啟
   - 點擊遮罩 → 搜尋面板關閉
   - 點擊語系切換 icon → 文字切換 zh-TW / en-US
   - 向下捲動 → 浮動回頂部按鈕出現
2. 確認：以上互動全部正常，無破版或錯誤

---

## Phase 4 驗收

**目標**：搜尋 API 串接，三段結果分區呈現。

### Step 1 — Build 通過

```bash
npm run build
```

### Step 2 — 搜尋請求格式正確

1. 開啟有 token 的首頁，打開搜尋面板
2. 輸入關鍵字 `slot` 並觸發搜尋
3. DevTools → Network tab
4. 確認：可見請求 `/ugs-api/api/lobby/mobile/search?token=xxx&keyword=slot`
5. 確認：query string 中無 `providerCode`、`gameTypeCode` 或其他未定義參數

### Step 3 — 三段結果分區顯示

1. 搜尋成功後，確認 UI 分三區顯示：
   - 遊戲（games.items）
   - 供應商（providers.items）
   - 遊戲類型（gameTypes.items）

### Step 4 — 空 keyword 顯示空結果

1. 清空搜尋框，觸發空 keyword 搜尋（或直接點清除）
2. 確認：三段皆顯示空結果（不顯示任何遊戲清單）

### Step 5 — 分頁 offset 計算正確

1. 若某段 `hasMore === true`，觸發載入更多
2. 確認：下一頁請求的 offset = 上一頁 offset + 上一頁 items.length

---

## Phase 5 驗收

**目標**：遊戲卡片點擊後組合正確的啟動 URL，並依 iframe 支援判斷開啟方式。

### 前置確認（Phase 5 開始前）

- [ ] 後端已確認 `/gamelauncher` 回傳行為
- [ ] 後端已確認 `SupportHttpOnlyGameProviders` 處理方式

### Step 1 — Build 通過

```bash
npm run build
```

### Step 2 — 啟動 URL 格式正確

1. 開啟有 token 的首頁（API 回傳遊戲資料）
2. 點擊任一遊戲卡片
3. 確認啟動 URL 格式：
   ```
   /ugs-api/gamelauncher?token=xxx&gpcode={game.providercode}&gcode={game.code}&betlimitid=&lang=zh-TW
   ```
   - `gpcode` 應等於 `game.providercode`
   - `gcode` 應等於 `game.code`
   - `betlimitid=`（空字串，不省略此參數）

### Step 3 — iframe / redirect 判斷

1. 對 `shouldOpenByRedirect === true` 的遊戲（`game.supportiframe === false` 或 provider 在不支援清單中）：
   - 確認：使用 `window.location.href` 整頁跳轉
2. 對 `shouldOpenByRedirect === false` 的遊戲：
   - 確認：使用 iframe 方式，或有明確的 TODO 佔位（不破壞 build）

---

## 全程通用驗收項目

在每個 Phase 完成後皆須確認：

```bash
npm run build   # 零 TypeScript error
```

```bash
grep -rn "frontendwebsite.ugsdev.com\|/ugs-api\|NQtu8t0" src/
# 期望：無結果
```

目視確認首頁 UI 無破版、001 Demo 視覺不受影響。
